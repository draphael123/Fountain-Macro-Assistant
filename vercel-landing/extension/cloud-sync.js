// Cloud Sync Module for Fountain Macro Assistant
// Syncs macros to Upstash Redis via API

const CloudSync = {
  API_BASE: 'https://fountain-macro-assistant.vercel.app/api',
  
  // Storage keys
  TOKEN_KEY: 'fountain_auth_token',
  USER_KEY: 'fountain_user',
  SYNC_ENABLED_KEY: 'fountain_sync_enabled',
  LAST_SYNC_KEY: 'fountain_last_sync',

  // Get stored token
  async getToken() {
    const result = await chrome.storage.local.get(this.TOKEN_KEY);
    return result[this.TOKEN_KEY] || null;
  },

  // Get stored user
  async getUser() {
    const result = await chrome.storage.local.get(this.USER_KEY);
    return result[this.USER_KEY] || null;
  },

  // Check if user is logged in
  async isLoggedIn() {
    const token = await this.getToken();
    return !!token;
  },

  // Register new user
  async register(email, password, displayName) {
    try {
      const response = await fetch(`${this.API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, displayName })
      });

      const data = await response.json();
      
      if (data.success) {
        // Store token and user
        await chrome.storage.local.set({
          [this.TOKEN_KEY]: data.token,
          [this.USER_KEY]: data.user,
          [this.SYNC_ENABLED_KEY]: true
        });
        
        // Sync current macros to cloud
        await this.syncToCloud();
      }

      return data;
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: error.message };
    }
  },

  // Login user
  async login(email, password) {
    try {
      const response = await fetch(`${this.API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      
      if (data.success) {
        // Store token and user
        await chrome.storage.local.set({
          [this.TOKEN_KEY]: data.token,
          [this.USER_KEY]: data.user,
          [this.SYNC_ENABLED_KEY]: true
        });
      }

      return data;
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  },

  // Logout user
  async logout() {
    await chrome.storage.local.remove([
      this.TOKEN_KEY, 
      this.USER_KEY, 
      this.SYNC_ENABLED_KEY
    ]);
    return { success: true };
  },

  // Verify token is still valid
  async verifyToken() {
    const token = await this.getToken();
    if (!token) return { success: false, error: 'No token' };

    try {
      const response = await fetch(`${this.API_BASE}/auth/verify`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (!data.success) {
        // Token invalid, clear storage
        await this.logout();
      }

      return data;
    } catch (error) {
      console.error('Token verification error:', error);
      return { success: false, error: error.message };
    }
  },

  // Sync macros TO cloud
  async syncToCloud() {
    const token = await this.getToken();
    if (!token) return { success: false, error: 'Not logged in' };

    try {
      // Get local macros from chrome.storage.sync (where popup.js saves them)
      const result = await chrome.storage.sync.get(['macros', 'folders', 'settings']);
      const macros = result.macros || [];
      const folders = result.folders || [];
      const settings = result.settings || {};

      const response = await fetch(`${this.API_BASE}/sync/save`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ macros, folders, settings })
      });

      const data = await response.json();
      
      if (data.success) {
        await chrome.storage.local.set({
          [this.LAST_SYNC_KEY]: data.lastSync
        });
      }

      return data;
    } catch (error) {
      console.error('Sync to cloud error:', error);
      return { success: false, error: error.message };
    }
  },

  // Sync macros FROM cloud
  async syncFromCloud() {
    const token = await this.getToken();
    if (!token) return { success: false, error: 'Not logged in' };

    try {
      const response = await fetch(`${this.API_BASE}/sync/get`, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success && data.data) {
        // Update chrome.storage.sync with cloud data (where popup.js reads from)
        await chrome.storage.sync.set({
          macros: data.data.macros || [],
          folders: data.data.folders || [],
          settings: data.data.settings || {}
        });
        // Store last sync time in local storage
        await chrome.storage.local.set({
          [this.LAST_SYNC_KEY]: data.data.lastSync
        });
      }

      return data;
    } catch (error) {
      console.error('Sync from cloud error:', error);
      return { success: false, error: error.message };
    }
  },

  // Get last sync time
  async getLastSync() {
    const result = await chrome.storage.local.get(this.LAST_SYNC_KEY);
    return result[this.LAST_SYNC_KEY] || null;
  },

  // Check if sync is enabled
  async isSyncEnabled() {
    const result = await chrome.storage.local.get(this.SYNC_ENABLED_KEY);
    return result[this.SYNC_ENABLED_KEY] || false;
  },

  // Toggle sync
  async toggleSync(enabled) {
    await chrome.storage.local.set({ [this.SYNC_ENABLED_KEY]: enabled });
    if (enabled) {
      await this.syncToCloud();
    }
  }
};

// Export for use in other scripts
if (typeof window !== 'undefined') {
  window.CloudSync = CloudSync;
}

// For background script
if (typeof self !== 'undefined') {
  self.CloudSync = CloudSync;
}

