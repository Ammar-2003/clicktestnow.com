document.addEventListener('DOMContentLoaded', function() {
    // Measurement variables
    let startX, startY, endX, endY;
    let distancePixels = 0;
    let dpi = 0;
    let isMeasuring = false;

    // Accuracy tracking
    let lastY = null;
    let totalDeviation = 0;
    let totalSteps = 0;

    const targetInches = 1; // Fixed at 1 inch as requested

    // DOM elements
    const movementContainer = document.getElementById('movement-container');
    const resetButton = document.getElementById('reset-btn');
    const resultDisplay = document.getElementById('result');
    const pixelsDisplay = document.getElementById('pixels');
    const accuracyDisplay = document.getElementById('accuracy');
    const movementTracker = document.getElementById('movement-tracker');
    const instructions = document.getElementById('instructions');
    const themeToggle = document.getElementById('theme-toggle');
    const endPoint = document.querySelector('.end-point');
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.querySelector('.nav-menu');

    // Initialize the tool
    function initTool() {
        resetButton.addEventListener('click', resetMeasurement);

        // Start measurement on container mouse movement
        movementContainer.addEventListener('mousedown', handleMouseDown);
        movementContainer.addEventListener('mousemove', handleMouseMove);
        movementContainer.addEventListener('mouseup', handleMouseUp);
        movementContainer.addEventListener('mouseleave', handleMouseUp);
        
        // Set dark mode by default
        document.body.classList.add('dark-mode');
    }

    // Toggle mobile menu
    function toggleMobileMenu() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    }


    function handleMouseDown(e) {
        isMeasuring = true;
        startX = e.clientX;
        startY = e.clientY;
        lastY = startY;
        totalDeviation = 0;
        totalSteps = 0;

        // Position the tracker
        const rect = movementContainer.getBoundingClientRect();
        movementTracker.style.left = (e.clientX - rect.left - 6) + 'px';
        movementTracker.style.top = (e.clientY - rect.top - 6) + 'px';
        movementTracker.classList.remove('hidden');

        // Hide end point
        endPoint.classList.add('hidden');

        // Update UI
        resultDisplay.textContent = 'Measuring...';
        resultDisplay.classList.remove('text-success', 'text-danger');
        instructions.textContent = 'Moving... Keep the line straight!';

        e.preventDefault();
    }

    function handleMouseMove(e) {
        if (!isMeasuring) return;

        endX = e.clientX;
        endY = e.clientY;

        // Calculate total straight-line distance in pixels
        distancePixels = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));

        // DPI = distance moved / 1 inch
        dpi = Math.round(distancePixels / targetInches);

        // Update UI values
        pixelsDisplay.textContent = Math.round(distancePixels);
        resultDisplay.textContent = dpi;

        // Track vertical deviation
        if (lastY !== null) {
            let deviation = Math.abs(endY - lastY);
            totalDeviation += deviation;
            totalSteps++;
        }
        lastY = endY;

        // Calculate accuracy = how straight user moved
        const accuracy = calculateAccuracy(totalDeviation, totalSteps);
        accuracyDisplay.textContent = Math.round(accuracy) + '%';

        // Color code based on accuracy
        if (accuracy >= 90) {
            accuracyDisplay.classList.add('text-success');
            accuracyDisplay.classList.remove('text-danger');
            resultDisplay.classList.add('text-success');
            resultDisplay.classList.remove('text-danger');
        } else if (accuracy >= 70) {
            accuracyDisplay.classList.remove('text-success', 'text-danger');
            resultDisplay.classList.remove('text-success', 'text-danger');
        } else {
            accuracyDisplay.classList.add('text-danger');
            accuracyDisplay.classList.remove('text-success');
            resultDisplay.classList.add('text-danger');
            resultDisplay.classList.remove('text-success');
        }

        // Move tracker
        const rect = movementContainer.getBoundingClientRect();
        movementTracker.style.left = (e.clientX - rect.left - 6) + 'px';
        movementTracker.style.top = (e.clientY - rect.top - 6) + 'px';
    }

    function calculateAccuracy(totalDeviation, totalSteps) {
        if (totalSteps === 0) return 100;

        // Average vertical deviation per step
        const avgDeviation = totalDeviation / totalSteps;

        // Accuracy drops as deviation grows
        let accuracy = 100 - avgDeviation * 5; // sensitivity factor
        return Math.max(0, Math.min(100, accuracy));
    }

    function handleMouseUp() {
        if (!isMeasuring) return;

        isMeasuring = false;

        // Show end point
        const rect = movementContainer.getBoundingClientRect();
        endPoint.style.left = (endX - rect.left - 4) + 'px';
        endPoint.style.top = (endY - rect.top - 4) + 'px';
        endPoint.classList.remove('hidden');

        // Update UI
        instructions.textContent = 'Measurement complete. Reset to try again';
    }

    // Reset measurement
    function resetMeasurement() {
        isMeasuring = false;
        startX = startY = endX = endY = 0;
        distancePixels = dpi = 0;
        lastY = null;
        totalDeviation = 0;
        totalSteps = 0;

        // Reset UI
        movementTracker.classList.add('hidden');
        endPoint.classList.add('hidden');
        resultDisplay.textContent = '--';
        pixelsDisplay.textContent = '0';
        accuracyDisplay.textContent = '--';
        resultDisplay.classList.remove('text-success', 'text-danger');
        accuracyDisplay.classList.remove('text-success', 'text-danger');
        instructions.textContent = 'Hold Click and move your mouse straight for 1 inch on your physical mousepad';
    }

    // Initialize the tool when page loads
    initTool();
});
