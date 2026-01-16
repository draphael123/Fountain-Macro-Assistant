// Simple backup API - Stores backups as JSON files
// No database needed! Uses file system storage

import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  // Enable CORS
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

    // Create backups directory if it doesn't exist
    const backupsDir = path.join(process.cwd(), 'backups');
    if (!fs.existsSync(backupsDir)) {
      fs.mkdirSync(backupsDir, { recursive: true });
    }

    // Save backup as JSON file
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

    const filePath = path.join(backupsDir, `${userId}.json`);
    fs.writeFileSync(filePath, JSON.stringify(backupData, null, 2));

    return res.status(200).json({
      success: true,
      backupId: userId,
      message: 'Backup saved successfully'
    });
  } catch (error) {
    console.error('Backup error:', error);
    return res.status(500).json({ 
      error: 'Backup failed',
      message: error.message 
    });
  }
}






