        // Tool data for search functionality
        const tools = [
            { name: "DPI Analyzer", url: "{% url 'mouse_dpi_analyzer' %}", category: "analysis", keywords: ["mouse", "dpi", "sensitivity", "analyzer"] },
            { name: "Mouse Test", url: "{% url 'mouse_test' %}", category: "analysis", keywords: ["mouse", "test", "performance"] },
            { name: "Keyboard Test", url: "{% url 'keyboard_test' %}", category: "analysis", keywords: ["keyboard", "test", "response"] },
            { name: "Dinosaur Game", url: "{% url 'dinosaur_game' %}", category: "game", keywords: ["dinosaur", "game", "chrome", "fun"] },
            { name: "Sensitivity Converter", url: "{% url 'sensitivity_converter' %}", category: "analysis", keywords: ["sensitivity", "converter", "mouse", "dpi"] },
            { name: "Polling Rate Tester", url: "{% url 'polling_rate_tester' %}", category: "analysis", keywords: ["polling", "rate", "tester", "mouse"] },
            { name: "eDPI Calculator", url: "{% url 'edpi_calculator' %}", category: "analysis", keywords: ["edpi", "calculator", "mouse", "sensitivity"] },
            { name: "Jitter Click Test", url: "{% url 'jitter_click_test' %}", category: "click", keywords: ["jitter", "click", "test", "cps"] },
            { name: "CPS Test", url: "{% url 'cps_test' %}", category: "click", keywords: ["cps", "click", "test", "speed"] },
            { name: "1 Second CPS Test", url: "{% url '1_second_mouse_cps_test' %}", category: "click", keywords: ["1", "second", "cps", "click"] },
            { name: "2 Second CPS Test", url: "{% url '2_seconds_mouse_cps_test' %}", category: "click", keywords: ["2", "second", "cps", "click"] },
            { name: "5 Second CPS Test", url: "{% url '5_seconds_mouse_cps_test' %}", category: "click", keywords: ["5", "second", "cps", "click"] },
            { name: "10 Second CPS Test", url: "{% url '10_seconds_mouse_cps_test' %}", category: "click", keywords: ["10", "second", "cps", "click"] },
            { name: "15 Second CPS Test", url: "{% url '15_seconds_mouse_cps_test' %}", category: "click", keywords: ["15", "second", "cps", "click"] },
            { name: "20 Second CPS Test", url: "{% url '20_seconds_mouse_cps_test' %}", category: "click", keywords: ["20", "second", "cps", "click"] },
            { name: "30 Second CPS Test", url: "{% url '30_seconds_mouse_cps_test' %}", category: "click", keywords: ["30", "second", "cps", "click"] },
            { name: "60 Second CPS Test", url: "{% url '60_seconds_mouse_cps_test' %}", category: "click", keywords: ["60", "second", "cps", "click"] },
            { name: "100 Second CPS Test", url: "{% url '100_seconds_mouse_cps_test' %}", category: "click", keywords: ["100", "second", "cps", "click"] },
            { name: "Reaction Time Test", url: "{% url 'reaction_time_test' %}", category: "analysis", keywords: ["reaction", "time", "test", "speed"] },
            { name: "Butterfly Click Test", url: "{% url 'butterfly_click_test' %}", category: "click", keywords: ["butterfly", "click", "test", "cps"] },
            { name: "Spacebar Counter", url: "{% url 'spacebar_counter' %}", category: "spacebar", keywords: ["spacebar", "counter", "keyboard", "test"] },
            { name: "1 Second Spacebar Counter", url: "{% url '1_second_spacebar_counter' %}", category: "spacebar", keywords: ["1", "second", "spacebar", "counter"] },
            { name: "2 Second Spacebar Counter", url: "{% url '2_seconds_spacebar_counter' %}", category: "spacebar", keywords: ["2", "second", "spacebar", "counter"] },
            { name: "5 Second Spacebar Counter", url: "{% url '5_seconds_spacebar_counter' %}", category: "spacebar", keywords: ["5", "second", "spacebar", "counter"] },
            { name: "10 Second Spacebar Counter", url: "{% url '10_seconds_spacebar_counter' %}", category: "spacebar", keywords: ["10", "second", "spacebar", "counter"] },
            { name: "15 Second Spacebar Counter", url: "{% url '15_seconds_spacebar_counter' %}", category: "spacebar", keywords: ["15", "second", "spacebar", "counter"] },
            { name: "20 Second Spacebar Counter", url: "{% url '20_seconds_spacebar_counter' %}", category: "spacebar", keywords: ["20", "second", "spacebar", "counter"] },
            { name: "30 Second Spacebar Counter", url: "{% url '30_seconds_spacebar_counter' %}", category: "spacebar", keywords: ["30", "second", "spacebar", "counter"] },
            { name: "60 Second Spacebar Counter", url: "{% url '60_seconds_spacebar_counter' %}", category: "spacebar", keywords: ["60", "second", "spacebar", "counter"] },
            { name: "100 Second Spacebar Counter", url: "{% url '100_seconds_spacebar_counter' %}", category: "spacebar", keywords: ["100", "second", "spacebar", "counter"] }
        ];

        // DOM Elements
        const searchBox = document.querySelector('.search-box');
        const searchResults = document.querySelector('.search-results');
        const categoryTabs = document.querySelectorAll('.category-tab');
        const toolCards = document.querySelectorAll('.tool-card');

        // Search functionality
        searchBox.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase().trim();
            
            if (searchTerm.length === 0) {
                searchResults.style.display = 'none';
                return;
            }
            
            // Filter tools based on search term
            const filteredTools = tools.filter(tool => {
                return tool.name.toLowerCase().includes(searchTerm) || 
                       tool.keywords.some(keyword => keyword.includes(searchTerm));
            });
            
            // Display results
            if (filteredTools.length > 0) {
                searchResults.innerHTML = '';
                filteredTools.forEach(tool => {
                    const resultItem = document.createElement('div');
                    resultItem.className = 'search-result-item';
                    resultItem.textContent = tool.name;
                    resultItem.addEventListener('click', () => {
                        window.location.href = tool.url;
                    });
                    searchResults.appendChild(resultItem);
                });
                searchResults.style.display = 'block';
            } else {
                searchResults.innerHTML = '<div class="search-result-item">No tools found</div>';
                searchResults.style.display = 'block';
            }
        });

        // Close search results when clicking outside
        document.addEventListener('click', function(e) {
            if (!searchBox.contains(e.target) && !searchResults.contains(e.target)) {
                searchResults.style.display = 'none';
            }
        });

        // Category filtering functionality
        categoryTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                // Remove active class from all tabs
                categoryTabs.forEach(t => t.classList.remove('active'));
                
                // Add active class to clicked tab
                this.classList.add('active');
                
                const category = this.getAttribute('data-category');
                
                // Filter tools
                toolCards.forEach(card => {
                    if (category === 'all' || card.getAttribute('data-categories') === category) {
                        card.style.display = 'flex';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });

        // Animation on scroll
        function checkScroll() {
            const elements = document.querySelectorAll('.fade-in');
            
            elements.forEach(element => {
                const position = element.getBoundingClientRect();
                
                // If element is in viewport
                if(position.top < window.innerHeight - 50) {
                    element.style.opacity = 1;
                    element.style.transform = 'translateY(0)';
                }
            });
        }

        // Initial check and add scroll listener
        window.addEventListener('scroll', checkScroll);
        checkScroll();