// components/best-deals/best-deals.js
import { ProductCard } from '../product-card/product-card.js';
import { ProductService } from '../../scripts/services/product-service.js';


export async function initializeBestDeals() {
    const slider = document.getElementById('deals-slider');
    if (!slider) return;

    try {
        slider.innerHTML = '<div class="loading">Loading deals...</div>';
        
        const dealsProducts = await ProductService.getDealsProducts();
        
        if (!dealsProducts?.length) {
            slider.innerHTML = '<div class="no-deals">No deals available</div>';
            return;
        }

        slider.innerHTML = '';
        
        for (const product of dealsProducts) {
            const productCard = new ProductCard({
                id: product.id,
                name: product.name,
                price: product.price,
                stock_id: product.id, // Using uid as stock_id
                imageUrl: product.imageUrl,
                oldPrice: product.oldPrice,
                size: product.size
            });
            
            const cardHtml = await productCard.render();
            slider.insertAdjacentHTML('beforeend', cardHtml);
        }
        
        const cards = slider.querySelectorAll('.product-card');
        cards.forEach(card => ProductCard.initializeCardListeners(card));
        
        initializeSliderControls();
    } catch (error) {
        console.error('Error initializing best deals:', error);
        slider.innerHTML = '<div class="error">Failed to load deals</div>';
    }
}

