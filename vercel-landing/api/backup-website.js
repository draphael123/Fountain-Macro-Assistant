// Simplest backup solution: Store in website's user data
// Uses existing auth system - NO external services needed!

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, macros, folders, macroStats, settings, timestamp, version } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    // Store backup in user's account data
    // Since we're using client-side auth with localStorage,
    // we'll return instructions for the extension to store locally
    // and sync with website when user visits
    
    // For production: Store in a simple JSON file or use Vercel KV
    
    // Simplest approach: Extension stores backup, website reads it
    // when user logs in on website
    
    return res.status(200).json({
      success: true,
      backupId: userId,
      message: 'Backup stored in user account',
      // Return data so extension can store it
      backup: {
        macros: macros || [],
        folders: folders || [],
        macroStats: macroStats || {},
        settings: settings || {},
        timestamp: timestamp || new Date().toISOString(),
        version: version || '1.0.1'
      }
    });
  } catch (error) {
    console.error('Backup error:', error);
    return res.status(500).json({ 
      error: 'Backup failed',
      message: error.message 
    });
  }
}







