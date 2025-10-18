/**
 * Advanced Search Functionality for ThinkDrink
 * Type-ahead search for 16,354+ drinks
 */

class SearchFunctionality {
    constructor() {
        this.searchIndex = [];
        this.searchResults = [];
        this.currentQuery = '';
        this.selectedIndex = -1;
        this.isSearchOpen = false;
        this.init();
    }
    
    init() {
        this.createSearchInterface();
        this.setupSearchIndex();
        this.setupEventListeners();
    }
    
    createSearchInterface() {
        // Add search bar to the header
        const header = document.querySelector('.header-content');
        if (!header) return;
        
        const searchContainer = document.createElement('div');
        searchContainer.className = 'search-container';
        searchContainer.innerHTML = `
            <div class="search-wrapper">
                <div class="search-input-container">
                    <input type="text" 
                           id="drinkSearch" 
                           class="search-input" 
                           placeholder="Search 16,000+ drinks..."
                           autocomplete="off">
                    <div class="search-icon">🔍</div>
                    <button class="clear-search" id="clearSearch" style="display: none;">×</button>
                </div>
                <div class="search-results" id="searchResults"></div>
            </div>
        `;
        
        // Insert after the header title
        const headerLeft = header.querySelector('.header-left');
        if (headerLeft) {
            headerLeft.appendChild(searchContainer);
        }
    }
    
    async setupSearchIndex() {
        try {
            // Load drinks data
            const response = await fetch('/data/drinks.json');
            const drinks = await response.json();
            
            // Create search index
            this.searchIndex = drinks.map(drink => ({
                id: drink.id,
                name: drink.name,
                category: drink.category || 'Cocktail',
                ingredients: drink.ingredients || [],
                description: drink.description || '',
                spirit: drink.spirit || '',
                difficulty: drink.difficulty || '',
                flavor: drink.flavor || '',
                glass: drink.glass || '',
                searchText: this.createSearchText(drink)
            }));
            
            console.log(`Search index created with ${this.searchIndex.length} drinks`);
            
            // Test search functionality
            this.testSearch();
        } catch (error) {
            console.error('Error loading drinks for search:', error);
        }
    }
    
    testSearch() {
        // Test if search is working
        console.log('Testing search functionality...');
        this.performSearch('vodka');
        console.log('Search results:', this.searchResults.length);
    }
    
    createSearchText(drink) {
        // Create comprehensive search text
        const parts = [
            drink.name,
            drink.category,
            drink.spirit,
            drink.difficulty,
            drink.flavor,
            drink.glass,
            drink.description
        ];
        
        // Add ingredients
        if (drink.ingredients && Array.isArray(drink.ingredients)) {
            parts.push(...drink.ingredients);
        }
        
        return parts
            .filter(part => part && typeof part === 'string')
            .join(' ')
            .toLowerCase();
    }
    
