/**
 * Clean Mood System for ThinkDrink
 * Personal, focused mood interactions without social clutter
 */

class CleanMoodSystem {
    constructor() {
        this.moodStates = {
            energetic: { value: 5, influence: 1.0, color: '#FF6B6B' },
            relaxed: { value: 5, influence: 1.0, color: '#4ECDC4' },
            romantic: { value: 5, influence: 1.0, color: '#FFA07A' },
            adventurous: { value: 5, influence: 1.0, color: '#45B7D1' },
            celebratory: { value: 5, influence: 1.0, color: '#98D8C8' },
            cozy: { value: 5, influence: 1.0, color: '#F7DC6F' }
        };
        
        this.moodInteractions = {
            energetic: {
                relaxed: -0.4,     // High energy decreases relaxed
                romantic: -0.3,     // High energy decreases romance
                adventurous: 0.7,   // High energy increases adventure
                celebratory: 0.6,   // High energy increases celebration
                cozy: -0.5          // High energy decreases cozy
            },
            relaxed: {
                energetic: -0.3,    // Relaxed decreases energy
                romantic: 0.4,     // Relaxed increases romance
                adventurous: -0.2,  // Relaxed decreases adventure
                celebratory: 0.2,  // Relaxed slightly increases celebration
                cozy: 0.8          // Relaxed increases cozy
            },
            romantic: {
                energetic: -0.4,   // Romance decreases energy
                relaxed: 0.3,      // Romance increases relaxed
                adventurous: -0.3, // Romance decreases adventure
                celebratory: 0.3,  // Romance increases celebration
                cozy: 0.7          // Romance increases cozy
            },
            adventurous: {
                energetic: 0.6,     // Adventure increases energy
                relaxed: -0.4,     // Adventure decreases relaxed
                romantic: -0.2,    // Adventure decreases romance
                celebratory: 0.5,  // Adventure increases celebration
                cozy: -0.6         // Adventure decreases cozy
            },
            celebratory: {
                energetic: 0.8,    // Celebration increases energy
                relaxed: -0.3,     // Celebration decreases relaxed
                romantic: 0.2,     // Celebration slightly increases romance
                adventurous: 0.4,  // Celebration increases adventure
                cozy: -0.4         // Celebration decreases cozy
            },
            cozy: {
                energetic: -0.5,   // Cozy decreases energy
                relaxed: 0.7,      // Cozy increases relaxed
                romantic: 0.6,     // Cozy increases romance
                adventurous: -0.7, // Cozy decreases adventure
                celebratory: -0.3  // Cozy decreases celebration
            }
        };
        
        this.init();
    }
    
    init() {
        this.createCleanMoodInterface();
    }
    
    createCleanMoodInterface() {
        const moodContainer = document.querySelector('.mood-selector');
        if (!moodContainer) return;
        
        // Clean, focused mood interface
        moodContainer.innerHTML = `
            <div class="mood-header">
                <h2>How are you feeling?</h2>
                <p class="mood-subtitle">Adjust your mood - your choices will influence each other</p>
            </div>
            
            <div class="mood-grid">
                <div class="mood-item" data-mood="energetic">
                    <div class="mood-icon">⚡</div>
                    <div class="mood-label">Energetic</div>
                    <div class="mood-slider-container">
                        <input type="range" class="mood-slider" min="1" max="10" value="5" data-mood="energetic">
                        <div class="mood-value">5</div>
                    </div>
                </div>
                
                <div class="mood-item" data-mood="relaxed">
                    <div class="mood-icon">😌</div>
                    <div class="mood-label">Relaxed</div>
                    <div class="mood-slider-container">
                        <input type="range" class="mood-slider" min="1" max="10" value="5" data-mood="relaxed">
                        <div class="mood-value">5</div>
                    </div>
                </div>
                
                <div class="mood-item" data-mood="romantic">
                    <div class="mood-icon">💕</div>
                    <div class="mood-label">Romantic</div>
                    <div class="mood-slider-container">
                        <input type="range" class="mood-slider" min="1" max="10" value="5" data-mood="romantic">
                        <div class="mood-value">5</div>
                    </div>
                </div>
                
                <div class="mood-item" data-mood="adventurous">
                    <div class="mood-icon">🌍</div>
                    <div class="mood-label">Adventurous</div>
                    <div class="mood-slider-container">
                        <input type="range" class="mood-slider" min="1" max="10" value="5" data-mood="adventurous">
                        <div class="mood-value">5</div>
                    </div>
                </div>
                
                <div class="mood-item" data-mood="celebratory">
                    <div class="mood-icon">🎉</div>
                    <div class="mood-label">Celebratory</div>
                    <div class="mood-slider-container">
                        <input type="range" class="mood-slider" min="1" max="10" value="5" data-mood="celebratory">
                        <div class="mood-value">5</div>
                    </div>
                </div>
                
                <div class="mood-item" data-mood="cozy">
                    <div class="mood-icon">🔥</div>
                    <div class="mood-label">Cozy</div>
                    <div class="mood-slider-container">
                        <input type="range" class="mood-slider" min="1" max="10" value="5" data-mood="cozy">
                        <div class="mood-value">5</div>
                    </div>
                </div>
            </div>
            
            <div class="mood-actions">
                <button class="action-btn reset-moods" id="resetMoodsBtn">
                    <span class="btn-icon">🔄</span>
                    <span class="btn-text">Reset</span>
                </button>
                <button class="action-btn random-moods" id="randomMoodsBtn">
                    <span class="btn-icon">🎲</span>
                    <span class="btn-text">Random</span>
                </button>
            </div>
        `;
        
        this.setupMoodSliders();
    }
    
