import { CheckoutManager } from '../../scripts/checkout-manager.js';
import { loadComponent } from '../../scripts/utils/components.js';

document.addEventListener('DOMContentLoaded', async () => {
    try {
        await Promise.all([
            loadComponent('header', '/components/header/header.html'),
            loadComponent('footer', '/components/footer/footer.html')
        ]);

        const checkoutManager = new CheckoutManager();
        await checkoutManager.init();
        
    } catch (error) {
        console.error('Error initializing checkout page:', error);
        const errorElement = document.getElementById('card-errors');
        if (errorElement) {
            errorElement.textContent = 'Failed to load checkout page. Please try again.';
            errorElement.classList.remove('d-none');
        }
    }
});
