document.addEventListener('keydown', function(e) {
    // Prevent spacebar from scrolling the page in all cases
    if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault();
    }
});


