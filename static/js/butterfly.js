document.addEventListener("DOMContentLoaded", () => {
    const leaderboardContent = document.getElementById("leaderboard-content");

    fetch("/get-butterfly-leaderboard/")
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
    const reactionTimeEl = document.getElementById('reaction-time');
    const staminaScoreEl = document.getElementById('stamina-score');
    const clickTechniqueEl = document.getElementById('click-technique');
    const techniqueTagsEl = document.getElementById('technique-tags');
    const leaderboardContent = document.getElementById('leaderboard-content');
    const cleanDivider = document.querySelector('.clean-divider');

    // Test variables - changed to 5 seconds for butterfly test
    let testDuration = 5;
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
    
    // Initialize preset buttons
    presetButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            if (testState !== 'idle' && testState !== 'ended') return;
            
            presetButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            testDuration = parseInt(this.dataset.duration);
            resetTest();
        });
    });
    
    // Reset test button
    resetBtn.addEventListener('click', resetTest);
    
    // Test area click handler
    testArea.addEventListener('click', function(e) {
        if (testState === 'idle' || testState === 'ended') {
            startTest();
            return;
        }
        
        if (testState === 'active') {
            registerClick(e);
        }
    });
    
    // Start the test
    function startTest() {
        if (testState !== 'idle' && testState !== 'ended') return;

        testState = 'countdown';
        clickCount = 0;
        clickTimes = [];
        timeRemaining = testDuration;

        testArea.classList.remove('idle', 'ended');
        testArea.classList.add('countdown');

        // 3-second countdown before test starts
        let countdown = 3;
        statusDisplay.innerHTML = `
            <div class="cps-timer">${countdown}</div>
            <div>Get ready to butterfly click!</div>
        `;

        const countdownInterval = setInterval(() => {
            countdown--;
            if (countdown > 0) {
                statusDisplay.innerHTML = `
                    <div class="cps-timer">${countdown}</div>
                    <div>Get ready to butterfly click!</div>
                `;
            } else {
                clearInterval(countdownInterval);
                testState = 'active';
                testArea.classList.remove('countdown');
                testArea.classList.add('active');
                
                // Updated to 5-second text for butterfly test
                statusDisplay.innerHTML = `
                    <div class="cps-timer">${timeRemaining.toFixed(1)}</div>
                    <div class="cps-click-counter">Clicks: ${clickCount}</div>
                    <div>Butterfly click as fast as you can!</div>
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

        // Format time like 5.0, 4.9 ... 0.1, 0.0
        const formattedTime = Math.max(0, timeRemaining).toFixed(1);

        // Update the global timer display
        timerDisplay.textContent = formattedTime;

        // Also update the timer shown inside the statusDisplay
        const statusTimer = statusDisplay.querySelector('.cps-timer');
        if (statusTimer) {
            statusTimer.textContent = formattedTime;
        }
    }
        
    // Register a click
    function registerClick(e) {
        if (testState !== 'active' || timeRemaining <= 0) return;
        
        clickCount++;
        const clickTime = Date.now();
        clickTimes.push(clickTime);
        
        // Update clicks display
        document.querySelector('.cps-click-counter').textContent = `Clicks: ${clickCount}`;
        
        // Create visual feedback
        const feedback = document.createElement('div');
        feedback.className = 'click-feedback';
        feedback.textContent = '+1';
        feedback.style.left = `${e.offsetX}px`;
        feedback.style.top = `${e.offsetY}px`;
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
        const cps = clickCount / totalTime;
        
        // Calculate additional metrics
        let maxCpsValue = 0;
        let consistencyValue = 100;
        let reactionTimeValue = 0;
        
        if (clickTimes.length > 1) {
            // Calculate max CPS in any 0.2-second window (scaled to 1 second)
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
            
            // Calculate butterfly frequency (average of first few clicks)
            const firstClicks = Math.min(3, clickTimes.length);
            reactionTimeValue = 1000 / ((clickTimes[firstClicks - 1] - startTime) / firstClicks);
        }
        
        // For 5-second butterfly test, stamina is calculated differently
        const staminaScoreValue = Math.min(100, consistencyValue * 0.8 + (clickCount > 70 ? 20 : 0));
        
        // Determine click technique - adjusted for butterfly clicking
        let technique = "Standard Clicking";
        let techniqueTags = "";
        
        if (clickTimes.length > 5) {
            const intervals = [];
            for (let i = 1; i < clickTimes.length; i++) {
                intervals.push(clickTimes[i] - clickTimes[i-1]);
            }
            
            const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
            const cpsRate = 1000 / avgInterval;
            
            if (cpsRate > 20) {
                technique = "Expert Butterfly";
                techniqueTags = '<span class="technique-tag">High Frequency</span><span class="technique-tag">Perfect Alternation</span>';
            } else if (cpsRate > 15) {
                technique = "Advanced Butterfly";
                techniqueTags = '<span class="technique-tag">Good Alternation</span><span class="technique-tag">Kohi Style</span>';
            } else if (cpsRate > 12) {
                technique = "Basic Butterfly";
                techniqueTags = '<span class="technique-tag">Two Fingers</span><span class="technique-tag">Alternating</span>';
            } else if (cpsRate > 8) {
                technique = "Standard Clicking";
                techniqueTags = '<span class="technique-tag">Single Finger</span><span class="technique-tag">Basic</span>';
            } else {
                technique = "Slow Clicking";
                techniqueTags = '<span class="technique-tag">Needs Practice</span>';
            }
        }
        
        // Generate improvement tip for butterfly clicking
        let tip = "";
        if (cps < 10) {
            tip = "Focus on alternating your fingers more quickly. Practice the rhythm of index-middle-index-middle finger movement.";
        } else if (cps < 15) {
            tip = "Try to reduce the gap between finger alternations. The smoother the transition, the higher your CPS will be.";
        } else if (cps < 20) {
            tip = "Work on building stamina to maintain your butterfly technique for the full 5 seconds without slowing down.";
        } else if (cps < 25) {
            tip = "Your butterfly technique is excellent. Focus on consistency to reach elite levels of performance.";
        } else {
            tip = "You're an elite butterfly clicker! Your technique rivals the best Kohi players. Consider sharing your methods with the community.";
        }
        
        // Update user test results
        userPosition.textContent = '--';
        userCpsScore.textContent = cps.toFixed(1);
        userTotalClicks.textContent = clickCount;
        
        // Show user test results
        userTestResults.style.display = 'grid';
        
        // Update other results
        reactionTimeEl.textContent = reactionTimeValue.toFixed(1) + ' Hz';
        staminaScoreEl.textContent = Math.round(staminaScoreValue);
        clickTechniqueEl.textContent = technique;
        techniqueTagsEl.innerHTML = techniqueTags;
        improvementTip.textContent = tip;
        
        // Show detailed results and advanced stats
        advancedStats.style.display = 'grid';
        techniqueRecommendation.style.display = 'block';
        
        // Update status
        statusDisplay.innerHTML = `
            <div class="cps-timer">${cps.toFixed(1)}</div>
            <div>Final Butterfly CPS Score</div>
            <div>Test area will be available in 3 seconds</div>
        `;
        cleanDivider.style.display = 'block';

        // Add to history
        const testResult = {
            date: new Date(),
            duration: testDuration,
            clicks: clickCount,
            cps: cps,
            maxCps: maxCpsValue,
            consistency: consistencyValue,
            butterflyFrequency: reactionTimeValue,
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
            saveScoreToDatabase(cps, clickCount);
        } else {
            // Show login prompt for unauthenticated users
            statusDisplay.innerHTML += `<div style="margin-top: 10px; color: #FF6B6B;"><i class="fas fa-info-circle"></i> <a href="/login/" style="color: #FF6B6B;">Login</a> to save your score and see your global rank</div>`;
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
                    <div class="cps-timer">${cps.toFixed(1)}</div>
                    <div>Final Butterfly CPS Score</div>
                    <div>Click to test again</div>
                `;
            } else {
                statusDisplay.innerHTML = `
                    <div class="cps-timer">${cps.toFixed(1)}</div>
                    <div>Final Butterfly CPS Score</div>
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
            <div>Click to start butterfly test</div>
        `;
        
        userTestResults.style.display = 'none';
        advancedStats.style.display = 'none';
        techniqueRecommendation.style.display = 'none';
        saveBtn.style.display = 'none';
    }
    
    // Save score to database
    function saveScoreToDatabase(score, clicks) {
        fetch('/save-butterfly-score/', {
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
                userPosition.textContent = '#' + data.user_rank;
                
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
            title = 'WORLD CHAMPION!';
            message = `You've achieved the #1 spot globally with ${score.toFixed(1)} CPS! Your butterfly clicking skills are unmatched.`;
        } else if (rank === 2) {
            icon = '🥈';
            title = 'SILVER MEDALIST!';
            message = `Amazing performance! You're the 2nd best butterfly clicker worldwide with ${score.toFixed(1)} CPS.`;
        } else if (rank === 3) {
            icon = '🥉';
            title = 'BRONZE MEDALIST!';
            message = `Outstanding! You've secured the 3rd position globally with ${score.toFixed(1)} CPS.`;
        } else if (rank <= 4) {
            icon = '⭐';
            title = 'TOP 4 ELITE!';
            message = `Incredible! You're among the top 4 butterfly clickers worldwide with ${score.toFixed(1)} CPS.`;
        } else if (rank <= 10) {
            icon = '🏆';
            title = 'TOP 10 MASTER!';
            message = `Excellent! You've made it to the top 10 with ${score.toFixed(1)} CPS. Keep pushing for the top!`;
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
        
        // Add confetti effects (limited amount)
        createConfetti(overlay);
        
        // Close button functionality
        overlay.querySelector('.achievement-close').addEventListener('click', () => {
            overlay.style.animation = 'fadeOut 0.5s ease forwards';
            setTimeout(() => {
                overlay.remove();
            }, 500);
        });
    }
    
    // Create confetti effect - LIMITED AMOUNT
    function createConfetti(container) {
        const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#4ECDC4', '#FF6B6B', '#FFE66D'];
        
        // Limited number of confetti particles (only 30)
        for (let i = 0; i < 30; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.animationDelay = Math.random() * 2 + 's';
            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.width = Math.random() * 8 + 4 + 'px';
            confetti.style.height = Math.random() * 8 + 4 + 'px';
            container.appendChild(confetti);
        }
    }
    
    // Update top player stats
    function updateTopPlayerStats(stats) {
        if (stats) {
            document.getElementById('top-player-name').textContent = stats.name || '--';
            document.getElementById('top-player-cps').textContent = (stats.score ? stats.score.toFixed(1) : '--') + ' CPS';
            document.getElementById('top-player-clicks').textContent = stats.clicks || '--';
        }
    }
    
    // Update leaderboard with latest data
    function updateLeaderboard() {
        fetch('/get-butterfly-leaderboard/')
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