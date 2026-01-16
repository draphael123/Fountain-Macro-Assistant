// Simplest backup API - Uses website's localStorage
// NO external services, NO database, NO setup needed!
// Extension sends backup data, website stores it in user's account

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

    // Prepare backup data
    const backupData = {
      userId,
      macros: macros || [],
      folders: folders || [],
      macroStats: macroStats || {},
      settings: settings || {},
      timestamp: timestamp || new Date().toISOString(),
      version: version || '1.0.1',
      updatedAt: new Date().toISOString()
    };

    // Return backup data with instructions
    // The extension will store this in the website's localStorage
    // when the user visits the website and logs in
    
    return res.status(200).json({
      success: true,
      backupId: userId,
      message: 'Backup ready - visit website to store',
      backup: backupData,
      // Instructions for extension
      storageMethod: 'localStorage',
      storageKey: `fountain_backup_${userId}`,
      websiteUrl: 'https://fountain-macro-assistant.vercel.app/'
    });
  } catch (error) {
    console.error('Backup error:', error);
    return res.status(500).json({ 
      error: 'Backup failed',
      message: error.message 
    });
  }
}

