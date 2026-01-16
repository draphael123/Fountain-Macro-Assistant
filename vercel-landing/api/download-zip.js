const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
  try {
    const zipPath = path.join(process.cwd(), 'extension.zip');
    
    // Check if file exists
    if (!fs.existsSync(zipPath)) {
      return res.status(404).json({ error: 'Extension file not found' });
    }
    
    const fileBuffer = fs.readFileSync(zipPath);
    
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="fountain-macro-assistant-extension.zip"');
    res.setHeader('Content-Length', fileBuffer.length);
    res.setHeader('Cache-Control', 'public, max-age=3600');
    
    return res.send(fileBuffer);
  } catch (error) {
    console.error('Download error:', error);
    return res.status(500).json({ error: 'Failed to download extension' });
  }
};

