    document.addEventListener('DOMContentLoaded', function() {
        const container = document.getElementById('notification-container');
        if (!container) return;
        
        const notifications = container.querySelectorAll('.notification-message');
        
        // Function to show notifications with a staggered delay
        notifications.forEach((notification, index) => {
            setTimeout(() => {
                notification.classList.add('show');
            }, 100 * index);
            
            const duration = parseInt(notification.getAttribute('data-duration')) || 5000;
            
            // Auto-dismiss after duration
            setTimeout(() => {
                closeNotification(notification);
            }, duration + (100 * index));
        });
        
        // Add container to body to prevent layout shifts
        if (document.body) {
            document.body.appendChild(container);
        }
    });
    
    function closeNotification(notification) {
        if (!notification) return;
        
        notification.classList.remove('show');
        notification.classList.add('hide');
        
        setTimeout(() => {
            notification.remove();
            
            // Remove container if no notifications left
            const container = document.getElementById('notification-container');
            if (container && container.querySelectorAll('.notification-message').length === 0) {
                container.remove();
            }
        }, 300);
    }
    
    // Prevent body scrolling when notifications are present
    function updateBodyScroll() {
        const container = document.getElementById('notification-container');
        if (container && container.querySelectorAll('.notification-message').length > 0) {
            document.documentElement.style.overflow = 'hidden';
            document.body.style.overflow = 'hidden';
        } else {
            document.documentElement.style.overflow = '';
            document.body.style.overflow = '';
        }
    }
    
    // Observe DOM changes to update scroll behavior
    const observer = new MutationObserver(updateBodyScroll);
    observer.observe(document.body, { childList: true, subtree: true });