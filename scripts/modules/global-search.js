// scripts/modules/global-search.js
import { SearchService } from "../services/search-service.js";
import { Cart } from "./cart.js";

export class GlobalSearch {
  constructor() {
    this.searchService = new SearchService();
    // Use existing cart instance if available
    this.cart = window.globalCart || Cart.instance || new Cart();
}

  async init(skipCartInit = false) {
    this.searchInput = document.getElementById("search-input");
    this.suggestionsContainer = document.getElementById("search-suggestions");
    this.searchWrapper = document.querySelector(".search-wrapper");

    if (!this.searchInput || !this.suggestionsContainer) {
        console.warn("Search elements not found in DOM");
        return;
    }

    await this.searchService.init();
    
    // Only initialize cart if not already initialized and not skipped
    if (!skipCartInit && !this.cart.initialized) {
        await this.cart.init();
    }
    
    this.setupEventListeners();
}


  showSuggestions() {
    if (this.suggestionsContainer) {
      this.suggestionsContainer.classList.add("active");
      this.suggestionsContainer.style.display = "block";
    }
  }

  hideSuggestions() {
    if (this.suggestionsContainer) {
      this.suggestionsContainer.classList.remove("active");
      this.suggestionsContainer.style.display = "none";
    }
  }

  setupEventListeners() {
    let debounceTimer;
  
    this.searchInput.addEventListener("input", () => {
      const query = this.searchInput.value.trim();
      
      // Show loading animation when typing
      if (query.length >= 3) {
        this.showLoadingAnimation();
      } else {
        this.hideSuggestions();
      }
  
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        if (query.length >= 3) {
          this.handleSearch();
        } else {
          this.hideSuggestions();
        }
      }, 300);
    });
  
    // Add form submit handler
    const searchForm = this.searchInput.closest("form");
    if (searchForm) {
      console.debug("Search form found, adding submit listener");
      searchForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const query = this.searchInput.value.trim();
        
        if (query.length >= 3) {
          console.debug("Form submitted with query:", query);
          this.navigateToSearchResults(query);
        }
      });
    } else {
      console.debug("No search form found");
    }
  
    // Add keydown event for Enter key
    this.searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const query = this.searchInput.value.trim();
        
        if (query.length >= 3) {
          console.debug("Enter key pressed with query:", query);
          this.navigateToSearchResults(query);
        }
      }
    });
  
    // Add click handler for search button
    const searchButton = document.getElementById("search-button");
    if (searchButton) {
      console.debug("Search button found, adding click listener");
      searchButton.addEventListener("click", (e) => {
        e.preventDefault();
        const query = this.searchInput.value.trim();
        if (query.length >= 3) {
          console.debug("Search button clicked with query:", query);
          this.navigateToSearchResults(query);
        }
      });
    } else {
      console.debug("No search button found");
    }
    
    // Focus event to show suggestions if there's text
    this.searchInput.addEventListener("focus", () => {
      const query = this.searchInput.value.trim();
      if (query.length >= 3) {
        this.handleSearch();
      }
    });
  
    // Close suggestions on outside click
    document.addEventListener("click", (e) => {
      if (!this.searchWrapper?.contains(e.target)) {
        this.hideSuggestions();
      }
    });
  }
  
  // Add navigation method
  navigateToSearchResults(query) {
    console.debug("Navigating to search results for query:", query);
    const encodedQuery = encodeURIComponent(query);
    window.location.href = `/pages/category/category-page.html?search=${encodedQuery}`;
  }
  

  showLoadingAnimation() {
    if (!this.suggestionsContainer) return;
    
    this.suggestionsContainer.innerHTML = `
      <div class="search-loading">
        <div class="spinner"></div>
        <span>Searching...</span>
      </div>
    `;
    this.showSuggestions();
  }

  async handleSearch() {
    const query = this.searchInput.value.trim();
    const categoryId = "all"; // Default to all categories
  
    if (query.length < 3) {
      this.hideSuggestions();
      return;
    }
  
    try {
      const results = await this.searchService.search(query, categoryId);
      this.renderSuggestions(results);
    } catch (error) {
      console.error("Search error:", error);
      this.renderError();
    }
  }

  renderSuggestions(results) {
    if (!this.suggestionsContainer) return;
  
    if (results.length === 0) {
      this.suggestionsContainer.innerHTML = `
        <div class="no-results">
          <i class="fas fa-search"></i>
          <p>No products found</p>
          <span>Try a different search term</span>
        </div>
      `;
      this.showSuggestions();
      return;
    }
  
    this.suggestionsContainer.innerHTML = results.map(product => `
      <div class="suggestion-item" data-product-id="${product.id}" data-stock-id="${product.stockId || product.id}">
        <img src="${product.imageUrl}" alt="${product.name}" 
             onerror="this.src='/assets/images/default-product.png'">
        <div class="product-info">
          <div class="product-name">${product.name}</div>
          <div class="product-price">£${parseFloat(product.price).toFixed(2)}</div>
          <div class="product-actions">
          </div>
        </div>
      </div>
    `).join('');
    
    this.attachSuggestionListeners();
    this.showSuggestions();
  }

  // <button class="add-to-cart-btn" data-stock-id="${product.stockId || product.id}">Add to Cart</button>


  renderError() {
    if (!this.suggestionsContainer) return;
    
    this.suggestionsContainer.innerHTML = `
      <div class="search-error">
        <p>Something went wrong. Please try again.</p>
      </div>
    `;
    this.showSuggestions();
  }

  attachSuggestionListeners() {
    // Product click listener (navigate to product page)
    this.suggestionsContainer.querySelectorAll('.suggestion-item').forEach(item => {
      const productInfo = item.querySelector('.product-info');
      if (productInfo) {
        productInfo.addEventListener('click', (e) => {
          // Only navigate if not clicking on add to cart button
          if (!e.target.closest('.product-actions')) {
            const productId = item.dataset.productId;
            window.location.href = `/pages/product/product-page.html?id=${productId}`;
          }
        });
      }
      
      // Product image click listener
      const productImage = item.querySelector('img');
      if (productImage) {
        productImage.addEventListener('click', () => {
          const productId = item.dataset.productId;
          window.location.href = `/pages/product/product-page.html?id=${productId}`;
        });
      }
    });
  
    // Add to cart button listeners
    this.suggestionsContainer.querySelectorAll('.add-to-cart-btn').forEach(button => {
      button.addEventListener('click', async (e) => {
        e.stopPropagation();
        const item = button.closest('.suggestion-item');
        const stockId = button.dataset.stockId;
        const quantity = 1; // Default quantity is 1
        
        // Show loading state
        const originalText = button.textContent;
        button.textContent = 'Adding...';
        button.disabled = true;
        
        try {
          const success = await this.cart.addToBasket(stockId, quantity);
          if (success) {
            button.textContent = 'Added!';
            setTimeout(() => {
              button.textContent = originalText;
              button.disabled = false;
            }, 1500);
          } else {
            button.textContent = 'Failed';
            setTimeout(() => {
              button.textContent = originalText;
              button.disabled = false;
            }, 1500);
          }
        } catch (error) {
          console.error('Error adding to cart:', error);
          button.textContent = 'Failed';
          setTimeout(() => {
            button.textContent = originalText;
            button.disabled = false;
          }, 1500);
        }
      });
    });
  }
}
