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
import { ProductServiceCategory } from "../../scripts/services/product-service.js";
import { GlobalSearch } from "../../scripts/modules/global-search.js";
import { initializeFooter } from "../../components/footer/footer.js";
import { initializeStickyHeader } from "../../scripts/modules/sticky-header.js";
import { MobileMenu } from '../../scripts/modules/mobile-menu.js';

class CategoryPage {
  
  constructor() {
    this.categoryName = new URLSearchParams(window.location.search).get("name");
    if (!this.categoryName) {
      console.error("No category name provided");
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
    this.globalSearch = new GlobalSearch();


  }

  

  async init() {
    try {
      console.debug(`Initializing category page for: ${this.categoryName}`);      
      // Initialize loader
      
      this.cart = new Cart();
      await this.cart.init();
      await this.globalSearch.init();

      const category = await categoryData.getCategoryByName(this.categoryName);
      if (!category) {
        console.error(`Category not found: ${this.categoryName}`);
        this.showError("Category not found");
        return;
      }
      
      // Initialize cart and category manager
      await Promise.all([this.cart.init(), this.categoryManager.init()]);

      // Load components
      await Promise.all([
        loadComponent("header", "/components/header/header.html"),
        loadComponent("footer", "/components/footer/footer.html"),
      ]);
      initializeStickyHeader();
        // Initialize mobile menu
               const mobileMenu = new MobileMenu();
               mobileMenu.init();



      // Initialize navigation
      this.categoryManager.initializeNavigation();

       // Get category details
       this.category = await categoryData.getCategoryByName(this.categoryName);
       if (!this.category) {
         console.error("Category not found:", this.categoryName);
         this.showError("Category not found");
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

      this.initializeAddToCart();
      await initializeFooter();

    } catch (error) {
      console.error("Error initializing category page:", error);
      this.showError("Failed to load category");
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
  const paginationContainer = document.querySelector('.pagination-container');
  if (!paginationContainer) {
    console.error("Pagination container not found");
    return;
  }
  
  if (!this.pagination) {
    console.error("Pagination data is missing");
    return;
  }

  const { currentPage, lastPage } = this.pagination;
  console.log("Rendering pagination:", { currentPage, lastPage });

  if (lastPage <= 1) {
    paginationContainer.innerHTML = ""; // Hide pagination if only one page
    return;
  }

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
  const paginationContainer = document.querySelector(".pagination-container");
  
  if (!paginationContainer) {
    console.error("Pagination container not found when initializing events");
    return;
  }

  paginationContainer.addEventListener("click", async (e) => {
    e.preventDefault();
    
    const pageLink = e.target.closest(".page-link");
    if (!pageLink) return;

    const newPage = parseInt(pageLink.dataset.page);
    console.log("Pagination clicked, new page:", newPage);
    
    if (isNaN(newPage) || newPage === this.currentPage || newPage < 1 || 
        (this.pagination && newPage > this.pagination.lastPage)) {
      return;
    }

    this.currentPage = newPage;
    console.log("Setting current page to:", this.currentPage);

    // Fetch products for the new page
    await this.fetchCategoryStock();

    // Scroll to top of products
    document.querySelector(".products-grid")?.scrollIntoView({ behavior: "smooth" });
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
    console.debug('Fetching stock data for category:', this.categoryName);

    const response = await ProductServiceCategory.getStockByCategory(this.categoryName, this.currentPage);
    console.log("Stock response:", response);

    if (response && response.products) {
      this.products = response.products;
      this.pagination = response.pagination;
      console.log("Pagination data:", this.pagination);

      // Render products and pagination
      await this.renderProducts(this.products);
      this.renderPagination();
    } else {
      console.error("No products found for the category.");
    }
  } catch (error) {
    console.error('Error fetching category stock:', error);
  } 
}






showLoading() {
  this.isLoading = true;
}

hideLoading() {
  this.isLoading = false;
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
          ${this.category.parentId ? `<a href="/pages/category/category-page.html?id=${this.category.parentId}">
            ${categoryData.getCategory(this.category.parentId)?.name || ""}
          </a> /` : ""}
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
      <div class="pagination-container">
        <!-- Pagination will be rendered here -->
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
              this.cart.addItemUI({ ...product, quantity }),
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
    
    filterContainer.innerHTML = '<h2>Filters</h2>';
    
    // Only display Categories filter
    if (this.filterData && this.filterData.categories && this.filterData.categories.length > 0) {
      const categoryNames = this.filterData.categories.map(category => category.name);
      const categorySection = this.createFilterSection('Categories', categoryNames);
      filterContainer.appendChild(categorySection);
    }
    
    // Only display Size filter
    if (this.filterData && this.filterData.sFilters && this.filterData.sFilters.Size) {
      const sizeSection = this.createFilterSection('Size', this.filterData.sFilters.Size);
      filterContainer.appendChild(sizeSection);
    }
    
    // Initialize mobile filters
    this.initializeMobileFilters();
    
    this.initializeFilterEvents();
  }

  initializeFilterSections() {
    // Add collapsible functionality to desktop filter sections
    document.querySelectorAll('.filter-section').forEach(section => {
      // Create header element for each section
      const sectionTitle = section.querySelector('h3');
      if (!sectionTitle) return;
      
      const header = document.createElement('div');
      header.className = 'filter-section-header';
      
      // Move the title into the header
      sectionTitle.parentNode.insertBefore(header, sectionTitle);
      header.appendChild(sectionTitle);
      
      // Add toggle icon
      const toggleIcon = document.createElement('span');
      toggleIcon.className = 'filter-toggle-icon';
      toggleIcon.innerHTML = '<i class="fas fa-chevron-down"></i>';
      header.appendChild(toggleIcon);
      
      // Add click event
      header.addEventListener('click', () => {
        section.classList.toggle('collapsed');
      });
    });
    
    // Initialize mobile filter functionality
    this.initializeMobileFilters();
  }
  initializeMobileFilters() {
    // Create mobile filter button if it doesn't exist
    if (!document.querySelector('.mobile-filter-button')) {
      const categoryPage = document.querySelector('.category-page');
      if (!categoryPage) return;
      
      const mobileFilterButton = document.createElement('button');
      mobileFilterButton.className = 'mobile-filter-button';
      mobileFilterButton.innerHTML = '<i class="fas fa-filter"></i> Filter Products';
      
      // Insert after category header if it exists, otherwise at the beginning
      const categoryHeader = document.querySelector('.category-header');
      if (categoryHeader) {
        categoryHeader.after(mobileFilterButton);
      } else {
        categoryPage.prepend(mobileFilterButton);
      }
      
      // Create mobile filter drawer
      const mobileFilterDrawer = document.createElement('div');
      mobileFilterDrawer.className = 'mobile-filter-drawer';
      mobileFilterDrawer.innerHTML = `
        <div class="mobile-filter-content">
          <div class="mobile-filter-header">
            <h2>Filters</h2>
            <button class="mobile-filter-close">&times;</button>
          </div>
          <div class="mobile-filter-body">
            <!-- Filter dropdowns will be added here -->
          </div>
          <div class="mobile-filter-actions">
            <button class="mobile-filter-clear">Clear All</button>
            <button class="mobile-filter-apply">Apply Filters</button>
          </div>
        </div>
      `;
      document.body.appendChild(mobileFilterDrawer);
      
      // Create mobile filter dropdowns
      this.createMobileFilterDropdowns();
      
      // Event listeners
      mobileFilterButton.addEventListener('click', () => {
        mobileFilterDrawer.classList.add('open');
        document.body.style.overflow = 'hidden';
      });
      
      const closeButton = mobileFilterDrawer.querySelector('.mobile-filter-close');
      closeButton.addEventListener('click', () => {
        mobileFilterDrawer.classList.remove('open');
        document.body.style.overflow = '';
      });
      
      // Close when clicking outside the content
      mobileFilterDrawer.addEventListener('click', (e) => {
        if (e.target === mobileFilterDrawer) {
          mobileFilterDrawer.classList.remove('open');
          document.body.style.overflow = '';
        }
      });
      
      // Clear all filters
      const clearButton = mobileFilterDrawer.querySelector('.mobile-filter-clear');
      clearButton.addEventListener('click', () => {
        const checkboxes = mobileFilterDrawer.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
          checkbox.checked = false;
        });
      });
      
      // Apply filters
      const applyButton = mobileFilterDrawer.querySelector('.mobile-filter-apply');
      applyButton.addEventListener('click', () => {
        // Sync mobile filter selections to desktop filters
        this.syncMobileFiltersToDesktop();
        
        // Trigger filter application
        this.handleFilterChange();
        
        // Close drawer
        mobileFilterDrawer.classList.remove('open');
        document.body.style.overflow = '';
      });
    }
  }
  

  createMobileFilterDropdowns() {
    const mobileFilterBody = document.querySelector('.mobile-filter-body');
    if (!mobileFilterBody || !this.filterData) return;
    
    mobileFilterBody.innerHTML = '';
    
    // Add Categories dropdown if available
    if (this.filterData.categories && this.filterData.categories.length > 0) {
      const categoryNames = this.filterData.categories.map(category => category.name);
      const categoryDropdown = this.createMobileFilterDropdown('Categories', categoryNames);
      mobileFilterBody.appendChild(categoryDropdown);
    }
    
    // Add Size dropdown if available
    if (this.filterData.sFilters && this.filterData.sFilters.Size) {
      const sizeDropdown = this.createMobileFilterDropdown('Size', this.filterData.sFilters.Size);
      mobileFilterBody.appendChild(sizeDropdown);
    }
    
    // Add any other filter types you have
  }
  
  // Create mobile filter dropdown
  createMobileFilterDropdown(title, values) {
    const dropdown = document.createElement('div');
    dropdown.className = 'mobile-filter-dropdown';
    
    // Check if values is an array, if not, convert it to one
    const valuesArray = Array.isArray(values) ? values : Object.values(values);
    
    dropdown.innerHTML = `
      <div class="mobile-filter-dropdown-header">
        <h3>${title}</h3>
        <i class="fas fa-chevron-down"></i>
      </div>
      <div class="mobile-filter-dropdown-content">
        ${valuesArray.map(value => `
          <label class="filter-option">
            <input type="checkbox" data-filter="${title}" value="${value}">
            <span>${value}</span>
          </label>
        `).join('')}
      </div>
    `;
    
    // Add toggle functionality
    const header = dropdown.querySelector('.mobile-filter-dropdown-header');
    header.addEventListener('click', () => {
      dropdown.classList.toggle('open');
      const icon = header.querySelector('i');
      if (dropdown.classList.contains('open')) {
        icon.classList.remove('fa-chevron-down');
        icon.classList.add('fa-chevron-up');
      } else {
        icon.classList.remove('fa-chevron-up');
        icon.classList.add('fa-chevron-down');
      }
    });
    
    return dropdown;
  }
  
  // Sync mobile filters to desktop
  syncMobileFiltersToDesktop() {
    const mobileCheckboxes = document.querySelectorAll('.mobile-filter-dropdown input[type="checkbox"]');
    
    mobileCheckboxes.forEach(mobileCheckbox => {
      const filter = mobileCheckbox.dataset.filter;
      const value = mobileCheckbox.value;
      const desktopCheckbox = document.querySelector(`.filters-sidebar input[data-filter="${filter}"][value="${value}"]`);
      
      if (desktopCheckbox) {
        desktopCheckbox.checked = mobileCheckbox.checked;
      }
    });
  }
  
  // Sync desktop filters to mobile
  syncDesktopFiltersToMobile() {
    const desktopCheckboxes = document.querySelectorAll('.filters-sidebar input[type="checkbox"]');
    
    desktopCheckboxes.forEach(desktopCheckbox => {
      const filter = desktopCheckbox.dataset.filter;
      const value = desktopCheckbox.value;
      const mobileCheckbox = document.querySelector(`.mobile-filter-dropdown input[data-filter="${filter}"][value="${value}"]`);
      
      if (mobileCheckbox) {
        mobileCheckbox.checked = desktopCheckbox.checked;
      }
    });
  }
  


  createFilterSection(title, values) {
    const section = document.createElement('div');
    section.className = 'filter-section';
    
    // Check if values is an array, if not, convert it to one
    const valuesArray = Array.isArray(values) ? values : Object.values(values);
    
    section.innerHTML = `
      <h3>${title}</h3>
      <div class="filter-options">
        ${valuesArray.map(value => `
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
    document.querySelectorAll(".filter-option input").forEach((checkbox) => {
      checkbox.addEventListener("change", () => this.handleFilterChange());
    });
  }
  

  async handleFilterChange() {
    this.activeFilters.clear();
  
    document.querySelectorAll(".filter-option input:checked").forEach((checkbox) => {
      const filterType = checkbox.dataset.filter;
      const value = checkbox.value;
  
      if (!this.activeFilters.has(filterType)) {
        this.activeFilters.set(filterType, new Set());
      }
      this.activeFilters.get(filterType).add(value);
    });
  
    await this.applyFilters();
  }
  
  
  

  async getFilteredStockByCategory(page = 1, filters = {}) {
    try {
      // Construct the params object for the API request
      const params = {
        page: page,
        ...filters // This will include categories and choices parameters
      };
      
      console.log("API request params:", params);
      
      const response = await axiosService.get(`/commerce/stock`, { params });
      
      if (response.status && response.data.stock) {
        const pagination = {
          currentPage: response.data.stock.current_page,
          lastPage: response.data.stock.last_page,
          total: response.data.stock.total,
          perPage: response.data.stock.per_page,
        };
    
        const products = response.data.stock.data.map((stock) => ({
          id: stock.uid,
          name: stock.name,
          price: stock.price,
          stock_id: stock.uid,
          imageUrl: stock.attachments?.[0]?.path || "",
          oldPrice: stock.retail_price !== stock.price ? stock.retail_price : null,
          size: stock.size,
          attributes: stock.attributes || {},
        }));
    
        return { products, pagination };
      }
      
      return { products: [], pagination: null };
    } catch (error) {
      console.error("Error fetching filtered stock:", error);
      throw error;
    }
  }
  
async applyFilters() {
  try {
    
    // Create separate parameters for different filter types
    const filterParams = {};
    
    // Track selected categories separately
    const selectedCategories = [];
    // Always include the current category unless another is selected
    selectedCategories.push(this.categoryName);
    
    // Process all active filters by type
    this.activeFilters.forEach((values, filterType) => {
      if (filterType === 'Size' || filterType === 'Colour') {
        // Size and Colour go into choices parameter
        if (!filterParams.choices) {
          filterParams.choices = [];
        }
        filterParams.choices.push(...Array.from(values));
      } else if (filterType === 'Categories') {
        // Handle category selection - replace the current category
        if (values.size > 0) {
          // Clear the default category and use selected ones
          selectedCategories.length = 0;
          selectedCategories.push(...Array.from(values));
        }
      } else {
        // For other filter types, add as separate parameters
        filterParams[filterType] = Array.from(values).join(',');
      }
    });
    
    // Convert choices array to comma-separated string
    if (filterParams.choices && filterParams.choices.length > 0) {
      filterParams.choices = filterParams.choices.join(',');
    }
    
    // Set the categories parameter
    if (selectedCategories.length > 0) {
      filterParams.categories = selectedCategories.join(',');
    }
    
    console.debug("Filter parameters:", filterParams);
    
    // Fetch filtered products from API
    const response = await this.getFilteredStockByCategory(
      this.currentPage,
      filterParams
    );
    
    if (response && response.products) {
      this.products = response.products;
      this.pagination = response.pagination;
      
      // Render filtered products and pagination
      await this.renderProducts(this.products);
      this.renderPagination();
    } else {
      console.error("Invalid response for filtered products");
    }
  } catch (error) {
    console.error("Error applying filters:", error);
  } 
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
  
  try {
    const categoryPage = new CategoryPage();
    await categoryPage.init();

    // Initialize header search
    new HeaderSearch();
  } catch (error) {
    console.error("Error initializing page:", error);
  } 
});