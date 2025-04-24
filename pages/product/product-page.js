// pages/product/product-page.js

import { loadComponent } from "../../scripts/utils/components.js";
import { Cart } from "../../scripts/modules/cart.js";
import { ProductService } from "../../scripts/services/product-service.js";
import { GlobalSearch } from "../../scripts/modules/global-search.js";
import { MobileMenu } from "../../scripts/modules/mobile-menu.js";
import { initializeFooter } from "../../components/footer/footer.js";
import { initializeStickyHeader } from "../../scripts/modules/sticky-header.js";
import { CategoryManager } from "../../scripts/modules/category-manager.js";

class ProductPage {
  constructor() {
    const urlParams = new URLSearchParams(window.location.search);
    this.productId = urlParams.get("id");
    if (!this.productId) {
      console.error("No product ID provided in URL");
      window.location.href = "/";
      return;
    }
    this.categoryManager = new CategoryManager();
    this.cart = new Cart();
    this.product = null;
    this.selectedOptions = {};
    this.selectedVariant = null;
    this.hasVariants = false; // Add this flag to track if product has variants

  }

  async init() {
    try {
      // Load header and footer first
      await Promise.all([
        loadComponent("header", "/components/header/header.html"),
        loadComponent("footer", "/components/footer/footer.html"),
      ]);
      
      const globalSearch = new GlobalSearch();
      await globalSearch.init();
      
      await this.categoryManager.init();
      this.categoryManager.initializeNavigation();
      initializeStickyHeader();

      // Initialize mobile menu
      const mobileMenu = new MobileMenu();
      mobileMenu.init();

      // Initialize cart and ensure proper DOM structure
      await this.cart.init();
      this.moveCartToBody();
      await this.loadProductData();
      this.initializeEventListeners();
      this.initializeSections();
      this.initializeCartIcon();
      await initializeFooter();
    } catch (error) {
      console.error("Error initializing product page:", error);
      document.querySelector(".container").innerHTML =
        "<div class='alert alert-danger'>Failed to load product details. Please try again later.</div>";
    }
  }

  setupImageLoader() {
    const productImage = document.getElementById("product-image");
    const imageContainer = document.querySelector(".product-image");

    // Add a loading indicator to the image container
    const imageLoader = document.createElement("div");
    imageLoader.className = "image-loader";
    imageLoader.innerHTML = '<div class="spinner"></div>';
    imageContainer.appendChild(imageLoader);

    // Hide loader when image is loaded
    productImage.addEventListener("load", () => {
      imageLoader.style.display = "none";
      productImage.style.opacity = "1";
    });

    // Show error if image fails to load
    productImage.addEventListener("error", () => {
      imageLoader.style.display = "none";
      productImage.src = "/assets/images/placeholder.jpg";
      productImage.style.opacity = "1";
    });

    // Initially hide the image until it's loaded
    productImage.style.opacity = "0";
    productImage.style.transition = "opacity 0.3s ease";
  }

