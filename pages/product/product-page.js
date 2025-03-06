import { loadComponent } from "../../scripts/utils/components.js";
import { Cart } from "../../scripts/modules/cart.js";
import { ProductService } from "../../scripts/services/product-service.js";
import Loader from "../../components/loader/loader.js";
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
      // Redirect to home page or show an error message
      window.location.href = "/";
      return;
    }
    this.categoryManager = new CategoryManager();

      this.cart = new Cart();
    this.loader = new Loader();

    // Product-specific creative loading messages
    this.loader.customMessages = [
      "Finding your perfect product...",
      "Getting all the details for you...",
      "Checking product availability...",
      "Loading product information...",
      "Preparing product details...",
      "Gathering product specifications...",
      "Loading high-quality images...",
      "Just a moment while we fetch this item...",
      "Verifying product information...",
      "Checking for special offers on this item...",
      "Retrieving the latest product details...",
      "Preparing a detailed product view...",
      "Looking up product specifications...",
      "Finding related products you might like...",
      "Checking stock levels for this item...",
    ];
  }
  async init() {
    try {
      // Show loader immediately
      this.loader.show("Loading product details...");


      // Load header and footer first
      await Promise.all([
        loadComponent("header", "/components/header/header.html"),
        loadComponent("footer", "/components/footer/footer.html"),
      ]);
      // Current problematic sequence in your code
await this.categoryManager.init();
this.categoryManager.initializeNavigation();
      initializeStickyHeader();

         // Initialize mobile menu
         const mobileMenu = new MobileMenu();
         mobileMenu.init();

      // Initialize cart and ensure proper DOM structure
      await this.cart.init();
      this.moveCartToBody();
      new GlobalSearch();
      await this.loadProductData();
      this.initializeEventListeners();
      this.initializeSections();
      this.initializeCartIcon();
      await initializeFooter();

      // Hide loader when everything is loaded
      this.loader.hide();
     
    } catch (error) {
      console.error("Error initializing product page:", error);
      this.loader.hide();

      // Show error message
      document.querySelector(".container").innerHTML =
        "<div class='alert alert-danger'>Failed to load product details. Please try again later.</div>";
    }
  }
  // Add this method to your ProductPage class
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


  async loadProductData() {
    try {
      this.loader.show("Loading product details...");
      this.setupImageLoader();

      const product = await ProductService.getProductById(this.productId);

      if (!product) {
        throw new Error("Product not found");
      }

      // Populate page elements with product data
      document.title = `${product.name} - Abu Bakr Store`;
      document.getElementById("product-title").textContent = product.name;
      document.getElementById("product-name-breadcrumb").textContent = product.name;
      document.getElementById("product-image").src = product.imageUrl;
      document.getElementById("product-image").alt = product.name;
      document.getElementById("product-price").textContent = `£${product.price}`;
      document.getElementById("product-description").textContent = product.description || "No description available.";

      // Populate product info section
      const infoContent = document.getElementById("product-info-content");
      infoContent.innerHTML = `
        <p>${product.description || "No description available."}</p>
        <ul class="product-features">
          ${Object.entries(product.attributes || {}).map(([key, value]) => `<li>${key}: ${value}</li>`).join("")}
        </ul>
      `;

      // Populate return policy section
      document.getElementById("return-policy-content").innerHTML = `
        <p>We offer a 30-day return policy for all products. Items must be returned in their original condition with all packaging intact.</p>
        <p>For more information, please contact our customer service team.</p>
      `;

      // Populate shipping info section
      document.getElementById("shipping-info-content").innerHTML = `
        <p>Standard delivery: 3-5 business days</p>
        <p>Express delivery: 1-2 business days (additional charges apply)</p>
        <p>Free shipping on orders over £50</p>
      `;

      if (product.sku) {
        document.getElementById("product-sku").textContent = product.sku;
      }

      if (product.oldPrice) {
        document.getElementById("product-old-price").textContent = `£${product.oldPrice}`;
      }

      this.loader.hide();
    } catch (error) {
      console.error("Error loading product data:", error);
      this.loader.hide();
      document.querySelector(".container").innerHTML = "<div class='alert alert-danger'>Failed to load product details. Please try again later.</div>";
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
  initializeEventListeners() {
    const quantityInput = document.querySelector(".quantity-control input");
    const minusBtn = document.querySelector(".quantity-control .minus");
    const plusBtn = document.querySelector(".quantity-control .plus");
    const addToCartBtn = document.querySelector(".add-to-cart-btn");

    minusBtn?.addEventListener("click", () => {
      const currentValue = parseInt(quantityInput.value);
      if (currentValue > 1) quantityInput.value = currentValue - 1;
    });

    plusBtn?.addEventListener("click", () => {
      const currentValue = parseInt(quantityInput.value);
      if (currentValue < 99) quantityInput.value = currentValue + 1;
    });

    addToCartBtn?.addEventListener("click", async () => {
      const quantity = parseInt(quantityInput.value);

      // Show loader with a specific message
      this.loader.show("Adding to your cart...");

      // Disable button and show loading state
      addToCartBtn.disabled = true;
      addToCartBtn.textContent = "Adding...";

      try {
        // Add to cart using the Cart class method
        const success = await this.cart.addToBasket(this.productId, quantity);

        // Update button text based on result
        addToCartBtn.textContent = success ? "Added!" : "Add to Cart";

        // If successful, show the cart
        if (success) {
          this.loader.hide();
          this.showCartSidebar();
        } else {
          this.loader.hide();
        }
      } catch (error) {
        console.error("Error adding to cart:", error);
        addToCartBtn.textContent = "Error";
        this.loader.hide();
      } finally {
        // Re-enable button
        addToCartBtn.disabled = false;

        // Reset button text after delay
        setTimeout(() => {
          addToCartBtn.textContent = "Add to Cart";
        }, 2000);
      }
    });
  }
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  const loader = new Loader();
  loader.show("Initializing product page...");

  const productPage = new ProductPage();
  productPage.init().catch((error) => {
    console.error("Failed to initialize product page:", error);
    loader.hide();
  });
});
