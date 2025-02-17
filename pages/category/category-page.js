//pages/category-page.js
import { loadComponent } from "../../scripts/utils/components.js";
import { categoryData } from "../../scripts/services/category-service.js";
import { productData } from "../../scripts/services/product-service.js";
import { ProductCard } from "../../components/product-card/product-card.js";
import { Cart } from "../../scripts/modules/cart.js";
import { CategoryManager } from "../../scripts/modules/category-manager.js";
import { HeaderSearch } from "../../scripts/modules/header-search.js";

class CategoryPage {
  constructor() {
    this.categoryId = new URLSearchParams(window.location.search).get("id");
    this.category = null;
    this.products = [];
    this.filters = new Map();
    this.cart = new Cart();
    this.categoryManager = new CategoryManager();
    this.originalProducts = null;
  }

  async init() {
    try {
      // Initialize cart and category manager
      await Promise.all([this.cart.init(), this.categoryManager.init()]);

      // Load components
      await Promise.all([
        loadComponent("header", "/components/header/header.html"),
        loadComponent("footer", "/components/footer/footer.html"),
      ]);

      // Initialize navigation
      this.categoryManager.initializeNavigation();

      // Get category and original products
      this.category = categoryData.getCategory(parseInt(this.categoryId));
      if (!this.category) {
        console.error("Category not found");
        return;
      }

      this.products = productData.getProductsByCategory(
        parseInt(this.categoryId)
      );
      this.originalProducts = [...this.products]; // Store original unfiltered products

      // Render content
      await this.renderCategoryContent();
      this.setupFilters();
      this.initializeCartIcon();
    } catch (error) {
      console.error("Error initializing category page:", error);
    }
  }

  initializeHeaderComponents() {
    const menuToggle = document.querySelector(".mobile-menu-toggle");
    const navMenu = document.querySelector(".nav-menu");
    const body = document.body;

    if (menuToggle && navMenu) {
      const overlay = document.createElement("div");
      overlay.className = "menu-overlay";
      body.appendChild(overlay);

      menuToggle.addEventListener("click", (e) => {
        e.stopPropagation();
        navMenu.classList.toggle("active");
        overlay.classList.toggle("active");
        body.style.overflow = navMenu.classList.contains("active")
          ? "hidden"
          : "";
      });

      overlay.addEventListener("click", () => {
        navMenu.classList.remove("active");
        overlay.classList.remove("active");
        body.style.overflow = "";
      });
    }
  }

  async renderCategoryContent() {
    const container = document.querySelector(".category-page");
    if (!container) return;

    // Clear existing content
    container.innerHTML = "";

    // Render category header
    const headerHtml = `
            <div class="category-header">
                <div class="breadcrumb">
                    <a href="/">Home</a> /
                    ${
                      this.category.parentId
                        ? `<a href="/pages/category/category-page.html?id=${
                            this.category.parentId
                          }">
                            ${
                              categoryData.getCategory(this.category.parentId)
                                ?.name || ""
                            }
                        </a> /`
                        : ""
                    }
                    <span>${this.category.name}</span>
                </div>
                <h1>${this.category.name}</h1>
            </div>
            <div class="category-content">
                <aside class="filters-sidebar">
                    <!-- Filters will be added here -->
                </aside>
                <div class="products-grid">
                    <!-- Products will be added here -->
                </div>
            </div>
        `;
    container.insertAdjacentHTML("beforeend", headerHtml);

    // Render products
    const productsGrid = container.querySelector(".products-grid");
    if (!productsGrid) return;

