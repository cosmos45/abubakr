import { Cart } from '../../scripts/modules/cart.js';
import { loadComponent } from '../../scripts/utils/components.js';

let cart;

async function initializeCartPage() {
    try {
        // Load header first with absolute path
        await loadComponent('header', '/abu-bakr-store-v2/components/header/header.html');
        
        // Initialize cart instance
        cart = new Cart();
        await cart.init();

        // Render items on the cart page
        cart.renderCartPage();

        // Hide the cart sidebar
        cart.hideCartSidebar();

        // Initialize mobile menu after header is loaded
        initializeMobileMenu();

    } catch (error) {
        console.error('Error initializing cart page:', error);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initializeCartPage);

function initializeMobileMenu() {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const body = document.body;

    if (!menuToggle || !navMenu) return;

    const overlay = document.createElement('div');
    overlay.className = 'menu-overlay';
    body.appendChild(overlay);

    menuToggle.addEventListener('click', function(e) {
        e.stopPropagation();
        navMenu.classList.toggle('active');
        overlay.classList.toggle('active');
        body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    });

    overlay.addEventListener('click', function() {
        navMenu.classList.remove('active');
        overlay.classList.remove('active');
        body.style.overflow = '';
    });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initializeCartPage);
