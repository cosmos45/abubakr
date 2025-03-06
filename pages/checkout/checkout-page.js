import { CheckoutManager } from '../../scripts/checkout-manager.js';
import { loadComponent } from '../../scripts/utils/components.js';
import Loader from '../../components/loader/loader.js';
import { GlobalSearch } from "../../scripts/modules/global-search.js";
import { MobileMenu } from "../../scripts/modules/mobile-menu.js";
import { initializeFooter } from "../../components/footer/footer.js";

document.addEventListener('DOMContentLoaded', async () => {
    const loader = new Loader();

    try {
        // Show loader immediately
        loader.show("Preparing your checkout experience...");
        await Promise.all([
            loadComponent('header', '/components/header/header.html'),
            loadComponent('footer', '/components/footer/footer.html')
        ]);
        new GlobalSearch();
         // Initialize mobile menu
         const mobileMenu = new MobileMenu();
         mobileMenu.init();
         await initializeFooter();


        const checkoutManager = new CheckoutManager();
        await checkoutManager.init();

        // Initialize global search

        // Hide loader when everything is loaded
        loader.hide();

    } catch (error) {
        console.error('Error initializing checkout page:', error);
        loader.hide();
        
        const errorElement = document.getElementById('card-errors');
        if (errorElement) {
            errorElement.textContent = 'Failed to load checkout page. Please try again.';
            errorElement.classList.remove('d-none');
        }
    }
});
