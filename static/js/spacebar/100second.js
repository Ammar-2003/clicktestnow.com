document.addEventListener("DOMContentLoaded", () => {
    const leaderboardContent = document.getElementById("leaderboard-content");

    fetch("/get-spacebar-leaderboard-100/")
        .then(res => res.json())
        .then(data => {
            leaderboardContent.innerHTML = "";

            if (data.status === "success" && data.leaderboard.length > 0) {
                // Snytax Error 1: The '=>' was misplaced.
                // It should be inside the forEach's function call, not after the closing parenthesis.
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
                            <td class="leaderboard-score">${parseFloat(item.score).toFixed(1)} PPS</td>
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
    const spacebarKey = document.getElementById('spacebar-key');
    const statusDisplay = document.getElementById('spacebar-status');
    const timerDisplay = document.getElementById('spacebar-timer');
    const pressesDisplay = document.getElementById('spacebar-presses');
    const userTestResults = document.getElementById('user-test-results');
    const userPosition = document.getElementById('user-position');
    const userPpsScore = document.getElementById('user-pps-score');
    const userTotalPresses = document.getElementById('user-total-presses');
    const resetBtn = document.getElementById('spacebar-reset-btn');
    const saveBtn = document.getElementById('save-btn');
    const advancedStats = document.getElementById('advanced-stats');
    const techniqueRecommendation = document.getElementById('technique-recommendation');
    const improvementTip = document.getElementById('improvement-tip');
    const reactionTimeEl = document.getElementById('reaction-time');
    const staminaScoreEl = document.getElementById('stamina-score');
    const pressTechniqueEl = document.getElementById('press-technique');
    const techniqueTagsEl = document.getElementById('technique-tags');
    const leaderboardContent = document.getElementById('leaderboard-content');
    const cleanDivider = document.querySelector('.clean-divider');

    // Test variables - changed to 100 seconds for endurance test
    let testDuration = 100;
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
    
    // Track if spacebar is currently pressed to prevent multiple counts
    let spacebarPressed = false;

    // Initialize keyboard event listener
    document.addEventListener('keydown', function(e) {
        if (e.code === 'Space' || e.keyCode === 32) {
            e.preventDefault(); // Prevent spacebar from scrolling the page
            
            // Only register press if spacebar wasn't already pressed
            if (!spacebarPressed) {
                spacebarPressed = true;
                
                if (testState === 'idle' || testState === 'ended') {
                    startTest();
                    return;
                }

                if (testState === 'active') {
                    registerPress();
                }
            }
        }
    });

    // Reset spacebar pressed state on keyup
    document.addEventListener('keyup', function(e) {
        if (e.code === 'Space' || e.keyCode === 32) {
            spacebarPressed = false;
            spacebarKey.classList.remove('pressed');
        }
    });

    // Reset test button
    resetBtn.addEventListener('click', resetTest);

    // Test area click handler
    testArea.addEventListener('click', function() {
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
        spacebarPressed = false;

        testArea.classList.remove('idle', 'ended');
        testArea.classList.add('countdown');

        // 3-second countdown before test starts
        let countdown = 3;
        statusDisplay.innerHTML = `
            <div class="spacebar-timer">${countdown}</div>
            <div>Get ready for endurance test!</div>
        `;

        const countdownInterval = setInterval(() => {
            countdown--;
            if (countdown > 0) {
                statusDisplay.innerHTML = `
                    <div class="spacebar-timer">${countdown}</div>
                    <div>Get ready for endurance test!</div>
                `;
            } else {
                clearInterval(countdownInterval);
                testState = 'active';
                testArea.classList.remove('countdown');
                testArea.classList.add('active');

                statusDisplay.innerHTML = `
                    <div class="spacebar-timer">${timeRemaining.toFixed(1)}</div>
                    <div class="spacebar-press-counter">Presses: ${pressCount}</div>
                    <div>Press spacebar consistently for 100 seconds!</div>
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

        // Format time with one decimal place
        const formattedTime = Math.max(0, timeRemaining).toFixed(1);

        // Update the global timer display
        timerDisplay.textContent = formattedTime;

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

        // Animate spacebar key
        spacebarKey.classList.add('pressed');

        // Update presses display
        document.querySelector('.spacebar-press-counter').textContent = `Presses: ${pressCount}`;

        // Create visual feedback (less frequent for endurance test)
        if (pressCount % 5 === 0) {
            const feedback = document.createElement('div');
            feedback.className = 'press-feedback';
            feedback.textContent = '+5';
            feedback.style.left = `${Math.random() * 80 + 10}%`;
            feedback.style.top = `${Math.random() * 60 + 20}%`;
            testArea.appendChild(feedback);

            // Remove feedback after animation
            setTimeout(() => {
                feedback.remove();
            }, 1000);
        }
    }

    // End the test
    function endTest() {
        clearInterval(testInterval);
        testState = 'ended';
        testArea.classList.remove('active');
        testArea.classList.add('ended');

        const totalTime = testDuration;
        const pps = pressCount / totalTime;

        // Calculate additional metrics
        let maxPpsValue = 0;
        let consistencyValue = 100;
        let reactionTimeValue = 0;

        if (pressTimes.length > 1) {
            // Calculate max PPS in any 5-second window (scaled to 1 second)
            const fiveSecondWindow = 5000;
            let startIdx = 0;

            for (let i = 0; i < pressTimes.length; i++) {
                while (pressTimes[i] - pressTimes[startIdx] > fiveSecondWindow) {
                    startIdx++;
                }
                maxPpsValue = Math.max(maxPpsValue, (i - startIdx + 1) / 5); // Scale to 1 second
            }

            // Calculate consistency (lower std dev = higher consistency)
            const intervals = [];
            for (let i = 1; i < pressTimes.length; i++) {
                intervals.push(pressTimes[i] - pressTimes[i - 1]);
            }

            if (intervals.length > 0) {
                const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
                const variance = intervals.reduce((a, b) => a + Math.pow(b - avgInterval, 2), 0) / intervals.length;
                const stdDev = Math.sqrt(variance);
                consistencyValue = Math.max(0, 100 - (stdDev / avgInterval * 100));
            }

            // Calculate average frequency
            reactionTimeValue = 1000 / ((pressTimes[pressTimes.length - 1] - startTime) / pressCount);
        }

        // For 100-second endurance test, stamina is calculated differently
        const staminaScoreValue = Math.min(100, consistencyValue * 0.7 + (pressCount > 600 ? 30 : 0));

        // Determine press technique for endurance
        let technique = "Standard Pressing";
        let techniqueTags = "";

        if (pressTimes.length > 10) {
            if (consistencyValue > 90) {
                technique = "Exceptional Consistency";
                techniqueTags = '<span class="technique-tag">Steady Rhythm</span><span class="technique-tag">Endurance Master</span>';
            } else if (consistencyValue > 80) {
                technique = "Good Consistency";
                techniqueTags = '<span class="technique-tag">Rhythmic</span><span class="technique-tag">Stamina</span>';
            } else if (consistencyValue > 70) {
                technique = "Moderate Consistency";
                techniqueTags = '<span class="technique-tag">Variable Pace</span><span class="technique-tag">Developing</span>';
            } else {
                technique = "Inconsistent Pressing";
                techniqueTags = '<span class="technique-tag">Irregular</span><span class="technique-tag">Needs Practice</span>';
            }
        }

        // Generate improvement tip for endurance
        let tip = "";
        if (pps < 5) {
            tip = "Focus on developing a consistent rhythm rather than pressing as fast as possible. Endurance is about sustainability.";
        } else if (pps < 7) {
            tip = "Try to maintain a steady pace throughout the test. Starting too fast can lead to fatigue in the later stages.";
        } else if (pps < 9) {
            tip = "Your endurance is good. Work on minimizing pace variations to improve your consistency score.";
        } else if (pps < 11) {
            tip = "Excellent endurance! Focus on small improvements to your rhythm to reach the next level.";
        } else {
            tip = "You're an elite endurance presser! Your consistency and stamina are exceptional. Maintain this performance!";
        }

        // Update user test results
        userPosition.textContent = '--';
        userPpsScore.textContent = pps.toFixed(1);
        userTotalPresses.textContent = pressCount;

        // Show user test results
        userTestResults.style.display = 'grid';

        // Update other results
        reactionTimeEl.textContent = reactionTimeValue.toFixed(1) + ' Hz';
        staminaScoreEl.textContent = Math.round(staminaScoreValue);
        pressTechniqueEl.textContent = technique;
        techniqueTagsEl.innerHTML = techniqueTags;
        improvementTip.textContent = tip;

        // Show detailed results and advanced stats
        advancedStats.style.display = 'grid';
        techniqueRecommendation.style.display = 'block';

        // Update status
        statusDisplay.innerHTML = `
            <div class="spacebar-timer">${pps.toFixed(1)}</div>
            <div>Final PPS Score</div>
            <div>Endurance test complete!</div>
        `;
        cleanDivider.style.display = 'block';

        // Add to history
        const testResult = {
            date: new Date(),
            duration: testDuration,
            presses: pressCount,
            pps: pps,
            maxPps: maxPpsValue,
            consistency: consistencyValue,
            pressFrequency: reactionTimeValue,
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
        if (isUserAuthenticated) {
            saveScoreToDatabase(pps, pressCount);
        } else {
            // Show login prompt for unauthenticated users
            statusDisplay.innerHTML += `<div style="margin-top: 10px; color: #FFD700;"><i class="fas fa-info-circle"></i> <a href="/login/" style="color: #FFD700;">Login</a> to save your score and see your global rank</div>`;
        }

        // Set cooldown before allowing another test
        testState = 'cooldown';
        let cooldownTime = 5;

        cooldownInterval = setInterval(() => {
            cooldownTime--;

            if (cooldownTime <= 0) {
                clearInterval(cooldownInterval);
                testState = 'ended';
                statusDisplay.innerHTML = `
                    <div class="spacebar-timer">${pps.toFixed(1)}</div>
                    <div>Final PPS Score</div>
                    <div>Press spacebar or click to test again</div>
                `;
            } else {
                statusDisplay.innerHTML = `
                    <div class="spacebar-timer">${pps.toFixed(1)}</div>
                    <div>Final PPS Score</div>
                    <div>Test area will be available in ${cooldownTime}s</div>
                `;
            }
        }, 1000);
    }

    // Update user statistics
    function updateUserStats(testResult) {
        userStats.totalTests++;

        if (testResult.pps > userStats.bestScore) {
            userStats.bestScore = testResult.pps;
        }

        // Update average score
        userStats.averageScore = ((userStats.averageScore * (userStats.totalTests - 1)) + testResult.pps) / userStats.totalTests;

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
        spacebarPressed = false;

        testArea.className = 'spacebar-test-area idle';
        spacebarKey.classList.remove('pressed');
        statusDisplay.innerHTML = `
            <div class="spacebar-timer">${testDuration.toFixed(1)}</div>
            <div class="spacebar-press-counter">Presses: 0</div>
            <div>Press spacebar or click to start endurance test</div>
        `;

        userTestResults.style.display = 'none';
        advancedStats.style.display = 'none';
        techniqueRecommendation.style.display = 'none';
        saveBtn.style.display = 'none';
    }

    // Save score to database
    function saveScoreToDatabase(score, presses) {
        fetch('/save-spacebar-score-100/', {
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
                    userPosition.textContent = '#' + data.user_rank;

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
            title = 'ENDURANCE CHAMPION!';
            message = `You've achieved the #1 spot globally with ${score.toFixed(1)} PPS over 100 seconds! Your spacebar endurance is unmatched.`;
        } else if (rank === 2) {
            icon = '🥈';
            title = 'SILVER ENDURANCE!';
            message = `Amazing stamina! You're the 2nd best endurance presser worldwide with ${score.toFixed(1)} PPS.`;
        } else if (rank === 3) {
            icon = '🥉';
            title = 'BRONZE ENDURANCE!';
            message = `Outstanding stamina! You've secured the 3rd position globally with ${score.toFixed(1)} PPS.`;
        } else if (rank <= 4) {
            icon = '⭐';
            title = 'TOP 4 STAMINA!';
            message = `Incredible endurance! You're among the top 4 spacebar pressers worldwide with ${score.toFixed(1)} PPS.`;
        } else if (rank <= 10) {
            icon = '🏆';
            title = 'TOP 10 ENDURANCE!';
            message = `Excellent stamina! You've made it to the top 10 with ${score.toFixed(1)} PPS. Keep pushing for the top!`;
        }

        overlay.innerHTML = `
            <div class="achievement-content">
                <div class="achievement-icon">${icon}</div>
                <h2 class="achievement-title">${title}</h2>
                <p class="achievement-message">${message}</p>
                <div class="achievement-rank">Rank: #${rank} | Score: ${score.toFixed(1)} PPS | Presses: ${presses}</div>
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
            document.getElementById('top-player-name').textContent = stats.name || '--';
            document.getElementById('top-player-pps').textContent = (stats.score ? stats.score.toFixed(1) : '--') + ' PPS';
            document.getElementById('top-player-presses').textContent = stats.presses || '--';
        }
    }

    // Update leaderboard with latest data
    function updateLeaderboard() {
        fetch('/get-spacebar-leaderboard-100/')
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
                        <td class="leaderboard-score">${parseFloat(score.score).toFixed(1)} PPS</td>
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
