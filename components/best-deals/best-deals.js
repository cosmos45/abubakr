// components/best-deals/best-deals.js
import { ProductCard } from "../product-card/product-card.js";
import { ProductService } from "../../scripts/services/product-service.js";

export async function initializeBestDeals() {
  const slider = document.getElementById("deals-slider");
  if (!slider) {
    console.warn("Deals slider not found");
    return;
  }

  try {
    slider.innerHTML = '<div class="loading">Loading deals...</div>';

    const dealsProducts = await ProductService.getSpecialOffersProducts();

    if (!dealsProducts?.length) {
      slider.innerHTML = '<div class="no-deals">No deals available</div>';
      return;
    }

    slider.innerHTML = "";

    // Batch render products for better performance
    const fragment = document.createDocumentFragment();

    for (const product of dealsProducts) {
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
    console.error("Error initializing best deals:", error);
    slider.innerHTML = '<div class="error">Failed to load deals</div>';
  }
}
