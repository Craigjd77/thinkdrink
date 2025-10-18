/**
 * Enhanced Mood System for ThinkDrink
 * Dynamic mood interactions for social groups and influencers
 */

class EnhancedMoodSystem {
    constructor() {
        this.moodStates = {
            energy: { value: 5, influence: 1.0, color: '#FF6B6B' },
            social: { value: 5, influence: 1.0, color: '#4ECDC4' },
            adventure: { value: 5, influence: 1.0, color: '#45B7D1' },
            romance: { value: 5, influence: 1.0, color: '#FFA07A' },
            celebration: { value: 5, influence: 1.0, color: '#98D8C8' },
            comfort: { value: 5, influence: 1.0, color: '#F7DC6F' }
        };
        
        this.groupMood = {
            size: 1,
            vibe: 'mixed',
            timeOfDay: 'evening',
            occasion: 'casual'
        };
        
        this.moodInteractions = {
            energy: {
                social: 0.8,      // High energy increases social mood
                adventure: 0.9,  // High energy increases adventure
                romance: -0.3,   // High energy decreases romance
                celebration: 0.7, // High energy increases celebration
                comfort: -0.4    // High energy decreases comfort
            },
            social: {
                energy: 0.6,     // Social mood increases energy
                adventure: 0.5,   // Social mood increases adventure
                romance: 0.4,    // Social mood slightly increases romance
                celebration: 0.8, // Social mood increases celebration
                comfort: 0.3     // Social mood slightly increases comfort
            },
            adventure: {
                energy: 0.7,     // Adventure increases energy
                social: 0.6,     // Adventure increases social
                romance: -0.2,   // Adventure slightly decreases romance
                celebration: 0.5, // Adventure increases celebration
                comfort: -0.6    // Adventure decreases comfort
            },
            romance: {
                energy: -0.4,    // Romance decreases energy
                social: 0.2,     // Romance slightly increases social
                adventure: -0.3, // Romance decreases adventure
                celebration: 0.3, // Romance slightly increases celebration
                comfort: 0.8     // Romance increases comfort
            },
            celebration: {
                energy: 0.9,    // Celebration increases energy
                social: 0.9,    // Celebration increases social
                adventure: 0.4, // Celebration increases adventure
                romance: 0.2,   // Celebration slightly increases romance
                comfort: -0.2   // Celebration decreases comfort
            },
            comfort: {
                energy: -0.5,   // Comfort decreases energy
                social: 0.1,    // Comfort slightly increases social
                adventure: -0.7, // Comfort decreases adventure
                romance: 0.6,   // Comfort increases romance
                celebration: -0.3 // Comfort decreases celebration
            }
        };
        
        this.init();
    }
    
    init() {
        this.createDynamicMoodInterface();
        this.setupGroupFeatures();
        this.setupInfluencerFeatures();
    }
    
    createDynamicMoodInterface() {
        const moodContainer = document.querySelector('.mood-selector');
        if (!moodContainer) return;
        
        // Replace static sliders with dynamic mood bubbles
        moodContainer.innerHTML = `
            <div class="mood-header">
                <h2>Set the Vibe</h2>
                <p class="mood-subtitle">How are you feeling? Your choices will influence each other!</p>
            </div>
            
            <div class="mood-bubbles-container">
                <div class="mood-bubble" data-mood="energy">
                    <div class="bubble-icon">⚡</div>
                    <div class="bubble-label">Energy</div>
                    <div class="bubble-value">5</div>
                    <div class="bubble-influence"></div>
                </div>
                
                <div class="mood-bubble" data-mood="social">
                    <div class="bubble-icon">👥</div>
                    <div class="bubble-label">Social</div>
                    <div class="bubble-value">5</div>
                    <div class="bubble-influence"></div>
                </div>
                
                <div class="mood-bubble" data-mood="adventure">
                    <div class="bubble-icon">🌍</div>
                    <div class="bubble-label">Adventure</div>
                    <div class="bubble-value">5</div>
                    <div class="bubble-influence"></div>
                </div>
                
                <div class="mood-bubble" data-mood="romance">
                    <div class="bubble-icon">💕</div>
                    <div class="bubble-label">Romance</div>
                    <div class="bubble-value">5</div>
                    <div class="bubble-influence"></div>
                </div>
                
                <div class="mood-bubble" data-mood="celebration">
                    <div class="bubble-icon">🎉</div>
                    <div class="bubble-label">Celebration</div>
                    <div class="bubble-value">5</div>
                    <div class="bubble-influence"></div>
                </div>
                
                <div class="mood-bubble" data-mood="comfort">
                    <div class="bubble-icon">🔥</div>
                    <div class="bubble-label">Comfort</div>
                    <div class="bubble-value">5</div>
                    <div class="bubble-influence"></div>
                </div>
            </div>
            
            <div class="group-settings">
                <h3>Group Vibe</h3>
                <div class="group-controls">
                    <div class="group-control">
                        <label>Group Size</label>
                        <div class="group-size-selector">
                            <button class="size-btn" data-size="1">Solo</button>
                            <button class="size-btn" data-size="2">Date</button>
                            <button class="size-btn active" data-size="4">Small Group</button>
                            <button class="size-btn" data-size="8">Party</button>
                            <button class="size-btn" data-size="15">Big Night</button>
                        </div>
                    </div>
                    
                    <div class="group-control">
                        <label>Time & Occasion</label>
                        <div class="occasion-selector">
                            <button class="occasion-btn" data-occasion="brunch">Brunch</button>
                            <button class="occasion-btn" data-occasion="happy-hour">Happy Hour</button>
                            <button class="occasion-btn active" data-occasion="night-out">Night Out</button>
                            <button class="occasion-btn" data-occasion="date-night">Date Night</button>
                            <button class="occasion-btn" data-occasion="celebration">Celebration</button>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="mood-actions">
                <button class="action-btn vibe-sync" id="vibeSyncBtn">
                    <span class="btn-icon">🔄</span>
                    <span class="btn-text">Sync Group Vibe</span>
                </button>
                <button class="action-btn random-vibe" id="randomVibeBtn">
                    <span class="btn-icon">🎲</span>
                    <span class="btn-text">Random Vibe</span>
                </button>
                <button class="action-btn share-vibe" id="shareVibeBtn">
                    <span class="btn-icon">📱</span>
                    <span class="btn-text">Share Vibe</span>
                </button>
            </div>
        `;
        
        this.setupMoodBubbles();
    }
    
