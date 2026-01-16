// API endpoint to get/save user macros
// Uses the website's auth system to store macros per user account

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { userId } = req.query; // For GET requests
    const body = req.body || {};
    const requestUserId = body.userId || userId;

    if (!requestUserId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    // Since we're using client-side localStorage auth,
    // we'll use a sync page approach
    // For GET: Return instructions to fetch from localStorage
    // For POST/PUT: Return instructions to save to localStorage

    if (req.method === 'GET') {
      // Return instructions for extension to fetch from website
      return res.status(200).json({
        success: true,
        message: 'Use sync page to fetch macros',
        syncUrl: `https://fountain-macro-assistant.vercel.app/sync-macros.html?userId=${encodeURIComponent(requestUserId)}&action=get`
      });
    }

    if (req.method === 'POST' || req.method === 'PUT') {
      // Save macros to user account
      const { macros, folders, macroStats, settings } = body;

      return res.status(200).json({
        success: true,
        message: 'Use sync page to save macros',
        syncUrl: `https://fountain-macro-assistant.vercel.app/sync-macros.html?userId=${encodeURIComponent(requestUserId)}&action=save`,
        data: {
          macros: macros || [],
          folders: folders || [],
          macroStats: macroStats || {},
          settings: settings || {}
        }
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('User macros API error:', error);
    return res.status(500).json({ 
      error: 'Failed to process request',
      message: error.message 
    });
  }
}






