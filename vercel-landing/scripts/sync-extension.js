#!/usr/bin/env node

/**
 * Extension Sync Script for Vercel Deployment
 * Build ID: 2026-01-16-v2
 * 
 * This script runs during build to ensure the website's extension folder
 * is synced with the main extension folder (fountain-macro-assistant-extension).
 * 
 * It will:
 * 1. Compare manifest.json versions between both folders
 * 2. If they differ, copy all files from the source to the website extension folder
 * 3. Update the extension.zip file
 * 4. Log warnings if the website extension is outdated
 */

const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

// Paths relative to vercel-landing directory
const WEBSITE_EXTENSION_DIR = path.join(__dirname, '..', 'extension');
const SOURCE_EXTENSION_DIR = path.join(__dirname, '..', '..', 'fountain-macro-assistant-extension');
const OUTPUT_ZIP = path.join(__dirname, '..', 'extension.zip');

// Files to sync from source to website extension
const FILES_TO_SYNC = [
  'manifest.json',
  'popup.html',
  'popup.js',
  'popup.css',
  'content.js',
  'background.js',
  'options.html',
  'options.js',
  'options.css',
  'cloud-sync.js',
  'README.md'
];

// Icon files to sync
const ICON_FILES = [
  'icon16.png',
  'icon48.png',
  'icon128.png',
  'logo.png'
];

/**
 * Read and parse manifest.json from a directory
 */
function readManifest(dir) {
  const manifestPath = path.join(dir, 'manifest.json');
  if (!fs.existsSync(manifestPath)) {
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  } catch (e) {
    console.error(`Error reading manifest from ${dir}:`, e.message);
    return null;
  }
}

/**
 * Compare version strings (semver-like)
 * Returns: -1 if a < b, 0 if a == b, 1 if a > b
 */
function compareVersions(a, b) {
  const partsA = a.split('.').map(Number);
  const partsB = b.split('.').map(Number);
  
  for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
    const numA = partsA[i] || 0;
    const numB = partsB[i] || 0;
    if (numA < numB) return -1;
    if (numA > numB) return 1;
  }
  return 0;
}

/**
 * Copy a file from source to destination
 */
function copyFile(src, dest) {
  const destDir = path.dirname(dest);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  fs.copyFileSync(src, dest);
}

/**
 * Sync extension files from source to website
 */
function syncExtensionFiles() {
  console.log('\n📂 Syncing extension files...');
  let syncedCount = 0;
  let skippedCount = 0;
  
  // Sync main files
  for (const file of FILES_TO_SYNC) {
    const srcPath = path.join(SOURCE_EXTENSION_DIR, file);
    const destPath = path.join(WEBSITE_EXTENSION_DIR, file);
    
    if (fs.existsSync(srcPath)) {
      copyFile(srcPath, destPath);
      console.log(`  ✓ ${file}`);
      syncedCount++;
    } else {
      console.log(`  ⚠ ${file} not found in source`);
      skippedCount++;
    }
  }
  
  // Sync icon files
  const srcIconsDir = path.join(SOURCE_EXTENSION_DIR, 'icons');
  const destIconsDir = path.join(WEBSITE_EXTENSION_DIR, 'icons');
  
  if (fs.existsSync(srcIconsDir)) {
    if (!fs.existsSync(destIconsDir)) {
      fs.mkdirSync(destIconsDir, { recursive: true });
    }
    
    for (const icon of ICON_FILES) {
      const srcPath = path.join(srcIconsDir, icon);
      const destPath = path.join(destIconsDir, icon);
      
      if (fs.existsSync(srcPath)) {
        copyFile(srcPath, destPath);
        console.log(`  ✓ icons/${icon}`);
        syncedCount++;
      }
    }
  }
  
  console.log(`\n📊 Synced ${syncedCount} files, skipped ${skippedCount}`);
  return syncedCount;
}

/**
 * Create extension.zip from the website extension folder
 */
function createExtensionZip() {
  return new Promise((resolve, reject) => {
    console.log('\n📦 Creating extension.zip...');
    
    if (!fs.existsSync(WEBSITE_EXTENSION_DIR)) {
      reject(new Error('Extension directory not found'));
      return;
    }

    const output = fs.createWriteStream(OUTPUT_ZIP);
    const archive = archiver('zip', {
      zlib: { level: 9 }
    });

    output.on('close', () => {
      const sizeKB = (archive.pointer() / 1024).toFixed(1);
      console.log(`  ✓ extension.zip created (${sizeKB} KB)`);
      resolve(OUTPUT_ZIP);
    });

    archive.on('error', (err) => {
      reject(err);
    });

    archive.pipe(output);
    archive.directory(WEBSITE_EXTENSION_DIR, false);
    archive.finalize();
  });
}

/**
 * Main sync function
 */
async function main() {
  console.log('═'.repeat(60));
  console.log('🔄 Fountain Extension Sync Check');
  console.log('═'.repeat(60));
  
  // Check if source extension exists
  if (!fs.existsSync(SOURCE_EXTENSION_DIR)) {
    console.log('\n⚠️  Source extension folder not found.');
    console.log(`   Expected: ${SOURCE_EXTENSION_DIR}`);
    console.log('   Skipping sync (this is normal for Vercel builds).\n');
    
    // Still create zip from existing files
    if (fs.existsSync(WEBSITE_EXTENSION_DIR)) {
      await createExtensionZip();
    }
    return;
  }
  
  // Read manifests
  const sourceManifest = readManifest(SOURCE_EXTENSION_DIR);
  const websiteManifest = readManifest(WEBSITE_EXTENSION_DIR);
  
  if (!sourceManifest) {
    console.error('\n❌ Could not read source manifest.json');
    process.exit(1);
  }
  
  const sourceVersion = sourceManifest.version || '0.0.0';
  const websiteVersion = websiteManifest?.version || '0.0.0';
  
  console.log(`\n📋 Version Check:`);
  console.log(`   Source extension:  v${sourceVersion}`);
  console.log(`   Website extension: v${websiteVersion}`);
  
  const comparison = compareVersions(sourceVersion, websiteVersion);
  
  if (comparison === 0) {
    console.log('\n✅ Extensions are in sync!');
  } else if (comparison > 0) {
    console.log('\n⚠️  Website extension is OUTDATED!');
    console.log(`   Updating from v${websiteVersion} → v${sourceVersion}`);
    syncExtensionFiles();
  } else {
    console.log('\n🤔 Website extension has a newer version than source?');
    console.log('   This is unusual - you may want to check your files.');
  }
  
  // Always recreate the zip
  await createExtensionZip();
  
  // Final status
  const finalManifest = readManifest(WEBSITE_EXTENSION_DIR);
  console.log('\n' + '═'.repeat(60));
  console.log(`✨ Deployment ready with extension v${finalManifest?.version || 'unknown'}`);
  console.log('═'.repeat(60) + '\n');
}

// Run
main().catch(err => {
  console.error('\n❌ Sync failed:', err.message);
  process.exit(1);
});

