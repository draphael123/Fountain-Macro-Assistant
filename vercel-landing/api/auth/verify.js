// API endpoint to verify auth token
// Uses Upstash Redis for persistent storage

export const config = {
  runtime: 'edge',
};

export default async function handler(request) {
  // Handle CORS
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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

    // Get token from header or body
    const authHeader = request.headers.get('Authorization');
    let token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      const body = await request.json().catch(() => ({}));
      token = body.token;
    }

    if (!token) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Token required' 
      }), {
        status: 401,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Verify token
    const userId = await redis.get(`token:${token}`);
    if (!userId) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Invalid or expired token' 
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

    const user = typeof userData === 'string' ? JSON.parse(userData) : userData;

    return new Response(JSON.stringify({
      success: true,
      user: {
        id: userId,
        email: user.email,
        displayName: user.displayName,
      }
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Error verifying token:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Failed to verify token',
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

