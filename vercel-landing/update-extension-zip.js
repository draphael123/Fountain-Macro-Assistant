// Script to update extension.zip with the latest extension files
// Run this script whenever the extension is updated

const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

function createExtensionZip() {
  return new Promise((resolve, reject) => {
    const extensionDir = path.join(__dirname, 'extension');
    const outputPath = path.join(__dirname, 'extension.zip');
    
    // Check if extension directory exists
    if (!fs.existsSync(extensionDir)) {
      reject(new Error('Extension directory not found'));
      return;
    }

    // Create output file stream
    const output = fs.createWriteStream(outputPath);
    const archive = archiver('zip', {
      zlib: { level: 9 } // Maximum compression
    });

    // Handle archive events
    output.on('close', () => {
      const sizeMB = (archive.pointer() / 1024 / 1024).toFixed(2);
      console.log(`✅ Extension ZIP created: ${sizeMB} MB`);
      console.log(`📦 File: ${outputPath}`);
      resolve(outputPath);
    });

    archive.on('error', (err) => {
      reject(err);
    });

    // Pipe archive data to the file
    archive.pipe(output);

    // Read manifest.json to get version
    const manifestPath = path.join(extensionDir, 'manifest.json');
    let version = '1.0.0';
    if (fs.existsSync(manifestPath)) {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      version = manifest.version || '1.0.0';
    }

    // Add all files from extension directory
    archive.directory(extensionDir, false);

    // Finalize the archive
    archive.finalize();
  });
}

// Run if called directly
if (require.main === module) {
  createExtensionZip()
    .then(() => {
      console.log('✨ Extension ZIP updated successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error creating extension ZIP:', error);
      process.exit(1);
    });
}

module.exports = { createExtensionZip };






