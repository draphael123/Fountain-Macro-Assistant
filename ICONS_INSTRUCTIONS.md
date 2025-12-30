# Creating Extension Icons

You need to create three icon files for the Chrome extension:

## Required Icons

1. **icon16.png** - 16x16 pixels
2. **icon48.png** - 48x48 pixels  
3. **icon128.png** - 128x128 pixels

## Quick Options

### Option 1: Online Icon Generators
1. Visit https://www.favicon-generator.org/ or https://realfavicongenerator.net/
2. Upload a high-resolution image (at least 128x128)
3. Download the generated icons
4. Rename and place them in the `icons/` folder

### Option 2: Design Tools
Use any image editor (Photoshop, GIMP, Canva, etc.):
1. Create a 128x128 pixel image
2. Design a simple icon (e.g., use the Fountain logo, or a text expansion symbol)
3. Export at 128x128, 48x48, and 16x16 sizes
4. Save as PNG files

### Option 3: Simple Text-Based Icon
Create a simple icon with:
- Background color: #4285f4 (blue)
- White text: "TE" or "T" or an abbreviation symbol
- Rounded corners for a modern look

### Option 4: Use Emoji/Unicode
You can use a text editor to create simple icons:
- Use a text expansion symbol like: ⚡, ⌨️, or 📝
- Convert to image using online tools

## Icon Design Tips

- Keep it simple and recognizable at small sizes
- Use high contrast colors
- Avoid fine details that won't show at 16x16
- Test how it looks at all three sizes
- Use the same design across all sizes (just scaled)

## Placement

Once created, place all three files in:
```
icons/
├── icon16.png
├── icon48.png
└── icon128.png
```

## Temporary Solution

If you want to test the extension immediately, you can:
1. Create a simple colored square image
2. Save it at 128x128, 48x48, and 16x16 sizes
3. Use these as placeholders until you create proper icons

