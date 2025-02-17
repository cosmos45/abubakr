import { Cart } from "../../scripts/modules/cart.js";
import { loadComponent } from "../../scripts/utils/components.js";
import { initFAQ } from "../../components/faq/faq.js";
initFAQ();
let cart;

// In customer-support.js
async function initializeCustomerSupportPage() {
  try {
    // Load header and footer
    await Promise.all([
      loadComponent("header", "/components/header/header.html"),
      loadComponent(
        "locations-section",
        "/components/locations/locations.html"
      ),
      loadComponent("footer", "/components/footer/footer.html"),
      await loadComponent("faq-section", "/components/faq/faq.html"),
    ]);

    // Initialize cart
    cart = new Cart();
    await cart.init();

    // Initialize mobile menu
    initializeMobileMenu();
  } catch (error) {
    console.error("Error initializing customer support page:", error);
  }
}

function initializeMobileMenu() {
  const menuToggle = document.querySelector(".mobile-menu-toggle");
  const navMenu = document.querySelector(".nav-menu");
  const body = document.body;

  if (!menuToggle || !navMenu) return;

  const overlay = document.createElement("div");
  overlay.className = "menu-overlay";
  body.appendChild(overlay);

  menuToggle.addEventListener("click", function (e) {
    e.stopPropagation();
    navMenu.classList.toggle("active");
    overlay.classList.toggle("active");
    body.style.overflow = navMenu.classList.contains("active") ? "hidden" : "";
  });

  overlay.addEventListener("click", function () {
    navMenu.classList.remove("active");
    overlay.classList.remove("active");
    body.style.overflow = "";
  });
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", initializeCustomerSupportPage);