    setupEventListeners() {
        const searchInput = document.getElementById('drinkSearch');
        const clearButton = document.getElementById('clearSearch');
        const searchResults = document.getElementById('searchResults');
        
        if (!searchInput) return;
        
        // Search input events
        searchInput.addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });
        
        searchInput.addEventListener('focus', () => {
            this.showSearchResults();
        });
        
        searchInput.addEventListener('blur', (e) => {
            // Delay hiding to allow clicking on results
            setTimeout(() => {
                if (!e.relatedTarget || !e.relatedTarget.closest('.search-results')) {
                    this.hideSearchResults();
                }
            }, 200);
        });
        
        // Keyboard navigation
        searchInput.addEventListener('keydown', (e) => {
            this.handleKeyNavigation(e);
        });
        
        // Clear button
        clearButton?.addEventListener('click', () => {
            this.clearSearch();
        });
        
        // Click outside to close
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-container')) {
                this.hideSearchResults();
            }
        });
    }
    
    handleSearch(query) {
        this.currentQuery = query.trim();
        
        if (this.currentQuery.length === 0) {
            this.hideSearchResults();
            return;
        }
        
        if (this.currentQuery.length < 2) {
            this.showSearchResults();
            this.displaySearchSuggestions();
            return;
        }
        
        // Perform search immediately
        this.performSearch(this.currentQuery);
        this.showSearchResults();
        this.displaySearchResults();
    }
    
    performSearch(query) {
        console.log('Performing search for:', query);
        console.log('Search index length:', this.searchIndex.length);
        
        const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);
        
        this.searchResults = this.searchIndex
            .map(drink => {
                const score = this.calculateSearchScore(drink, searchTerms);
                return { ...drink, score };
            })
            .filter(drink => drink.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 10); // Limit to top 10 results
        
        console.log('Search results found:', this.searchResults.length);
        if (this.searchResults.length > 0) {
            console.log('Top result:', this.searchResults[0]);
        }
    }
    
    calculateSearchScore(drink, searchTerms) {
        let score = 0;
        const searchText = drink.searchText;
        
        searchTerms.forEach(term => {
            // Exact name match (highest priority)
            if (drink.name.toLowerCase().includes(term)) {
                score += 100;
            }
            
            // Name starts with term
            if (drink.name.toLowerCase().startsWith(term)) {
                score += 50;
            }
            
            // Category match
            if (drink.category.toLowerCase().includes(term)) {
                score += 30;
            }
            
            // Spirit match
            if (drink.spirit.toLowerCase().includes(term)) {
                score += 25;
            }
            
            // Ingredient match
            if (drink.ingredients.some(ingredient => 
                ingredient.toLowerCase().includes(term))) {
                score += 20;
            }
            
            // Flavor match
            if (drink.flavor.toLowerCase().includes(term)) {
                score += 15;
            }
            
            // Glass match
            if (drink.glass.toLowerCase().includes(term)) {
                score += 10;
            }
            
            // Description match
            if (drink.description.toLowerCase().includes(term)) {
                score += 5;
            }
        });
        
        return score;
    }
    
    displaySearchSuggestions() {
        // Don't show anything when query is too short
        const searchResults = document.getElementById('searchResults');
        if (!searchResults) return;
        
        searchResults.innerHTML = `
            <div class="search-hint">
                <div class="hint-text">Type to search 16,000+ drinks...</div>
            </div>
        `;
    }
    
    displaySearchResults() {
        const searchResults = document.getElementById('searchResults');
        if (!searchResults) return;
        
        if (this.searchResults.length === 0) {
            searchResults.innerHTML = `
                <div class="no-results">
                    <div class="no-results-icon">🔍</div>
                    <div class="no-results-text">No drinks found for "${this.currentQuery}"</div>
                    <div class="no-results-suggestion">Try a different search term</div>
                </div>
            `;
            return;
        }
        
        searchResults.innerHTML = `
            <div class="search-results-list">
                ${this.searchResults.map((drink, index) => `
                    <div class="search-result-item ${index === this.selectedIndex ? 'selected' : ''}" 
                         data-drink-id="${drink.id}">
                        <div class="result-drink-info">
                            <div class="result-drink-name">${drink.name}</div>
                            <div class="result-drink-details">
                                <span class="result-category">${drink.category}</span>
                                ${drink.spirit ? `<span class="result-spirit">${drink.spirit}</span>` : ''}
                                ${drink.difficulty ? `<span class="result-difficulty">${drink.difficulty}</span>` : ''}
                            </div>
                            <div class="result-drink-description">${drink.description.substring(0, 100)}${drink.description.length > 100 ? '...' : ''}</div>
                        </div>
                        <div class="result-drink-actions">
                            <button class="result-action-btn view-btn" data-drink-id="${drink.id}">
                                <span class="btn-icon">👁️</span>
                            </button>
                            <button class="result-action-btn bar-btn" data-drink-id="${drink.id}">
                                <span class="btn-icon">🍸</span>
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        
        this.setupResultListeners();
    }
    
    setupSuggestionListeners() {
        // No longer needed since we removed popular searches
    }
    
    setupResultListeners() {
        document.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.closest('button')) {
                    const drinkId = item.dataset.drinkId;
                    this.selectDrink(drinkId);
                }
            });
        });
        
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const drinkId = btn.dataset.drinkId;
                this.viewDrink(drinkId);
            });
        });
        
        document.querySelectorAll('.bar-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const drinkId = btn.dataset.drinkId;
                this.findBarsForDrink(drinkId);
            });
        });
    }
    
    handleKeyNavigation(e) {
        const searchResults = document.getElementById('searchResults');
        if (!searchResults || searchResults.style.display === 'none') return;
        
        const resultItems = document.querySelectorAll('.search-result-item');
        
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                this.selectedIndex = Math.min(this.selectedIndex + 1, resultItems.length - 1);
                this.updateSelection();
                break;
                
            case 'ArrowUp':
                e.preventDefault();
                this.selectedIndex = Math.max(this.selectedIndex - 1, -1);
                this.updateSelection();
                break;
                
            case 'Enter':
                e.preventDefault();
                if (this.selectedIndex >= 0 && resultItems[this.selectedIndex]) {
                    const drinkId = resultItems[this.selectedIndex].dataset.drinkId;
                    this.selectDrink(drinkId);
                }
                break;
                
            case 'Escape':
                this.hideSearchResults();
                break;
        }
    }
    
    updateSelection() {
        document.querySelectorAll('.search-result-item').forEach((item, index) => {
            item.classList.toggle('selected', index === this.selectedIndex);
        });
    }
    
    showSearchResults() {
        const searchResults = document.getElementById('searchResults');
        if (searchResults) {
            searchResults.style.display = 'block';
            this.isSearchOpen = true;
        }
        
        // Show clear button
        const clearButton = document.getElementById('clearSearch');
        if (clearButton) {
            clearButton.style.display = 'block';
        }
    }
    
    hideSearchResults() {
        const searchResults = document.getElementById('searchResults');
        if (searchResults) {
            searchResults.style.display = 'none';
            this.isSearchOpen = false;
        }
        
        // Hide clear button
        const clearButton = document.getElementById('clearSearch');
        if (clearButton) {
            clearButton.style.display = 'none';
        }
        
        this.selectedIndex = -1;
    }
    
    clearSearch() {
        const searchInput = document.getElementById('drinkSearch');
        if (searchInput) {
            searchInput.value = '';
            searchInput.focus();
        }
        
        this.hideSearchResults();
        this.currentQuery = '';
        this.searchResults = [];
    }
    
    selectDrink(drinkId) {
        // Find the drink in the search results
        const drink = this.searchResults.find(d => d.id == drinkId) || 
                     this.searchIndex.find(d => d.id == drinkId);
        
        if (drink) {
            // Update the mood system to show this drink
            this.highlightDrinkInResults(drink);
            
            // Hide search results
            this.hideSearchResults();
            
            // Clear search input
            const searchInput = document.getElementById('drinkSearch');
            if (searchInput) {
                searchInput.value = '';
            }
        }
    }
    
    viewDrink(drinkId) {
        // Show drink details modal
        console.log('View drink:', drinkId);
        // Implement drink details modal
    }
    
    findBarsForDrink(drinkId) {
        // Find bars that serve this drink
        console.log('Find bars for drink:', drinkId);
        // Implement bar finding
    }
    
    highlightDrinkInResults(drink) {
        // Scroll to and highlight the drink in the main results
        const drinkCard = document.querySelector(`[data-drink-id="${drink.id}"]`);
        if (drinkCard) {
            drinkCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            drinkCard.classList.add('highlighted');
            
            setTimeout(() => {
                drinkCard.classList.remove('highlighted');
            }, 2000);
        }
    }
}

// Initialize search functionality
document.addEventListener('DOMContentLoaded', () => {
    window.searchFunctionality = new SearchFunctionality();
});
