// Main JavaScript file for Pharmacy Website
// Handles initialization, utility functions, and global interactions

// Global state management
const PharmacyApp = {
    initialized: false,
    currentUser: null,
    isOnline: navigator.onLine,
    
    // Initialize the application
    init() {
        if (this.initialized) return;
        
        console.log('🏥 Initializing Pharmacy Website...');
        
        // Initialize all components
        this.initializeEventListeners();
        this.initializeScrollEffects();
        this.initializeMobileMenu();
        this.initializeOnlineStatus();
        // Service Worker removed - was causing 404 errors
        this.initializeLazyLoading();
        
        // Check for saved user session
        this.checkUserSession();
        
        // Initialize managers (they auto-initialize, but we ensure they're ready)
        this.ensureManagersReady();
        
        this.initialized = true;
        console.log('✅ Pharmacy Website initialized successfully');
    },
    
    // Initialize global event listeners
    initializeEventListeners() {
        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => this.handleSmoothScroll(e));
        });
        
        // Handle form submissions
        document.addEventListener('submit', (e) => this.handleFormSubmission(e));
        
        // Handle keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeyboardNavigation(e));
        
        // Handle window resize
        window.addEventListener('resize', this.debounce(() => this.handleWindowResize(), 250));
        
        // Handle scroll events
        window.addEventListener('scroll', this.throttle(() => this.handleScroll(), 16));
        
        // Handle visibility change (tab switching)
        document.addEventListener('visibilitychange', () => this.handleVisibilityChange());
    },
    
    // Initialize scroll effects
    initializeScrollEffects() {
        // Add scroll-based animations
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
        document.querySelectorAll('.service-card, .product-card, .tier-card').forEach(el => {
            observer.observe(el);
        });
    },
    
    // Initialize mobile menu functionality
    initializeMobileMenu() {
        const mobileToggle = document.querySelector('.mobile-menu-toggle');
        const navMenu = document.querySelector('.nav-menu');
        
        if (mobileToggle && navMenu) {
            mobileToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                mobileToggle.classList.toggle('active');
                
                // Update aria attributes for accessibility
                const isOpen = navMenu.classList.contains('active');
                mobileToggle.setAttribute('aria-expanded', isOpen);
                navMenu.setAttribute('aria-hidden', !isOpen);
            });
            
            // Close mobile menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!mobileToggle.contains(e.target) && !navMenu.contains(e.target)) {
                    navMenu.classList.remove('active');
                    mobileToggle.classList.remove('active');
                    mobileToggle.setAttribute('aria-expanded', 'false');
                    navMenu.setAttribute('aria-hidden', 'true');
                }
            });
        }
    },
    
    // Initialize online/offline status handling
    initializeOnlineStatus() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.showNotification('success', 'Conexión restaurada');
            this.syncOfflineData();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.showNotification('warning', 'Sin conexión a internet. Algunas funciones pueden no estar disponibles.');
        });
    },
    
    // Service Worker functionality removed to prevent 404 errors
    // Can be re-enabled when sw.js file is created
    
    // Initialize lazy loading for images
    initializeLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                });
            });
            
            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }
    },
    
    // Check for saved user session
    checkUserSession() {
        const savedSession = localStorage.getItem('pharmacy-user-session');
        if (savedSession) {
            try {
                const session = JSON.parse(savedSession);
                if (session.expires > Date.now()) {
                    this.currentUser = session.user;
                    this.handleUserLogin(session.user);
                } else {
                    localStorage.removeItem('pharmacy-user-session');
                }
            } catch (e) {
                console.error('Error loading user session:', e);
                localStorage.removeItem('pharmacy-user-session');
            }
        }
    },
    
    // Ensure all managers are ready
    ensureManagersReady() {
        const managers = ['productManager', 'cartManager', 'appointmentManager', 'loyaltyManager'];
        
        managers.forEach(managerName => {
            if (!window[managerName]) {
                console.warn(`${managerName} not found. Some functionality may be limited.`);
            }
        });
    },
    
    // Handle smooth scrolling
    handleSmoothScroll(e) {
        e.preventDefault();
        const targetId = e.currentTarget.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            const headerHeight = document.querySelector('.header').offsetHeight;
            const targetPosition = targetElement.offsetTop - headerHeight - 20;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    },
    
    // Handle form submissions
    handleFormSubmission(e) {
        const form = e.target;
        
        // Add loading state to submit buttons
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.classList.add('loading');
            submitBtn.disabled = true;
            
            // Remove loading state after a delay (will be overridden by actual form handling)
            setTimeout(() => {
                submitBtn.classList.remove('loading');
                submitBtn.disabled = false;
            }, 3000);
        }
    },
    
    // Handle keyboard navigation
    handleKeyboardNavigation(e) {
        // Close modals with Escape key
        if (e.key === 'Escape') {
            const activeModal = document.querySelector('.modal.active');
            if (activeModal) {
                activeModal.classList.remove('active');
            }
            
            const activeOverlay = document.querySelector('.search-overlay.active');
            if (activeOverlay) {
                activeOverlay.classList.remove('active');
            }
        }
        
        // Quick search with Ctrl/Cmd + K
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            openSearchModal();
        }
    },
    
    // Handle window resize
    handleWindowResize() {
        // Update mobile menu state
        if (window.innerWidth > 768) {
            const navMenu = document.querySelector('.nav-menu');
            const mobileToggle = document.querySelector('.mobile-menu-toggle');
            
            if (navMenu && mobileToggle) {
                navMenu.classList.remove('active');
                mobileToggle.classList.remove('active');
                mobileToggle.setAttribute('aria-expanded', 'false');
                navMenu.setAttribute('aria-hidden', 'true');
            }
        }
    },
    
    // Handle scroll events
    handleScroll() {
        const header = document.querySelector('.header');
        if (header) {
            if (window.scrollY > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }
        
        // Update scroll progress indicator
        this.updateScrollProgress();
    },
    
    // Handle visibility change (tab switching)
    handleVisibilityChange() {
        if (document.hidden) {
            // Page is hidden - pause any animations or timers
            console.log('Page hidden - pausing activities');
        } else {
            // Page is visible - resume activities
            console.log('Page visible - resuming activities');
            
            // Refresh data if needed
            if (this.currentUser) {
                this.refreshUserData();
            }
        }
    },
    
    // Update scroll progress indicator
    updateScrollProgress() {
        const scrollProgress = document.querySelector('.scroll-progress');
        if (scrollProgress) {
            const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
            scrollProgress.style.width = `${Math.min(scrollPercent, 100)}%`;
        }
    },
    
    // Handle user login
    handleUserLogin(user) {
        this.currentUser = user;
        
        // Update UI for logged-in state
        this.updateUserInterface();
        
        // Initialize loyalty program
        if (window.loyaltyManager) {
            window.loyaltyManager.login(user.email);
        }
        
        // Save session
        const session = {
            user: user,
            expires: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
        };
        localStorage.setItem('pharmacy-user-session', JSON.stringify(session));
    },
    
    // Handle user logout
    handleUserLogout() {
        this.currentUser = null;
        
        // Update UI for logged-out state
        this.updateUserInterface();
        
        // Logout from loyalty program
        if (window.loyaltyManager) {
            window.loyaltyManager.logout();
        }
        
        // Clear session
        localStorage.removeItem('pharmacy-user-session');
    },
    
    // Update user interface based on login state
    updateUserInterface() {
        const loginBtn = document.getElementById('login-btn');
        const userStatus = document.getElementById('user-loyalty-status');
        
        if (this.currentUser) {
            if (loginBtn) {
                loginBtn.innerHTML = '<i class="fas fa-user-check"></i>';
                loginBtn.title = `Conectado como ${this.currentUser.name}`;
            }
            
            if (userStatus) {
                userStatus.style.display = 'block';
            }
        } else {
            if (loginBtn) {
                loginBtn.innerHTML = '<i class="fas fa-user"></i>';
                loginBtn.title = 'Iniciar sesión';
            }
            
            if (userStatus) {
                userStatus.style.display = 'none';
            }
        }
    },
    
    // Refresh user data
    refreshUserData() {
        if (!this.currentUser) return;
        
        // Refresh loyalty data
        if (window.loyaltyManager) {
            window.loyaltyManager.updateDisplay();
        }
        
        // Refresh cart data
        if (window.cartManager) {
            window.cartManager.updateCartDisplay();
        }
    },
    
    // Sync offline data when connection is restored
    syncOfflineData() {
        // Sync cart data
        const offlineCart = localStorage.getItem('pharmacy-cart-offline');
        if (offlineCart) {
            try {
                const cartData = JSON.parse(offlineCart);
                // Merge with current cart
                if (window.cartManager) {
                    cartData.forEach(item => {
                        window.cartManager.addItem(item.productId, item.quantity);
                    });
                }
                localStorage.removeItem('pharmacy-cart-offline');
            } catch (e) {
                console.error('Error syncing offline cart:', e);
            }
        }
        
        // Sync appointment data
        const offlineAppointments = localStorage.getItem('pharmacy-appointments-offline');
        if (offlineAppointments) {
            // Handle offline appointments sync
            localStorage.removeItem('pharmacy-appointments-offline');
        }
    },
    
    // Show notification
    showNotification(type, message, duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'exclamation-triangle' : 'info'}"></i>
            <span>${message}</span>
            <button class="notification-close" onclick="this.parentNode.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        document.body.appendChild(notification);

        // Auto-remove after specified duration
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, duration);
    },
    
    // Utility functions
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    throttle(func, limit) {
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
    },
    
    // Format currency
    formatCurrency(amount, currency = 'EUR') {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: currency
        }).format(amount);
    },
    
    // Format date
    formatDate(date, options = {}) {
        const defaultOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        
        const formatOptions = { ...defaultOptions, ...options };
        const currentLang = window.translations?.getCurrentLanguage() || 'es';
        
        return new Intl.DateTimeFormat(currentLang, formatOptions).format(new Date(date));
    },
    
    // Validate email
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },
    
    // Validate phone
    validatePhone(phone) {
        const phoneRegex = /^[+]?[\d\s\-\(\)]{9,}$/;
        return phoneRegex.test(phone);
    }
};

