import { Cart } from "../../scripts/modules/cart.js";
import { loadComponent } from "../../scripts/utils/components.js";
import { GlobalSearch } from "../../scripts/modules/global-search.js";
import { MobileMenu } from "../../scripts/modules/mobile-menu.js";
import { initializeFooter } from "../../components/footer/footer.js";
import { initializeStickyHeader } from "../../scripts/modules/sticky-header.js";

class CartPage {
    constructor() {}

    async init() {
        try {
            if (!window.globalCart) {
                window.globalCart = new Cart();
                await window.globalCart.init();
            }
            this.cart = window.globalCart;
            
            await Promise.all([
                loadComponent("header", "/components/header/header.html"),
                loadComponent("footer", "/components/footer/footer.html")
            ]);
            
            const mobileMenu = new MobileMenu();
            mobileMenu.init();
            
            this.globalSearch = new GlobalSearch();
            this.globalSearch.cart = this.cart;
            await this.globalSearch.init(true);
            
            this.moveCartToBody();
            
            this.initializeCartIcon();
            
            this.cart.renderCartPage();
            
            this.addCartEventListeners();
            await initializeFooter();
    
        } catch (error) {
            console.error("Error initializing cart page:", error);
            
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

    addCartEventListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('quantity-btn')) {
                // Handle quantity update
            }
            
            if (e.target.classList.contains('remove-item') || 
                e.target.closest('.remove-item')) {
                // Handle item removal
            }
            
            if (e.target.classList.contains('checkout-btn')) {
                // Handle checkout
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

document.addEventListener("DOMContentLoaded", () => {
    const cartPage = new CartPage();
    cartPage.init().catch(error => {
        console.error("Failed to initialize cart page:", error);
    });
});
