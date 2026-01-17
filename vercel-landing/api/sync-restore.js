// Sync Restore API - Retrieves macros from user's account
// This endpoint is called by the sync-restore.html page to get data

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'UserId required' });
    }

    // Return success - actual retrieval happens client-side via sync-restore.html
    // The sync-restore.html page will use the auth system to get the backup
    return res.status(200).json({
      success: true,
      message: 'Backup will be retrieved by sync page',
      userId: userId
    });
  } catch (error) {
    console.error('Sync restore error:', error);
    return res.status(500).json({ 
      error: 'Sync restore failed',
      message: error.message 
    });
  }
}








