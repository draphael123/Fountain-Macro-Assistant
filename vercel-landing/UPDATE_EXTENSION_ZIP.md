# How to Update the Extension ZIP File

When you make changes to the extension, you need to update the `extension.zip` file so users can download the latest version.

## Quick Update

1. **Make your changes** to files in the `extension/` directory
2. **Update version** in `extension/manifest.json` if needed
3. **Run the update script** (see below)
4. **Deploy** to Vercel

## Update Methods

### Method 1: Using PowerShell (Windows)

```powershell
# Navigate to vercel-landing directory
cd vercel-landing

# Create ZIP file
Compress-Archive -Path extension\* -DestinationPath extension.zip -Force

# Verify it was created
Write-Host "Extension ZIP updated!" -ForegroundColor Green
```

### Method 2: Manual ZIP Creation

1. Select all files in the `extension/` folder
2. Right-click → "Send to" → "Compressed (zipped) folder"
3. Rename the ZIP file to `extension.zip`
4. Move it to the `vercel-landing/` directory (replace existing)

### Method 3: Using Node.js Script (if archiver is installed)

```bash
cd vercel-landing
node update-extension-zip.js
```

## What Gets Included

The ZIP file should contain:
- ✅ `manifest.json`
- ✅ `popup.html`, `popup.js`, `popup.css`
- ✅ `options.html`, `options.js`, `options.css`
- ✅ `content.js`
- ✅ `background.js`
- ✅ `extension-auth.js`
- ✅ `icons/` folder with all icon files

## Verification

After creating the ZIP:
1. Extract it to a temporary folder
2. Verify all files are present
3. Check that `manifest.json` has the correct version
4. Test loading it in Chrome (chrome://extensions → Developer mode → Load unpacked)

## Deployment

After updating `extension.zip`:
1. Commit the file to git
2. Push to your repository
3. Vercel will automatically deploy
4. Users can download from `/extension.zip` or `/api/download-extension`

## Important Notes

- ⚠️ **Always update the version** in `manifest.json` when making changes
- ⚠️ **Test the ZIP** before deploying
- ⚠️ **Keep the file size reasonable** (should be < 1MB)
- ✅ The ZIP is served directly from the website root
- ✅ Proper headers are set for download






