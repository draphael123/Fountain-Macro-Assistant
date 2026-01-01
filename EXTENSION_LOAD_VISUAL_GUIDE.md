# Visual Guide: Loading Extension in Chrome

## ✅ Your Extension Folder is Ready!

**Location:**
```
C:\Users\danie\OneDrive\Desktop\Cursor Projects\Fountain-Macro-Assistant\fountain-macro-assistant-extension
```

**All files verified:**
- ✅ manifest.json
- ✅ popup.html, popup.css, popup.js
- ✅ content.js
- ✅ background.js
- ✅ options.html, options.css, options.js
- ✅ icons/ folder with all icons

---

## Step-by-Step with Screenshots

### 1. Open Chrome Extensions Page

**Type this in Chrome address bar:**
```
chrome://extensions/
```

**Press Enter**

You should see a page with your installed extensions.

---

### 2. Enable Developer Mode

**Look at the TOP-RIGHT corner** of the page.

You should see a toggle switch that says **"Developer mode"**.

**Click the toggle to turn it ON** (it should highlight/change color).

**After enabling, you should see new buttons appear:**
- "Load unpacked"
- "Pack extension"
- "Update"

**⚠️ If you don't see "Load unpacked" button, Developer mode is NOT enabled!**

---

### 3. Click "Load unpacked"

**Click the "Load unpacked" button** that appeared after enabling Developer mode.

A **file picker window** should open.

---

### 4. Navigate to Extension Folder

In the file picker:

1. **Navigate to:** `C:\Users\danie\OneDrive\Desktop\Cursor Projects\Fountain-Macro-Assistant`

2. **Look for the folder:** `fountain-macro-assistant-extension`

3. **Click ONCE on the folder** to select it (don't double-click!)

4. **Click "Select Folder"** button (bottom right of file picker)

**⚠️ IMPORTANT:**
- Select the **FOLDER**, not a file inside it
- Don't select `manifest.json`
- Don't select `popup.html`
- Select the **folder itself**: `fountain-macro-assistant-extension`

---

### 5. Check Results

**After clicking "Select Folder":**

#### ✅ Success - Extension Appears:
- Extension appears in the list
- Shows "Fountain - Macro Assistant"
- Has an ON/OFF toggle
- No error messages

**Next steps:**
- Click puzzle piece icon (🧩) in Chrome toolbar
- Find "Fountain - Macro Assistant"
- Pin it to toolbar

#### ❌ Problem - Extension Doesn't Appear:

**Check for errors:**
1. Scroll through extensions list
2. Look for **red error text**
3. Click **"Errors"** button if visible
4. Read the error message

**Common errors:**
- "Manifest file is missing or unreadable" → Wrong folder selected
- "Could not load icon" → Icons missing (but we verified they exist)
- "Service worker registration failed" → background.js error

---

## Troubleshooting Specific Issues

### Issue: "Load unpacked" button doesn't appear

**Solution:**
- Make sure Developer mode toggle is ON (highlighted/blue)
- Refresh the page: `chrome://extensions/`
- Try a different Chrome window

### Issue: File picker closes immediately

**Solution:**
- You might have selected a file instead of folder
- Make sure to click the **folder**, not files inside it
- Try again, being very careful to select the folder

### Issue: "Manifest file is missing or unreadable"

**Solution:**
- You selected the wrong folder
- Make sure you select: `fountain-macro-assistant-extension`
- The folder should contain `manifest.json` directly inside it

### Issue: Extension appears but shows errors

**Solution:**
1. Click "Errors" button on the extension card
2. Read the error message
3. Common fixes:
   - Missing file → Check all files are present
   - Syntax error → Check manifest.json and JS files
   - Icon error → Verify icons folder exists

---

## Quick Test

**To verify your folder is correct:**

1. Open File Explorer
2. Navigate to: `C:\Users\danie\OneDrive\Desktop\Cursor Projects\Fountain-Macro-Assistant\fountain-macro-assistant-extension`
3. You should see:
   - `manifest.json` (file)
   - `popup.html` (file)
   - `content.js` (file)
   - `background.js` (file)
   - `icons` (folder)
4. Double-click `icons` folder
5. You should see: `icon16.png`, `icon48.png`, `icon128.png`

**If all these are present, your folder is correct!**

---

## Still Not Working?

**Please share:**
1. What happens when you click "Load unpacked"?
2. Does the file picker open?
3. What do you see after selecting the folder?
4. Any error messages? (Copy exact text)
5. Screenshot of Chrome extensions page

This will help me diagnose the exact issue!

