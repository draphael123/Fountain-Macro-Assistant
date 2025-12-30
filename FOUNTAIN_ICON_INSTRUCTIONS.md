# Adding the Fountain Logo to Your Extension

## Step 1: Prepare the Fountain Logo

You have the Fountain logo image. You need to create three icon sizes from it:

1. **icon16.png** - 16x16 pixels
2. **icon48.png** - 48x48 pixels  
3. **icon128.png** - 128x128 pixels

## Step 2: Create Icons from Logo

### Option A: Using Image Editor (Recommended)

1. Open the Fountain logo in an image editor (Photoshop, GIMP, Canva, etc.)
2. Resize to each required size:
   - 16x16 pixels → Save as `icon16.png`
   - 48x48 pixels → Save as `icon48.png`
   - 128x128 pixels → Save as `icon128.png`
3. Make sure to maintain aspect ratio and quality
4. Save as PNG format

### Option B: Using Online Tools

1. Go to https://www.favicon-generator.org/ or https://realfavicongenerator.net/
2. Upload your Fountain logo
3. Download the generated icons
4. Rename them to:
   - `icon16.png`
   - `icon48.png`
   - `icon128.png`

### Option C: Using Command Line (ImageMagick)

If you have ImageMagick installed:

```bash
# Resize to 16x16
magick fountain-logo.png -resize 16x16 icons/icon16.png

# Resize to 48x48
magick fountain-logo.png -resize 48x48 icons/icon48.png

# Resize to 128x128
magick fountain-logo.png -resize 128x128 icons/icon128.png
```

## Step 3: Place Icons in Extension

1. Make sure you have an `icons/` folder in your extension directory
2. Copy all three icon files to the `icons/` folder:
   ```
   icons/
   ├── icon16.png
   ├── icon48.png
   └── icon128.png
   ```

## Step 4: Verify

1. Go to `chrome://extensions/`
2. Reload the extension
3. The Fountain logo should now appear as the extension icon!

## Tips

- **Maintain Quality**: When resizing, use high-quality source image
- **Test Visibility**: Check that the logo is recognizable at 16x16 size
- **Background**: If logo has transparency, it will work well
- **Colors**: The Fountain logo's blue/teal colors should display nicely

## Current Icon Files

If you need to replace existing icons:
1. Delete the old icon files in `icons/` folder
2. Add your new Fountain logo icons
3. Reload the extension

The extension is now configured to use "Fountain - Macro Assistant" as the name and will display your Fountain logo once you add the icon files!

