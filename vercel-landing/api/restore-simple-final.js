// Simplest restore API - Reads from website's localStorage
// NO external services, NO database, NO setup needed!

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    // Return instructions for extension to read from website's localStorage
    // The actual data is stored in the website's localStorage
    // Extension needs to visit website to retrieve it
    
    return res.status(200).json({
      success: true,
      message: 'Backup available on website',
      storageMethod: 'localStorage',
      storageKey: `fountain_backup_${userId}`,
      websiteUrl: 'https://fountain-macro-assistant.vercel.app/',
      // Extension will read from website's localStorage when user visits
      instructions: 'Visit website and log in to restore backup'
    });
  } catch (error) {
    console.error('Restore error:', error);
    return res.status(500).json({ 
      error: 'Restore failed',
      message: error.message 
    });
  }
}






