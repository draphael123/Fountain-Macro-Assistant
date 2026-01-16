# Quick Icon Update Guide

## To Update Icons with Your Fountain Logo

Since you have the Fountain logo image, here's the fastest way to update the extension icons:

### Option 1: Online Icon Generator (Recommended - 2 minutes)

1. **Go to:** https://www.favicon-generator.org/ or https://realfavicongenerator.net/
2. **Upload your Fountain logo image**
3. **Download the generated icons:**
   - Look for 16x16, 48x48, and 128x128 sizes
   - Or download the "Chrome Extension" package
4. **Rename and place files:**
   - Save as `icon16.png` → place in `icons/icon16.png`
   - Save as `icon48.png` → place in `icons/icon48.png`
   - Save as `icon128.png` → place in `icons/icon128.png`
5. **Also copy to:** `vercel-landing/extension/icons/`
6. **Re-create ZIP:**
   ```powershell
   cd vercel-landing\extension
   Compress-Archive -Path * -DestinationPath "..\extension.zip" -Force
   ```

### Option 2: Image Editor (Photoshop, GIMP, Canva)

1. **Open your Fountain logo** in the editor
2. **Resize to each size:**
   - 16x16 pixels → Export as `icon16.png`
   - 48x48 pixels → Export as `icon48.png`
   - 128x128 pixels → Export as `icon128.png`
3. **Save as PNG** with transparent background (if logo has transparency)
4. **Place files in `icons/` folder**
5. **Copy to `vercel-landing/extension/icons/`**
6. **Re-create ZIP** (see Option 1, step 6)

### Option 3: Use the Icon Generator Tool

1. **Open `create-fountain-icons.html`** in your browser
2. **Click "Generate Icons"** to preview
3. **Click "Download All Icons"** to save
4. **Replace files** in `icons/` and `vercel-landing/extension/icons/`
5. **Re-create ZIP**

## After Updating Icons

1. ✅ Icons are in `icons/` folder
2. ✅ Icons are in `vercel-landing/extension/icons/` folder
3. ✅ Extension ZIP is updated
4. ✅ Website is deployed

## Test the New Icons

1. Go to `chrome://extensions/`
2. Reload the extension
3. You should see the new Fountain logo icon! 🎨

## Current Status

✅ **Website:** Deployed with latest changes
✅ **Extension ZIP:** Updated with latest files
⏳ **Icons:** Ready for your Fountain logo files

Once you add the icon files, everything will be complete!







