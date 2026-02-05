document.addEventListener('DOMContentLoaded', function() {
    // =============== LOGIN MODAL CODE ===============
    // DOM elements for login modal
    const loginModalOverlay = document.getElementById('loginModalOverlay');
    const loginModal = document.getElementById('loginModal');
    const modalClose = document.getElementById('modalClose');
    const modalSkipBtn = document.getElementById('modalSkipBtn');
    
    // Session storage keys
    const SESSION_SHOWN_KEY = 'loginPromptShownThisSession_1s_spacebar';
    const LAST_TEST_SCORE_KEY = 'last1sSpacebarTestScore';
    const LAST_TEST_PRESSES_KEY = 'last1sSpacebarTestPresses';
    
    // Check if popup was already shown in this session
    function hasPopupBeenShownThisSession() {
        return sessionStorage.getItem(SESSION_SHOWN_KEY) === 'true';
    }
    
    // Mark popup as shown for this session
    function markPopupAsShown() {
        sessionStorage.setItem(SESSION_SHOWN_KEY, 'true');
    }
    
    // Store test results for potential saving after login
    function storeTestResults(score, presses) {
        sessionStorage.setItem(LAST_TEST_SCORE_KEY, score);
        sessionStorage.setItem(LAST_TEST_PRESSES_KEY, presses);
    }
    
    // Clear stored test results
    function clearStoredTestResults() {
        sessionStorage.removeItem(LAST_TEST_SCORE_KEY);
        sessionStorage.removeItem(LAST_TEST_PRESSES_KEY);
    }
    
    // Show the modal with test results
    function showLoginModalWithResults(score, presses) {
        // Don't show if already shown in this session
        if (hasPopupBeenShownThisSession()) {
            return;
        }
        
        // Store the test results
        storeTestResults(score, presses);
        
        // Remove hidden class and add active class with a small delay
        if (loginModalOverlay) {
            loginModalOverlay.classList.remove('hidden');
            
            // Trigger reflow to ensure CSS transition works
            void loginModalOverlay.offsetWidth;
            
            // Add active class to trigger animations
            setTimeout(() => {
                loginModalOverlay.classList.add('active');
                if (loginModal) loginModal.classList.add('active');
            }, 10);
            
            // Mark as shown
            markPopupAsShown();
            
            // Add event listener to close when clicking outside the modal
            loginModalOverlay.addEventListener('click', closeOnOverlayClick);
        }
    }
    
    // Hide the modal
    function hideLoginModal() {
        if (!loginModalOverlay) return;
        
        // Remove active classes to trigger fade-out animation
        loginModalOverlay.classList.remove('active');
        if (loginModal) loginModal.classList.remove('active');
        
        // After animation completes, add hidden class
        setTimeout(() => {
            loginModalOverlay.classList.add('hidden');
        }, 400);
        
        // Remove the overlay click listener
        loginModalOverlay.removeEventListener('click', closeOnOverlayClick);
    }
    
    // Close modal when clicking outside the modal content
    function closeOnOverlayClick(e) {
        if (e.target === loginModalOverlay) {
            hideLoginModal();
        }
    }
    
    // Event listeners for login modal
    if (modalClose) {
        modalClose.addEventListener('click', hideLoginModal);
    }
    
    if (modalSkipBtn) {
        modalSkipBtn.addEventListener('click', hideLoginModal);
    }
    
    // Optional: Add keyboard support (ESC key to close)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && loginModalOverlay && !loginModalOverlay.classList.contains('hidden')) {
            hideLoginModal();
        }
    });
    
    // =============== 1-SECOND SPACEBAR TEST CODE ===============
    // Elements
    const testArea = document.getElementById('spacebar-test-area');
    const statusDisplay = document.getElementById('spacebar-status');
    const timerDisplay = document.getElementById('spacebar-timer');
    const pressesDisplay = document.getElementById('spacebar-presses');
    const userTestResults = document.getElementById('user-test-results');
    const userPosition = document.getElementById('user-position');
    const userScore = document.getElementById('user-score');
    const userPercentile = document.getElementById('user-percentile');
    const resetBtn = document.getElementById('spacebar-reset-btn');
    const saveBtn = document.getElementById('save-btn');
    const techniqueRecommendation = document.getElementById('technique-recommendation');
    const improvementTip = document.getElementById('improvement-tip');
    const leaderboardContent = document.getElementById('leaderboard-content');
    const cleanDivider = document.querySelector('.clean-divider');
    const loginPrompt = document.getElementById('loginPrompt');

    // Global state
    let testDuration = 1; // 1 second test
    let timeRemaining = testDuration;
    let pressCount = 0;
    let testState = 'idle'; // 'idle', 'countdown', 'active', 'ended', 'cooldown'
    let testInterval = null;
    let cooldownInterval = null;
    let countdownInterval = null;
    let startTime;
    let pressTimes = [];
    let testHistory = [];
    let isSpacebarHeld = false;
    
    // User authentication status
    let isUserAuthenticated = false;
    
    // Check authentication status via API
    function checkAuthentication() {
        return fetch('/check-authentication/')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                isUserAuthenticated = data.authenticated;
                return isUserAuthenticated;
            })
            .catch(error => {
                console.error('Error checking authentication:', error);
                return false; // Default to false on error
            });
    }
    
    // Initialize - check authentication on load
    checkAuthentication().then(isAuth => {
        isUserAuthenticated = isAuth;
        // Only auto-load leaderboard if user is authenticated
        if (isAuth && leaderboardContent) {
            loadLeaderboard();
        }
    });
    
    // Load leaderboard
    function loadLeaderboard() {
        fetch("/get-1-second-spacebar-leaderboard/")
            .then(res => res.json())
            .then(data => {
                if (leaderboardContent) {
                    leaderboardContent.innerHTML = "";

                    if (data.status === "success" && data.leaderboard.length > 0) {
                        data.leaderboard.forEach((item, index) => {
                            const date = new Date(item.created_at);
                            const formattedDate = date.toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric"
                            });

                            const rankClass = index === 0 ? "rank-1" : 
                                             index === 1 ? "rank-2" : 
                                             index === 2 ? "rank-3" : "other";

                            leaderboardContent.innerHTML += `
                                <tr class="leaderboard-item ${rankClass}">
                                    <td class="leaderboard-rank">#${index + 1}</td>
                                    <td class="leaderboard-player">${item.username}</td>
                                    <td class="leaderboard-score">${item.score} presses</td>
                                    <td class="leaderboard-date">${formattedDate}</td>
                                </tr>
                            `;
                        });
                        
                        if (data.top_player_stats) {
                            updateTopPlayerStats(data.top_player_stats);
                        }
                    } else {
                        leaderboardContent.innerHTML = `
                            <tr>
                                <td colspan="4" class="no-records">No records yet. Be the first!</td>
                            </tr>
                        `;
                    }
                }
            })
            .catch(() => {
                if (leaderboardContent) {
                    leaderboardContent.innerHTML = `
                        <tr>
                            <td colspan="4" class="no-records" style="color: var(--danger);">
                                Failed to load leaderboard
                            </td>
                        </tr>
                    `;
                }
            });
    }
    
    // Reset test button
    if (resetBtn) {
        resetBtn.addEventListener('click', resetTest);
    }
    
    // Test area click handler
    if (testArea) {
        testArea.addEventListener('click', function(e) {
            if (testState === 'idle' || testState === 'ended') {
                // Don't show login prompt on click - allow test to start
                if (loginPrompt && !isUserAuthenticated) {
                    loginPrompt.classList.add("hidden");
                }
                startTest();
                return;
            }
        });
    }

    // Spacebar key handler
    document.addEventListener('keydown', function(e) {
        if (e.code === 'Space' && !e.repeat) {
            e.preventDefault(); // Prevent scrolling
            
            // Do not register a press if the key is already being held down
            if (isSpacebarHeld) {
                return;
            }

            if (testState === 'idle' || testState === 'ended') {
                // Don't show login prompt on key press - allow test to start
                if (loginPrompt && !isUserAuthenticated) {
                    loginPrompt.classList.add("hidden");
                }
                startTest();
                isSpacebarHeld = true;
                return;
            }
            
            if (testState === 'active') {
                registerPress();
                isSpacebarHeld = true;
            }
        }
    });

    // New keyup handler to reset the held down flag
    document.addEventListener('keyup', function(e) {
        if (e.code === 'Space') {
            isSpacebarHeld = false;
        }
    });
    
    // Hide save button completely since we're auto-saving
    if (saveBtn) {
        saveBtn.style.display = 'none';
    }
    
    // Start the test
    function startTest() {
        if (testState !== 'idle' && testState !== 'ended') return;

        testState = 'countdown';
        pressCount = 0;
        pressTimes = [];
        timeRemaining = testDuration;
        isSpacebarHeld = false;

        if (testArea) {
            testArea.classList.remove('idle', 'ended');
            testArea.classList.add('countdown');
        }

        // 3-second countdown before test starts
        let countdown = 3;
        if (statusDisplay) {
            statusDisplay.innerHTML = `
                <div class="spacebar-timer">${countdown}</div>
                <div>Get ready to tap spacebar!</div>
                <div class="spacebar-key">SPACEBAR</div>
            `;
        }

        if (countdownInterval) {
            clearInterval(countdownInterval);
            countdownInterval = null;
        }
        
        countdownInterval = setInterval(() => {
            if (testState !== 'countdown') {
                clearInterval(countdownInterval);
                countdownInterval = null;
                return;
            }
            
            countdown--;
            if (countdown > 0 && statusDisplay) {
                statusDisplay.innerHTML = `
                    <div class="spacebar-timer">${countdown}</div>
                    <div>Get ready to tap spacebar!</div>
                    <div class="spacebar-key">SPACEBAR</div>
                `;
            } else {
                clearInterval(countdownInterval);
                countdownInterval = null;
                
                if (testState === 'countdown') {
                    testState = 'active';
                    if (testArea) {
                        testArea.classList.remove('countdown');
                        testArea.classList.add('active');
                    }
                    
                    if (statusDisplay) {
                        statusDisplay.innerHTML = `
                            <div class="spacebar-timer">${timeRemaining.toFixed(1)}</div>
                            <div class="spacebar-press-counter">Presses: ${pressCount}</div>
                            <div>Press spacebar as fast as you can!</div>
                            <div class="spacebar-key">SPACEBAR</div>
                        `;
                    }
                    
                    startTime = Date.now();
                    testInterval = setInterval(updateTimer, 10);
                }
            }
        }, 1000);
    }

    // Update the timer and status display
    function updateTimer() {
        if (testState !== 'active') {
            clearInterval(testInterval);
            testInterval = null;
            return;
        }
        
        const elapsed = (Date.now() - startTime) / 1000;
        timeRemaining = testDuration - elapsed;

        if (timeRemaining <= 0) {
            endTest();
            return;
        }

        const formattedTime = Math.max(0, timeRemaining).toFixed(1);

        if (timerDisplay) {
            timerDisplay.textContent = formattedTime;
        }

        if (statusDisplay) {
            const statusTimer = statusDisplay.querySelector('.spacebar-timer');
            if (statusTimer) {
                statusTimer.textContent = formattedTime;
            }
        }
    }
        
    // Register a spacebar press
    function registerPress() {
        if (testState !== 'active' || timeRemaining <= 0) return;
        
        pressCount++;
        const pressTime = Date.now();
        pressTimes.push(pressTime);
        
        const pressCounter = document.querySelector('.spacebar-press-counter');
        if (pressCounter) {
            pressCounter.textContent = `Presses: ${pressCount}`;
        }
        
        if (testArea) {
            const feedback = document.createElement('div');
            feedback.className = 'press-feedback';
            feedback.textContent = '+1';
            feedback.style.left = '50%';
            feedback.style.top = '50%';
            testArea.appendChild(feedback);
            
            setTimeout(() => {
                if (feedback.parentNode) {
                    feedback.remove();
                }
            }, 1000);
        }
    }
    
    // End the test
    async function endTest() {
        clearInterval(testInterval);
        testInterval = null;
        
        if (testState !== 'active') {
            return;
        }
        
        testState = 'ended';
        if (testArea) {
            testArea.classList.remove('active');
            testArea.classList.add('ended');
        }
        
        const totalTime = testDuration;
        
        // 🔧 STEP 1: FREEZE VARIABLES BEFORE ANY ASYNC WORK
        const frozenPresses = pressCount;
        const pressesPerSecond = frozenPresses / totalTime;
        
        // Calculate percentile (simplified estimation)
        let percentile = 50;
        if (frozenPresses >= 20) percentile = 95;
        else if (frozenPresses >= 18) percentile = 90;
        else if (frozenPresses >= 16) percentile = 80;
        else if (frozenPresses >= 14) percentile = 70;
        else if (frozenPresses >= 12) percentile = 60;
        else if (frozenPresses >= 10) percentile = 50;
        else if (frozenPresses >= 8) percentile = 40;
        else if (frozenPresses >= 6) percentile = 30;
        else if (frozenPresses >= 4) percentile = 20;
        else percentile = 10;
        
        // Generate improvement tip
        let tip = "";
        if (frozenPresses < 10) {
            tip = "Focus on using just one finger and minimizing the distance it travels between presses.";
        } else if (frozenPresses < 15) {
            tip = "Try to maintain a consistent rhythm rather than pressing as fast as possible in bursts.";
        } else if (frozenPresses < 18) {
            tip = "You're above average! Work on building finger stamina to maintain this speed.";
        } else if (frozenPresses < 20) {
            tip = "Excellent speed! Consider experimenting with different finger positions to find what's most comfortable.";
        } else {
            tip = "Elite level! You're among the fastest spacebar tappers. Share your technique with others!";
        }
        
        // 🔧 STEP 2: Update user test results with FROZEN values
        if (userPosition) userPosition.textContent = '--';
        if (userScore) userScore.textContent = frozenPresses;
        if (userPercentile) userPercentile.textContent = `Top ${100 - percentile}%`;
        
        if (userTestResults) {
            userTestResults.style.display = 'grid';
        }
        
        // Show improvement tip
        if (improvementTip) improvementTip.textContent = tip;
        if (techniqueRecommendation) techniqueRecommendation.style.display = 'block';
        
        // Check authentication status after test completion
        const authenticated = await checkAuthentication();
        
        // AUTO-SAVE if user is authenticated
        if (authenticated) {
            // 🔧 STEP 3: AUTO-SAVE with FROZEN values (THIS IS THE MOST IMPORTANT FIX)
            saveScoreToDatabase(frozenPresses, pressesPerSecond);
            
            if (statusDisplay) {
                statusDisplay.innerHTML = `
                    <div class="spacebar-timer">${frozenPresses}</div>
                    <div>Final Score</div>
                    <div class="spacebar-key">SPACEBAR</div>
                    <div style="margin-top: 10px; color: #4CAF50;">
                        <i class="fas fa-spinner fa-spin"></i> Saving to leaderboard...
                    </div>
                `;
            }
        } else {
            // User is not authenticated - show login popup after delay
            if (statusDisplay) {
                statusDisplay.innerHTML = `
                    <div class="spacebar-timer">${frozenPresses}</div>
                    <div>Final Score</div>
                    <div class="spacebar-key">SPACEBAR</div>
                    <div style="margin-top: 10px; color: #FFD700;">
                        <i class="fas fa-info-circle"></i> Login to save your score to the global leaderboard!
                    </div>
                `;
            }
            
            // 🔧 STEP 4: Login modal with FROZEN values
            setTimeout(() => {
                showLoginModalWithResults(frozenPresses, frozenPresses);
            }, 1500);
        }
        
        if (cleanDivider) {
            cleanDivider.style.display = 'block';
        }

        // Add to history
        const testResult = {
            date: new Date(),
            duration: testDuration,
            presses: frozenPresses,
            pressesPerSecond: pressesPerSecond
        };
        
        testHistory.unshift(testResult);
        
        if (testHistory.length > 10) {
            testHistory.pop();
        }
        
        // Set 3-second cooldown before allowing another test
        testState = 'cooldown';
        let cooldownTime = 3;
        
        if (cooldownInterval) {
            clearInterval(cooldownInterval);
            cooldownInterval = null;
        }
        
        cooldownInterval = setInterval(() => {
            if (testState !== 'cooldown') {
                clearInterval(cooldownInterval);
                cooldownInterval = null;
                return;
            }
            
            cooldownTime--;
            
            if (cooldownTime <= 0) {
                clearInterval(cooldownInterval);
                cooldownInterval = null;
                testState = 'ended';
                if (statusDisplay && authenticated) {
                    statusDisplay.innerHTML = `
                        <div class="spacebar-timer">${frozenPresses}</div>
                        <div>Final Score</div>
                        <div class="spacebar-key">SPACEBAR</div>
                        <div>Click to test again</div>
                    `;
                } else if (statusDisplay) {
                    statusDisplay.innerHTML = `
                        <div class="spacebar-timer">${frozenPresses}</div>
                        <div>Final Score</div>
                        <div class="spacebar-key">SPACEBAR</div>
                        <div>Click to test again | <span style="color: #FFD700;">Login to save score & compete globally</span></div>
                    `;
                }
            } else if (statusDisplay) {
                statusDisplay.innerHTML = `
                    <div class="spacebar-timer">${frozenPresses}</div>
                    <div>Final Score</div>
                    <div class="spacebar-key">SPACEBAR</div>
                    <div>Test area will be available in ${cooldownTime}s</div>
                `;
            }
        }, 1000);
    }
    
    // Reset the test
    function resetTest() {
        testState = 'idle';
        
        if (countdownInterval) {
            clearInterval(countdownInterval);
            countdownInterval = null;
        }
        
        if (testInterval) {
            clearInterval(testInterval);
            testInterval = null;
        }
        
        if (cooldownInterval) {
            clearInterval(cooldownInterval);
            cooldownInterval = null;
        }
        
        timeRemaining = testDuration;
        pressCount = 0;
        pressTimes = [];
        isSpacebarHeld = false;
        
        if (testArea) {
            testArea.className = 'spacebar-test-area idle';
        }
        
        if (statusDisplay) {
            statusDisplay.innerHTML = `
                <div class="spacebar-timer">${testDuration.toFixed(1)}</div>
                <div class="spacebar-press-counter">Presses: 0</div>
                <div class="spacebar-key">SPACEBAR</div>
                <div>Click or press spacebar to start test</div>
            `;
        }
        
        if (timerDisplay) {
            timerDisplay.textContent = testDuration.toFixed(1);
        }
        
        if (pressesDisplay) {
            pressesDisplay.textContent = '0';
        }
        
        if (userTestResults) {
            userTestResults.style.display = 'none';
        }
        if (techniqueRecommendation) {
            techniqueRecommendation.style.display = 'none';
        }
        if (cleanDivider) {
            cleanDivider.style.display = 'none';
        }
        
        if (testArea) {
            const feedbackElements = testArea.querySelectorAll('.press-feedback');
            feedbackElements.forEach(el => {
                if (el.parentNode) {
                    el.remove();
                }
            });
        }
        
        const overlays = document.querySelectorAll('.achievement-overlay');
        overlays.forEach(el => {
            el.style.animation = 'fadeOut 0.3s ease forwards';
            setTimeout(() => {
                if (el.parentNode) {
                    el.remove();
                }
            }, 300);
        });
    }
    
    // Save score to database for 1-second spacebar test
    function saveScoreToDatabase(score, pressesPerSecond) {
        fetch('/save-1-second-spacebar-score/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify({
                score: score,
                presses_per_second: pressesPerSecond
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                console.log('1-second spacebar score saved successfully');
                if (userPosition) {
                    userPosition.textContent = '#' + data.user_rank;
                }
                
                if (statusDisplay) {
                    statusDisplay.innerHTML = `
                        <div class="spacebar-timer">${score}</div>
                        <div>Final Score</div>
                        <div class="spacebar-key">SPACEBAR</div>
                        <div style="margin-top: 10px; color: #4CAF50;">
                            <i class="fas fa-check-circle"></i> Score saved to leaderboard! Rank: #${data.user_rank}
                        </div>
                    `;
                }
                
                if (data.user_rank <= 10) {
                    showAchievementAnimation(data.user_rank, score);
                }
                
                updateLeaderboard();
                
                if (data.top_player_stats) {
                    updateTopPlayerStats(data.top_player_stats);
                }
                
                if (data.is_new_record) {
                    showNotification('🎉 New World Record! 🎉', 'success');
                }
            } else {
                showNotification('Failed to save score: ' + (data.message || 'Unknown error'), 'error');
            }
        })
        .catch(error => {
            console.error('Error saving 1-second spacebar score:', error);
            showNotification('Failed to save score. Please try again.', 'error');
        });
    }
    
    // Show achievement animation for 1-second spacebar test
    function showAchievementAnimation(rank, score) {
        if (testState !== 'ended' && testState !== 'cooldown') {
            return;
        }
        
        const overlay = document.createElement('div');
        overlay.className = 'achievement-overlay';
        
        let icon, title, message;
        
        if (rank === 1) {
            icon = '👑';
            title = '1-SECOND SPACEBAR CHAMPION!';
            message = `You've achieved the #1 spot globally with ${score} spacebar presses in 1 second! Your tapping skills are unmatched.`;
        } else if (rank === 2) {
            icon = '🥈';
            title = 'SILVER MEDALIST!';
            message = `Amazing 1-second performance! You're the 2nd best worldwide with ${score} presses.`;
        } else if (rank === 3) {
            icon = '🥉';
            title = 'BRONZE MEDALIST!';
            message = `Outstanding speed! You've secured the 3rd position globally with ${score} presses in 1 second.`;
        } else if (rank <= 4) {
            icon = '⭐';
            title = 'TOP 4 ELITE!';
            message = `Incredible 1-second burst! You're among the top 4 spacebar tappers worldwide with ${score} presses.`;
        } else if (rank <= 10) {
            icon = '🏆';
            title = 'TOP 10 MASTER!';
            message = `Excellent 1-second speed! You've made it to the top 10 with ${score} presses. Keep pushing for the top!`;
        }
        
        overlay.innerHTML = `
            <div class="achievement-content">
                <div class="achievement-icon">${icon}</div>
                <h2 class="achievement-title">${title}</h2>
                <p class="achievement-message">${message}</p>
                <div class="achievement-rank">Rank: #${rank} | Score: ${score} presses | Duration: 1s</div>
                <button class="achievement-close">Continue</button>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        overlay.querySelector('.achievement-close').addEventListener('click', () => {
            overlay.style.animation = 'fadeOut 0.5s ease forwards';
            setTimeout(() => {
                if (overlay.parentNode) {
                    overlay.remove();
                }
            }, 500);
        });
    }
    
    // Update top player stats
    function updateTopPlayerStats(stats) {
        if (stats) {
            const topPlayerName = document.getElementById('top-player-name');
            const topPlayerScore = document.getElementById('top-player-score');
            
            if (topPlayerName) topPlayerName.textContent = stats.name || '--';
            if (topPlayerScore) topPlayerScore.textContent = (stats.score ? stats.score : '--') + ' presses';
        }
    }
    
    // Update leaderboard with latest data
    function updateLeaderboard() {
        if (!leaderboardContent) return;
        
        fetch('/get-1-second-spacebar-leaderboard/')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                renderLeaderboard(data.leaderboard);
                if (data.top_player_stats) {
                    updateTopPlayerStats(data.top_player_stats);
                }
            }
        })
        .catch(error => {
            console.error('Error fetching leaderboard:', error);
        });
    }
    
    // Render leaderboard data
    function renderLeaderboard(leaderboardData) {
        if (!leaderboardContent) return;
        
        let leaderboardHTML = '';
        
        if (leaderboardData.length === 0) {
            leaderboardHTML = `
                <tr>
                    <td colspan="4" class="no-records">No records yet. Be the first!</td>
                </tr>
            `;
        } else {
            leaderboardData.forEach((score, index) => {
                const rankClass = index === 0 ? 'rank-1' : 
                                     index === 1 ? 'rank-2' : 
                                     index === 2 ? 'rank-3' : 'other';
                
                const date = new Date(score.created_at);
                const formattedDate = date.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                });
                
                leaderboardHTML += `
                    <tr class="leaderboard-item ${rankClass}">
                        <td class="leaderboard-rank">#${index + 1}</td>
                        <td class="leaderboard-player">${score.username}</td>
                        <td class="leaderboard-score">${score.score} presses</td>
                        <td class="leaderboard-date">${formattedDate}</td>
                    </tr>
                `;
            });
        }
        
        leaderboardContent.innerHTML = leaderboardHTML;
    }
    
    // Show notification
    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 5000);
        
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.classList.add('fade-out');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        });
    }
    
    // Helper function to get CSRF token
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
    
    // Initialize
    resetTest();
    // Load leaderboard on page load
    if (leaderboardContent) {
        loadLeaderboard();
    }
});