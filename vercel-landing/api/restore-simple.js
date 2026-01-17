// Simple restore API - Reads backups from JSON files
// No database needed! Uses file system storage

import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  // Enable CORS
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

    // Read backup from JSON file
    const filePath = path.join(process.cwd(), 'backups', `${userId}.json`);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'No backup found' });
    }

    const backupData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    return res.status(200).json({
      success: true,
      macros: backupData.macros || [],
      folders: backupData.folders || [],
      macroStats: backupData.macroStats || {},
      settings: backupData.settings || {},
      timestamp: backupData.updatedAt || backupData.timestamp,
      version: backupData.version
    });
  } catch (error) {
    console.error('Restore error:', error);
    return res.status(500).json({ 
      error: 'Restore failed',
      message: error.message 
    });
  }
}








