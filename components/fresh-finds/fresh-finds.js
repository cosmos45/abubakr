// components/fresh-finds/fresh-finds.js
import { ProductCard } from '../product-card/product-card.js';
import { ProductService } from '../../scripts/services/product-service.js';

export async function initializeFreshFinds() {
    const slider = document.getElementById("fresh-finds-slider");
    if (!slider) return;
  
    try {
      slider.innerHTML = '<div class="loading">Loading Chinese cuisine products...</div>';
      
      // Use Chinese products instead of Special Offers
      const products = await ProductService.getChineseProducts();
      console.log(products)
      
      if (!products?.length) {
        slider.innerHTML = '<div class="no-products">No Chinese cuisine products available</div>';
        return;
      }
  
      slider.innerHTML = "";
      
      // Batch render products for better performance
      const fragment = document.createDocumentFragment();
      
      for (const product of products) {
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
        const tempContainer = document.createElement("div");
        tempContainer.innerHTML = cardHtml;
        const cardElement = tempContainer.firstElementChild;
        
        // Initialize listeners before adding to DOM
        ProductCard.initializeCardListeners(cardElement);
        fragment.appendChild(cardElement);
      }
      
      slider.appendChild(fragment);
      
      // Update the section title
      const sectionTitle = document.querySelector(".fresh-finds-section .section-title");
      if (sectionTitle) {
        sectionTitle.textContent = "Chinese Cuisine";
      }
      
      // Update the "Continue Shopping" button text
      const continueShoppingBtn = document.querySelector(".fresh-finds-section .continue-shopping");
      if (continueShoppingBtn) {
        continueShoppingBtn.textContent = "Shop Chinese Cuisine";
      }
      
      initializeFreshFindsSlider();
    } catch (error) {
      console.error("Error initializing Chinese cuisine products:", error);
      slider.innerHTML = '<div class="error">Failed to load Chinese cuisine products</div>';
    }
  }
  

export function initFreshFindsSlider() {
    const slider = document.querySelector('#fresh-finds-slider');
    const prevBtn = document.querySelector('.fresh-finds-section .prev-btn');
    const nextBtn = document.querySelector('.fresh-finds-section .next-btn');
    
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
