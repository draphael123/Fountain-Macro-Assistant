// Main initialization
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all features
    initFAQ();
    initSmoothScrolling();
    initHeaderScroll();
    initDarkMode();
    initMobileMenu();
    initSignatureDemo();
    initHeroDemo();
    initSavingsCalculator();
    initPackagesGrid();
    initGuideSearch();
    initMacroBuilder();
    initDownloadVersion();
});

// ========================================
// DOWNLOAD VERSION INFO
// ========================================

async function initDownloadVersion() {
    const versionEl = document.getElementById('downloadVersion');
    if (!versionEl) return;
    
    try {
        const response = await fetch('/api/extension-info');
        if (response.ok) {
            const data = await response.json();
            versionEl.textContent = `Version ${data.version} • ${data.downloadSize}`;
        }
    } catch (e) {
        // Keep default text on error
        console.log('Could not fetch version info');
    }
}

// ========================================
// FAQ TOGGLE
// ========================================

function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        if (!question) return;
        
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Close all other FAQ items
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });
            
            // Toggle current item
            item.classList.toggle('active', !isActive);
        });
    });
}

// ========================================
// SMOOTH SCROLLING
// ========================================

function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                // Close mobile menu if open
                const nav = document.getElementById('mainNav');
                const menuBtn = document.getElementById('mobileMenuBtn');
                if (nav) nav.classList.remove('active');
                if (menuBtn) menuBtn.classList.remove('active');
                
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ========================================
// HEADER SCROLL EFFECT
// ========================================

function initHeaderScroll() {
    const header = document.querySelector('.header');
    if (!header) return;
    
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 100) {
            header.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
        } else {
            header.style.boxShadow = 'none';
        }
    });
}

// ========================================
// DARK MODE
// ========================================

function initDarkMode() {
    const toggle = document.getElementById('themeToggle');
    if (!toggle) return;
    
    // Get initial theme
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
    
    toggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
        }
    });
}

// ========================================
// MOBILE MENU
// ========================================

function initMobileMenu() {
    const menuBtn = document.getElementById('mobileMenuBtn');
    const nav = document.getElementById('mainNav');
    
    if (!menuBtn || !nav) return;
    
    menuBtn.addEventListener('click', () => {
        const isActive = nav.classList.contains('active');
        nav.classList.toggle('active', !isActive);
        menuBtn.classList.toggle('active', !isActive);
        menuBtn.setAttribute('aria-expanded', !isActive);
        
        // Prevent body scroll when menu is open
        document.body.style.overflow = isActive ? '' : 'hidden';
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!nav.contains(e.target) && !menuBtn.contains(e.target) && nav.classList.contains('active')) {
            nav.classList.remove('active');
            menuBtn.classList.remove('active');
            menuBtn.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        }
    });
}

// ========================================
// GUIDE SEARCH
// ========================================

function initGuideSearch() {
    const searchInput = document.getElementById('guideSearch');
    const searchClear = document.getElementById('searchClear');
    const searchResults = document.getElementById('searchResults');
    const guideContent = document.getElementById('guideContent');
    
    if (!searchInput || !guideContent) return;
    
    // Build search index from guide content
    const searchIndex = [];
    const sections = guideContent.querySelectorAll('.guide-section, .tip-card, .faq-item');
    
    sections.forEach((section, index) => {
        const title = section.querySelector('h3, h4')?.textContent || '';
        const content = section.textContent || '';
        searchIndex.push({
            id: index,
            title: title,
            content: content.substring(0, 200),
            element: section
        });
    });
    
    let debounceTimer;
    
    searchInput.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const query = searchInput.value.toLowerCase().trim();
            
            if (searchClear) {
                searchClear.style.display = query ? 'block' : 'none';
            }
            
            if (!query) {
                if (searchResults) searchResults.style.display = 'none';
                return;
            }
            
            const results = searchIndex.filter(item => 
                item.title.toLowerCase().includes(query) || 
                item.content.toLowerCase().includes(query)
            ).slice(0, 5);
            
            if (results.length > 0 && searchResults) {
                searchResults.innerHTML = results.map(r => `
                    <div class="search-result-item" data-id="${r.id}">
                        <h5>${highlightMatch(r.title, query)}</h5>
                        <p>${highlightMatch(r.content.substring(0, 100), query)}...</p>
                    </div>
                `).join('');
                searchResults.style.display = 'block';
                
                // Add click handlers
                searchResults.querySelectorAll('.search-result-item').forEach(item => {
                    item.addEventListener('click', () => {
                        const id = parseInt(item.dataset.id);
                        const targetSection = searchIndex[id]?.element;
                        if (targetSection) {
                            targetSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            targetSection.style.outline = '3px solid var(--primary-blue)';
                            setTimeout(() => targetSection.style.outline = '', 2000);
                        }
                        searchResults.style.display = 'none';
                        searchInput.value = '';
                        if (searchClear) searchClear.style.display = 'none';
                    });
                });
            } else if (searchResults) {
                searchResults.innerHTML = '<div class="search-result-item"><p>No results found</p></div>';
                searchResults.style.display = 'block';
            }
        }, 300);
    });
    
    if (searchClear) {
        searchClear.addEventListener('click', () => {
            searchInput.value = '';
            searchClear.style.display = 'none';
            if (searchResults) searchResults.style.display = 'none';
        });
    }
    
    // Close results when clicking outside
    document.addEventListener('click', (e) => {
        if (searchResults && !searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.style.display = 'none';
        }
    });
}

