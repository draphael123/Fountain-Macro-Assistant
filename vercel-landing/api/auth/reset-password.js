// API endpoint to reset password with code
// Verifies the reset code and sets new password

export const config = {
  runtime: 'edge',
};

// Hash password (same as register.js)
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'fountain_salt_2024');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
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
    const { email, code, newPassword } = body;

    if (!email || !code || !newPassword) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Email, code, and new password are required' 
      }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    if (newPassword.length < 6) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Password must be at least 6 characters' 
      }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Get reset data
    const resetData = await redis.get(`reset:${email.toLowerCase()}`);
    
    if (!resetData) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Reset code expired or invalid. Please request a new one.' 
      }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    let parsed;
    if (typeof resetData === 'string') {
      try { parsed = JSON.parse(resetData); } catch (e) { parsed = resetData; }
    } else {
      parsed = resetData;
    }

    // Verify code
    if (parsed.code !== code) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Invalid reset code' 
      }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Get user
    const userId = parsed.userId;
    const userData = await redis.hget('users', userId);
    
    if (!userData) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'User not found' 
      }), {
        status: 404,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    let user;
    if (typeof userData === 'string') {
      try { user = JSON.parse(userData); } catch (e) { user = userData; }
    } else {
      user = userData;
    }
    if (typeof user === 'string') {
      try { user = JSON.parse(user); } catch (e) { /* keep as is */ }
    }

    // Update password
    user.passwordHash = await hashPassword(newPassword);
    user.passwordResetAt = new Date().toISOString();

    // Save user
    await redis.hset('users', { [userId]: user });

    // Delete reset code
    await redis.del(`reset:${email.toLowerCase()}`);

    return new Response(JSON.stringify({
      success: true,
      message: 'Password reset successfully. You can now log in with your new password.'
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    console.error('Error resetting password:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Failed to reset password',
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

