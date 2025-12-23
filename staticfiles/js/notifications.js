/**
 * Professional Notification System
 * Production-ready with enhanced features
 */

class NotificationSystem {
    constructor() {
        this.container = null;
        this.notifications = [];
        this.timeouts = new Map(); // Use Map to track timeouts
        this.init();
    }

    init() {
        // Don't wait for DOMContentLoaded if script is at end of body
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        this.container = document.getElementById('notification-container');
        if (!this.container) return;

        this.notifications = Array.from(this.container.querySelectorAll('.notification-message'));
        this.setupNotifications();
    }

    setupNotifications() {
        this.notifications.forEach((notification, index) => {
            // Add progress bar
            this.addProgressBar(notification);
            
            // Store start time
            notification.dataset.startTime = Date.now();
            
            // Staggered entrance with bounce effect
            setTimeout(() => {
                notification.classList.add('show');
                // Announce to screen readers
                this.announceToScreenReader(notification);
            }, index * 150);

            // Setup auto-dismiss
            const duration = parseInt(notification.dataset.duration, 10) || 8000;
            this.setupAutoDismiss(notification, duration + index * 150);

            // Setup manual close
            this.setupCloseButton(notification);

            // Pause on hover
            this.setupHoverPause(notification);

            // Keyboard navigation
            this.setupKeyboardNavigation(notification);
        });

        // Event delegation for close buttons
        this.container.addEventListener('click', (e) => {
            if (e.target.classList.contains('notification-close')) {
                this.closeNotification(e.target.closest('.notification-message'));
            }
        });

        // Close all button (optional)
        this.addCloseAllButton();
    }

    addProgressBar(notification) {
        const progressBar = document.createElement('div');
        progressBar.className = 'notification-progress';
        progressBar.style.animationDuration = (parseInt(notification.dataset.duration, 10) || 8000) + 'ms';
        notification.appendChild(progressBar);
    }

    setupAutoDismiss(notification, duration) {
        const timeoutId = setTimeout(() => {
            this.closeNotification(notification);
        }, duration);

        // Store timeout ID
        this.timeouts.set(notification, timeoutId);
    }

