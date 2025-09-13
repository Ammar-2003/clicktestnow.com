document.addEventListener('DOMContentLoaded', () => {

    // DOM elements
    const keyboardTestArea = document.getElementById('keyboard-test-area');
    const keysPressedElement = document.getElementById('keys-pressed');
    const lastKeyElement = document.getElementById('last-key');
    const keyCodeElement = document.getElementById('key-code');
    const keyHistoryList = document.getElementById('key-history-list');
    const clearHistoryBtn = document.getElementById('clear-history');
    const resetKeysBtn = document.getElementById('reset-keys');

    // State variables
    let keysPressed = 0;
    let keyHistory = [];
    let activeKeys = new Set();
   
    // This variable will track if the keyboard area is currently active
    let isKeyboardAreaFocused = false;

    // We'll use a single event listener on the window for all key events to prevent browser
    // shortcuts, but we'll only do it if the keyboard test area is currently in focus.
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Initialize
    function init() {
        // We'll manage focus with click and blur events, making it less strict.
        keyboardTestArea.addEventListener('focus', () => {
            isKeyboardAreaFocused = true;
        });
       
        keyboardTestArea.addEventListener('blur', () => {
            isKeyboardAreaFocused = false;
        });
       
        // When clicking outside the test area, remove the focus
        document.body.addEventListener('click', (e) => {
            if (!keyboardTestArea.contains(e.target) && e.target !== keyboardTestArea) {
                keyboardTestArea.blur();
            }
        });

        // Add event listeners for the buttons
        clearHistoryBtn.addEventListener('click', clearHistory);
        resetKeysBtn.addEventListener('click', resetKeys);
       
        // Add click event to all keys for manual testing
        document.querySelectorAll('.key').forEach(key => {
            key.addEventListener('click', () => {
                const keyCode = key.getAttribute('data-key');
                simulateKeyPress(keyCode);
            });
        });
    }

    // Handle key down events
    function handleKeyDown(e) {
        // Only process the event if the keyboard test area is focused
        if (!isKeyboardAreaFocused) {
            return;
        }

        // Prevent Alt key from changing focus to the browser menu bar
        if (e.key === 'Alt' || e.key === 'Control') {
            e.preventDefault();
        }

        // Prevent default behavior for any key pressed in the test area
        e.preventDefault();
        e.stopPropagation();

        // Update stats
        keysPressed++;
        keysPressedElement.textContent = keysPressed;
       
        // Format the key display name
        let keyDisplay = e.key;
        if (e.key === ' ') keyDisplay = 'Space';
        else if (e.key.length > 1) keyDisplay = e.code.replace(/(Key|Digit|Arrow|Numpad)/, '');
       
        lastKeyElement.textContent = keyDisplay;
        keyCodeElement.textContent = e.code;
       
        // Add to history
        addToHistory(e, keyDisplay);
       
        // Highlight the key and keep it active
        highlightKey(e.code, true);
        activeKeys.add(e.code);
       
        return false;
    }
   
    // Handle key up events
    function handleKeyUp(e) {
        // Only process the event if the keyboard test area is focused
        if (!isKeyboardAreaFocused) {
            return;
        }
        // Prevent default behavior for any key released in the test area
        e.preventDefault();
        e.stopPropagation();
       
        // Remove from active keys but don't unhighlight visually
        activeKeys.delete(e.code);
       
        return false;
    }
   
    // Add key press to history
    function addToHistory(e, keyDisplay) {
        const now = new Date();
        const timeString = now.toLocaleTimeString();
       
        const historyItem = {
            key: keyDisplay,
            code: e.code,
            time: timeString
        };
       
        keyHistory.unshift(historyItem);
       
        // Limit history to 50 items
        if (keyHistory.length > 50) {
            keyHistory.pop();
        }
       
        // Update history display
        updateHistoryDisplay();
    }
   
    // Update history display
    function updateHistoryDisplay() {
        keyHistoryList.innerHTML = '';
       
        if (keyHistory.length === 0) {
            keyHistoryList.innerHTML = '<div class="key-history-item"><span>No keys pressed yet</span></div>';
            return;
        }
       
        keyHistory.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = 'key-history-item';
            historyItem.innerHTML = `
                <span>Key: <strong>${item.key}</strong></span>
                <span class="key-code">${item.code}</span>
                <span>${item.time}</span>
            `;
            keyHistoryList.appendChild(historyItem);
        });
    }
   
    // Highlight the pressed key
    function highlightKey(keyCode, activate) {
        // Find the matching key
        const keyElement = document.querySelector(`.key[data-key="${keyCode}"]`);
        if (keyElement) {
            if (activate) {
                keyElement.classList.add('active');
            } else {
                keyElement.classList.remove('active');
            }
        }
    }
   
    // Simulate key press for manual testing
    function simulateKeyPress(keyCode) {
        // Create a mock event object
        const mockEvent = {
            key: keyCode.replace('Key', '').replace('Digit', '').replace('Arrow', '').replace('Numpad', ''),
            code: keyCode,
            preventDefault: () => {}
        };
       
        // Update stats
        keysPressed++;
        keysPressedElement.textContent = keysPressed;
       
        let keyDisplay = mockEvent.key;
        if (keyDisplay.length === 0) keyDisplay = keyCode;
       
        lastKeyElement.textContent = keyDisplay;
        keyCodeElement.textContent = mockEvent.code;
       
        // Add to history
        addToHistory(mockEvent, keyDisplay);
       
        // Highlight the key and keep it active
        highlightKey(keyCode, true);
        activeKeys.add(keyCode);
    }
   
    // Clear history
    function clearHistory() {
        keysPressed = 0;
        keyHistory = [];
       
        keysPressedElement.textContent = '0';
        lastKeyElement.textContent = 'None';
        keyCodeElement.textContent = '-';
       
        updateHistoryDisplay();
       
        // Show confirmation
        showResult('History cleared successfully', 'success');
    }
   
    // Reset all keys (remove active state)
    function resetKeys() {
        activeKeys.clear();
        document.querySelectorAll('.key').forEach(key => {
            key.classList.remove('active');
        });
       
        showResult('All keys reset', 'success');
    }
   
    // Show result message
    function showResult(message, type) {
        // Remove any existing result message
        const existingResult = document.querySelector('.test-result');
        if (existingResult) {
            existingResult.remove();
        }
       
        // Create new result message
        const resultDiv = document.createElement('div');
        resultDiv.className = `test-result ${type}`;
        resultDiv.textContent = message;
       
        // Insert after test controls
        const testControls = document.querySelector('.test-controls');
        testControls.parentNode.insertBefore(resultDiv, testControls.nextSibling);
       
        // Remove after 3 seconds
        setTimeout(() => {
            resultDiv.remove();
        }, 3000);
    }
   
    // Initialize the keyboard tester
    init();
});

  // Function to auto-focus on the test area when page loads
  function focusKeyboardArea() {
    const testArea = document.getElementById("keyboard-test-area");
    if (testArea) {
      testArea.focus();
    }
  }

  // Run on page reload / load
  window.addEventListener("load", focusKeyboardArea);