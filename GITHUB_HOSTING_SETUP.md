# Host Extension on GitHub (Non-ZIP Download)

## Quick Setup Guide

### Step 1: Prepare Extension Folder

Run this script to create a clean release folder:
```powershell
.\create-github-release.ps1
```

This creates: `fountain-macro-assistant-extension-release/` folder

### Step 2: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `fountain-macro-assistant-extension`
3. Description: "Fountain - Macro Assistant Chrome Extension"
4. Make it **Public**
5. **Don't** initialize with README, .gitignore, or license
6. Click "Create repository"

### Step 3: Upload Files

**Option A: Using GitHub Website (Easiest)**

1. Go to your new repository
2. Click "uploading an existing file"
3. Drag and drop ALL files from `fountain-macro-assistant-extension-release/` folder
4. Make sure to include:
   - manifest.json
   - popup.html, popup.css, popup.js
   - content.js
   - background.js
   - options.html, options.css, options.js
   - icons/ folder (drag the whole folder)
5. Scroll down, add commit message: "Initial release"
6. Click "Commit changes"

**Option B: Using GitHub Desktop**

1. Download GitHub Desktop: https://desktop.github.com/
2. File → Clone repository → Add → Create New Repository
3. Local path: Select `fountain-macro-assistant-extension-release` folder
4. Commit message: "Initial release"
5. Click "Commit to main"
6. Click "Publish repository"

**Option C: Using Command Line**

```powershell
cd "C:\Users\danie\OneDrive\Desktop\Cursor Projects\Fountain-Macro-Assistant\fountain-macro-assistant-extension-release"
git init
git add .
git commit -m "Initial release"
git remote add origin https://github.com/YOUR_USERNAME/fountain-macro-assistant-extension.git
git push -u origin main
```

### Step 4: Get Your Download Link

After uploading, your repository will be at:
```
https://github.com/YOUR_USERNAME/fountain-macro-assistant-extension
```

**Users can download in 3 ways:**

1. **Clone (Gets folder directly):**
   ```bash
   git clone https://github.com/YOUR_USERNAME/fountain-macro-assistant-extension.git
   ```

2. **Download ZIP (if they want):**
   - Click "Code" → "Download ZIP"
   - But they can also just clone to get the folder

3. **Download individual files:**
   - Click on any file
   - Click "Download" button
   - Download files one by one

### Step 5: Create a Release (Optional but Recommended)

1. Go to your repository
2. Click "Releases" → "Create a new release"
3. Tag: `v1.0.0`
4. Title: "Fountain - Macro Assistant v1.0.0"
5. Description: Add installation instructions
6. Click "Publish release"

Users can download from the releases page.

---

## Update Your Website

Update the download link on your website to point to GitHub:

```html
<a href="https://github.com/YOUR_USERNAME/fountain-macro-assistant-extension" 
   class="btn btn-secondary btn-large" 
   target="_blank" rel="noopener">
    Download from GitHub
</a>
```

---

## Benefits of GitHub Hosting

✅ **Free hosting**
✅ **Version control** - Easy to update
✅ **Public access** - Anyone can download
✅ **Multiple download options** - Clone, ZIP, or individual files
✅ **Professional** - Standard way to share code
✅ **No ZIP required** - Users can clone to get folder directly

---

## Quick Start Command

Run this to prepare and get started:

```powershell
.\create-github-release.ps1
```

Then follow the GitHub setup steps above!







