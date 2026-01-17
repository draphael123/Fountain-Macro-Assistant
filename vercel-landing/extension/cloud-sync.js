// Cloud Sync Module for Macro-Assistant Macro Assistant
// Uses Supabase authentication and API

const CloudSync = {
  API_BASE: 'https://fountain-macro-assistant.vercel.app/api',
  
  // Storage keys
  TOKEN_KEY: 'fountain_auth_token',
  REFRESH_TOKEN_KEY: 'fountain_refresh_token',
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
    const user = await this.getUser();
    return !!(token && user);
  },

  // Register new user
  async register(email, password, name) {
    try {
      const response = await fetch(`${this.API_BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
      });

      const data = await response.json();
      
      if (data.success && data.session) {
        // Store token and user
        await chrome.storage.local.set({
          [this.TOKEN_KEY]: data.session.access_token,
          [this.REFRESH_TOKEN_KEY]: data.session.refresh_token,
          [this.USER_KEY]: data.user,
          [this.SYNC_ENABLED_KEY]: true
        });
        
        return { success: true, user: data.user, message: data.message };
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
      
      if (data.success && data.session) {
        // Store token and user
        await chrome.storage.local.set({
          [this.TOKEN_KEY]: data.session.access_token,
          [this.REFRESH_TOKEN_KEY]: data.session.refresh_token,
          [this.USER_KEY]: data.user,
          [this.SYNC_ENABLED_KEY]: true
        });
        
        return { success: true, user: data.user };
      }

      return { success: false, error: data.error || 'Login failed' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  },

  // Logout user
  async logout() {
    await chrome.storage.local.remove([
      this.TOKEN_KEY,
      this.REFRESH_TOKEN_KEY,
      this.USER_KEY, 
      this.SYNC_ENABLED_KEY,
      this.LAST_SYNC_KEY
    ]);
    return { success: true };
  },

  // Verify token is still valid
  async verifyToken() {
    const token = await this.getToken();
    if (!token) return { success: false, error: 'No token' };

    try {
      const response = await fetch(`${this.API_BASE}/auth/user`, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (!data.success) {
        // Token invalid, clear storage
        await this.logout();
        return { success: false, error: 'Session expired' };
      }

      // Update user info
      await chrome.storage.local.set({
        [this.USER_KEY]: data.user
      });

      return { success: true, user: data.user };
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
      // Get local macros from chrome.storage.sync
      const result = await chrome.storage.sync.get(['macros', 'folders']);
      const macros = result.macros || [];

      const response = await fetch(`${this.API_BASE}/macros/sync`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ macros, mode: 'replace' })
      });

      const data = await response.json();
      
      if (data.success) {
        const now = new Date().toISOString();
        await chrome.storage.local.set({
          [this.LAST_SYNC_KEY]: now
        });
        return { success: true, message: `Synced ${macros.length} macros to cloud`, lastSync: now };
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
      const response = await fetch(`${this.API_BASE}/macros/sync`, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success && data.macros) {
        // Convert cloud macros to local format
        const localMacros = data.macros.map(m => ({
          id: m.id,
          shortcut: m.shortcut,
          expansion: m.expansion,
          name: m.name,
          folderId: m.folder,
          tags: m.tags || [],
          caseSensitive: m.case_sensitive || false,
          createdAt: m.created_at,
          lastUsed: null,
          useCount: 0
        }));

        // Get current local macros
        const localResult = await chrome.storage.sync.get(['macros']);
        const existingMacros = localResult.macros || [];
        
        // Merge - cloud macros take precedence for matching shortcuts
        const shortcutMap = new Map();
        existingMacros.forEach(m => shortcutMap.set(m.shortcut, m));
        localMacros.forEach(m => shortcutMap.set(m.shortcut, m));
        
        const mergedMacros = Array.from(shortcutMap.values());

        // Update local storage
        await chrome.storage.sync.set({ macros: mergedMacros });
        
        const now = new Date().toISOString();
        await chrome.storage.local.set({
          [this.LAST_SYNC_KEY]: now
        });

        return { 
          success: true, 
          message: `Downloaded ${data.macros.length} macros from cloud`,
          macros: mergedMacros,
          lastSync: now
        };
      }

      return data;
    } catch (error) {
      console.error('Sync from cloud error:', error);
      return { success: false, error: error.message };
    }
  },

  // Full sync (push local, then pull cloud)
  async fullSync() {
    const uploadResult = await this.syncToCloud();
    if (!uploadResult.success) {
      return uploadResult;
    }
    
    return { 
      success: true, 
      message: 'Macros synced successfully!',
      lastSync: uploadResult.lastSync
    };
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
  },

  // Browse shared macros
  async getSharedMacros(category = 'all', search = '') {
    try {
      let url = `${this.API_BASE}/macros/shared?limit=50`;
      if (category && category !== 'all') {
        url += `&category=${encodeURIComponent(category)}`;
      }
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }

      const response = await fetch(url);
      const data = await response.json();
      
      return data;
    } catch (error) {
      console.error('Get shared macros error:', error);
      return { success: false, error: error.message, macros: [] };
    }
  },

  // Share a macro to community
  async shareMacro(macro) {
    const token = await this.getToken();
    if (!token) return { success: false, error: 'Not logged in' };

    try {
      const response = await fetch(`${this.API_BASE}/macros/shared`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          shortcut: macro.shortcut,
          expansion: macro.expansion,
          name: macro.name || macro.shortcut,
          description: macro.description || '',
          category: macro.category || 'general'
        })
      });

      return await response.json();
    } catch (error) {
      console.error('Share macro error:', error);
      return { success: false, error: error.message };
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
