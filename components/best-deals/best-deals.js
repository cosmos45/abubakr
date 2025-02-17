// components/best-deals/best-deals.js
import { ProductCard } from '../product-card/product-card.js';
import { ProductService } from '../../scripts/services/product-service.js';

export async function initializeBestDeals() {
    const slider = document.getElementById('deals-slider');
    if (!slider) {
        console.error('Deals slider element not found');
        return;
    }

    try {
        slider.innerHTML = '<div class="loading">Loading deals...</div>';
        
        const dealsProducts = await ProductService.getDealsProducts();
        console.log('Processed deals products:', dealsProducts);
        
        if (!dealsProducts.length) {
            slider.innerHTML = '<div class="no-deals">No deals available at the moment</div>';
            return;
        }

        slider.innerHTML = '';
        
        for (const product of dealsProducts) {
            const productCard = new ProductCard(product);
            const cardHtml = await productCard.render();
            
            slider.insertAdjacentHTML('beforeend', cardHtml);
        }
        
        // Initialize slider controls and card listeners
        initializeSliderControls();
        initializeCardListeners();
        
    } catch (error) {
        console.error('Error initializing best deals:', error);
        slider.innerHTML = '<div class="error">Failed to load deals</div>';
    }
}
