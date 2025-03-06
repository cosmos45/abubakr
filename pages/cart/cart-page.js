import { Cart } from "../../scripts/modules/cart.js";
import { loadComponent } from "../../scripts/utils/components.js";
import Loader from '../../components/loader/loader.js';
import { GlobalSearch } from "../../scripts/modules/global-search.js";
import { MobileMenu } from "../../scripts/modules/mobile-menu.js";
import { initializeFooter } from "../../components/footer/footer.js";
import { initializeStickyHeader } from "../../scripts/modules/sticky-header.js";
class CartPage {
    constructor() {
        this.cart = new Cart();
        this.loader = new Loader();
        this.globalSearch = new GlobalSearch();

        
        // Cart-specific creative loading messages
        this.loader.customMessages = [
            "Counting your items...",
            "Calculating your savings...",
            "Preparing your cart summary...",
            "Checking for special offers...",
            "Getting your cart ready...",
            "Verifying product availability...",
            "Almost ready for checkout...",
            "Polishing your shopping cart...",
            "Adding up your total...",
            "Finding the best shipping options...",
            "Checking for discount codes...",
            "Organizing your shopping bag...",
            "Preparing a smooth checkout experience...",
            "Making sure everything's in order...",
            "Just a moment while we prepare your cart..."
        ];
    }

    async init() {
        try {
            // Show loader with cart-specific message
            this.loader.show("Loading your shopping cart...");
            
            // Load header and footer
            await Promise.all([
                loadComponent("header", "/components/header/header.html"),
                loadComponent("footer", "/components/footer/footer.html")
            ]);
                // Initialize mobile menu
         const mobileMenu = new MobileMenu();
         mobileMenu.init();

            // Initialize cart
            await this.cart.init();
             // Initialize global search
      await this.globalSearch.init();
            // Render cart page
            this.cart.renderCartPage();
            
            // Initialize mobile menu
            
            // Add event listeners for cart interactions
            this.addCartEventListeners();
            await initializeFooter();

            // Hide loader when everything is ready
            this.loader.hide();
            
        } catch (error) {
            console.error("Error initializing cart page:", error);
            // Hide loader on error
            this.loader.hide();
            
            // Show error message
            const mainContainer = document.querySelector("main.container");
            if (mainContainer) {
                mainContainer.innerHTML = `
                    <div class="alert alert-danger">
                        <i class="fas fa-exclamation-circle"></i>
                        Sorry, we couldn't load your cart. Please try again.
                    </div>
                `;
            }
        }
    }
    addCartEventListeners() {
        // Show loader during quantity updates
        document.addEventListener('click', (e) => {
            // Quantity update buttons
            if (e.target.classList.contains('quantity-btn')) {
                this.loader.showFor(800, "Updating your cart...");
            }
            
            // Remove item button
            if (e.target.classList.contains('remove-item') || 
                e.target.closest('.remove-item')) {
                this.loader.showFor(1000, "Removing item from cart...");
            }
            
            // Checkout button
            if (e.target.classList.contains('checkout-btn')) {
                this.loader.show("Preparing for checkout...");
                // The loader will be hidden when the new page loads
            }
        });
    }


    initializeMobileMenu() {
        const menuToggle = document.querySelector(".mobile-menu-toggle");
        const navMenu = document.querySelector(".nav-menu");
        const body = document.body;

        if (!menuToggle || !navMenu) return;

        const overlay = document.createElement("div");
        overlay.className = "menu-overlay";
        body.appendChild(overlay);

        menuToggle.addEventListener("click", (e) => {
            e.stopPropagation();
            navMenu.classList.toggle("active");
            overlay.classList.toggle("active");
            body.style.overflow = navMenu.classList.contains("active") ? "hidden" : "";
        });

        overlay.addEventListener("click", () => {
            navMenu.classList.remove("active");
            overlay.classList.remove("active");
            body.style.overflow = "";
        });
    }
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
    const loader = new Loader();
    loader.show("Initializing your cart...");
    
    const cartPage = new CartPage();
    cartPage.init().catch(error => {
        console.error("Failed to initialize cart page:", error);
        loader.hide();
    });
});