    setupMoodSliders() {
        const sliders = document.querySelectorAll('.mood-slider');
        
        sliders.forEach(slider => {
            const mood = slider.dataset.mood;
            
            slider.addEventListener('input', (e) => {
                const value = parseInt(e.target.value);
                this.adjustMood(mood, value);
            });
            
            // Update visual state
            this.updateMoodVisual(slider, mood, this.moodStates[mood]);
        });
        
        // Setup action buttons
        document.getElementById('resetMoodsBtn')?.addEventListener('click', () => {
            this.resetMoods();
        });
        
        document.getElementById('randomMoodsBtn')?.addEventListener('click', () => {
            this.randomMoods();
        });
    }
    
    adjustMood(mood, newValue) {
        const oldValue = this.moodStates[mood].value;
        
        if (newValue === oldValue) return;
        
        this.moodStates[mood].value = newValue;
        
        // Calculate influence on other moods
        this.calculateMoodInfluences(mood, newValue, oldValue);
        
        // Update visuals
        this.updateAllMoods();
        
        // Update recommendations
        this.updateRecommendations();
    }
    
    calculateMoodInfluences(changedMood, newValue, oldValue) {
        const change = newValue - oldValue;
        const influenceStrength = Math.abs(change) / 10;
        
        Object.keys(this.moodStates).forEach(mood => {
            if (mood === changedMood) return;
            
            const interaction = this.moodInteractions[changedMood][mood];
            if (interaction) {
                const influence = change * interaction * influenceStrength;
                const newInfluencedValue = Math.max(1, Math.min(10, 
                    this.moodStates[mood].value + influence
                ));
                
                this.moodStates[mood].value = Math.round(newInfluencedValue);
                this.moodStates[mood].influence = 1 + (influence * 0.1);
            }
        });
    }
    
    updateAllMoods() {
        document.querySelectorAll('.mood-slider').forEach(slider => {
            const mood = slider.dataset.mood;
            const state = this.moodStates[mood];
            
            // Update slider value
            slider.value = state.value;
            
            // Update visual
            this.updateMoodVisual(slider, mood, state);
        });
    }
    
    updateMoodVisual(slider, mood, state) {
        const value = state.value;
        const influence = state.influence;
        const color = state.color;
        
        // Update value display
        const valueDisplay = slider.parentElement.querySelector('.mood-value');
        valueDisplay.textContent = value;
        
        // Update slider color based on value
        const intensity = value / 10;
        const alpha = 0.3 + (intensity * 0.7);
        slider.style.background = `linear-gradient(to right, ${color} 0%, ${color} ${value * 10}%, rgba(255,255,255,0.2) ${value * 10}%, rgba(255,255,255,0.2) 100%)`;
        
        // Show influence effect
        const moodItem = slider.closest('.mood-item');
        if (influence > 1.05) {
            moodItem.classList.add('influenced-up');
            moodItem.classList.remove('influenced-down');
        } else if (influence < 0.95) {
            moodItem.classList.add('influenced-down');
            moodItem.classList.remove('influenced-up');
        } else {
            moodItem.classList.remove('influenced-up', 'influenced-down');
        }
        
        // Add pulse effect for high values
        if (value >= 8) {
            moodItem.classList.add('high-value');
        } else {
            moodItem.classList.remove('high-value');
        }
    }
    
