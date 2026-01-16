// Sync Backup API - Stores macros in user's account via localStorage
// This endpoint is called by the sync-backup.html page to store data

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, backupData } = req.body;

    if (!userId || !backupData) {
      return res.status(400).json({ error: 'UserId and backupData required' });
    }

    // Return success - actual storage happens client-side via sync-backup.html
    // The sync-backup.html page will use the auth system to store the backup
    return res.status(200).json({
      success: true,
      message: 'Backup will be stored by sync page',
      userId: userId
    });
  } catch (error) {
    console.error('Sync backup error:', error);
    return res.status(500).json({ 
      error: 'Sync backup failed',
      message: error.message 
    });
  }
}






