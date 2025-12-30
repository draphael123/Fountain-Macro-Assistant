# Debugging Guide - Fountain - Macro Assistant

If macros aren't expanding, follow these steps to diagnose the issue:

## Step 1: Check if Extension is Loaded

1. Go to `chrome://extensions/`
2. Make sure "Fountain - Macro Assistant" is enabled
3. Click "Reload" if needed

## Step 2: Check Console for Errors

1. Open any webpage (like Google.com)
2. Press F12 to open Developer Tools
3. Go to the "Console" tab
4. Look for messages starting with "Fountain - Macro Assistant:"
5. You should see: "Fountain - Macro Assistant: Loaded X macros"

## Step 3: Verify Macros Exist

1. Click the extension icon
2. Make sure you have at least one macro created
3. Note the shortcut (e.g., `/email`)

## Step 4: Test Expansion

### Method 1: Space/Enter Trigger (Most Reliable)
1. Go to any text input field (like Google search)
2. Type your shortcut (e.g., `/email`)
3. Press **Space** or **Enter**
4. It should expand immediately

### Method 2: Auto-Expand (If Enabled)
1. Make sure "Auto-expand as you type" is enabled in settings
2. Type your shortcut (e.g., `/email`)
3. Wait 500ms-1 second after you stop typing
4. It should expand automatically

## Step 5: Check Console Logs

When you type a macro, you should see in the console:
- "Fountain - Macro Assistant: Expanding [shortcut] → [expansion]"

If you see "Fountain - Macro Assistant: No macros loaded", the macros aren't loading properly.

## Common Issues

### Issue: "No macros loaded"
**Solution:** 
- Make sure you've created at least one macro
- Reload the extension
- Check if macros appear in the popup

### Issue: Nothing happens when typing
**Solution:**
- Try pressing Space or Enter after typing the shortcut
- Check the console for error messages
- Make sure you're typing in a regular text input (not a password field with special handling)

### Issue: Expansion happens but then disappears
**Solution:**
- Some websites have aggressive input handlers
- Try on a simpler page like Google.com search box
- The extension works best on standard HTML inputs

## Quick Test

1. Create a test macro:
   - Shortcut: `test`
   - Expansion: `This is a test!`

2. Go to Google.com
3. Click the search box
4. Type: `test` then press **Space**
5. Should expand to: `This is a test! `

If this works, your extension is functioning correctly!

