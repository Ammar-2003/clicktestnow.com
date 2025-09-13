document.addEventListener("DOMContentLoaded", () => {
    const leaderboardContent = document.getElementById("leaderboard-content");

    fetch("/get-100-second-cps-leaderboard/")
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
    // Elements
    const testArea = document.getElementById('cps-test-area');
    const statusDisplay = document.getElementById('cps-status');
    const timerDisplay = document.getElementById('cps-timer');
    const clicksDisplay = document.getElementById('cps-clicks');
    // Removed progressFill and enduranceFill
    const currentTimeLabel = document.getElementById('current-time');
    const clickRateDisplay = document.getElementById('click-rate-display');
    const userTestResults = document.getElementById('user-test-results');
    const userPosition = document.getElementById('user-position');
    const userCpsScore = document.getElementById('user-cps-score');
    const userTotalClicks = document.getElementById('user-total-clicks');
    const resetBtn = document.getElementById('cps-reset-btn');
    const saveBtn = document.getElementById('save-btn');
    const peakCpsEl = document.getElementById('peak-cps');
    const enduranceScoreEl = document.getElementById('endurance-score');
    const staminaDropEl = document.getElementById('stamina-drop');
    const advancedStats = document.getElementById('advanced-stats');
    const techniqueRecommendation = document.getElementById('technique-recommendation');
    const improvementTip = document.getElementById('improvement-tip');
    const leaderboardContent = document.getElementById('leaderboard-content');
    const cleanDivider = document.querySelector('.clean-divider');

    // Test variables - changed to 100 seconds for endurance test
    let testDuration = 100;
    let timeRemaining = testDuration;
    let clickCount = 0;
    let testState = 'idle'; // 'idle', 'countdown', 'active', 'ended', 'cooldown'
    let testInterval;
    let cooldownInterval;
    let startTime;
    let clickTimes = [];
    let testHistory = [];
    let userStats = {
        totalTests: 0,
        bestScore: 0,
        averageScore: 0,
        consistency: 0
    };
    
    // For tracking performance over time
    let performanceSegments = Array(10).fill(0).map(() => ({ clicks: 0, startTime: 0 }));
    let currentSegment = 0;
    let peakCps = 0;
    
    // Reset test button
    if (resetBtn) {
        resetBtn.addEventListener('click', resetTest);
    }
    
    // Test area click handler
    if (testArea) {
        testArea.addEventListener('click', function(e) {
            if (testState === 'idle' || testState === 'ended') {
                startTest();
                return;
            }
            
            if (testState === 'active') {
                registerClick(e);
            }
        });
    }
    
    // Start the test
    function startTest() {
        if (testState !== 'idle' && testState !== 'ended') return;

        testState = 'countdown';
        clickCount = 0;
        clickTimes = [];
        timeRemaining = testDuration;
        performanceSegments = Array(10).fill(0).map(() => ({ clicks: 0, startTime: 0 }));
        currentSegment = 0;
        peakCps = 0;

        testArea.classList.remove('idle', 'ended');
        testArea.classList.add('countdown');

        // 3-second countdown before test starts
        let countdown = 3;
        statusDisplay.innerHTML = `
            <div class="cps-timer">${countdown}</div>
            <div>Get ready for the endurance challenge!</div>
        `;

        const countdownInterval = setInterval(() => {
            countdown--;
            if (countdown > 0) {
                statusDisplay.innerHTML = `
                    <div class="cps-timer">${countdown}</div>
                    <div>Get ready for the endurance challenge!</div>
                `;
            } else {
                clearInterval(countdownInterval);
                testState = 'active';
                testArea.classList.remove('countdown');
                testArea.classList.add('active');
                
                statusDisplay.innerHTML = `
                    <div class="cps-timer">${timeRemaining.toFixed(1)}</div>
                    <div class="cps-click-counter">Clicks: ${clickCount}</div>
                    <div>Click as fast as you can for 100 seconds!</div>
                `;
                
                startTime = Date.now();
                performanceSegments[currentSegment].startTime = startTime;
                
                // Start the test timer to update every 100 milliseconds
                testInterval = setInterval(updateTimer, 100);
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

        // Format time
        const formattedTime = Math.max(0, timeRemaining).toFixed(1);

        // Update the global timer display
        if (timerDisplay) {
            timerDisplay.textContent = formattedTime;
        }

        // Also update the timer shown inside the statusDisplay
        const statusTimer = statusDisplay.querySelector('.cps-timer');
        if (statusTimer) {
            statusTimer.textContent = formattedTime;
        }
        
        // Removed progress bar and endurance meter logic
        
        // Update current time label
        if (currentTimeLabel) {
            currentTimeLabel.textContent = `${Math.floor(elapsed)}s`;
        }
        
        // Update click rate display (average over last 5 seconds)
        if (clickTimes.length > 0) {
            const recentClicks = clickTimes.filter(time => 
                (Date.now() - time) < 5000
            ).length;
            const currentRate = recentClicks / 5;
            if (clickRateDisplay) {
                clickRateDisplay.textContent = `Current Rate: ${currentRate.toFixed(1)} CPS`;
            }
        }
        
        // Check if we need to move to next performance segment (every 10 seconds)
        if (elapsed >= (currentSegment + 1) * 10 && currentSegment < 9) {
            currentSegment++;
            performanceSegments[currentSegment].startTime = Date.now();
        }
    }
        
    // Register a click
    function registerClick(e) {
        if (testState !== 'active' || timeRemaining <= 0) return;
        
        clickCount++;
        const clickTime = Date.now();
        clickTimes.push(clickTime);
        
        // Update current segment clicks
        performanceSegments[currentSegment].clicks++;
        
        // Update clicks display
        const clickCounter = document.querySelector('.cps-click-counter');
        if (clickCounter) {
            clickCounter.textContent = `Clicks: ${clickCount}`;
        }
        
        // Create visual feedback (only occasionally to avoid performance issues)
        if (Math.random() < 0.3) { // 30% chance to show feedback
            const feedback = document.createElement('div');
            feedback.className = 'click-feedback';
            feedback.textContent = '+1';
            feedback.style.left = `${e.offsetX}px`;
            feedback.style.top = `${e.offsetY}px`;
            if (testArea) {
                testArea.appendChild(feedback);
            }
            
            // Remove feedback after animation
            setTimeout(() => {
                if (feedback) {
                    feedback.remove();
                }
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
        const cps = clickCount / totalTime;
        
        // Calculate performance metrics
        let maxCpsValue = 0;
        let consistencyValue = 100;
        let staminaDropValue = 0;
        
        if (clickTimes.length > 1) {
            // Calculate peak CPS in any 1-second window
            const oneSecond = 1000;
            let startIdx = 0;
            
            for (let i = 0; i < clickTimes.length; i++) {
                while (clickTimes[i] - clickTimes[startIdx] > oneSecond) {
                    startIdx++;
                }
                maxCpsValue = Math.max(maxCpsValue, i - startIdx + 1);
            }
            
            // Calculate consistency across segments
            const segmentCps = performanceSegments
                .filter(seg => seg.clicks > 0)
                .map(seg => seg.clicks / 10); // Each segment is 10 seconds
            
            if (segmentCps.length > 1) {
                const avgCps = segmentCps.reduce((a, b) => a + b, 0) / segmentCps.length;
                const variance = segmentCps.reduce((a, b) => a + Math.pow(b - avgCps, 2), 0) / segmentCps.length;
                const stdDev = Math.sqrt(variance);
                consistencyValue = Math.max(0, 100 - (stdDev / avgCps * 100));
                
                // Calculate stamina drop (first half vs second half)
                const firstHalf = performanceSegments.slice(0, 5).reduce((sum, seg) => sum + seg.clicks, 0) / 50;
                const secondHalf = performanceSegments.slice(5).reduce((sum, seg) => sum + seg.clicks, 0) / 50;
                
                if (firstHalf > 0) {
                    staminaDropValue = ((firstHalf - secondHalf) / firstHalf * 100).toFixed(1);
                }
            }
        }
        
        // Calculate endurance score
        const enduranceScoreValue = Math.min(100, consistencyValue * 0.7 + (cps > 5 ? 30 : 0));
        
        // Generate improvement tip for endurance clicking
        let tip = "";
        if (staminaDropValue > 30) {
            tip = "You experienced significant performance drop in the second half. Try pacing yourself better at the start.";
        } else if (staminaDropValue > 15) {
            tip = "Moderate performance decrease detected. Work on maintaining a more consistent pace throughout.";
        } else if (staminaDropValue > 0) {
            tip = "Good consistency! Your endurance is solid with only a minor performance decrease.";
        } else {
            tip = "Excellent endurance! You maintained or improved your performance throughout the test.";
        }
        
        // Update user test results
        if (userPosition) userPosition.textContent = '--';
        if (userCpsScore) userCpsScore.textContent = cps.toFixed(1);
        if (userTotalClicks) userTotalClicks.textContent = clickCount;
        
        // Update advanced stats
        if (peakCpsEl) peakCpsEl.textContent = maxCpsValue.toFixed(1) + ' CPS';
        if (enduranceScoreEl) enduranceScoreEl.textContent = Math.round(enduranceScoreValue);
        if (staminaDropEl) staminaDropEl.textContent = staminaDropValue + '%';
        
        // Show user test results
        if (userTestResults) userTestResults.style.display = 'grid';
        if (advancedStats) advancedStats.style.display = 'grid';
        if (techniqueRecommendation) techniqueRecommendation.style.display = 'block';
        if (improvementTip) improvementTip.textContent = tip;
        
        // Update status
        statusDisplay.innerHTML = `
            <div class="cps-timer">${cps.toFixed(1)}</div>
            <div>Final CPS Score</div>
            <div>Total Clicks: ${clickCount}</div>
            <div>Test area will be available in 5 seconds</div>
        `;
        
        if (cleanDivider) cleanDivider.style.display = 'block';
        if (saveBtn) saveBtn.style.display = 'inline-flex';

        // Add to history
        const testResult = {
            date: new Date(),
            duration: testDuration,
            clicks: clickCount,
            cps: cps,
            peakCps: maxCpsValue,
            consistency: consistencyValue,
            endurance: Math.round(enduranceScoreValue),
            staminaDrop: staminaDropValue
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
            saveScoreToDatabase(cps, clickCount);
        } else {
            // Show login prompt for unauthenticated users
            statusDisplay.innerHTML += `<div style="margin-top: 10px; color: #4CAF50;"><i class="fas fa-info-circle"></i> <a href="/login/" style="color: #4CAF50;">Login</a> to save your score and see your global rank</div>`;
        }
        
        // Set 5-second cooldown before allowing another test
        testState = 'cooldown';
        let cooldownTime = 5;
        
        cooldownInterval = setInterval(() => {
            cooldownTime--;
            
            if (cooldownTime <= 0) {
                clearInterval(cooldownInterval);
                testState = 'ended';
                statusDisplay.innerHTML = `
                    <div class="cps-timer">${cps.toFixed(1)}</div>
                    <div>Final CPS Score</div>
                    <div>Total Clicks: ${clickCount}</div>
                    <div>Click to test again</div>
                `;
            } else {
                statusDisplay.innerHTML = `
                    <div class="cps-timer">${cps.toFixed(1)}</div>
                    <div>Final CPS Score</div>
                    <div>Total Clicks: ${clickCount}</div>
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
        clearInterval(testInterval);
        clearInterval(cooldownInterval);
        testState = 'idle';
        timeRemaining = testDuration;
        clickCount = 0;
        clickTimes = [];
        
        testArea.className = 'cps-test-area idle';
        statusDisplay.innerHTML = `
            <div class="cps-timer">${testDuration.toFixed(1)}</div>
            <div class="cps-click-counter">Clicks: 0</div>
            <div>Click to start endurance test</div>
        `;
        
        // Removed progress bar reset logic
        if (currentTimeLabel) currentTimeLabel.textContent = '0s';
        if (clickRateDisplay) clickRateDisplay.textContent = 'Current Rate: 0.0 CPS';
        
        if (userTestResults) userTestResults.style.display = 'none';
        if (advancedStats) advancedStats.style.display = 'none';
        if (techniqueRecommendation) techniqueRecommendation.style.display = 'none';
        if (saveBtn) saveBtn.style.display = 'none';
        if (cleanDivider) cleanDivider.style.display = 'none';
    }
    
    // Save score to database
    function saveScoreToDatabase(score, clicks) {
        fetch('/save-100-second-cps-score/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify({
                score: score,
                clicks: clicks
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                console.log('Score saved successfully');
                // Update user position display
                if (userPosition) userPosition.textContent = '#' + data.user_rank;
                
                // Check if user achieved a special rank and show appropriate animation
                if (data.user_rank <= 10) {
                    showAchievementAnimation(data.user_rank, score, clicks);
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
    function showAchievementAnimation(rank, score, clicks) {
        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'achievement-overlay';
        
        let icon, title, message;
        
        if (rank === 1) {
            icon = '👑';
            title = 'ENDURANCE CHAMPION!';
            message = `You've achieved the #1 spot globally with ${score.toFixed(1)} CPS over 100 seconds! Your stamina is unmatched.`;
        } else if (rank === 2) {
            icon = '🥈';
            title = 'SILVER STAMINA!';
            message = `Amazing endurance! You're the 2nd best clicker worldwide with ${score.toFixed(1)} CPS over 100 seconds.`;
        } else if (rank === 3) {
            icon = '🥉';
            title = 'BRONZE ENDURANCE!';
            message = `Outstanding stamina! You've secured the 3rd position globally with ${score.toFixed(1)} CPS.`;
        } else if (rank <= 10) {
            icon = '🏆';
            title = 'TOP 10 ENDURANCE!';
            message = `Excellent performance! You've made it to the top 10 with ${score.toFixed(1)} CPS over 100 seconds.`;
        } else {
             // In case of any other ranks, do nothing
            return;
        }
        
        overlay.innerHTML = `
            <div class="achievement-content">
                <div class="achievement-icon">${icon}</div>
                <h2 class="achievement-title">${title}</h2>
                <p class="achievement-message">${message}</p>
                <div class="achievement-rank">Rank: #${rank} | Score: ${score.toFixed(1)} CPS | Clicks: ${clicks}</div>
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
        fetch('/get-100-second-cps-leaderboard/')
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
                        <td class="leaderboard-score">${parseFloat(score.score).toFixed(1)} CPS</td>
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