    setupMoodBubbles() {
        const bubbles = document.querySelectorAll('.mood-bubble');
        
        bubbles.forEach(bubble => {
            const mood = bubble.dataset.mood;
            const state = this.moodStates[mood];
            
            // Make bubbles interactive
            bubble.addEventListener('click', (e) => {
                this.adjustMood(mood, e.offsetX / bubble.offsetWidth);
            });
            
            bubble.addEventListener('mousemove', (e) => {
                if (e.buttons === 1) { // Mouse is pressed
                    this.adjustMood(mood, e.offsetX / bubble.offsetWidth);
                }
            });
            
            // Update visual state
            this.updateBubbleVisual(bubble, mood, state);
        });
        
        // Setup group controls
        this.setupGroupControls();
    }
    
    adjustMood(mood, position) {
        const newValue = Math.round(position * 10) + 1;
        const oldValue = this.moodStates[mood].value;
        
        if (newValue === oldValue) return;
        
        this.moodStates[mood].value = newValue;
        
        // Calculate influence on other moods
        this.calculateMoodInfluences(mood, newValue, oldValue);
        
        // Update visuals
        this.updateAllBubbles();
        
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
    
    updateAllBubbles() {
        document.querySelectorAll('.mood-bubble').forEach(bubble => {
            const mood = bubble.dataset.mood;
            const state = this.moodStates[mood];
            this.updateBubbleVisual(bubble, mood, state);
        });
    }
    
    updateBubbleVisual(bubble, mood, state) {
        const value = state.value;
        const influence = state.influence;
        const color = state.color;
        
        // Update value display
        bubble.querySelector('.bubble-value').textContent = value;
        
        // Update size based on value
        const size = 60 + (value * 8);
        bubble.style.width = `${size}px`;
        bubble.style.height = `${size}px`;
        
        // Update color intensity
        const intensity = value / 10;
        const alpha = 0.3 + (intensity * 0.7);
        bubble.style.backgroundColor = `${color}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`;
        
        // Show influence effect
        const influenceEl = bubble.querySelector('.bubble-influence');
        if (influence > 1.05) {
            influenceEl.style.display = 'block';
            influenceEl.textContent = '↑';
            influenceEl.style.color = '#4CAF50';
        } else if (influence < 0.95) {
            influenceEl.style.display = 'block';
            influenceEl.textContent = '↓';
            influenceEl.style.color = '#F44336';
        } else {
            influenceEl.style.display = 'none';
        }
        
        // Add pulse effect for high values
        if (value >= 8) {
            bubble.classList.add('pulse');
        } else {
            bubble.classList.remove('pulse');
        }
    }
    
    setupGroupControls() {
        // Group size selector
        document.querySelectorAll('.size-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.groupMood.size = parseInt(btn.dataset.size);
                this.updateGroupRecommendations();
            });
        });
        
        // Occasion selector
        document.querySelectorAll('.occasion-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.occasion-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.groupMood.occasion = btn.dataset.occasion;
                this.updateOccasionMoods();
            });
        });
    }
    
    updateOccasionMoods() {
        const occasionMoods = {
            'brunch': { energy: 6, social: 7, adventure: 3, romance: 4, celebration: 5, comfort: 8 },
            'happy-hour': { energy: 7, social: 8, adventure: 5, romance: 3, celebration: 6, comfort: 4 },
            'night-out': { energy: 8, social: 9, adventure: 7, romance: 5, celebration: 8, comfort: 3 },
            'date-night': { energy: 4, social: 6, adventure: 3, romance: 9, celebration: 4, comfort: 7 },
            'celebration': { energy: 9, social: 9, adventure: 6, romance: 4, celebration: 10, comfort: 2 }
        };
        
        const moods = occasionMoods[this.groupMood.occasion];
        if (moods) {
            Object.keys(moods).forEach(mood => {
                this.moodStates[mood].value = moods[mood];
            });
            this.updateAllBubbles();
            this.updateRecommendations();
        }
    }
    
    updateGroupRecommendations() {
        // Adjust recommendations based on group size
        const groupMultiplier = {
            1: 1.0,    // Solo
            2: 1.2,    // Date
            4: 1.5,    // Small Group
            8: 1.8,    // Party
            15: 2.0    // Big Night
        };
        
        const multiplier = groupMultiplier[this.groupMood.size] || 1.0;
        
        // Update drink recommendations with group context
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
            <div class="drink-card enhanced" data-drink-id="${drink.id}">
                <div class="drink-header">
                    <h4 class="drink-name">${drink.name}</h4>
                    <div class="mood-match-score">
                        <span class="score">${Math.round(drink.moodScore * 10)}%</span>
                        <span class="matches">${drink.moodMatches} moods</span>
                    </div>
                </div>
                
                <div class="drink-preview">
                    <div class="drink-image" style="background: linear-gradient(135deg, ${this.getMoodColors(drink.moods)}, #333)">
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
                    <button class="action-btn share-btn" data-drink-id="${drink.id}">
                        <span class="btn-icon">📱</span>
                    </button>
                </div>
            </div>
        `).join('');
        
        // Add event listeners
        this.setupDrinkCardListeners();
    }
    
    getMoodColors(moods) {
        const colors = {
            energetic: '#FF6B6B',
            social: '#4ECDC4', 
            adventurous: '#45B7D1',
            romantic: '#FFA07A',
            celebratory: '#98D8C8',
            cozy: '#F7DC6F'
        };
        
        const topMoods = Object.entries(moods || {})
            .sort(([,a], [,b]) => b - a)
            .slice(0, 2)
            .map(([mood]) => colors[mood] || '#666');
            
        return topMoods.join(', ');
    }
    
    getMoodTags(moods) {
        return Object.entries(moods || {})
            .filter(([, value]) => value >= 7)
            .map(([mood, value]) => `<span class="mood-tag ${mood}">${mood}</span>`)
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
        
        document.querySelectorAll('.share-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.shareDrink(btn.dataset.drinkId);
            });
        });
    }
    
    setupGroupFeatures() {
        // Add group sharing functionality
        document.getElementById('shareVibeBtn')?.addEventListener('click', () => {
            this.shareGroupVibe();
        });
        
        document.getElementById('vibeSyncBtn')?.addEventListener('click', () => {
            this.syncGroupVibe();
        });
    }
    
    setupInfluencerFeatures() {
        // Add social media integration
        this.setupSocialSharing();
        this.setupGroupPolls();
    }
    
    shareGroupVibe() {
        const vibeData = {
            moods: this.moodStates,
            group: this.groupMood,
            timestamp: new Date().toISOString()
        };
        
        const shareText = `🍸 Setting the vibe with ThinkDrink! 
        
Energy: ${this.moodStates.energy.value}/10
Social: ${this.moodStates.social.value}/10  
Adventure: ${this.moodStates.adventure.value}/10

Group: ${this.groupMood.size} people, ${this.groupMood.occasion}

Join me at the bars! 🍻`;

        if (navigator.share) {
            navigator.share({
                title: 'ThinkDrink Vibe',
                text: shareText,
                url: window.location.href
            });
        } else {
            // Fallback to clipboard
            navigator.clipboard.writeText(shareText);
            this.showToast('Vibe copied to clipboard! Share with your group!');
        }
    }
    
    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
}

// Initialize the enhanced mood system
document.addEventListener('DOMContentLoaded', () => {
    window.enhancedMoodSystem = new EnhancedMoodSystem();
});
