// ThinkDrink App JavaScript
class ThinkDrinkApp {
    constructor() {
        this.drinks = [];
        this.filteredDrinks = [];
        this.recommendedDrinks = [];
        this.favorites = JSON.parse(localStorage.getItem('thinkdrink_favorites') || '[]');
        this.recent = JSON.parse(localStorage.getItem('thinkdrink_recent') || '[]');
        this.currentMood = null;
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
        this.setupEventListeners();
        this.generateRecommendations();
        this.renderRecommended();
        this.updateStats();
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
        const hasActiveMoods = Object.values(currentMoods).some(value => value > 5);
        
        if (!hasActiveMoods) {
            // If no mood is particularly high, show random drinks
            this.recommendedDrinks = [...this.drinks].sort(() => 0.5 - Math.random()).slice(0, 6);
            return;
        }
        
        // Calculate weighted scores for each drink based on mood sliders
        this.recommendedDrinks = this.drinks
            .map(drink => {
                if (!drink.moods) return { ...drink, weightedScore: 0 };
                
                let weightedScore = 0;
                Object.keys(currentMoods).forEach(mood => {
                    const userPreference = currentMoods[mood];
                    const drinkScore = drink.moods[mood] || 5;
                    
                    // Higher user preference + higher drink score = higher weighted score
                    // But also consider when user preference is low (they don't want that mood)
                    if (userPreference >= 7) {
                        // User wants this mood - higher drink score is better
                        weightedScore += drinkScore * (userPreference / 10);
                    } else if (userPreference <= 3) {
                        // User doesn't want this mood - lower drink score is better
                        weightedScore += (11 - drinkScore) * ((11 - userPreference) / 10);
                    } else {
                        // Neutral - moderate scoring
                        weightedScore += Math.abs(drinkScore - userPreference) * 0.3;
                    }
                });
                
                return { ...drink, weightedScore };
            })
            .sort((a, b) => b.weightedScore - a.weightedScore)
            .slice(0, 6);
    }
    
    renderRecommended() {
        const grid = document.getElementById('recommendedGrid');
        const currentMoods = this.getCurrentMoodValues();
        
        grid.innerHTML = this.recommendedDrinks.map(drink => {
            // Find the mood that best matches this drink
            let bestMood = 'Random';
            let bestScore = 0;
            
            if (drink.moods) {
                Object.keys(drink.moods).forEach(mood => {
                    const userPreference = currentMoods[mood] || 5;
                    const drinkScore = drink.moods[mood];
                    
                    // Calculate match score
                    const matchScore = drinkScore * (userPreference / 10);
                    if (matchScore > bestScore) {
                        bestScore = matchScore;
                        bestMood = mood;
                    }
                });
            }
            
            return `
                <div class="recommended-card" data-drink-id="${drink.id}">
                    <div class="card-header">
                        <h4>${drink.name}</h4>
                        <div class="mood-score">
                            <span class="score-label">${bestMood}</span>
                            <span class="score-value">${drink.moods ? drink.moods[bestMood] || Math.floor(Math.random() * 5) + 1 : Math.floor(Math.random() * 5) + 1}</span>
                        </div>
                    </div>
                    <p class="card-description">${drink.description}</p>
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
        const activeMoods = Object.entries(currentMoods)
            .filter(([mood, value]) => value > 5)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 2);
        
        let statusText = 'Showing personalized recommendations';
        if (activeMoods.length > 0) {
            const moodNames = activeMoods.map(([mood, value]) => `${mood} (${value})`);
            statusText = `Perfect for your ${moodNames.join(' & ')} mood`;
        } else {
            statusText = 'Discovering new drinks for you';
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
