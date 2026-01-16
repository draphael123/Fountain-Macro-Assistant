// API endpoint to create/share a macro
// Uses Upstash Redis for persistent storage

export const config = {
  runtime: 'edge',
};

// Generate a simple share code (6 characters)
function generateShareCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
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
    const { macros, metadata } = body;

    if (!Array.isArray(macros) || macros.length === 0) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'No macros provided' 
      }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Get existing macros
    let allMacros = await redis.get('shared_macros') || [];

    // Generate unique share code
    let shareCode = generateShareCode();
    while (allMacros.some(m => m.shareCode === shareCode)) {
      shareCode = generateShareCode();
    }

    const shareId = `share_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const sharedMacro = {
      id: shareId,
      shareCode: shareCode,
      macros: macros,
      metadata: {
        title: metadata?.title || `${macros.length} Macro${macros.length > 1 ? 's' : ''}`,
        description: metadata?.description || '',
        author: metadata?.author || 'Anonymous',
        authorId: metadata?.authorId || null,
        category: metadata?.category || 'general',
        tags: metadata?.tags || [],
        folderId: metadata?.folderId || null,
        createdAt: new Date().toISOString(),
        views: 0,
        imports: 0
      }
    };

    // Add to beginning of array
    allMacros.unshift(sharedMacro);

    // Keep only last 5000 shared macros
    if (allMacros.length > 5000) {
      allMacros = allMacros.slice(0, 5000);
    }

    // Save to Redis
    await redis.set('shared_macros', allMacros);

    // Update folder macro count if specified
    if (metadata?.folderId) {
      let folders = await redis.get('shared_folders') || [];
      const folderIndex = folders.findIndex(f => f.id === metadata.folderId);
      if (folderIndex !== -1) {
        folders[folderIndex].macroCount = (folders[folderIndex].macroCount || 0) + macros.length;
        await redis.set('shared_folders', folders);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      shareId: shareId,
      shareCode: shareCode,
      shareUrl: `https://fountain-macro-assistant.vercel.app/shared.html?code=${shareCode}`,
      sharedMacro: sharedMacro
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Error creating shared macro:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Failed to share macro',
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