    setupCloseButton(notification) {
        const closeBtn = notification.querySelector('.notification-close');
        if (closeBtn) {
            closeBtn.setAttribute('aria-label', 'Close notification');
            closeBtn.setAttribute('tabindex', '0');
            
            closeBtn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.closeNotification(notification);
                }
            });
        }
    }

    setupHoverPause(notification) {
        let isPaused = false;
        let remainingTime = null;
        
        notification.addEventListener('mouseenter', () => {
            if (this.timeouts.has(notification)) {
                const timeoutId = this.timeouts.get(notification);
                clearTimeout(timeoutId);
                this.timeouts.delete(notification);
                isPaused = true;
                
                // Calculate remaining time
                const duration = parseInt(notification.dataset.duration, 10) || 8000;
                const elapsed = Date.now() - parseInt(notification.dataset.startTime);
                remainingTime = duration - elapsed;
                
                // Pause progress bar animation
                const progressBar = notification.querySelector('.notification-progress');
                if (progressBar) {
                    progressBar.style.animationPlayState = 'paused';
                }
            }
        });

        notification.addEventListener('mouseleave', () => {
            if (isPaused && remainingTime > 0) {
                const newTimeoutId = setTimeout(() => {
                    this.closeNotification(notification);
                }, remainingTime);
                
                this.timeouts.set(notification, newTimeoutId);
                isPaused = false;
                
                // Resume progress bar animation
                const progressBar = notification.querySelector('.notification-progress');
                if (progressBar) {
                    progressBar.style.animationPlayState = 'running';
                }
            }
        });
    }

    setupKeyboardNavigation(notification) {
        notification.setAttribute('tabindex', '0');
        notification.setAttribute('role', 'alert');
        notification.setAttribute('aria-live', 'polite');
        
        notification.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeNotification(notification);
            }
        });
    }

    closeNotification(notification) {
        if (!notification) return;

        // Clear any pending timeout
        if (this.timeouts.has(notification)) {
            clearTimeout(this.timeouts.get(notification));
            this.timeouts.delete(notification);
        }

        // Animation
        notification.classList.remove('show');
        notification.classList.add('hide');
        notification.setAttribute('aria-hidden', 'true');

        // Remove from DOM after animation
        setTimeout(() => {
            const container = notification.parentElement;
            notification.remove();

            if (container && container.children.length === 0) {
                container.remove();
            }
            
            // Remove from array
            const index = this.notifications.indexOf(notification);
            if (index > -1) {
                this.notifications.splice(index, 1);
            }
        }, 300);
    }

    addCloseAllButton() {
        if (this.notifications.length > 1) {
            const closeAllBtn = document.createElement('button');
            closeAllBtn.className = 'notification-close-all';
            closeAllBtn.textContent = 'Close all';
            closeAllBtn.style.cssText = `
                position: absolute;
                top: -2.5rem;
                right: 0;
                background: rgba(0,0,0,0.1);
                border: none;
                padding: 0.25rem 0.75rem;
                border-radius: 4px;
                font-size: 0.75rem;
                cursor: pointer;
                color: inherit;
            `;
            
            closeAllBtn.addEventListener('click', () => {
                // Copy array to avoid modification during iteration
                const notificationsCopy = [...this.notifications];
                notificationsCopy.forEach(notification => {
                    this.closeNotification(notification);
                });
            });
            
            this.container.style.position = 'relative';
            this.container.appendChild(closeAllBtn);
        }
    }

    announceToScreenReader(notification) {
        const message = notification.querySelector('.notification-text')?.textContent || 
                       notification.textContent;
        const type = notification.classList.contains('success') ? 'Success' :
                    notification.classList.contains('error') ? 'Error' :
                    notification.classList.contains('warning') ? 'Warning' : 'Info';
        
        // Create aria-live region if it doesn't exist
        let liveRegion = document.getElementById('notification-live-region');
        if (!liveRegion) {
            liveRegion = document.createElement('div');
            liveRegion.id = 'notification-live-region';
            liveRegion.setAttribute('aria-live', 'polite');
            liveRegion.setAttribute('aria-atomic', 'true');
            liveRegion.className = 'sr-only';
            document.body.appendChild(liveRegion);
        }
        
        liveRegion.textContent = `${type}: ${message}`;
        
        // Clear after a few seconds
        setTimeout(() => {
            liveRegion.textContent = '';
        }, 3000);
    }

    // Public API for programmatic notifications
    static show(message, type = 'info', duration = 5000) {
        const container = document.getElementById('notification-container') || 
                         this.createContainer();
        
        const notification = this.createNotification(message, type, duration);
        container.appendChild(notification);
        
        // Reinitialize system
        new NotificationSystem();
    }

    static createContainer() {
        const container = document.createElement('div');
        container.id = 'notification-container';
        container.className = 'notification-container';
        document.body.appendChild(container);
        return container;
    }

    static createNotification(message, type, duration) {
        const notification = document.createElement('div');
        notification.className = `notification-message ${type}`;
        notification.dataset.duration = duration;
        
        const icons = {
            success: '✓',
            error: '✗',
            warning: '⚠',
            info: 'ℹ'
        };
        
        notification.innerHTML = `
            <div class="notification-icon-container">
                ${icons[type] || icons.info}
            </div>
            <div class="notification-content">
                <div class="notification-title">
                    <span>${type.charAt(0).toUpperCase() + type.slice(1)}</span>
                </div>
                <div class="notification-text">${message}</div>
            </div>
            <button type="button" class="notification-close" aria-label="Close notification">
                ×
            </button>
        `;
        
        return notification;
    }
}

// Initialize notification system
// Don't double-initialize if already loaded
if (!window.NotificationSystemInitialized) {
    window.NotificationSystemInitialized = true;
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            new NotificationSystem();
        });
    } else {
        new NotificationSystem();
    }
}

// Make available globally
window.NotificationSystem = NotificationSystem;

// Simple global function for quick notifications
window.showNotification = function(message, type = 'info', duration = 5000) {
    NotificationSystem.show(message, type, duration);
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NotificationSystem;
}