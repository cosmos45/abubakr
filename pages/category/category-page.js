//pages/category-page.js
import { loadComponent } from "../../scripts/utils/components.js";
import { categoryData } from "../../scripts/services/category-service.js";
import { ProductService } from "../../scripts/services/product-service.js";
import { ProductCard } from "../../components/product-card/product-card.js";
import { Cart } from "../../scripts/modules/cart.js";
import { CategoryManager } from "../../scripts/modules/category-manager.js";
import { HeaderSearch } from "../../scripts/modules/header-search.js";
import axiosService from '../../scripts/services/axiosService.js';
import { FilterService } from '../../scripts/services/filter-service.js';
import Loader from '../../components/loader/loader.js';
import { ProductServiceCategory } from "../../scripts/services/product-service.js";

class CategoryPage {
  
  constructor() {
    this.categoryId = new URLSearchParams(window.location.search).get("id");
    if (!this.categoryId) {
      console.error("No category ID provided");
      // Redirect to home or show error
      window.location.href = "/";
    }
    this.categoryId = new URLSearchParams(window.location.search).get("id");
    this.category = null;
    this.products = [];
    this.filters = new Map();
    this.cart = null; // Initialize as null first
    this.categoryManager = new CategoryManager();
    this.originalProducts = null;
    this.isLoading = false;
    this.currentPage = 1;
    this.products = [];
    this.originalProducts = [];
    this.pagination = null;
    this.filterData = null;
    this.activeFilters = new Map();
    this.loader = new Loader(); 

  }

  

  async init() {
    try {
      console.debug('Initializing category page for category:', this.categoryId);
      
      // Initialize loader
      this.loader.show("Loading category products...");
      
      this.cart = new Cart();
      await this.cart.init();
      
      // Initialize cart and category manager
      await Promise.all([this.cart.init(), this.categoryManager.init()]);

      // Load components
      await Promise.all([
        loadComponent("header", "/components/header/header.html"),
        loadComponent("footer", "/components/footer/footer.html"),
      ]);

      // Initialize navigation
      this.categoryManager.initializeNavigation();

      // Get category details
      this.category = await categoryData.getCategory(this.categoryId);
      if (!this.category) {
        console.error("Category not found:", this.categoryId);
        this.showError("Category not found");
        this.loader.hide(); // Hide loader on error
        return;
      }

      // Fetch real-time stock data
      await this.fetchCategoryStock();

      // Render content
      await this.renderCategoryContent();
      
      // Fetch and render filters
      await this.fetchAndRenderFilters();
      
      this.initializeCartIcon();
      
      // Hide loader when everything is done
      this.loader.hide();

      this.initializeAddToCart();

    } catch (error) {
      console.error("Error initializing category page:", error);
      this.showError("Failed to load category");
      this.loader.hide(); // Hide loader on error
    }
  }

  async fetchAndRenderFilters() {
    try {
      console.debug('Fetching filter data');
      const filterResponse = await FilterService.getFilters();
      console.log('filters', filterResponse)
      
      if (!filterResponse ) {
        console.error('Invalid filter response:', filterResponse);
        return;
      }
      
      console.debug('Filter data received:', filterResponse);
      this.filterData = filterResponse;
      
      await this.renderFilters();
    } catch (error) {
      console.error('Error fetching and rendering filters:', error);
    }
  }
  