  async loadProductData() {
    try {
      this.setupImageLoader();
  
      this.product = await ProductService.getProductById(this.productId);
  
      if (!this.product) {
        throw new Error("Product not found");
      }
      
      // Determine if product has variants
      this.hasVariants = this.product.has_variants || 
                        (this.product.choices && this.product.choices.length > 0);
  
      // Populate page elements with product data
      document.title = `${this.product.name} - Abu Bakr Store`;
      
      // Check if elements exist before setting content
      const titleElement = document.getElementById("product-title");
      if (titleElement) titleElement.textContent = this.product.name;
      
      const breadcrumbElement = document.getElementById("product-name-breadcrumb");
      if (breadcrumbElement) breadcrumbElement.textContent = this.product.name;
      
      const productImage = document.getElementById("product-image");
      if (productImage) {
        // Set product image if available
        if (this.product.attachments && this.product.attachments.length > 0) {
          productImage.src = this.product.attachments[0].url;
        } else {
          productImage.src = "/assets/images/placeholder.jpg";
        }
        productImage.alt = this.product.name;
      }
      
      const priceElement = document.getElementById("product-price");
      if (priceElement) priceElement.textContent = `£${this.product.price}`;
      
      const descriptionElement = document.getElementById("product-description");
      if (descriptionElement) descriptionElement.innerHTML = this.product.description || "No description available.";
  
      // Populate product info section
      const infoContent = document.getElementById("product-info-content");
      if (infoContent) {
        infoContent.innerHTML = `
          <p>${this.product.description || "No description available."}</p>
        `;
      }
  
      // Populate return policy section
      const returnPolicyContent = document.getElementById("return-policy-content");
      if (returnPolicyContent) {
        returnPolicyContent.innerHTML = `
          <p>We offer a 30-day return policy for all products. Items must be returned in their original condition with all packaging intact.</p>
          <p>For more information, please contact our customer service team.</p>
        `;
      }
  
      // Populate shipping info section
      const shippingInfoContent = document.getElementById("shipping-info-content");
      if (shippingInfoContent) {
        shippingInfoContent.innerHTML = `
          <p>Standard delivery: 3-5 business days</p>
          <p>Express delivery: 1-2 business days (additional charges apply)</p>
          <p>Free shipping on orders over £50</p>
        `;
      }
  
      // Display SKU
      const skuElement = document.getElementById("product-sku");
      if (skuElement) skuElement.textContent = this.product.sku;
  
      // Display old price if available
      const oldPriceElement = document.getElementById("product-old-price");
      if (oldPriceElement && this.product.comparePrice) {
        oldPriceElement.textContent = `£${this.product.comparePrice}`;
      }
  
      // Initialize selectedOptions as an empty object
      this.selectedOptions = {};
  
      // Render product options if available
      this.renderProductOptions();
      
      // If product doesn't have variants, enable Add to Cart button immediately
      if (!this.hasVariants) {
        this.enableAddToCartButton();
        
        // Set the default variant
        if (this.product.default_variant) {
          this.selectedVariant = this.product.default_variant;
        }
      } else {
        // If product has variants, disable Add to Cart button until selections are made
        this.disableAddToCartButton();
      }
  
    } catch (error) {
      console.error("Error loading product data:", error);
      document.querySelector(".container").innerHTML = "<div class='alert alert-danger'>Failed to load product details. Please try again later.</div>";
    }
  }
  

  renderProductOptions() {
    const optionsContainer = document.getElementById("product-options");
    if (!optionsContainer) return;
    
    // Clear existing options first
    optionsContainer.innerHTML = '';
    
    // Only render options if product has variants
    if (this.hasVariants && this.product.choices && this.product.choices.length > 0) {
      this.product.choices.forEach(choice => {
        const optionHtml = `
          <div class="product-option">
            <h4 class="option-title">${choice.label}</h4>
            <div class="option-items">
              ${choice.items.map(item => `
                <button class="option-item" 
                        data-choice="${choice.pchoice__id || choice.ctype__id}" 
                        data-item="${item.citem__id}">
                  ${item.name}
                </button>
              `).join('')}
            </div>
          </div>
        `;
        optionsContainer.innerHTML += optionHtml;
      });
    
      // Add event listeners to option buttons
      document.querySelectorAll('.option-item').forEach(button => {
        button.addEventListener('click', (e) => {
          const choiceId = e.target.dataset.choice;
          const itemId = e.target.dataset.item;
    
          // Update selection UI - only deactivate buttons in the same choice group
          document.querySelectorAll(`[data-choice="${choiceId}"]`)
            .forEach(btn => btn.classList.remove('active'));
          e.target.classList.add('active');
    
          // Update selected options
          this.selectedOptions[choiceId] = itemId;
          
          // Update variant price and availability
          this.updateVariantPrice();
          
          // Check if all options are selected and enable/disable button accordingly
          this.validateSelections(true);
        });
      });
    }
  
    // Add stock status element
    const priceInfo = document.querySelector('.price-info');
    if (priceInfo) {
      // Remove existing stock status if any
      const existingStatus = priceInfo.querySelector('.stock-status');
      if (existingStatus) existingStatus.remove();
      
      const stockStatus = document.createElement('span');
      stockStatus.className = 'stock-status in-stock';
      stockStatus.innerHTML = '<i class="fas fa-check-circle"></i> In Stock';
      priceInfo.appendChild(stockStatus);
    }
  }
  
