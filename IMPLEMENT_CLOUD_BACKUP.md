# How to Implement Cloud Backup

## Quick Implementation Guide

### Step 1: Add Google OAuth to Manifest

Add to `manifest.json`:
```json
{
  "permissions": [
    "identity",
    "storage",
    "alarms"
  ],
  "oauth2": {
    "client_id": "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com",
    "scopes": ["https://www.googleapis.com/auth/drive.file"]
  }
}
```

### Step 2: Get Google OAuth Client ID

1. Go to: https://console.cloud.google.com/
2. Create a new project (or use existing)
3. Enable "Google Drive API"
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Application type: "Chrome Extension"
6. Copy the Client ID

### Step 3: Add Backup UI to Options Page

Add to `options.html`:
```html
<div class="settings-section">
  <h3>Cloud Backup</h3>
  <p>Automatically backup your macros to Google Drive</p>
  
  <button id="enableBackupBtn" class="btn btn-primary">Enable Google Drive Backup</button>
  <button id="manualBackupBtn" class="btn btn-secondary">Backup Now</button>
  <button id="restoreBackupBtn" class="btn btn-secondary">Restore from Backup</button>
  
  <div id="backupStatus"></div>
</div>
```

### Step 4: Add Backup Functions to Options.js

```javascript
// Import cloud backup
const cloudBackup = new CloudBackup();

// Enable backup
document.getElementById('enableBackupBtn').addEventListener('click', async () => {
  try {
    await cloudBackup.initGoogleAuth();
    await cloudBackup.enableAutoBackup(24); // Backup every 24 hours
    showStatus('Backup enabled! Your macros will be automatically backed up.');
  } catch (error) {
    showStatus('Failed to enable backup: ' + error.message, 'error');
  }
});

// Manual backup
document.getElementById('manualBackupBtn').addEventListener('click', async () => {
  const result = await cloudBackup.manualBackup();
  showStatus(result.message, result.success ? 'success' : 'error');
});

// Restore
document.getElementById('restoreBackupBtn').addEventListener('click', async () => {
  if (confirm('This will replace your current macros with the backup. Continue?')) {
    try {
      await cloudBackup.restoreFromGoogleDrive();
      showStatus('Macros restored successfully!');
      location.reload();
    } catch (error) {
      showStatus('Restore failed: ' + error.message, 'error');
    }
  }
});
```

### Step 5: Add Uninstall Detection

Add to `background.js`:
```javascript
// Set uninstall URL to prompt backup
chrome.runtime.setUninstallURL('https://fountain-macro-assistant.vercel.app/uninstall-backup.html');

// Or listen for suspend (extension being disabled)
chrome.runtime.onSuspend.addListener(() => {
  // Try to backup before uninstalling
  cloudBackup.backupToGoogleDrive().catch(console.error);
});
```

## Alternative: Simple Backend API

If you prefer a custom backend:

1. Create API endpoint on your website
2. Store backups in database
3. Use user authentication from your website
4. Simpler than Google OAuth but requires server

## Benefits

✅ **Data Safety**: Macros saved even if extension uninstalled
✅ **Cross-Device**: Access backups from any device
✅ **Automatic**: Set it and forget it
✅ **Version History**: Multiple backup files
✅ **Easy Restore**: One-click restore

## Privacy

- Backups stored in user's own Google Drive
- No data sent to third parties
- User controls when to backup/restore
- Can disable at any time








