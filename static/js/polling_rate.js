// DOM elements
const testArea = document.getElementById('test-area');
const pollingRateEl = document.getElementById('polling-rate');
const currentRateEl = document.getElementById('current-rate');
const avgRateEl = document.getElementById('avg-rate');
const minRateEl = document.getElementById('min-rate');
const maxRateEl = document.getElementById('max-rate');
const resetBtn = document.getElementById('reset-btn');
const themeToggle = document.getElementById('theme-toggle');
const hamburger = document.getElementById('hamburger');
const navMenu = document.querySelector('.nav-menu');

// Polling rate variables
let lastEventTime = null;
let eventIntervals = [];
const intervalHistory = 50;
let highestRecordedRate = 0;
let isTesting = false;
let maxRatesHistory = []; // store all max rates to calculate average

// Initialize
function init() {
    // Event listeners
    testArea.addEventListener('mousemove', handleMouseMove);
    testArea.addEventListener('mouseleave', handleMouseLeave);
    resetBtn.addEventListener('click', resetMeasurement);
    themeToggle.addEventListener('click', toggleTheme);
    hamburger.addEventListener('click', toggleMobileMenu);

    // Initialize stats display
    updateDisplay();

    // Highlight Polling Rate Tester nav
    highlightPollingNav();
}

// Handle mouse movement
function handleMouseMove(event) {
    if (!isTesting) {
        isTesting = true;
        testArea.style.borderStyle = 'solid';
        testArea.style.borderColor = 'var(--success)';
    }

    const now = performance.now();
    if (lastEventTime !== null) {
        const interval = now - lastEventTime;

        eventIntervals.push(interval);
        if (eventIntervals.length > intervalHistory) {
            eventIntervals.shift();
        }

        calculateStatistics();
    }
    lastEventTime = now;
}

// Handle mouse leaving test area
function handleMouseLeave() {
    isTesting = false;
    testArea.style.borderStyle = 'dashed';
    testArea.style.borderColor = 'var(--primary)';
    lastEventTime = null;
    eventIntervals = [];
    pollingRateEl.textContent = '-- Hz';
    currentRateEl.textContent = '-- Hz';
    avgRateEl.textContent = '-- Hz';
    minRateEl.textContent = '-- Hz';
    // Highest recorded rate persists
}

// Calculate statistics
function calculateStatistics() {
    if (eventIntervals.length < 2) return;

    const intervalsMs = eventIntervals.map(interval => interval);
    const rates = intervalsMs.map(ms => Math.round(1000 / ms));

    const minRate = Math.min(...rates);
    const maxRate = Math.max(...rates);
    const currentRate = maxRate;

    // Save max rates for average
    maxRatesHistory.push(maxRate);

    // Calculate average of max rates
    const sumMaxRates = maxRatesHistory.reduce((a, b) => a + b, 0);
    const avgMaxRate = Math.round(sumMaxRates / maxRatesHistory.length);

    // Update highest recorded rate
    if (maxRate > highestRecordedRate) {
        highestRecordedRate = maxRate;
    }

    // Update display
    pollingRateEl.textContent = `${currentRate} Hz`;
    currentRateEl.textContent = `${currentRate} Hz`;
    avgRateEl.textContent = `${avgMaxRate} Hz`; // average of max rates
    minRateEl.textContent = `${minRate} Hz`;
    maxRateEl.textContent = `${highestRecordedRate} Hz`;
}

// Reset measurement
function resetMeasurement() {
    lastEventTime = null;
    eventIntervals = [];
    highestRecordedRate = 0;
    maxRatesHistory = [];
    updateDisplay();
    testArea.style.borderStyle = 'dashed';
    testArea.style.borderColor = 'var(--primary)';
}

// Update display
function updateDisplay() {
    pollingRateEl.textContent = '-- Hz';
    currentRateEl.textContent = '-- Hz';
    avgRateEl.textContent = '-- Hz';
    minRateEl.textContent = '-- Hz';
    maxRateEl.textContent = '-- Hz';
}

// Toggle theme
function toggleTheme() {
    document.body.classList.toggle('light-mode');
}

// Toggle mobile menu
function toggleMobileMenu() {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
}

// Highlight Polling Rate Tester nav
function highlightPollingNav() {
    // Remove 'active' from all nav links
    document.querySelectorAll('.nav-item .nav-link').forEach(link => {
        link.classList.remove('active');
    });

    // Find the nav link that contains "Polling Rate Tester"
    const pollingNav = Array.from(document.querySelectorAll('.nav-item .nav-link'))
        .find(link => link.textContent.includes('Polling Rate Tester'));

    if (pollingNav) {
        pollingNav.classList.add('active');
    }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', init);
