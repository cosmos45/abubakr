// scripts/modules/search.js
import { SearchService } from "../services/search-service.js";

export class Search {
  constructor() {
    this.searchService = new SearchService();
    this.init();
  }

  init() {
    this.searchInput = document.getElementById("searchInput");
    this.categorySelect = document.querySelector(".category-select");
    this.suggestionsContainer = document.getElementById("searchSuggestions");

    this.setupEventListeners();
    this.populateCategories();
  }

  setupEventListeners() {
    if (!this.searchInput) return;

    this.searchInput.addEventListener("input", () => {
      this.handleSearch();
    });

    this.searchInput.addEventListener("focus", () => {
      if (this.searchInput.value) {
        this.showSuggestions();
      }
    });

    document.addEventListener("click", (e) => {
      if (
        !this.searchInput.contains(e.target) &&
        !this.suggestionsContainer.contains(e.target)
      ) {
        this.hideSuggestions();
      }
    });
  }

  populateCategories() {
    if (!this.categorySelect) return;

    const categories = this.searchService.getAllCategories();
    categories.forEach((category) => {
      const option = document.createElement("option");
      option.value = category.id;
      option.textContent = category.name;
      this.categorySelect.appendChild(option);
    });
  }

  handleSearch() {
    const query = this.searchInput.value.trim();
    const categoryId = this.categorySelect.value;

    if (query.length === 0) {
      this.hideSuggestions();
      return;
    }

    const results = this.searchService.searchProducts(query, categoryId);
    this.renderSuggestions(results);
  }

  renderSuggestions(results) {
    if (!this.suggestionsContainer) return;

    this.suggestionsContainer.innerHTML = "";

    if (results.length === 0) {
      this.suggestionsContainer.style.display = "none";
      return;
    }

    results.forEach((product) => {
      const suggestionItem = document.createElement("div");
      suggestionItem.className = "suggestion-item";
      suggestionItem.innerHTML = `
                <img src="${product.imageUrl}" alt="${product.name}">
                <div class="product-info">
                    <div class="product-name">${product.name}</div>
                    <div class="product-description">
                        ${
                          product.description ||
                          "I'm a product description. This is a great place to 'sell' your product and grab buyers' attention."
                        }
                    </div>
                </div>
            `;

      suggestionItem.addEventListener("click", () => {
        window.location.href = `/pages/product/product-page.html?id=${product.id}`;
      });

      this.suggestionsContainer.appendChild(suggestionItem);
    });

    this.showSuggestions();
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
}
