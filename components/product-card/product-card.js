// components/product-card/product-card.js

import { Cart } from "../../scripts/modules/cart.js";  // Add this import at the top


export class ProductCard {
  constructor(productData) {
    this.product = productData;
  }


  static async loadTemplate() {
    try {
      const response = await fetch(
        "/components/product-card/product-card.html"
      );
      const template = await response.text();
      return template;
    } catch (error) {
      console.error("Error loading product card template:", error);
      return ""; // Return empty string or default template
    }
  }


  async render() {
    const template = await ProductCard.loadTemplate();
    
    let renderedTemplate = template
      .replace(/\${name}/g, this.product.name)
      .replace(/\${id}/g, this.product.id)
      .replace(/\${stock_id}/g, this.product.stock_id)
      .replace(/\${imageUrl}/g, this.product.imageUrl);
  
    // Handle price display
    const oldPriceHtml = this.product.oldPrice
      ? `<span class="old-price">£${this.product.oldPrice.toFixed(2)}</span>`
      : "";

    // Replace remaining price placeholders
    return renderedTemplate
      .replace(
        "${oldPrice ? `<span class=\"old-price\">£${oldPrice}</span>` : ''}",
        oldPriceHtml
      )
      .replace(/\${price}/g, this.product.price.toFixed(2));
  }

  static handleQuantityChange(input, isIncrement) {
    let value = parseInt(input.value);
    if (isIncrement) {
      value = value < 99 ? value + 1 : value;
    } else {
      value = value > 1 ? value - 1 : value;
    }
    input.value = value;
  }

  
  static async handleAddToCart(stockId, quantity) {
    try {
      if (!stockId) {
        throw new Error('Stock ID is required');
      }
      
      const cart = new Cart();
      await cart.init();
      return await cart.addToBasket(stockId, quantity || 1);
    } catch (error) {
      console.error('Error handling add to cart:', error);
      return false;
    }
  }
  

  static initializeCardListeners(cardElement) {
   
    const quantityInput = cardElement.querySelector("input");
    const addToCartBtn = cardElement.querySelector(".add-to-cart-btn");
    const stockId = cardElement.dataset.stockId;

    
    // Prevent form submission on input
    quantityInput?.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
        }
    });

    addToCartBtn?.addEventListener("click", async (e) => {
        e.stopPropagation();
        const quantity = parseInt(quantityInput.value);
        
        addToCartBtn.disabled = true;
        addToCartBtn.textContent = "Adding...";
        
        const success = await ProductCard.handleAddToCart(stockId, quantity);
        
        addToCartBtn.disabled = false;
        addToCartBtn.textContent = success ? "Added!" : "Add to Cart";
        
        setTimeout(() => {
            addToCartBtn.textContent = "Add to Cart";
        }, 2000);
    });
}

}