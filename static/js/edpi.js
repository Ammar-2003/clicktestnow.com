// Theme toggle functionality
const themeToggle = document.getElementById('theme-toggle');
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    document.body.classList.toggle('dark-mode');
    
    const icon = themeToggle.querySelector('i');
    if (document.body.classList.contains('light-mode')) {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
    } else {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    }
});

// Mobile menu toggle
const hamburger = document.getElementById('hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    hamburger.classList.toggle('active');
});

// eDPI Calculator functionality
const calculateBtn = document.getElementById('calculate-btn');
const resetBtn = document.getElementById('reset-btn');
const dpiInput = document.getElementById('dpi');
const sensitivityInput = document.getElementById('sensitivity');
const edpiResult = document.getElementById('edpi-result');
const sensitivityLevel = document.getElementById('sensitivity-level');

calculateBtn.addEventListener('click', () => {
    const dpi = parseFloat(dpiInput.value);
    const sensitivity = parseFloat(sensitivityInput.value);
    
    if (isNaN(dpi) || isNaN(sensitivity)) {
        alert('Please enter valid numbers for both DPI and Sensitivity');
        return;
    }
    
    if (dpi <= 0 || sensitivity <= 0) {
        alert('Values must be greater than zero');
        return;
    }
    
    const edpi = dpi * sensitivity;
    edpiResult.textContent = Math.round(edpi);
    
    // Determine sensitivity level
    if (edpi < 500) {
        sensitivityLevel.textContent = 'Very Low';
    } else if (edpi < 1000) {
        sensitivityLevel.textContent = 'Low';
    } else if (edpi < 2000) {
        sensitivityLevel.textContent = 'Medium';
    } else if (edpi < 4000) {
        sensitivityLevel.textContent = 'High';
    } else {
        sensitivityLevel.textContent = 'Very High';
    }
});

resetBtn.addEventListener('click', () => {
    dpiInput.value = '';
    sensitivityInput.value = '';
    edpiResult.textContent = '--';
    sensitivityLevel.textContent = '--';
});

// Allow Enter key to trigger calculation
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        calculateBtn.click();
    }
});

// Highlight eDPI Calculator nav link
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.nav-item .nav-link').forEach(link => {
        link.classList.remove('active');
    });

    const edpiNav = Array.from(document.querySelectorAll('.nav-item .nav-link'))
        .find(link => link.textContent.includes('eDPI Calculator'));

    if (edpiNav) {
        edpiNav.classList.add('active');
    }
});
