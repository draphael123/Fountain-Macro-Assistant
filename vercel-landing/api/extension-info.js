// Extension Info API - Returns information about the downloadable extension
// Dynamically reads version from manifest.json

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
    let zipSize = '~70 KB';
    
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
      
      // Try to get actual zip size
      const possibleZipPaths = [
        path.join(process.cwd(), 'extension.zip'),
        path.join(process.cwd(), 'vercel-landing', 'extension.zip'),
        path.join(__dirname, '..', 'extension.zip')
      ];
      
      for (const zipPath of possibleZipPaths) {
        if (fs.existsSync(zipPath)) {
          const stats = fs.statSync(zipPath);
          const sizeKB = Math.round(stats.size / 1024);
          zipSize = `${sizeKB} KB`;
          break;
        }
      }
    } catch (e) {
      console.log('Could not read manifest or zip, using defaults');
    }

    const extensionInfo = {
      version: version,
      releaseDate: '2026-01-16',
      downloadUrl: '/extension.zip',
      downloadSize: zipSize,
      fileName: 'fountain-macro-assistant-extension.zip',
      description: manifestData?.description || 'Type faster with smart text expansion!',
      features: [
        '🎯 Regex pattern matching with capture groups',
        '💻 JavaScript snippets {js:code}',
        '🔢 Auto-incrementing counters {counter:name}',
        '🎲 Random selection {random:a|b|c}',
        '📅 Date formatting {date:YYYY-MM-DD}',
        '☁️ Cloud sync across devices',
        '⌨️ Keyboard shortcuts (Ctrl+Shift+M)',
        '💬 Auto-suggest popup',
        '⭐ Favorites system',
        '📊 Usage analytics dashboard'
      ],
      changelog: [
        'v3.0.0 - Major update with regex, JS snippets, cloud sync',
        'v1.0.1 - Bug fixes and stability improvements',
        'v1.0.0 - Initial release with macro expansion'
      ],
      permissions: manifestData?.permissions || [],
      hasKeyboardShortcuts: !!manifestData?.commands
    };

    return res.status(200).json(extensionInfo);
  } catch (error) {
    console.error('Extension info error:', error);
    return res.status(500).json({ 
      error: 'Failed to get extension info',
      message: error.message 
    });
  }
}