    if (this.products.length > 0) {
      for (const product of this.products) {
        try {
          const productCard = new ProductCard({
            ...product,
            addToCart: (quantity) =>
              this.cart.addItem({ ...product, quantity }),
          });
          const cardHtml = await productCard.render();
          productsGrid.insertAdjacentHTML("beforeend", cardHtml);
        } catch (error) {
          console.error("Error rendering product card:", error);
        }
      }

      // Initialize product card functionality
      this.initializeQuantityControls();
      this.initializeAddToCart();
    } else {
      productsGrid.innerHTML =
        '<div class="no-products">No products found in this category</div>';
    }
  }

  setupFilters() {
    const filterContainer = document.querySelector(".filters-sidebar");
    if (!filterContainer || !this.products.length) return;

    // Store original products only once
    if (!this.originalProducts) {
      this.originalProducts = [...this.products];
    }

    // Clear existing filters
    filterContainer.innerHTML = "<h2>Filter by</h2>";

    // Reset filters Map
    this.filters = new Map();

    // Collect unique filters from original products
    this.originalProducts.forEach((product) => {
      if (product.choices) {
        Object.entries(product.choices).forEach(([key, values]) => {
          if (!this.filters.has(key)) {
            this.filters.set(key, new Set());
          }
          values.forEach((value) => this.filters.get(key).add(value));
        });
      }
    });

    // Render filter sections
    this.filters.forEach((values, key) => {
      const filterSection = document.createElement("div");
      filterSection.className = "filter-section";
      filterSection.innerHTML = `
                <h3>${key}</h3>
                <div class="filter-options">
                    ${Array.from(values)
                      .map(
                        (value) => `
                        <label class="filter-option">
                            <input type="checkbox" data-filter="${key}" value="${value}">
                            <span>${value}</span>
                        </label>
                    `
                      )
                      .join("")}
                </div>
            `;
      filterContainer.appendChild(filterSection);
    });

    // Single event listener for all filter changes
    filterContainer.addEventListener("change", () => this.applyFilters());
  }

  initializeFilters() {
    const filterOptions = document.querySelectorAll(".filter-option input");

    filterOptions.forEach((option) => {
      option.addEventListener("change", () => {
        this.applyFilters();
      });
    });
  }

  applyFilters() {
    const activeFilters = new Map();
    const productsGrid = document.querySelector(".products-grid");

    // Collect active filters
    document
      .querySelectorAll(".filter-option input:checked")
      .forEach((checkbox) => {
        const filterType = checkbox.dataset.filter;
        const filterValue = checkbox.value;

        if (!activeFilters.has(filterType)) {
          activeFilters.set(filterType, new Set());
        }
        activeFilters.get(filterType).add(filterValue);
      });

    // Use original products if no filters are active
    const productsToRender =
      activeFilters.size === 0
        ? [...this.originalProducts] // Use a copy of the original products
        : this.originalProducts.filter((product) => {
            return Array.from(activeFilters.entries()).every(
              ([filterType, filterValues]) => {
                const productChoices = product.choices?.[filterType];
                return (
                  productChoices &&
                  productChoices.some((choice) => filterValues.has(choice))
                );
              }
            );
          });

    // Render filtered products
    this.renderFilteredProducts(productsToRender);
  }

  async renderFilteredProducts(products) {
    const productsGrid = document.querySelector(".products-grid");
    if (!productsGrid) return;

    // Clear existing products
    productsGrid.innerHTML = "";

    if (products.length === 0) {
      productsGrid.innerHTML =
        '<div class="no-products">No products match the selected filters</div>';
      return;
    }

    // Render each product only once
    const renderedProducts = new Set();

    for (const product of products) {
      if (!renderedProducts.has(product.id)) {
        renderedProducts.add(product.id);
        try {
          const productCard = new ProductCard({
            ...product,
            addToCart: (quantity) =>
              this.cart.addItem({ ...product, quantity }),
          });
          const cardHtml = await productCard.render();
          productsGrid.insertAdjacentHTML("beforeend", cardHtml);
        } catch (error) {
          console.error("Error rendering product card:", error);
        }
      }
    }

    // Initialize controls after all products are rendered
    this.initializeQuantityControls();
    this.initializeAddToCart();
  }

  async renderProducts(products) {
    const productsGrid = document.querySelector(".products-grid");
    if (!productsGrid) return;

    if (products.length === 0) {
      productsGrid.innerHTML =
        '<div class="no-products">No products match the selected filters</div>';
      return;
    }

    // Use Set to prevent duplicates
    const renderedIds = new Set();

    for (const product of products) {
      if (!renderedIds.has(product.id)) {
        renderedIds.add(product.id);
        const productCard = new ProductCard({
          ...product,
          addToCart: (quantity) => this.cart.addItem({ ...product, quantity }),
        });
        const cardHtml = await productCard.render();
        productsGrid.insertAdjacentHTML("beforeend", cardHtml);
      }
    }

    this.initializeQuantityControls();
    this.initializeAddToCart();
  }

  initializeQuantityControls() {
    document.querySelectorAll(".quantity-control").forEach((control) => {
      const input = control.querySelector(".quantity-input");
      if (!input) return;

      const minusBtn = control.querySelector(".minus");
      const plusBtn = control.querySelector(".plus");

      // Set default value if not set
      if (!input.value) {
        input.value = "1";
      }

      minusBtn?.addEventListener("click", () => {
        let value = parseInt(input.value) || 1;
        value = Math.max(1, value - 1);
        input.value = value;
      });

      plusBtn?.addEventListener("click", () => {
        let value = parseInt(input.value) || 1;
        value = Math.min(99, value + 1);
        input.value = value;
      });

      // Add input validation
      input.addEventListener("change", () => {
        let value = parseInt(input.value) || 1;
        value = Math.max(1, Math.min(99, value));
        input.value = value;
      });
    });
  }

  // In Cart class
  async updateItemQuantity(itemId, quantity) {
    try {
      const response = await fetch("/cart/change.js", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: itemId,
          quantity: parseInt(quantity),
        }),
      });

      const cart = await response.json();
      this.updateCartCount(cart.item_count);
      return cart;
    } catch (error) {
      console.error("Error updating cart:", error);
      return null;
    }
  }

  // Add this method to handle add to cart
  initializeAddToCart() {
    document.querySelectorAll(".add-to-cart-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const productCard = e.target.closest(".product-card");
        if (!productCard) return;

        const productId = productCard.dataset.productId;
        const quantityInput = productCard.querySelector(".quantity-input");

        if (!quantityInput) {
          console.warn("Quantity input not found, using default quantity of 1");
          const quantity = 1;
          const product = this.products.find(
            (p) => p.id.toString() === productId
          );
          if (product) {
            this.cart.addItem({ ...product, quantity });
          }
          return;
        }

        const quantity = parseInt(quantityInput.value) || 1;
        const product = this.products.find(
          (p) => p.id.toString() === productId
        );

        if (product) {
          this.cart.addItem({ ...product, quantity });
        }
      });
    });
  }

  updateProductsDisplay(filteredProducts) {
    const productsGrid = document.querySelector(".products-grid");
    if (!productsGrid) return;

    productsGrid.innerHTML = "";

    if (filteredProducts.length > 0) {
      filteredProducts.forEach(async (product) => {
        try {
          const productCard = new ProductCard({
            ...product,
            addToCart: (quantity) =>
              this.cart.addItem({ ...product, quantity }),
          });
          const cardHtml = await productCard.render();
          productsGrid.insertAdjacentHTML("beforeend", cardHtml);
        } catch (error) {
          console.error("Error rendering product card:", error);
        }
      });
    } else {
      productsGrid.innerHTML =
        '<div class="no-products">No products match the selected filters</div>';
    }
  }

  initializeCartIcon() {
    const cartIcon = document.querySelector(".cart-icon");
    cartIcon?.addEventListener("click", (e) => {
      e.preventDefault();
      this.cart.showCart();
    });
  }
}
document.addEventListener("DOMContentLoaded", async () => {
  const categoryPage = new CategoryPage();
  await categoryPage.init();

  // Initialize header search
  new HeaderSearch();
});
