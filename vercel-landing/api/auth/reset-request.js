// API endpoint to request password reset
// Sends a reset code via email using Resend

export const config = {
  runtime: 'edge',
};

// Generate a 6-digit reset code
function generateResetCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export default async function handler(request) {
  // Handle CORS
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { Redis } = await import('@upstash/redis');
    const redis = Redis.fromEnv();

    const body = await request.json();
    const { email } = body;

    if (!email) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Email is required' 
      }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Check if user exists
    const userId = await redis.hget('users_by_email', email.toLowerCase());
    
    if (!userId) {
      // Don't reveal if email exists or not for security
      // But still return success to prevent email enumeration
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'If an account exists with this email, a reset code has been sent.'
      }), {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Generate reset code
    const resetCode = generateResetCode();
    
    // Store reset code with 15 minute expiry
    await redis.setex(`reset:${email.toLowerCase()}`, 15 * 60, JSON.stringify({
      code: resetCode,
      userId: userId,
      createdAt: new Date().toISOString()
    }));

    // Send email using Resend
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    
    if (RESEND_API_KEY) {
      try {
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Fountain <noreply@fountain.net>',
            to: [email],
            subject: 'Reset Your Fountain Password',
            html: `
              <!DOCTYPE html>
              <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
              </head>
              <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 32px;">
                  <h1 style="color: #0066FF; margin: 0; font-size: 28px;">💧 Fountain</h1>
                </div>
                
                <div style="background: #f8fafc; border-radius: 12px; padding: 32px; text-align: center;">
                  <h2 style="margin: 0 0 16px 0; color: #1a1a2e;">Password Reset</h2>
                  <p style="margin: 0 0 24px 0; color: #64748b;">
                    You requested to reset your password. Use the code below to complete the process:
                  </p>
                  
                  <div style="background: linear-gradient(135deg, #0066FF, #00B8FF); color: white; font-size: 32px; font-weight: bold; letter-spacing: 8px; padding: 20px 32px; border-radius: 8px; display: inline-block; margin: 16px 0;">
                    ${resetCode}
                  </div>
                  
                  <p style="margin: 24px 0 0 0; color: #94a3b8; font-size: 14px;">
                    This code expires in <strong>15 minutes</strong>.
                  </p>
                </div>
                
                <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0; text-align: center; color: #94a3b8; font-size: 13px;">
                  <p style="margin: 0 0 8px 0;">
                    If you didn't request this, you can safely ignore this email.
                  </p>
                  <p style="margin: 0;">
                    © ${new Date().getFullYear()} Fountain Macro Assistant
                  </p>
                </div>
              </body>
              </html>
            `,
            text: `Fountain Password Reset\n\nYour reset code is: ${resetCode}\n\nThis code expires in 15 minutes.\n\nIf you didn't request this, you can safely ignore this email.`
          }),
        });

        const emailResult = await emailResponse.json();
        
        if (!emailResponse.ok) {
          console.error('Resend error:', emailResult);
          // Still return success - don't reveal email sending status
        }
      } catch (emailError) {
        console.error('Error sending email:', emailError);
        // Still return success to user
      }
    } else {
      console.log('RESEND_API_KEY not configured - code:', resetCode);
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'If an account exists with this email, a reset code has been sent.',
      // Only include code in dev mode for testing (remove in production)
      ...(process.env.NODE_ENV === 'development' ? { resetCode } : {})
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    console.error('Error requesting password reset:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Failed to process request',
      details: error.message 
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}
