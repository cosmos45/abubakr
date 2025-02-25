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
    this.setupEventListeners();
    await this.cart.init();
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
      <div class="suggestion-item" data-product-id="${product.id}">
        <img src="${product.imageUrl}" alt="${product.name}" 
             onerror="this.src='/assets/images/default-product.png'">
        <div class="product-info">
          <div class="product-name">${product.name}</div>
          <div class="product-price">£${product.price.toFixed(2)}</div>
          <div class="cart-controls">
            <div class="quantity-control">
              <button class="qty-btn minus" data-stock-id="${product.id}">−</button>
              <input type="number" value="1" min="1" max="99" readonly data-stock-id="${product.id}">
              <button class="qty-btn plus" data-stock-id="${product.id}">+</button>
            </div>
            <button class="add-to-cart-btn" data-stock-id="${product.id}">Add to Cart</button>
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

  attachSuggestionListeners() {
    // Product click navigation
    this.suggestionsContainer.querySelectorAll('.suggestion-item').forEach(item => {
      const productId = item.dataset.productId;
      
      // Make only the image and product name clickable for navigation
      const productImage = item.querySelector('img');
      const productName = item.querySelector('.product-name');
      
      [productImage, productName].forEach(element => {
        element.addEventListener('click', (e) => {
          e.stopPropagation();
          window.location.href = `/pages/product/product-page.html?id=${productId}`;
        });
      });
    });
    
    // Add to cart button
    this.suggestionsContainer.querySelectorAll('.add-to-cart-btn').forEach(button => {
      button.addEventListener('click', async (e) => {
        e.stopPropagation();
        const stockId = button.dataset.stockId;
        const quantityInput = this.suggestionsContainer.querySelector(`input[data-stock-id="${stockId}"]`);
        const quantity = parseInt(quantityInput.value);
        
        if (quantity >= 1 && quantity <= 99) {
          await this.cart.addToBasket(stockId, quantity);
          // Reset quantity to 1 after adding to cart
          quantityInput.value = "1";
        }
      });
    });
    
    // Quantity buttons
    this.suggestionsContainer.querySelectorAll('.qty-btn').forEach(button => {
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        const stockId = button.dataset.stockId;
        const input = this.suggestionsContainer.querySelector(`input[data-stock-id="${stockId}"]`);
        const currentQty = parseInt(input.value);
        
        if (button.classList.contains('plus') && currentQty < 99) {
          input.value = currentQty + 1;
        } else if (button.classList.contains('minus') && currentQty > 1) {
          input.value = currentQty - 1;
        }
      });
    });
  }
}
