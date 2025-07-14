/**
 * Coordinates - Main JavaScript
 * Public website functionality for rekursing.com
 * IDX-WEB-001: Main website JavaScript
 */

// ===== GLOBAL VARIABLES =====
let isNavOpen = false;
let currentPlanet = 'earth';
let scrollPosition = 0;

// ===== DOM ELEMENTS =====
const navbar = document.getElementById('navbar');
const navMenu = document.getElementById('nav-menu');
const navToggle = document.getElementById('nav-toggle');
const planetCards = document.querySelectorAll('.planet-card');
const contactForm = document.getElementById('contactForm');

// ===== NAVIGATION =====
function initNavigation() {
    // Mobile menu toggle
    if (navToggle) {
        navToggle.addEventListener('click', toggleMobileMenu);
    }

    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80; // Account for fixed navbar
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                if (isNavOpen) {
                    toggleMobileMenu();
                }
            }
        });
    });

    // Navbar scroll effect
    window.addEventListener('scroll', handleNavbarScroll);
}

function toggleMobileMenu() {
    isNavOpen = !isNavOpen;
    navMenu.classList.toggle('active', isNavOpen);
    navToggle.classList.toggle('active', isNavOpen);
    
    // Prevent body scroll when menu is open
    document.body.style.overflow = isNavOpen ? 'hidden' : '';
}

function handleNavbarScroll() {
    const currentScroll = window.pageYOffset;
    
    // Add/remove scrolled class for styling
    if (currentScroll > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    
    // Hide/show navbar on scroll
    if (currentScroll > scrollPosition && currentScroll > 200) {
        navbar.style.transform = 'translateY(-100%)';
    } else {
        navbar.style.transform = 'translateY(0)';
    }
    
    scrollPosition = currentScroll;
}

// ===== PLANET INTERACTIONS =====
function initPlanetInteractions() {
    planetCards.forEach(card => {
        card.addEventListener('click', () => {
            const planet = card.dataset.planet;
            setActivePlanet(planet);
        });
    });
}

function setActivePlanet(planet) {
    // Remove active class from all cards
    planetCards.forEach(card => card.classList.remove('active'));
    
    // Add active class to selected card
    const selectedCard = document.querySelector(`[data-planet="${planet}"]`);
    if (selectedCard) {
        selectedCard.classList.add('active');
    }
    
    currentPlanet = planet;
    
    // Update planet showcase
    updatePlanetShowcase(planet);
}

function updatePlanetShowcase(planet) {
    const planetData = {
        earth: {
            name: 'Earth',
            gravity: 'Standard',
            atmosphere: 'Blue Sky',
            description: 'Home world with balanced physics and familiar terrain.'
        },
        mars: {
            name: 'Mars',
            gravity: 'Low',
            atmosphere: 'Red Dust',
            description: 'Red planet with low gravity and enhanced mobility.'
        },
        moon: {
            name: 'Moon',
            gravity: 'Very Low',
            atmosphere: 'None',
            description: 'Lunar surface with extreme jumping and precise combat.'
        },
        jupiter: {
            name: 'Jupiter',
            gravity: 'High',
            atmosphere: 'Gas Clouds',
            description: 'Gas giant with high gravity and powerful weapons.'
        },
        venus: {
            name: 'Venus',
            gravity: 'Medium',
            atmosphere: 'Thick Clouds',
            description: 'Mysterious world with unique visual effects and challenges.'
        }
    };
    
    const data = planetData[planet];
    if (data) {
        // Update planet info display
        const planetInfo = document.querySelector('.planet-info');
        if (planetInfo) {
            planetInfo.innerHTML = `
                <h3 class="planet-name">${data.name}</h3>
                <p class="planet-description">${data.description}</p>
                <div class="planet-stats">
                    <div class="planet-stat">
                        <span class="stat-label">Gravity</span>
                        <span class="stat-value">${data.gravity}</span>
                    </div>
                    <div class="planet-stat">
                        <span class="stat-label">Atmosphere</span>
                        <span class="stat-value">${data.atmosphere}</span>
                    </div>
                </div>
            `;
        }
    }
}

// ===== ANIMATIONS =====
function initAnimations() {
    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animateElements = document.querySelectorAll('.feature-card, .ai-card, .tech-category, .planet-card');
    animateElements.forEach(el => observer.observe(el));
    
    // Parallax effect for hero section
    window.addEventListener('scroll', handleParallax);
}

function handleParallax() {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll('.planet');
    
    parallaxElements.forEach((element, index) => {
        const speed = 0.5 + (index * 0.1);
        const yPos = -(scrolled * speed);
        element.style.transform = `translateY(${yPos}px)`;
    });
}

// ===== FORM HANDLING =====
function initContactForm() {
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmit);
    }
}

