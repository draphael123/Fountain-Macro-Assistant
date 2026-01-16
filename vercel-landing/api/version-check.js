// Version Check API - Returns the latest extension version
// Dynamically reads from the extension's manifest.json

import fs from 'fs';
import path from 'path';

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
    // Try to read version from manifest.json
    let version = '3.0.0';
    let manifestData = null;
    
    try {
      // Try different possible paths for the manifest
      const possiblePaths = [
        path.join(process.cwd(), 'extension', 'manifest.json'),
        path.join(process.cwd(), 'vercel-landing', 'extension', 'manifest.json'),
        path.join(__dirname, '..', 'extension', 'manifest.json')
      ];
      
      for (const manifestPath of possiblePaths) {
        if (fs.existsSync(manifestPath)) {
          const content = fs.readFileSync(manifestPath, 'utf8');
          manifestData = JSON.parse(content);
          version = manifestData.version || version;
          break;
        }
      }
    } catch (e) {
      console.log('Could not read manifest, using default version');
    }

    const latestVersion = {
      version: version,
      releaseDate: '2026-01-16',
      downloadUrl: 'https://fountain-macro-assistant.vercel.app/index.html#download',
      releaseNotes: version === '3.0.0' ? 
        'Major update with regex patterns, JavaScript snippets, cloud sync, and more!' :
        'Bug fixes and improvements',
      changelog: [
        '🎯 Regex pattern matching with capture groups',
        '💻 JavaScript snippets in expansions',
        '🔢 Auto-incrementing counters',
        '🎲 Random selection from options',
        '☁️ Cloud sync across devices',
        '⌨️ Keyboard shortcuts (Ctrl+Shift+M, Ctrl+Shift+N)',
        '💬 Auto-suggest popup while typing',
        '⭐ Favorites system',
        '📊 Usage analytics and heatmap',
        '🎮 Guided onboarding tour'
      ],
      features: manifestData ? {
        permissions: manifestData.permissions || [],
        hasKeyboardShortcuts: !!manifestData.commands,
        hasCloudSync: true
      } : null,
      critical: false
    };

    return res.status(200).json(latestVersion);
  } catch (error) {
    console.error('Version check error:', error);
    return res.status(500).json({ 
      error: 'Version check failed',
      message: error.message 
    });
  }
}
