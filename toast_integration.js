/**
 * Enhanced Toast Integration for ThinkDrink
 * Focused on bar-goer experience and local bar integration
 */

class ToastIntegration {
    constructor() {
        this.selectedBar = null;
        this.currentDrink = null;
        this.orderHistory = [];
        this.init();
    }
    
    init() {
        this.setupBarSelector();
        this.setupOrderFlow();
        this.setupBarFeatures();
    }
    
    setupBarSelector() {
        // Enhanced bar selector with better UX
        const barSelect = document.getElementById('barSelect');
        if (!barSelect) return;
        
        // Load bars and populate selector
        this.loadBars().then(bars => {
            this.populateBarSelector(bars);
        });
        
        barSelect.addEventListener('change', (e) => {
            const barId = e.target.value;
            if (barId) {
                this.selectBar(barId);
            } else {
                this.hideBarInfo();
            }
        });
    }
    
    async loadBars() {
        try {
            const response = await fetch('/data/bars.json');
            return await response.json();
        } catch (error) {
            console.error('Error loading bars:', error);
            return [];
        }
    }
    
    populateBarSelector(bars) {
        const barSelect = document.getElementById('barSelect');
        if (!barSelect) return;
        
        // Clear existing options except the first one
        barSelect.innerHTML = '<option value="">Select a bar...</option>';
        
        bars.forEach(bar => {
            const option = document.createElement('option');
            option.value = bar.id;
            option.textContent = `${bar.name} - ${bar.type}`;
            option.dataset.bar = JSON.stringify(bar);
            barSelect.appendChild(option);
        });
    }
    
    selectBar(barId) {
        const barSelect = document.getElementById('barSelect');
        const selectedOption = barSelect.querySelector(`option[value="${barId}"]`);
        
        if (!selectedOption) return;
        
        const barData = JSON.parse(selectedOption.dataset.bar);
        this.selectedBar = barData;
        this.showBarInfo(barData);
    }
    
    showBarInfo(bar) {
        const barInfo = document.getElementById('selectedBarInfo');
        if (!barInfo) return;
        
        barInfo.style.display = 'block';
        
        // Update bar details
        document.getElementById('barName').textContent = bar.name;
        document.getElementById('barType').textContent = bar.type;
        document.getElementById('barAddress').textContent = bar.address;
        document.getElementById('barHours').textContent = bar.hours;
        document.getElementById('barSpecialty').textContent = bar.specialty;
        
        // Calculate mood match score
        this.calculateMoodMatch(bar);
        
        // Show order demo if we have a current drink
        if (this.currentDrink) {
            this.showOrderDemo(this.currentDrink);
        }
    }
    
    hideBarInfo() {
        const barInfo = document.getElementById('selectedBarInfo');
        if (barInfo) {
            barInfo.style.display = 'none';
        }
        
        const orderDemo = document.getElementById('toastOrderDemo');
        if (orderDemo) {
            orderDemo.style.display = 'none';
        }
        
        this.selectedBar = null;
    }
    
    calculateMoodMatch(bar) {
        const moodScore = document.getElementById('moodMatchScore');
        if (!moodScore) return;
        
        // Get current mood from the clean mood system
        const currentMoods = window.cleanMoodSystem?.moodStates || {};
        
        // Calculate match based on bar type and current mood
        let matchScore = 0;
        let matchFactors = [];
        
        if (bar.type.toLowerCase().includes('cocktail') && currentMoods.energetic?.value >= 7) {
            matchScore += 20;
            matchFactors.push('High energy + Cocktail bar');
        }
        
        if (bar.type.toLowerCase().includes('wine') && currentMoods.romantic?.value >= 7) {
            matchScore += 20;
            matchFactors.push('Romantic mood + Wine bar');
        }
        
        if (bar.type.toLowerCase().includes('brewery') && currentMoods.social?.value >= 7) {
            matchScore += 20;
            matchFactors.push('Social mood + Brewery');
        }
        
        if (bar.specialty && currentMoods.adventurous?.value >= 7) {
            matchScore += 15;
            matchFactors.push('Adventurous + Specialty drinks');
        }
        
        // Base score for any bar
        matchScore = Math.max(60, matchScore);
        
        moodScore.innerHTML = `
            <div class="match-score">${matchScore}% Match</div>
            <div class="match-factors">${matchFactors.join(', ') || 'Good vibes match!'}</div>
        `;
    }
    
