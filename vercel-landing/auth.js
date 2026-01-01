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
            createdAt: new Date().toISOString()
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
    handleRegister(form) {
        const formData = new FormData(form);
        const userData = {
            name: formData.get('name'),
            email: formData.get('email'),
            password: formData.get('password'),
            confirmPassword: formData.get('confirm-password')
        };

        // Clear previous errors
        this.clearErrors();

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
    handleLogin(form) {
        const formData = new FormData(form);
        const email = formData.get('email');
        const password = formData.get('password');
        const rememberMe = formData.get('remember') === 'on';

        // Clear previous errors
        this.clearErrors();

        const result = this.login(email, password, rememberMe);
        
        if (result.success) {
            this.showMessage('Login successful! Redirecting...', 'success');
            setTimeout(() => {
                const redirectTo = new URLSearchParams(window.location.search).get('redirect') || 'dashboard.html';
                window.location.href = redirectTo;
            }, 1500);
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


