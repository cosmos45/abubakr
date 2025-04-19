import { Cart } from "../../scripts/modules/cart.js";

export class ProductCard {
  constructor(productData) {
    this.product = productData;
    
    this.hasVariants = Boolean(productData.has_variants);
    this.defaultVariantId = productData.defaultVariantId || null;
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
      .replace(/\${imageUrl}/g, this.product.imageUrl || '/assets/images/placeholder.jpg')
      .replace(/\${hasVariants}/g, this.hasVariants)
      .replace(/\${defaultVariantId}/g, this.defaultVariantId || '');
  
    // Handle price display
    const oldPriceHtml = this.product.oldPrice
      ? `<span class="old-price">£${parseFloat(this.product.oldPrice).toFixed(2)}</span>`
      : "";

    // Replace remaining price placeholders
    return renderedTemplate
      .replace(
        "${oldPrice ? `<span class=\"old-price\">£${oldPrice}</span>` : ''}",
        oldPriceHtml
      )
      .replace(/\${price}/g, parseFloat(this.product.price).toFixed(2));
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
  
  static async handleAddToCart(stockId, quantity, variantId = null) {
    try {
      if (!stockId) {
        throw new Error('Stock ID is required');
      }
      
      const cart = new Cart();
      await cart.init();
      return await cart.addToBasket(stockId, quantity || 1, variantId);
    } catch (error) {
      console.error('Error handling add to cart:', error);
      return false;
    }
  }

  static initializeCardListeners(cardElement) {
    if (!cardElement) {
      console.error("Card element is null or undefined");
      return;
    }
    
    const quantityInput = cardElement.querySelector("input");
    const addToCartBtn = cardElement.querySelector(".add-to-cart-btn");
    const selectOptionsBtn = cardElement.querySelector(".select-options-btn");
    const stockId = cardElement.dataset.stockId;
    const hasVariants = cardElement.dataset.hasVariants === "true";
    const defaultVariantId = cardElement.dataset.defaultVariantId;
    
    console.log("Card initialized with hasVariants:", hasVariants, "for product:", cardElement.dataset.productId);
    
    // Get the action containers
    const standardActions = cardElement.querySelector(".standard-product-actions");
    const variantActions = cardElement.querySelector(".variant-product-actions");
    
    // Show the appropriate actions container based on product type
    if (hasVariants) {
      if (variantActions) variantActions.style.display = "block";
      if (standardActions) standardActions.style.display = "none";
      console.log("Showing variant actions for product:", cardElement.dataset.productId);
    } else {
      if (standardActions) standardActions.style.display = "block";
      if (variantActions) variantActions.style.display = "none";
      console.log("Showing standard actions for product:", cardElement.dataset.productId);
    }
    
    // Prevent form submission on input
    quantityInput?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
      }
    });
  
    // Set up quantity buttons
    const minusBtn = cardElement.querySelector(".qty-btn.minus");
    const plusBtn = cardElement.querySelector(".qty-btn.plus");
    
    minusBtn?.addEventListener("click", () => {
      ProductCard.handleQuantityChange(quantityInput, false);
    });
    
    plusBtn?.addEventListener("click", () => {
      ProductCard.handleQuantityChange(quantityInput, true);
    });
  
    // Add to cart button for products without variants
    addToCartBtn?.addEventListener("click", async (e) => {
      e.stopPropagation();
      const quantity = parseInt(quantityInput.value);
      
      addToCartBtn.disabled = true;
      addToCartBtn.textContent = "Adding...";
      
      // Use the default variant ID when adding to cart
      const success = await ProductCard.handleAddToCart(stockId, quantity, defaultVariantId);
      
      addToCartBtn.disabled = false;
      addToCartBtn.textContent = success ? "Added!" : "Add to Cart";
      
      setTimeout(() => {
        addToCartBtn.textContent = "Add to Cart";
      }, 2000);
    });
  
    // Select options button for products with variants
    selectOptionsBtn?.addEventListener("click", (e) => {
      e.stopPropagation();
      window.location.href = `/pages/product/product-page.html?id=${stockId}`;
    });
  }
  
}
