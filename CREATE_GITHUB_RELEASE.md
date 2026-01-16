# Create GitHub Release: "Updated fountain macro assistant."

## Step-by-Step Instructions

### Step 1: Prepare Release Files

The extension folder is already updated and ready:
- Location: `fountain-macro-assistant-extension/`
- Contains all latest fixes including expansion bug fix

### Step 2: Upload to GitHub Repository

**Option A: Using GitHub Website (Easiest)**

1. Go to your GitHub repository:
   - `https://github.com/YOUR_USERNAME/fountain-macro-assistant-extension`
   - Or create a new repository if it doesn't exist

2. If repository is empty or you want to update:
   - Click "uploading an existing file"
   - Drag and drop ALL files from `fountain-macro-assistant-extension/` folder
   - Make sure to include:
     - manifest.json
     - popup.html, popup.css, popup.js
     - content.js (with latest fix!)
     - background.js
     - options.html, options.css, options.js
     - icons/ folder (all icon files)
     - README.md
   - Commit message: "Updated fountain macro assistant - Fixed expansion bug"
   - Click "Commit changes"

**Option B: Using Git Command Line**

```powershell
cd "C:\Users\danie\OneDrive\Desktop\Cursor Projects\Fountain-Macro-Assistant\fountain-macro-assistant-extension"
git init
git add .
git commit -m "Updated fountain macro assistant - Fixed expansion bug"
git remote add origin https://github.com/YOUR_USERNAME/fountain-macro-assistant-extension.git
git push -u origin main
```

### Step 3: Create GitHub Release

1. Go to your repository on GitHub
2. Click on **"Releases"** (on the right sidebar, or go to `/releases`)
3. Click **"Create a new release"** or **"Draft a new release"**

4. Fill in the release form:
   - **Tag**: `v1.0.1` (or `v1.0.0` if first release)
   - **Release title**: `Updated fountain macro assistant.`
   - **Description**: 
     ```
     ## What's New
     
     - ✅ Fixed critical expansion bug - text now expands correctly when typing shortcuts
     - ✅ Improved expansion performance (synchronous expansion)
     - ✅ Better error handling
     - ✅ Updated website download links
     
     ## Installation
     
     1. Download this repository (clone or download ZIP)
     2. Extract if needed
     3. Open Chrome → `chrome://extensions/`
     4. Enable Developer mode
     5. Click "Load unpacked"
     6. Select the extension folder
     
     ## Files Included
     
     - manifest.json
     - All extension files (popup, content, background, options)
     - Icons folder
     - README.md
     ```

5. Click **"Publish release"**

### Step 4: Verify Release

- Your release will be available at:
  - `https://github.com/YOUR_USERNAME/fountain-macro-assistant-extension/releases/tag/v1.0.1`
- Users can download from the releases page

## Quick Release Command (If Using Git)

If you're using git, you can also create a release via command line:

```powershell
# Tag the release
git tag -a v1.0.1 -m "Updated fountain macro assistant - Fixed expansion bug"

# Push the tag
git push origin v1.0.1
```

Then go to GitHub and create the release from the tag, or use GitHub CLI:

```powershell
gh release create v1.0.1 --title "Updated fountain macro assistant." --notes "Fixed critical expansion bug and improved performance"
```

## Summary

- **Release Title**: "Updated fountain macro assistant."
- **Tag**: v1.0.1 (or v1.0.0)
- **Files**: All in `fountain-macro-assistant-extension/` folder
- **Status**: Ready to upload!






