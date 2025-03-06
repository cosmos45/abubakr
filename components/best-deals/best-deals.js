// components/special-offers/special-offers.js
import { ProductCard } from "../product-card/product-card.js";
import { ProductService } from "../../scripts/services/product-service.js";
import { categoryData } from "../../scripts/services/category-service.js";

export async function initializeSpecialOffers() {
  console.log("Initializing special offers...");
  const slider = document.getElementById("deals-slider");
  const viewAllBtn = document.querySelector(".view-all-btn");
  
  if (!slider) {
    console.warn("Special offers slider not found");
    return;
  }

  try {
    slider.innerHTML = '<div class="loading">Loading special offers...</div>';

    const specialOffersProducts = await ProductService.getSpecialOffersProducts();
    console.log("Special offers products loaded:", specialOffersProducts?.length);

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
    
    // Set up the "Shop Special Offers" button link
    if (viewAllBtn) {
      setupSpecialOffersLink(viewAllBtn);
    } else {
      console.warn("View all button not found");
    }
  } catch (error) {
    console.error("Error initializing special offers:", error);
    slider.innerHTML = '<div class="error">Failed to load special offers</div>';
  }
}

function setupSpecialOffersLink(linkElement) {
  // Direct approach with hardcoded URL - most reliable solution
  const categoryUrl = "/pages/category/category-page.html?name=Special%20Offers";
  
  // Set the href attribute
  linkElement.href = categoryUrl;
  
  // Add direct click handler with proper navigation
  linkElement.addEventListener("click", function(e) {
    e.preventDefault();
    console.log("Special offers link clicked, navigating to:", categoryUrl);
    window.location.href = categoryUrl;
  });
  
  console.log("Special offers link configured with direct URL:", categoryUrl);
}

function initializeSliderControls() {
  const slider = document.getElementById("deals-slider");
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
