/**
 * Social Features for ThinkDrink
 * Group decision-making and influencer features
 */

class SocialFeatures {
    constructor() {
        this.groupMembers = [];
        this.groupVotes = {};
        this.socialConnections = [];
        this.init();
    }
    
    init() {
        this.setupGroupPolls();
        this.setupSocialSharing();
        this.setupInfluencerFeatures();
    }
    
    setupGroupPolls() {
        // Create group poll interface
        this.createGroupPollInterface();
    }
    
    createGroupPollInterface() {
        const pollContainer = document.createElement('div');
        pollContainer.className = 'group-poll-container';
        pollContainer.innerHTML = `
            <div class="poll-header">
                <h3>Group Decision</h3>
                <p>Let your group vote on the vibe!</p>
            </div>
            
            <div class="poll-options">
                <button class="poll-option" data-vibe="high-energy">
                    <div class="option-icon">⚡</div>
                    <div class="option-label">High Energy</div>
                    <div class="option-votes">0 votes</div>
                </button>
                
                <button class="poll-option" data-vibe="chill-social">
                    <div class="option-icon">😌</div>
                    <div class="option-label">Chill & Social</div>
                    <div class="option-votes">0 votes</div>
                </button>
                
                <button class="poll-option" data-vibe="adventure">
                    <div class="option-icon">🌍</div>
                    <div class="option-label">Adventure</div>
                    <div class="option-votes">0 votes</div>
                </button>
                
                <button class="poll-option" data-vibe="romantic">
                    <div class="option-icon">💕</div>
                    <div class="option-label">Romantic</div>
                    <div class="option-votes">0 votes</div>
                </button>
                
                <button class="poll-option" data-vibe="celebration">
                    <div class="option-icon">🎉</div>
                    <div class="option-label">Celebration</div>
                    <div class="option-votes">0 votes</div>
                </button>
                
                <button class="poll-option" data-vibe="cozy">
                    <div class="option-icon">🔥</div>
                    <div class="option-label">Cozy</div>
                    <div class="option-votes">0 votes</div>
                </button>
            </div>
            
            <div class="poll-actions">
                <button class="action-btn create-poll" id="createPollBtn">
                    <span class="btn-icon">📊</span>
                    <span class="btn-text">Create Poll</span>
                </button>
                <button class="action-btn share-poll" id="sharePollBtn">
                    <span class="btn-icon">📱</span>
                    <span class="btn-text">Share Poll</span>
                </button>
            </div>
        `;
        
        // Insert after mood selector
        const moodSelector = document.querySelector('.mood-selector');
        if (moodSelector) {
            moodSelector.insertAdjacentElement('afterend', pollContainer);
        }
        
        this.setupPollListeners();
    }
    
    setupPollListeners() {
        document.querySelectorAll('.poll-option').forEach(option => {
            option.addEventListener('click', (e) => {
                this.voteOnOption(option.dataset.vibe);
            });
        });
        
        document.getElementById('createPollBtn')?.addEventListener('click', () => {
            this.createGroupPoll();
        });
        
        document.getElementById('sharePollBtn')?.addEventListener('click', () => {
            this.shareGroupPoll();
        });
    }
    
    voteOnOption(vibe) {
        const userId = this.getUserId();
        this.groupVotes[userId] = vibe;
        
        // Update vote counts
        this.updateVoteCounts();
        
        // Check if we have a consensus
        this.checkConsensus();
        
        // Show voting feedback
        this.showVoteFeedback(vibe);
    }
    
    updateVoteCounts() {
        const voteCounts = {};
        Object.values(this.groupVotes).forEach(vibe => {
            voteCounts[vibe] = (voteCounts[vibe] || 0) + 1;
        });
        
        document.querySelectorAll('.poll-option').forEach(option => {
            const vibe = option.dataset.vibe;
            const votes = voteCounts[vibe] || 0;
            option.querySelector('.option-votes').textContent = `${votes} vote${votes !== 1 ? 's' : ''}`;
            
            // Highlight leading option
            if (votes > 0) {
                option.classList.add('has-votes');
            } else {
                option.classList.remove('has-votes');
            }
        });
    }
    
    checkConsensus() {
        const totalVotes = Object.keys(this.groupVotes).length;
        if (totalVotes < 2) return;
        
        const voteCounts = {};
        Object.values(this.groupVotes).forEach(vibe => {
            voteCounts[vibe] = (voteCounts[vibe] || 0) + 1;
        });
        
        const maxVotes = Math.max(...Object.values(voteCounts));
        const consensusVibe = Object.keys(voteCounts).find(vibe => voteCounts[vibe] === maxVotes);
        
        if (maxVotes >= totalVotes * 0.6) { // 60% consensus
            this.applyConsensusVibe(consensusVibe);
        }
    }
    
