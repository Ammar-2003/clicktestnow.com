// Global variables for accessibility
const leaderboardContent = document.getElementById("leaderboard-content");
const topPlayerName = document.getElementById('top-player-name');
const topPlayerTime = document.getElementById('top-player-time');
const topPlayerAttempts = document.getElementById('top-player-attempts');

// Helper function to render leaderboard data
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
                    <td class="leaderboard-score">${parseInt(score.score)} ms</td>
                    <td class="leaderboard-date">${formattedDate}</td>
                </tr>
            `;
        });
    }

    if (leaderboardContent) {
        leaderboardContent.innerHTML = leaderboardHTML;
    }
}

// Helper function to update top player stats
function updateTopPlayerStats(stats) {
    if (stats) {
        if (topPlayerName) topPlayerName.textContent = stats.name || '--';
        if (topPlayerTime) topPlayerTime.textContent = (stats.score ? Math.round(stats.score) : '--') + ' ms';
        if (topPlayerAttempts) topPlayerAttempts.textContent = stats.attempts || '--';
    }
}

// Initial leaderboard fetch on page load
document.addEventListener("DOMContentLoaded", () => {
    fetch("/get-reaction-time-leaderboard/")
        .then(res => res.json())
        .then(data => {
            if (data.status === "success") {
                renderLeaderboard(data.leaderboard);
                if (data.top_player_stats) {
                    updateTopPlayerStats(data.top_player_stats);
                }
            } else {
                if (leaderboardContent) {
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
});


document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const testArea = document.getElementById('reaction-test-area');
    const statusDisplay = document.getElementById('reaction-status');
    const timeDisplay = document.getElementById('reaction-time');
    const attemptsDisplay = document.getElementById('reaction-attempts');
    const waitingIndicator = document.getElementById('waiting-indicator');
    const userTestResults = document.getElementById('user-test-results');
    const userPosition = document.getElementById('user-position');
    const userReactionTime = document.getElementById('user-reaction-time');
    const userBestTime = document.getElementById('user-best-time');
    const resetBtn = document.getElementById('reaction-reset-btn');
    const saveBtn = document.getElementById('save-btn');
    const userTestResultsSection = document.getElementById('user-test-results');
    const advancedStats = document.getElementById('advanced-stats');
    const techniqueRecommendation = document.getElementById('technique-recommendation');
    const improvementTip = document.getElementById('improvement-tip');
    const cognitiveSpeedEl = document.getElementById('cognitive-speed');
    const consistencyScoreEl = document.getElementById('consistency-score');
    const improvementScoreEl = document.getElementById('improvement-score');
    const cleanDivider = document.querySelector('.clean-divider');

    // Test variables
    const totalAttempts = 5;
    let currentAttempt = 0;
    let reactionTimes = [];
    let testState = 'idle'; // 'idle', 'waiting', 'ready', 'recording', 'ended'
    let waitTimer;
    let startTime;
    let testTimeout;
    let testHistory = [];
    
    // Reset test button
    if (resetBtn) {
        resetBtn.addEventListener('click', resetTest);
    }
    
    // Test area click handler
    if (testArea) {
        testArea.addEventListener('click', function() {
            if (testState === 'idle' || testState === 'ended') {
                startTest();
                return;
            }
            
            if (testState === 'waiting') {
                // Clicked too soon
                tooSoon();
                return;
            }
            
            if (testState === 'ready') {
                // Valid click - record reaction time
                recordReactionTime();
                return;
            }
        });
    }
    
    // Start the test
    function startTest() {
        if (testState !== 'idle' && testState !== 'ended') return;

        testState = 'waiting';
        currentAttempt = 0;
        reactionTimes = [];

        if (testArea) {
            testArea.classList.remove('ended', 'too-soon');
            testArea.classList.add('waiting');
        }

        updateDisplay();
        startNextAttempt();
    }
    
    // Start the next attempt
    function startNextAttempt() {
        if (currentAttempt >= totalAttempts) {
            endTest();
            return;
        }
        
        testState = 'waiting';
        if (testArea) {
            testArea.classList.remove('ready', 'too-soon');
            testArea.classList.add('waiting');
        }
        
        updateDisplay();
        
        // Random wait time between 1-5 seconds
        const waitTime = Math.random() * 4000 + 1000;
        
        waitTimer = setTimeout(() => {
            if (testState === 'waiting') {
                testState = 'ready';
                if (testArea) {
                    testArea.classList.remove('waiting');
                    testArea.classList.add('ready');
                }
                startTime = Date.now();
                
                // Set timeout for no response (5 seconds)
                testTimeout = setTimeout(() => {
                    if (testState === 'ready') {
                        noResponse();
                    }
                }, 5000);
                
                updateDisplay();
            }
        }, waitTime);
    }
    
    // Update the display
    function updateDisplay() {
        if (!timeDisplay || !attemptsDisplay || !waitingIndicator) return;
        switch(testState) {
            case 'idle':
                timeDisplay.textContent = '--';
                attemptsDisplay.textContent = `Attempts: 0/${totalAttempts}`;
                waitingIndicator.textContent = 'Click to start test';
                break;
            case 'waiting':
                timeDisplay.textContent = '--';
                attemptsDisplay.textContent = `Attempts: ${currentAttempt}/${totalAttempts}`;
                waitingIndicator.textContent = 'Wait for green...';
                break;
            case 'ready':
                timeDisplay.textContent = '--';
                attemptsDisplay.textContent = `Attempts: ${currentAttempt}/${totalAttempts}`;
                waitingIndicator.textContent = 'CLICK NOW!';
                break;
            case 'recording':
                // This state is very brief, just for visual feedback
                break;
            case 'ended':
                timeDisplay.textContent = '--'; // Display on main screen reset
                attemptsDisplay.textContent = `Attempts: ${currentAttempt}/${totalAttempts}`;
                waitingIndicator.textContent = 'Test complete. Click to restart.';
                break;
            case 'too-soon':
                timeDisplay.textContent = 'TOO SOON';
                attemptsDisplay.textContent = `Attempts: ${currentAttempt}/${totalAttempts}`;
                waitingIndicator.textContent = 'Wait for green next time';
                break;
        }
    }
    
    // Record reaction time
    function recordReactionTime() {
        clearTimeout(testTimeout);
        
        const reactionTime = Date.now() - startTime;
        reactionTimes.push(reactionTime);
        currentAttempt++;
        
        // Visual feedback
        testState = 'recording';
        if (testArea) {
            testArea.classList.remove('ready');
        }
        
        // Show the reaction time briefly
        if (timeDisplay) {
            timeDisplay.textContent = reactionTime;
        }
        
        // Brief pause before next attempt
        setTimeout(() => {
            startNextAttempt();
        }, 1000);
    }
    
    // Clicked too soon
    function tooSoon() {
        clearTimeout(waitTimer);
        clearTimeout(testTimeout);
        
        testState = 'too-soon';
        if (testArea) {
            testArea.classList.remove('waiting');
            testArea.classList.add('too-soon');
        }
        
        updateDisplay();
        
        // Brief pause before next attempt
        setTimeout(() => {
            startNextAttempt();
        }, 1500);
    }
    
    // No response
    function noResponse() {
        testState = 'waiting';
        if (testArea) {
            testArea.classList.remove('ready');
            testArea.classList.add('waiting');
        }
        
        // Count as a very slow response (1000ms)
        reactionTimes.push(1000);
        currentAttempt++;
        
        updateDisplay();
        
        // Brief pause before next attempt
        setTimeout(() => {
            startNextAttempt();
        }, 1000);
    }
    
    // End the test
    function endTest() {
        testState = 'ended';
        if (testArea) {
            testArea.classList.remove('waiting', 'ready');
            testArea.classList.add('ended');
        }
        
        // Calculate the average time for tips, but use the best time for saving
        const averageTime = calculateAverage(reactionTimes);
        const bestTime = Math.min(...reactionTimes);
        const consistency = calculateConsistency(reactionTimes);
        const improvement = calculateImprovement(reactionTimes);
        
        // Update user test results
        if (userPosition) userPosition.textContent = '--';
        if (userReactionTime) userReactionTime.textContent = Math.round(bestTime) + ' ms';
        if (userBestTime) userBestTime.textContent = Math.round(bestTime) + ' ms'; // Best time is also the saved score
        
        // Update advanced stats
        if (cognitiveSpeedEl) cognitiveSpeedEl.textContent = Math.round(averageTime) + ' ms';
        if (consistencyScoreEl) consistencyScoreEl.textContent = Math.round(consistency) + '%';
        if (improvementScoreEl) improvementScoreEl.textContent = Math.round(improvement) + '%';
        
        // Generate improvement tip based on the overall average performance
        let tip = "";
        if (averageTime < 200) {
            tip = "Exceptional reaction time! You're in the top 1% of performers.";
        } else if (averageTime < 250) {
            tip = "Excellent reaction time! With practice, you could reach elite levels.";
        } else if (averageTime < 300) {
            tip = "Good reaction time. Focus on anticipation and reducing distractions to improve further.";
        } else if (averageTime < 350) {
            tip = "Average reaction time. Regular practice and good sleep can help improve your speed.";
        } else {
            tip = "Your reaction time can be improved. Try practicing daily and ensure you're well-rested.";
        }
        
        if (improvementTip) improvementTip.textContent = tip;
        
        // Show results sections
        if (userTestResultsSection) userTestResultsSection.style.display = 'grid';
        if (advancedStats) advancedStats.style.display = 'grid';
        if (techniqueRecommendation) techniqueRecommendation.style.display = 'block';
        if (cleanDivider) cleanDivider.style.display = 'block';
        if (saveBtn) saveBtn.style.display = 'inline-flex';
        
        updateDisplay();
        
        // Save the score to the database if user is authenticated
        if (isUserAuthenticated) {
            saveScoreToDatabase(bestTime, totalAttempts);
        } else {
            // Show login prompt for unauthenticated users
            if (waitingIndicator) waitingIndicator.textContent += ' Login to save your score and see your global rank';
        }
    }
    
    // Calculate average reaction time
    function calculateAverage(times) {
        if (times.length === 0) return 0;
        return times.reduce((a, b) => a + b, 0) / times.length;
    }
    
    // Calculate consistency (lower standard deviation = higher consistency)
    function calculateConsistency(times) {
        if (times.length < 2) return 100;
        
        const average = calculateAverage(times);
        const variance = times.reduce((sum, time) => sum + Math.pow(time - average, 2), 0) / times.length;
        const stdDev = Math.sqrt(variance);
        
        // Convert to percentage (lower stdDev = higher consistency)
        return Math.max(0, 100 - (stdDev / average * 100));
    }
    
    // Calculate improvement from first to last attempt
    function calculateImprovement(times) {
        if (times.length < 2) return 0;
        
        const firstHalf = times.slice(0, Math.ceil(times.length / 2));
        const secondHalf = times.slice(Math.floor(times.length / 2));
        
        const firstAvg = calculateAverage(firstHalf);
        const secondAvg = calculateAverage(secondHalf);
        
        return Math.max(0, (firstAvg - secondAvg) / firstAvg * 100);
    }
    
    // Reset the test
    function resetTest() {
        clearTimeout(waitTimer);
        clearTimeout(testTimeout);
        
        testState = 'idle';
        currentAttempt = 0;
        reactionTimes = [];
        
        if (testArea) testArea.className = 'reaction-test-area waiting';
        
        if (userTestResultsSection) userTestResultsSection.style.display = 'none';
        if (advancedStats) advancedStats.style.display = 'none';
        if (techniqueRecommendation) techniqueRecommendation.style.display = 'none';
        if (saveBtn) saveBtn.style.display = 'none';
        if (cleanDivider) cleanDivider.style.display = 'none';
        
        updateDisplay();
    }
    
    // Save score to database
    function saveScoreToDatabase(score, attempts) {
        fetch('/save-reaction-time-score/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify({
                score: score,
                attempts: attempts
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
                    showAchievementAnimation(data.user_rank, score, attempts);
                }
                
                // Update leaderboard with new data
                updateLeaderboard();
                
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
    function showAchievementAnimation(rank, score, attempts) {
        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'achievement-overlay';
        
        let icon, title, message;
        
        if (rank === 1) {
            icon = '👑';
            title = 'WORLD CHAMPION!';
            message = `You've achieved the #1 spot globally with ${Math.round(score)}ms reaction time! Your reflexes are unmatched.`;
        } else if (rank === 2) {
            icon = '🥈';
            title = 'SILVER MEDALIST!';
            message = `Amazing reflexes! You're the 2nd fastest reactor worldwide with ${Math.round(score)}ms.`;
        } else if (rank === 3) {
            icon = '🥉';
            title = 'BRONZE MEDALIST!';
            message = `Outstanding! You've secured the 3rd position globally with ${Math.round(score)}ms reaction time.`;
        } else if (rank <= 4) {
            icon = '⭐';
            title = 'TOP 4 ELITE!';
            message = `Incredible! You're among the top 4 fastest reactors worldwide with ${Math.round(score)}ms.`;
        } else if (rank <= 10) {
            icon = '🏆';
            title = 'TOP 10 MASTER!';
            message = `Excellent! You've made it to the top 10 with ${Math.round(score)}ms reaction time. Keep pushing for the top!`;
        } else {
             // In case of any other ranks, do nothing
            return;
        }
        
        overlay.innerHTML = `
            <div class="achievement-content">
                <div class="achievement-icon">${icon}</div>
                <h2 class="achievement-title">${title}</h2>
                <p class="achievement-message">${message}</p>
                <div class="achievement-rank">Rank: #${rank} | Score: ${Math.round(score)}ms | Attempts: ${attempts}</div>
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
        const colors = ['#00FF00', '#00CC00', '#66FF66', '#00BFFF', '#32CD32', '#9370DB'];
        
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
    
    // Update leaderboard with latest data
    function updateLeaderboard() {
        fetch('/get-reaction-time-leaderboard/')
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
    
});
