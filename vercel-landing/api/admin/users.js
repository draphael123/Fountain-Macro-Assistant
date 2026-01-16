// Admin API - List and manage users
// Requires admin authentication

export const config = {
  runtime: 'edge',
};

// Admin email (only this user can access admin functions)
const ADMIN_EMAIL = 'daniel@fountain.net';

export default async function handler(request) {
  // Handle CORS
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  try {
    const { Redis } = await import('@upstash/redis');
    const redis = Redis.fromEnv();

    // Get token from header
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Authorization required' 
      }), {
        status: 401,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Verify token and get user
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

    // Get user data to check if admin
    const userData = await redis.hget('users', userId);
    let user;
    if (typeof userData === 'string') {
      try { user = JSON.parse(userData); } catch (e) { user = userData; }
    } else {
      user = userData;
    }
    if (typeof user === 'string') {
      try { user = JSON.parse(user); } catch (e) { /* keep as is */ }
    }

    // Check if user is admin
    if (!user || user.email !== ADMIN_EMAIL) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Admin access required' 
      }), {
        status: 403,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Handle different methods
    if (request.method === 'GET') {
      // List all users
      const allUsers = await redis.hgetall('users');
      const users = [];
      
      if (allUsers) {
        for (const [id, data] of Object.entries(allUsers)) {
          let userData;
          if (typeof data === 'string') {
            try { userData = JSON.parse(data); } catch (e) { userData = data; }
          } else {
            userData = data;
          }
          if (typeof userData === 'string') {
            try { userData = JSON.parse(userData); } catch (e) { /* keep as is */ }
          }
          
          // Get macro count for user
          const macroData = await redis.get(`macros:${id}`);
          let macroCount = 0;
          if (macroData) {
            let parsed;
            if (typeof macroData === 'string') {
              try { parsed = JSON.parse(macroData); } catch (e) { parsed = macroData; }
            } else {
              parsed = macroData;
            }
            macroCount = parsed?.macros?.length || 0;
          }
          
          users.push({
            id: userData.id || id,
            email: userData.email,
            displayName: userData.displayName,
            createdAt: userData.createdAt,
            lastLogin: userData.lastLogin,
            macroCount: macroCount,
            isAdmin: userData.email === ADMIN_EMAIL
          });
        }
      }

      return new Response(JSON.stringify({
        success: true,
        users: users,
        totalUsers: users.length
      }), {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    if (request.method === 'POST') {
      // Update user
      const body = await request.json();
      const { targetUserId, action, data } = body;

      if (!targetUserId || !action) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Missing targetUserId or action' 
        }), {
          status: 400,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      // Get target user
      const targetUserData = await redis.hget('users', targetUserId);
      if (!targetUserData) {
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

      let targetUser;
      if (typeof targetUserData === 'string') {
        try { targetUser = JSON.parse(targetUserData); } catch (e) { targetUser = targetUserData; }
      } else {
        targetUser = targetUserData;
      }
      if (typeof targetUser === 'string') {
        try { targetUser = JSON.parse(targetUser); } catch (e) { /* keep as is */ }
      }

      switch (action) {
        case 'updateDisplayName':
          targetUser.displayName = data.displayName;
          break;
        case 'updateEmail':
          // Update email mapping
          await redis.hdel('users_by_email', targetUser.email);
          targetUser.email = data.email.toLowerCase();
          await redis.hset('users_by_email', { [targetUser.email]: targetUserId });
          break;
        case 'resetPassword':
          // Hash new password
          const encoder = new TextEncoder();
          const passwordData = encoder.encode(data.password + 'fountain_salt_2024');
          const hashBuffer = await crypto.subtle.digest('SHA-256', passwordData);
          const hashArray = Array.from(new Uint8Array(hashBuffer));
          targetUser.passwordHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
          break;
        default:
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'Unknown action' 
          }), {
            status: 400,
            headers: { 
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          });
      }

      // Save updated user
      await redis.hset('users', { [targetUserId]: targetUser });

      return new Response(JSON.stringify({
        success: true,
        message: 'User updated successfully'
      }), {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    if (request.method === 'DELETE') {
      // Delete user
      const { searchParams } = new URL(request.url);
      const targetUserId = searchParams.get('userId');

      if (!targetUserId) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Missing userId' 
        }), {
          status: 400,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      // Get user to delete their email mapping
      const targetUserData = await redis.hget('users', targetUserId);
      if (targetUserData) {
        let targetUser;
        if (typeof targetUserData === 'string') {
          try { targetUser = JSON.parse(targetUserData); } catch (e) { targetUser = targetUserData; }
        } else {
          targetUser = targetUserData;
        }
        if (typeof targetUser === 'string') {
          try { targetUser = JSON.parse(targetUser); } catch (e) { /* keep as is */ }
        }

        // Don't allow deleting admin
        if (targetUser.email === ADMIN_EMAIL) {
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'Cannot delete admin user' 
          }), {
            status: 403,
            headers: { 
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          });
        }

        // Delete email mapping
        if (targetUser.email) {
          await redis.hdel('users_by_email', targetUser.email);
        }
      }

      // Delete user data
      await redis.hdel('users', targetUserId);
      await redis.del(`macros:${targetUserId}`);

      return new Response(JSON.stringify({
        success: true,
        message: 'User deleted successfully'
      }), {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Admin API error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Server error',
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

