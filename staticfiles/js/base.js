document.addEventListener('keydown', function(e) {
    // Prevent spacebar from scrolling the page in all cases
    if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault();
    }
});

const hamburger = document.getElementById('hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', toggleMobileMenu);

function toggleMobileMenu() {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
}

        // Toggle section expansion
        document.addEventListener('DOMContentLoaded', function() {
            const sectionHeaders = document.querySelectorAll('.pt-section-header');
            
            sectionHeaders.forEach(header => {
                header.addEventListener('click', function() {
                    const section = this.parentElement;
                    section.classList.toggle('open');
                });
            });
            
            // Simple script to highlight the current page in the sidebar
            const currentPath = window.location.pathname;
            const ptLinks = document.querySelectorAll('.pt-link');
            
            ptLinks.forEach(link => {
                // Extract the URL pattern from the href attribute
                const href = link.getAttribute('href');
                if (href && currentPath.includes(href.replace('{% url ', '').replace(' %}', '').replace(/'/g, ''))) {
                    link.classList.add('active');
                    
                    // Expand the parent section if it's collapsed
                    const section = link.closest('.pt-section');
                    if (section && !section.classList.contains('open')) {
                        section.classList.add('open');
                    }
                }
            });
        });

(function () {
  const sidebar = document.querySelector('.pt-sidebar');
  const footer = document.querySelector('footer'); // adjust selector if your footer is different
  if (!sidebar) return;

  // Smooth throttle using requestAnimationFrame
  let ticking = false;

  function shouldShowSidebar(scrollY, vh) {
    const showThreshold = Math.round(); // 10% of viewport height
    if (scrollY <= showThreshold) return false; // near top -> hide

    // Determine footer absolute top (fallback to Infinity if no footer)
    let footerTop = Infinity;
    if (footer) {
      const rect = footer.getBoundingClientRect();
      footerTop = rect.top + scrollY;
    }

    const nearFooter = (scrollY + vh) > (footerTop - 50); // hide 50px before footer
    return !nearFooter;
  }

  function update() {
    ticking = false;
    const scrollY = window.scrollY || window.pageYOffset;
    const vh = window.innerHeight;

    if (shouldShowSidebar(scrollY, vh)) {
      if (!sidebar.classList.contains('visible')) {
        sidebar.classList.add('visible');
        sidebar.setAttribute('aria-hidden', 'false');
      }
    } else {
      if (sidebar.classList.contains('visible')) {
        sidebar.classList.remove('visible');
        sidebar.setAttribute('aria-hidden', 'true');
      }
    }
  }

  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(update);
      ticking = true;
    }
  }

  // Use passive listener for performance
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });

  // Run once immediately to set correct initial state (handles reload-mid-page)
  update();
})();