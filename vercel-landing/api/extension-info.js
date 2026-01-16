// Extension Info API - Returns information about the downloadable extension
// This helps the website display the current version and download link

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
    // Extension information - UPDATE THIS when releasing new version
    const extensionInfo = {
      version: '1.0.1', // Update this when releasing
      releaseDate: '2025-01-27', // Update this when releasing
      downloadUrl: '/extension.zip',
      downloadSize: '~500 KB', // Approximate size
      fileName: 'fountain-macro-assistant-extension.zip',
      features: [
        'Text expansion macros',
        'Cloud backup and sync',
        'Shared macros library',
        'Personal macros management',
        'Update notifications'
      ],
      changelog: [
        'Initial release with macro expansion',
        'Cloud backup and sync',
        'Shared macros library',
        'Personal macros management',
        'Update notification system'
      ]
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





