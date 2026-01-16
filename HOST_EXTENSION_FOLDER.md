# Host Extension Folder (Non-ZIP)

## Option 1: GitHub (Recommended - Free)

### Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `fountain-macro-assistant-extension`
3. Make it **Public** (so anyone can download)
4. Don't initialize with README
5. Click "Create repository"

### Step 2: Upload Extension Folder

**Using GitHub Desktop:**
1. Download GitHub Desktop
2. File → Clone repository → Add → Create New Repository
3. Local path: Select your project folder
4. Drag the `fountain-macro-assistant-extension` folder into GitHub Desktop
5. Commit and push

**Using Command Line:**
```powershell
cd "C:\Users\danie\OneDrive\Desktop\Cursor Projects\Fountain-Macro-Assistant"
cd fountain-macro-assistant-extension
git init
git add .
git commit -m "Initial commit - Extension files"
git remote add origin https://github.com/YOUR_USERNAME/fountain-macro-assistant-extension.git
git push -u origin main
```

**Using GitHub Website:**
1. Go to your repository
2. Click "uploading an existing file"
3. Drag and drop all files from `fountain-macro-assistant-extension` folder
4. Commit

### Step 3: Get Download Link

**Option A: Direct Folder Download (GitHub)**
- URL: `https://github.com/YOUR_USERNAME/fountain-macro-assistant-extension`
- Users can click "Code" → "Download ZIP" (but they can also clone the folder)

**Option B: Release (Recommended)**
1. Go to repository → Releases → "Create a new release"
2. Tag: `v1.0.0`
3. Title: "Fountain - Macro Assistant v1.0.0"
4. Upload the extension folder files
5. Publish release
6. Users can download from releases page

---

## Option 2: Host on Your Website

### Create Download Page

Create a simple HTML page that provides direct file downloads:

1. Upload extension folder to your web server
2. Create download page with links to each file
3. Or use a file browser script

### Example: Simple File Hosting

Upload the `fountain-macro-assistant-extension` folder to your web server, then users can:
- Download individual files
- Or use a script to download the entire folder

---

## Option 3: Use File Hosting Services

### Dropbox/Google Drive/OneDrive

1. Upload `fountain-macro-assistant-extension` folder
2. Share the folder link
3. Users can download the folder directly

**Note:** Some services may ZIP it automatically, but users can extract and use the folder.

---

## Option 4: Create a Download Script

Create a simple script that downloads all files and recreates the folder structure.

---

## Recommended: GitHub Releases

This is the best option because:
- ✅ Free
- ✅ Public access
- ✅ Version control
- ✅ Easy updates
- ✅ Users can download folder or clone repository
- ✅ Professional

Would you like me to help you set up GitHub hosting?







