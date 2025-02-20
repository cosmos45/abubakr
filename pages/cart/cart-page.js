import { Cart } from "../../scripts/modules/cart.js";
import { loadComponent } from "../../scripts/utils/components.js";

class CartPage {
    constructor() {
        this.cart = new Cart();
    }

    async init() {
        try {
            // Load header and footer
            await Promise.all([
                loadComponent("header", "/components/header/header.html"),
                loadComponent("footer", "/components/footer/footer.html")
            ]);

            // Initialize cart
            await this.cart.init();
            
            // Render cart page
            this.cart.renderCartPage();
            
            // Initialize mobile menu
            this.initializeMobileMenu();
            
        } catch (error) {
            console.error("Error initializing cart page:", error);
        }
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
    const cartPage = new CartPage();
    cartPage.init();
});