function highlightMatch(text, query) {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
}

// ========================================
// MACRO BUILDER
// ========================================

function initMacroBuilder() {
    const shortcutInput = document.getElementById('builderShortcut');
    const expansionInput = document.getElementById('builderExpansion');
    const previewShortcut = document.getElementById('previewShortcut');
    const previewOutput = document.getElementById('previewOutput');
    const varButtons = document.querySelectorAll('.var-btn');
    
    if (!shortcutInput || !expansionInput) return;
    
    function updatePreview() {
        if (previewShortcut) {
            previewShortcut.textContent = shortcutInput.value || '/example';
        }
        
        if (previewOutput) {
            let expansion = expansionInput.value || 'Your expansion will appear here...';
            
            // Replace variables with visual indicators
            expansion = expansion
                .replace(/\{date\}/g, '<span class="preview-input-field">[Today\'s Date]</span>')
                .replace(/\{time\}/g, '<span class="preview-input-field">[Current Time]</span>')
                .replace(/\{cursor\}/g, '<span class="preview-input-field">|</span>')
                .replace(/\{clipboard\}/g, '<span class="preview-input-field">[Clipboard]</span>')
                .replace(/\{input:([^}]+)\}/g, '<span class="preview-input-field">[$1]</span>')
                .replace(/\n/g, '<br>');
            
            previewOutput.innerHTML = expansion;
        }
    }
    
    shortcutInput.addEventListener('input', updatePreview);
    expansionInput.addEventListener('input', updatePreview);
    
    // Variable buttons
    varButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const variable = btn.dataset.var;
            if (variable && expansionInput) {
                const start = expansionInput.selectionStart;
                const end = expansionInput.selectionEnd;
                const text = expansionInput.value;
                
                expansionInput.value = text.substring(0, start) + variable + text.substring(end);
                expansionInput.focus();
                expansionInput.setSelectionRange(start + variable.length, start + variable.length);
                updatePreview();
            }
        });
    });
    
    // Initial preview
    updatePreview();
}

// ========================================
// HERO INTERACTIVE DEMO
// ========================================

function initHeroDemo() {
    const input = document.getElementById('heroDemoInput');
    const hint = document.getElementById('demoHint');
    const shortcuts = document.querySelectorAll('.demo-shortcut');
    
    if (!input) return;
    
    // Demo macros
    const demoMacros = {
        '/hello': 'Hello! Thanks for trying Fountain. This is an example of text expansion! 👋',
        '/date': new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
        '/sig': 'Best regards,\nJohn Doe\nSoftware Engineer\njohn@example.com',
        '/shrug': '¯\\_(ツ)_/¯'
    };
    
    let lastValue = '';
    
    input.addEventListener('input', function() {
        const value = this.value;
        
        // Check if user typed a space after a shortcut
        for (const [shortcut, expansion] of Object.entries(demoMacros)) {
            if (lastValue === shortcut && value === shortcut + ' ') {
                // Expand!
                this.value = expansion;
                this.classList.add('expanded');
                setTimeout(() => this.classList.remove('expanded'), 1000);
                break;
            }
        }
        
        // Show hint if typing a shortcut
        let showHint = false;
        for (const [shortcut, expansion] of Object.entries(demoMacros)) {
            if (shortcut.startsWith(value) && value.length > 0 && value !== shortcut) {
                hint.textContent = `💡 Type "${shortcut}" + Space to expand`;
                hint.classList.add('show');
                showHint = true;
                break;
            }
        }
        
        if (!showHint) {
            hint.classList.remove('show');
        }
        
        lastValue = value;
    });
    
    // Click on shortcut buttons to insert them
    shortcuts.forEach(btn => {
        btn.addEventListener('click', function() {
            const shortcut = this.dataset.shortcut;
            input.value = shortcut;
            input.focus();
            lastValue = shortcut;
            
            // Show hint
            hint.textContent = `💡 Press Space to expand "${shortcut}"`;
            hint.classList.add('show');
        });
    });
}

// ========================================
// SAVINGS CALCULATOR
// ========================================

