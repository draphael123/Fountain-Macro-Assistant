// Authentication System
// Note: This is a basic client-side system using localStorage
// For production, integrate with a proper backend authentication service

class AuthSystem {
    constructor() {
        this.usersKey = 'fountain_users';
        this.currentUserKey = 'fountain_current_user';
        this.sessionKey = 'fountain_session';
        this.init();
    }

    init() {
        // Initialize users storage if it doesn't exist
        if (!localStorage.getItem(this.usersKey)) {
            localStorage.setItem(this.usersKey, JSON.stringify([]));
        }

        // Check if user is logged in
        this.checkSession();

        // Setup form handlers
        this.setupForms();
    }

    // Get all users from storage
    getUsers() {
        const users = localStorage.getItem(this.usersKey);
        return users ? JSON.parse(users) : [];
    }

    // Save users to storage
    saveUsers(users) {
        localStorage.setItem(this.usersKey, JSON.stringify(users));
    }

    // Save macro backup for user (with history support)
    saveMacroBackup(userId, backupData) {
        const users = this.getUsers();
        const user = users.find(u => u.id === userId);
        if (user) {
            // Initialize backup history if it doesn't exist
            if (!user.backupHistory) {
                user.backupHistory = [];
            }

            // Create backup entry
            const backupEntry = {
                ...backupData,
                id: Date.now().toString(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            // Add to history (keep last 10 backups)
            user.backupHistory.unshift(backupEntry);
            if (user.backupHistory.length > 10) {
                user.backupHistory = user.backupHistory.slice(0, 10);
            }

            // Set as current backup
            user.macroBackup = backupEntry;
            this.saveUsers(users);
            return { success: true, backup: backupEntry };
        }
        return { success: false, error: 'User not found' };
    }

    // Get macro backup for user
    getMacroBackup(userId) {
        const users = this.getUsers();
        const user = users.find(u => u.id === userId);
        return user && user.macroBackup ? user.macroBackup : null;
    }

    // Get backup history for user
    getBackupHistory(userId) {
        const users = this.getUsers();
        const user = users.find(u => u.id === userId);
        return user && user.backupHistory ? user.backupHistory : [];
    }

    // Get specific backup by ID
    getBackupById(userId, backupId) {
        const history = this.getBackupHistory(userId);
        return history.find(b => b.id === backupId) || null;
    }

    // Restore from specific backup
    restoreFromBackup(userId, backupId) {
        const backup = this.getBackupById(userId, backupId);
        if (backup) {
            const users = this.getUsers();
            const user = users.find(u => u.id === userId);
            if (user) {
                user.macroBackup = backup;
                this.saveUsers(users);
                return { success: true, backup: backup };
            }
        }
        return { success: false, error: 'Backup not found' };
    }

    // Save personal macros (separate from backup - for manual upload/download)
    savePersonalMacros(userId, macrosData) {
        const users = this.getUsers();
        const user = users.find(u => u.id === userId);
        if (user) {
            // Merge with existing macros if they exist
            const existing = user.personalMacros;
            let finalMacros = macrosData.macros || [];
            
            if (existing && existing.macros && existing.macros.length > 0) {
                // Merge macros, avoiding duplicates by shortcut
                const existingShortcuts = new Set(
                    existing.macros.map(m => m.shortcut.toLowerCase())
                );
                const newMacros = (macrosData.macros || []).filter(
                    m => !existingShortcuts.has(m.shortcut.toLowerCase())
                );
                finalMacros = [...existing.macros, ...newMacros];
            }
            
            user.personalMacros = {
                macros: finalMacros,
                folders: macrosData.folders || existing?.folders || [],
                macroStats: { ...(existing?.macroStats || {}), ...(macrosData.macroStats || {}) },
                settings: { ...(existing?.settings || {}), ...(macrosData.settings || {}) },
                savedAt: new Date().toISOString(),
                version: macrosData.version || existing?.version || '1.1.0'
            };
            this.saveUsers(users);
            return { success: true, macros: user.personalMacros };
        }
        return { success: false, error: 'User not found' };
    }

    // Get personal macros
    getPersonalMacros(userId) {
        const users = this.getUsers();
        const user = users.find(u => u.id === userId);
        return user && user.personalMacros ? user.personalMacros : null;
    }

    // Update personal macros (merge with existing)
    updatePersonalMacros(userId, macrosData) {
        const existing = this.getPersonalMacros(userId);
        const users = this.getUsers();
        const user = users.find(u => u.id === userId);
        
        if (user) {
            if (existing) {
                // Merge with existing
                user.personalMacros = {
                    macros: macrosData.macros || existing.macros || [],
                    folders: macrosData.folders || existing.folders || [],
                    macroStats: macrosData.macroStats || existing.macroStats || {},
                    settings: macrosData.settings || existing.settings || {},
                    savedAt: new Date().toISOString(),
                    version: macrosData.version || existing.version || '1.0.1'
                };
            } else {
                // Create new
                user.personalMacros = {
                    macros: macrosData.macros || [],
                    folders: macrosData.folders || [],
                    macroStats: macrosData.macroStats || {},
                    settings: macrosData.settings || {},
                    savedAt: new Date().toISOString(),
                    version: macrosData.version || '1.0.1'
                };
            }
            this.saveUsers(users);
            return { success: true, macros: user.personalMacros };
        }
        return { success: false, error: 'User not found' };
    }

    // Get current user
    getCurrentUser() {
        const user = localStorage.getItem(this.currentUserKey);
        return user ? JSON.parse(user) : null;
    }

    // Set current user
    setCurrentUser(user) {
        if (user) {
            localStorage.setItem(this.currentUserKey, JSON.stringify(user));
            localStorage.setItem(this.sessionKey, JSON.stringify({
                userId: user.id,
                loginTime: new Date().toISOString()
            }));
        } else {
            localStorage.removeItem(this.currentUserKey);
            localStorage.removeItem(this.sessionKey);
        }
    }

    // Check if user is logged in
    checkSession() {
        const session = localStorage.getItem(this.sessionKey);
        if (session) {
            const sessionData = JSON.parse(session);
            // Check if session is still valid (24 hours)
            const loginTime = new Date(sessionData.loginTime);
            const now = new Date();
            const hoursDiff = (now - loginTime) / (1000 * 60 * 60);
            
            if (hoursDiff > 24) {
                // Session expired
                this.logout();
                return false;
            }
            return true;
        }
        return false;
    }

    // Validate email format
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // Validate password strength
    validatePassword(password) {
        const requirements = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /[0-9]/.test(password)
        };
        return requirements;
    }

    // Register new user
    register(userData) {
        const { name, email, password, confirmPassword } = userData;

        // Validation
        if (!name || name.trim().length < 2) {
            return { success: false, error: 'Name must be at least 2 characters' };
        }

        if (!this.validateEmail(email)) {
            return { success: false, error: 'Please enter a valid email address' };
        }

        const passwordRequirements = this.validatePassword(password);
        if (!passwordRequirements.length || !passwordRequirements.uppercase || 
            !passwordRequirements.lowercase || !passwordRequirements.number) {
            return { success: false, error: 'Password does not meet requirements' };
        }

        if (password !== confirmPassword) {
            return { success: false, error: 'Passwords do not match' };
        }

        // Check if user already exists
        const users = this.getUsers();
        if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
            return { success: false, error: 'An account with this email already exists' };
        }

        // Create new user
        const newUser = {
            id: Date.now().toString(),
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: this.hashPassword(password), // In production, never store passwords in plain text
            createdAt: new Date().toISOString(),
            macroBackup: null // Store macro backups here
        };

        users.push(newUser);
        this.saveUsers(users);

        // Auto-login after registration
        this.setCurrentUser({ id: newUser.id, name: newUser.name, email: newUser.email });

        return { success: true, user: { id: newUser.id, name: newUser.name, email: newUser.email } };
    }

