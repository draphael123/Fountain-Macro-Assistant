# Troubleshooting: Extension Won't Load in Chrome

## Common Issues and Solutions

### Issue 1: "Manifest file is missing or unreadable"

**Cause:** The ZIP file structure is incorrect or manifest.json is missing.

**Solution:**
1. Extract the ZIP file
2. Check that `manifest.json` is in the **root** of the extracted folder (not in a subfolder)
3. The folder structure should look like this:
   ```
   fountain-macro-assistant-extension/
   ├── manifest.json          ← Must be here!
   ├── popup.html
   ├── popup.css
   ├── popup.js
   ├── content.js
   ├── background.js
   ├── options.html
   ├── options.css
   ├── options.js
   └── icons/
       ├── icon16.png
       ├── icon48.png
       └── icon128.png
   ```

### Issue 2: "Could not load icon"

**Cause:** Icons folder is missing or icons are in wrong location.

**Solution:**
1. Make sure there's an `icons/` folder inside the extension folder
2. Verify these files exist:
   - `icons/icon16.png`
   - `icons/icon48.png`
   - `icons/icon128.png`
3. Check that the icons are actual PNG files (not corrupted)

### Issue 3: Extension appears but doesn't work

**Cause:** Missing required files or JavaScript errors.

**Solution:**
1. Open Chrome DevTools (F12)
2. Go to `chrome://extensions/`
3. Find your extension
4. Click "Errors" or "Inspect views: popup"
5. Check for error messages
6. Make sure all files are present:
   - popup.html, popup.css, popup.js
   - content.js
   - background.js
   - options.html, options.css, options.js

### Issue 4: ZIP file won't extract

**Cause:** ZIP file is corrupted or incomplete.

**Solution:**
1. Try downloading/extracting again
2. Use a different extraction tool (7-Zip, WinRAR)
3. Check file size - should be at least 50KB
4. Recreate the ZIP file using the script

### Issue 5: "This extension may have been corrupted"

**Cause:** Files are missing or manifest.json has errors.

**Solution:**
1. Check manifest.json for syntax errors
2. Verify all files referenced in manifest.json exist
3. Make sure no files are corrupted

## Step-by-Step Fix

### Option 1: Use the Folder Script (Recommended)

Instead of using a ZIP file, use the folder script:

```powershell
.\create-shareable-folder.ps1
```

This creates a ready-to-use folder:
- `fountain-macro-assistant-extension/`
- All files in correct structure
- No extraction needed!

Then:
1. Go to `chrome://extensions/`
2. Enable Developer mode
3. Click "Load unpacked"
4. Select the `fountain-macro-assistant-extension` folder
5. Done!

### Option 2: Fix the ZIP File

1. **Extract the ZIP file** to a folder
2. **Check the structure:**
   - Open the extracted folder
   - `manifest.json` should be directly inside (not in a subfolder)
   - `icons/` folder should be directly inside
3. **If structure is wrong:**
   - Move all files to the root of the extracted folder
   - Make sure `icons/` folder is at the root level
4. **Load the folder** (not the ZIP):
   - Go to `chrome://extensions/`
   - Enable Developer mode
   - Click "Load unpacked"
   - Select the **extracted folder** (not the ZIP file)

## Quick Checklist

Before loading the extension, verify:

- [ ] `manifest.json` exists in the root folder
- [ ] `popup.html` exists
- [ ] `content.js` exists
- [ ] `background.js` exists
- [ ] `icons/` folder exists with 3 PNG files
- [ ] All files are in the same folder (not nested)
- [ ] No syntax errors in manifest.json

## Still Not Working?

1. **Check Chrome Console:**
   - Go to `chrome://extensions/`
   - Find your extension
   - Click "Errors" button
   - Read the error message

2. **Verify File Paths:**
   - Make sure you're selecting the **folder**, not the ZIP file
   - The folder should contain `manifest.json` directly

3. **Try Fresh Install:**
   - Remove the extension if it's partially loaded
   - Delete the folder/ZIP
   - Recreate using the script
   - Load again

4. **Check File Permissions:**
   - Make sure files aren't read-only
   - Windows: Right-click folder → Properties → Uncheck "Read-only"

## Need Help?

If you're still having issues, check:
- Chrome version (should be recent)
- Developer mode is enabled
- You're selecting the folder (not ZIP) when clicking "Load unpacked"
- All required files are present







