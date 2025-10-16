// ThinkDrink App JavaScript
class ThinkDrinkApp {
    constructor() {
        this.drinks = [];
        this.bars = [];
        this.filteredDrinks = [];
        this.recommendedDrinks = [];
        this.favorites = JSON.parse(localStorage.getItem('thinkdrink_favorites') || '[]');
        this.recent = JSON.parse(localStorage.getItem('thinkdrink_recent') || '[]');
        this.currentMood = null;
        this.selectedBar = null;
        this.selectedDrink = null;
        this.currentFilters = {
            spirit: 'all',
            difficulty: 'all',
            search: '',
            searchField: 'all'
        };
        
        this.init();
    }
    
    async init() {
        await this.loadDrinks();
        await this.loadBars();
        this.setupEventListeners();
        this.generateRecommendations();
        this.renderRecommended();
        this.updateStats();
        this.populateBarSelector();
    }
    
    async loadDrinks() {
        try {
            const response = await fetch('data/drinks.json');
            if (!response.ok) {
                throw new Error('Failed to load drinks data');
            }
            this.drinks = await response.json();
            this.filteredDrinks = [...this.drinks];
        } catch (error) {
            console.error('Error loading drinks:', error);
            this.showToast('Failed to load drinks data');
            // Fallback to sample data
            this.drinks = this.getSampleDrinks();
            this.filteredDrinks = [...this.drinks];
        }
    }
    
    async loadBars() {
        try {
            const response = await fetch('data/bars.json');
            if (!response.ok) {
                throw new Error('Failed to load bars data');
            }
            this.bars = await response.json();
        } catch (error) {
            console.error('Error loading bars:', error);
            this.showToast('Failed to load bars data');
            this.bars = [];
        }
    }
    
    getSampleDrinks() {
        return [
            {
                id: 1,
                name: "Classic Margarita",
                spirit: "Tequila",
                difficulty: "Easy",
                description: "A refreshing blend of tequila, lime juice, and triple sec.",
                ingredients: ["Tequila", "Lime Juice", "Triple Sec", "Salt"],
                flavor: "Citrus, Sweet",
                instructions: "Rim glass with salt. Shake ingredients with ice. Strain into glass.",
                glass: "Margarita Glass",
                garnish: "Lime Wheel"
            },
            {
                id: 2,
                name: "Old Fashioned",
                spirit: "Whiskey",
                difficulty: "Medium",
                description: "A timeless whiskey cocktail with sugar, bitters, and orange peel.",
                ingredients: ["Whiskey", "Sugar", "Angostura Bitters", "Orange Peel"],
                flavor: "Bold, Bitter",
                instructions: "Muddle sugar and bitters. Add whiskey and ice. Stir. Garnish with orange peel.",
                glass: "Rocks Glass",
                garnish: "Orange Peel"
            },
            {
                id: 3,
                name: "Mojito",
                spirit: "Rum",
                difficulty: "Easy",
                description: "A Cuban highball with rum, mint, lime, and soda water.",
                ingredients: ["White Rum", "Mint Leaves", "Lime Juice", "Simple Syrup", "Soda Water"],
                flavor: "Minty, Refreshing",
                instructions: "Muddle mint and lime. Add rum and syrup. Top with soda water.",
                glass: "Highball Glass",
                garnish: "Mint Sprig"
            }
        ];
    }
    