// Global utility functions
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const headerHeight = document.querySelector('.header').offsetHeight;
        const targetPosition = section.offsetTop - headerHeight - 20;
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }
}

function openAppointmentModal(serviceType = '') {
    if (window.appointmentManager) {
        window.appointmentManager.openAppointmentModal(serviceType);
    }
}

function openSearchModal() {
    if (window.productManager) {
        const searchOverlay = document.getElementById('search-overlay') || createSearchModal();
        searchOverlay.classList.add('active');
        
        const searchInput = searchOverlay.querySelector('.search-input');
        if (searchInput) {
            searchInput.focus();
        }
    }
}

// Demo login function (for testing purposes)
function demoLogin() {
    const demoUser = {
        id: 1,
        name: 'Usuario Demo',
        email: 'demo@farmacia.com',
        phone: '+34 123 456 789'
    };
    
    PharmacyApp.handleUserLogin(demoUser);
    PharmacyApp.showNotification('success', `¡Bienvenido, ${demoUser.name}!`);
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    PharmacyApp.init();
    
    // Add demo login button functionality
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) {
        loginBtn.addEventListener('click', function() {
            if (PharmacyApp.currentUser) {
                // User is logged in, show user menu or logout
                if (confirm('¿Deseas cerrar sesión?')) {
                    PharmacyApp.handleUserLogout();
                    PharmacyApp.showNotification('info', 'Sesión cerrada');
                }
            } else {
                // User is not logged in, show demo login
                demoLogin();
            }
        });
    }
});

// Export for use in other modules
window.PharmacyApp = PharmacyApp;