document.addEventListener("DOMContentLoaded", () => {
    const leaderboardContent = document.getElementById("leaderboard-content");

    fetch("/get-spacebar-leaderboard-60/")
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
    const userCps = document.getElementById('user-cps');
    const resetBtn = document.getElementById('spacebar-reset-btn');
    const saveBtn = document.getElementById('save-btn');
    const advancedStats = document.getElementById('advanced-stats');
    const techniqueRecommendation = document.getElementById('technique-recommendation');
    const improvementTip = document.getElementById('improvement-tip');
    const peakCpsEl = document.getElementById('peak-cps');
    const enduranceScoreEl = document.getElementById('endurance-score');
    const averageCpsEl = document.getElementById('average-cps');
    const leaderboardContent = document.getElementById('leaderboard-content');
    const cleanDivider = document.querySelector('.clean-divider');

    // Test variables - 60 seconds for endurance test
    let testDuration = 60;
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
    
    // Keyboard event listener
    document.addEventListener('keydown', function(e) {
        if (e.code === 'Space') {
            // Prevent spacebar from scrolling the page
            e.preventDefault();
            
            // Visual feedback for spacebar press
            spacebarKey.classList.add('pressed');
            
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
            spacebarKey.classList.remove('pressed');
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
                    <div>Press spacebar for 60 seconds!</div>
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

        // Format time like 60.0, 59.9 ... 0.1, 0.0
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
        
        // Update presses display
        document.querySelector('.spacebar-press-counter').textContent = `Presses: ${pressCount}`;
        
        // Visual feedback for spacebar
        spacebarKey.classList.add('pressed');
        setTimeout(() => {
            spacebarKey.classList.remove('pressed');
        }, 100);
        
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
        
        // Calculate additional metrics for endurance test
        let peakCpsValue = 0;
        let enduranceScoreValue = 100;
        let averageCpsValue = pressesPerSecond;
        
        if (pressTimes.length > 10) {
            // Calculate peak CPS in any 1-second window
            const oneSecond = 1000;
            let startIdx = 0;
            
            for (let i = 0; i < pressTimes.length; i++) {
                while (pressTimes[i] - pressTimes[startIdx] > oneSecond) {
                    startIdx++;
                }
                peakCpsValue = Math.max(peakCpsValue, i - startIdx + 1);
            }
            
            // Calculate endurance score (consistency over time)
            // Split into 4 quarters and compare performance
            const quarterTime = totalTime / 4;
            const quarters = [0, 0, 0, 0];
            let currentQuarter = 0;
            
            for (let i = 0; i < pressTimes.length; i++) {
                const pressTime = (pressTimes[i] - startTime) / 1000;
                const quarter = Math.min(3, Math.floor(pressTime / quarterTime));
                quarters[quarter]++;
            }
            
            const quarterAverages = quarters.map(count => count / quarterTime);
            const maxQuarter = Math.max(...quarterAverages);
            const minQuarter = Math.min(...quarterAverages);
            
            // Endurance score is based on consistency between quarters
            enduranceScoreValue = Math.max(0, 100 - ((maxQuarter - minQuarter) / maxQuarter * 100));
        }
        
        // Generate improvement tip for spacebar endurance
        let tip = "";
        if (pressCount < 300) {
            tip = "Focus on developing a consistent rhythm rather than speed. endurance comes from consistency.";
        } else if (pressCount < 450) {
            tip = "Try to maintain a steady pace throughout the test. Avoid starting too fast and burning out.";
        } else if (pressCount < 600) {
            tip = "Work on your breathing and relaxation techniques to maintain speed without tension.";
        } else if (pressCount < 750) {
            tip = "Your endurance is excellent. Focus on minute technique adjustments for elite performance.";
        } else {
            tip = "You're at an elite endurance level! Consider streaming or competing in spacebar endurance events.";
        }
        
        // Update user test results
        userPosition.textContent = '--';
        userScore.textContent = pressCount;
        userCps.textContent = pressesPerSecond.toFixed(1);
        
        // Show user test results
        userTestResults.style.display = 'grid';
        
        // Update other results
        peakCpsEl.textContent = peakCpsValue.toFixed(1);
        enduranceScoreEl.textContent = Math.round(enduranceScoreValue);
        averageCpsEl.textContent = pressesPerSecond.toFixed(1);
        improvementTip.textContent = tip;
        
        // Show detailed results and advanced stats
        advancedStats.style.display = 'grid';
        techniqueRecommendation.style.display = 'block';
        
        // Update status
        statusDisplay.innerHTML = `
            <div class="spacebar-timer">${pressCount}</div>
            <div>Final Spacebar Presses</div>
            <div>${pressesPerSecond.toFixed(1)} presses per second</div>
            <div>Test area will be available in 5 seconds</div>
        `;
        cleanDivider.style.display = 'block';

        // Add to history
        const testResult = {
            date: new Date(),
            duration: testDuration,
            presses: pressCount,
            pressesPerSecond: pressesPerSecond,
            peakCps: peakCpsValue,
            enduranceScore: enduranceScoreValue,
            averageCps: pressesPerSecond
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
            saveScoreToDatabase(pressCount, pressCount);
        } else {
            // Show login prompt for unauthenticated users
            statusDisplay.innerHTML += `<div style="margin-top: 10px; color: #FFD700;"><i class="fas fa-info-circle"></i> <a href="/login/" style="color: #FFD700;">Login</a> to save your score and see your global rank</div>`;
        }
        
        // Set 5-second cooldown before allowing another test (longer for endurance test)
        testState = 'cooldown';
        let cooldownTime = 5;
        
        cooldownInterval = setInterval(() => {
            cooldownTime--;
            
            if (cooldownTime <= 0) {
                clearInterval(cooldownInterval);
                testState = 'ended';
                statusDisplay.innerHTML = `
                    <div class="spacebar-timer">${pressCount}</div>
                    <div>Final Spacebar Presses</div>
                    <div>${pressesPerSecond.toFixed(1)} presses per second</div>
                    <div>Click to test again</div>
                `;
            } else {
                statusDisplay.innerHTML = `
                    <div class="spacebar-timer">${pressCount}</div>
                    <div>Final Spacebar Presses</div>
                    <div>${pressesPerSecond.toFixed(1)} presses per second</div>
                    <div>Test area will be available in ${cooldownTime}s</div>
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
        userStats.consistency = ((userStats.consistency * (userStats.totalTests - 1)) + testResult.enduranceScore) / userStats.totalTests;
    }
    
    // Reset the test
    function resetTest() {
        clearInterval(testInterval);
        clearInterval(cooldownInterval);
        testState = 'idle';
        timeRemaining = testDuration;
        pressCount = 0;
        pressTimes = [];
        
        testArea.className = 'spacebar-test-area idle';
        statusDisplay.innerHTML = `
            <div class="spacebar-timer">${testDuration.toFixed(1)}</div>
            <div class="spacebar-press-counter">Presses: 0</div>
            <div>Click or press spacebar to start endurance test</div>
        `;
        
        userTestResults.style.display = 'none';
        advancedStats.style.display = 'none';
        techniqueRecommendation.style.display = 'none';
        saveBtn.style.display = 'none';
    }
    
    // Save score to database
    function saveScoreToDatabase(score, presses) {
        fetch('/save-spacebar-score-60/', {
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
            message = `You've achieved the #1 spot globally with ${score} presses! Your spacebar endurance is unmatched.`;
        } else if (rank === 2) {
            icon = '🥈';
            title = 'SILVER ENDURANCE!';
            message = `Amazing stamina! You're the 2nd best spacebar presser worldwide with ${score} presses.`;
        } else if (rank === 3) {
            icon = '🥉';
            title = 'BRONZE ENDURANCE!';
            message = `Outstanding endurance! You've secured the 3rd position globally with ${score} presses.`;
        } else if (rank <= 4) {
            icon = '⭐';
            title = 'TOP 4 STAMINA!';
            message = `Incredible endurance! You're among the top 4 spacebar pressers worldwide with ${score} presses.`;
        } else if (rank <= 10) {
            icon = '🏆';
            title = 'TOP 10 ENDURANCE!';
            message = `Excellent stamina! You've made it to the top 10 with ${score} presses. Keep pushing for the top!`;
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
            document.getElementById('top-player-name').textContent = stats.name || '--';
            document.getElementById('top-player-score').textContent = stats.score || '--';
            document.getElementById('top-player-presses').textContent = stats.presses || '--';
        }
    }
    
    // Update leaderboard with latest data
    function updateLeaderboard() {
        fetch('/get-spacebar-leaderboard-60/')
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