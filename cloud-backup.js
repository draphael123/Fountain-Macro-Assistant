// Cloud Backup functionality for Fountain - Macro Assistant
// Provides backup to Google Drive and restore capabilities

class CloudBackup {
  constructor() {
    this.backupFileName = 'fountain-macro-assistant-backup.json';
    this.googleDriveScope = 'https://www.googleapis.com/auth/drive.file';
    this.clientId = null; // Set your Google OAuth Client ID
    this.accessToken = null;
    this.autoBackupEnabled = false;
    this.lastBackupTime = null;
  }

  // Initialize Google OAuth
  async initGoogleAuth() {
    return new Promise((resolve, reject) => {
      chrome.identity.getAuthToken(
        { interactive: true },
        (token) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
            return;
          }
          this.accessToken = token;
          resolve(token);
        }
      );
    });
  }

  // Create backup data
  async createBackupData() {
    const result = await chrome.storage.sync.get(['macros', 'folders', 'macroStats', 'settings']);
    return {
      version: '1.0.1',
      timestamp: new Date().toISOString(),
      macros: result.macros || [],
      folders: result.folders || [],
      macroStats: result.macroStats || {},
      settings: result.settings || {}
    };
  }

  // Backup to Google Drive
  async backupToGoogleDrive() {
    try {
      if (!this.accessToken) {
        await this.initGoogleAuth();
      }

      const backupData = await this.createBackupData();
      const fileName = `fountain-macro-backup-${new Date().toISOString().split('T')[0]}.json`;
      
      // Create file metadata
      const metadata = {
        name: fileName,
        mimeType: 'application/json',
        parents: [] // Root folder, or specify folder ID
      };

      // Convert data to blob
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const formData = new FormData();
      formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      formData.append('file', blob);

      // Upload to Google Drive
      const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Backup failed: ${response.statusText}`);
      }

      const file = await response.json();
      this.lastBackupTime = new Date().toISOString();
      
      // Save backup info
      await chrome.storage.local.set({
        lastBackupTime: this.lastBackupTime,
        lastBackupFileId: file.id
      });

      return { success: true, fileId: file.id, fileName };
    } catch (error) {
      console.error('Cloud backup error:', error);
      throw error;
    }
  }

  // Restore from Google Drive
  async restoreFromGoogleDrive(fileId = null) {
    try {
      if (!this.accessToken) {
        await this.initGoogleAuth();
      }

      // If no fileId provided, get the latest backup
      if (!fileId) {
        const stored = await chrome.storage.local.get(['lastBackupFileId']);
        fileId = stored.lastBackupFileId;
      }

      if (!fileId) {
        throw new Error('No backup file found');
      }

      // Download file from Google Drive
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Restore failed: ${response.statusText}`);
      }

      const backupData = await response.json();

      // Restore to Chrome storage
      if (backupData.macros) {
        await chrome.storage.sync.set({ macros: backupData.macros });
      }
      if (backupData.folders) {
        await chrome.storage.sync.set({ folders: backupData.folders });
      }
      if (backupData.macroStats) {
        await chrome.storage.sync.set({ macroStats: backupData.macroStats });
      }
      if (backupData.settings) {
        await chrome.storage.sync.set({ settings: backupData.settings });
      }

      return { success: true, restored: backupData };
    } catch (error) {
      console.error('Cloud restore error:', error);
      throw error;
    }
  }

  // List backup files from Google Drive
  async listBackups() {
    try {
      if (!this.accessToken) {
        await this.initGoogleAuth();
      }

      const response = await fetch(
        'https://www.googleapis.com/drive/v3/files?q=name contains "fountain-macro-backup"&orderBy=createdTime desc',
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to list backups: ${response.statusText}`);
      }

      const data = await response.json();
      return data.files || [];
    } catch (error) {
      console.error('List backups error:', error);
      throw error;
    }
  }

  // Enable automatic backup
  async enableAutoBackup(intervalHours = 24) {
    this.autoBackupEnabled = true;
    await chrome.storage.local.set({
      autoBackupEnabled: true,
      autoBackupInterval: intervalHours
    });

    // Schedule periodic backup
    this.scheduleBackup(intervalHours);
  }

  // Schedule periodic backup
  scheduleBackup(intervalHours) {
    chrome.alarms.create('autoBackup', {
      delayInMinutes: intervalHours * 60,
      periodInMinutes: intervalHours * 60
    });
  }

  // Manual backup (called from UI)
  async manualBackup() {
    try {
      const result = await this.backupToGoogleDrive();
      return { success: true, message: `Backup successful! Saved as ${result.fileName}` };
    } catch (error) {
      return { success: false, message: `Backup failed: ${error.message}` };
    }
  }
}

// Initialize cloud backup
const cloudBackup = new CloudBackup();

// Listen for auto-backup alarm
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'autoBackup') {
    cloudBackup.backupToGoogleDrive().catch(console.error);
  }
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CloudBackup;
}