    setupEventListeners() {
        // Mood sliders
        document.querySelectorAll('.mood-slider').forEach(slider => {
            slider.addEventListener('input', (e) => {
                this.updateMoodSlider(slider);
            });
        });
        
        // Mood action buttons
        document.getElementById('resetMoodsBtn').addEventListener('click', () => {
            this.resetMoods();
        });
        
        document.getElementById('randomMoodsBtn').addEventListener('click', () => {
            this.randomMoods();
        });
        
        // Quick action buttons
        document.getElementById('surpriseBtn').addEventListener('click', () => {
            this.surpriseMe();
        });
        
        document.getElementById('ingredientsBtn').addEventListener('click', () => {
            this.showIngredientFilter();
        });
        
        document.getElementById('favoritesBtn').addEventListener('click', () => {
            this.showFavorites();
        });
        
        // Modal functionality
        document.getElementById('modalClose').addEventListener('click', () => {
            this.closeModal();
        });
        
        document.getElementById('drinkModal').addEventListener('click', (e) => {
            if (e.target.id === 'drinkModal') {
                this.closeModal();
            }
        });
        
        // Profile button
        document.getElementById('profileBtn').addEventListener('click', () => {
            this.showProfile();
        });
        
        // Toast integration event listeners
        document.getElementById('barSelect').addEventListener('change', (e) => {
            this.selectBar(e.target.value);
        });
        
        document.getElementById('placeOrderBtn').addEventListener('click', () => {
            this.placeToastOrder();
        });
        
        document.getElementById('demoOrderBtn').addEventListener('click', () => {
            this.demoToastOrder();
        });
    }
    
    updateMoodSlider(slider) {
        const mood = slider.dataset.mood;
        const value = parseInt(slider.value);
        
        // Update the display value
        const valueDisplay = document.getElementById(`${mood}Value`);
        if (valueDisplay) {
            valueDisplay.textContent = value;
        }
        
        // Generate recommendations based on current mood settings
        this.generateRecommendations();
        this.renderRecommended();
        this.updateStats();
    }
    
    resetMoods() {
        console.log('Resetting all mood sliders to 5...');
        const sliders = document.querySelectorAll('.mood-slider');
        console.log(`Found ${sliders.length} mood sliders to reset`);
        
        sliders.forEach((slider, index) => {
            console.log(`Resetting slider ${index + 1} (${slider.dataset.mood}) to 5`);
            slider.value = 5;
            this.updateMoodSlider(slider);
        });
        
        console.log('All sliders reset to 5');
    }
    
    randomMoods() {
        console.log('Randomizing all mood sliders...');
        const sliders = document.querySelectorAll('.mood-slider');
        console.log(`Found ${sliders.length} mood sliders`);
        
        sliders.forEach((slider, index) => {
            const randomValue = Math.floor(Math.random() * 10) + 1;
            console.log(`Slider ${index + 1} (${slider.dataset.mood}): setting to ${randomValue}`);
            slider.value = randomValue;
            this.updateMoodSlider(slider);
        });
        
        console.log('All sliders randomized');
    }
    
    getCurrentMoodValues() {
        const moods = {};
        document.querySelectorAll('.mood-slider').forEach(slider => {
            moods[slider.dataset.mood] = parseInt(slider.value);
        });
        return moods;
    }
    
    generateRecommendations() {
        const currentMoods = this.getCurrentMoodValues();
        console.log('Current mood values:', currentMoods);
        
        // Calculate total mood intensity (like rolling 6 dice)
        const totalMoodIntensity = Object.values(currentMoods).reduce((sum, value) => sum + value, 0);
        const averageMood = totalMoodIntensity / 6;
        
        console.log(`Total mood intensity: ${totalMoodIntensity}/60, Average: ${averageMood.toFixed(1)}`);
        
        // Find the dominant mood(s) - highest values
        const sortedMoods = Object.entries(currentMoods)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3); // Top 3 moods
        
        console.log('Top 3 moods:', sortedMoods);
        
