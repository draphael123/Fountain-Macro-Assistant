// API endpoint to list shared macros
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
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (request.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // Import Upstash Redis
    const { Redis } = await import('@upstash/redis');
    const redis = Redis.fromEnv();
    
    // Get query parameters
    const url = new URL(request.url);
    const sortBy = url.searchParams.get('sort') || 'recent'; // 'recent' or 'popular'
    const limit = parseInt(url.searchParams.get('limit') || '50', 10);
    const folderId = url.searchParams.get('folderId');

    // Get all shared macros from Redis
    let macros = await redis.get('shared_macros') || [];
    
    // Filter by folder if specified
    if (folderId) {
      macros = macros.filter(m => m.metadata?.folderId === folderId);
    }

    // Sort
    if (sortBy === 'popular') {
      macros.sort((a, b) => (b.metadata?.imports || 0) - (a.metadata?.imports || 0));
    } else {
      macros.sort((a, b) => new Date(b.metadata?.createdAt || 0) - new Date(a.metadata?.createdAt || 0));
    }

    // Limit results
    macros = macros.slice(0, limit);

    return new Response(JSON.stringify({ success: true, macros }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=10',
      },
    });
  } catch (error) {
    console.error('Error fetching shared macros:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Failed to fetch shared macros',
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
