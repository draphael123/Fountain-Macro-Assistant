// FAQ Toggle Functionality
document.addEventListener('DOMContentLoaded', function() {
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

    // Signature Demo Animation
    initSignatureDemo();
});

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

