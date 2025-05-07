let refreshBasketTimeout = null;

export class Cart {
  // Add at the top of the Cart class
  static basketResponse = null;
  static basketPromise = null;
  static shippingRatesResponse = null;
  static shippingRatesPromise = null;

  // scripts/modules/cart.js
  constructor() {
    // Check if instance already exists and return it
    if (Cart.instance) {
      return Cart.instance;
    }

    // Create new instance
    Cart.instance = this;
    this.items = new Map();
    this.initialized = false;
    this.shippingRates = [];
    this.selectedShippingRate = null;
    this.subtotal = 0;
    this.total = 0;
    this.shippingCharges = 0;

    // Initialize discount properties
    this.discountAmount = 0;
    this.totalDiscount = 0;
    this.discount = null;

    this.orderMode = null; // Can be 'delivery' or 'collection'
    this.initializeCartEvents();

  }

  async init() {
    if (this.initialized) {
      return true;
    }
  
    try {
      if (!document.querySelector(".cart-sidebar")) {
        this.createCartStructure();
      }
  
      // Get basket UID from local storage
      let basketUid = localStorage.getItem('basketUid');
      let basketResponse;
  
      if (Cart.basketResponse) {
        basketResponse = Cart.basketResponse;
      } else if (Cart.basketPromise) {
        basketResponse = await Cart.basketPromise;
      } else {
        // Create a promise for the basket request that can be shared
        if (basketUid) {
          // Use existing basket UID
          Cart.basketPromise = axiosServices.get(`/commerce/baskets/${basketUid}`);
        } else {
          // Create a new basket
          Cart.basketPromise = axiosServices.post("/commerce/baskets", {});
          const response = await Cart.basketPromise;
          if (response.status && response.data.basket && response.data.basket.uid) {
            basketUid = response.data.basket.uid;
            localStorage.setItem('basketUid', basketUid);
          }
        }
        
        basketResponse = await Cart.basketPromise;
        Cart.basketResponse = basketResponse;
      }
  
      if (basketResponse.status && basketResponse.data.basket) {
        const basketData = basketResponse.data.basket;
  
        this.subtotal = parseFloat(basketData.sub_total) || 0;
        this.total = parseFloat(basketData.total) || 0;
        this.shippingCharges = parseFloat(basketData.shipping_charges) || 0;
  
        // Store discount information
        this.discountAmount = parseFloat(basketData.discount_amount) || 0;
        this.totalDiscount = parseFloat(basketData.total_discount) || 0;
        this.discount = basketData.discount || null;
  
        // Store order mode if present
        if (basketData.order_mode) {
          this.orderMode = basketData.order_mode;
        } else {
          this.orderMode = null; // Explicitly set to null if not present
        }
  
        // Clear existing items map before populating with new data
        this.items = new Map();
  
        // Populate items map with all basket items
        if (basketData.items && Array.isArray(basketData.items)) {
          basketData.items.forEach((item) => {
            const mappedItem = {
              id: item.stock_id || item.product?.uid,
              stock_id: item.stock_id || item.product?.uid,
              basket_item_id: item.basket_item__id,
              name: item.name,
              price: parseFloat(item.price),
              quantity: item.quantity,
              totalPrice: parseFloat(item.total),
              // Keep the product and variant objects intact
              product: item.product || null,
              variant: item.variant || null,
            };
  
            this.items.set(item.basket_item__id.toString(), mappedItem);
          });
        }
  
        // Render all items in the cart
        this.renderSavedItems();
        this.updateCartCount();
        this.updateSubtotal();
  
        // Pass the basket data to loadShippingRates to avoid a second request
        if (basketData.items && basketData.items.length > 0) {
          await this.loadShippingRates(basketData);
        } else {
          this.shippingRates = [];
          this.selectedShippingRate = null;
          this.renderShippingRates();
        }
  
        // Initialize order mode buttons
        this.renderOrderModeOptions();
  
        // Update discount display
        this.updateDiscountDisplay();
  
        // Update checkout button state
        this.updateCheckoutButtonState();
      }
  
      this.bindEvents();
      this.initialized = true;
      return true;
    } catch (error) {
      console.error("Error initializing cart:", error);
      // Clear the promise if there was an error
      if (Cart.basketPromise) {
        Cart.basketPromise = null;
      }
      return false;
    }
  }
  

