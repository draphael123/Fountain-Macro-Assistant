// API endpoint to delete a shared macro
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
    const { shareId, authorId } = body;

    if (!shareId) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Share ID is required' 
      }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Get all shared macros
    let allMacros = await redis.get('shared_macros') || [];
    
    // Find by ID
    const index = allMacros.findIndex(m => m.id === shareId);

    if (index === -1) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Shared macro not found' 
      }), {
        status: 404,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    const sharedMacro = allMacros[index];

    // Check authorization (only author can delete)
    if (sharedMacro.metadata.authorId && authorId && sharedMacro.metadata.authorId !== authorId) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Not authorized to delete this macro' 
      }), {
        status: 403,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Update folder macro count if specified
    if (sharedMacro.metadata.folderId) {
      let folders = await redis.get('shared_folders') || [];
      const folderIndex = folders.findIndex(f => f.id === sharedMacro.metadata.folderId);
      if (folderIndex !== -1) {
        folders[folderIndex].macroCount = Math.max(0, (folders[folderIndex].macroCount || 0) - sharedMacro.macros.length);
        await redis.set('shared_folders', folders);
      }
    }

    // Remove from array
    allMacros.splice(index, 1);
    
    // Save back to Redis
    await redis.set('shared_macros', allMacros);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Error deleting shared macro:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Failed to delete shared macro',
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
