# Fountain - Macro Assistant Chrome Extension

A Chrome extension that allows you to create text shortcuts (macros) that automatically expand into longer snippets. Type faster and more efficiently with custom text expansions.

**Note:** This extension works within Chrome browser on all websites. Chrome extensions cannot work in other desktop applications outside of the browser.

## Features

- ✨ Create, edit, and delete text expansion macros
- 🔍 Search through your macros
- ⚡ Automatic expansion on space, Enter, or punctuation
- 🔤 Case-sensitive option for shortcuts
- 💾 Sync macros across devices using Chrome sync storage
- 📤 Export/Import macros for backup
- 🎨 Clean and intuitive user interface

## Installation

### For Development

1. **Clone or download this repository**

2. **Create Extension Icons**
   - Create an `icons` folder in the root directory
   - Add three icon files:
     - `icon16.png` (16x16 pixels)
     - `icon48.png` (48x48 pixels)
     - `icon128.png` (128x128 pixels)
   - You can use any image editor or online tools to create these icons
   - Recommended: Use a simple text expansion icon or abbreviation like "FA"

3. **Load the Extension in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in the top right)
   - Click "Load unpacked"
   - Select the folder containing this extension
   - The extension should now appear in your extensions list

4. **Pin the Extension**
   - Click the puzzle piece icon in Chrome's toolbar
   - Find "Fountain - Macro Assistant" and click the pin icon to keep it accessible

## Usage

### Creating a Macro

1. Click the Fountain - Macro Assistant icon in your Chrome toolbar
2. Click "+ Add Macro"
3. Enter a shortcut (e.g., `/email`)
4. Enter the expansion text (e.g., `your.email@example.com`)
5. Optionally check "Case sensitive" if you want the shortcut to be case-sensitive
6. Click "Save"

### Using Macros

1. Navigate to any website with a text input field
2. Type your shortcut (e.g., `/email`)
3. The shortcut will automatically expand after you stop typing (if auto-expand is enabled)
4. Alternatively, press Space, Enter, or any punctuation mark to expand immediately

### Managing Macros

- **Edit**: Click on any macro in the list to edit it
- **Delete**: Open a macro for editing and click "Delete"
- **Search**: Use the search box to quickly find macros
- **Settings**: Right-click the extension icon and select "Options" to access settings

## Publishing to Chrome Web Store

### Prerequisites

1. **Chrome Web Store Developer Account**
   - Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
   - Pay the one-time $5 registration fee
   - Complete your developer account setup

2. **Prepare Your Extension**

   - Ensure all files are present and working
   - Test thoroughly on multiple websites
   - Create high-quality icons (see below)

### Icon Requirements

You need to create icons for the Chrome Web Store:

1. **Small Promo Tile**: 440x280 pixels (required for featured extensions)
2. **Marquee Promo Tile**: 920x680 pixels (optional, for featured extensions)
3. **Screenshots**: At least one, up to 5 screenshots
   - Minimum: 1280x800 or 640x400 pixels
   - Recommended: 1280x800 pixels
   - Formats: PNG or JPEG

### Step-by-Step Publishing Process

1. **Create a ZIP File**
   - Create a ZIP file containing all extension files EXCEPT:
     - `README.md`
     - `.git` folder (if present)
     - Any development files
   - Required files to include:
     - `manifest.json`
     - `popup.html`, `popup.css`, `popup.js`
     - `content.js`
     - `options.html`, `options.css`, `options.js`
     - `icons/` folder with all icon files

2. **Go to Chrome Web Store Developer Dashboard**
   - Visit: https://chrome.google.com/webstore/devconsole
   - Sign in with your Google account

3. **Create New Item**
   - Click "New Item"
   - Upload your ZIP file
   - Click "Upload"

4. **Fill in Store Listing**

   **Required Information:**
   - **Name**: Fountain - Macro Assistant (or your preferred name)
   - **Summary**: Brief one-line description (132 characters max)
     - Example: "Create text shortcuts that expand into longer snippets. Type faster with custom macros."
   - **Description**: Detailed description (up to 16,000 characters)
     - Include features, usage instructions, and benefits
   - **Category**: Choose "Productivity" or "Tools"
   - **Language**: Select your primary language
   - **Privacy Policy**: Required if you collect user data
     - Since this extension uses Chrome sync storage (user's own data), you may need a simple privacy policy
     - You can host it on GitHub Pages or create a simple page

   **Graphics:**
   - Upload at least one screenshot
   - Upload icons (16x16, 48x48, 128x128)
   - Optional: Promo tiles for featured placement

5. **Distribution**

   - **Visibility**: Choose "Public" (everyone) or "Unlisted" (only those with link)
   - **Regions**: Select where to publish (or "All regions")
   - **Pricing**: Free

6. **Privacy Practices**

   - **Single Purpose**: Yes (text expansion only)
   - **Host Permissions**: Explain why you need `<all_urls>`
     - Reason: "To enable text expansion on all websites where users type"
   - **User Data**: Declare if you collect any data
     - This extension only uses Chrome sync storage (user's own data, not sent to external servers)

7. **Submit for Review**

   - Review all information
   - Click "Submit for Review"
   - Review typically takes 1-3 business days
   - You'll receive email notifications about the status

### Privacy Policy Template

Since this extension uses Chrome sync storage, create a simple privacy policy:

```
Privacy Policy for Fountain - Macro Assistant Chrome Extension

Last Updated: [Date]

Data Collection:
This extension does not collect, transmit, or store any personal data on external servers. All macros and settings are stored locally in your browser using Chrome's sync storage, which is encrypted and synced across your devices through your Google account.

Permissions:
- Storage: Required to save your macros and settings
- Active Tab: Required to enable text expansion on web pages
- All URLs: Required to allow text expansion to work on any website you visit

We do not:
- Collect any personal information
- Track your browsing behavior
- Send data to external servers
- Use analytics or tracking tools

Contact:
If you have questions about this privacy policy, please contact [your email].
```

Host this on a simple webpage and link to it in the Chrome Web Store listing.

### After Publishing

1. **Monitor Reviews**: Respond to user feedback
2. **Update Regularly**: Fix bugs and add features
3. **Version Updates**: Update the version in `manifest.json` when releasing updates
4. **Resubmit**: Each update needs to go through review again

## File Structure

```
fountain-app-test-extension/
├── manifest.json          # Extension configuration
├── popup.html             # Main popup UI
├── popup.css              # Popup styles
├── popup.js               # Popup functionality
├── content.js             # Content script for text expansion
├── options.html           # Settings page
├── options.css            # Settings page styles
├── options.js             # Settings functionality
├── icons/                 # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md             # This file
```

## Development

### Testing

1. Load the extension in developer mode
2. Test on various websites:
   - Gmail
   - Google Docs
   - Text input fields
   - ContentEditable elements
3. Test edge cases:
   - Long expansions
   - Special characters
   - Case sensitivity
   - Multiple macros

### Debugging

- Use Chrome DevTools:
  - Right-click extension popup → Inspect
  - Check Console for errors
  - Use `chrome.storage.sync.get(null, console.log)` to view stored data

## Troubleshooting

**Macros not expanding?**
- Check that the extension is enabled
- Ensure you're typing in an editable field
- Try pressing Space or Enter after the shortcut
- Check if the shortcut has any special characters

**Macros not syncing?**
- Ensure Chrome sync is enabled in your browser settings
- Check your internet connection
- Verify you're signed into Chrome

## License

This project is open source and available for personal and commercial use.

## Support

For issues, questions, or contributions, please open an issue on the project repository.

