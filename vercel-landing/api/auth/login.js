// API endpoint for user login
// Uses Upstash Redis for persistent storage

export const config = {
  runtime: 'edge',
};

// Simple hash function for passwords
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'fountain_salt_2024');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Generate a simple token
function generateToken() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
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
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Email and password are required' 
      }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Find user by email
    const userId = await redis.hget('users_by_email', email.toLowerCase());
    if (!userId) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Invalid email or password' 
      }), {
        status: 401,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Get user data
    const userData = await redis.hget('users', userId);
    if (!userData) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'User not found' 
      }), {
        status: 401,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Handle both string and object formats (Upstash may return either)
    let user;
    if (typeof userData === 'string') {
      try {
        user = JSON.parse(userData);
      } catch (e) {
        user = userData;
      }
    } else {
      user = userData;
    }
    
    // If user is still a string (double-encoded), try parsing again
    if (typeof user === 'string') {
      try {
        user = JSON.parse(user);
      } catch (e) {
        // Keep as is
      }
    }

    // Verify password
    const hashedPassword = await hashPassword(password);
    if (user.passwordHash !== hashedPassword) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Invalid email or password' 
      }), {
        status: 401,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Generate new token
    const token = generateToken();
    await redis.setex(`token:${token}`, 30 * 24 * 60 * 60, userId);

    // Update last login
    user.lastLogin = new Date().toISOString();
    await redis.hset('users', { [userId]: user });

    return new Response(JSON.stringify({
      success: true,
      user: {
        id: userId,
        email: user.email,
        displayName: user.displayName,
      },
      token: token
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Error logging in:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Failed to login',
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

