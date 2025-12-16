document.addEventListener('DOMContentLoaded', () => {
    const sourceGameSelect = document.getElementById('source-game');
    const targetGamesSelect = document.getElementById('target-games');
    const sourceSensInput = document.getElementById('source-sens');
    const dpiInput = document.getElementById('dpi-value');
    const convertBtn = document.getElementById('convert-btn');
    const resetBtn = document.getElementById('reset-btn');
    const resultsContainer = document.getElementById('results-container');
    const gameResultsDiv = document.getElementById('game-results');

    // 1. GAME DEFINITIONS
    // *** COD titles are separated here and ready to use in the constants. ***
    const GAMES = {
        // --- Valve ---
        cs2: { name: 'Counter-Strike 2 / CS:GO', metric: 'Sensitivity' },
        tf2: { name: 'Team Fortress 2', metric: 'Sensitivity' },
        
        // --- Riot ---
        valorant: { name: 'Valorant', metric: 'Sensitivity' },
        
        // --- EA / Respawn ---
        apex: { name: 'Apex Legends', metric: 'Sensitivity' },
        
        // --- Blizzard ---
        overwatch2: { name: 'Overwatch 2', metric: 'Sensitivity' },
        
        // --- Activision (COD) ---
        // *** KEYS ARE SEPARATE: bo6, warzone, cod_legacy ***
        bo6: { name: 'COD: Black Ops 6', metric: 'Sensitivity' },
        warzone: { name: 'COD: Warzone / MW2 / MW3', metric: 'Sensitivity' },
        cod_legacy: { name: 'COD: Cold War / Vanguard', metric: 'Sensitivity' },

        // --- Ubisoft ---
        r6siege: { name: 'Rainbow Six Siege (Standard)', metric: 'Sensitivity' },
        xdefiant: { name: 'XDefiant', metric: 'Sensitivity' },

        // --- Epic Games ---
        fortnite: { name: 'Fortnite ', metric: '%' },

        // --- Battle Royales / Looters ---
        pubg: { name: 'PUBG', metric: 'Sensitivity' },
        destiny2: { name: 'Destiny 2', metric: 'Sensitivity' },
        tarkov: { name: 'Escape from Tarkov', metric: 'Sensitivity' },
        thefinals: { name: 'THE FINALS', metric: 'Sensitivity' },
        rust: { name: 'Rust', metric: 'Sensitivity' },

        // --- Hero / Arena ---
        marvelrivals: { name: 'Marvel Rivals', metric: 'Sensitivity' },
        halo_infinite: { name: 'Halo Infinite', metric: 'Sensitivity' },
        
        // --- Trainers / Rhythm ---
        aimlab: { name: 'Aim Lab', metric: 'Sensitivity' },
        kovaaks: { name: "KovaaK's", metric: 'Sensitivity' },
        
        // --- Misc ---
        roblox: { name: 'Roblox', metric: 'Sensitivity' },
        minecraft: { name: 'Minecraft (Java)', metric: 'Sensitivity' }
    };

    /**
     * 2. YAW CONSTANTS (The Math)
     * *** CONSTANTS ARE SEPARATE AND MATCH GAMES OBJECT KEYS ***
     */
    const GAME_CONSTANTS = {
        // Source Engine Standard (0.022)
        cs2: 0.022, 
        tf2: 0.022, 
        apex: 0.022, 
        aimlab: 0.022, 
        kovaaks: 0.022, 
        rust: 0.022,
        tarkov: 0.022,

        // Valorant (0.07)
        valorant: 0.07,

        // Overwatch & COD Standard (0.0066)
        overwatch2: 0.0066,
        bo6: 0.0066,      // Key matches GAMES object
        warzone: 0.0066,  // Key matches GAMES object
        cod_legacy: 0.0066, // Key matches GAMES object
        destiny2: 0.0066,
        marvelrivals: 0.0066,
        xdefiant: 0.0066,

        // Fortnite (0.005555)
        fortnite: 0.005555,

        // R6 Siege (0.00572 for Standard)
        r6siege: 0.00572, 

        // The Finals (0.00572 - UE5 standard scaler)
        thefinals: 0.00572, 
        
        // PUBG
        pubg: 0.00702,

        // Halo Infinite
        halo_infinite: 0.00572,

        // Roblox
        roblox: 0.0035,
        
        // Minecraft
        minecraft: 0.005
    };

    // 3. CONVERSION LOGIC
    const CONVERSION_FORMULAS = {};
    
    // Safety check: Ensure all games have constants
    Object.keys(GAMES).forEach(gameKey => {
        if (!GAME_CONSTANTS.hasOwnProperty(gameKey) && gameKey !== 'osu') {
            // Note: This console.warn is now unlikely to fire due to separated keys
            console.warn(`Missing constant for ${gameKey}, defaulting to Source.`);
            GAME_CONSTANTS[gameKey] = 0.022;
        }
    });

    Object.keys(GAME_CONSTANTS).forEach(game => {
        const yaw = GAME_CONSTANTS[game];
        CONVERSION_FORMULAS[game] = {
            toCm360: (sens, dpi) => {
                if (game === 'osu') return 0;
                return 360 / (sens * dpi * yaw);
            },
            fromCm360: (cm360, dpi) => {
                if (game === 'osu') return 1.0;
                return 360 / (cm360 * dpi * yaw);
            }
        };
    });

    // Populate Select Options
    function populateSelects() {
        // List the games in the order they appear in the HTML you want, or just sort them
        const gamesList = [
            'apex', 'aimlab', 
            'bo6', 'warzone', 'cod_legacy', // *** SEPARATED COD GAMES ***
            'cs2', 'destiny2', 'tarkov', 'fortnite', 'halo_infinite', 
            'kovaaks', 'marvelrivals', 'overwatch2', 'pubg', 'r6siege', 'rust', 
            'tf2', 'thefinals', 'valorant', 'xdefiant',
            'minecraft', 'roblox' // Misc games not in your list but kept for completeness
        ].filter(key => GAMES.hasOwnProperty(key)).map(key => [key, GAMES[key]]);
        
        const optionsHTML = gamesList.map(([key, { name }]) => `<option value="${key}">${name}</option>`).join('');
        
        if(sourceGameSelect) sourceGameSelect.innerHTML = '<option value="" disabled selected>Select a game</option>' + optionsHTML;
        if(targetGamesSelect) targetGamesSelect.innerHTML = optionsHTML;
    }
    populateSelects();

    // MAIN CONVERSION FUNCTION
    function convertSensitivity() {
        gameResultsDiv.innerHTML = '';
        if (resultsContainer) resultsContainer.classList.add('hidden');

        const sourceGame = sourceGameSelect.value;
        const sourceSens = parseFloat(sourceSensInput.value);
        const dpi = parseInt(dpiInput.value, 10);

        // Validation
        if (!sourceGame || isNaN(sourceSens) || isNaN(dpi)) {
            alert('Please fill in all fields (Game, Sensitivity, and DPI).');
            return;
        }

        // *** THIS IS THE CRITICAL CHECK THAT NO LONGER ERRORS ***
        if (!CONVERSION_FORMULAS[sourceGame] && sourceGame !== 'osu') {
             // This alert should no longer appear for COD games if the HTML is updated.
             alert(`Error: Converter constants missing for ${sourceGame}.`);
             return;
        }

        const targetGames = Array.from(targetGamesSelect.selectedOptions).map(o => o.value);
        if (targetGames.length === 0) {
            alert('Please select at least one target game.');
            return;
        }

        if (sourceGame === 'osu') {
             alert("Osu! (2D) cannot be converted to 3D shooters using 360 distance.");
             return;
        }

        // Calculate Base cm/360
        const sourceFormula = CONVERSION_FORMULAS[sourceGame];
        const cm360 = sourceFormula.toCm360(sourceSens, dpi);

        let resultsHTML = '';
        
        targetGames.forEach(target => {
            if (target === 'osu') return; 

            if (!CONVERSION_FORMULAS[target]) {
                console.error(`Missing formula for target: ${target}`);
                return;
            }

            const targetFormula = CONVERSION_FORMULAS[target];
            let resultSens = targetFormula.fromCm360(cm360, dpi);
            
            // Enforce 3 decimal places for everything
            const decimals = 3;

            resultsHTML += `
                <div class="game-result">
                    <div class="result-header">
                        <span class="game-name">${GAMES[target].name}</span>
                    </div>
                    <div class="result-value">
                        ${resultSens.toFixed(decimals)} <span class="unit">${GAMES[target].metric}</span>
                    </div>
                </div>
            `;
        });

        gameResultsDiv.innerHTML = resultsHTML;
        if (resultsContainer) resultsContainer.classList.remove('hidden');
    }

    // Reset Logic
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            sourceGameSelect.value = "";
            sourceSensInput.value = "";
            dpiInput.value = "";
            Array.from(targetGamesSelect.options).forEach(opt => opt.selected = false);
            resultsContainer.classList.add('hidden');
            gameResultsDiv.innerHTML = "";
        });
    }

    if (convertBtn) convertBtn.addEventListener('click', convertSensitivity);
});