    // Login user
    login(email, password, rememberMe = false) {
        if (!email || !password) {
            return { success: false, error: 'Please enter both email and password' };
        }

        const users = this.getUsers();
        const user = users.find(u => 
            u.email.toLowerCase() === email.toLowerCase() && 
            u.password === this.hashPassword(password)
        );

        if (!user) {
            return { success: false, error: 'Invalid email or password' };
        }

        // Set current user
        this.setCurrentUser({ id: user.id, name: user.name, email: user.email });

        return { success: true, user: { id: user.id, name: user.name, email: user.email } };
    }

    // Logout user
    logout() {
        this.setCurrentUser(null);
        return { success: true };
    }

    // Simple password hashing (for demo purposes only - use proper hashing in production)
    hashPassword(password) {
        // This is a simple hash for demo - NEVER use in production!
        // In production, use bcrypt or similar on the server side
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash.toString();
    }

    // Setup form handlers
    setupForms() {
        // Registration form
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleRegister(registerForm);
            });

            // Real-time password validation
            const passwordInput = document.getElementById('password');
            if (passwordInput) {
                passwordInput.addEventListener('input', (e) => {
                    this.updatePasswordRequirements(e.target.value);
                });
            }

            // Confirm password validation
            const confirmPasswordInput = document.getElementById('confirm-password');
            if (confirmPasswordInput) {
                confirmPasswordInput.addEventListener('input', (e) => {
                    this.validateConfirmPassword(e.target.value);
                });
            }
        }

        // Login form
        // Check if coming from extension
        const urlParams = new URLSearchParams(window.location.search);
        const isExtensionLogin = urlParams.get('extension') === 'true';
        
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin(loginForm);
            });
        }

        // Social login buttons (placeholder)
        document.querySelectorAll('.btn-social').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showMessage('Social login coming soon!', 'info');
            });
        });
    }

    // Handle registration
    async handleRegister(form) {
        const formData = new FormData(form);
        const userData = {
            name: formData.get('name'),
            email: formData.get('email'),
            password: formData.get('password'),
            confirmPassword: formData.get('confirm-password')
        };

        // Clear previous errors
        this.clearErrors();

        // Validate passwords match
        if (userData.password !== userData.confirmPassword) {
            this.showMessage('Passwords do not match', 'error');
            return;
        }

        // Try cloud API first
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    email: userData.email, 
                    password: userData.password,
                    displayName: userData.name 
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Save cloud auth token
                localStorage.setItem('fountain_auth_token', data.token);
                localStorage.setItem('fountain_user', JSON.stringify(data.user));
                
                // Also set in the old system for compatibility
                this.setCurrentUser(data.user);
                
                this.showMessage('Account created successfully! Redirecting...', 'success');
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);
                return;
            } else {
                this.showMessage(data.error || 'Registration failed', 'error');
                return;
            }
        } catch (error) {
            console.error('Cloud registration error:', error);
            // Fall back to local registration
        }

        // Fallback to local registration
        const result = this.register(userData);
        
        if (result.success) {
            this.showMessage('Account created successfully! Redirecting...', 'success');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
        } else {
            this.showMessage(result.error, 'error');
        }
    }

    // Handle login
    async handleLogin(form) {
        const formData = new FormData(form);
        const email = formData.get('email');
        const password = formData.get('password');
        const rememberMe = formData.get('remember') === 'on';

        // Clear previous errors
        this.clearErrors();

        // Try cloud API first
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Save cloud auth token
                localStorage.setItem('fountain_auth_token', data.token);
                localStorage.setItem('fountain_user', JSON.stringify(data.user));
                
                // Also set in the old system for compatibility
                this.setCurrentUser(data.user);
                
                // Check if this is an extension login
                const urlParams = new URLSearchParams(window.location.search);
                const isExtensionLogin = urlParams.get('extension') === 'true';
                
                if (isExtensionLogin) {
                    this.showMessage('Login successful! You can now close this tab and use the extension.', 'success');
                } else {
                    this.showMessage('Login successful! Redirecting...', 'success');
                    setTimeout(() => {
                        const redirectTo = new URLSearchParams(window.location.search).get('redirect') || 'dashboard.html';
                        window.location.href = redirectTo;
                    }, 1500);
                }
                return;
            } else {
                this.showError(data.error || 'Invalid email or password');
                return;
            }
        } catch (error) {
            console.error('Cloud login error:', error);
            // Fall back to local login
        }

        // Fallback to local login
        const result = this.login(email, password, rememberMe);
        
        if (result.success) {
            // Check if this is an extension login
            const urlParams = new URLSearchParams(window.location.search);
            const isExtensionLogin = urlParams.get('extension') === 'true';
            
            if (isExtensionLogin) {
                // Send message to extension
                try {
                    // Try to send via chrome.runtime if available
                    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
                        chrome.runtime.sendMessage({
                            type: 'AUTH_SUCCESS',
                            token: 'demo-token-' + Date.now(), // In production, use real token
                            user: result.user
                        });
                    }
                } catch (error) {
                    console.log('Could not send message to extension:', error);
                }
                
                this.showMessage('Login successful! You can now close this tab and use the extension.', 'success');
                // Don't redirect, let user close the tab
            } else {
                this.showMessage('Login successful! Redirecting...', 'success');
                setTimeout(() => {
                    const redirectTo = new URLSearchParams(window.location.search).get('redirect') || 'dashboard.html';
                    window.location.href = redirectTo;
                }, 1500);
            }
        } else {
            this.showMessage(result.error, 'error');
        }
    }

    // Update password requirements display
    updatePasswordRequirements(password) {
        const requirements = this.validatePassword(password);
        
        document.getElementById('req-length').classList.toggle('valid', requirements.length);
        document.getElementById('req-uppercase').classList.toggle('valid', requirements.uppercase);
        document.getElementById('req-lowercase').classList.toggle('valid', requirements.lowercase);
        document.getElementById('req-number').classList.toggle('valid', requirements.number);
    }

    // Validate confirm password
    validateConfirmPassword(confirmPassword) {
        const password = document.getElementById('password').value;
        const errorEl = document.getElementById('confirm-password-error');
        
        if (confirmPassword && password !== confirmPassword) {
            errorEl.textContent = 'Passwords do not match';
            return false;
        } else {
            errorEl.textContent = '';
            return true;
        }
    }

    // Show message
    showMessage(message, type = 'error') {
        const errorEl = document.getElementById('error-message');
        const successEl = document.getElementById('success-message');

        if (type === 'error') {
            errorEl.textContent = message;
            errorEl.style.display = 'block';
            successEl.style.display = 'none';
        } else if (type === 'success') {
            successEl.textContent = message;
            successEl.style.display = 'block';
            errorEl.style.display = 'none';
        } else {
            // Info message
            errorEl.textContent = message;
            errorEl.style.display = 'block';
            errorEl.style.background = '#e3f2fd';
            errorEl.style.borderColor = '#2196f3';
            errorEl.style.color = '#1976d2';
            successEl.style.display = 'none';
        }
    }

    // Clear errors
    clearErrors() {
        document.querySelectorAll('.form-error').forEach(el => {
            el.textContent = '';
        });
        document.getElementById('error-message').style.display = 'none';
        document.getElementById('success-message').style.display = 'none';
    }

    // Check if user needs to be logged in (for protected pages)
    requireAuth() {
        if (!this.checkSession() || !this.getCurrentUser()) {
            window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.pathname);
            return false;
        }
        return true;
    }
}

// Initialize auth system
const auth = new AuthSystem();

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthSystem;
}


