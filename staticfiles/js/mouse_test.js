        document.addEventListener('DOMContentLoaded', () => {
            const currentAction = document.getElementById('current-action');
            const resetAllButton = document.getElementById('reset-all-tests');
            const mouseContainer = document.querySelector('.mouse-container');
            const modeButtons = document.querySelectorAll('.mode-btn');
            
            // Set initial mode
            let currentMode = 'office';
            
            // Visual mouse elements
            const visLeftButton = document.getElementById('vis-left-button');
            const visRightButton = document.getElementById('vis-right-button');
            const visMiddleButton = document.getElementById('vis-middle-button');
            const visSideButton1 = document.getElementById('vis-side-button-1');
            const visSideButton2 = document.getElementById('vis-side-button-2');
            const visSideButton3 = document.getElementById('vis-side-button-3');
            const visSideButton4 = document.getElementById('vis-side-button-4');
            const visDpiButton = document.getElementById('vis-dpi-button');
            const scrollUpArrow = document.getElementById('scroll-up-arrow');
            const scrollDownArrow = document.getElementById('scroll-down-arrow');
            
            // Button elements and counters
            const buttons = {
                0: { count: document.getElementById('left-count'), counter: 0, visElement: visLeftButton, name: 'Left Button' },
                1: { count: document.getElementById('middle-count'), counter: 0, visElement: visMiddleButton, name: 'Middle Button' },
                2: { count: document.getElementById('right-count'), counter: 0, visElement: visRightButton, name: 'Right Button' },
                3: { count: document.getElementById('side1-count'), counter: 0, visElement: visSideButton1, name: 'Side Button 1 (Back)' },
                4: { count: document.getElementById('side2-count'), counter: 0, visElement: visSideButton2, name: 'Side Button 2 (Forward)' },
                5: { count: document.getElementById('side3-count'), counter: 0, visElement: visSideButton3, name: 'Side Button 3' },
                6: { count: document.getElementById('side4-count'), counter: 0, visElement: visSideButton4, name: 'Side Button 4' },
                7: { count: document.getElementById('dpi-count'), counter: 0, visElement: visDpiButton, name: 'DPI Button' }
            };

            let scrollUpEvents = 0;
            let scrollDownEvents = 0;
            let otherButtonEvents = 0;
            
            // Function to create a blink effect
            function blinkElement(element) {
                element.classList.add('clicked');
                setTimeout(() => {
                    element.classList.remove('clicked');
                }, 200);
            }

            // Mode switching functionality
            function switchMode(mode) {
                currentMode = mode;
                
                // Update active button
                modeButtons.forEach(btn => {
                    if (btn.dataset.mode === mode) {
                        btn.classList.add('active');
                    } else {
                        btn.classList.remove('active');
                    }
                });
                
                // Show/hide elements based on mode
                const gamingHiddenElements = document.querySelectorAll('.gaming-hidden');
                gamingHiddenElements.forEach(el => {
                    if (mode === 'office') {
                        el.classList.add('gaming-hidden');
                    } else {
                        el.classList.remove('gaming-hidden');
                    }
                });
            }
            
            // Add event listeners to mode buttons
            modeButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    switchMode(btn.dataset.mode);
                });
            });

            // Initialize the UI correctly
            switchMode('office');

            // Prevent browser scrolling when mouse is over the visualizer
            mouseContainer.addEventListener('wheel', (e) => {
                e.preventDefault();
            }, { passive: false });

            // Button test functionality
            document.addEventListener('mousedown', (e) => {
                // Prevent browser navigation on side buttons (Back/Forward)
                if (e.button === 3 || e.button === 4) {
                    e.preventDefault();
                }
                
                // Prevent middle-click scrolling behavior
                if (e.button === 1) {
                    e.preventDefault();
                }
                
                const buttonInfo = buttons[e.button];
                if (buttonInfo) {
                    // Only process gaming buttons if in gaming mode
                    if ((e.button >= 3 || e.button === 7) && currentMode !== 'gaming') {
                        return;
                    }
                    
                    buttonInfo.counter = (buttonInfo.counter || 0) + 1;
                    if (buttonInfo.count) {
                        buttonInfo.count.textContent = buttonInfo.counter;
                    }
                    
                    if (buttonInfo.visElement) {
                        blinkElement(buttonInfo.visElement);
                    }
                    
                    currentAction.textContent = `${buttonInfo.name} clicked!`;
                    currentAction.className = 'current-action action-success';

                } else if (e.button >= 8 && currentMode === 'gaming') {
                    otherButtonEvents++;
                    document.getElementById('other-count').textContent = otherButtonEvents;
                    currentAction.textContent = `Other button (${e.button}) clicked!`;
                    currentAction.className = 'current-action action-warning';
                }
            });
            
            document.addEventListener('contextmenu', (e) => e.preventDefault());
            
            // Scroll test functionality
            document.addEventListener('wheel', (e) => {
                e.preventDefault(); // Prevent page scrolling
                
                if (e.deltaY < 0) {
                    scrollUpEvents++;
                    document.getElementById('scroll-up-count').textContent = scrollUpEvents;
                    currentAction.textContent = 'Scroll Up detected';
                    
                    scrollUpArrow.classList.add('active');
                    setTimeout(() => {
                        scrollUpArrow.classList.remove('active');
                    }, 200);
                } else {
                    scrollDownEvents++;
                    document.getElementById('scroll-down-count').textContent = scrollDownEvents;
                    currentAction.textContent = 'Scroll Down detected';
                    
                    scrollDownArrow.classList.add('active');
                    setTimeout(() => {
                        scrollDownArrow.classList.remove('active');
                    }, 200);
                }
                
                currentAction.className = 'current-action action-success';
            });
            
            // Reset functionality
            resetAllButton.addEventListener('click', () => {
                for (const key in buttons) {
                    buttons[key].counter = 0;
                    if (buttons[key].count) {
                        buttons[key].count.textContent = '0';
                    }
                }
                scrollUpEvents = 0;
                scrollDownEvents = 0;
                otherButtonEvents = 0;
                document.getElementById('scroll-up-count').textContent = '0';
                document.getElementById('scroll-down-count').textContent = '0';
                document.getElementById('other-count').textContent = '0';
                currentAction.textContent = 'All tests have been reset.';
                currentAction.className = 'current-action action-success';
            });
        });
        window.addEventListener('mousedown', (e) => {
    if (e.button === 3 || e.button === 4) {
        e.preventDefault();
        e.stopPropagation();
        console.log("Blocked mouse button:", e.button);
        return false;
    }
});

window.addEventListener('mouseup', (e) => {
    if (e.button === 3 || e.button === 4) {
        e.preventDefault();
        e.stopPropagation();
        console.log("Blocked mouse button:", e.button);
        return false;
    }
});