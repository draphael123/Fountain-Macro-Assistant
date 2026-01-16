// Theme Toggle Functionality
function initTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    
    // Check saved theme or system preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const currentTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
    
    // Apply theme
    document.documentElement.setAttribute('data-theme', currentTheme);
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
        }
    });
    
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            
            // Add a subtle animation to the toggle
            themeToggle.style.transform = 'rotate(360deg)';
            setTimeout(() => {
                themeToggle.style.transform = '';
            }, 300);
        });
    }
}

// Mobile Navigation
function initMobileNav() {
    const mobileToggle = document.getElementById('mobile-menu-toggle');
    const nav = document.getElementById('main-nav');
    
    if (!mobileToggle || !nav) return;
    
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'mobile-overlay';
    document.body.appendChild(overlay);
    
    mobileToggle.addEventListener('click', () => {
        const isOpen = nav.classList.contains('mobile-open');
        
        mobileToggle.classList.toggle('active');
        nav.classList.toggle('mobile-open');
        overlay.classList.toggle('active');
        document.body.style.overflow = isOpen ? '' : 'hidden';
        
        mobileToggle.setAttribute('aria-expanded', !isOpen);
    });
    
    overlay.addEventListener('click', () => {
        mobileToggle.classList.remove('active');
        nav.classList.remove('mobile-open');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
        mobileToggle.setAttribute('aria-expanded', 'false');
    });
    
    // Close on nav link click
    nav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            mobileToggle.classList.remove('active');
            nav.classList.remove('mobile-open');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
}

// Hero Video Demo Animation
function initHeroDemo() {
    const typedText = document.getElementById('typed-text');
    const expandedText = document.getElementById('expanded-text');
    const playBtn = document.getElementById('play-demo-btn');
    
    if (!typedText || !expandedText) return;
    
    const demos = [
        { shortcut: '/email', expansion: 'john.doe@example.com' },
        { shortcut: '/sig', expansion: 'Best regards,\nJohn Doe\nProduct Manager' },
        { shortcut: '/meeting', expansion: 'Would you be available for a quick call this week?' },
        { shortcut: '/thanks', expansion: 'Thank you for reaching out! I appreciate your interest.' }
    ];
    
    let currentDemo = 0;
    let isAnimating = false;
    
    async function typeText(text, element, speed = 80) {
        element.textContent = '';
        for (let char of text) {
            element.textContent += char;
            await new Promise(r => setTimeout(r, speed));
        }
    }
    
    async function runDemo() {
        if (isAnimating) return;
        isAnimating = true;
        
        const demo = demos[currentDemo];
        
        // Type the shortcut
        await typeText(demo.shortcut, typedText, 100);
        await new Promise(r => setTimeout(r, 500));
        
        // Show expansion
        typedText.textContent = '';
        await typeText(demo.expansion, expandedText, 30);
        
        await new Promise(r => setTimeout(r, 2000));
        
        // Reset for next demo
        expandedText.textContent = '';
        currentDemo = (currentDemo + 1) % demos.length;
        isAnimating = false;
        
        // Auto-run next demo
        setTimeout(runDemo, 1000);
    }
    
    // Start demo automatically after 2 seconds
    setTimeout(runDemo, 2000);
    
    if (playBtn) {
        playBtn.addEventListener('click', () => {
            if (!isAnimating) runDemo();
        });
    }
}

// Newsletter Signup
function initNewsletter() {
    const form = document.getElementById('newsletter-form');
    const emailInput = document.getElementById('newsletter-email');
    const submitBtn = document.getElementById('newsletter-submit');
    const successMsg = document.getElementById('newsletter-success');
    
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        if (!email) return;
        
        // Show loading
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoading = submitBtn.querySelector('.btn-loading');
        if (btnText) btnText.style.display = 'none';
        if (btnLoading) btnLoading.style.display = 'inline-block';
        submitBtn.disabled = true;
        
        // Simulate API call (replace with actual endpoint)
        await new Promise(r => setTimeout(r, 1000));
        
        // Store locally (temporary solution)
        const subscribers = JSON.parse(localStorage.getItem('fountain_subscribers') || '[]');
        if (!subscribers.includes(email)) {
            subscribers.push(email);
            localStorage.setItem('fountain_subscribers', JSON.stringify(subscribers));
        }
        
        // Show success
        if (btnText) btnText.style.display = 'inline';
        if (btnLoading) btnLoading.style.display = 'none';
        submitBtn.disabled = false;
        emailInput.value = '';
        
        if (successMsg) {
            successMsg.style.display = 'block';
            setTimeout(() => {
                successMsg.style.display = 'none';
            }, 5000);
        }
    });
}


