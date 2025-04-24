// components/most-popular/most-popular.js
import { ProductCard } from '../product-card/product-card.js';
import { ProductService } from '../../scripts/services/product-service.js';

export async function initializeMostPopular() {
    const slider = document.getElementById('most-popular-slider');
    if (!slider) {
        console.warn('Most popular slider not found');
        return;
    }

    try {
        slider.innerHTML = '<div class="loading">Loading dairy products...</div>';
        
        const dairyProducts = await ProductService.getDairyProducts();
        
        if (!dairyProducts?.length) {
            slider.innerHTML = '<div class="no-products">No dairy products available</div>';
            return;
        }

        slider.innerHTML = '';
        
        // Batch render products for better performance
        const fragment = document.createDocumentFragment();
        
        for (const product of dairyProducts) {
            const productCard = new ProductCard({
                id: product.id,
                name: product.name,
                price: product.price,
                stock_id: product.id,
                imageUrl: product.imageUrl,
                oldPrice: product.oldPrice,
                size: product.size,
                has_variants: product.has_variants

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
        
        // Update the shop more button to link to Milk & Dairy category
        const shopMoreBtn = document.querySelector('.most-popular-section .shop-more-btn');
        if (shopMoreBtn) {
            shopMoreBtn.href = "/pages/category/category-page.html?name=Milk%20%26%20Dairy";
        }
        
        initMostPopularSlider();
        
    } catch (error) {
        console.error('Error initializing dairy products:', error);
        slider.innerHTML = '<div class="error">Failed to load dairy products</div>';
    }
}


export function initMostPopularSlider() {
    const slider = document.querySelector('#most-popular-slider');
    const prevBtn = document.querySelector('.most-popular-section .prev-btn');
    const nextBtn = document.querySelector('.most-popular-section .next-btn');
    
    if (!slider || !prevBtn || !nextBtn) return;
    
    let currentIndex = 0;
    const cardWidth = 280;
    const cardGap = 24;
    const totalWidth = cardWidth + cardGap;
    
    function updateSliderPosition() {
        if (window.innerWidth <= 768) {
            slider.style.transform = '';
            return;
        }

        const containerWidth = slider.parentElement.offsetWidth - 120;
        const visibleCards = Math.floor(containerWidth / totalWidth);
        const maxIndex = Math.max(0, slider.children.length - visibleCards);
        
        currentIndex = Math.min(currentIndex, maxIndex);
        const offset = currentIndex * totalWidth;
        
        slider.style.transform = `translateX(-${offset}px)`;
        
        prevBtn.disabled = currentIndex === 0;
        nextBtn.disabled = currentIndex >= maxIndex;
    }
    
    prevBtn.addEventListener('click', () => {
        if (currentIndex > 0) {
            currentIndex--;
            updateSliderPosition();
        }
    });
    
    nextBtn.addEventListener('click', () => {
        const containerWidth = slider.parentElement.offsetWidth - 120;
        const visibleCards = Math.floor(containerWidth / totalWidth);
        const maxIndex = Math.max(0, slider.children.length - visibleCards);
        
        if (currentIndex < maxIndex) {
            currentIndex++;
            updateSliderPosition();
        }
    });
    
    updateSliderPosition();
    window.addEventListener('resize', () => {
        currentIndex = 0;
        updateSliderPosition();
    });
}
