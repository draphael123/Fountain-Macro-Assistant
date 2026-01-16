# How to Load the Extension in Chrome

## ⚠️ Important: You Cannot Load a ZIP File Directly!

Chrome requires you to load an **unpacked folder**, not a ZIP file. You have two options:

## Option 1: Use the Folder (Easiest - Recommended)

The scripts now create a **ready-to-use folder** instead of a ZIP file.

### Step 1: Create the Extension Folder

Run this script:
```powershell
.\create-shareable-folder.ps1
```

This creates: `fountain-macro-assistant-extension/` folder

### Step 2: Load in Chrome

1. **Open Chrome Extensions page:**
   - Go to `chrome://extensions/`
   - Or: Menu (⋮) → Extensions → Manage extensions

2. **Enable Developer mode:**
   - Toggle the switch in the top-right corner

3. **Load the extension:**
   - Click **"Load unpacked"** button
   - Navigate to and select the **`fountain-macro-assistant-extension`** folder
   - Click "Select Folder"

4. **Done!** The extension should now appear in your extensions list.

---

## Option 2: If You Have a ZIP File

### Step 1: Extract the ZIP File

1. **Right-click the ZIP file**
2. **Select "Extract All..."** (Windows)
   - Or use 7-Zip, WinRAR, etc.
3. **Extract to a folder** (e.g., `fountain-macro-assistant-extension`)

### Step 2: Verify the Structure

After extracting, the folder should look like this:
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

**⚠️ Common Mistake:** If you see a nested folder like:
```
fountain-macro-assistant-extension/
└── fountain-macro-assistant-extension/  ← Wrong! Too nested
    └── manifest.json
```

**Fix:** Move all files up one level, or select the inner folder when loading.

### Step 3: Load in Chrome

1. Go to `chrome://extensions/`
2. Enable Developer mode
3. Click "Load unpacked"
4. **Select the EXTRACTED FOLDER** (not the ZIP file!)
5. The folder should contain `manifest.json` directly

---

## Troubleshooting

### "Manifest file is missing or unreadable"

**Problem:** You're selecting the ZIP file or wrong folder.

**Solution:**
- Make sure you extracted the ZIP first
- Select the **folder** that contains `manifest.json`
- Don't select the ZIP file itself

### "Could not load icon"

**Problem:** Icons folder is missing or in wrong location.

**Solution:**
- Check that `icons/` folder exists inside the extension folder
- Verify `icon16.png`, `icon48.png`, `icon128.png` are in the `icons/` folder

### Extension doesn't appear

**Problem:** Wrong folder selected or files missing.

**Solution:**
1. Run the verification script:
   ```powershell
   .\fix-extension-load.ps1
   ```
2. Check that all required files are present
3. Make sure you selected the folder (not ZIP) when clicking "Load unpacked"

### "This extension may have been corrupted"

**Problem:** Files are missing or manifest.json has errors.

**Solution:**
1. Check Chrome console for errors:
   - Go to `chrome://extensions/`
   - Find your extension
   - Click "Errors" button
2. Verify all files exist
3. Check `manifest.json` for syntax errors

---

## Quick Checklist

Before loading:
- [ ] ZIP file is extracted (if using ZIP)
- [ ] `manifest.json` is in the root of the folder
- [ ] `icons/` folder exists with 3 PNG files
- [ ] All required files are present
- [ ] You're selecting the **folder**, not the ZIP file
- [ ] Developer mode is enabled in Chrome

---

## Still Having Issues?

1. **Use the folder script** (easiest):
   ```powershell
   .\create-shareable-folder.ps1
   ```
   Then load the created folder directly.

2. **Run the verification script**:
   ```powershell
   .\fix-extension-load.ps1
   ```
   This will check if all files are present and correct.

3. **See detailed troubleshooting**: `TROUBLESHOOT_EXTENSION_LOAD.md`

---

## Summary

**Remember:** Chrome needs a **folder**, not a ZIP file!
- Extract ZIP first, OR
- Use the folder script to create a ready-to-use folder
- Then select that **folder** when clicking "Load unpacked"