  // Add this method to handle pagination data
async handlePaginationData(stockData) {
  const pagination = stockData.data.stock;
  this.currentPage = pagination.current_page;
  this.totalPages = pagination.last_page;
  this.pageLinks = pagination.links;
  this.products = pagination.data;
  
  await this.renderPagination();
  await this.renderProducts(this.products);
}

// Add pagination rendering method
renderPagination() {
  if (!this.pagination) return;

  const paginationContainer = document.querySelector('.pagination-container');
  if (!paginationContainer) return;

  const { currentPage, lastPage } = this.pagination;
  let paginationHTML = `
    <ul class="pagination">
      <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
        <a class="page-link" href="#" data-page="${currentPage - 1}">Previous</a>
      </li>
  `;

  for (let i = 1; i <= lastPage; i++) {
    paginationHTML += `
      <li class="page-item ${i === currentPage ? 'active' : ''}">
        <a class="page-link" href="#" data-page="${i}">${i}</a>
      </li>
    `;
  }

  paginationHTML += `
    <li class="page-item ${currentPage === lastPage ? 'disabled' : ''}">
      <a class="page-link" href="#" data-page="${currentPage + 1}">Next</a>
    </li>
  </ul>`;

  paginationContainer.innerHTML = paginationHTML;
  this.initializePaginationEvents();
}

initializePaginationEvents() {
  const paginationContainer = document.querySelector('.pagination-container');
  if (!paginationContainer) return;

  paginationContainer.addEventListener('click', async (e) => {
    e.preventDefault();
    const pageLink = e.target.closest('.page-link');
    if (!pageLink) return;

    const newPage = parseInt(pageLink.dataset.page);
    if (newPage === this.currentPage || newPage < 1 || newPage > this.pagination.lastPage) return;

    this.currentPage = newPage;
    await this.fetchCategoryStock();
    await this.renderProducts(this.products);
    
    // Scroll to top of products
    document.querySelector('.products-grid')?.scrollIntoView({ behavior: 'smooth' });
  });
}



// Add pagination controls initialization
initializePaginationControls() {
  const paginationControls = document.querySelector('.pagination-controls');
  if (!paginationControls) return;

  paginationControls.addEventListener('click', async (e) => {
    const button = e.target.closest('button');
    if (!button || button.disabled) return;

    let pageNumber;
    if (button.classList.contains('prev')) {
      pageNumber = this.currentPage - 1;
    } else if (button.classList.contains('next')) {
      pageNumber = this.currentPage + 1;
    } else {
      pageNumber = parseInt(button.dataset.page);
    }

    if (pageNumber && pageNumber !== this.currentPage) {
      await this.loadPage(pageNumber);
    }
  });
}

  
async fetchCategoryStock() {
  try {
    this.loader.show("Fetching products...");
    console.debug('Fetching stock data for category:', this.categoryId);
    const response = await ProductServiceCategory.getStockByCategory(this.categoryId, this.currentPage);
    
    // Log pagination data to verify it's coming through
    console.debug('Pagination data:', response.pagination);
    
    this.products = response.products;
    this.originalProducts = [...this.products];
    this.pagination = response.pagination;
    
    // Render both products and pagination
    await this.renderProducts(this.products);
    this.renderPagination();
    
  } catch (error) {
    console.error('Error fetching category stock:', error);
    throw error;
  } finally {
    this.loader.hide();
  }
}



showLoading() {
  this.isLoading = true;
  this.loader.show("Loading products...");
}

hideLoading() {
  this.isLoading = false;
  this.loader.hide();
}



showError(message) {
  const container = document.querySelector('.category-page');
  if (!container) return;
  
  container.innerHTML = `
    <div class="alert alert-danger" role="alert">
      <i class="fas fa-exclamation-triangle"></i> ${message}
      <p class="mt-2">Please try refreshing the page or contact support if the problem persists.</p>
    </div>
  `;
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
                 <div class="pagination-container">
          <!-- Pagination will be rendered here -->
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

  async initializeFilters() {
    try {
      const filterResponse = await FilterService.getFilters();
      console.log('Filters', filterResponse);
      
      // The API response has a nested data structure
      // filterResponse = {status, message, data}
      // We need to set this.filterData to filterResponse.data
      this.filterData = filterResponse.data;
      await this.renderFilters();
    } catch (error) {
      console.error('Error initializing filters:', error);
    }
  }

  async renderFilters() {
    const filterContainer = document.querySelector(".filters-sidebar");
    if (!filterContainer) return;
  
    filterContainer.innerHTML = '<h2>Filter Products</h2>';
  
    // Make sure we're accessing the correct properties
    if (this.filterData && this.filterData.priceRange && this.filterData.priceRange.length > 0) {
      const priceSection = this.createFilterSection('Price Range', this.filterData.priceRange);
      filterContainer.appendChild(priceSection);
    }
  
    if (this.filterData && this.filterData.categories && this.filterData.categories.length > 0) {
      const categorySection = this.createFilterSection('Categories', this.filterData.categories);
      filterContainer.appendChild(categorySection);
    }
  
    if (this.filterData && this.filterData.filters) {
      Object.entries(this.filterData.filters).forEach(([filterName, values]) => {
        const filterSection = this.createFilterSection(filterName, values);
        filterContainer.appendChild(filterSection);
      });
    }
  
    this.initializeFilterEvents();
  }


  createFilterSection(title, values) {
    const section = document.createElement('div');
    section.className = 'filter-section';
    section.innerHTML = `
      <h3>${title}</h3>
      <div class="filter-options">
        ${values.map(value => `
          <label class="filter-option">
            <input type="checkbox" data-filter="${title}" value="${value}">
            <span>${value}</span>
          </label>
        `).join('')}
      </div>
    `;
    return section;
  }

  initializeFilterEvents() {
    document.querySelectorAll('.filter-option input').forEach(checkbox => {
      checkbox.addEventListener('change', () => this.handleFilterChange());
    });
  }

  async handleFilterChange() {
    this.activeFilters.clear();
    
    document.querySelectorAll('.filter-option input:checked').forEach(checkbox => {
      const filterType = checkbox.dataset.filter;
      const value = checkbox.value;
      
      if (!this.activeFilters.has(filterType)) {
        this.activeFilters.set(filterType, new Set());
      }
      this.activeFilters.get(filterType).add(value);
    });

    await this.applyFilters();
  }



  async applyFilters() {
    this.loader.show("Filtering products...");
    
    let filteredProducts = [...this.originalProducts];

    this.activeFilters.forEach((values, filterType) => {
      filteredProducts = filteredProducts.filter(product => {
        if (filterType === 'Price Range') {
          // Implement price range filtering logic
          return true; // Placeholder
        }
        
        if (filterType === 'Categories') {
          return values.has(product.category);
        }
        
        // Handle dynamic filters
        return product.attributes?.[filterType]?.some(attr => values.has(attr));
      });
    });

    await this.renderProducts(filteredProducts);
    this.loader.hide();
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
  
    console.log('Rendering products:', products);
  
    if (products.length === 0) {
      productsGrid.innerHTML = '<div class="no-products">No products available in this category</div>';
      return;
    }
  
    productsGrid.innerHTML = '';
    const renderedIds = new Set();
  
    for (const product of products) {
      if (!renderedIds.has(product.id)) {
        renderedIds.add(product.id);
        try {
          const productCard = new ProductCard({
            ...product,
            addToCart: (quantity) => this.cart.addItem({ ...product, quantity }),
            imageUrl: product.imageUrl || '/assets/images/placeholder.png'
          });
          const cardHtml = await productCard.render();
          productsGrid.insertAdjacentHTML("beforeend", cardHtml);
          console.log('Rendered product:', product.name);
        } catch (error) {
          console.error('Error rendering product card:', error, product);
        }
      }
    }

  
    this.initializeQuantityControls();
    this.initializeAddToCart();
  }

  
// In CategoryPage class
initializeQuantityControls() {
  document.querySelectorAll(".quantity-control").forEach((control) => {
    const input = control.querySelector(".quantity-input");
    const minusBtn = control.querySelector(".minus");
    const plusBtn = control.querySelector(".plus");
    const productCard = control.closest('.product-card');

    if (!input || !productCard) return;

    // Set default value if not set
    if (!input.value) input.value = "1";

    minusBtn?.addEventListener("click", async () => {
      let value = parseInt(input.value) || 1;
      if (value > 1) {
        value--;
        input.value = value;
        // Update the hidden quantity input if it exists
        const hiddenInput = productCard.querySelector('input[name="quantity"]');
        if (hiddenInput) hiddenInput.value = value;
      }
    });

    plusBtn?.addEventListener("click", async () => {
      let value = parseInt(input.value) || 1;
      if (value < 99) {
        value++;
        input.value = value;
        // Update the hidden quantity input if it exists
        const hiddenInput = productCard.querySelector('input[name="quantity"]');
        if (hiddenInput) hiddenInput.value = value;
      }
    });

    // Add input validation
    input.addEventListener("change", () => {
      let value = parseInt(input.value) || 1;
      value = Math.max(1, Math.min(99, value));
      input.value = value;
      // Update the hidden quantity input if it exists
      const hiddenInput = productCard.querySelector('input[name="quantity"]');
      if (hiddenInput) hiddenInput.value = value;
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
      btn.addEventListener("click", async (e) => {
        e.preventDefault();
        const productCard = e.target.closest(".product-card");
        if (!productCard) return;

        const productId = productCard.dataset.productId;
        const quantityInput = productCard.querySelector(".quantity-input");
        const quantity = parseInt(quantityInput?.value || "1");

        try {
          await this.cart.addToBasket(productId, quantity);
        } catch (error) {
          console.error("Error adding item to cart:", error);
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
  const loader = new Loader();
  loader.show("Initializing Abu Bakr Store...");
  
  try {
    const categoryPage = new CategoryPage();
    await categoryPage.init();

    // Initialize header search
    new HeaderSearch();
  } catch (error) {
    console.error("Error initializing page:", error);
  } finally {
    loader.hide();
  }
});