  renderShippingRates() {
    const container = document.getElementById("shipping-rates-container");
    if (!container) return;

    // Hide shipping rates if no order mode is selected or if collection mode is selected
    if (!this.orderMode || this.orderMode === "collection") {
      container.style.display = "none";
      return;
    }

    // If no items in basket, show message to add products
    if (this.items.size === 0) {
      container.innerHTML = `
      <div class="shipping-rates mb-3">
        <p class="mb-2">Shipping</p>
        <p class="text-muted">Add products to the basket to see shipping options</p>
      </div>`;
      container.style.display = "block";
      return;
    }

    // Show shipping rates container for delivery mode with items
    container.style.display = "block";

    // If no shipping rates available yet
    if (this.shippingRates.length === 0) {
      container.innerHTML = `
      <div class="shipping-rates mb-3">
        <p class="mb-2">Shipping</p>
        <p class="text-muted">Loading shipping options...</p>
      </div>`;
      return;
    }

    // Render shipping rate options
    container.innerHTML = `
    <div class="shipping-rates mb-3">
      <p class="mb-2">Shipping</p>
      ${this.shippingRates
        .map(
          (rate) => `
        <div class="form-check">
          <input type="radio" 
            id="shipping_${rate.shipping_rate__id}" 
            name="shipping_method" 
            class="form-check-input me-2"
            value="${rate.shipping_rate__id}"
            ${
              this.selectedShippingRate?.shipping_rate__id ===
              rate.shipping_rate__id
                ? "checked"
                : ""
            }
          />
          <label class="form-check-label" for="shipping_${
            rate.shipping_rate__id
          }">
            ${rate.name}: £${rate.amount.toFixed(2)}
          </label>
        </div>
      `
        )
        .join("")}
    </div>
  `;

