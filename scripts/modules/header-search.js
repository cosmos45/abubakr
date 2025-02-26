// scripts/components/header-search.js
import { SearchService } from "../services/search-service.js";
import { Cart } from "../modules/cart.js";

export class HeaderSearch {
  constructor() {
    this.searchService = new SearchService();
    this.cart = new Cart();
    this.init();
  }

  async init() {
    this.searchInput = document.getElementById("search-input");
    this.categorySelect = document.getElementById("category-select");
    this.suggestionsContainer = document.getElementById("search-suggestions");
    this.searchWrapper = document.querySelector(".search-wrapper");

    if (!this.searchInput || !this.categorySelect) return;

    await this.populateCategories();
    await this.cart.init();
    this.setupEventListeners();
  }

  async populateCategories() {
    try {
      const categories = await this.searchService.getAllCategories();
      
      // Clear existing options
      this.categorySelect.innerHTML = '<option value="all">All categories</option>';

      // Add categories that are active
      categories
        .filter(category => category.is_active === 1)
        .forEach(category => {
          const option = document.createElement("option");
          option.value = category.id;
          option.textContent = category.name;
          this.categorySelect.appendChild(option);
        });

      // Add change event listener for category selection
      this.categorySelect.addEventListener("change", () => {
        const query = this.searchInput.value.trim();
        if (query.length >= 3) {
          this.handleSearch();
        }
      });
    } catch (error) {
      console.error("Error populating categories:", error);
      this.categorySelect.innerHTML = '<option value="all">All categories</option>';
    }
  }

  showSuggestions() {
    if (this.suggestionsContainer) {
      this.suggestionsContainer.style.display = "block";
    }
  }

  hideSuggestions() {
    if (this.suggestionsContainer) {
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

    // Handle category change
    this.categorySelect.addEventListener("change", () => {
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
    const categoryId = this.categorySelect.value;

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
          <p>No products found</p>
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
          <div class="product-price">£${product.price.toFixed(2)}</div>
          <div class="product-actions">
            <button class="add-to-cart-btn" data-stock-id="${product.stockId || product.id}">Add to Cart</button>
          </div>
        </div>
      </div>
    `).join('');
    
    this.attachSuggestionListeners();
    this.showSuggestions();
  }
  
  
  
  

  renderError() {
    if (!this.suggestionsContainer) return;
    
    this.suggestionsContainer.innerHTML = `
      <div class="search-error">
        <p>Something went wrong. Please try again.</p>
      </div>
    `;
    this.showSuggestions();
  }

  // Modify the attachSuggestionListeners function in header-search.js
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