        // Calculate sophisticated matching scores for each drink
        this.recommendedDrinks = this.drinks
            .map(drink => {
                if (!drink.moods) {
                    // If drink has no mood data, give it a random low score
                    return { ...drink, weightedScore: Math.random() * 10, matchReason: 'No mood data' };
                }
                
                let totalScore = 0;
                let matchFactors = [];
                
                // 1. DOMINANT MOOD MATCHING (40% of score)
                // Check if drink matches the user's strongest mood preferences
                const dominantMood = sortedMoods[0];
                if (dominantMood) {
                    const [moodName, userValue] = dominantMood;
                    const drinkValue = drink.moods[moodName] || 5;
                    
                    if (userValue >= 7) {
                        // User wants this mood strongly - reward drinks that match
                        const dominantScore = drinkValue * (userValue / 10) * 0.4;
                        totalScore += dominantScore;
                        matchFactors.push(`${moodName}: ${drinkValue}/10 (user wants ${userValue})`);
                    }
                }
                
                // 2. MOOD PROFILE SIMILARITY (30% of score)
                // Compare overall mood profile similarity
                let profileSimilarity = 0;
                let moodCount = 0;
                
                Object.keys(currentMoods).forEach(mood => {
                    const userValue = currentMoods[mood];
                    const drinkValue = drink.moods[mood] || 5;
                    
                    if (userValue >= 6) {
                        // User wants this mood - reward similarity
                        const similarity = Math.max(0, 10 - Math.abs(userValue - drinkValue));
                        profileSimilarity += similarity;
                        moodCount++;
                    } else if (userValue <= 4) {
                        // User doesn't want this mood - reward opposite
                        const opposite = Math.max(0, 10 - Math.abs((10 - userValue) - drinkValue));
                        profileSimilarity += opposite;
                        moodCount++;
                    }
                });
                
                if (moodCount > 0) {
                    totalScore += (profileSimilarity / moodCount) * 0.3;
                }
                
                // 3. MOOD INTENSITY MATCHING (20% of score)
                // Match the overall intensity level
                const drinkIntensity = Object.values(drink.moods).reduce((sum, val) => sum + val, 0) / 6;
                const intensityMatch = Math.max(0, 10 - Math.abs(averageMood - drinkIntensity));
                totalScore += intensityMatch * 0.2;
                
                // 4. MOOD COMBINATION BONUS (10% of score)
                // Bonus for drinks that match multiple user preferences
                let combinationBonus = 0;
                let matchingMoods = 0;
                
                Object.keys(currentMoods).forEach(mood => {
                    const userValue = currentMoods[mood];
                    const drinkValue = drink.moods[mood] || 5;
                    
                    if (userValue >= 6 && drinkValue >= 6) {
                        matchingMoods++;
                    } else if (userValue <= 4 && drinkValue <= 4) {
                        matchingMoods++;
                    }
                });
                
                combinationBonus = (matchingMoods / 6) * 10;
                totalScore += combinationBonus * 0.1;
                
                // Determine match reason for display
                let matchReason = '';
                if (dominantMood && drink.moods[dominantMood[0]] >= 7) {
                    matchReason = `Perfect for ${dominantMood[0]} mood`;
                } else if (matchingMoods >= 3) {
                    matchReason = `Matches ${matchingMoods} mood preferences`;
                } else if (intensityMatch >= 8) {
                    matchReason = `Matches your intensity level`;
                } else {
                    matchReason = `Good overall match`;
                }
                
                return { 
                    ...drink, 
                    weightedScore: totalScore,
                    matchReason,
                    dominantMood: dominantMood ? dominantMood[0] : null,
                    intensityMatch: intensityMatch.toFixed(1),
                    matchingMoods
                };
            })
            .filter(drink => drink.weightedScore > 0) // Only drinks with some match
            .sort((a, b) => b.weightedScore - a.weightedScore)
            .slice(0, 6);
            
