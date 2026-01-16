// API endpoint to import a shared macro (increments import count)
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
    const { shareCode } = body;

    if (!shareCode) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Share code is required' 
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
    
    // Find by share code
    const index = allMacros.findIndex(m => m.shareCode === shareCode || m.id === shareCode);

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

    // Increment import count
    allMacros[index].metadata.imports = (allMacros[index].metadata.imports || 0) + 1;
    
    // Save back to Redis
    await redis.set('shared_macros', allMacros);

    return new Response(JSON.stringify({ 
      success: true, 
      macros: allMacros[index].macros,
      metadata: allMacros[index].metadata
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Error importing shared macro:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Failed to import shared macro',
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