  updateVariantPrice() {
    // If product has no variants, use default variant
    if (!this.hasVariants) {
      if (this.product.default_variant) {
        this.selectedVariant = this.product.default_variant;
      }
      return;
    }
    
    const variant = ProductService.findMatchingVariant(this.product, this.selectedOptions);
    
    const priceElement = document.getElementById('product-price');
    const addToCartBtn = document.querySelector('.add-to-cart-btn');
    const stockStatus = document.querySelector('.stock-status');
    
    if (!priceElement || !addToCartBtn || !stockStatus) return;
    
    if (variant) {
      this.selectedVariant = variant;
      priceElement.textContent = `£${variant.price}`;
      
      // Update stock status and button state based on variant availability
      if (variant.is_available) {
        this.enableAddToCartButton();
        stockStatus.className = 'stock-status in-stock';
        stockStatus.innerHTML = '<i class="fas fa-check-circle"></i> In Stock';
      } else {
        this.disableAddToCartButton();
        stockStatus.className = 'stock-status out-of-stock';
        stockStatus.innerHTML = '<i class="fas fa-times-circle"></i> Out of Stock';
      }
    } else {
      // No matching variant found
      this.disableAddToCartButton();
      stockStatus.className = 'stock-status out-of-stock';
      stockStatus.innerHTML = '<i class="fas fa-times-circle"></i> Unavailable';
    }
  }
  
  validateSelections(updateButtonState = false) {
    // If product has no variants, always return true
    if (!this.hasVariants) {
      return true;
    }
    
    // Check if product has choices that need to be selected
    if (this.product.choices && this.product.choices.length > 0) {
      const allChoices = this.product.choices.map(choice => choice.pchoice__id || choice.ctype__id);
      const selectedChoices = Object.keys(this.selectedOptions);
      
      // Check if all required choices have been selected
      const allSelected = allChoices.every(choiceId => 
        selectedChoices.includes(choiceId.toString())
      );
      
      if (updateButtonState) {
        if (allSelected) {
          // Only enable if the selected variant is available
          const variant = ProductService.findMatchingVariant(this.product, this.selectedOptions);
          if (variant && variant.is_available) {
            this.enableAddToCartButton();
          } else {
            this.disableAddToCartButton();
          }
        } else {
          this.disableAddToCartButton();
        }
      }
      
      return allSelected;
    }
    
    return true;
  }
  
  
  enableAddToCartButton() {
    const addToCartBtn = document.querySelector('.add-to-cart-btn');
    if (addToCartBtn) {
      addToCartBtn.disabled = false;
      addToCartBtn.style.opacity = '1';
      addToCartBtn.style.cursor = 'pointer';
    }
  }
  
  disableAddToCartButton() {
    const addToCartBtn = document.querySelector('.add-to-cart-btn');
    if (addToCartBtn) {
      addToCartBtn.disabled = true;
      addToCartBtn.style.opacity = '0.5';
      addToCartBtn.style.cursor = 'not-allowed';
    }
  }

  showToast(message) {
    const toast = document.createElement("div");
    toast.className = "toast-notification";
    toast.innerHTML = `
      <div class="toast-content">
        <i class="fas fa-info-circle"></i>
        <span>${message}</span>
      </div>
    `;
    document.body.appendChild(toast);

    setTimeout(() => toast.remove(), 3000);
  }

  initializeEventListeners() {
    const quantityInput = document.querySelector(".quantity-control input");
    const minusBtn = document.querySelector(".quantity-control .minus");
    const plusBtn = document.querySelector(".quantity-control .plus");
    const addToCartBtn = document.querySelector(".add-to-cart-btn");
  
    if (minusBtn) {
      minusBtn.addEventListener("click", () => {
        const currentValue = parseInt(quantityInput.value);
        if (currentValue > 1) quantityInput.value = currentValue - 1;
      });
    }
  
    if (plusBtn) {
      plusBtn.addEventListener("click", () => {
        const currentValue = parseInt(quantityInput.value);
        if (currentValue < 99) quantityInput.value = currentValue + 1;
      });
    }
  
    if (addToCartBtn) {
      addToCartBtn.addEventListener("click", async () => {
        // For products with variants, validate selections first
        if (this.hasVariants && !this.validateSelections()) {
          const unselectedChoices = this.product.choices.filter(
            choice => !this.selectedOptions[choice.pchoice__id || choice.ctype__id]
          );
          if (unselectedChoices.length > 0) {
            this.showToast(`Please select ${unselectedChoices[0].label}`);
            return;
          }
        }
    
        const quantity = parseInt(quantityInput.value);
        
        // Disable button and show loading state
        addToCartBtn.disabled = true;
        addToCartBtn.textContent = "Adding...";
    
        try {
          // Prepare data for cart
          // If product has variants, use selected variant ID
          // Otherwise, use default variant ID
          const variantId = this.hasVariants 
            ? this.selectedVariant?.pvariant__id 
            : this.product.default_variant?.pvariant__id;
          // Add to cart using the Cart class method
          const success = await this.cart.addToBasket(
            this.productId, 
            quantity, 
            variantId
          );
    
          // Update button text based on result
          addToCartBtn.textContent = success ? "Added!" : "Add to Cart";
        } catch (error) {
          console.error("Error adding to cart:", error);
          addToCartBtn.textContent = "Error";
          this.cart.showToast("Failed to add product to cart", "error");
        } finally {
          // Re-enable button
          if (this.hasVariants) {
            // Only re-enable if all selections are made and variant is available
            if (this.validateSelections() && this.selectedVariant?.is_available) {
              this.enableAddToCartButton();
            } else {
              this.disableAddToCartButton();
            }
          } else {
            // Always enable for products without variants
            this.enableAddToCartButton();
          }
    
          // Reset button text after delay
          setTimeout(() => {
            addToCartBtn.textContent = "Add to Cart";
          }, 2000);
        }
      });
    }
  }
  

  

