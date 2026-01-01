# Screenshots Directory

This directory contains screenshots for the landing page.

## Required Screenshots

### Usage Screenshots (Required for "See It In Action" Section)

1. **usage-1-popup.png** - Screenshot of the extension popup showing the macro list
2. **usage-2-creating-macro.png** - Screenshot of the "Add Macro" modal
3. **usage-3-text-expansion.png** - Screenshot showing text expansion in action (before/after)
4. **usage-4-settings.png** - Screenshot of the options/settings page

### Installation Screenshots (Optional)

1. **install-1-download.png** - Screenshot showing the GitHub releases page with the download
2. **install-2-extensions-page.png** - Screenshot of Chrome's `chrome://extensions/` page
3. **install-3-developer-mode.png** - Screenshot showing the Developer mode toggle enabled
4. **install-4-load-unpacked.png** - Screenshot showing the "Load unpacked" button
5. **install-5-select-folder.png** - Screenshot of the file picker selecting the extension folder
6. **install-6-pin-extension.png** - Screenshot showing how to pin the extension to the toolbar

## Quick Start: Taking Screenshots

**Easiest way:** Run the helper script from the project root:
```powershell
.\create-screenshots-guide.ps1
```

This will guide you through taking all 4 required screenshots step-by-step.

**Or follow the detailed guide:** See `TAKE_SCREENSHOTS.md` in this folder for complete instructions.

## Screenshot Guidelines

### Size Recommendations
- **Usage screenshots**: 1280x800px or larger (16:10 aspect ratio recommended)
- **Format**: PNG or JPEG
- **File size**: Optimize to under 500KB each if possible
- **Quality**: High resolution, clear and readable text

### Quick Instructions

1. **usage-1-popup.png**: 
   - Open extension popup
   - Show macro list with 3-5 example macros
   - Include search bar and "+ Add Macro" button

2. **usage-2-creating-macro.png**: 
   - Show "Add Macro" modal
   - Fill in example data (shortcut: /email, expansion: your.email@example.com)
   - Make form fields clearly visible

3. **usage-3-text-expansion.png**: 
   - Show text expansion in action
   - Type a shortcut and show it expanding
   - Or show before/after comparison

4. **usage-4-settings.png**: 
   - Show options/settings page
   - Include export/import buttons
   - Show settings options

### Tools for Taking Screenshots

- **Windows**: `Windows + Shift + S` (Snipping Tool)
- **Mac**: `Cmd + Shift + 4`
- **Browser Extensions**: Awesome Screenshot, Nimbus Screenshot, Lightshot

### Adding Screenshots

1. Take screenshots following the guidelines above
2. Name them exactly as listed (case-sensitive)
3. Place them in this `screenshots/` directory
4. The website will automatically display them

## Notes

- If screenshots are missing, the website shows placeholder boxes with instructions
- Once you add the actual screenshots, they automatically appear
- Screenshots should be clear, professional, and show the extension in action
- See `TAKE_SCREENSHOTS.md` for detailed step-by-step instructions
