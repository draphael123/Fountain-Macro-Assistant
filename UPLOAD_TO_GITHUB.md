# Upload Extension Folder to GitHub

## ✅ What's Done

1. ✅ Git repository initialized
2. ✅ All files staged
3. ✅ Commit created: "Updated fountain macro assistant - v1.0.1 - Fixed expansion bug"

## 📤 Next Steps to Push to GitHub

### Option 1: Create New Repository on GitHub (If it doesn't exist)

1. Go to: https://github.com/new
2. Repository name: `fountain-macro-assistant-extension`
3. Description: "Fountain - Macro Assistant Chrome Extension"
4. Make it **Public**
5. **Don't** initialize with README, .gitignore, or license
6. Click "Create repository"

### Option 2: Push to Existing Repository

Run these commands in PowerShell:

```powershell
cd "C:\Users\danie\OneDrive\Desktop\Cursor Projects\Fountain-Macro-Assistant\fountain-macro-assistant-extension"

# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/draphael123/fountain-macro-assistant-extension.git

# Rename branch to main
git branch -M main

# Push to GitHub (will prompt for credentials)
git push -u origin main
```

### Option 3: Using GitHub Desktop

1. Download GitHub Desktop: https://desktop.github.com/
2. File → Add Local Repository
3. Select: `fountain-macro-assistant-extension` folder
4. Click "Publish repository"
5. Choose repository name and make it public
6. Click "Publish repository"

### Option 4: Using GitHub Website Upload

1. Go to: https://github.com/new
2. Create repository: `fountain-macro-assistant-extension`
3. Click "uploading an existing file"
4. Drag and drop all files from `fountain-macro-assistant-extension/` folder
5. Commit message: "Updated fountain macro assistant - v1.0.1"
6. Click "Commit changes"

## 🔗 After Uploading

Your extension will be available at:
```
https://github.com/draphael123/fountain-macro-assistant-extension
```

Users can download it by:
- Cloning: `git clone https://github.com/draphael123/fountain-macro-assistant-extension.git`
- Downloading ZIP from the repository page

## 📝 Create Release

After pushing, create a release:

1. Go to your repository
2. Click "Releases" → "Create a new release"
3. Tag: `v1.0.1`
4. Title: `Updated fountain macro assistant.`
5. Description: See `CREATE_GITHUB_RELEASE.md`
6. Publish release






