// API endpoint for user registration
// Uses Upstash Redis for persistent storage

export const config = {
  runtime: 'edge',
};

// Simple hash function for passwords (in production, use bcrypt)
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
    const { email, password, displayName } = body;

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

    // Check if email already exists
    const existingUser = await redis.hget('users_by_email', email.toLowerCase());
    if (existingUser) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Email already registered' 
      }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Create user
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const hashedPassword = await hashPassword(password);
    const token = generateToken();

    const user = {
      id: userId,
      email: email.toLowerCase(),
      displayName: displayName || email.split('@')[0],
      passwordHash: hashedPassword,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };

    // Store user (Upstash handles serialization automatically)
    await redis.hset('users', { [userId]: user });
    await redis.hset('users_by_email', { [email.toLowerCase()]: userId });
    
    // Store token (expires in 30 days)
    await redis.setex(`token:${token}`, 30 * 24 * 60 * 60, userId);

    // Initialize empty macros for user
    await redis.set(`macros:${userId}`, JSON.stringify({
      macros: [],
      folders: [],
      settings: {},
      lastSync: new Date().toISOString()
    }));

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
    console.error('Error registering user:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Failed to register user',
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

