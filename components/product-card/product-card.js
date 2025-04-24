import { Cart } from "../../scripts/modules/cart.js";

export class ProductCard {
  constructor(productData) {
    this.product = productData;
    this.hasVariants = Boolean(productData.has_variants || productData.hasVariants);
    
    // Always extract default variant ID regardless of has_variants status
    this.defaultVariantId = productData.defaultVariantId || 
                           (productData.default_variant && productData.default_variant.pvariant__id) || 
                           null;
    
   
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
    
    // Always use the default variant ID regardless of whether the product has variants
    // This ensures it's available for the "Add to Cart" action
    const defaultVariantId = this.defaultVariantId || 
                            (this.product.defaultVariant && this.product.defaultVariant.pvariant__id) || 
                            '';
  
    
    let renderedTemplate = template
      .replace(/\${name}/g, this.product.name)
      .replace(/\${id}/g, this.product.id || this.product.uid)
      .replace(/\${stock_id}/g, this.product.stock_id || this.product.uid)
      .replace(/\${imageUrl}/g, this.product.imageUrl || (this.product.attachments && this.product.attachments[0] ? this.product.attachments[0].url : '/assets/images/placeholder.jpg'))
      .replace(/\${hasVariants}/g, this.hasVariants)
      .replace(/\${defaultVariantId}/g, defaultVariantId);
  
    // Handle price display
    const oldPriceHtml = this.product.oldPrice || this.product.compare_price
      ? `<span class="old-price">£${parseFloat(this.product.oldPrice || this.product.compare_price).toFixed(2)}</span>`
      : "";
    
    // Replace remaining price placeholders
    return renderedTemplate.replace(/\${price}/g, parseFloat(this.product.price).toFixed(2));
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
      
      // Convert variantId to number if it's a valid value
      let parsedVariantId = null;
      
      if (variantId && variantId !== '' && variantId !== 'null' && variantId !== 'undefined') {
        parsedVariantId = Number(variantId);
        // Check if the conversion resulted in a valid number
        if (isNaN(parsedVariantId)) {
          console.warn(`Invalid variant ID format: ${variantId}`);
          parsedVariantId = null;
        }
      }
      
     
      
      const cart = new Cart();
      await cart.init();
      return await cart.addToBasket(stockId, quantity || 1, parsedVariantId);
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
    
    const addToCartBtn = cardElement.querySelector(".add-to-cart-btn");
    const selectOptionsBtn = cardElement.querySelector(".select-options-btn");
    const stockId = cardElement.dataset.stockId;
    const hasVariants = cardElement.dataset.hasVariants === "true";
    const defaultVariantId = cardElement.dataset.defaultVariantId;
  
   
    
    // Get the action containers
    const standardActions = cardElement.querySelector(".standard-product-actions");
    const variantActions = cardElement.querySelector(".variant-product-actions");
    
    // Show the appropriate actions container based on product type
    if (hasVariants) {
      if (variantActions) variantActions.style.display = "block";
      if (standardActions) standardActions.style.display = "none";
    } else {
      if (standardActions) standardActions.style.display = "block";
      if (variantActions) variantActions.style.display = "none";
      
      // For products without variants, ensure we still have the defaultVariantId
      if (!defaultVariantId || defaultVariantId === '') {
        console.warn("Product without variants is missing defaultVariantId");
      }
    }
    
    // Add to cart button for products without variants
    addToCartBtn?.addEventListener("click", async (e) => {
      e.stopPropagation();
      const quantity = 1;
      addToCartBtn.disabled = true;
      addToCartBtn.textContent = "Adding...";
      
      // Always use the defaultVariantId from the dataset, even for products without variants
    
      
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
