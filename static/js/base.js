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