    applyConsensusVibe(vibe) {
        const vibeSettings = {
            'high-energy': { energy: 9, social: 8, adventure: 7, romance: 3, celebration: 8, comfort: 2 },
            'chill-social': { energy: 5, social: 9, adventure: 4, romance: 6, celebration: 5, comfort: 7 },
            'adventure': { energy: 8, social: 7, adventure: 9, romance: 4, celebration: 6, comfort: 3 },
            'romantic': { energy: 3, social: 5, adventure: 2, romance: 9, celebration: 4, comfort: 8 },
            'celebration': { energy: 9, social: 9, adventure: 6, romance: 4, celebration: 10, comfort: 2 },
            'cozy': { energy: 3, social: 6, adventure: 2, romance: 7, celebration: 3, comfort: 9 }
        };
        
        if (vibeSettings[vibe] && window.enhancedMoodSystem) {
            Object.keys(vibeSettings[vibe]).forEach(mood => {
                window.enhancedMoodSystem.moodStates[mood].value = vibeSettings[vibe][mood];
            });
            window.enhancedMoodSystem.updateAllBubbles();
            window.enhancedMoodSystem.updateRecommendations();
        }
        
        this.showConsensusNotification(vibe);
    }
    
    showConsensusNotification(vibe) {
        const notification = document.createElement('div');
        notification.className = 'consensus-notification';
        notification.innerHTML = `
            <div class="consensus-content">
                <div class="consensus-icon">🎯</div>
                <div class="consensus-text">
                    <h4>Group Consensus!</h4>
                    <p>Your group chose: <strong>${vibe.replace('-', ' ').toUpperCase()}</strong></p>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }
    
    setupSocialSharing() {
        // Add social sharing buttons to drink cards
        this.addSocialSharingToDrinks();
    }
    
    addSocialSharingToDrinks() {
        // This will be called when drink cards are created
        document.addEventListener('click', (e) => {
            if (e.target.closest('.share-btn')) {
                const drinkCard = e.target.closest('.drink-card');
                const drinkId = drinkCard?.dataset.drinkId;
                if (drinkId) {
                    this.shareDrink(drinkId);
                }
            }
        });
    }
    
    shareDrink(drinkId) {
        const drink = this.getDrinkById(drinkId);
        if (!drink) return;
        
        const shareText = `🍸 Just discovered "${drink.name}" on ThinkDrink!
        
${drink.description}

Perfect for: ${this.getMoodTags(drink.moods)}

Join me at the bars! 🍻 #ThinkDrink #Cocktails`;

        if (navigator.share) {
            navigator.share({
                title: `ThinkDrink: ${drink.name}`,
                text: shareText,
                url: window.location.href
            });
        } else {
            navigator.clipboard.writeText(shareText);
            this.showToast('Drink shared! Check your clipboard for the link.');
        }
    }
    
    setupInfluencerFeatures() {
        this.setupStoryTemplates();
        this.setupGroupChallenges();
    }
    
    setupStoryTemplates() {
        // Create Instagram story templates for influencers
        this.createStoryTemplates();
    }
    
    createStoryTemplates() {
        const storyContainer = document.createElement('div');
        storyContainer.className = 'story-templates';
        storyContainer.innerHTML = `
            <div class="story-header">
                <h3>📸 Story Templates</h3>
                <p>Ready-to-share content for your socials</p>
            </div>
            
            <div class="story-grid">
                <div class="story-template" data-template="mood-check">
                    <div class="template-preview">
                        <div class="preview-content">
                            <h4>Mood Check</h4>
                            <p>Setting the vibe with ThinkDrink! 🍸</p>
                        </div>
                    </div>
                    <button class="use-template">Use Template</button>
                </div>
                
                <div class="story-template" data-template="group-vote">
                    <div class="template-preview">
                        <div class="preview-content">
                            <h4>Group Vote</h4>
                            <p>Let's decide together! 🗳️</p>
                        </div>
                    </div>
                    <button class="use-template">Use Template</button>
                </div>
                
                <div class="story-template" data-template="drink-discovery">
                    <div class="template-preview">
                        <div class="preview-content">
                            <h4>Drink Discovery</h4>
                            <p>Found my new favorite! 🍹</p>
                        </div>
                    </div>
                    <button class="use-template">Use Template</button>
                </div>
            </div>
        `;
        
        // Add to main content
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.appendChild(storyContainer);
        }
        