    resetMoods() {
        Object.keys(this.moodStates).forEach(mood => {
            this.moodStates[mood].value = 5;
            this.moodStates[mood].influence = 1.0;
        });
        
        this.updateAllMoods();
        this.updateRecommendations();
    }
    
    randomMoods() {
        Object.keys(this.moodStates).forEach(mood => {
            this.moodStates[mood].value = Math.floor(Math.random() * 10) + 1;
            this.moodStates[mood].influence = 1.0;
        });
        
        // Apply interactions
        Object.keys(this.moodStates).forEach(mood => {
            this.calculateMoodInfluences(mood, this.moodStates[mood].value, 5);
        });
        
        this.updateAllMoods();
        this.updateRecommendations();
    }
    
    updateRecommendations() {
        // Get current mood scores
        const moodScores = {};
        Object.keys(this.moodStates).forEach(mood => {
            moodScores[mood] = this.moodStates[mood].value;
        });
        
        // Find drinks that match the mood profile
        const drinks = window.drinksData || [];
        const scoredDrinks = drinks.map(drink => {
            let score = 0;
            let matches = 0;
            
            Object.keys(moodScores).forEach(mood => {
                if (drink.moods && drink.moods[mood]) {
                    const drinkMood = drink.moods[mood];
                    const userMood = moodScores[mood];
                    const match = 10 - Math.abs(drinkMood - userMood);
                    score += match;
                    matches++;
                }
            });
            
            return {
                ...drink,
                moodScore: matches > 0 ? score / matches : 0,
                moodMatches: matches
            };
        });
        
        // Sort by mood score and display top recommendations
        const topDrinks = scoredDrinks
            .sort((a, b) => b.moodScore - a.moodScore)
            .slice(0, 6);
        
        this.displayRecommendations(topDrinks);
    }
    
    displayRecommendations(drinks) {
        const container = document.getElementById('recommendedGrid');
        if (!container) return;
        
        container.innerHTML = drinks.map(drink => `
            <div class="drink-card" data-drink-id="${drink.id}">
                <div class="drink-header">
                    <h4 class="drink-name">${drink.name}</h4>
                    <div class="mood-match-score">
                        <span class="score">${Math.round(drink.moodScore * 10)}%</span>
                        <span class="matches">${drink.moodMatches} moods</span>
                    </div>
                </div>
                
                <div class="drink-preview">
                    <div class="drink-image">
                        <div class="drink-icon">🍸</div>
                    </div>
                    <div class="drink-info">
                        <p class="drink-description">${drink.description}</p>
                        <div class="drink-moods">
                            ${this.getMoodTags(drink.moods)}
                        </div>
                    </div>
                </div>
                
                <div class="drink-actions">
                    <button class="action-btn heart-btn" data-drink-id="${drink.id}">
                        <span class="btn-icon">❤️</span>
                    </button>
                    <button class="action-btn bar-btn" data-drink-id="${drink.id}">
                        <span class="btn-icon">🍸</span>
                        <span class="btn-text">Find Bars</span>
                    </button>
                </div>
            </div>
        `).join('');
        
        // Add event listeners
        this.setupDrinkCardListeners();
    }
    
    getMoodTags(moods) {
        if (!moods) return '';
        return Object.entries(moods)
            .filter(([, value]) => value >= 7)
            .map(([mood]) => `<span class="mood-tag ${mood}">${mood}</span>`)
            .join('');
    }
    
    setupDrinkCardListeners() {
        document.querySelectorAll('.drink-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('button')) {
                    this.showDrinkDetails(card.dataset.drinkId);
                }
            });
        });
        
        document.querySelectorAll('.heart-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleFavorite(btn.dataset.drinkId);
            });
        });
        
        document.querySelectorAll('.bar-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.findBars(btn.dataset.drinkId);
            });
        });
    }
    
    showDrinkDetails(drinkId) {
        // Implement drink details modal
        console.log('Show drink details:', drinkId);
    }
    
    toggleFavorite(drinkId) {
        // Implement favorite toggle
        console.log('Toggle favorite:', drinkId);
    }
    
    findBars(drinkId) {
        // Implement bar finding with Toast integration
        console.log('Find bars for drink:', drinkId);
    }
}

// Initialize the clean mood system
document.addEventListener('DOMContentLoaded', () => {
    window.cleanMoodSystem = new CleanMoodSystem();
});
