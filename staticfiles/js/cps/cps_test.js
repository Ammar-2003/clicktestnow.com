document.addEventListener("DOMContentLoaded", () => {
    const leaderboardContent = document.getElementById("leaderboard-content");

    fetch("/get-cps-leaderboard/")
        .then(res => res.json())
        .then(data => {
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
                            <td class="leaderboard-score">${item.score.toFixed(1)} CPS</td>
                            <td class="leaderboard-date">${formattedDate}</td>
                        </tr>
                    `;
                });
                
                // Update top player stats from API response
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
        })
        .catch(() => {
            leaderboardContent.innerHTML = `
                <tr>
                    <td colspan="4" class="no-records" style="color: var(--danger);">
                        Failed to load leaderboard
                    </td>
                </tr>
            `;
        });
});

document.addEventListener('DOMContentLoaded', function() {
    // =============== LOGIN MODAL CODE ===============
    // DOM elements for login modal
    const loginModalOverlay = document.getElementById('loginModalOverlay');
    const loginModal = document.getElementById('loginModal');
    const modalClose = document.getElementById('modalClose');
    const modalSkipBtn = document.getElementById('modalSkipBtn');
    
    // Session storage keys
    const SESSION_SHOWN_KEY = 'loginPromptShownThisSession_cps';
    const LAST_TEST_SCORE_KEY = 'lastCpsTestScore';
    const LAST_TEST_CLICKS_KEY = 'lastCpsTestClicks';
    
    // Check if popup was already shown in this session
    function hasPopupBeenShownThisSession() {
        return sessionStorage.getItem(SESSION_SHOWN_KEY) === 'true';
    }
    
    // Mark popup as shown for this session
    function markPopupAsShown() {
        sessionStorage.setItem(SESSION_SHOWN_KEY, 'true');
    }
    
    // Store test results for potential saving after login
    function storeTestResults(score, clicks) {
        sessionStorage.setItem(LAST_TEST_SCORE_KEY, score);
        sessionStorage.setItem(LAST_TEST_CLICKS_KEY, clicks);
    }
    
    // Clear stored test results
    function clearStoredTestResults() {
        sessionStorage.removeItem(LAST_TEST_SCORE_KEY);
        sessionStorage.removeItem(LAST_TEST_CLICKS_KEY);
    }
    
    // Show the modal with test results
    function showLoginModalWithResults(score, clicks) {
        // Don't show if already shown in this session
        if (hasPopupBeenShownThisSession()) {
            return;
        }
        
        // Store the test results
        storeTestResults(score, clicks);
        
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
    
    // =============== 3-SECOND CPS TEST CODE ===============
    // Elements
    const testArea = document.getElementById('cps-test-area');
    const statusDisplay = document.getElementById('cps-status');
    const timerDisplay = document.getElementById('cps-timer');
    const clicksDisplay = document.getElementById('cps-clicks');
    const userTestResults = document.getElementById('user-test-results');
    const userPosition = document.getElementById('user-position');
    const userCpsScore = document.getElementById('user-cps-score');
    const userTotalClicks = document.getElementById('user-total-clicks');
    const resetBtn = document.getElementById('cps-reset-btn');
    const saveBtn = document.getElementById('save-btn');
    const presetButtons = document.querySelectorAll('.preset-btn');
    const advancedStats = document.getElementById('advanced-stats');
    const techniqueRecommendation = document.getElementById('technique-recommendation');
    const improvementTip = document.getElementById('improvement-tip');
    const peakCpsEl = document.getElementById('peak-cps');
    const consistencyScoreEl = document.getElementById('consistency-score');
    const reactionTimeEl = document.getElementById('reaction-time');
    const clickTechniqueEl = document.getElementById('click-technique');
    const techniqueTagsEl = document.getElementById('technique-tags');
    const leaderboardContent = document.getElementById('leaderboard-content');
    const cleanDivider = document.querySelector('.clean-divider');
    const loginPrompt = document.getElementById('loginPrompt');

    // Global state
    let testDuration = 3; // 3 seconds for standard CPS test
    let timeRemaining = testDuration;
    let clickCount = 0;
    let testState = 'idle'; // 'idle', 'countdown', 'active', 'ended', 'cooldown'
    let testInterval = null;
    let cooldownInterval = null;
    let countdownInterval = null;
    let startTime;
    let clickTimes = [];
    let testHistory = [];
    let userStats = {
        totalTests: 0,
        bestScore: 0,
        averageScore: 0,
        consistency: 0
    };
    
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
        fetch("/get-cps-leaderboard/")
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
                                    <td class="leaderboard-score">${item.score.toFixed(1)} CPS</td>
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
    
    // Initialize preset buttons
    if (presetButtons) {
        presetButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                if (testState !== 'idle' && testState !== 'ended') return;
                
                presetButtons.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                testDuration = parseInt(this.dataset.duration);
                resetTest();
            });
        });
    }
    
    // Reset test button
    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            resetTest();
        });
    }
    
    // Test area click handler - Allow anyone to start test
    if (testArea) {
        testArea.addEventListener('click', function(e) {
            // ✅ START TEST (allowed for everyone)
            if (testState === 'idle' || testState === 'ended') {
                // Don't show login prompt on click - allow test to start
                if (loginPrompt && !isUserAuthenticated) {
                    loginPrompt.classList.add("hidden");
                }
                startTest();
                return;
            }

            // ✅ REGISTER CLICKS
            if (testState === 'active') {
                registerClick(e);
            }
        });
    }
    
    // Hide save button completely since we're auto-saving
    if (saveBtn) {
        saveBtn.style.display = 'none';
    }
    
    // Start the test
    function startTest() {
        if (testState !== 'idle' && testState !== 'ended') return;

        testState = 'countdown';
        clickCount = 0;
        clickTimes = [];
        timeRemaining = testDuration;

        if (testArea) {
            testArea.classList.remove('idle', 'ended');
            testArea.classList.add('countdown');
        }

        // 3-second countdown before test starts
        let countdown = 3;
        if (statusDisplay) {
            statusDisplay.innerHTML = `
                <div class="cps-timer">${countdown}</div>
                <div>Get ready to click!</div>
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
                    <div class="cps-timer">${countdown}</div>
                    <div>Get ready to click!</div>
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
                    
                    // Updated to 3-second text for standard CPS test
                    if (statusDisplay) {
                        statusDisplay.innerHTML = `
                            <div class="cps-timer">${timeRemaining.toFixed(1)}</div>
                            <div class="cps-click-counter">Clicks: ${clickCount}</div>
                            <div>Click as fast as you can for 3 seconds!</div>
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
            const statusTimer = statusDisplay.querySelector('.cps-timer');
            if (statusTimer) {
                statusTimer.textContent = formattedTime;
            }
        }
    }
        
    // Register a click
    function registerClick(e) {
        if (testState !== 'active' || timeRemaining <= 0) return;
        
        clickCount++;
        const clickTime = Date.now();
        clickTimes.push(clickTime);
        
        const clickCounter = document.querySelector('.cps-click-counter');
        if (clickCounter) {
            clickCounter.textContent = `Clicks: ${clickCount}`;
        }
        
        if (testArea) {
            const feedback = document.createElement('div');
            feedback.className = 'click-feedback';
            feedback.textContent = '+1';
            feedback.style.left = `${e.offsetX}px`;
            feedback.style.top = `${e.offsetY}px`;
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
        const frozenClicks = clickCount;
        const frozenCps = frozenClicks / totalTime;
        
        // Calculate additional metrics for 3-second CPS test
        let maxCpsValue = 0;
        let consistencyValue = 100;
        let reactionTimeValue = 0;
        
        if (clickTimes.length > 1) {
            // Calculate peak CPS in any 0.2-second window (scaled to 1 second)
            const oneFifthSecond = 200;
            let startIdx = 0;
            
            for (let i = 0; i < clickTimes.length; i++) {
                while (clickTimes[i] - clickTimes[startIdx] > oneFifthSecond) {
                    startIdx++;
                }
                maxCpsValue = Math.max(maxCpsValue, (i - startIdx + 1) * 5); // Scale to 1 second
            }
            
            // Calculate consistency (lower std dev = higher consistency)
            const intervals = [];
            for (let i = 1; i < clickTimes.length; i++) {
                intervals.push(clickTimes[i] - clickTimes[i-1]);
            }
            
            if (intervals.length > 0) {
                const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
                const variance = intervals.reduce((a, b) => a + Math.pow(b - avgInterval, 2), 0) / intervals.length;
                const stdDev = Math.sqrt(variance);
                consistencyValue = Math.max(0, 100 - (stdDev / avgInterval * 100));
            }
            
            // Calculate reaction time (time to first click)
            if (clickTimes.length > 0) {
                reactionTimeValue = clickTimes[0] - startTime;
            }
        }
        
        // Determine click technique based on pattern for 3-second test
        let technique = "Standard Clicking";
        let techniqueTags = "";
        
        if (clickTimes.length > 5) {
            const intervals = [];
            for (let i = 1; i < clickTimes.length; i++) {
                intervals.push(clickTimes[i] - clickTimes[i-1]);
            }
            
            const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
            const cpsRate = 1000 / avgInterval;
            
            if (cpsRate > 14 && consistencyValue > 80) {
                technique = "Drag Clicking";
                techniqueTags = '<span class="technique-tag">High Frequency</span><span class="technique-tag">Drag Technique</span>';
            } else if (cpsRate > 10 && maxCpsValue > 16) {
                technique = "Jitter Clicking";
                techniqueTags = '<span class="technique-tag">Arm Vibration</span><span class="technique-tag">Medium Frequency</span>';
            } else if (cpsRate > 8) {
                technique = "Butterfly Clicking";
                techniqueTags = '<span class="technique-tag">Two Fingers</span><span class="technique-tag">Alternating</span>';
            } else {
                technique = "Standard Clicking";
                techniqueTags = '<span class="technique-tag">Single Finger</span><span class="technique-tag">Basic</span>';
            }
        }
        
        // Generate improvement tip for 3-second test
        let tip = "";
        if (frozenCps < 6) {
            tip = "Focus on developing a consistent rhythm. Practice regularly to improve your finger speed.";
        } else if (frozenCps < 8) {
            tip = "Try using two fingers (butterfly clicking) to increase your CPS. Position your hand comfortably.";
        } else if (frozenCps < 10) {
            tip = "Consider learning jitter clicking technique. It can significantly increase your CPS with practice.";
        } else if (frozenCps < 12) {
            tip = "Good speed! Work on consistency to maximize your score in the 3-second burst.";
        } else if (frozenCps < 15) {
            tip = "You're an advanced clicker! Experiment with drag clicking to reach even higher CPS.";
        } else {
            tip = "World-class speed! Your 3-second burst clicking is exceptional. Consider streaming your technique!";
        }
        
        // 🔧 STEP 2: Update user test results with FROZEN values
        if (userPosition) userPosition.textContent = '--';
        if (userCpsScore) userCpsScore.textContent = frozenCps.toFixed(1);
        if (userTotalClicks) userTotalClicks.textContent = frozenClicks;
        
        if (userTestResults) {
            userTestResults.style.display = 'grid';
        }
        
        // Update other results
        if (peakCpsEl) peakCpsEl.textContent = maxCpsValue.toFixed(1) + ' CPS';
        if (consistencyScoreEl) consistencyScoreEl.textContent = Math.round(consistencyValue);
        if (reactionTimeEl) reactionTimeEl.textContent = reactionTimeValue.toFixed(0) + ' ms';
        if (clickTechniqueEl) clickTechniqueEl.textContent = technique;
        if (techniqueTagsEl) techniqueTagsEl.innerHTML = techniqueTags;
        if (improvementTip) improvementTip.textContent = tip;
        
        if (advancedStats) {
            advancedStats.style.display = 'grid';
        }
        if (techniqueRecommendation) {
            techniqueRecommendation.style.display = 'block';
        }
        
        // Check authentication status after test completion
        const authenticated = await checkAuthentication();
        
        // AUTO-SAVE if user is authenticated
        if (authenticated) {
            // 🔧 STEP 3: AUTO-SAVE with FROZEN values
            saveScoreToDatabase(
                frozenCps,
                frozenClicks,
                maxCpsValue,
                Math.round(consistencyValue),
                reactionTimeValue
            );
            
            if (statusDisplay) {
                statusDisplay.innerHTML = `
                    <div class="cps-timer">${frozenCps.toFixed(1)}</div>
                    <div>Final CPS Score</div>
                    <div style="margin-top: 10px; color: #4CAF50;">
                        <i class="fas fa-spinner fa-spin"></i> Saving to leaderboard...
                    </div>
                `;
            }
        } else {
            // User is not authenticated - show login popup after delay
            if (statusDisplay) {
                statusDisplay.innerHTML = `
                    <div class="cps-timer">${frozenCps.toFixed(1)}</div>
                    <div>Final CPS Score</div>
                    <div style="margin-top: 10px; color: #FFD700;">
                        <i class="fas fa-info-circle"></i> Login to save your score to the global leaderboard!
                    </div>
                `;
            }
            
            // 🔧 STEP 4: Login modal with FROZEN values
            setTimeout(() => {
                showLoginModalWithResults(frozenCps, frozenClicks);
            }, 1500);
        }
        
        if (cleanDivider) {
            cleanDivider.style.display = 'block';
        }

        // Add to history
        const testResult = {
            date: new Date(),
            duration: testDuration,
            clicks: frozenClicks,
            cps: frozenCps,
            peakCps: maxCpsValue,
            consistency: consistencyValue,
            reactionTime: reactionTimeValue,
            technique: technique
        };
        
        testHistory.unshift(testResult);
        
        if (testHistory.length > 10) {
            testHistory.pop();
        }
        
        // Update user stats
        updateUserStats(testResult);
        
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
                        <div class="cps-timer">${frozenCps.toFixed(1)}</div>
                        <div>Final CPS Score</div>
                        <div>Click to test again</div>
                    `;
                } else if (statusDisplay) {
                    statusDisplay.innerHTML = `
                        <div class="cps-timer">${frozenCps.toFixed(1)}</div>
                        <div>Final CPS Score</div>
                        <div>Click to test again | <span style="color: #FFD700;">Login to save score & compete globally</span></div>
                    `;
                }
            } else if (statusDisplay) {
                statusDisplay.innerHTML = `
                    <div class="cps-timer">${frozenCps.toFixed(1)}</div>
                    <div>Final CPS Score</div>
                    <div>Test area will be available in ${cooldownTime}s</div>
                `;
            }
        }, 1000);
    }
    
    // Update user statistics
    function updateUserStats(testResult) {
        userStats.totalTests++;
        
        if (testResult.cps > userStats.bestScore) {
            userStats.bestScore = testResult.cps;
        }
        
        // Update average score
        userStats.averageScore = ((userStats.averageScore * (userStats.totalTests - 1)) + testResult.cps) / userStats.totalTests;
        
        // Update consistency
        userStats.consistency = ((userStats.consistency * (userStats.totalTests - 1)) + testResult.consistency) / userStats.totalTests;
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
        clickCount = 0;
        clickTimes = [];
        
        if (testArea) {
            testArea.className = 'cps-test-area idle';
        }
        
        if (statusDisplay) {
            statusDisplay.innerHTML = `
                <div class="cps-timer">${testDuration.toFixed(1)}</div>
                <div class="cps-click-counter">Clicks: 0</div>
                <div>Click to start CPS test</div>
            `;
        }
        
        if (timerDisplay) {
            timerDisplay.textContent = testDuration.toFixed(1);
        }
        
        if (clicksDisplay) {
            clicksDisplay.textContent = '0';
        }
        
        if (userTestResults) {
            userTestResults.style.display = 'none';
        }
        if (advancedStats) {
            advancedStats.style.display = 'none';
        }
        if (techniqueRecommendation) {
            techniqueRecommendation.style.display = 'none';
        }
        if (cleanDivider) {
            cleanDivider.style.display = 'none';
        }
        
        if (testArea) {
            const feedbackElements = testArea.querySelectorAll('.click-feedback');
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
    
    // Save score to database for standard CPS test
    function saveScoreToDatabase(score, clicks, peakCps, consistency, reactionTime) {
        fetch('/save-cps-score/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify({
                score: score,
                clicks: clicks,
                peak_cps: peakCps,
                consistency: consistency,
                reaction_time: reactionTime
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                console.log('CPS score saved successfully');
                if (userPosition) {
                    userPosition.textContent = '#' + data.user_rank;
                }
                
                if (statusDisplay) {
                    statusDisplay.innerHTML = `
                        <div class="cps-timer">${score.toFixed(1)}</div>
                        <div>Final CPS Score</div>
                        <div style="margin-top: 10px; color: #4CAF50;">
                            <i class="fas fa-check-circle"></i> Score saved to leaderboard! Rank: #${data.user_rank}
                        </div>
                    `;
                }
                
                if (data.user_rank <= 10) {
                    // 🔧 STEP 5: Achievement animation with frozen values
                    showAchievementAnimation(data.user_rank, score, clicks);
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
            console.error('Error saving CPS score:', error);
            showNotification('Failed to save score. Please try again.', 'error');
        });
    }
    
    // Show achievement animation for 3-second CPS test
    function showAchievementAnimation(rank, score, clicks) {
        if (testState !== 'ended' && testState !== 'cooldown') {
            return;
        }
        
        const overlay = document.createElement('div');
        overlay.className = 'achievement-overlay';
        
        let icon, title, message;
        
        if (rank === 1) {
            icon = '👑';
            title = 'WORLD CHAMPION!';
            message = `You've achieved the #1 spot globally with ${score.toFixed(1)} CPS in 3 seconds! Your clicking skills are unmatched.`;
        } else if (rank === 2) {
            icon = '🥈';
            title = 'SILVER MEDALIST!';
            message = `Amazing speed! You're the 2nd fastest clicker worldwide with ${score.toFixed(1)} CPS in 3 seconds.`;
        } else if (rank === 3) {
            icon = '🥉';
            title = 'BRONZE MEDALIST!';
            message = `Outstanding performance! You've secured the 3rd position globally with ${score.toFixed(1)} CPS.`;
        } else if (rank <= 4) {
            icon = '⭐';
            title = 'TOP 4 ELITE!';
            message = `Incredible burst speed! You're among the top 4 clickers worldwide with ${score.toFixed(1)} CPS in 3 seconds.`;
        } else if (rank <= 10) {
            icon = '🏆';
            title = 'TOP 10 MASTER!';
            message = `Excellent speed! You've made it to the top 10 with ${score.toFixed(1)} CPS. Keep pushing for the top!`;
        }
        
        overlay.innerHTML = `
            <div class="achievement-content">
                <div class="achievement-icon">${icon}</div>
                <h2 class="achievement-title">${title}</h2>
                <p class="achievement-message">${message}</p>
                <div class="achievement-rank">Rank: #${rank} | Score: ${score.toFixed(1)} CPS | Clicks: ${clicks} | Duration: 3s</div>
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
            const topPlayerCps = document.getElementById('top-player-cps');
            const topPlayerClicks = document.getElementById('top-player-clicks');
            
            if (topPlayerName) topPlayerName.textContent = stats.name || '--';
            if (topPlayerCps) topPlayerCps.textContent = (stats.score ? stats.score.toFixed(1) : '--') + ' CPS';
            if (topPlayerClicks) topPlayerClicks.textContent = stats.clicks || '--';
        }
    }
    
    // Update leaderboard with latest data
    function updateLeaderboard() {
        if (!leaderboardContent) return;
        
        fetch('/get-cps-leaderboard/')
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
                        <td class="leaderboard-score">${parseFloat(score.score).toFixed(1)} CPS</td>
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