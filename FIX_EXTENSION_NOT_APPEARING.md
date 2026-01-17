# Fix: Extension Doesn't Appear When Loading

## ✅ Your Extension is Ready!

All files are verified and correct:
- ✅ manifest.json (valid)
- ✅ All required files present
- ✅ Icons folder with all icons
- ✅ No syntax errors

## Most Likely Issues

### Issue 1: Developer Mode Not Enabled

**Symptom:** "Load unpacked" button doesn't appear

**Fix:**
1. Go to `chrome://extensions/`
2. Look at **top-right corner**
3. Find **"Developer mode"** toggle switch
4. **Turn it ON** (click it - should highlight/change color)
5. After turning ON, "Load unpacked" button should appear

**Verify:** You should see "Load unpacked" button after enabling Developer mode.

---

### Issue 2: Wrong Item Selected

**Symptom:** File picker closes or shows error

**Fix:**
1. When file picker opens, navigate to:
   ```
   C:\Users\danie\OneDrive\Desktop\Cursor Projects\Fountain-Macro-Assistant
   ```
2. You should see folder: `fountain-macro-assistant-extension`
3. **Click ONCE on the FOLDER** (not files inside it)
4. The folder should be highlighted/selected
5. Click "Select Folder" button

**⚠️ Common Mistakes:**
- ❌ Selecting `manifest.json` file
- ❌ Selecting `popup.html` file
- ❌ Double-clicking into the folder (opens it instead of selecting)
- ❌ Selecting parent folder `Fountain-Macro-Assistant`

**✅ Correct:** Select the folder `fountain-macro-assistant-extension` itself

---

### Issue 3: Extension Loads But Has Errors

**Symptom:** Extension appears but shows error icon or message

**Fix:**
1. Go to `chrome://extensions/`
2. Find "Fountain - Macro Assistant" in the list
3. Look for red error text
4. Click **"Errors"** button (if visible)
5. Read the error message
6. Share the error so we can fix it

---

## Exact Steps to Follow

### Step 1: Open Chrome Extensions
```
1. Open Google Chrome
2. Type: chrome://extensions/
3. Press Enter
```

### Step 2: Enable Developer Mode
```
1. Look at TOP-RIGHT corner
2. Find "Developer mode" toggle
3. Click to turn it ON
4. Verify "Load unpacked" button appears
```

### Step 3: Load Extension
```
1. Click "Load unpacked" button
2. File picker opens
3. Navigate to: C:\Users\danie\OneDrive\Desktop\Cursor Projects\Fountain-Macro-Assistant
4. Click ONCE on folder: fountain-macro-assistant-extension
5. Click "Select Folder" button
```

### Step 4: Verify
```
1. Extension should appear in list
2. Name: "Fountain - Macro Assistant"
3. Version: 1.0.0
4. Should have ON/OFF toggle
```

---

## Quick Test

**Test if your folder is correct:**

1. Open File Explorer
2. Go to: `C:\Users\danie\OneDrive\Desktop\Cursor Projects\Fountain-Macro-Assistant\fountain-macro-assistant-extension`
3. You should see `manifest.json` file directly in that folder
4. If you see `manifest.json`, the folder is correct!

**When loading in Chrome:**
- Select this **folder** (the one containing manifest.json)
- Don't select any file inside it

---

## Still Not Working?

**Please answer these questions:**

1. **Does "Load unpacked" button appear?**
   - Yes → Go to question 2
   - No → Developer mode is not enabled

2. **Does file picker open when you click "Load unpacked"?**
   - Yes → Go to question 3
   - No → Try refreshing the page

3. **What happens after you select the folder and click "Select Folder"?**
   - Extension appears → ✅ Success!
   - Nothing happens → Check for errors
   - Error message appears → What does it say?

4. **Do you see any error messages?**
   - Copy the exact error text
   - Take a screenshot if possible

---

## Alternative: Try Loading from Different Location

If the OneDrive path is causing issues, try:

1. **Copy the extension folder to Desktop:**
   - Copy `fountain-macro-assistant-extension` folder
   - Paste it to your Desktop
   - Try loading from Desktop location

2. **Or copy to a simple path:**
   - Copy to: `C:\fountain-extension`
   - Try loading from there

---

## Need Immediate Help?

**Share this information:**
1. Screenshot of Chrome extensions page
2. Screenshot of file picker when selecting folder
3. Any error messages (exact text)
4. What happens when you click "Select Folder"

This will help diagnose the exact issue!








