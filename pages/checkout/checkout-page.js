import { CheckoutManager } from '../../scripts/checkout-manager.js';
import { loadComponent } from '../../scripts/utils/components.js';
import { GlobalSearch } from "../../scripts/modules/global-search.js";
import { MobileMenu } from "../../scripts/modules/mobile-menu.js";
import { initializeFooter } from "../../components/footer/footer.js";

document.addEventListener('DOMContentLoaded', async () => {

    try {
     
        new GlobalSearch();
         // Initialize mobile menu
         const mobileMenu = new MobileMenu();
         mobileMenu.init();
         await initializeFooter();


        const checkoutManager = new CheckoutManager();
        await checkoutManager.init();

        // Initialize global search


    } catch (error) {
        console.error('Error initializing checkout page:', error);
        
        const errorElement = document.getElementById('card-errors');
        if (errorElement) {
            errorElement.textContent = 'Failed to load checkout page. Please try again.';
            errorElement.classList.remove('d-none');
        }
    }
});
