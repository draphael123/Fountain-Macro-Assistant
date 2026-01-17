# GitHub Release Version Status

## ⚠️ Current Status: **OUTDATED**

The GitHub release folder (`fountain-macro-assistant-extension/`) is **NOT** the most current version.

## Recent Critical Fixes (Not in GitHub Release)

### 1. **Expansion Bug Fix** (Just Fixed)
- **Issue**: Text wasn't expanding when typing shortcuts
- **Fix**: Rewrote expansion logic to be synchronous
- **File**: `content.js`
- **Status**: ✅ Fixed in main files, ❌ NOT in extension folder yet

### 2. **Website Updates**
- Updated download links to point to GitHub (no ZIP)
- Installation guide updated
- **File**: `vercel-landing/index.html`
- **Status**: ✅ Updated in main files

## Current Version

- **Extension Version**: 1.0.0 (from manifest.json)
- **Main Files**: ✅ Up to date with latest fixes
- **Extension Folder**: ❌ Outdated (missing expansion fix)

## How to Update GitHub Release

### Option 1: Recreate Extension Folder (Recommended)

Run the script to create a fresh extension folder with all latest fixes:

```powershell
.\create-shareable-folder.ps1
```

This will:
- Copy all latest files including the fixed `content.js`
- Include all icons
- Create a clean, ready-to-upload folder

### Option 2: Manual Update

1. Copy the fixed `content.js` to the extension folder:
   ```powershell
   Copy-Item "content.js" -Destination "fountain-macro-assistant-extension\content.js" -Force
   ```

2. Copy any other updated files:
   ```powershell
   Copy-Item "popup.js" -Destination "fountain-macro-assistant-extension\popup.js" -Force
   Copy-Item "popup.html" -Destination "fountain-macro-assistant-extension\popup.html" -Force
   Copy-Item "popup.css" -Destination "fountain-macro-assistant-extension\popup.css" -Force
   Copy-Item "options.js" -Destination "fountain-macro-assistant-extension\options.js" -Force
   Copy-Item "options.html" -Destination "fountain-macro-assistant-extension\options.html" -Force
   Copy-Item "options.css" -Destination "fountain-macro-assistant-extension\options.css" -Force
   Copy-Item "background.js" -Destination "fountain-macro-assistant-extension\background.js" -Force
   Copy-Item "manifest.json" -Destination "fountain-macro-assistant-extension\manifest.json" -Force
   ```

## After Updating

1. **Test the extension folder:**
   - Load it in Chrome as unpacked extension
   - Verify expansion works (type shortcut + space)

2. **Upload to GitHub:**
   - Go to your GitHub repository
   - Upload the updated files from `fountain-macro-assistant-extension/`
   - Or use git to push changes

3. **Create a new release:**
   - Tag: `v1.0.1` (or `v1.0.0` if first release)
   - Title: "Fountain - Macro Assistant v1.0.1 - Expansion Fix"
   - Description: "Fixed critical expansion bug - text now expands correctly"

## Summary

**Answer**: ❌ **NO**, the GitHub release is **NOT** the most current version.

The extension folder needs to be updated with:
- ✅ Fixed `content.js` (expansion bug fix)
- ✅ Any other recent changes

**Action Required**: Run `create-shareable-folder.ps1` to create an updated extension folder, then upload to GitHub.








