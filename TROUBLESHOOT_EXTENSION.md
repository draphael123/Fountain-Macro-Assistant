# Troubleshooting: Extension Not Expanding Text

## Quick Checks

### 1. Verify Extension is Loaded
1. Open Chrome Extensions: `chrome://extensions/`
2. Find "Fountain - Macro Assistant"
3. Make sure it's **enabled** (toggle is ON)
4. Check for any error messages (red text)

### 2. Check if Macros Exist
1. Click the extension icon in Chrome toolbar
2. You should see your macros listed
3. If the list is empty, **create a test macro**:
   - Click "+ Add Macro"
   - Shortcut: `/test`
   - Expansion: `This is a test expansion`
   - Click "Save"

### 3. Test on a Simple Page
1. Open a new tab
2. Go to a simple page like: `https://www.google.com`
3. Click in the search box
4. Type: `/test` (or your shortcut)
5. Press **Space** or **Enter**
6. It should expand

### 4. Check Browser Console for Errors
1. Press `F12` to open Developer Tools
2. Go to the **Console** tab
3. Look for messages starting with "Fountain - Macro Assistant:"
4. You should see:
   - "Extension initialized and ready"
   - "Loaded X macros"
   - When typing: "Trigger key pressed" or "Expanding"

### 5. Verify Content Script is Running
1. Open Developer Tools (F12)
2. Go to **Console** tab
3. Type: `chrome.runtime.sendMessage({action: 'ping'})`
4. Or check if macros are loaded:
   ```javascript
   chrome.storage.sync.get(['macros'], (result) => {
     console.log('Macros:', result.macros);
   });
   ```

## Common Issues & Fixes

### Issue: "No macros loaded" in console
**Fix:**
1. Open extension popup
2. Create at least one macro
3. Reload the page (F5)
4. Try again

### Issue: Extension icon is grayed out or missing
**Fix:**
1. Go to `chrome://extensions/`
2. Find the extension
3. Click the refresh icon (↻) to reload
4. If still not working, remove and re-add the extension

### Issue: Works on some sites but not others
**Possible causes:**
- Some sites use special input methods (React, Vue, etc.)
- Content Security Policy blocking scripts
- Iframe isolation

**Fix:**
1. Try on a simple site first (Google, Wikipedia)
2. Check console for errors
3. Some sites may require page reload after installing extension

### Issue: Expansion happens but text disappears
**Fix:**
1. Check if you have multiple macros with similar shortcuts
2. Make sure expansion text is not empty
3. Check console for errors during expansion

### Issue: Expansion happens but wrong text appears
**Fix:**
1. Check macro settings in popup
2. Verify the expansion text is correct
3. Check if conditional expansions are interfering

## Debug Mode

### Enable Detailed Logging
1. Open Developer Tools (F12)
2. Go to Console
3. The extension already logs important events:
   - "Extension initialized and ready"
   - "Loaded X macros"
   - "Trigger key pressed: [key]"
   - "Expanding [shortcut] → [expansion]"

### Test Expansion Manually
Open console and run:
```javascript
// Check if macros are loaded
chrome.storage.sync.get(['macros'], (result) => {
  console.log('Macros:', result.macros);
  
  // Test expansion logic
  const testText = '/test';
  const macros = result.macros || [];
  const macro = macros.find(m => m.shortcut === '/test');
  if (macro) {
    console.log('Found macro:', macro);
    console.log('Expansion:', macro.expansion);
  } else {
    console.log('No macro found for /test');
  }
});
```

## Step-by-Step Test

1. **Create a test macro:**
   - Open extension popup
   - Click "+ Add Macro"
   - Shortcut: `/hello`
   - Expansion: `Hello, World!`
   - Click "Save"

2. **Test on Google:**
   - Go to google.com
   - Click search box
   - Type: `/hello`
   - Press **Space**
   - Should expand to "Hello, World!"

3. **If it doesn't work:**
   - Open Console (F12)
   - Look for error messages
   - Check if you see "Fountain - Macro Assistant:" messages
   - Share the console output

## Still Not Working?

1. **Reload the extension:**
   - Go to `chrome://extensions/`
   - Click refresh icon (↻) on the extension

2. **Reload the page:**
   - Press F5 to reload the page
   - Try again

3. **Remove and re-add:**
   - Remove extension from `chrome://extensions/`
   - Re-add it using "Load unpacked"
   - Create macros again
   - Test

4. **Check manifest permissions:**
   - Make sure `manifest.json` has `<all_urls>` permission
   - Content script should match `<all_urls>`

## Report Issue

If nothing works, provide:
1. Browser version (Chrome version)
2. Extension version
3. Console error messages (F12 → Console)
4. Steps to reproduce
5. Which website you're testing on