        console.log('Top recommended drinks:', this.recommendedDrinks.map(d => ({
            name: d.name,
            score: d.weightedScore.toFixed(2),
            reason: d.matchReason,
            dominantMood: d.dominantMood
        })));
    }
    
    renderRecommended() {
        const grid = document.getElementById('recommendedGrid');
        const currentMoods = this.getCurrentMoodValues();
        
        grid.innerHTML = this.recommendedDrinks.map(drink => {
            // Show the sophisticated match information
            const matchScore = Math.round(drink.weightedScore * 10) / 10;
            const dominantMood = drink.dominantMood || 'Balanced';
            const matchReason = drink.matchReason || 'Good match';
            
            return `
                <div class="recommended-card" data-drink-id="${drink.id}">
                    <div class="card-header">
                        <h4>${drink.name}</h4>
                        <div class="mood-score">
                            <span class="score-label">${dominantMood}</span>
                            <span class="score-value">${matchScore.toFixed(1)}</span>
                        </div>
                    </div>
                    <p class="card-description">${drink.description}</p>
                    <div class="match-reason">
                        <span class="match-badge">${matchReason}</span>
                        ${drink.matchingMoods > 0 ? `<span class="mood-count">${drink.matchingMoods} moods match</span>` : ''}
                    </div>
                    <div class="card-ingredients">
                        ${drink.ingredients.slice(0, 2).map(ingredient => 
                            `<span class="ingredient">${ingredient}</span>`
                        ).join('')}
                    </div>
                    <div class="card-actions">
                        <button class="quick-btn favorite-btn ${this.favorites.includes(drink.id) ? 'active' : ''}" 
                                data-drink-id="${drink.id}">
                            ${this.favorites.includes(drink.id) ? '❤️' : '🤍'}
                        </button>
                        <button class="quick-btn details-btn" data-drink-id="${drink.id}">
                            📖
                        </button>
                        <button class="quick-btn availability-btn" data-drink-id="${drink.id}">
                            🍸
                        </button>
                    </div>
                </div>
            `;
        }).join('');
        
        // Add event listeners to new cards
        this.attachRecommendedEventListeners();
    }
    
    attachRecommendedEventListeners() {
        // Card clicks
        document.querySelectorAll('.recommended-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.classList.contains('quick-btn')) {
                    const drinkId = parseInt(card.dataset.drinkId);
                    const drink = this.drinks.find(d => d.id === drinkId);
                    if (drink) {
                        this.showDrinkDetail(drink);
                        this.addToRecent(drinkId);
                    }
                }
            });
        });
        
        // Favorite buttons
        document.querySelectorAll('.recommended-card .favorite-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const drinkId = parseInt(btn.dataset.drinkId);
                this.toggleFavorite(drinkId);
            });
        });
        
        // Details buttons
        document.querySelectorAll('.recommended-card .details-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const drinkId = parseInt(btn.dataset.drinkId);
                const drink = this.drinks.find(d => d.id === drinkId);
                if (drink) {
                    this.showDrinkDetail(drink);
                    this.addToRecent(drinkId);
                }
            });
        });
        
        // Availability buttons
        document.querySelectorAll('.recommended-card .availability-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const drinkId = parseInt(btn.dataset.drinkId);
                const drink = this.drinks.find(d => d.id === drinkId);
                if (drink) {
                    this.checkDrinkAvailability(drink);
                }
            });
        });
    }
    
    showFavorites() {
        this.filteredDrinks = this.drinks.filter(drink => 
            this.favorites.includes(drink.id)
        );
        this.renderDrinks();
        this.updateStats();
    }
    
    showRecent() {
        this.filteredDrinks = this.drinks.filter(drink => 
            this.recent.includes(drink.id)
        );
        this.renderDrinks();
        this.updateStats();
    }
    
    surpriseMe() {
        const availableDrinks = this.drinks.filter(drink => 
            !this.favorites.includes(drink.id)
        );
        if (availableDrinks.length === 0) {
            this.showToast('No new drinks to discover!');
            return;
        }
        
        const randomDrink = availableDrinks[Math.floor(Math.random() * availableDrinks.length)];
        this.showDrinkDetail(randomDrink);
        this.addToRecent(randomDrink.id);
    }
    
    populateFilters() {
        // Populate spirit filters
        const spirits = [...new Set(this.drinks.map(drink => drink.spirit))].sort();
        const spiritContainer = document.getElementById('spiritFilters');
        
        spirits.forEach(spirit => {
            const li = document.createElement('li');
            li.innerHTML = `<a href="#" class="filter-link" data-spirit="${spirit}">${spirit}</a>`;
            spiritContainer.appendChild(li);
        });
        
        // Populate difficulty filters
        const difficulties = [...new Set(this.drinks.map(drink => drink.difficulty))].sort();
        const difficultyContainer = document.getElementById('difficultyFilters');
        
        difficulties.forEach(difficulty => {
            const li = document.createElement('li');
            li.innerHTML = `<a href="#" class="filter-link" data-difficulty="${difficulty}">${difficulty}</a>`;
            difficultyContainer.appendChild(li);
        });
        
        // Re-attach event listeners for new filter links
        document.querySelectorAll('.filter-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                if (link.dataset.spirit) {
                    this.currentFilters.spirit = link.dataset.spirit;
                    this.updateActiveFilter('spirit', link);
                }
                if (link.dataset.difficulty) {
                    this.currentFilters.difficulty = link.dataset.difficulty;
                    this.updateActiveFilter('difficulty', link);
                }
                this.filterAndRender();
            });
        });
    }
    
    filterAndRender() {
        this.filteredDrinks = this.drinks.filter(drink => {
            // Spirit filter
            if (this.currentFilters.spirit !== 'all' && drink.spirit !== this.currentFilters.spirit) {
                return false;
            }
            
            // Difficulty filter
            if (this.currentFilters.difficulty !== 'all' && drink.difficulty !== this.currentFilters.difficulty) {
                return false;
            }
            
            // Search filter
            if (this.currentFilters.search) {
                const searchTerm = this.currentFilters.search.toLowerCase();
                const searchField = this.currentFilters.searchField;
                
                if (searchField === 'all') {
                    const searchableText = [
                        drink.name,
                        drink.spirit,
                        drink.description,
                        drink.flavor,
                        ...drink.ingredients
                    ].join(' ').toLowerCase();
                    
                    if (!searchableText.includes(searchTerm)) {
                        return false;
                    }
                } else {
                    const fieldValue = drink[searchField] || '';
                    if (!fieldValue.toLowerCase().includes(searchTerm)) {
                        return false;
                    }
                }
            }
            
            return true;
        });
        
        this.renderDrinks();
        this.updateStats();
    }
    
    renderDrinks() {
        const grid = document.getElementById('drinkGrid');
        const loading = document.getElementById('loading');
        const noResults = document.getElementById('noResults');
        
        loading.style.display = 'none';
        
        if (this.filteredDrinks.length === 0) {
            grid.innerHTML = '';
            noResults.style.display = 'block';
            return;
        }
        
        noResults.style.display = 'none';
        
        grid.innerHTML = this.filteredDrinks.map(drink => `
            <div class="drink-card" data-drink-id="${drink.id}">
                <div class="drink-header">
                    <div>
                        <h3 class="drink-name">${drink.name}</h3>
                        <div class="drink-spirit">${drink.spirit}</div>
                    </div>
                    <div class="drink-difficulty difficulty-${drink.difficulty.toLowerCase()}">
                        ${drink.difficulty}
                    </div>
                </div>
                
                <p class="drink-description">${drink.description}</p>
                
                <div class="drink-ingredients">
                    ${drink.ingredients.slice(0, 3).map(ingredient => 
                        `<span class="ingredient-tag">${ingredient}</span>`
                    ).join('')}
                    ${drink.ingredients.length > 3 ? `<span class="ingredient-tag">+${drink.ingredients.length - 3} more</span>` : ''}
                </div>
                
                <div class="drink-actions">
                    <button class="action-btn favorite-btn ${this.favorites.includes(drink.id) ? 'active' : ''}" 
                            data-drink-id="${drink.id}">
                        ${this.favorites.includes(drink.id) ? '❤️' : '🤍'} Favorite
                    </button>
                    <button class="action-btn details-btn" data-drink-id="${drink.id}">
                        📖 Details
                    </button>
                </div>
            </div>
        `).join('');
        
        // Add event listeners to new cards
        this.attachCardEventListeners();
    }
    
    attachCardEventListeners() {
        // Favorite buttons
        document.querySelectorAll('.favorite-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const drinkId = parseInt(btn.dataset.drinkId);
                this.toggleFavorite(drinkId);
            });
        });
        
        // Details buttons
        document.querySelectorAll('.details-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const drinkId = parseInt(btn.dataset.drinkId);
                const drink = this.drinks.find(d => d.id === drinkId);
                if (drink) {
                    this.showDrinkDetail(drink);
                    this.addToRecent(drinkId);
                }
            });
        });
        
        // Card clicks
        document.querySelectorAll('.drink-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.classList.contains('action-btn')) {
                    const drinkId = parseInt(card.dataset.drinkId);
                    const drink = this.drinks.find(d => d.id === drinkId);
                    if (drink) {
                        this.showDrinkDetail(drink);
                        this.addToRecent(drinkId);
                    }
                }
            });
        });
    }
    
    toggleFavorite(drinkId) {
        const index = this.favorites.indexOf(drinkId);
        if (index > -1) {
            this.favorites.splice(index, 1);
        } else {
            this.favorites.push(drinkId);
        }
        
        localStorage.setItem('thinkdrink_favorites', JSON.stringify(this.favorites));
        this.renderDrinks();
        this.showToast(this.favorites.includes(drinkId) ? 'Added to favorites!' : 'Removed from favorites!');
    }
    
    addToRecent(drinkId) {
        if (!this.recent.includes(drinkId)) {
            this.recent.unshift(drinkId);
            if (this.recent.length > 10) {
                this.recent.pop();
            }
            localStorage.setItem('thinkdrink_recent', JSON.stringify(this.recent));
        }
    }
    
    showDrinkDetail(drink) {
        const modal = document.getElementById('drinkModal');
        const modalBody = document.getElementById('modalBody');
        
        modalBody.innerHTML = `
            <div class="drink-detail">
                <div class="drink-detail-header">
                    <h2>${drink.name}</h2>
                    <div class="drink-detail-meta">
                        <span class="drink-spirit">${drink.spirit}</span>
                        <span class="drink-difficulty difficulty-${drink.difficulty.toLowerCase()}">
                            ${drink.difficulty}
                        </span>
                    </div>
                </div>
                
                <div class="drink-detail-content">
                    <div class="drink-detail-section">
                        <h3>Description</h3>
                        <p>${drink.description}</p>
                    </div>
                    
                    <div class="drink-detail-section">
                        <h3>Ingredients</h3>
                        <div class="ingredients-list">
                            ${drink.ingredients.map(ingredient => 
                                `<span class="ingredient-item">${ingredient}</span>`
                            ).join('')}
                        </div>
                    </div>
                    
                    <div class="drink-detail-section">
                        <h3>Instructions</h3>
                        <p>${drink.instructions}</p>
                    </div>
                    
                    <div class="drink-detail-section">
                        <h3>Glass & Garnish</h3>
                        <p><strong>Glass:</strong> ${drink.glass}</p>
                        <p><strong>Garnish:</strong> ${drink.garnish}</p>
                    </div>
                    
                    <div class="drink-detail-section">
                        <h3>Flavor Profile</h3>
                        <p>${drink.flavor}</p>
                    </div>
                </div>
                
                <div class="drink-detail-actions">
                    <button class="action-btn favorite-btn ${this.favorites.includes(drink.id) ? 'active' : ''}" 
                            data-drink-id="${drink.id}">
                        ${this.favorites.includes(drink.id) ? '❤️ Remove from Favorites' : '🤍 Add to Favorites'}
                    </button>
                </div>
            </div>
        `;
        
        // Add event listener to modal favorite button
        modalBody.querySelector('.favorite-btn').addEventListener('click', () => {
            this.toggleFavorite(drink.id);
            this.closeModal();
        });
        
        modal.classList.add('open');
    }
    
    closeModal() {
        document.getElementById('drinkModal').classList.remove('open');
    }
    
    updateActiveNav(activeLink) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        activeLink.classList.add('active');
    }
    
    updateActiveFilter(type, activeLink) {
        const container = type === 'spirit' ? 'spiritFilters' : 'difficultyFilters';
        document.querySelectorAll(`#${container} .filter-link`).forEach(link => {
            link.classList.remove('active');
        });
        activeLink.classList.add('active');
    }
    
    updateStats() {
        const drinkCount = document.getElementById('drinkCount');
        const filterStatus = document.getElementById('filterStatus');
        
        drinkCount.textContent = `${this.recommendedDrinks.length} recommendation${this.recommendedDrinks.length !== 1 ? 's' : ''}`;
        
        const currentMoods = this.getCurrentMoodValues();
        const totalIntensity = Object.values(currentMoods).reduce((sum, val) => sum + val, 0);
        const averageMood = totalIntensity / 6;
        
        // Find dominant moods
        const sortedMoods = Object.entries(currentMoods)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 2);
        
        let statusText = '';
        if (sortedMoods.length > 0 && sortedMoods[0][1] >= 7) {
            const dominantMood = sortedMoods[0][0];
            const intensity = sortedMoods[0][1];
            statusText = `🎯 Dominant: ${dominantMood} (${intensity}/10) - ${averageMood.toFixed(1)} avg intensity`;
        } else if (averageMood > 6) {
            statusText = `⚡ High energy mood (${averageMood.toFixed(1)}/10 avg) - Perfect for party drinks!`;
        } else if (averageMood < 4) {
            statusText = `😌 Relaxed mood (${averageMood.toFixed(1)}/10 avg) - Great for chill drinks`;
        } else {
            statusText = `🎲 Balanced mood (${averageMood.toFixed(1)}/10 avg) - Mix of recommendations`;
        }
        
        filterStatus.textContent = statusText;
    }
    
    showToast(message) {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toastMessage');
        
        toastMessage.textContent = message;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
    
    populateBarSelector() {
        const barSelect = document.getElementById('barSelect');
        if (!barSelect) return;
        
        barSelect.innerHTML = '<option value="">Select a bar...</option>';
        
        this.bars.forEach(bar => {
            const option = document.createElement('option');
            option.value = bar.id;
            option.textContent = `${bar.name} - ${bar.type}`;
            barSelect.appendChild(option);
        });
        
        console.log(`Populated bar selector with ${this.bars.length} bars`);
    }
    
    selectBar(barId) {
        if (!barId) {
            document.getElementById('selectedBarInfo').style.display = 'none';
            document.getElementById('toastOrderDemo').style.display = 'none';
            this.selectedBar = null;
            return;
        }
        
        this.selectedBar = this.bars.find(bar => bar.id === barId);
        if (!this.selectedBar) return;
        
        // Update bar info display
        document.getElementById('barName').textContent = this.selectedBar.name;
        document.getElementById('barType').textContent = this.selectedBar.type;
        document.getElementById('barAddress').textContent = this.selectedBar.address;
        document.getElementById('barHours').textContent = `Hours: ${this.selectedBar.hours}`;
        document.getElementById('barSpecialty').textContent = `Specialty: ${this.selectedBar.specialty}`;
        
        // Calculate mood match score
        const currentMoods = this.getCurrentMoodValues();
        const barMoods = this.selectedBar.mood_profile;
        let matchScore = 0;
        let totalPossible = 0;
        
        Object.keys(currentMoods).forEach(mood => {
            const userPref = currentMoods[mood];
            const barScore = barMoods[mood];
            matchScore += Math.min(userPref, barScore);
            totalPossible += 10;
        });
        
        const matchPercentage = Math.round((matchScore / totalPossible) * 100);
        document.getElementById('moodMatchScore').textContent = `${matchPercentage}% mood match`;
        
        document.getElementById('selectedBarInfo').style.display = 'block';
        
        // Show order demo if we have a recommended drink
        if (this.recommendedDrinks.length > 0) {
            this.selectedDrink = this.recommendedDrinks[0];
            this.showOrderDemo();
        }
    }
    
    showOrderDemo() {
        if (!this.selectedBar || !this.selectedDrink) return;
        
        // Update order details
        document.getElementById('orderDrinkName').textContent = this.selectedDrink.name;
        
        // Generate realistic price based on drink complexity and bar type
        let basePrice = 8;
        if (this.selectedDrink.difficulty === 'Hard') basePrice += 3;
        if (this.selectedDrink.difficulty === 'Medium') basePrice += 1;
        
        // Adjust for bar type
        if (this.selectedBar.type.includes('Upscale') || this.selectedBar.type.includes('Craft')) basePrice += 2;
        if (this.selectedBar.type.includes('Sports') || this.selectedBar.type.includes('Pub')) basePrice -= 1;
        
        const price = `$${basePrice}.00`;
        document.getElementById('orderDrinkPrice').textContent = price;
        document.getElementById('orderTotal').textContent = price;
        
        document.getElementById('toastOrderDemo').style.display = 'block';
    }
    
    placeToastOrder() {
        if (!this.selectedBar || !this.selectedDrink) {
            this.showToast('Please select a bar and drink first');
            return;
        }
        
        // Simulate Toast API call
        this.showToast('Connecting to Toast POS...');
        
        setTimeout(() => {
            this.showToast('Order sent to bar successfully! 🍸');
            console.log('Toast Order:', {
                merchant_id: this.selectedBar.toast_merchant_id,
                bar_name: this.selectedBar.name,
                drink: this.selectedDrink.name,
                price: document.getElementById('orderDrinkPrice').textContent,
                timestamp: new Date().toISOString()
            });
        }, 1500);
    }
    
    checkDrinkAvailability(drink) {
        this.selectedDrink = drink;
        this.showToast(`Checking availability for ${drink.name} at Tampa bars...`);
        
        // Simulate checking availability
        setTimeout(() => {
            this.showAvailableBars(drink);
        }, 1000);
    }
    
    showAvailableBars(drink) {
        // Filter bars that can make this drink based on ingredients
        const availableBars = this.bars.filter(bar => {
            // Simple check - if bar has signature drinks or can make complex cocktails
            return bar.signature_drinks.length > 0 || 
                   bar.type.includes('Craft') || 
                   bar.type.includes('Cocktail') ||
                   bar.type.includes('Upscale');
        });
        
        if (availableBars.length === 0) {
            this.showToast('No bars currently available for this drink');
            return;
        }
        
        // Update bar selector with available bars
        const barSelect = document.getElementById('barSelect');
        barSelect.innerHTML = '<option value="">Select a bar...</option>';
        
        availableBars.forEach(bar => {
            const option = document.createElement('option');
            option.value = bar.id;
            option.textContent = `${bar.name} - ${bar.type}`;
            barSelect.appendChild(option);
        });
        
        // Show the Toast integration section
        const toastSection = document.querySelector('.toast-integration-section');
        toastSection.scrollIntoView({ behavior: 'smooth' });
        
        this.showToast(`Found ${availableBars.length} bars that can make ${drink.name}! Select a bar below.`);
    }
    
    demoToastOrder() {
        if (!this.selectedBar || !this.selectedDrink) {
            this.showToast('Please select a bar and drink first');
            return;
        }
        
        this.showToast('🎬 Demo Mode: Order would be sent to Toast POS');
        
        // Show demo order details
        const orderDetails = {
            merchant_id: this.selectedBar.toast_merchant_id,
            bar_name: this.selectedBar.name,
            bar_address: this.selectedBar.address,
            drink_name: this.selectedDrink.name,
            drink_ingredients: this.selectedDrink.ingredients,
            drink_instructions: this.selectedDrink.instructions,
            price: document.getElementById('orderDrinkPrice').textContent,
            customer_mood: this.getCurrentMoodValues(),
            timestamp: new Date().toISOString()
        };
        
        console.log('Demo Toast Order:', orderDetails);
        
        // Show success message
        setTimeout(() => {
            this.showToast(`Demo order sent to ${this.selectedBar.name}! 🎉`);
        }, 1000);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ThinkDrinkApp();
});

// Service Worker registration for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
