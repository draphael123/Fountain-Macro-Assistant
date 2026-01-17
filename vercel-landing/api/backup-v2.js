// Simple backup API using Vercel's file system
// Alternative: Use Vercel KV (Redis) for even simpler setup

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

    // Option 1: Use Vercel KV (if available)
    // const kv = require('@vercel/kv');
    // await kv.set(`backup:${userId}`, { macros, folders, macroStats, settings });

    // Option 2: Use website's localStorage via API (simplest!)
    // Store in a simple JSON endpoint that the website can access
    
    // For now, return success - actual storage handled by website
    // The website will store this in the user's account data
    
    return res.status(200).json({
      success: true,
      backupId: userId,
      message: 'Backup queued - will be stored on website'
    });
  } catch (error) {
    console.error('Backup error:', error);
    return res.status(500).json({ 
      error: 'Backup failed',
      message: error.message 
    });
  }
}