    // Add event listeners
    const radioButtons = container.querySelectorAll('input[type="radio"]');
    radioButtons.forEach((radio) => {
      radio.addEventListener("change", (e) => {
        this.updateShippingRate(parseInt(e.target.value));
      });
    });
  }

  // In cart.js - update the loadShippingRates method
  async loadShippingRates(basketData = null) {
    try {
      // Only fetch basket data if not provided
      let currentBasketData = basketData;
      if (!currentBasketData) {
        // Use cached basket response if available
        if (Cart.basketResponse) {
          currentBasketData = Cart.basketResponse.data.basket;
        } else {
          const currentBasket = await axiosServices.get("/commerce/basket");
          currentBasketData = currentBasket.data.basket;
        }
      }

      // If basket is empty, clear shipping rates and update UI
      if (!this.items.size) {
        this.shippingRates = [];
        this.selectedShippingRate = null;
        this.renderShippingRates();
        this.updateCheckoutButtonState();
        return;
      }

      // Use cached shipping rates if available
      let shippingRatesResponse;
      if (Cart.shippingRatesResponse) {
        shippingRatesResponse = Cart.shippingRatesResponse;
      } else if (Cart.shippingRatesPromise) {
        shippingRatesResponse = await Cart.shippingRatesPromise;
      } else {
        // Create a promise for the shipping rates request that can be shared
        Cart.shippingRatesPromise = axiosServices.get(
          "/commerce/shipping-rates"
        );
        shippingRatesResponse = await Cart.shippingRatesPromise;
        Cart.shippingRatesResponse = shippingRatesResponse;
      }

      if (
        shippingRatesResponse.status &&
        shippingRatesResponse.data.shippingRates
      ) {
        this.shippingRates = shippingRatesResponse.data.shippingRates;

        // Check if basket has existing shipping rate and we're in delivery mode
        if (
          currentBasketData.shipping_rate_id &&
          this.orderMode === "delivery"
        ) {
          this.selectedShippingRate = this.shippingRates.find(
            (rate) =>
              rate.shipping_rate__id === currentBasketData.shipping_rate_id
          );
        } else {
          // Don't auto-select a shipping rate, even for delivery mode
          // Let the user explicitly choose one
          this.selectedShippingRate = null;
        }

        // Only render shipping rates if delivery mode is selected
        if (this.orderMode === "delivery") {
          this.renderShippingRates();
        } else {
          // Hide shipping rates for other modes or when no mode is selected
          const container = document.getElementById("shipping-rates-container");
          if (container) container.style.display = "none";
        }

        this.updateCheckoutButtonState();
      }
    } catch (error) {
      console.error("Error loading shipping rates:", error);
      // Clear the promise if there was an error
      if (Cart.shippingRatesPromise) {
        Cart.shippingRatesPromise = null;
      }
    }
  }

  updateTotalsWithShipping(shippingAmount) {
    const subtotalElement = document.querySelector(".subtotal-amount");
    const totalElement = document.querySelector(".total-amount");
    const shippingElement = document.querySelector("#shipping-charges");

    if (subtotalElement) {
      subtotalElement.textContent = `£${this.subtotal.toFixed(2)}`;
    }

    if (totalElement) {
      // Calculate new total based on order mode
      let newTotal;
      if (this.orderMode === "collection") {
        newTotal = this.subtotal;
      } else {
        newTotal = shippingAmount
          ? this.subtotal + shippingAmount
          : this.subtotal;
      }

      // Apply discount if available
      if (this.totalDiscount > 0) {
        newTotal = Math.max(0, newTotal - this.totalDiscount);
      }

      totalElement.textContent = `£${newTotal.toFixed(2)}`;
    }

    if (shippingElement) {
      if (this.orderMode === "collection") {
        shippingElement.textContent = "£0.00";
      } else {
        shippingElement.textContent = shippingAmount
          ? `£${shippingAmount.toFixed(2)}`
          : "£0.00";
      }
    }
  }

  async updateShippingRate(shippingRateId) {
    try {
      const basketUid = localStorage.getItem('basketUid');
      if (!basketUid) {
        console.error("No basket UID found in local storage");
        return;
      }
      const selectedRate = this.shippingRates.find(
        (rate) => rate.shipping_rate__id === parseInt(shippingRateId)
      );
      if (!selectedRate) {
        this.selectedShippingRate = null;
        this.updateCheckoutButtonState();
        return;
      }

      // Update UI immediately
      this.selectedShippingRate = selectedRate;
      this.updateCheckoutButtonState();
      this.updateTotalsWithShipping(selectedRate.amount);

      const response = await axiosServices.put(`/commerce/baskets/${basketUid}`, {
        shipping_rate_id: shippingRateId,
        shipping_charges: selectedRate.amount,
        sub_total: this.subtotal,
        total: this.subtotal + selectedRate.amount,
      });
      

      if (response.status) {
        await this.refreshBasket();
        // The refreshBasket method will update the discount display
      }
    } catch (error) {
      console.error("Error updating shipping rate:", error);
    }
  }

  updateShippingRateDisplay() {
    const shippingRatesList = document.getElementById("shippingRatesList");
    if (shippingRatesList) {
      const inputs = shippingRatesList.querySelectorAll('input[type="radio"]');
      inputs.forEach((input) => {
        input.checked =
          this.selectedShippingRate &&
          parseInt(input.value) === this.selectedShippingRate.shipping_rate__id;
      });
    }

    // Update shipping charges display
    const shippingChargesElement = document.querySelector("#shipping-charges");
    if (shippingChargesElement && this.selectedShippingRate) {
      shippingChargesElement.textContent = `£${this.selectedShippingRate.amount.toFixed(
        2
      )}`;
    }
  }

  updateCheckoutButtonState() {
    const checkoutBtn = document.querySelector(".checkout-btn");
    if (checkoutBtn) {
      let isDisabled = false;

      // Check if basket is empty
      if (this.items.size === 0) {
        isDisabled = true;
      }
      // Check if order mode is selected
      else if (!this.orderMode) {
        isDisabled = true;
      }
      // For delivery mode, shipping rate must be selected
      else if (this.orderMode === "delivery" && !this.selectedShippingRate) {
        isDisabled = true;
      }
      // For collection mode with items, enable checkout
      else if (this.orderMode === "collection" && this.items.size > 0) {
        isDisabled = false;
      }

      checkoutBtn.disabled = isDisabled;
      checkoutBtn.style.opacity = isDisabled ? "0.5" : "1";
      checkoutBtn.style.cursor = isDisabled ? "not-allowed" : "pointer";
    }
  }

  // async addToBasket(stockId, quantity) {
  //   try {
  //     // Check if item already exists in basket
  //     const existingItem = Array.from(this.items.values()).find(item =>
  //       item.stock_id === stockId
  //     );

  //     if (existingItem) {
  //       // Update quantity if item exists
  //       const newQuantity = existingItem.quantity + quantity;
  //       await this.updateQuantity(existingItem.basket_item_id, newQuantity);
  //       this.showToast('Product quantity updated in basket!');
  //     } else {
  //       // Add new item if it doesn't exist
  //       const formData = new FormData();
  //       formData.append('stock', stockId);
  //       formData.append('quantity', quantity);

  //       const response = await axiosServices.post('/commerce/basket', formData);

  //       if (response.status) {
  //         this.showToast('Product added to basket successfully!');
  //         await this.refreshBasket();
  //       }
  //     }
  //     return true;
  //   } catch (error) {
  //     console.error('Error adding to basket:', error);
  //     this.showToast('Failed to add product to basket', 'error');
  //     return false;
  //   }
  // }
  async addToBasket(productId, quantity = 1, variantId = null) {
    try {
      const basketUid = localStorage.getItem('basketUid');
      const formData = new FormData();
      formData.append("product", productId);
      formData.append("quantity", quantity);
  
      if (variantId) {
        formData.append("pvariant_id", variantId);
      }
  
      let response;
      if (basketUid) {
        response = await axiosServices.post(`/commerce/baskets/${basketUid}/items`, formData);
      } else {
        // Create a new basket if none exists
        response = await axiosServices.post("/commerce/baskets", formData);
        if (response.status && response.data.basket && response.data.basket.uid) {
          localStorage.setItem('basketUid', response.data.basket.uid);
        }
      }
  
      if (response.status) {
        this.showToast(`Product added to your cart successfully!`);
        await this.refreshCart();
        this.showCart();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error adding to basket:", error);
      this.showToast("Failed to add product to cart", "error");
      return false;
    }
  }
  // Add this to your Cart class
  initializeCartEvents() {
    // Listen for cart:refresh events
    document.addEventListener("cart:refresh", async (event) => {
      await this.refreshCart();
    });

    // Listen for cart:updated events
    document.addEventListener("cart:updated", () => {
      this.updateCartCount();
      this.renderSavedItems();
      this.updateSubtotal();
    });
  }

  async refreshCart() {
    try {
      // Clear any existing refresh timeout
      if (refreshBasketTimeout) {
        clearTimeout(refreshBasketTimeout);
      }

      // Reset cached responses to force fresh data
      Cart.basketResponse = null;
      Cart.basketPromise = null;

      // Refresh the basket data
      await this.refreshBasket();

      // Update UI elements
      this.updateCartCount();
      this.renderSavedItems();
      this.updateSubtotal();

      return true;
    } catch (error) {
      console.error("Error refreshing cart:", error);
      return false;
    }
  }

  async refreshBasket() {
    // If basket is already being refreshed, wait for that promise
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    // Create a new refresh promise
    this.refreshPromise = new Promise(async (resolve) => {
      try {
          const basketUid = localStorage.getItem('basketUid');
          if (!basketUid) {
            console.error("No basket UID found in local storage");
            resolve(false);
            return;
          }
          const response = await axiosServices.get(`/commerce/baskets/${basketUid}`);
          if (response.status && response.data.basket) {
            const basketData = response.data.basket;

          this.subtotal = parseFloat(basketData.sub_total) || 0;
          this.total = parseFloat(basketData.total) || 0;
          this.shippingCharges = parseFloat(basketData.shipping_charges) || 0;

          // Store discount information
          this.discountAmount = parseFloat(basketData.discount_amount) || 0;
          this.totalDiscount = parseFloat(basketData.total_discount) || 0;
          this.discount = basketData.discount || null;

          // Update order mode if present in basket
          if (basketData.order_mode) {
            this.orderMode = basketData.order_mode;
          }

          // Update selected shipping rate based on order mode
          if (
            this.orderMode === "delivery" &&
            basketData.shipping_rate_id &&
            this.shippingRates.length > 0
          ) {
            this.selectedShippingRate = this.shippingRates.find(
              (rate) => rate.shipping_rate__id === basketData.shipping_rate_id
            );
          } else if (this.orderMode === "collection" || !this.orderMode) {
            // Ensure shipping rate is null for collection mode or when no mode is selected
            this.selectedShippingRate = null;
          }

          // Clear existing items map before populating with new data
          this.items = new Map();

          // Populate items map with all basket items
          if (basketData.items && Array.isArray(basketData.items)) {
            basketData.items.forEach((item) => {
              // Preserve the entire product object including attachments
              const mappedItem = {
                id: item.stock_id || item.product?.uid,
                stock_id: item.stock_id || item.product?.uid,
                basket_item_id: item.basket_item__id,
                name: item.name,
                price: parseFloat(item.price),
                quantity: item.quantity,
                totalPrice: parseFloat(item.total),
                // Keep the product and variant objects intact
                product: item.product || null,
                variant: item.variant || null,
              };

              this.items.set(item.basket_item__id.toString(), mappedItem);
            });
          }

          // Render all items in the cart
          this.renderSavedItems();
          this.updateCartCount();
          this.updateSubtotal();
          this.renderOrderModeOptions();
          this.renderShippingRates();
          this.updateDiscountDisplay();
          this.updateCheckoutButtonState();
          resolve(true);
        } else {
          resolve(false);
        }
      } catch (error) {
        console.error("Error refreshing basket:", error);
        this.showToast("Failed to refresh basket", "error");
        resolve(false);
      } finally {
        // Clear the promise reference
        this.refreshPromise = null;
      }
    });

    return this.refreshPromise;
  }

  renderOrderModeOptions() {
    const container = document.getElementById("order-mode-container");
    if (!container) return;

    // Reset selected state on all buttons
    const buttons = container.querySelectorAll(".order-mode-btn");
    buttons.forEach((btn) => {
      btn.classList.remove("selected");
      if (this.orderMode === btn.dataset.mode) {
        btn.classList.add("selected");
      }
    });

    // Add event listeners if not already added
    if (!container.dataset.initialized) {
      container.dataset.initialized = "true";

      buttons.forEach((btn) => {
        btn.addEventListener("click", () => {
          this.updateOrderMode(btn.dataset.mode);
        });
      });
    }

    // Hide shipping rates if no order mode is selected or if collection mode is selected
    this.toggleShippingRatesVisibility();
  }

  async updateOrderMode(mode) {
    try {

      // Update UI immediately
      this.orderMode = mode;
      this.renderOrderModeOptions();
  const basketUid = localStorage.getItem('basketUid');
    if (!basketUid) {
      console.error("No basket UID found in local storage");
      return false;
    }
      // Handle shipping rates based on order mode
      if (mode === "collection") {
        // For collection, clear shipping rate selection
        this.selectedShippingRate = null;
        this.shippingCharges = 0;
        this.updateTotalsWithShipping(0);
        this.toggleShippingRatesVisibility();

        // Update checkout button state - enable it for collection mode with items
        if (this.items.size > 0) {
          const checkoutBtn = document.querySelector(".checkout-btn");
          if (checkoutBtn) {
            checkoutBtn.disabled = false;
            checkoutBtn.style.opacity = "1";
            checkoutBtn.style.cursor = "pointer";
          }
        }

        // Send update to server - set shipping_rate_id to null for collection
        const response = await axiosServices.put(`/commerce/baskets/${basketUid}`, {
          order_mode: mode,
          shipping_rate_id: null,
          shipping_charges: 0,
        });

        if (response.status) {
          await this.refreshBasket();
        }
      } else if (mode === "delivery") {
        // For delivery, show shipping rates
        this.toggleShippingRatesVisibility();

        // Update checkout button state - disable until shipping rate is selected
        const checkoutBtn = document.querySelector(".checkout-btn");
        if (checkoutBtn) {
          checkoutBtn.disabled = true;
          checkoutBtn.style.opacity = "0.5";
          checkoutBtn.style.cursor = "not-allowed";
        }

        // Send initial update to server for delivery mode
        const response = await axiosServices.put(`/commerce/baskets/${basketUid}`, {
          order_mode: mode,
          // Don't update shipping_rate_id yet as none is selected
        });

        if (response.status) {
          await this.refreshBasket();

          // If shipping rates are available, prompt user to select one
          if (this.shippingRates.length > 0) {
            // Don't auto-select first rate, let user choose
            this.renderShippingRates();
          }
        }
      }
    } catch (error) {
      console.error("Error updating order mode:", error);
      this.showToast("Failed to update order mode", "error");
    }
  }

  toggleShippingRatesVisibility() {
    const shippingContainer = document.getElementById(
      "shipping-rates-container"
    );
    if (!shippingContainer) return;

    // Hide shipping rates if no order mode is selected or if collection mode is selected
    if (!this.orderMode || this.orderMode === "collection") {
      shippingContainer.style.display = "none";
      return;
    }

    // Only show shipping container if there are items in the basket and delivery mode is selected
    if (this.items.size > 0 && this.orderMode === "delivery") {
      shippingContainer.style.display = "block";
    } else {
      // If basket is empty but delivery mode is selected, show container with message
      shippingContainer.style.display = "block";
      shippingContainer.innerHTML = `
      <div class="shipping-rates mb-3">
        <p class="mb-2">Shipping</p>
        <p class="text-muted">Add products to the basket to see shipping options</p>
      </div>`;
    }
  }

  updateDiscountDisplay() {
    // Get the order summary container
    const summaryDetails = document.querySelector(".summary-details");
    if (!summaryDetails) return;

    // Remove any existing discount rows
    const existingDiscountRows = document.querySelectorAll(
      ".discount-row, .total-discount-row"
    );
    existingDiscountRows.forEach((row) => row.remove());

   
    // Only show discount if there is a discount amount and discount object
    if (this.discount && this.discount.name && this.discountAmount > 0) {
      // Create discount row element
      const discountRow = document.createElement("div");
      discountRow.className =
        "discount-row d-flex justify-content-between mb-3";
      discountRow.innerHTML = `
      <span>Discount <span class="discount-name">(${
        this.discount.name
      })</span></span>
      <span class="discount-amount text-success">-£${this.discountAmount.toFixed(
        2
      )}</span>
    `;

      // Find shipping rates container to insert after
      const shippingContainer = document.getElementById(
        "shipping-rates-container"
      );
      if (shippingContainer) {
        shippingContainer.after(discountRow);
      } else {
        // If no shipping container, insert before the total
        const totalRow = summaryDetails.querySelector("hr");
        if (totalRow) {
          totalRow.before(discountRow);
        }
      }
    }

    // Add total discount row if total discount exists (even if it's the same as discount amount)
    if (this.totalDiscount > 0) {
      const totalDiscountRow = document.createElement("div");
      totalDiscountRow.className =
        "total-discount-row d-flex justify-content-between mb-3";
      totalDiscountRow.innerHTML = `
      <span>Total Discount</span>
      <span class="total-discount-amount text-success">-£${this.totalDiscount.toFixed(
        2
      )}</span>
    `;

      // Insert before the total (before the hr)
      const totalRow = summaryDetails.querySelector("hr");
      if (totalRow) {
        totalRow.before(totalDiscountRow);
      }
    }
  }

  showToast(message, type = "success") {
    // Remove any existing toasts first
    const existingToasts = document.querySelectorAll(".toast-notification");
    existingToasts.forEach((toast) => toast.remove());

    // Create new toast element
    const toast = document.createElement("div");
    toast.className = `toast-notification ${type}`;
    toast.innerHTML = `
    <div class="toast-content">
      <i class="fas ${
        type === "success" ? "fa-check-circle" : "fa-exclamation-circle"
      }"></i>
      <span>${message}</span>
    </div>
  `;

    // Add to document
    document.body.appendChild(toast);

    // Animate in and out
    setTimeout(() => {
      toast.classList.add("show");
      setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 300);
      }, 3000);
    }, 100);
  }

  createCartStructure() {
    // Create cart overlay
    const overlay = document.createElement("div");
    overlay.className = "cart-overlay";
    document.body.appendChild(overlay);

    // Create cart sidebar
    const sidebar = document.createElement("div");
    sidebar.className = "cart-sidebar";
    sidebar.innerHTML = `
            <div class="cart-header">
                <h2>Cart (0 items)</h2>
                <button class="close-cart">×</button>
            </div>
            <div class="cart-items"></div>
            <div class="cart-footer">
                <div class="subtotal">
                    <span>Subtotal</span>
                    <span class="subtotal-amount">£0.00</span>
                </div>
                <button class="view-cart-btn" onclick="window.location.href='/pages/cart/cart-page.html'">View Cart</button>
            </div>
        `;
    document.body.appendChild(sidebar);
  }

  bindEvents() {
    const cartIcon = document.querySelector(".cart-icon");
    const closeBtn = document.querySelector(".close-cart");
    const overlay = document.querySelector(".cart-overlay");

    const cartItems = document.querySelector(".cart-items");

    cartIcon?.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.showCart();
    });

    closeBtn?.addEventListener("click", () => this.hideCart());
    overlay?.addEventListener("click", () => this.hideCart());

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.hideCart();
      }
    });

    cartItems?.addEventListener("click", async (e) => {
      const target = e.target;
      const cartItem = target.closest(".cart-item");
      if (!cartItem) return;

      const basketItemId = cartItem.dataset.basketItemId;

      if (target.classList.contains("remove-item")) {
        e.stopPropagation();
        await this.removeBasketItem(basketItemId);
        return;
      }

      if (target.classList.contains("qty-btn")) {
        e.stopPropagation();
        const input = cartItem.querySelector("input");
        const currentQty = parseInt(input.value);
        const newQty = target.classList.contains("plus")
          ? currentQty + 1
          : currentQty - 1;

        if (newQty >= 1 && newQty <= 99) {
          await this.updateQuantity(basketItemId, newQty);
        }
      }
    });
  }

  showCart() {
    const cartSidebar = document.querySelector(".cart-sidebar");
    const cartOverlay = document.querySelector(".cart-overlay");

    if (cartSidebar && cartOverlay) {
      cartSidebar.style.visibility = "visible";
      cartOverlay.style.visibility = "visible";
      cartSidebar.classList.add("active");
      cartOverlay.classList.add("active");
      document.body.style.overflow = "hidden";

      const cartTitle = cartSidebar.querySelector(".cart-header h2");


      if (cartTitle) {

        const itemCount = this.getTotalItems();
        cartTitle.textContent = `Cart (${itemCount} items)`;
      }
    }
  }

  hideCart() {
    const cartSidebar = document.querySelector(".cart-sidebar");
    const cartOverlay = document.querySelector(".cart-overlay");

    if (cartSidebar && cartOverlay) {
      cartSidebar.classList.remove("active");
      cartOverlay.classList.remove("active");
      document.body.style.overflow = "";

      setTimeout(() => {
        cartSidebar.style.visibility = "hidden";
        cartOverlay.style.visibility = "hidden";
      }, 300);
    }
  }

  addItemUI(item) {
    const cartItems = document.querySelector(".cart-items");
    if (!cartItems) return;

    const itemHTML = `
      <div 
        class="cart-item" 
        data-basket-item-id="${item.basket_item_id}" 
        data-product-id="${item.id}" 
        onclick="window.location.href='/pages/product/product-page.html?id=${
          item.id
        }'"
      >
        <div class="cart-item-image">
          <img 
            src="${item.imageUrl}" 
            alt="${item.name}" 
            onerror="this.onerror=null; this.src='/assets/images/default-product.png';"
          />
        </div>
        <div class="cart-item-details">
          <h3>${item.name}</h3>
          <span class="price">£${item.price.toFixed(2)}</span>
        </div>
      </div>`;

    cartItems.insertAdjacentHTML("beforeend", itemHTML);
  }

  updateItemUI(item) {
    const itemElement = document.querySelector(
      `.cart-item[data-id="${item.id}"]`
    );
    if (!itemElement) return;

    const quantityInput = itemElement.querySelector("input");
    const totalElement = itemElement.querySelector(".item-total");

    quantityInput.value = item.quantity;
    totalElement.textContent = `£${(item.price * item.quantity).toFixed(2)}`;

    this.updateSubtotal();
    this.updateCartCount();
    this.saveCartToStorage();
  }

  async updateQuantity(basketItemId, newQuantity) {
    try {
      const basketUid = localStorage.getItem('basketUid');
      if (!basketUid) {
        console.error("No basket UID found in local storage");
        return false;
      }
      
      const response = await axiosServices.put(
        `/commerce/baskets/${basketUid}/items/${basketItemId}`,
        { quantity: newQuantity }
      );
  
      if (response.status) {
        await this.refreshBasket();
        this.showToast("Quantity updated successfully!");
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error updating quantity:", error);
      this.showToast("Failed to update quantity", "error");
      return false;
    }
  }

  async removeBasketItem(basketItemId) {
    try {
      const basketUid = localStorage.getItem('basketUid');
      if (!basketUid) {
        console.error("No basket UID found in local storage");
        return false;
      }
      
      const response = await axiosServices.delete(
        `/commerce/baskets/${basketUid}/items/${basketItemId}`
      );
  
      if (response.status) {
        await this.refreshBasket();
        this.showToast("Item removed from basket");
  
        // Check if basket is empty after refresh
        if (this.items.size === 0) {
          // Reset shipping related data
          this.selectedShippingRate = null;
          this.shippingCharges = 0;
  
          // Update UI without page reload
          this.renderShippingRates();
          this.updateCheckoutButtonState();
          this.updateTotalsWithShipping(0);
  
          // Hide cart if in sidebar mode
          if (document.querySelector(".cart-sidebar.active")) {
            this.hideCart();
          }
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error removing basket item:", error);
      this.showToast("Failed to remove item", "error");
      return false;
    }
  }

  updateCartCount() {
  // Calculate total products, not unique SKUs
  const totalCount = this.getTotalItems();

  // Update every header icon counter
  document.querySelectorAll(".cart-count").forEach(el => {
    el.textContent = totalCount;
  });

  // Update side-cart header title
  const cartTitle = document.querySelector(".cart-header h2");
  if (cartTitle) {
    cartTitle.textContent = `Cart (${totalCount} ${totalCount === 1 ? "item" : "items"})`;
  }
}


  getTotalItems() {
    let total = 0;
    this.items.forEach((item) => (total += item.quantity));
    return total;
  }

  updateSubtotal() {
    const subtotalElement = document.querySelector(".subtotal-amount");
    const totalElement = document.getElementById("total-amount");
    const shippingElement = document.querySelector("#shipping-charges");

    if (subtotalElement) {
      subtotalElement.textContent = `£${this.subtotal.toFixed(2)}`;
    }

    if (totalElement) {
      totalElement.textContent = `£${this.total.toFixed(2)}`;
    }

    if (shippingElement && this.shippingCharges) {
      shippingElement.textContent = `£${this.shippingCharges.toFixed(2)}`;
    }

    // Update discount display whenever totals are updated
    this.updateDiscountDisplay();
  }

  renderSavedItems() {
    const cartItems = document.querySelector(".cart-items");
    if (!cartItems) return;

    // Clear the cart items container first
    cartItems.innerHTML = "";

    // Check if we have items
    if (this.items.size === 0) {
      cartItems.innerHTML =
        '<div class="empty-cart-message">Your cart is empty</div>';
      return;
    }

    // Create a document fragment for better performance
    const fragment = document.createDocumentFragment();

    // Iterate through all items and add them to the cart
    this.items.forEach((item) => {
      // Extract product image from the product's attachments if available
      let productImage = "/assets/images/default-product.png";

      // Check if item has product with attachments
      if (
        item.product &&
        item.product.attachments &&
        item.product.attachments.length > 0
      ) {
        // Get the first attachment path and trim any whitespace or newlines
        const attachmentPath = item.product.attachments[0].url;
        if (attachmentPath) {
          productImage = attachmentPath.trim();
        }
      }

      const itemElement = document.createElement("div");
      itemElement.className = "cart-item";
      itemElement.dataset.basketItemId = item.basket_item_id;
      itemElement.dataset.productId = item.product?.uid || item.id; // Use product.uid if available

      // Determine if this is a variant
      const variantInfo = item.variant
        ? `<span class="variant-info">${
            item.variant.items?.map((i) => i.name).join(", ") || ""
          }</span>`
        : "";

      itemElement.innerHTML = `
        <div class="cart-item-image">
          <img 
            src="${productImage}" 
            alt="${item.name}"
            onerror="this.onerror=null; this.src='/assets/images/default-product.png';"
          >
        </div>
        <div class="cart-item-details">
          <h3>${item.name}</h3>
          <div class="price-info">
            <span class="price">£${item.price.toFixed(2)}</span>
            ${variantInfo}
          </div>
          <div class="quantity-control">
            <button class="qty-btn minus">−</button>
            <input type="number" value="${
              item.quantity
            }" min="1" max="99" readonly>
            <button class="qty-btn plus">+</button>
          </div>
        </div>
        <div class="item-total">£${item.totalPrice.toFixed(2)}</div>
        <button class="remove-item" data-basket-item-id="${
          item.basket_item_id
        }">×</button>
      `;

      fragment.appendChild(itemElement);
    });

    // Append all items at once for better performance
    cartItems.appendChild(fragment);

    // Add click event listener to the cart items container
    cartItems.addEventListener("click", (e) => {
      const cartItem = e.target.closest(".cart-item");
      if (!cartItem) return;

      const isQuantityControl = e.target.closest(".quantity-control");
      const isRemoveButton = e.target.closest(".remove-item");

      // Only navigate to product page if not clicking controls
      if (!isQuantityControl && !isRemoveButton) {
        const productId = cartItem.dataset.productId;
        window.location.href = `/pages/product/product-page.html?id=${productId}`;
      }
    });

    // Update cart count and totals
    this.updateCartCount();
    this.updateSubtotal();
  }

  renderCartPage() {
    const cartItemsContainer = document.getElementById("cart-items-container");
    if (!cartItemsContainer) return;

    cartItemsContainer.innerHTML = "";

    if (this.items.size === 0) {
      cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                <p>Your cart is empty</p>
                <a href="/" class="continue-shopping">Continue Shopping</a>
            </div>`;
      return;
    }

    this.items.forEach((item) => {
      // Extract product image from the product's attachments if available
      let productImage = "/assets/images/default-product.png";

      if (
        item.product &&
        item.product.attachments &&
        item.product.attachments.length > 0
      ) {
        const attachmentPath = item.product.attachments[0].url;
        if (attachmentPath) {
          productImage = attachmentPath.trim();
        }
      }

      // Determine if this is a variant
      const variantInfo = item.variant
        ? `<div class="variant-info">${
            item.variant.items?.map((i) => i.name).join(", ") || ""
          }</div>`
        : "";

      const itemHtml = `
            <div class="cart-item" data-basket-item-id="${item.basket_item_id}">
                <img src="${productImage}" alt="${item.name}" 
                     onerror="this.src='/assets/images/default-product.png'">
                <div class="cart-item-details">
                    <h3 class="item-name">${item.name}</h3>
                    <div class="price-info">
                        <span class="current-price">£${item.price.toFixed(
                          2
                        )}</span>
                        ${variantInfo}
                    </div>
                    <div class="d-flex align-items-center mt-3">
                        <div class="quantity-control">
                            <button class="qty-btn minus">−</button>
                            <input type="number" value="${
                              item.quantity
                            }" min="1" max="99" readonly>
                            <button class="qty-btn plus">+</button>
                        </div>
                        <span class="item-total">£${item.totalPrice.toFixed(
                          2
                        )}</span>
                    </div>
                </div>
                <button class="remove-item" aria-label="Remove item">×</button>
            </div>`;
      cartItemsContainer.insertAdjacentHTML("beforeend", itemHtml);
    });

    this.initializeCartPageControls();
    this.updateCartPageTotals();
    this.updateDiscountDisplay(); // Make sure discounts are displayed
  }

  initializeCartPageControls() {
    const cartItems = document.querySelectorAll(".cart-item");

    cartItems.forEach((item) => {
      const basketItemId = item.dataset.basketItemId;
      const quantityInput = item.querySelector("input");
      const minusBtn = item.querySelector(".minus");
      const plusBtn = item.querySelector(".plus");
      const removeBtn = item.querySelector(".remove-item");

      minusBtn?.addEventListener("click", async () => {
        const currentQty = parseInt(quantityInput.value);
        if (currentQty > 1) {
          await this.updateQuantity(basketItemId, currentQty - 1);
          this.renderCartPage();
        }
      });

      plusBtn?.addEventListener("click", async () => {
        const currentQty = parseInt(quantityInput.value);
        if (currentQty < 99) {
          await this.updateQuantity(basketItemId, currentQty + 1);
          this.renderCartPage();
        }
      });

      removeBtn?.addEventListener("click", async () => {
        await this.removeBasketItem(basketItemId);
        this.renderCartPage();
      });
    });
  }
  updateCartPageTotals() {
    const subtotalElement = document.getElementById("subtotal-amount");
    const totalElement = document.getElementById("total-amount");
    const shippingElement = document.getElementById("shipping-charges");

    if (!subtotalElement || !totalElement) return;

    subtotalElement.textContent = `£${this.subtotal.toFixed(2)}`;
    totalElement.textContent = `£${this.total.toFixed(2)}`;

    if (shippingElement && this.shippingCharges) {
      shippingElement.textContent = `£${this.shippingCharges.toFixed(2)}`;
    }

    // Update discount display
    this.updateDiscountDisplay();
  }

  initializeCartControls() {
    const cartItems = document.querySelectorAll(".cart-item");

    cartItems.forEach((item) => {
      const productId = item.dataset.id;
      const quantityInput = item.querySelector("input");
      const minusBtn = item.querySelector(".minus");
      const plusBtn = item.querySelector(".plus");
      const removeBtn = item.querySelector(".remove-item");

      minusBtn?.addEventListener("click", () => {
        const currentQty = parseInt(quantityInput.value);
        if (currentQty > 1) {
          this.updateQuantity(productId, -1);
          this.updateSubtotalForPage();
        }
      });

      plusBtn?.addEventListener("click", () => {
        const currentQty = parseInt(quantityInput.value);
        if (currentQty < 99) {
          this.updateQuantity(productId, 1);
          this.updateSubtotalForPage();
        }
      });

      removeBtn?.addEventListener("click", () => {
        this.removeBasketItem(productId);
        this.renderCartPage();
      });
    });
  }

  updateSubtotalForPage() {
    const subtotalElement = document.getElementById("subtotal-amount");
    const totalElement = document.getElementById("total-amount");
    if (!subtotalElement || !totalElement) return;

    const subtotal = Array.from(this.items.values()).reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    subtotalElement.textContent = `£${subtotal.toFixed(2)}`;
    totalElement.textContent = `£${subtotal.toFixed(2)}`;
  }
}