    setupOrderFlow() {
        // Setup order flow for drinks
        document.addEventListener('click', (e) => {
            if (e.target.closest('.bar-btn')) {
                const drinkCard = e.target.closest('.drink-card');
                const drinkId = drinkCard?.dataset.drinkId;
                
                if (drinkId) {
                    this.startOrderFlow(drinkId);
                }
            }
        });
        
        // Setup order buttons
        document.getElementById('placeOrderBtn')?.addEventListener('click', () => {
            this.placeOrder();
        });
        
        document.getElementById('demoOrderBtn')?.addEventListener('click', () => {
            this.demoOrder();
        });
    }
    
    async startOrderFlow(drinkId) {
        // Get drink data
        const drinks = window.drinksData || [];
        const drink = drinks.find(d => d.id == drinkId);
        
        if (!drink) {
            this.showToast('Drink not found');
            return;
        }
        
        this.currentDrink = drink;
        
        // If no bar selected, show bar selector
        if (!this.selectedBar) {
            this.showToast('Please select a bar first');
            const barSelect = document.getElementById('barSelect');
            if (barSelect) {
                barSelect.focus();
            }
            return;
        }
        
        // Show order demo
        this.showOrderDemo(drink);
    }
    
    showOrderDemo(drink) {
        const orderDemo = document.getElementById('toastOrderDemo');
        if (!orderDemo) return;
        
        orderDemo.style.display = 'block';
        
        // Update order details
        document.getElementById('orderDrinkName').textContent = drink.name;
        document.getElementById('orderDrinkPrice').textContent = this.calculatePrice(drink);
        document.getElementById('orderTotal').textContent = this.calculatePrice(drink);
        
        // Add drink to order history
        this.addToOrderHistory(drink);
    }
    
    calculatePrice(drink) {
        // Simple pricing based on drink complexity
        const basePrice = 8;
        const complexityMultiplier = drink.ingredients?.length > 5 ? 1.5 : 1;
        const price = basePrice * complexityMultiplier;
        
        return `$${price.toFixed(2)}`;
    }
    
    addToOrderHistory(drink) {
        const order = {
            drink: drink,
            timestamp: new Date(),
            bar: this.selectedBar,
            price: this.calculatePrice(drink)
        };
        
        this.orderHistory.push(order);
        
        // Store in localStorage for persistence
        localStorage.setItem('thinkdrink_order_history', JSON.stringify(this.orderHistory));
    }
    
    placeOrder() {
        if (!this.currentDrink || !this.selectedBar) {
            this.showToast('Please select a drink and bar');
            return;
        }
        
        // Simulate order placement
        this.showToast('Order placed! Check your phone for confirmation.');
        
        // Add to order history
        this.addToOrderHistory(this.currentDrink);
        
        // Show success animation
        this.showOrderSuccess();
    }
    
    demoOrder() {
        if (!this.currentDrink || !this.selectedBar) {
            this.showToast('Please select a drink and bar');
            return;
        }
        
        // Simulate demo order
        this.showToast('Demo order placed! (This is just a demo)');
        
        // Show demo animation
        this.showDemoAnimation();
    }
    
    showOrderSuccess() {
        const orderDemo = document.getElementById('toastOrderDemo');
        if (!orderDemo) return;
        
        // Add success animation
        orderDemo.classList.add('order-success');
        
        setTimeout(() => {
            orderDemo.classList.remove('order-success');
        }, 2000);
    }
    
    showDemoAnimation() {
        const orderDemo = document.getElementById('toastOrderDemo');
        if (!orderDemo) return;
        
        // Add demo animation
        orderDemo.classList.add('demo-animation');
        
        setTimeout(() => {
            orderDemo.classList.remove('demo-animation');
        }, 2000);
    }
    
    setupBarFeatures() {
        // Setup bar-specific features
        this.setupBarNavigation();
        this.setupBarReviews();
        this.setupBarSpecials();
    }
    
