// components/special-offers/special-offers.js
import { ProductCard } from "../product-card/product-card.js";
import { ProductService } from "../../scripts/services/product-service.js";

export async function initializeSpecialOffers() {
  const slider = document.getElementById("special-offers-slider");
  if (!slider) {
    console.warn("Special offers slider not found");
    return;
  }

  try {
    slider.innerHTML = '<div class="loading">Loading special offers...</div>';

    const specialOffersProducts = await ProductService.getSpecialOffersProducts();

    if (!specialOffersProducts?.length) {
      slider.innerHTML = '<div class="no-offers">No special offers available</div>';
      return;
    }

    slider.innerHTML = "";

    // Batch render products for better performance
    const fragment = document.createDocumentFragment();

    for (const product of specialOffersProducts) {
      const productCard = new ProductCard({
        id: product.id,
        name: product.name,
        price: product.price,
        stock_id: product.id,
        imageUrl: product.imageUrl,
        oldPrice: product.oldPrice,
        size: product.size,
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
    initializeSliderControls();
  } catch (error) {
    console.error("Error initializing special offers:", error);
    slider.innerHTML = '<div class="error">Failed to load special offers</div>';
  }
}

function initializeSliderControls() {
  const slider = document.getElementById("special-offers-slider");
  const prevBtn = document.querySelector(".special-offers-section .prev-btn");
  const nextBtn = document.querySelector(".special-offers-section .next-btn");
  
  if (!slider || !prevBtn || !nextBtn) return;
  
  let scrollPosition = 0;
  const cardWidth = 240; // Card width + gap
  const visibleCards = 5;
  const maxScroll = slider.scrollWidth - (cardWidth * visibleCards);
  
  prevBtn.addEventListener("click", () => {
    scrollPosition = Math.max(scrollPosition - cardWidth, 0);
    slider.style.transform = `translateX(-${scrollPosition}px)`;
    updateButtonVisibility();
  });
  
  nextBtn.addEventListener("click", () => {
    scrollPosition = Math.min(scrollPosition + cardWidth, maxScroll);
    slider.style.transform = `translateX(-${scrollPosition}px)`;
    updateButtonVisibility();
  });
  
  function updateButtonVisibility() {
    prevBtn.style.opacity = scrollPosition <= 0 ? "0.5" : "1";
    nextBtn.style.opacity = scrollPosition >= maxScroll ? "0.5" : "1";
  }
  
  // Initial button state
  updateButtonVisibility();
}
