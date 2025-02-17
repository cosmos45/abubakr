// scripts/components/header-search.js
import { SearchService } from "../services/search-service.js";

export class HeaderSearch {
  constructor() {
    this.searchService = new SearchService();
    this.init();
  }

  async init() {
    this.searchInput = document.getElementById("search-input");
    this.categorySelect = document.getElementById("category-select");
    this.suggestionsContainer = document.getElementById("search-suggestions");

    if (!this.searchInput || !this.categorySelect) return;

    await this.populateCategories();
    this.setupEventListeners();
  }

  setupEventListeners() {
    let debounceTimer;

    this.searchInput.addEventListener("input", () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => this.handleSearch(), 300);
    });

    document.addEventListener("click", (e) => {
      if (
        !this.searchInput?.contains(e.target) &&
        !this.suggestionsContainer?.contains(e.target)
      ) {
        this.hideSuggestions();
      }
    });
  }

  async populateCategories() {
    try {
      const categories = await this.searchService.getAllCategories();
      this.categorySelect.innerHTML =
        '<option value="all">All categories</option>';

      categories
        .filter((category) => category.is_active === 1)
        .forEach((category) => {
          const option = document.createElement("option");
          option.value = category.id;
          option.textContent = category.name;
          this.categorySelect.appendChild(option);
        });

      // Add change event listener for category selection
      this.categorySelect.addEventListener("change", () => {
        if (this.searchInput.value.trim()) {
          this.handleSearch();
        }
      });
    } catch (error) {
      console.error("Error populating categories:", error);
    }
  }
  handleSearch() {
    const query = this.searchInput.value.trim();
    const categoryId = this.categorySelect.value;

    if (query.length === 0) {
      this.hideSuggestions();
      return;
    }

    const results = this.searchService.search(query, categoryId);
    this.renderSuggestions(results);
  }

  renderSuggestions(results) {
    if (!this.suggestionsContainer) return;

    this.suggestionsContainer.innerHTML = "";

    if (results.length === 0) {
      this.hideSuggestions();
      return;
    }

    results.forEach((product) => {
      const div = document.createElement("div");
      div.className = "suggestion-item";
      div.innerHTML = `
                <img src="${product.imageUrl}" alt="${product.name}">
                <div class="product-info">
                    <div class="product-name">${product.name}</div>
                    <div class="product-price">$${product.price.toFixed(
                      2
                    )}</div>
                </div>
            `;

      div.addEventListener("click", () => {
        window.location.href = `/pages/product/product-page.html?id=${product.id}`;
      });

      this.suggestionsContainer.appendChild(div);
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
