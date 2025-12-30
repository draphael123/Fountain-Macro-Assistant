# How to Share Your Fountain - Macro Assistant Extension

## Option 1: Share as ZIP File (Recommended for Testing)

### Step 1: Create a ZIP File

**On Windows:**
1. Right-click on the extension folder
2. Select "Send to" → "Compressed (zipped) folder"
3. A ZIP file will be created in the same location

**On Mac:**
1. Right-click on the extension folder
2. Select "Compress [folder name]"
3. A ZIP file will be created

**On Linux:**
```bash
zip -r fountain-app-test.zip "Textexpander App"/
```

### Step 2: Share the ZIP File

Send the ZIP file to the person via:
- Email
- Cloud storage (Google Drive, Dropbox, OneDrive)
- File sharing service
- USB drive

### Step 3: Recipient Instructions

Tell them to:
1. Extract the ZIP file
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked"
5. Select the extracted folder
6. Done! The extension is now installed

## Option 2: Share via GitHub (Best for Collaboration)

### Step 1: Create a GitHub Repository

1. Go to https://github.com
2. Click "New repository"
3. Name it (e.g., "fountain-app-test")
4. Don't initialize with README (you already have files)
5. Click "Create repository"

### Step 2: Upload Your Files

**Using GitHub Desktop:**
1. Download GitHub Desktop
2. Add the repository
3. Commit and push your files

**Using Command Line:**
```bash
cd "C:\Users\danie\OneDrive\Desktop\Cursor Projects\Textexpander App"
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/fountain-app-test.git
git push -u origin main
```

**Using GitHub Website:**
1. Go to your repository
2. Click "uploading an existing file"
3. Drag and drop all your files
4. Commit

### Step 3: Share the Repository Link

Share the GitHub link with others. They can:
1. Click "Code" → "Download ZIP"
2. Extract and load as unpacked extension

## Option 3: Publish to Chrome Web Store (For Public Distribution)

See `PUBLISHING_GUIDE.md` for complete instructions.

**Steps:**
1. Create a ZIP file (exclude README, .git, etc.)
2. Go to https://chrome.google.com/webstore/devconsole
3. Pay $5 one-time fee (if not already a developer)
4. Upload ZIP file
5. Fill in store listing
6. Submit for review

## What to Include in the ZIP

**Include:**
- manifest.json
- popup.html, popup.css, popup.js
- content.js
- options.html, options.css, options.js
- icons/ folder (with all icon files)

**Exclude (optional, but recommended):**
- README.md
- .git/ folder
- .gitignore
- Any documentation files (*.md)
- create-icons.html
- test-page.html
- generate-icons.js
- create-icons.ps1

## Quick Share Checklist

- [ ] Create ZIP file with only necessary files
- [ ] Test that the ZIP extracts correctly
- [ ] Verify icons folder is included
- [ ] Share ZIP file or GitHub link
- [ ] Provide installation instructions

## Installation Instructions to Share

Copy and paste these instructions for the recipient:

```
INSTALLATION INSTRUCTIONS:

1. Extract the ZIP file to a folder
2. Open Google Chrome
3. Go to chrome://extensions/
4. Enable "Developer mode" (toggle in top right)
5. Click "Load unpacked"
6. Select the extracted folder
7. The extension should now appear in your extensions list
8. Click the puzzle piece icon in Chrome toolbar
9. Find "Fountain - Macro Assistant" and pin it
10. Click the extension icon to start creating macros!

Note: Your macros will sync across devices if you're signed into Chrome.
```

## Troubleshooting for Recipients

**"Could not load icon" error:**
- Make sure the icons/ folder is included in the ZIP
- Verify icon16.png, icon48.png, and icon128.png exist

**"Manifest file missing or unreadable":**
- Make sure manifest.json is in the root of the extracted folder
- Don't extract into a nested folder

**Extension doesn't work:**
- Make sure they reload the extension after installing
- Check browser console (F12) for errors
- Verify macros are created in the popup

