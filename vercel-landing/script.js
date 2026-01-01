// Theme Toggle Functionality
function initTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    const currentTheme = localStorage.getItem('theme') || 'light';
    
    // Apply saved theme
    document.documentElement.setAttribute('data-theme', currentTheme);
    
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }
}

// FAQ Toggle Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize theme
    initTheme();
    
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Close all other FAQ items
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });
            
            // Toggle current item
            if (isActive) {
                item.classList.remove('active');
            } else {
                item.classList.add('active');
            }
        });
    });

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add scroll effect to header
    let lastScroll = 0;
    const header = document.querySelector('.header');
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            header.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
        } else {
            header.style.boxShadow = 'none';
        }
        
        lastScroll = currentScroll;
    });

    // Interactive Demo
    const demoInput = document.getElementById('demo-input');
    const demoReset = document.getElementById('demo-reset');
    const demoExampleBtns = document.querySelectorAll('.demo-example-btn');

    // Demo macros
    const demoMacros = {
        '/email': 'your.email@example.com',
        '/sig': 'Best regards,\nJohn Doe\nSent on ' + new Date().toLocaleDateString() + ' at ' + new Date().toLocaleTimeString(),
        '/date': new Date().toLocaleDateString(),
        '/time': new Date().toLocaleTimeString()
    };

    // Handle demo input
    if (demoInput) {
        let demoTimeout;
        demoInput.addEventListener('input', (e) => {
            clearTimeout(demoTimeout);
            const text = e.target.value;
            
            // Check for shortcuts on space, enter, or punctuation
            const triggerChars = [' ', '\n', '.', ',', '!', '?', ';', ':'];
            const lastChar = text[text.length - 1];
            
            if (triggerChars.includes(lastChar)) {
                demoTimeout = setTimeout(() => {
                    for (const [shortcut, expansion] of Object.entries(demoMacros)) {
                        if (text.endsWith(shortcut + lastChar)) {
                            const beforeShortcut = text.substring(0, text.length - shortcut.length - 1);
                            const newText = beforeShortcut + expansion + lastChar;
                            demoInput.value = newText;
                            demoInput.setSelectionRange(newText.length, newText.length);
                            break;
                        }
                    }
                }, 100);
            }
        });

        // Reset button
        if (demoReset) {
            demoReset.addEventListener('click', () => {
                demoInput.value = '';
                demoInput.focus();
            });
        }
    }

    // Example buttons
    demoExampleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const shortcut = btn.dataset.shortcut;
            if (demoInput && demoMacros[shortcut]) {
                demoInput.value = shortcut;
                demoInput.focus();
                // Trigger expansion
                setTimeout(() => {
                    demoInput.value = demoMacros[shortcut];
                }, 100);
            }
        });
    });

    // Update navigation based on auth status
    updateAuthNav();
});

// Update navigation based on authentication status
function updateAuthNav() {
    // Check if auth.js is loaded
    if (typeof auth !== 'undefined') {
        const user = auth.getCurrentUser();
        const authNav = document.getElementById('auth-nav');
        const loginLink = document.getElementById('login-link');
        const dashboardLink = document.getElementById('dashboard-link');
        const logoutBtn = document.getElementById('logout-btn-nav');

        if (user && auth.checkSession()) {
            // User is logged in
            if (authNav) authNav.style.display = 'inline-flex';
            if (loginLink) loginLink.style.display = 'none';
            if (dashboardLink) {
                dashboardLink.style.display = 'inline-block';
                dashboardLink.textContent = user.name.split(' ')[0]; // Show first name
            }
            if (logoutBtn) {
                logoutBtn.style.display = 'inline-block';
                logoutBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    auth.logout();
                    window.location.reload();
                });
            }
        } else {
            // User is not logged in
            if (authNav) authNav.style.display = 'none';
            if (loginLink) loginLink.style.display = 'inline-block';
        }
    }
}