async function handleContactSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(contactForm);
    const data = Object.fromEntries(formData);
    
    // Show loading state
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="btn-text">Sending...</span><span class="btn-icon">⏳</span>';
    submitBtn.disabled = true;
    
    try {
        // Simulate form submission (replace with actual API call)
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Show success message
        showNotification('Message sent successfully! We\'ll get back to you soon.', 'success');
        contactForm.reset();
        
    } catch (error) {
        console.error('Form submission error:', error);
        showNotification('Failed to send message. Please try again.', 'error');
        
    } finally {
        // Reset button state
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// ===== NOTIFICATIONS =====
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 400px;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// ===== PERFORMANCE MONITORING =====
function initPerformanceMonitoring() {
    // Monitor page load performance
    window.addEventListener('load', () => {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        console.log(`Page loaded in ${loadTime}ms`);
        
        // Send to analytics if needed
        if (typeof gtag !== 'undefined') {
            gtag('event', 'timing_complete', {
                name: 'load',
                value: loadTime
            });
        }
    });
    
    // Monitor scroll performance
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            // Throttled scroll handling
        }, 16); // ~60fps
    });
}

// ===== UTILITY FUNCTIONS =====
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ===== GAME LAUNCHER =====
function initGameLauncher() {
    const launchBtn = document.querySelector('a[href="/game"]');
    if (launchBtn) {
        launchBtn.addEventListener('click', (e) => {
            e.preventDefault();
            launchGame();
        });
    }
}

function launchGame() {
    // Show loading state
    const launcherStatus = document.querySelector('.launcher-status');
    const progressFill = document.querySelector('.progress-fill');
    
    if (launcherStatus && progressFill) {
        launcherStatus.textContent = 'Initializing...';
        progressFill.style.width = '25%';
        
        setTimeout(() => {
            launcherStatus.textContent = 'Loading assets...';
            progressFill.style.width = '50%';
        }, 1000);
        
        setTimeout(() => {
            launcherStatus.textContent = 'Connecting to server...';
            progressFill.style.width = '75%';
        }, 2000);
        
        setTimeout(() => {
            launcherStatus.textContent = 'Launching game...';
            progressFill.style.width = '100%';
            
            // Redirect to game after loading
            setTimeout(() => {
                window.location.href = '/game';
            }, 500);
        }, 3000);
    }
}

// ===== ANALYTICS =====
function initAnalytics() {
    // Track page views
    if (typeof gtag !== 'undefined') {
        gtag('config', 'GA_MEASUREMENT_ID', {
            page_title: document.title,
            page_location: window.location.href
        });
    }
    
    // Track button clicks
    const trackButtons = document.querySelectorAll('.btn');
    trackButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const buttonText = btn.querySelector('.btn-text')?.textContent || 'Unknown Button';
            if (typeof gtag !== 'undefined') {
                gtag('event', 'button_click', {
                    button_name: buttonText,
                    page_location: window.location.href
                });
            }
        });
    });
}

// ===== ACCESSIBILITY =====
function initAccessibility() {
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        // Escape key closes mobile menu
        if (e.key === 'Escape' && isNavOpen) {
            toggleMobileMenu();
        }
        
        // Tab key navigation
        if (e.key === 'Tab') {
            document.body.classList.add('keyboard-navigation');
        }
    });
    
    // Mouse navigation
    document.addEventListener('mousedown', () => {
        document.body.classList.remove('keyboard-navigation');
    });
    
    // Focus management
    const focusableElements = document.querySelectorAll('a, button, input, textarea, select');
    focusableElements.forEach(el => {
        el.addEventListener('focus', () => {
            el.classList.add('focused');
        });
        
        el.addEventListener('blur', () => {
            el.classList.remove('focused');
        });
    });
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Coordinates website initializing...');
    
    // Initialize all modules
    initNavigation();
    initPlanetInteractions();
    initAnimations();
    initContactForm();
    initGameLauncher();
    initPerformanceMonitoring();
    initAnalytics();
    initAccessibility();
    
    // Set initial planet
    setActivePlanet('earth');
    
    console.log('✅ Coordinates website initialized successfully');
});

// ===== EXPORTS =====
// Make functions available globally for debugging
window.CoordinatesWebsite = {
    setActivePlanet,
    showNotification,
    launchGame,
    toggleMobileMenu
};

// ===== ERROR HANDLING =====
window.addEventListener('error', (e) => {
    console.error('Website error:', e.error);
    
    // Send error to analytics if needed
    if (typeof gtag !== 'undefined') {
        gtag('event', 'exception', {
            description: e.error?.message || 'Unknown error',
            fatal: false
        });
    }
});

// ===== SERVICE WORKER REGISTRATION =====
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
} 