  initializeSections() {
    document.querySelectorAll(".section-header").forEach((header) => {
      const content = header.nextElementSibling;
      const icon = header.querySelector(".toggle-icon");

      if (header.classList.contains("active")) {
        content.style.display = "block";
      }

      header.addEventListener("click", () => {
        const isActive = header.classList.contains("active");

        // Hide all sections
        document.querySelectorAll(".section-header").forEach((h) => {
          h.classList.remove("active");
          h.querySelector(".toggle-icon").textContent = "+";
          h.nextElementSibling.style.display = "none";
        });

        // Toggle clicked section
        if (!isActive) {
          header.classList.add("active");
          icon.textContent = "−";
          content.style.display = "block";
        }
      });
    });
  }

  hideCartSidebar() {
    const cartSidebar = document.querySelector(".cart-sidebar");
    const cartOverlay = document.querySelector(".cart-overlay");
    if (cartSidebar && cartOverlay) {
      cartSidebar.classList.remove("active");
      cartOverlay.classList.remove("active");
      document.body.style.overflow = "";
      setTimeout(() => {
        cartSidebar.style.visibility = "hidden";
        cartOverlay.style.visibility = "hidden";
      }, 300);
    }
  }

  showCartSidebar() {
    const cartSidebar = document.querySelector(".cart-sidebar");
    const cartOverlay = document.querySelector(".cart-overlay");
    if (cartSidebar && cartOverlay) {
      cartSidebar.style.visibility = "visible";
      cartOverlay.style.visibility = "visible";
      // Force reflow
      cartSidebar.offsetHeight;
      cartSidebar.classList.add("active");
      cartOverlay.classList.add("active");
      document.body.style.overflow = "hidden";
    }
  }

  moveCartToBody() {
    const mainCartElements = document.querySelectorAll(
      "main .cart-sidebar, main .cart-overlay"
    );
    mainCartElements.forEach((element) => element.remove());

    const cartSidebar = document.querySelector(".cart-sidebar");
    const cartOverlay = document.querySelector(".cart-overlay");

    if (cartSidebar && cartSidebar.parentElement !== document.body) {
      document.body.appendChild(cartSidebar);
    }
    if (cartOverlay && cartOverlay.parentElement !== document.body) {
      document.body.appendChild(cartOverlay);
    }

    if (cartSidebar && cartOverlay) {
      // Ensure proper initial state
      cartSidebar.style.visibility = "hidden";
      cartOverlay.style.visibility = "hidden";
      cartSidebar.classList.remove("active");
      cartOverlay.classList.remove("active");
    }
  }

  initializeCartIcon() {
    const cartIcon = document.querySelector(".cart-icon");
    const closeBtn = document.querySelector(".close-cart");
    const overlay = document.querySelector(".cart-overlay");

    cartIcon?.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.cart.showCart();
    });

    closeBtn?.addEventListener("click", () => this.cart.hideCart());
    overlay?.addEventListener("click", () => this.cart.hideCart());
  }
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  const productPage = new ProductPage();
  productPage.init().catch((error) => {
    console.error("Failed to initialize product page:", error);
  });
});


