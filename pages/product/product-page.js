import { loadComponent } from "../../scripts/utils/components.js";
import { Cart } from "../../scripts/modules/cart.js";
import { ProductService } from "../../scripts/services/product-service.js";

class ProductPage {
  constructor() {
    this.productId = new URLSearchParams(window.location.search).get("id");
    this.cart = new Cart();
  }
  async init() {
    try {
      // Load header and footer first
      await Promise.all([
        loadComponent("header", "/components/header/header.html"),
        loadComponent("footer", "/components/footer/footer.html"),
      ]);

      // Initialize cart and ensure proper DOM structure
      await this.cart.init();
      this.moveCartToBody();

      await this.loadProductData();
      this.initializeEventListeners();
      this.initializeSections();
      this.initializeCartIcon();
    } catch (error) {
      console.error("Error initializing product page:", error);
    }
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
    const productId = new URLSearchParams(window.location.search).get("id");
    
    try {
      const products = await ProductService.getDealsProducts(); // Fetch all products
      const product = products.find(p => p.id === productId);
  
      if (!product) throw new Error("Product not found");
  
      // Populate page elements with product data
      document.title = `${product.name} - Store`;
      document.getElementById("product-title").textContent = product.name;
      document.getElementById("product-image").src = product.imageUrl;
      document.getElementById("product-price").textContent = `£${product.price}`;
      document.getElementById("product-description").textContent =
        product.description || "No description available.";
    } catch (error) {
      console.error("Error loading product data:", error);
      document.querySelector(".container").innerHTML =
        "<p>Failed to load product details. Please try again later.</p>";
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
                this.showCartSidebar();
            }
        } catch (error) {
            console.error("Error adding to cart:", error);
            addToCartBtn.textContent = "Error";
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
  const productPage = new ProductPage();
  productPage.init();
});
