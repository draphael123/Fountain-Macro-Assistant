# Step-by-Step: Load Extension in Chrome

## Exact Steps to Follow

### Step 1: Verify Extension Folder Exists

The folder should be at:
```
C:\Users\danie\OneDrive\Desktop\Cursor Projects\Fountain-Macro-Assistant\fountain-macro-assistant-extension
```

**Check:**
- Open File Explorer
- Navigate to that path
- You should see `manifest.json` file directly in that folder

### Step 2: Open Chrome Extensions Page

1. Open Google Chrome
2. In the address bar, type: `chrome://extensions/`
3. Press Enter

### Step 3: Enable Developer Mode

1. Look at the **top-right corner** of the page
2. Find the toggle switch labeled **"Developer mode"**
3. **Turn it ON** (should turn blue/highlighted)
4. You should now see new buttons appear: "Load unpacked", "Pack extension", etc.

### Step 4: Load the Extension

1. Click the **"Load unpacked"** button (should be visible after enabling Developer mode)
2. A file picker window will open
3. **Navigate to:** `C:\Users\danie\OneDrive\Desktop\Cursor Projects\Fountain-Macro-Assistant\fountain-macro-assistant-extension`
4. **Select the FOLDER** (click on it once to highlight it)
5. Click **"Select Folder"** button (bottom right of file picker)

### Step 5: Check for Extension

After clicking "Select Folder":
- The extension should appear in the extensions list
- If there's an error, you'll see a red error message
- Click "Errors" button to see what went wrong

## Common Mistakes

### ❌ Wrong: Selecting a file inside the folder
- Don't select `manifest.json` or any individual file
- Select the **folder itself**

### ❌ Wrong: Selecting the ZIP file
- Don't select `fountain-macro-assistant-extension.zip`
- You must extract it first, then select the extracted folder

### ❌ Wrong: Selecting parent folder
- Don't select `Fountain-Macro-Assistant` (parent folder)
- Select `fountain-macro-assistant-extension` (the extension folder)

## What Should Happen

When you successfully load the extension:
1. It appears in the extensions list
2. Shows name: "Fountain - Macro Assistant"
3. Shows version: "1.0.0"
4. Has an ON/OFF toggle
5. May show an icon (if icons loaded correctly)

## If Extension Doesn't Appear

### Check 1: Look for Error Messages
- Scroll through the extensions list
- Look for red error text
- Click "Errors" button if visible

### Check 2: Verify Folder Structure
Open the extension folder and verify it contains:
- `manifest.json` (directly in folder, not in subfolder)
- `popup.html`
- `content.js`
- `background.js`
- `icons/` folder with PNG files

### Check 3: Check Chrome Console
1. Go to `chrome://extensions/`
2. Find your extension (if it appears)
3. Click "Errors" or "Inspect views: popup"
4. Read the error message

### Check 4: Try Reloading
1. If extension appears but has errors
2. Click the refresh/reload icon on the extension card
3. Check if errors clear

## Still Not Working?

**Share this information:**
1. What happens when you click "Load unpacked"?
   - Does a file picker open?
   - Does it close immediately?
   - Any error message?

2. Does the extension appear in the list at all?
   - Even with errors?

3. What error message do you see?
   - Copy the exact error text

4. Screenshot of:
   - The extensions page
   - The file picker when selecting folder
   - Any error messages

This will help diagnose the exact issue!








