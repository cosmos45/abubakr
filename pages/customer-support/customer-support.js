import { Cart } from "../../scripts/modules/cart.js";
import { loadComponent } from "../../scripts/utils/components.js";
import { initFAQ } from "../../components/faq/faq.js";
import { MobileMenu } from "../../scripts/modules/mobile-menu.js";
import { GlobalSearch } from "../../scripts/modules/global-search.js";
import { initializeFooter } from "../../components/footer/footer.js";

initFAQ();
let cart;

// In customer-support.js
async function initializeCustomerSupportPage() {
  try {
    // Load header and footer
    await Promise.all([
      loadComponent("header", "/components/header/header.html"),
      loadComponent("locations-section", "/components/locations/locations.html"),
      loadComponent("footer", "/components/footer/footer.html"),
      await loadComponent("faq-section", "/components/faq/faq.html"),
    ]);    
    
    new GlobalSearch();

    // Initialize mobile menu
    const mobileMenu = new MobileMenu();
    mobileMenu.init();

    // Initialize cart
    cart = new Cart();
    await cart.init();
        await initializeFooter();
    
    // Initialize section scrolling
    initializeSectionScrolling();
    

  } catch (error) {
    console.error("Error initializing customer support page:", error);
  }
}


function initializeSectionScrolling() {
  // Check if there's a hash in the URL
  if (window.location.hash) {
    const targetId = window.location.hash.substring(1);
    const targetElement = document.getElementById(targetId);
    
    if (targetElement) {
      // Wait for components to load
      setTimeout(() => {
        targetElement.scrollIntoView({ behavior: 'smooth' });
      }, 500);
    }
  }}

// Add click handlers for internal links
document.addEventListener('click', (e) => {
  const link = e.target.closest('a');
  if (link && link.href.includes(window.location.pathname) && link.hash) {
    e.preventDefault();
    const targetId = link.hash.substring(1);
    const targetElement = document.getElementById(targetId);
    
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' });
      // Update URL without reloading the page
      history.pushState(null, null, link.hash);
    }
  }
});

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", initializeCustomerSupportPage);
