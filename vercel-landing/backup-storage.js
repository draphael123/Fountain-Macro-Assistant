// Simple backup storage using website's localStorage
// No external services needed! Uses existing user accounts

class BackupStorage {
    constructor() {
        this.usersKey = 'fountain_users';
        this.backupsKey = 'fountain_backups';
    }

    // Save backup for user
    saveBackup(userId, backupData) {
        try {
            // Get all backups
            const backups = this.getBackups();
            
            // Update or create backup for this user
            backups[userId] = {
                ...backupData,
                updatedAt: new Date().toISOString()
            };
            
            // Save to localStorage
            localStorage.setItem(this.backupsKey, JSON.stringify(backups));
            
            return { success: true };
        } catch (error) {
            console.error('Save backup error:', error);
            return { success: false, error: error.message };
        }
    }

    // Get backup for user
    getBackup(userId) {
        try {
            const backups = this.getBackups();
            return backups[userId] || null;
        } catch (error) {
            console.error('Get backup error:', error);
            return null;
        }
    }

    // Get all backups
    getBackups() {
        try {
            const backups = localStorage.getItem(this.backupsKey);
            return backups ? JSON.parse(backups) : {};
        } catch (error) {
            return {};
        }
    }

    // Delete backup for user
    deleteBackup(userId) {
        try {
            const backups = this.getBackups();
            delete backups[userId];
            localStorage.setItem(this.backupsKey, JSON.stringify(backups));
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

// Initialize backup storage
const backupStorage = new BackupStorage();







