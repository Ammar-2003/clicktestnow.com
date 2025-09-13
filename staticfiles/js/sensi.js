document.addEventListener('DOMContentLoaded', () => {
    const sourceGameSelect = document.getElementById('source-game');
    const targetGamesSelect = document.getElementById('target-games');
    const sourceSensInput = document.getElementById('source-sens');
    const dpiInput = document.getElementById('dpi-value');
    const convertBtn = document.getElementById('convert-btn');
    const resetBtn = document.getElementById('reset-btn');
    const resultsContainer = document.getElementById('results-container');
    const gameResultsDiv = document.getElementById('game-results');

    // GAMES & YAW CONSTANTS (cm/360 basis)
    const GAMES = {
        cs2: { name: 'Counter-Strike 2', metric: 'Sensitivity' },
        csgo: { name: 'CS:GO', metric: 'Sensitivity' },
        cs16: { name: 'Counter-Strike 1.6', metric: 'Sensitivity' },
        valorant: { name: 'Valorant', metric: 'Sensitivity' },
        apex: { name: 'Apex Legends', metric: 'Sensitivity' },
        overwatch2: { name: 'Overwatch 2', metric: 'Sensitivity' },
        marvelrivals: { name: 'Marvel Rivals', metric: 'Sensitivity' },
        thefinals: { name: 'THE FINALS', metric: 'Sensitivity' },
        fortnite: { name: 'Fortnite', metric: 'Sensitivity' },
        pubg: { name: 'PUBG (PC)', metric: 'Sensitivity' },
        cod_mw2019: { name: 'Call of Duty: Modern Warfare (2019)', metric: 'Sensitivity' },
        cod_mw2_2022: { name: 'Call of Duty: MWII (2022)', metric: 'Sensitivity' },
        cod_mw3_2023: { name: 'Call of Duty: MWIII (2023)', metric: 'Sensitivity' },
        warzone: { name: 'Call of Duty: Warzone', metric: 'Sensitivity' },
        warzone2: { name: 'Call of Duty: Warzone 2', metric: 'Sensitivity' },
        cod_cw: { name: 'Call of Duty: Black Ops Cold War', metric: 'Sensitivity' },
        cod_vanguard: { name: 'Call of Duty: Vanguard', metric: 'Sensitivity' },
        battlefield_1: { name: 'Battlefield 1', metric: 'Sensitivity' },
        battlefield_v: { name: 'Battlefield V', metric: 'Sensitivity' },
        battlefield_2042: { name: 'Battlefield 2042', metric: 'Sensitivity' },
        halo_infinite: { name: 'Halo Infinite', metric: 'Sensitivity' },
        destiny2: { name: 'Destiny 2', metric: 'Sensitivity' },
        tarkov: { name: 'Escape from Tarkov', metric: 'Sensitivity' },
        r6siege: { name: 'Rainbow Six Siege', metric: 'Sensitivity' },
        splitgate: { name: 'Splitgate', metric: 'Sensitivity' },
        xdefiant: { name: 'XDefiant', metric: 'Sensitivity' },
        helldivers2: { name: 'Helldivers 2', metric: 'Sensitivity' },
        stalker2: { name: 'STALKER 2', metric: 'Sensitivity' },
        quake_champions: { name: 'Quake Champions', metric: 'Sensitivity' },
        quake_live: { name: 'Quake Live', metric: 'Sensitivity' },
        tf2: { name: 'Team Fortress 2', metric: 'Sensitivity' },
        paladins: { name: 'Paladins', metric: 'Sensitivity' },
        hyperscape: { name: 'Hyper Scape', metric: 'Sensitivity' },
        roguecompany: { name: 'Rogue Company', metric: 'Sensitivity' },
        ins_sandstorm: { name: 'Insurgency: Sandstorm', metric: 'Sensitivity' },
        dayz: { name: 'DayZ', metric: 'Sensitivity' },
        warface: { name: 'Warface', metric: 'Sensitivity' },
        crossfire: { name: 'CrossFire', metric: 'Sensitivity' },
        krunker: { name: 'Krunker', metric: 'Sensitivity' },
        kovaaks: { name: "KovaaK's", metric: 'Sensitivity' },
        aimlab: { name: 'Aim Lab', metric: 'Sensitivity' },
        osu: { name: 'Osu!', metric: 'Sensitivity' },
        rust: { name: 'Rust', metric: 'Sensitivity' }
    };

    // Yaw constants (best-practice baselines aggregated from public converters)
    const GAME_CONSTANTS = {
        // Source/idTech cluster
        cs2: 0.022, csgo: 0.022, cs16: 0.022,
        quake_champions: 0.022, quake_live: 0.022,
        tf2: 0.022, kovaaks: 0.022, aimlab: 0.022, rust: 0.022, apex: 0.022,

        // Valorant (widely accepted)
        valorant: 0.07,

        // Overwatch / CoD / Destiny family (common cluster)
        overwatch2: 0.0066,
        cod_mw2019: 0.0066, cod_mw2_2022: 0.0066, cod_mw3_2023: 0.0066,
        warzone: 0.0066, warzone2: 0.0066, cod_cw: 0.0066, cod_vanguard: 0.0066,
        destiny2: 0.0066, helldivers2: 0.0066, marvelrivals: 0.0066,

        // Unreal/other engine baselines
        r6siege: 0.005729,
        splitgate: 0.005729, halo_infinite: 0.005729,
        ins_sandstorm: 0.005729, roguecompany: 0.005729,

        // Fortnite uses its own baseline historically documented by converters
        fortnite: 0.005555,

        // PUBG family (desktop baseline many converters place near VAL-like)
        // Corrected from 0.0007 to 0.007
        pubg: 0.007,

        // Browser / lightweight
        krunker: 0.02,

        // Tactical / military shooters
        tarkov: 0.0066,
        // Corrected from 0.022 to 0.02
        battlefield_1: 0.02,
        // Corrected from 0.022 to 0.02
        battlefield_v: 0.02,
        // Corrected from 0.022 to 0.015
        battlefield_2042: 0.015,

        // Other / approximations (supported by major online converters)
        xdefiant: 0.0066, thefinals: 0.005729, stalker2: 0.022,
        paladins: 0.022, hyperscape: 0.0066, warface: 0.0066,
        crossfire: 0.022, dayz: 0.022,
        kovaaks: 0.022, aimlab: 0.022, osu: 0.5
    };

    // Build conversion formulas (cm/360 approach)
    const CONVERSION_FORMULAS = {};
    Object.keys(GAME_CONSTANTS).forEach(game => {
        const yaw = GAME_CONSTANTS[game];
        CONVERSION_FORMULAS[game] = {
            toCm360: (sens, dpi) => {
                if (game === 'osu') {
                    return 360 / (sens * dpi * GAME_CONSTANTS['osu']);
                }
                return 360 / (sens * dpi * yaw);
            },
            fromCm360: (cm360, dpi) => {
                if (game === 'osu') {
                    return 360 / (cm360 * dpi * GAME_CONSTANTS['osu']);
                }
                return 360 / (cm360 * dpi * yaw);
            },
            name: GAMES[game] ? GAMES[game].name : game
        };
    });

    // Populate target select with same options as source
    function populateTargetSelect() {
        if (!targetGamesSelect) return;
        const games = Object.entries(GAMES).sort(([, a], [, b]) => a.name.localeCompare(b.name));
        const options = games.map(([key, { name }]) => `<option value="${key}">${name}</option>`).join('');
        targetGamesSelect.innerHTML = options;
    }
    populateTargetSelect();

    // ADD SEARCH BOXES for any select with class 'searchable'
    (function addSearchBoxes() {
        const selects = document.querySelectorAll('select.searchable');
        selects.forEach(select => {
            if (select.previousElementSibling && select.previousElementSibling.classList && select.previousElementSibling.classList.contains('select-search-wrapper')) return;

            const wrapper = document.createElement('div');
            wrapper.className = 'select-search-wrapper';
            wrapper.style.display = 'flex';
            wrapper.style.flexDirection = 'column';
            wrapper.style.gap = '6px';

            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = 'Search games...';
            input.className = 'select-search-input';
            input.style.padding = '6px';
            input.style.borderRadius = '6px';
            input.style.border = '1px solid #ccc';
            input.style.width = '100%';
            input.addEventListener('input', () => {
                const q = input.value.trim().toLowerCase();
                Array.from(select.options).forEach(opt => {
                    if (opt.disabled) {
                        opt.style.display = '';
                        return;
                    }
                    opt.style.display = (q === '' || opt.text.toLowerCase().includes(q)) ? '' : 'none';
                });
            });

            select.parentNode.insertBefore(wrapper, select);
            wrapper.appendChild(input);
            wrapper.appendChild(select);
        });
    })();

    // Main conversion (source -> selected targets)
    function convertSensitivity() {
        gameResultsDiv.innerHTML = '';
        if (resultsContainer) resultsContainer.classList.add('hidden');

        const sourceGame = sourceGameSelect.value;
        const sourceSens = parseFloat(sourceSensInput.value);
        const dpi = parseInt(dpiInput.value, 10);

        if (!sourceGame || isNaN(sourceSens) || isNaN(dpi)) {
            alert('Please select source game, enter sensitivity and DPI.');
            return;
        }

        if (!targetGamesSelect) {
            alert('Target games select (#target-games) not found in DOM.');
            return;
        }

        const targetGames = Array.from(targetGamesSelect.selectedOptions).map(o => o.value);
        if (targetGames.length === 0) {
            alert('Please select at least one target game to convert to.');
            return;
        }

        const sourceFormula = CONVERSION_FORMULAS[sourceGame];
        if (!sourceFormula) {
            alert('Source game not supported by converter constants.');
            return;
        }

        // Convert source sens -> cm/360
        const cm360 = sourceFormula.toCm360(sourceSens, dpi);

        // Convert cm/360 -> each selected target game sens
        let resultsHTML = '';
        let hasResults = false;

        targetGames.forEach(targetGame => {
            // Skip if target game is not in our formulas
            if (!CONVERSION_FORMULAS[targetGame]) return;

            const targetFormula = CONVERSION_FORMULAS[targetGame];
            const convertedSens = targetFormula.fromCm360(cm360, dpi);

            // Always show the result, even if it's the same game
            resultsHTML += `
                <div class="game-result">
                    <div class="game-name">${GAMES[targetGame].name}</div>
                    <div class="game-sens">${Number.isFinite(convertedSens) ? convertedSens.toFixed(6) : 'N/A'} ${GAMES[targetGame].metric}</div>
                </div>
            `;
            hasResults = true;
        });

        if (!hasResults) {
            alert('No valid targets converted (check selection or supported games).');
            return;
        }

        gameResultsDiv.innerHTML = resultsHTML;
        if (resultsContainer) resultsContainer.classList.remove('hidden');
    }

    // Reset (keeps page, clears fields)
    function resetForm() {
        if (sourceGameSelect) sourceGameSelect.value = '';
        if (targetGamesSelect) Array.from(targetGamesSelect.options).forEach(o => o.selected = false);
        if (sourceSensInput) sourceSensInput.value = '';
        if (dpiInput) dpiInput.value = '';
        if (gameResultsDiv) gameResultsDiv.innerHTML = '';
        if (resultsContainer) resultsContainer.classList.add('hidden');
    }

    // Wire up buttons
    if (convertBtn) convertBtn.addEventListener('click', convertSensitivity);
    if (resetBtn) resetBtn.addEventListener('click', resetForm);

    // Theme toggle functionality
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    function toggleTheme() {
        const body = document.body;
        const currentTheme = body.getAttribute('data-theme') || 'dark';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);

        // Update button text/icon if needed
        const icon = themeToggle.querySelector('i');
        if (icon) {
            icon.className = newTheme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
        }
    }

    // Mobile menu functionality
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', toggleMobileMenu);
    }

    function toggleMobileMenu() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    }

    // Initialize theme from localStorage
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.body.setAttribute('data-theme', savedTheme);

    // Update theme toggle icon based on saved theme
    if (themeToggle) {
        const icon = themeToggle.querySelector('i');
        if (icon) {
            icon.className = savedTheme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
        }
    }
});