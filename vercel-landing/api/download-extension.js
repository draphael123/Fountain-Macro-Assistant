// Download Extension API - Redirects to the static extension.zip file
// For Vercel, static files are served directly, but this endpoint provides
// proper headers and version information

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get version from manifest (if available via environment or hardcoded)
    const version = '1.0.1'; // Update this when releasing new version
    
    // Redirect to static file with proper headers
    // Vercel will serve the static extension.zip file
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="fountain-macro-assistant-extension-v${version}.zip"`);
    res.setHeader('Cache-Control', 'public, max-age=3600, must-revalidate'); // Cache for 1 hour
    
    // Redirect to static file
    res.redirect(302, '/extension.zip');
  } catch (error) {
    console.error('Error serving extension file:', error);
    return res.status(500).json({ 
      error: 'Failed to serve extension file',
      message: error.message 
    });
  }
}