        this.setupStoryTemplateListeners();
    }
    
    setupStoryTemplateListeners() {
        document.querySelectorAll('.use-template').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const template = e.target.closest('.story-template').dataset.template;
                this.generateStoryContent(template);
            });
        });
    }
    
    generateStoryContent(template) {
        const templates = {
            'mood-check': {
                text: `🍸 Setting the vibe with ThinkDrink!
                
Energy: ${window.enhancedMoodSystem?.moodStates.energy.value || 5}/10
Social: ${window.enhancedMoodSystem?.moodStates.social.value || 5}/10
Adventure: ${window.enhancedMoodSystem?.moodStates.adventure.value || 5}/10

Who's joining me? 🍻 #ThinkDrink #Cocktails`,
                hashtags: ['#ThinkDrink', '#Cocktails', '#NightOut', '#Mood']
            },
            'group-vote': {
                text: `🗳️ Group decision time!
                
Let's vote on tonight's vibe:
⚡ High Energy
😌 Chill & Social  
🌍 Adventure
💕 Romantic
🎉 Celebration
🔥 Cozy

Comment your choice! 👇 #ThinkDrink #GroupVibes`,
                hashtags: ['#ThinkDrink', '#GroupVibes', '#Vote', '#NightOut']
            },
            'drink-discovery': {
                text: `🍹 Just discovered "${this.getRandomDrink()?.name || 'Amazing Cocktail'}" on ThinkDrink!
                
Perfect for my current mood! The algorithm really gets me 😍

Try it yourself: thinkdrink.app
#ThinkDrink #CocktailDiscovery #Mood`,
                hashtags: ['#ThinkDrink', '#CocktailDiscovery', '#Mood', '#NewFinds']
            }
        };
        
        const content = templates[template];
        if (content) {
            this.showStoryPreview(content);
        }
    }
    
    showStoryPreview(content) {
        const preview = document.createElement('div');
        preview.className = 'story-preview-modal';
        preview.innerHTML = `
            <div class="preview-content">
                <div class="preview-header">
                    <h3>📸 Your Story Content</h3>
                    <button class="close-preview">&times;</button>
                </div>
                <div class="preview-text">${content.text}</div>
                <div class="preview-actions">
                    <button class="copy-content">Copy Text</button>
                    <button class="share-story">Share Story</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(preview);
        
        // Setup listeners
        preview.querySelector('.close-preview').addEventListener('click', () => {
            preview.remove();
        });
        
        preview.querySelector('.copy-content').addEventListener('click', () => {
            navigator.clipboard.writeText(content.text);
            this.showToast('Story content copied!');
        });
        
        preview.querySelector('.share-story').addEventListener('click', () => {
            this.shareStoryContent(content);
        });
    }
    
    shareStoryContent(content) {
        if (navigator.share) {
            navigator.share({
                title: 'ThinkDrink Story',
                text: content.text,
                url: window.location.href
            });
        } else {
            navigator.clipboard.writeText(content.text);
            this.showToast('Story content copied to clipboard!');
        }
    }
    
    setupGroupChallenges() {
        // Create group challenges for social engagement
        this.createGroupChallenges();
    }
    
    createGroupChallenges() {
        const challengesContainer = document.createElement('div');
        challengesContainer.className = 'group-challenges';
        challengesContainer.innerHTML = `
            <div class="challenges-header">
                <h3>🏆 Group Challenges</h3>
                <p>Compete with your friends!</p>
            </div>
            
            <div class="challenge-list">
                <div class="challenge-item">
                    <div class="challenge-icon">🍸</div>
                    <div class="challenge-content">
                        <h4>Mood Master</h4>
                        <p>Get 5 perfect mood matches in a row</p>
                        <div class="challenge-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: 0%"></div>
                            </div>
                            <span class="progress-text">0/5</span>
                        </div>
                    </div>
                </div>
                
                <div class="challenge-item">
                    <div class="challenge-icon">👥</div>
                    <div class="challenge-content">
                        <h4>Group Consensus</h4>
                        <p>Get your whole group to agree on a vibe</p>
                        <div class="challenge-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: 0%"></div>
                            </div>
                            <span class="progress-text">0/1</span>
                        </div>
                    </div>
                </div>
                
                <div class="challenge-item">
                    <div class="challenge-icon">📱</div>
                    <div class="challenge-content">
                        <h4>Social Butterfly</h4>
                        <p>Share 10 drinks with your friends</p>
                        <div class="challenge-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: 0%"></div>
                            </div>
                            <span class="progress-text">0/10</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add to main content
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.appendChild(challengesContainer);
        }
    }
    
    // Utility methods
    getUserId() {
        let userId = localStorage.getItem('thinkdrink_user_id');
        if (!userId) {
            userId = 'user_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('thinkdrink_user_id', userId);
        }
        return userId;
    }
    
    getDrinkById(id) {
        return window.drinksData?.find(drink => drink.id == id);
    }
    
    getRandomDrink() {
        const drinks = window.drinksData || [];
        return drinks[Math.floor(Math.random() * drinks.length)];
    }
    
    getMoodTags(moods) {
        if (!moods) return '';
        return Object.entries(moods)
            .filter(([, value]) => value >= 7)
            .map(([mood]) => mood)
            .join(', ');
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

// Initialize social features
document.addEventListener('DOMContentLoaded', () => {
    window.socialFeatures = new SocialFeatures();
});
