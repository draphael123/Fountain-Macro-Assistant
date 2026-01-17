// Google Authentication Module for Fountain Macro Assistant
// Uses Chrome Identity API for seamless Google Sign-In

const GoogleAuth = {
  // Storage keys
  USER_KEY: 'fountain_google_user',
  TOKEN_KEY: 'fountain_google_token',
  SYNC_ENABLED_KEY: 'fountain_sync_enabled',
  LAST_SYNC_KEY: 'fountain_last_sync',
  
  // API endpoint for syncing (your backend)
  API_BASE: 'https://fountain-macro-assistant.vercel.app/api',

  // Sign in with Google
  async signIn() {
    try {
      // Get OAuth token from Chrome
      const token = await new Promise((resolve, reject) => {
        chrome.identity.getAuthToken({ interactive: true }, (token) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve(token);
          }
        });
      });

      // Get user info from Google
      const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Failed to get user info');
      }

      const userInfo = await response.json();
      
      const user = {
        id: userInfo.id,
        email: userInfo.email,
        name: userInfo.name || userInfo.email.split('@')[0],
        picture: userInfo.picture
      };

      // Store user info and token
      await chrome.storage.local.set({
        [this.USER_KEY]: user,
        [this.TOKEN_KEY]: token,
        [this.SYNC_ENABLED_KEY]: true
      });

      return { success: true, user };
    } catch (error) {
      console.error('Google sign-in error:', error);
      return { success: false, error: error.message };
    }
  },

  // Sign out
  async signOut() {
    try {
      // Get current token
      const result = await chrome.storage.local.get(this.TOKEN_KEY);
      const token = result[this.TOKEN_KEY];

      if (token) {
        // Revoke the token
        await new Promise((resolve) => {
          chrome.identity.removeCachedAuthToken({ token }, resolve);
        });
      }

      // Clear stored data
      await chrome.storage.local.remove([
        this.USER_KEY,
        this.TOKEN_KEY,
        this.SYNC_ENABLED_KEY,
        this.LAST_SYNC_KEY
      ]);

      return { success: true };
    } catch (error) {
      console.error('Sign out error:', error);
      return { success: false, error: error.message };
    }
  },

  // Check if user is signed in
  async isSignedIn() {
    const result = await chrome.storage.local.get([this.USER_KEY, this.TOKEN_KEY]);
    return !!(result[this.USER_KEY] && result[this.TOKEN_KEY]);
  },

  // Get current user
  async getUser() {
    const result = await chrome.storage.local.get(this.USER_KEY);
    return result[this.USER_KEY] || null;
  },

  // Get token
  async getToken() {
    const result = await chrome.storage.local.get(this.TOKEN_KEY);
    return result[this.TOKEN_KEY] || null;
  },

  // Refresh token if needed
  async refreshToken() {
    try {
      const token = await new Promise((resolve, reject) => {
        chrome.identity.getAuthToken({ interactive: false }, (token) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve(token);
          }
        });
      });

      await chrome.storage.local.set({ [this.TOKEN_KEY]: token });
      return { success: true, token };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Sync macros to cloud (using Google ID as user identifier)
  async syncToCloud(macros) {
    const user = await this.getUser();
    const token = await this.getToken();
    
    if (!user || !token) {
      return { success: false, error: 'Not signed in' };
    }

    try {
      const response = await fetch(`${this.API_BASE}/macros/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Google-User-Id': user.id
        },
        body: JSON.stringify({ 
          macros,
          userId: user.id,
          provider: 'google'
        })
      });

      const data = await response.json();

      if (data.success) {
        const now = new Date().toISOString();
        await chrome.storage.local.set({ [this.LAST_SYNC_KEY]: now });
        return { success: true, lastSync: now };
      }

      return data;
    } catch (error) {
      console.error('Sync to cloud error:', error);
      return { success: false, error: error.message };
    }
  },

  // Sync macros from cloud
  async syncFromCloud() {
    const user = await this.getUser();
    const token = await this.getToken();
    
    if (!user || !token) {
      return { success: false, error: 'Not signed in' };
    }

    try {
      const response = await fetch(`${this.API_BASE}/macros/sync?userId=${user.id}&provider=google`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Google-User-Id': user.id
        }
      });

      const data = await response.json();

      if (data.success && data.macros) {
        const now = new Date().toISOString();
        await chrome.storage.local.set({ [this.LAST_SYNC_KEY]: now });
        return { success: true, macros: data.macros, lastSync: now };
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
  }
};

// Export for use in other scripts
if (typeof window !== 'undefined') {
  window.GoogleAuth = GoogleAuth;
}

if (typeof self !== 'undefined') {
  self.GoogleAuth = GoogleAuth;
}

