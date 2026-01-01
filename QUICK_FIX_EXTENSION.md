# Quick Fix: Extension Not Appearing

## Most Common Issues

### Issue 1: Wrong Folder Selected

**Problem:** You selected the ZIP file or wrong folder.

**Fix:**
1. Make sure you **extracted** the ZIP file first (if using ZIP)
2. Select the **folder** that contains `manifest.json` directly
3. The folder structure should be:
   ```
   fountain-macro-assistant-extension/
   ├── manifest.json  ← This file should be here
   ├── popup.html
   └── icons/
   ```

### Issue 2: Missing Files

**Problem:** Required files are missing from the folder.

**Quick Fix:**
Run this command in PowerShell (from project root):
```powershell
cd "C:\Users\danie\OneDrive\Desktop\Cursor Projects\Fountain-Macro-Assistant"
$folder = "fountain-macro-assistant-extension"
if (Test-Path $folder) { Remove-Item $folder -Recurse -Force }
New-Item -ItemType Directory -Path $folder | Out-Null
Copy-Item manifest.json,popup.html,popup.css,popup.js,content.js,background.js,options.html,options.css,options.js -Destination $folder
Copy-Item icons -Destination $folder -Recurse
```

### Issue 3: Chrome Shows Error

**Check for errors:**
1. Go to `chrome://extensions/`
2. Enable Developer mode
3. Look for your extension
4. Click "Errors" button (if visible)
5. Read the error message

### Issue 4: Extension Loads But Doesn't Appear

**Problem:** Extension loaded but icon not visible.

**Fix:**
1. Click the puzzle piece icon (🧩) in Chrome toolbar
2. Find "Fountain - Macro Assistant"
3. Click the pin icon to pin it to toolbar

## Step-by-Step Loading Process

1. **Open Chrome Extensions:**
   - Type `chrome://extensions/` in address bar
   - Press Enter

2. **Enable Developer Mode:**
   - Toggle switch in top-right corner
   - Should turn blue/on

3. **Click "Load unpacked":**
   - Button appears after enabling Developer mode

4. **Select the FOLDER:**
   - Navigate to: `C:\Users\danie\OneDrive\Desktop\Cursor Projects\Fountain-Macro-Assistant\fountain-macro-assistant-extension`
   - **Important:** Select the FOLDER, not a file inside it
   - Click "Select Folder" button

5. **Check for Extension:**
   - Should appear in extensions list
   - If error appears, click "Errors" to see what's wrong

## Verify Your Folder

Make sure your folder has these files:
- ✅ manifest.json
- ✅ popup.html
- ✅ popup.css
- ✅ popup.js
- ✅ content.js
- ✅ background.js
- ✅ options.html
- ✅ options.css
- ✅ options.js
- ✅ icons/icon16.png
- ✅ icons/icon48.png
- ✅ icons/icon128.png

## Still Not Working?

1. **Check Chrome Console:**
   - Go to `chrome://extensions/`
   - Find your extension
   - Click "Errors" or "Inspect views: popup"
   - Share the error message

2. **Try Fresh:**
   - Remove extension if partially loaded
   - Delete the folder
   - Recreate it
   - Load again

3. **Check File Permissions:**
   - Right-click folder → Properties
   - Make sure it's not read-only

