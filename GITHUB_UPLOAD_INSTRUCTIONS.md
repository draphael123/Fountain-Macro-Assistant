# Upload Extension to GitHub - Step by Step

## ✅ What's Already Done

- ✅ Git repository initialized in `fountain-macro-assistant-extension/`
- ✅ All files committed
- ✅ Remote configured
- ✅ Branch renamed to `main`

## 📋 Next Steps

### Step 1: Create GitHub Repository

The repository `fountain-macro-assistant-extension` doesn't exist yet. Create it:

**Option A: Create New Repository (Recommended)**

1. Go to: https://github.com/new
2. **Repository name**: `fountain-macro-assistant-extension`
3. **Description**: "Fountain - Macro Assistant Chrome Extension - Text expansion with macros, aliases, and conditional expansions"
4. **Visibility**: Public ✅
5. **Important**: 
   - ❌ Do NOT check "Add a README file"
   - ❌ Do NOT check "Add .gitignore"
   - ❌ Do NOT check "Choose a license"
6. Click **"Create repository"**

**Option B: Use Main Repository**

If you want to add it to the existing main repository:
- Repository: `https://github.com/draphael123/Fountain-Macro-Assistant`
- You'll need to create a subfolder or upload to a specific branch

### Step 2: Push to GitHub

After creating the repository, run:

```powershell
cd "C:\Users\danie\OneDrive\Desktop\Cursor Projects\Fountain-Macro-Assistant\fountain-macro-assistant-extension"
git push -u origin main
```

**If prompted for credentials:**
- Username: Your GitHub username
- Password: Use a **Personal Access Token** (not your password)
  - Create one at: https://github.com/settings/tokens
  - Select scope: `repo`

### Step 3: Alternative - Use GitHub Website

If git push doesn't work, use the website:

1. Go to your new repository on GitHub
2. Click **"uploading an existing file"**
3. Drag and drop ALL files from `fountain-macro-assistant-extension/` folder:
   - manifest.json
   - popup.html, popup.css, popup.js
   - content.js
   - background.js
   - options.html, options.css, options.js
   - icons/ folder (all icon files)
   - README.md
4. Commit message: "Updated fountain macro assistant - v1.0.1 - Fixed expansion bug"
5. Click **"Commit changes"**

### Step 4: Create Release

After uploading:

1. Go to your repository
2. Click **"Releases"** → **"Create a new release"**
3. **Tag**: `v1.0.1`
4. **Title**: `Updated fountain macro assistant.`
5. **Description**: 
   ```
   ## What's New
   
   - ✅ Fixed critical expansion bug - text now expands correctly
   - ✅ Improved expansion performance
   - ✅ Better error handling
   
   ## Installation
   
   1. Download this repository (clone or download ZIP)
   2. Extract if needed
   3. Open Chrome → chrome://extensions/
   4. Enable Developer mode
   5. Click "Load unpacked"
   6. Select the extension folder
   ```
6. Click **"Publish release"**

## 🔗 After Upload

Your extension will be available at:
```
https://github.com/draphael123/fountain-macro-assistant-extension
```

Download link:
```
https://github.com/draphael123/fountain-macro-assistant-extension/archive/refs/heads/main.zip
```

## 📝 Quick Command Summary

```powershell
# Navigate to extension folder
cd "C:\Users\danie\OneDrive\Desktop\Cursor Projects\Fountain-Macro-Assistant\fountain-macro-assistant-extension"

# Push to GitHub (after creating repository)
git push -u origin main
```