// Time Saved Calculator
function initCalculator() {
    const phrasesSlider = document.getElementById('phrases-per-day');
    const lengthSlider = document.getElementById('avg-phrase-length');
    const shortcutSlider = document.getElementById('shortcut-length');
    
    const phrasesValue = document.getElementById('phrases-value');
    const lengthValue = document.getElementById('length-value');
    const shortcutValue = document.getElementById('shortcut-value');
    
    const timeSavedDaily = document.getElementById('time-saved-daily');
    const timeSavedWeekly = document.getElementById('time-saved-weekly');
    const timeSavedYearly = document.getElementById('time-saved-yearly');
    const keystrokesSaved = document.getElementById('keystrokes-saved');
    
    if (!phrasesSlider) return;
    
    function calculateSavings() {
        const phrases = parseInt(phrasesSlider.value);
        const avgLength = parseInt(lengthSlider.value);
        const shortcutLen = parseInt(shortcutSlider.value);
        
        // Update display values
        if (phrasesValue) phrasesValue.textContent = phrases;
        if (lengthValue) lengthValue.textContent = avgLength;
        if (shortcutValue) shortcutValue.textContent = shortcutLen;
        
        // Calculate keystrokes saved per phrase
        const keystrokesPerPhrase = avgLength - shortcutLen;
        const totalKeystrokesSaved = keystrokesPerPhrase * phrases;
        
        // Average typing speed: 40 WPM = ~200 characters per minute
        // So ~3.3 characters per second
        const charsPerSecond = 3.3;
        const secondsSaved = totalKeystrokesSaved / charsPerSecond;
        const minutesSaved = secondsSaved / 60;
        
        // Calculate weekly and yearly
        const weeklyHours = (minutesSaved * 5) / 60; // 5 work days
        const yearlyHours = weeklyHours * 50; // 50 work weeks
        
        // Update results with animation
        animateValue(timeSavedDaily, Math.round(minutesSaved));
        animateValue(timeSavedWeekly, weeklyHours.toFixed(1));
        animateValue(timeSavedYearly, Math.round(yearlyHours));
        animateValue(keystrokesSaved, totalKeystrokesSaved.toLocaleString());
    }
    
    function animateValue(element, newValue) {
        if (!element) return;
        element.textContent = newValue;
        element.style.transform = 'scale(1.1)';
        setTimeout(() => {
            element.style.transform = 'scale(1)';
        }, 150);
    }
    
    [phrasesSlider, lengthSlider, shortcutSlider].forEach(slider => {
        if (slider) {
            slider.addEventListener('input', calculateSavings);
        }
    });
    
    // Initial calculation
    calculateSavings();
}

// Enhanced Demo Tabs
function initDemoTabs() {
    const tabs = document.querySelectorAll('.demo-tab');
    const contents = document.querySelectorAll('.demo-tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.tab;
            
            // Update active states
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));
            
            tab.classList.add('active');
            document.getElementById(`tab-${targetTab}`)?.classList.add('active');
        });
    });
    
    // Handle shortcut chips
    document.querySelectorAll('.shortcut-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const shortcut = chip.dataset.shortcut;
            const parentContent = chip.closest('.demo-tab-content');
            const textarea = parentContent?.querySelector('textarea');
            
            if (textarea && shortcut) {
                textarea.value += shortcut + ' ';
                textarea.focus();
                
                // Trigger expansion
                setTimeout(() => {
                    handleDemoExpansion(textarea);
                }, 100);
            }
        });
    });
}

// Lazy Loading with Intersection Observer
function initLazyLoading() {
    const lazyElements = document.querySelectorAll(
        '.feature-card, .testimonial-card, .download-card, .guide-section, .faq-item, .import-method-card, .calculator-container'
    );
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('loaded');
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    lazyElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = `all 0.5s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.05}s`;
        observer.observe(el);
    });
}

