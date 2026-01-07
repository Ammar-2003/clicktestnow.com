        document.addEventListener("DOMContentLoaded", function () {

    const hamburger = document.getElementById("hamburger");
    const navMenu = document.querySelector(".nav-menu");

    if (hamburger && navMenu) {
        hamburger.addEventListener("click", () => {
            hamburger.classList.toggle("active");
            navMenu.classList.toggle("active");
        });
    }

    // Mobile dropdown click
    document.querySelectorAll(".dropdown-toggle").forEach(toggle => {
        toggle.addEventListener("click", function (e) {
            if (window.innerWidth <= 968) {
                e.preventDefault();
                this.parentElement.classList.toggle("active");
            }
        });
    });

    // Desktop hover dropdown
    document.querySelectorAll(".nav-item.dropdown").forEach(dropdown => {
        dropdown.addEventListener("mouseenter", () => {
            if (window.innerWidth > 968) dropdown.classList.add("active");
        });

        dropdown.addEventListener("mouseleave", () => {
            if (window.innerWidth > 968) dropdown.classList.remove("active");
        });
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", function (e) {
        if (!e.target.closest(".nav-item.dropdown")) {
            document.querySelectorAll(".nav-item.dropdown").forEach(dropdown => {
                dropdown.classList.remove("active");
            });
        }
    });

    // Multi-column dropdown detection
    document.querySelectorAll(".dropdown-menu").forEach(menu => {
        if (menu.querySelectorAll("a").length > 6) {
            menu.classList.add("multi-column");
        }
    });

});

document.addEventListener('keydown', function(e) {
    // Prevent spacebar from scrolling the page in all cases
    if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault();
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const yourScoreBox = document.getElementById('yourScoreBox');
    const userTestResults = document.getElementById('user-test-results');

    // Exit safely if page doesn't have CPS test
    if (!yourScoreBox || !userTestResults) return;

    // Always start hidden
    yourScoreBox.style.display = 'none';

    // Watch for display changes on results grid
    const observer = new MutationObserver(() => {
        const isVisible =
            userTestResults.style.display === 'grid' ||
            userTestResults.style.display === 'flex' ||
            userTestResults.offsetParent !== null;

        yourScoreBox.style.display = isVisible ? 'inline-flex' : 'none';
    });

    observer.observe(userTestResults, {
        attributes: true,
        attributeFilter: ['style', 'class']
    });
});
