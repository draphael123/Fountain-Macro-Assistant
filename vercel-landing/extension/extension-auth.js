// Extension Authentication - Links to website account
// Allows users to log in through the extension and sync macros to cloud

class ExtensionAuth {
  constructor() {
    this.apiBase = 'https://fountain-macro-assistant.vercel.app/api';
    this.currentUser = null;
    this.authToken = null;
  }

  // Check if user is logged in
  async checkAuth() {
    const result = await chrome.storage.local.get(['authToken', 'currentUser']);
    if (result.authToken && result.currentUser) {
      this.authToken = result.authToken;
      this.currentUser = result.currentUser;
      return true;
    }
    return false;
  }

  // Login with email and password
  async login(email, password) {
    try {
      // For now, we'll use the website's auth system
      // In production, create a proper API endpoint
      const response = await fetch(`${this.apiBase}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        const data = await response.json();
        this.authToken = data.token;
        this.currentUser = data.user;
        
        // Save to extension storage
        await chrome.storage.local.set({
          authToken: this.authToken,
          currentUser: this.currentUser
        });

        return { success: true, user: this.currentUser };
      } else {
        const error = await response.json();
        return { success: false, error: error.message || 'Login failed' };
      }
    } catch (error) {
      // Fallback: Use website's localStorage (for demo)
      // In production, use proper API
      return await this.loginViaWebsite(email, password);
    }
  }

  // Login via website (fallback method)
  async loginViaWebsite(email, password) {
    // Open website login page in a tab
    const loginUrl = `https://fountain-macro-assistant.vercel.app/login.html?extension=true&email=${encodeURIComponent(email)}`;
    chrome.tabs.create({ url: loginUrl });
    
    // Listen for auth message from website
    return new Promise((resolve) => {
      chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === 'AUTH_SUCCESS') {
          this.authToken = message.token;
          this.currentUser = message.user;
          chrome.storage.local.set({
            authToken: this.authToken,
            currentUser: this.currentUser
          });
          resolve({ success: true, user: this.currentUser });
        }
      });
    });
  }

  // Logout
  async logout() {
    this.authToken = null;
    this.currentUser = null;
    await chrome.storage.local.remove(['authToken', 'currentUser']);
    return { success: true };
  }

  // Backup macros to cloud (using website localStorage)
  async backupMacros() {
    if (!await this.checkAuth()) {
      return { success: false, error: 'Not logged in' };
    }

    try {
      const result = await chrome.storage.sync.get(['macros', 'folders', 'macroStats', 'settings']);
      const backupData = {
        userId: this.currentUser.id,
        macros: result.macros || [],
        folders: result.folders || [],
        macroStats: result.macroStats || {},
        settings: result.settings || {},
        timestamp: new Date().toISOString(),
        version: '1.0.1'
      };

      // Store backup in extension's local storage first
      await chrome.storage.local.set({
        [`backup_${this.currentUser.id}`]: backupData,
        lastBackupTime: new Date().toISOString()
      });

      // Sync to website via sync page
      try {
        // Open website in background to sync backup
        chrome.tabs.create({
          url: `https://fountain-macro-assistant.vercel.app/sync-backup.html?userId=${encodeURIComponent(this.currentUser.id)}&data=${encodeURIComponent(JSON.stringify(backupData))}`,
          active: false
        }, (tab) => {
          // Store last sync time
          chrome.storage.local.set({
            lastSyncTime: new Date().toISOString(),
            syncStatus: 'synced'
          });
        });
      } catch (apiError) {
        console.log('Sync backup failed, using local storage only:', apiError);
        chrome.storage.local.set({ syncStatus: 'error' });
      }

      return { success: true, backupId: this.currentUser.id };
    } catch (error) {
      console.error('Backup error:', error);
      return { success: false, error: error.message || 'Backup failed' };
    }
  }

  // Restore macros from cloud (using website localStorage)
  async restoreMacros() {
    if (!await this.checkAuth()) {
      return { success: false, error: 'Not logged in' };
    }

    try {
      // First, try to get backup from extension's local storage
      const localBackup = await chrome.storage.local.get([`backup_${this.currentUser.id}`]);
      if (localBackup[`backup_${this.currentUser.id}`]) {
        const backupData = localBackup[`backup_${this.currentUser.id}`];
        
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

        return { success: true, restored: backupData, source: 'local' };
      }

      // If no local backup, open website to sync from website's localStorage
      return new Promise((resolve) => {
        // Set up message listener first
        const listener = (message, sender, sendResponse) => {
          if (message.type === 'RESTORE_SUCCESS' && message.userId === this.currentUser.id) {
            chrome.runtime.onMessage.removeListener(listener);
            
            // Restore to Chrome storage
            const restorePromises = [];
            if (message.backup.macros) {
              restorePromises.push(chrome.storage.sync.set({ macros: message.backup.macros }));
            }
            if (message.backup.folders) {
              restorePromises.push(chrome.storage.sync.set({ folders: message.backup.folders }));
            }
            if (message.backup.macroStats) {
              restorePromises.push(chrome.storage.sync.set({ macroStats: message.backup.macroStats }));
            }
            if (message.backup.settings) {
              restorePromises.push(chrome.storage.sync.set({ settings: message.backup.settings }));
            }

            Promise.all(restorePromises).then(() => {
              chrome.storage.local.set({
                lastSyncTime: new Date().toISOString(),
                syncStatus: 'synced'
              });
              resolve({ success: true, restored: message.backup, source: 'website' });
            });
            return true;
          } else if (message.type === 'RESTORE_FAILED' && message.userId === this.currentUser.id) {
            chrome.runtime.onMessage.removeListener(listener);
            resolve({ success: false, error: message.error || 'Restore failed' });
            return true;
          }
        };

        chrome.runtime.onMessage.addListener(listener);

        // Open sync restore page
        chrome.tabs.create({
          url: `https://fountain-macro-assistant.vercel.app/sync-restore.html?userId=${encodeURIComponent(this.currentUser.id)}`,
          active: true
        });

        // Timeout after 10 seconds
        setTimeout(() => {
          chrome.runtime.onMessage.removeListener(listener);
          resolve({ success: false, error: 'Restore timeout - please try again' });
        }, 10000);
      });
    } catch (error) {
      console.error('Restore error:', error);
      return { success: false, error: error.message || 'Restore failed' };
    }
  }

  // Auto-backup on changes (if enabled)
  async autoBackup() {
    const settings = await chrome.storage.local.get(['autoBackupEnabled']);
    if (settings.autoBackupEnabled && await this.checkAuth()) {
      await this.backupMacros();
    }
  }
}

// Export for use in other scripts
if (typeof window !== 'undefined') {
  window.ExtensionAuth = ExtensionAuth;
}

// Initialize extension auth
const extensionAuth = new ExtensionAuth();

