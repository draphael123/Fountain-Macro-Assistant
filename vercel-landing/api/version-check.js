// Version Check API - Returns the latest extension version
// Update this file when releasing a new version

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
    // Current latest version - UPDATE THIS when releasing a new version
    const latestVersion = {
      version: '1.0.1', // Update this when releasing
      releaseDate: '2026-01-03', // Update this when releasing
      downloadUrl: 'https://fountain-macro-assistant.vercel.app/index.html#download',
      releaseNotes: 'Bug fixes and improvements',
      changelog: [
        'Initial release with macro expansion',
        'Cloud backup and sync',
        'Shared macros library',
        'Personal macros management'
      ],
      critical: false // Set to true for critical security updates
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

