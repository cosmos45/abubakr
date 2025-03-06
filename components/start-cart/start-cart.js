// components/meat-products/meat-products.js
import { ProductCard } from '../product-card/product-card.js';
import { ProductService } from '../../scripts/services/product-service.js';

export async function initializeMeatProducts() {
    const slider = document.getElementById('meat-products-slider');
    if (!slider) {
        console.warn('Meat products slider not found');
        return;
    }

    try {
        slider.innerHTML = '<div class="loading">Loading meat products...</div>';
        
        const meatProducts = await ProductService.getMeatProducts();
        
        if (!meatProducts?.length) {
            slider.innerHTML = '<div class="no-products">No meat products available</div>';
            return;
        }

        slider.innerHTML = '';
        
        // Batch render products for better performance
        const fragment = document.createDocumentFragment();
        
        for (const product of meatProducts) {
            const productCard = new ProductCard({
                id: product.id,
                name: product.name,
                price: product.price,
                stock_id: product.id,
                imageUrl: product.imageUrl,
                oldPrice: product.oldPrice,
                size: product.size
            });
            
            const cardHtml = await productCard.render();
            const tempContainer = document.createElement('div');
            tempContainer.innerHTML = cardHtml;
            const cardElement = tempContainer.firstElementChild;
            
            // Initialize listeners before adding to DOM
            ProductCard.initializeCardListeners(cardElement);
            fragment.appendChild(cardElement);
        }
        
        slider.appendChild(fragment);
        initMeatProductsSlider();
        
        // Update the "Shop More" button link
        const shopMoreBtn = document.querySelector('.start-cart-section .shop-more-btn');
        if (shopMoreBtn) {
            shopMoreBtn.href = "/pages/category/category-page.html?name=Halal%20Meat";
        }
        
    } catch (error) {
        console.error('Error initializing meat products:', error);
        slider.innerHTML = '<div class="error">Failed to load meat products</div>';
    }
}

export async function initStartCartSlider() {
    const container = document.querySelector('.slider-container');
    const slider = container?.querySelector('.products-slider');
    const prevBtn = container?.querySelector('.prev-btn');
    const nextBtn = container?.querySelector('.next-btn');
    
    if (!slider || !prevBtn || !nextBtn) return;
    
    let currentIndex = 0;
    const cardWidth = 280;
    const cardGap = 24;
    const totalWidth = cardWidth + cardGap;
    
    function updateSliderPosition() {
        const containerWidth = container.offsetWidth - 120;
        const visibleCards = Math.floor(containerWidth / totalWidth);
        const totalCards = slider.children.length;
        const maxIndex = Math.max(0, totalCards - visibleCards);
        
        currentIndex = Math.min(currentIndex, maxIndex);
        const offset = currentIndex * totalWidth;
        
        slider.style.transform = `translateX(-${offset}px)`;
        
        // Update button states
        prevBtn.disabled = currentIndex === 0;
        nextBtn.disabled = currentIndex >= maxIndex;
        prevBtn.style.opacity = currentIndex === 0 ? '0.5' : '1';
        nextBtn.style.opacity = currentIndex >= maxIndex ? '0.5' : '1';
    }
    
    prevBtn.addEventListener('click', () => {
        if (currentIndex > 0) {
            currentIndex--;
            updateSliderPosition();
        }
    });
    
    nextBtn.addEventListener('click', () => {
        const containerWidth = container.offsetWidth - 120;
        const visibleCards = Math.floor(containerWidth / totalWidth);
        const maxIndex = Math.max(0, slider.children.length - visibleCards);
        
        if (currentIndex < maxIndex) {
            currentIndex++;
            updateSliderPosition();
        }
    });
    
    // Initial update
    updateSliderPosition();
    
    // Handle window resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            currentIndex = 0;
            updateSliderPosition();
        }, 100);
    });
}
