// components/product-card/product-card.js
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

    // Replace all template variables
    let renderedTemplate = template
      .replace(/\${name}/g, this.product.name)
      .replace(/\${id}/g, this.product.id) // Changed from ${productId} to ${id}
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

  static async handleAddToCart(productId, quantity) {
    try {
      const response = await fetch("/api/cart/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_id: productId,
          quantity: parseInt(quantity),
        }),
      });

      if (!response.ok) throw new Error("Failed to add to cart");
      return true;
    } catch (error) {
      console.error("Error adding to cart:", error);
      return false;
    }
  }

  static initializeCardListeners(cardElement) {
    const minusBtn = cardElement.querySelector(".minus");
    const plusBtn = cardElement.querySelector(".plus");
    const input = cardElement.querySelector("input");
    const addToCartBtn = cardElement.querySelector(".add-to-cart-btn");
    const productId = cardElement.dataset.productId;

    minusBtn?.addEventListener("click", () =>
      this.handleQuantityChange(input, false)
    );
    plusBtn?.addEventListener("click", () =>
      this.handleQuantityChange(input, true)
    );

    addToCartBtn?.addEventListener("click", async () => {
      const success = await this.handleAddToCart(productId, input.value);
      addToCartBtn.textContent = success ? "Added!" : "Error";
      setTimeout(() => {
        addToCartBtn.textContent = "Add to Cart";
      }, 2000);
    });
  }
}
