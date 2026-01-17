// Shared Macros System
// Uses Upstash Redis API for persistent storage with localStorage fallback

class SharedMacrosSystem {
    constructor() {
        this.apiBase = '/api/shared-macros';
        this.sharedMacrosKey = 'fountain_shared_macros';
        this.sharedFoldersKey = 'fountain_shared_folders';
        this.cacheKey = 'fountain_shared_macros_cache';
        this.cacheDuration = 60000; // 1 minute cache
        this.useApi = true; // Will be set to false if API fails
        this.apiChecked = false;
        this.init();
    }

    init() {
        // Initialize localStorage as fallback
        if (!localStorage.getItem(this.sharedMacrosKey)) {
            localStorage.setItem(this.sharedMacrosKey, JSON.stringify([]));
        }
        if (!localStorage.getItem(this.sharedFoldersKey)) {
            localStorage.setItem(this.sharedFoldersKey, JSON.stringify([]));
        }
        
        // Check API availability on init
        this.checkApiAvailability();
    }
    
    // Check if API is available
    async checkApiAvailability() {
        if (this.apiChecked) return this.useApi;
        
        try {
            const response = await fetch(`${this.apiBase}/list?limit=1`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            
            this.useApi = response.ok;
            this.apiChecked = true;
            
            if (this.useApi) {
                console.log('✅ Shared Macros API connected (Upstash Redis)');
            } else {
                console.warn('⚠️ Shared Macros API unavailable, using localStorage fallback');
            }
        } catch (error) {
            this.useApi = false;
            this.apiChecked = true;
            console.warn('⚠️ Shared Macros API unavailable:', error.message);
        }
        
        return this.useApi;
    }

    // Helper: Make API request with fallback
    async apiRequest(endpoint, options = {}) {
        if (!this.useApi) {
            return null; // Skip API if it's been disabled
        }

        try {
            const response = await fetch(`${this.apiBase}${endpoint}`, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                },
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.warn('API request failed, using localStorage fallback:', error.message);
            return null;
        }
    }

    // Get all shared macros (API with localStorage fallback)
    async getSharedMacrosAsync() {
        // Try API first
        const result = await this.apiRequest('/list');
        if (result?.success) {
            // Update local cache
            localStorage.setItem(this.sharedMacrosKey, JSON.stringify(result.macros));
            localStorage.setItem(this.cacheKey, JSON.stringify({
                timestamp: Date.now(),
                data: result.macros
            }));
            return result.macros;
        }

        // Fallback to localStorage
        return this.getSharedMacros();
    }

    // Synchronous version for backwards compatibility
    getSharedMacros() {
        const shared = localStorage.getItem(this.sharedMacrosKey);
        return shared ? JSON.parse(shared) : [];
    }

    // Save shared macros (localStorage only - for fallback)
    saveSharedMacros(macros) {
        localStorage.setItem(this.sharedMacrosKey, JSON.stringify(macros));
    }

    // Get all shared folders (API with localStorage fallback)
    async getSharedFoldersAsync() {
        const result = await this.apiRequest('/folders');
        if (result?.success) {
            localStorage.setItem(this.sharedFoldersKey, JSON.stringify(result.folders));
            return result.folders;
        }
        return this.getSharedFolders();
    }

    // Synchronous version for backwards compatibility
    getSharedFolders() {
        const folders = localStorage.getItem(this.sharedFoldersKey);
        return folders ? JSON.parse(folders) : [];
    }

    // Save shared folders (localStorage only - for fallback)
    saveSharedFolders(folders) {
        localStorage.setItem(this.sharedFoldersKey, JSON.stringify(folders));
    }

    // Create a new shared folder (API with localStorage fallback)
    async createFolderAsync(name, description = '', author = 'Anonymous', authorId = null) {
        if (!name || name.trim() === '') {
            return { success: false, error: 'Folder name is required' };
        }

        // Try API first
        const result = await this.apiRequest('/folders', {
            method: 'POST',
            body: JSON.stringify({ name, description, author, authorId }),
        });

        if (result?.success) {
            // Update local cache
            const folders = this.getSharedFolders();
            folders.push(result.folder);
            this.saveSharedFolders(folders);
            return result;
        }

        // Fallback to localStorage
        return this.createFolder(name, description, author, authorId);
    }

    // Synchronous version for backwards compatibility
    createFolder(name, description = '', author = 'Anonymous', authorId = null) {
        if (!name || name.trim() === '') {
            return { success: false, error: 'Folder name is required' };
        }

        const folders = this.getSharedFolders();
        
        if (folders.some(f => f.name.toLowerCase() === name.toLowerCase())) {
            return { success: false, error: 'A folder with this name already exists' };
        }

        const folder = {
            id: `folder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: name.trim(),
            description: description.trim(),
            author: author,
            authorId: authorId,
            createdAt: new Date().toISOString(),
            macroCount: 0,
            isPublic: true
        };

        folders.push(folder);
        this.saveSharedFolders(folders);

        return { success: true, folder: folder };
    }

    // Get folder by ID
    getFolder(folderId) {
        const folders = this.getSharedFolders();
        return folders.find(f => f.id === folderId);
    }

    // Update folder
    updateFolder(folderId, updates) {
        const folders = this.getSharedFolders();
        const index = folders.findIndex(f => f.id === folderId);
        
        if (index === -1) {
            return { success: false, error: 'Folder not found' };
        }

        folders[index] = { ...folders[index], ...updates };
        this.saveSharedFolders(folders);

        return { success: true, folder: folders[index] };
    }

    // Update folder macro counts
    updateFolderCounts() {
        const folders = this.getSharedFolders();
        const macros = this.getSharedMacros();
        
        folders.forEach(folder => {
            const count = macros.filter(m => m.metadata?.folderId === folder.id)
                .reduce((sum, m) => sum + (m.macros?.length || 0), 0);
            folder.macroCount = count;
        });
        
        this.saveSharedFolders(folders);
    }

    // Delete folder
    deleteFolder(folderId, authorId = null) {
        const folders = this.getSharedFolders();
        const folder = folders.find(f => f.id === folderId);
        
        if (!folder) {
            return { success: false, error: 'Folder not found' };
        }

        if (authorId && folder.authorId !== authorId) {
            return { success: false, error: 'You can only delete folders you created' };
        }

        const shared = this.getSharedMacros();
        const macrosInFolder = shared.filter(s => s.metadata.folderId === folderId);
        
        if (macrosInFolder.length > 0) {
            return { success: false, error: `Cannot delete folder. It contains ${macrosInFolder.length} macro(s). Please remove macros first.` };
        }

        const index = folders.findIndex(f => f.id === folderId);
        folders.splice(index, 1);
        this.saveSharedFolders(folders);

        return { success: true };
    }

    // Share macros (API with localStorage fallback)
    async shareMacrosAsync(macros, metadata = {}) {
        if (!Array.isArray(macros) || macros.length === 0) {
            return { success: false, error: 'No macros to share' };
        }

        // Try API first
        const result = await this.apiRequest('/create', {
            method: 'POST',
            body: JSON.stringify({ macros, metadata }),
        });

        if (result?.success) {
            // Update local cache
            const cached = this.getSharedMacros();
            cached.unshift(result.sharedMacro);
            this.saveSharedMacros(cached);
            return result;
        }

        // Fallback to localStorage
        return this.shareMacros(macros, metadata);
    }

    // Synchronous version for backwards compatibility
    shareMacros(macros, metadata = {}) {
        if (!Array.isArray(macros) || macros.length === 0) {
            return { success: false, error: 'No macros to share' };
        }

        const shareCode = this.generateShareCode();
        const shareId = `share_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const sharedMacro = {
            id: shareId,
            shareCode: shareCode,
            macros: macros,
            metadata: {
                title: metadata.title || `${macros.length} Macro${macros.length > 1 ? 's' : ''}`,
                description: metadata.description || '',
                author: metadata.author || 'Anonymous',
                authorId: metadata.authorId || null,
                category: metadata.category || 'general',
                tags: metadata.tags || [],
                folderId: metadata.folderId || null,
                createdAt: new Date().toISOString(),
                views: 0,
                imports: 0
            }
        };

        const shared = this.getSharedMacros();
        shared.unshift(sharedMacro);

        if (metadata.folderId) {
            const folders = this.getSharedFolders();
            const folderIndex = folders.findIndex(f => f.id === metadata.folderId);
            if (folderIndex !== -1) {
                folders[folderIndex].macroCount = (folders[folderIndex].macroCount || 0) + macros.length;
                this.saveSharedFolders(folders);
            }
        }

        if (shared.length > 1000) {
            shared.splice(1000);
        }

        this.saveSharedMacros(shared);

        return {
            success: true,
            shareId: shareId,
            shareCode: shareCode,
            shareUrl: `https://fountain-macro-assistant.vercel.app/shared.html?code=${shareCode}`,
            sharedMacro: sharedMacro
        };
    }

    // Get shared macro by code or ID (API with localStorage fallback)
    async getSharedMacroAsync(codeOrId) {
        const result = await this.apiRequest(`/get?code=${encodeURIComponent(codeOrId)}`);
        if (result?.success) {
            return result.sharedMacro;
        }
        return this.getSharedMacro(codeOrId);
    }

    // Synchronous version
    getSharedMacro(codeOrId) {
        const shared = this.getSharedMacros();
        return shared.find(s => s.shareCode === codeOrId || s.id === codeOrId);
    }

    // Import shared macro (API with localStorage fallback)
    async importSharedMacroAsync(shareCode, options = {}) {
        // Try API first
        const result = await this.apiRequest('/import', {
            method: 'POST',
            body: JSON.stringify({ shareCode }),
        });

        if (result?.success) {
            return result;
        }

        // Fallback to localStorage
        return this.importSharedMacro(shareCode, options);
    }

    // Synchronous version
    importSharedMacro(shareCode, options = {}) {
        const sharedMacro = this.getSharedMacro(shareCode);
        if (!sharedMacro) {
            return { success: false, error: 'Shared macro not found' };
        }

        sharedMacro.metadata.imports = (sharedMacro.metadata.imports || 0) + 1;
        const shared = this.getSharedMacros();
        const index = shared.findIndex(s => s.id === sharedMacro.id);
        if (index !== -1) {
            shared[index] = sharedMacro;
            this.saveSharedMacros(shared);
        }

        return {
            success: true,
            macros: sharedMacro.macros,
            metadata: sharedMacro.metadata
        };
    }

    // Get macros by folder
    getMacrosByFolder(folderId) {
        const shared = this.getSharedMacros();
        return shared.filter(s => s.metadata.folderId === folderId);
    }

    // Get popular shared macros (API with localStorage fallback)
    async getPopularMacrosAsync(limit = 20, folderId = null) {
        let url = `/list?sort=popular&limit=${limit}`;
        if (folderId) url += `&folderId=${encodeURIComponent(folderId)}`;
        
        const result = await this.apiRequest(url);
        if (result?.success) {
            return result.macros;
        }
        return this.getPopularMacros(limit, folderId);
    }

    // Synchronous version
    getPopularMacros(limit = 20, folderId = null) {
        const shared = this.getSharedMacros();
        let filtered = shared;
        
        if (folderId) {
            filtered = shared.filter(s => s.metadata.folderId === folderId);
        }
        
        return filtered
            .sort((a, b) => (b.metadata.imports || 0) - (a.metadata.imports || 0))
            .slice(0, limit);
    }

    // Get recent shared macros (API with localStorage fallback)
    async getRecentMacrosAsync(limit = 20, folderId = null) {
        let url = `/list?sort=recent&limit=${limit}`;
        if (folderId) url += `&folderId=${encodeURIComponent(folderId)}`;
        
        const result = await this.apiRequest(url);
        if (result?.success) {
            return result.macros;
        }
        return this.getRecentMacros(limit, folderId);
    }

    // Synchronous version
    getRecentMacros(limit = 20, folderId = null) {
        const shared = this.getSharedMacros();
        let filtered = shared;
        
        if (folderId) {
            filtered = shared.filter(s => s.metadata.folderId === folderId);
        }
        
        return filtered
            .sort((a, b) => new Date(b.metadata.createdAt) - new Date(a.metadata.createdAt))
            .slice(0, limit);
    }

    // Search shared macros
    searchSharedMacros(query, folderId = null) {
        const shared = this.getSharedMacros();
        let filtered = shared;
        
        if (folderId) {
            filtered = shared.filter(s => s.metadata.folderId === folderId);
        }
        
        const lowerQuery = query.toLowerCase();
        
        return filtered.filter(s => {
            const title = (s.metadata.title || '').toLowerCase();
            const description = (s.metadata.description || '').toLowerCase();
            const author = (s.metadata.author || '').toLowerCase();
            const tags = (s.metadata.tags || []).join(' ').toLowerCase();
            const shortcuts = s.macros.map(m => m.shortcut || '').join(' ').toLowerCase();
            
            return title.includes(lowerQuery) ||
                   description.includes(lowerQuery) ||
                   author.includes(lowerQuery) ||
                   tags.includes(lowerQuery) ||
                   shortcuts.includes(lowerQuery);
        });
    }

    // Generate a simple share code (6-8 characters)
    generateShareCode() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        if (this.getSharedMacro(code)) {
            return this.generateShareCode();
        }
        
        return code;
    }

    // Delete shared macro (API with localStorage fallback)
    async deleteSharedMacroAsync(shareId, authorId) {
        const result = await this.apiRequest('/delete', {
            method: 'POST',
            body: JSON.stringify({ shareId, authorId }),
        });

        if (result?.success) {
            // Update local cache
            const shared = this.getSharedMacros();
            const index = shared.findIndex(s => s.id === shareId);
            if (index !== -1) {
                shared.splice(index, 1);
                this.saveSharedMacros(shared);
            }
            return result;
        }

        return this.deleteSharedMacro(shareId, authorId);
    }

    // Synchronous version
    deleteSharedMacro(shareId, authorId) {
        const shared = this.getSharedMacros();
        const index = shared.findIndex(s => s.id === shareId);
        
        if (index === -1) {
            return { success: false, error: 'Shared macro not found' };
        }

        const sharedMacro = shared[index];
        if (sharedMacro.metadata.authorId && sharedMacro.metadata.authorId !== authorId) {
            return { success: false, error: 'Not authorized to delete this macro' };
        }

        if (sharedMacro.metadata.folderId) {
            const folders = this.getSharedFolders();
            const folderIndex = folders.findIndex(f => f.id === sharedMacro.metadata.folderId);
            if (folderIndex !== -1) {
                folders[folderIndex].macroCount = Math.max(0, (folders[folderIndex].macroCount || 0) - sharedMacro.macros.length);
                this.saveSharedFolders(folders);
            }
        }

        shared.splice(index, 1);
        this.saveSharedMacros(shared);
        return { success: true };
    }

    // Increment view count
    incrementViews(shareCode) {
        const sharedMacro = this.getSharedMacro(shareCode);
        if (sharedMacro) {
            sharedMacro.metadata.views = (sharedMacro.metadata.views || 0) + 1;
            const shared = this.getSharedMacros();
            const index = shared.findIndex(s => s.id === sharedMacro.id);
            if (index !== -1) {
                shared[index] = sharedMacro;
                this.saveSharedMacros(shared);
            }
        }
    }

    // Sync local data to API (for migration)
    async syncToApi() {
        const localMacros = this.getSharedMacros();
        const localFolders = this.getSharedFolders();
        
        console.log(`Syncing ${localMacros.length} macros and ${localFolders.length} folders to API...`);
        
        // This would require a bulk import endpoint
        // For now, just log what would be synced
        return {
            macrosToSync: localMacros.length,
            foldersToSync: localFolders.length
        };
    }
}

// Initialize shared macros system
const sharedMacros = new SharedMacrosSystem();

// Export for use in other scripts
if (typeof window !== 'undefined') {
    window.SharedMacrosSystem = SharedMacrosSystem;
    window.sharedMacros = sharedMacros;
}
