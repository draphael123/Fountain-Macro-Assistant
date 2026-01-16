// API endpoint to manage shared folders
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
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  try {
    const { Redis } = await import('@upstash/redis');
    const redis = Redis.fromEnv();

    // GET - List all folders
    if (request.method === 'GET') {
      const folders = await redis.get('shared_folders') || [];
      
      return new Response(JSON.stringify({ 
        success: true, 
        folders 
      }), {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, max-age=30',
        },
      });
    }

    // POST - Create a new folder
    if (request.method === 'POST') {
      const body = await request.json();
      const { name, description, author, authorId } = body;

      if (!name || name.trim() === '') {
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Folder name is required' 
        }), {
          status: 400,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      let folders = await redis.get('shared_folders') || [];

      // Check if folder name already exists
      if (folders.some(f => f.name.toLowerCase() === name.toLowerCase())) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'A folder with this name already exists' 
        }), {
          status: 400,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      const folder = {
        id: `folder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: name.trim(),
        description: (description || '').trim(),
        author: author || 'Anonymous',
        authorId: authorId || null,
        createdAt: new Date().toISOString(),
        macroCount: 0,
        isPublic: true
      };

      folders.push(folder);
      await redis.set('shared_folders', folders);

      return new Response(JSON.stringify({ 
        success: true, 
        folder 
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
    console.error('Error with folders:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Failed to process folder request',
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
