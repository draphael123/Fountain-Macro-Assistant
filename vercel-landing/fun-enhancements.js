// Fun Enhancements for Fountain Website
// Adds interactive and engaging elements

(function() {
    'use strict';

    // 1. Confetti on Button Clicks
    function initConfetti() {
        const downloadButtons = document.querySelectorAll('.btn-primary, .btn-download');
        
        downloadButtons.forEach(btn => {
            btn.addEventListener('click', function(e) {
                createConfetti(e.clientX, e.clientY);
            });
        });
    }

    function createConfetti(x, y) {
        const colors = ['#0066FF', '#00B8FF', '#FFFFFF', '#FFD700', '#FF6B6B'];
        const confettiCount = 30;
        
        for (let i = 0; i < confettiCount; i++) {
            const confetti = document.createElement('div');
            confetti.style.position = 'fixed';
            confetti.style.left = x + 'px';
            confetti.style.top = y + 'px';
            confetti.style.width = '8px';
            confetti.style.height = '8px';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
            confetti.style.pointerEvents = 'none';
            confetti.style.zIndex = '9999';
            confetti.style.opacity = '1';
            
            const angle = (Math.PI * 2 * i) / confettiCount;
            const velocity = 5 + Math.random() * 5;
            const vx = Math.cos(angle) * velocity;
            const vy = Math.sin(angle) * velocity;
            const rotation = Math.random() * 360;
            const rotationSpeed = (Math.random() - 0.5) * 10;
            
            document.body.appendChild(confetti);
            
            let posX = x;
            let posY = y;
            let currentRotation = rotation;
            let opacity = 1;
            const gravity = 0.3;
            let vy_current = vy;
            
            const animate = () => {
                posX += vx;
                posY += vy_current;
                vy_current += gravity;
                currentRotation += rotationSpeed;
                opacity -= 0.02;
                
                confetti.style.left = posX + 'px';
                confetti.style.top = posY + 'px';
                confetti.style.transform = `rotate(${currentRotation}deg)`;
                confetti.style.opacity = opacity;
                
                if (opacity > 0 && posY < window.innerHeight + 100) {
                    requestAnimationFrame(animate);
                } else {
                    confetti.remove();
                }
            };
            
            requestAnimationFrame(animate);
        }
    }

    // 2. Button Ripple Effect
    function initRippleEffects() {
        const buttons = document.querySelectorAll('.btn, .action-card, .feature-card');
        
        buttons.forEach(btn => {
            btn.addEventListener('click', function(e) {
                const ripple = document.createElement('span');
                const rect = btn.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;
                
                ripple.style.width = ripple.style.height = size + 'px';
                ripple.style.left = x + 'px';
                ripple.style.top = y + 'px';
                ripple.classList.add('ripple');
                
                btn.style.position = 'relative';
                btn.style.overflow = 'hidden';
                btn.appendChild(ripple);
                
                setTimeout(() => ripple.remove(), 600);
            });
        });
    }

    // 3. Animated Counters
    function initAnimatedCounters() {
        const counters = document.querySelectorAll('.stat-number, .stat-value');
        let animated = false;
        
        const animateCounter = (counter) => {
            const target = counter.textContent.trim();
            let num = 0;
            
            // Check if it's a number
            if (target === '∞') return; // Skip infinity symbol
            if (target.includes('⚡') || target.includes('🔒')) return; // Skip emojis
            
            const match = target.match(/(\d+)/);
            if (!match) return;
            
            const targetNum = parseInt(match[1]);
            const suffix = target.replace(/\d+/, '').trim();
            const duration = 2000;
            const increment = targetNum / (duration / 16);
            
            const updateCounter = () => {
                num += increment;
                if (num < targetNum) {
                    counter.textContent = Math.floor(num) + suffix;
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = targetNum + suffix;
                }
            };
            
            updateCounter();
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !animated) {
                    animated = true;
                    counters.forEach(animateCounter);
                }
            });
        }, { threshold: 0.5 });
        
        const statsSection = document.querySelector('.hero-stats, .dashboard-stats');
        if (statsSection) {
            observer.observe(statsSection);
        }
    }

    // 4. Scroll Progress Indicator
    function initScrollProgress() {
        const progressBar = document.createElement('div');
        progressBar.id = 'scroll-progress';
        progressBar.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            height: 4px;
            background: linear-gradient(90deg, #0066FF, #00B8FF);
            width: 0%;
            z-index: 10000;
            transition: width 0.1s ease;
        `;
        document.body.appendChild(progressBar);
        
        window.addEventListener('scroll', () => {
            const windowHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrolled = (window.scrollY / windowHeight) * 100;
            progressBar.style.width = scrolled + '%';
        });
    }

    // 5. Easter Egg: Konami Code
    function initEasterEgg() {
        const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];
        let konamiIndex = 0;
        
        document.addEventListener('keydown', (e) => {
            if (e.code === konamiCode[konamiIndex]) {
                konamiIndex++;
                if (konamiIndex === konamiCode.length) {
                    // Konami code entered!
                    triggerEasterEgg();
                    konamiIndex = 0;
                }
            } else {
                konamiIndex = 0;
            }
        });
    }

    function triggerEasterEgg() {
        // Create massive confetti shower
        for (let i = 0; i < 100; i++) {
            setTimeout(() => {
                createConfetti(
                    Math.random() * window.innerWidth,
                    Math.random() * window.innerHeight
                );
            }, i * 10);
        }
        
        // Show surprise message
        const message = document.createElement('div');
        message.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #0066FF, #00B8FF);
            color: white;
            padding: 30px 60px;
            border-radius: 20px;
            font-size: 24px;
            font-weight: bold;
            z-index: 10001;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            animation: scaleIn 0.5s ease;
        `;
        message.textContent = '🎉 You found the secret! 🎉';
        document.body.appendChild(message);
        
        setTimeout(() => {
            message.style.animation = 'scaleOut 0.5s ease';
            setTimeout(() => message.remove(), 500);
        }, 3000);
    }

    // 6. Enhanced Hover Effects
    function initEnhancedHovers() {
        const cards = document.querySelectorAll('.feature-card, .action-card, .stat-card');
        
        cards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-8px) scale(1.02)';
                this.style.transition = 'transform 0.3s ease';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0) scale(1)';
            });
        });
    }

    // 7. Logo Click Easter Egg
    function initLogoEasterEgg() {
        const logo = document.querySelector('.logo, .logo-text');
        if (!logo) return;
        
        let clickCount = 0;
        let clickTimer;
        
        logo.addEventListener('click', function() {
            clickCount++;
            clearTimeout(clickTimer);
            
            clickTimer = setTimeout(() => {
                if (clickCount >= 5) {
                    createConfetti(window.innerWidth / 2, window.innerHeight / 2);
                    clickCount = 0;
                } else {
                    clickCount = 0;
                }
            }, 500);
        });
    }

    // Initialize all fun features
    function init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
            return;
        }
        
        initConfetti();
        initRippleEffects();
        initAnimatedCounters();
        initScrollProgress();
        initEasterEgg();
        initEnhancedHovers();
        initLogoEasterEgg();
    }

    init();
})();








