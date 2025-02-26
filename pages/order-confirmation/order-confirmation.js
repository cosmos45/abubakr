import { loadComponent } from '../../scripts/utils/components.js';

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Load header and footer components
        await Promise.all([
            loadComponent('header', '/components/header/header.html'),
            loadComponent('footer', '/components/footer/footer.html')
        ]);
        
        // Add animation to the confirmation icon
        const confirmationIcon = document.querySelector('.confirmation-icon');
        if (confirmationIcon) {
            confirmationIcon.classList.add('animate__animated', 'animate__bounceIn');
        }
        
        // Clear cart data from localStorage since order is complete
        localStorage.removeItem('cart');
        
        console.log('Order confirmation page initialized successfully');
        
    } catch (error) {
        console.error('Error initializing order confirmation page:', error);
        const mainContainer = document.querySelector('main.order-confirmation-wrapper');
        if (mainContainer) {
            mainContainer.innerHTML = '<div class="container"><div class="alert alert-danger">Failed to load confirmation page. Please contact customer support.</div></div>';
        }
    }
});

// Optional: Add a function to redirect back to home after a certain time
function setupAutoRedirect(seconds = 300) {
    const timer = setTimeout(() => {
        window.location.href = '/';
    }, seconds * 1000);
    
    // Allow user to cancel the auto-redirect by interacting with the page
    document.addEventListener('click', () => {
        clearTimeout(timer);
    });
}

// Uncomment the line below if you want to enable auto-redirect
// setupAutoRedirect();