    setupBarNavigation() {
        // Add navigation to bar
        const barInfo = document.getElementById('selectedBarInfo');
        if (!barInfo) return;
        
        // Add navigation button
        const navButton = document.createElement('button');
        navButton.className = 'action-btn nav-btn';
        navButton.innerHTML = `
            <span class="btn-icon">🧭</span>
            <span class="btn-text">Get Directions</span>
        `;
        
        navButton.addEventListener('click', () => {
            this.openDirections();
        });
        
        barInfo.appendChild(navButton);
    }
    
    openDirections() {
        if (!this.selectedBar) return;
        
        const address = encodeURIComponent(this.selectedBar.address);
        const mapsUrl = `https://maps.google.com/maps?q=${address}`;
        
        window.open(mapsUrl, '_blank');
    }
    
    setupBarReviews() {
        // Add review functionality
        const barInfo = document.getElementById('selectedBarInfo');
        if (!barInfo) return;
        
        // Add review button
        const reviewButton = document.createElement('button');
        reviewButton.className = 'action-btn review-btn';
        reviewButton.innerHTML = `
            <span class="btn-icon">⭐</span>
            <span class="btn-text">Rate Bar</span>
        `;
        
        reviewButton.addEventListener('click', () => {
            this.showReviewModal();
        });
        
        barInfo.appendChild(reviewButton);
    }
    
    showReviewModal() {
        if (!this.selectedBar) return;
        
        const modal = document.createElement('div');
        modal.className = 'review-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Rate ${this.selectedBar.name}</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="rating-section">
                        <label>Overall Experience</label>
                        <div class="star-rating">
                            <span class="star" data-rating="1">★</span>
                            <span class="star" data-rating="2">★</span>
                            <span class="star" data-rating="3">★</span>
                            <span class="star" data-rating="4">★</span>
                            <span class="star" data-rating="5">★</span>
                        </div>
                    </div>
                    <div class="comment-section">
                        <label>Comments</label>
                        <textarea placeholder="How was your experience?"></textarea>
                    </div>
                    <div class="modal-actions">
                        <button class="submit-review">Submit Review</button>
                        <button class="cancel-review">Cancel</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Setup modal interactions
        this.setupReviewModal(modal);
    }
    
    setupReviewModal(modal) {
        const closeBtn = modal.querySelector('.close-modal');
        const cancelBtn = modal.querySelector('.cancel-review');
        const submitBtn = modal.querySelector('.submit-review');
        const stars = modal.querySelectorAll('.star');
        
        let rating = 0;
        
        stars.forEach((star, index) => {
            star.addEventListener('click', () => {
                rating = index + 1;
                stars.forEach((s, i) => {
                    s.classList.toggle('active', i < rating);
                });
            });
        });
        
        closeBtn.addEventListener('click', () => {
            modal.remove();
        });
        
        cancelBtn.addEventListener('click', () => {
            modal.remove();
        });
        
        submitBtn.addEventListener('click', () => {
            const comment = modal.querySelector('textarea').value;
            this.submitReview(rating, comment);
            modal.remove();
        });
    }
    
    submitReview(rating, comment) {
        const review = {
            bar: this.selectedBar,
            rating: rating,
            comment: comment,
            timestamp: new Date()
        };
        
        // Store review
        const reviews = JSON.parse(localStorage.getItem('thinkdrink_reviews') || '[]');
        reviews.push(review);
        localStorage.setItem('thinkdrink_reviews', JSON.stringify(reviews));
        
        this.showToast('Review submitted! Thank you for your feedback.');
    }
    
    setupBarSpecials() {
        // Add specials display
        const barInfo = document.getElementById('selectedBarInfo');
        if (!barInfo) return;
        
        // Add specials section
        const specialsSection = document.createElement('div');
        specialsSection.className = 'bar-specials';
        specialsSection.innerHTML = `
            <h5>Today's Specials</h5>
            <div class="specials-list">
                <div class="special-item">
                    <span class="special-name">Happy Hour</span>
                    <span class="special-time">4-6 PM</span>
                </div>
                <div class="special-item">
                    <span class="special-name">Live Music</span>
                    <span class="special-time">8 PM</span>
                </div>
            </div>
        `;
        
        barInfo.appendChild(specialsSection);
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

// Initialize Toast integration
document.addEventListener('DOMContentLoaded', () => {
    window.toastIntegration = new ToastIntegration();
});
