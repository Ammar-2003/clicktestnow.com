document.addEventListener("DOMContentLoaded", () => {
    const leaderboardContent = document.getElementById("leaderboard-content");

    fetch("/get-spacebar-leaderboard-2/")
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
                            <td class="leaderboard-score">${item.score} presses</td>
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
    // Elements
    const testArea = document.getElementById('spacebar-test-area');
    const statusDisplay = document.getElementById('spacebar-status');
    const timerDisplay = document.getElementById('spacebar-timer');
    const pressesDisplay = document.getElementById('spacebar-presses');
    const spacebarKey = document.getElementById('spacebar-key');
    const userTestResults = document.getElementById('user-test-results');
    const userPosition = document.getElementById('user-position');
    const userScore = document.getElementById('user-score');
    const userTotalPresses = document.getElementById('user-total-presses');
    const resetBtn = document.getElementById('spacebar-reset-btn');
    const saveBtn = document.getElementById('save-btn');
    const advancedStats = document.getElementById('advanced-stats');
    const techniqueRecommendation = document.getElementById('technique-recommendation');
    const improvementTip = document.getElementById('improvement-tip');
    const pressFrequencyEl = document.getElementById('press-frequency');
    const staminaScoreEl = document.getElementById('stamina-score');
    const pressTechniqueEl = document.getElementById('press-technique');
    const techniqueTagsEl = document.getElementById('technique-tags');
    const leaderboardContent = document.getElementById('leaderboard-content');
    const cleanDivider = document.querySelector('.clean-divider');

    // Test variables - 2 seconds for spacebar test
    let testDuration = 2;
    let timeRemaining = testDuration;
    let pressCount = 0;
    let testState = 'idle'; // 'idle', 'countdown', 'active', 'ended', 'cooldown'
    let testInterval;
    let cooldownInterval;
    let startTime;
    let pressTimes = [];
    let testHistory = [];
    let userStats = {
        totalTests: 0,
        bestScore: 0,
        averageScore: 0,
        consistency: 0
    };
    
    // New variable to track if the spacebar is currently held down
    let isSpacebarHeld = false;

    // Keyboard event listener
    document.addEventListener('keydown', function(e) {
        if (e.code === 'Space') {
            // Prevent spacebar from scrolling the page
            e.preventDefault();
            
            // Check if the spacebar is already being held down
            if (isSpacebarHeld) {
                return;
            }

            // Set the flag to true because a keydown event has fired
            isSpacebarHeld = true;

            // Visual feedback for spacebar press
            if (spacebarKey) {
                spacebarKey.classList.add('pressed');
            }

            if (testState === 'idle' || testState === 'ended') {
                startTest();
                return;
            }
            
            if (testState === 'active') {
                registerPress();
            }
        }
    });
    
    document.addEventListener('keyup', function(e) {
        if (e.code === 'Space') {
            // Reset the flag when the key is released
            isSpacebarHeld = false;
            if (spacebarKey) {
                spacebarKey.classList.remove('pressed');
            }
        }
    });
    
    // Reset test button
    resetBtn.addEventListener('click', resetTest);
    
    // Test area click handler
    testArea.addEventListener('click', function(e) {
        if (testState === 'idle' || testState === 'ended') {
            startTest();
            return;
        }
    });
    
    // Start the test
    function startTest() {
        if (testState !== 'idle' && testState !== 'ended') return;

        testState = 'countdown';
        pressCount = 0;
        pressTimes = [];
        timeRemaining = testDuration;

        testArea.classList.remove('idle', 'ended');
        testArea.classList.add('countdown');

        // 3-second countdown before test starts
        let countdown = 3;
        statusDisplay.innerHTML = `
            <div class="spacebar-timer">${countdown}</div>
            <div>Get ready to press spacebar!</div>
            <div class="spacebar-key">
                <div class="spacebar-key-text">SPACEBAR</div>
            </div>
        `;

        const countdownInterval = setInterval(() => {
            countdown--;
            if (countdown > 0) {
                statusDisplay.innerHTML = `
                    <div class="spacebar-timer">${countdown}</div>
                    <div>Get ready to press spacebar!</div>
                    <div class="spacebar-key">
                        <div class="spacebar-key-text">SPACEBAR</div>
                    </div>
                `;
            } else {
                clearInterval(countdownInterval);
                testState = 'active';
                testArea.classList.remove('countdown');
                testArea.classList.add('active');
                
                statusDisplay.innerHTML = `
                    <div class="spacebar-timer">${timeRemaining.toFixed(1)}</div>
                    <div class="spacebar-press-counter">Presses: ${pressCount}</div>
                    <div>Press spacebar as fast as you can!</div>
                    <div class="spacebar-key">
                        <div class="spacebar-key-text">SPACEBAR</div>
                    </div>
                `;
                
                startTime = Date.now();
                
                // Start the test timer to update every 10 milliseconds
                testInterval = setInterval(updateTimer, 10);
            }
        }, 1000);
    }

    // Update the timer and status display
    function updateTimer() {
        const elapsed = (Date.now() - startTime) / 1000;
        timeRemaining = testDuration - elapsed;

        if (timeRemaining <= 0) {
            endTest();
            return;
        }

        // Format time like 2.0, 1.9 ... 0.1, 0.0
        const formattedTime = Math.max(0, timeRemaining).toFixed(1);

        // Update the global timer display
        if (timerDisplay) {
            timerDisplay.textContent = formattedTime;
        }

        // Also update the timer shown inside the statusDisplay
        const statusTimer = statusDisplay.querySelector('.spacebar-timer');
        if (statusTimer) {
            statusTimer.textContent = formattedTime;
        }
    }
        
    // Register a press
    function registerPress() {
        if (testState !== 'active' || timeRemaining <= 0) return;
        
        pressCount++;
        const pressTime = Date.now();
        pressTimes.push(pressTime);
        
        // Update presses display
        if (document.querySelector('.spacebar-press-counter')) {
            document.querySelector('.spacebar-press-counter').textContent = `Presses: ${pressCount}`;
        }
        
        // Visual feedback for spacebar
        if (spacebarKey) {
            spacebarKey.classList.add('pressed');
            setTimeout(() => {
                spacebarKey.classList.remove('pressed');
            }, 100);
        }
        
        // Create visual feedback
        const feedback = document.createElement('div');
        feedback.className = 'press-feedback';
        feedback.textContent = '+1';
        feedback.style.left = '50%';
        feedback.style.top = '50%';
        testArea.appendChild(feedback);
        
        // Remove feedback after animation
        setTimeout(() => {
            feedback.remove();
        }, 1000);
    }
    
    // End the test
    function endTest() {
        clearInterval(testInterval);
        testState = 'ended';
        testArea.classList.remove('active');
        testArea.classList.add('ended');
        
        const totalTime = testDuration;
        const pressesPerSecond = pressCount / totalTime;
        
        // Calculate additional metrics
        let maxPPSValue = 0;
        let consistencyValue = 100;
        let pressFrequencyValue = 0;
        
        if (pressTimes.length > 1) {
            // Calculate max presses per second in any 0.2-second window (scaled to 1 second)
            const oneFifthSecond = 200;
            let startIdx = 0;
            
            for (let i = 0; i < pressTimes.length; i++) {
                while (pressTimes[i] - pressTimes[startIdx] > oneFifthSecond) {
                    startIdx++;
                }
                maxPPSValue = Math.max(maxPPSValue, (i - startIdx + 1) * 5); // Scale to 1 second
            }
            
            // Calculate consistency (lower std dev = higher consistency)
            const intervals = [];
            for (let i = 1; i < pressTimes.length; i++) {
                intervals.push(pressTimes[i] - pressTimes[i-1]);
            }
            
            if (intervals.length > 0) {
                const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
                const variance = intervals.reduce((a, b) => a + Math.pow(b - avgInterval, 2), 0) / intervals.length;
                const stdDev = Math.sqrt(variance);
                consistencyValue = Math.max(0, 100 - (stdDev / avgInterval * 100));
            }
            
            // Calculate press frequency (average of first few presses)
            const firstPresses = Math.min(3, pressTimes.length);
            pressFrequencyValue = 1000 / ((pressTimes[firstPresses - 1] - startTime) / firstPresses);
        }
        
        // For 2-second spacebar test, stamina is calculated differently
        const staminaScoreValue = Math.min(100, consistencyValue * 0.8 + (pressCount > 20 ? 20 : 0));
        
        // Determine press technique
        let technique = "Standard Pressing";
        let techniqueTags = "";
        
        if (pressTimes.length > 3) {
            const intervals = [];
            for (let i = 1; i < pressTimes.length; i++) {
                intervals.push(pressTimes[i] - pressTimes[i-1]);
            }
            
            const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
            const ppsRate = 1000 / avgInterval;
            
            if (ppsRate > 14) {
                technique = "Advanced Technique";
                techniqueTags = '<span class="technique-tag">High Frequency</span><span class="technique-tag">Thumb Mastery</span>';
            } else if (ppsRate > 10) {
                technique = "Efficient Pressing";
                techniqueTags = '<span class="technique-tag">Medium Frequency</span><span class="technique-tag">Good Rhythm</span>';
            } else if (ppsRate > 7) {
                technique = "Basic Technique";
                techniqueTags = '<span class="technique-tag">Standard Speed</span><span class="technique-tag">Developing</span>';
            } else {
                technique = "Beginner Level";
                techniqueTags = '<span class="technique-tag">Learning</span><span class="technique-tag">Practice Needed</span>';
            }
        }
        
        // Generate improvement tip for spacebar pressing
        let tip = "";
        if (pressCount < 15) {
            tip = "Focus on developing a consistent rhythm with your thumb rather than mashing randomly.";
        } else if (pressCount < 20) {
            tip = "Try to relax your hand more while maintaining the rhythm. Tension can reduce your pressing speed.";
        } else if (pressCount < 25) {
            tip = "Work on building stamina to maintain your pressing technique for the full 2 seconds.";
        } else if (pressCount < 30) {
            tip = "Your spacebar technique is good. Experiment with different hand positions to find what works best.";
        } else if (pressCount < 35) {
            tip = "You're an expert spacebar presser! Focus on consistency to reach the next level.";
        } else {
            tip = "You're at an elite spacebar pressing level! Maintain this performance and consider streaming your technique.";
        }
        
        // Update user test results
        if (userPosition) {
            userPosition.textContent = '--';
        }
        if (userScore) {
            userScore.textContent = pressCount;
        }
        if (userTotalPresses) {
            userTotalPresses.textContent = pressCount;
        }
        
        // Show user test results
        if (userTestResults) {
            userTestResults.style.display = 'grid';
        }
        
        // Update other results
        if (pressFrequencyEl) {
            pressFrequencyEl.textContent = pressFrequencyValue.toFixed(1) + ' Hz';
        }
        if (staminaScoreEl) {
            staminaScoreEl.textContent = Math.round(staminaScoreValue);
        }
        if (pressTechniqueEl) {
            pressTechniqueEl.textContent = technique;
        }
        if (techniqueTagsEl) {
            techniqueTagsEl.innerHTML = techniqueTags;
        }
        if (improvementTip) {
            improvementTip.textContent = tip;
        }
        
        // Show detailed results and advanced stats
        if (advancedStats) {
            advancedStats.style.display = 'grid';
        }
        if (techniqueRecommendation) {
            techniqueRecommendation.style.display = 'block';
        }
        
        // Update status
        statusDisplay.innerHTML = `
            <div class="spacebar-timer">${pressCount}</div>
            <div>Final Spacebar Presses</div>
            <div>Test area will be available in 3 seconds</div>
            <div class="spacebar-key">
                <div class="spacebar-key-text">SPACEBAR</div>
            </div>
        `;
        if (cleanDivider) {
            cleanDivider.style.display = 'block';
        }

        // Add to history
        const testResult = {
            date: new Date(),
            duration: testDuration,
            presses: pressCount,
            pressesPerSecond: pressesPerSecond,
            maxPPS: maxPPSValue,
            consistency: consistencyValue,
            pressFrequency: pressFrequencyValue,
            stamina: Math.round(staminaScoreValue),
            technique: technique
        };
        
        testHistory.unshift(testResult);
        
        // Keep only last 10 tests
        if (testHistory.length > 10) {
            testHistory.pop();
        }
        
        // Update user stats
        updateUserStats(testResult);
        
        // Save the score to the database if user is authenticated
        const isUserAuthenticated = true; // Placeholder for your authentication logic
        if (isUserAuthenticated) {
            saveScoreToDatabase(pressCount, pressCount);
        } else {
            // Show login prompt for unauthenticated users
            statusDisplay.innerHTML += `<div style="margin-top: 10px; color: #FFD700;"><i class="fas fa-info-circle"></i> <a href="/login/" style="color: #FFD700;">Login</a> to save your score and see your global rank</div>`;
        }
        
        // Set 3-second cooldown before allowing another test
        testState = 'cooldown';
        let cooldownTime = 3;
        
        cooldownInterval = setInterval(() => {
            cooldownTime--;
            
            if (cooldownTime <= 0) {
                clearInterval(cooldownInterval);
                testState = 'ended';
                statusDisplay.innerHTML = `
                    <div class="spacebar-timer">${pressCount}</div>
                    <div>Final Spacebar Presses</div>
                    <div>Click to test again</div>
                    <div class="spacebar-key">
                        <div class="spacebar-key-text">SPACEBAR</div>
                    </div>
                `;
            } else {
                statusDisplay.innerHTML = `
                    <div class="spacebar-timer">${pressCount}</div>
                    <div>Final Spacebar Presses</div>
                    <div>Test area will be available in ${cooldownTime}s</div>
                    <div class="spacebar-key">
                        <div class="spacebar-key-text">SPACEBAR</div>
                    </div>
                `;
            }
        }, 1000);
    }
    
    // Update user statistics
    function updateUserStats(testResult) {
        userStats.totalTests++;
        
        if (testResult.presses > userStats.bestScore) {
            userStats.bestScore = testResult.presses;
        }
        
        // Update average score
        userStats.averageScore = ((userStats.averageScore * (userStats.totalTests - 1)) + testResult.presses) / userStats.totalTests;
        
        // Update consistency
        userStats.consistency = ((userStats.consistency * (userStats.totalTests - 1)) + testResult.consistency) / userStats.totalTests;
    }
    
    // Reset the test
    function resetTest() {
        clearInterval(testInterval);
        clearInterval(cooldownInterval);
        testState = 'idle';
        timeRemaining = testDuration;
        pressCount = 0;
        pressTimes = [];
        isSpacebarHeld = false; // Reset the flag
        
        testArea.className = 'spacebar-test-area idle';
        statusDisplay.innerHTML = `
            <div class="spacebar-timer">${testDuration.toFixed(1)}</div>
            <div class="spacebar-press-counter">Presses: 0</div>
            <div>Click or press spacebar to start test</div>
            <div class="spacebar-key">
                <div class="spacebar-key-text">SPACEBAR</div>
            </div>
        `;
        
        if (userTestResults) {
            userTestResults.style.display = 'none';
        }
        if (advancedStats) {
            advancedStats.style.display = 'none';
        }
        if (techniqueRecommendation) {
            techniqueRecommendation.style.display = 'none';
        }
        if (saveBtn) {
            saveBtn.style.display = 'none';
        }
    }
    
    // Save score to database
    function saveScoreToDatabase(score, presses) {
        fetch('/save-spacebar-score-2/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify({
                score: score,
                presses: presses
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                console.log('Score saved successfully');
                // Update user position display
                if (userPosition) {
                    userPosition.textContent = '#' + data.user_rank;
                }
                
                // Check if user achieved a special rank and show appropriate animation
                if (data.user_rank <= 10) {
                    showAchievementAnimation(data.user_rank, score, presses);
                }
                
                // Update leaderboard with new data
                updateLeaderboard();
                
                // Update top player stats if they changed
                if (data.top_player_stats) {
                    updateTopPlayerStats(data.top_player_stats);
                }
                
                // Check if this is a new world record
                if (data.is_new_record) {
                    showNotification('🎉 New World Record! 🎉', 'success');
                }
            }
        })
        .catch(error => {
            console.error('Error saving score:', error);
        });
    }
    
    // Show achievement animation based on rank
    function showAchievementAnimation(rank, score, presses) {
        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'achievement-overlay';
        
        let icon, title, message;
        
        if (rank === 1) {
            icon = '👑';
            title = 'WORLD CHAMPION!';
            message = `You've achieved the #1 spot globally with ${score} presses! Your spacebar skills are unmatched.`;
        } else if (rank === 2) {
            icon = '🥈';
            title = 'SILVER MEDALIST!';
            message = `Amazing performance! You're the 2nd best spacebar presser worldwide with ${score} presses.`;
        } else if (rank === 3) {
            icon = '🥉';
            title = 'BRONZE MEDALIST!';
            message = `Outstanding! You've secured the 3rd position globally with ${score} presses.`;
        } else if (rank <= 4) {
            icon = '⭐';
            title = 'TOP 4 ELITE!';
            message = `Incredible! You're among the top 4 spacebar pressers worldwide with ${score} presses.`;
        } else if (rank <= 10) {
            icon = '🏆';
            title = 'TOP 10 MASTER!';
            message = `Excellent! You've made it to the top 10 with ${score} presses. Keep pushing for the top!`;
        }
        
        overlay.innerHTML = `
            <div class="achievement-content">
                <div class="achievement-icon">${icon}</div>
                <h2 class="achievement-title">${title}</h2>
                <p class="achievement-message">${message}</p>
                <div class="achievement-rank">Rank: #${rank} | Score: ${score} presses</div>
                <button class="achievement-close">Continue</button>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        
        // Close button functionality
        overlay.querySelector('.achievement-close').addEventListener('click', () => {
            overlay.style.animation = 'fadeOut 0.5s ease forwards';
            setTimeout(() => {
                overlay.remove();
            }, 500);
        });
    }
    
    // Update top player stats
    function updateTopPlayerStats(stats) {
        if (stats) {
            if (document.getElementById('top-player-name')) {
                document.getElementById('top-player-name').textContent = stats.name || '--';
            }
            if (document.getElementById('top-player-score')) {
                document.getElementById('top-player-score').textContent = stats.score || '--';
            }
            if (document.getElementById('top-player-presses')) {
                document.getElementById('top-player-presses').textContent = stats.presses || '--';
            }
        }
    }
    
    // Update leaderboard with latest data
    function updateLeaderboard() {
        fetch('/get-spacebar-leaderboard-2/')
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
        
        if (leaderboardContent) {
            leaderboardContent.innerHTML = leaderboardHTML;
        }
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
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 5000);
        
        // Close button functionality
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.classList.add('fade-out');
            setTimeout(() => {
                notification.remove();
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
    updateLeaderboard();
});