function initSavingsCalculator() {
    const slider = document.getElementById('messagesPerDay');
    const messagesValue = document.getElementById('messagesValue');
    const dailySavings = document.getElementById('dailySavings');
    const weeklySavings = document.getElementById('weeklySavings');
    const yearlySavings = document.getElementById('yearlySavings');
    
    if (!slider) return;
    
    function calculateSavings() {
        const messages = parseInt(slider.value);
        messagesValue.textContent = messages;
        
        // Average: 18 seconds saved per message (19 - 1)
        const secondsPerDay = messages * 18;
        const minutesPerDay = Math.round(secondsPerDay / 60);
        const minutesPerWeek = minutesPerDay * 5; // Work days
        const hoursPerYear = Math.round((minutesPerDay * 250) / 60); // 250 work days
        
        dailySavings.textContent = minutesPerDay;
        weeklySavings.textContent = minutesPerWeek;
        yearlySavings.textContent = hoursPerYear;
    }
    
    slider.addEventListener('input', calculateSavings);
    calculateSavings(); // Initial calculation
}

// ========================================
// PACKAGES GRID
// ========================================

const WEBSITE_PACKAGES = [
    { 
        id: 'customer-service', 
        icon: '🎧', 
        name: 'Customer Service', 
        desc: 'Support replies & templates',
        macroCount: 8,
        preview: ['/csgreeting', '/cshold', '/csapology']
    },
    { 
        id: 'marketing', 
        icon: '📣', 
        name: 'Marketing', 
        desc: 'CTAs, social posts, email templates',
        macroCount: 8,
        preview: ['/mktcta', '/mktsocial', '/mktpromo']
    },
    { 
        id: 'developer', 
        icon: '💻', 
        name: 'Developer Kit', 
        desc: 'Code snippets & comments',
        macroCount: 8,
        preview: ['/devtodo', '/devclog', '/devpr']
    },
    { 
        id: 'sales', 
        icon: '💰', 
        name: 'Sales', 
        desc: 'Cold outreach, follow-ups, closing',
        macroCount: 6,
        preview: ['/salesintro', '/salesfollowup', '/salesdemo']
    },
    { 
        id: 'hr', 
        icon: '📋', 
        name: 'HR & Recruiting', 
        desc: 'Screening, offers, onboarding',
        macroCount: 6,
        preview: ['/hrack', '/hrinterview', '/hroffer']
    },
    { 
        id: 'education', 
        icon: '🎓', 
        name: 'Education', 
        desc: 'Feedback, citations, grading',
        macroCount: 6,
        preview: ['/edfeedback', '/edcitation', '/edgrade']
    }
];

function initPackagesGrid() {
    const grid = document.getElementById('websitePackagesGrid');
    if (!grid) return;
    
    grid.innerHTML = WEBSITE_PACKAGES.map(pkg => `
        <div class="web-package-card" data-id="${pkg.id}">
            <div class="web-package-icon">${pkg.icon}</div>
            <h4>${pkg.name}</h4>
            <p>${pkg.desc}</p>
            <div class="web-package-stats">
                <span>📝 ${pkg.macroCount} macros</span>
                <span>👤 Fountain</span>
            </div>
            <div class="web-package-preview">
                ${pkg.preview.map(p => `<code>${p}</code>`).join('')}
            </div>
            <div class="web-package-actions">
                <a href="#download" class="btn btn-primary">Get Extension</a>
            </div>
        </div>
    `).join('');
}

// Signature typing animation
function initSignatureDemo() {
    const typedText = document.getElementById('typedText');
    const cursor = document.getElementById('cursor');
    const expandedSig = document.getElementById('expandedSig');
    
    if (!typedText || !cursor || !expandedSig) return;

    const textToType = '/sig';
    let charIndex = 0;
    let isAnimating = false;
    let animationObserver = null;

    function resetAnimation() {
        typedText.textContent = '';
        expandedSig.style.opacity = '0';
        expandedSig.style.transform = 'translateY(10px)';
        expandedSig.style.animation = 'none';
        cursor.style.display = 'inline';
        charIndex = 0;
        isAnimating = false;
    }

    function typeCharacter() {
        if (charIndex < textToType.length) {
            typedText.textContent += textToType[charIndex];
            charIndex++;
            setTimeout(typeCharacter, 150 + Math.random() * 100);
        } else {
            // Typing complete, show "space" and trigger expansion
            setTimeout(() => {
                typedText.textContent += ' ';
                cursor.style.display = 'none';
                
                // Trigger expansion animation
                setTimeout(() => {
                    typedText.textContent = '';
                    expandedSig.style.animation = 'none';
                    expandedSig.offsetHeight; // Force reflow
                    expandedSig.style.animation = 'expandSig 0.5s ease forwards';
                    
                    // Reset and loop after delay
                    setTimeout(() => {
                        resetAnimation();
                        setTimeout(startTyping, 2000);
                    }, 4000);
                }, 300);
            }, 500);
        }
    }

    function startTyping() {
        if (isAnimating) return;
        isAnimating = true;
        typeCharacter();
    }

    // Use Intersection Observer to start animation when visible
    animationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !isAnimating) {
                setTimeout(startTyping, 500);
            }
        });
    }, { threshold: 0.3 });

    const demoSection = document.querySelector('.signature-showcase');
    if (demoSection) {
        animationObserver.observe(demoSection);
    }
}