// FAQ Toggle Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize theme
    initTheme();
    
    // Update auth navigation
    updateAuthNav();
    
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

    // FAQ Search functionality
    const faqSearchInput = document.getElementById('faq-search-input');
    const faqList = document.getElementById('faq-list');
    if (faqSearchInput && faqList) {
        faqSearchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase().trim();
            const items = faqList.querySelectorAll('.faq-item');
            
            items.forEach(item => {
                const question = item.querySelector('.faq-question h3').textContent.toLowerCase();
                const answer = item.querySelector('.faq-answer').textContent.toLowerCase();
                const matches = question.includes(searchTerm) || answer.includes(searchTerm);
                
                item.style.display = matches || !searchTerm ? 'block' : 'none';
            });
        });
    }

    // Copy macro examples
    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const macroData = JSON.parse(btn.dataset.macro);
            const macroText = JSON.stringify(macroData, null, 2);
            
            try {
                await navigator.clipboard.writeText(macroText);
                const originalText = btn.innerHTML;
                btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Copied!';
                btn.style.background = '#10b981';
                btn.style.color = 'white';
                
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.style.background = '';
                    btn.style.color = '';
                }, 2000);
            } catch (err) {
                alert('Failed to copy. Please copy manually.');
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

    // Initialize new features
    initMobileNav();
    initHeroDemo();
    initNewsletter();
    initCalculator();
    initDemoTabs();
    initLazyLoading();
    
    // Interactive Demo
    const demoInput = document.getElementById('demo-input');
    const demoReset = document.getElementById('demo-reset');
    const demoExampleBtns = document.querySelectorAll('.demo-example-btn');

    // Enhanced demo macros
    const demoMacros = {
        '/email': 'john.doe@example.com',
        '/sig': 'Best regards,\nJohn Doe\nProduct Manager\nSent on ' + new Date().toLocaleDateString(),
        '/date': new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
        '/time': new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        '/thanks': 'Thank you for reaching out! I really appreciate you taking the time to contact us. I\'ll review your message and get back to you as soon as possible.',
        '/meeting': 'I would love to schedule a call to discuss this further. Would you be available for a 30-minute meeting this week? Here are some times that work for me:\n\n• Tuesday 2-4 PM\n• Wednesday 10 AM - 12 PM\n• Thursday 3-5 PM\n\nPlease let me know what works best for you!',
        '/func': 'function functionName(params) {\n  // TODO: Implement\n  return result;\n}',
        '/log': 'console.log(\'Debug:\', variableName);',
        '/fetch': 'const response = await fetch(url, {\n  method: \'GET\',\n  headers: {\n    \'Content-Type\': \'application/json\',\n  },\n});\nconst data = await response.json();'
    };

    // Handle demo input expansion
    function handleDemoExpansion(inputElement) {
        const text = inputElement.value;
        
        for (const [shortcut, expansion] of Object.entries(demoMacros)) {
            // Check if text ends with shortcut followed by space, enter, or punctuation
            const triggerPattern = new RegExp(shortcut.replace('/', '\\/') + '([ \\n.,!?;:]?)$');
            const match = text.match(triggerPattern);
            
            if (match) {
                const beforeShortcut = text.substring(0, text.length - shortcut.length - (match[1] ? 1 : 0));
                const trigger = match[1] || '';
                const newText = beforeShortcut + expansion + trigger;
                inputElement.value = newText;
                inputElement.setSelectionRange(newText.length, newText.length);
                
                // Show toast notification
                showExpansionToast();
                break;
            }
        }
    }
    
    // Expansion toast
    function showExpansionToast() {
        const toast = document.getElementById('expansion-toast');
        if (toast) {
            toast.classList.add('visible');
            setTimeout(() => {
                toast.classList.remove('visible');
            }, 2000);
        }
    }
    
    // Make handleDemoExpansion globally accessible
    window.handleDemoExpansion = handleDemoExpansion;

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
                    handleDemoExpansion(e.target);
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
    
    // Also handle scenario and code inputs
    ['scenario-input', 'code-input'].forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', (e) => {
                const text = e.target.value;
                const triggerChars = [' ', '\n', '.', ',', '!', '?', ';', ':'];
                const lastChar = text[text.length - 1];
                
                if (triggerChars.includes(lastChar)) {
                    setTimeout(() => handleDemoExpansion(e.target), 100);
                }
            });
        }
    });

    // Example buttons
    demoExampleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const shortcut = btn.dataset.shortcut;
            if (demoInput && demoMacros[shortcut]) {
                demoInput.value = shortcut + ' ';
                demoInput.focus();
                // Trigger expansion
                setTimeout(() => {
                    handleDemoExpansion(demoInput);
                }, 100);
            }
        });
    });

    // Update navigation based on auth status
    updateAuthNav();

    // Scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Observe elements for scroll animations
    document.querySelectorAll('.section-title, .download-card, .feature-card').forEach(el => {
        el.classList.add('fade-in-on-scroll');
        observer.observe(el);
    });

    // Add parallax effect to hero on scroll
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset;
        const hero = document.querySelector('.hero');
        if (hero && scrollTop < hero.offsetHeight) {
            hero.style.transform = `translateY(${scrollTop * 0.5}px)`;
        }
    });

    // Load extension download info
    loadExtensionInfo();
});

// Load extension information for download section
async function loadExtensionInfo() {
    try {
        const response = await fetch('/api/extension-info');
        if (response.ok) {
            const info = await response.json();
            
            // Update download button text
            const downloadBtnText = document.getElementById('download-btn-text');
            if (downloadBtnText) {
                downloadBtnText.textContent = `Download Extension v${info.version} (Latest)`;
            }
            
            // Update size info
            const extensionSize = document.getElementById('extension-size');
            if (extensionSize) {
                extensionSize.textContent = info.downloadSize || '~500 KB';
            }
        }
    } catch (error) {
        console.log('Could not load extension info:', error);
        // Fallback to default values
    }
}

// Update navigation based on authentication status
function updateAuthNav() {
    // Check if auth.js is loaded
    if (typeof AuthSystem !== 'undefined') {
        const auth = new AuthSystem();
        const user = auth.getCurrentUser();
        const authNav = document.getElementById('auth-nav');
        const userMenuNav = document.getElementById('user-menu-nav');
        const loginLink = document.getElementById('login-link');
        const dashboardLink = document.getElementById('dashboard-link');
        const logoutBtn = document.getElementById('logout-btn-nav');
        const logoutBtnNav = document.getElementById('logout-btn-nav');

        if (user && auth.checkSession()) {
            // User is logged in
            if (authNav) authNav.style.display = 'inline-flex';
            if (userMenuNav) {
                userMenuNav.style.display = 'inline-flex';
                userMenuNav.style.alignItems = 'center';
                userMenuNav.style.gap = '12px';
            }
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

