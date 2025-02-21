// scripts/modules/cart.js
import axiosServices from '../../scripts/services/axiosService.js';


export class Cart {
  constructor() {
    if (Cart.instance) return Cart.instance;
    Cart.instance = this;
    this.items = new Map();
    this.initialized = false;
    this.shippingRates = [];
    this.selectedShippingRate = null;
    this.subtotal = 0;
    this.total = 0;
    this.shippingCharges = 0;
}


  async init() {
    if (this.initialized) return true;
    try {
      if (!document.querySelector(".cart-sidebar")) {
        this.createCartStructure();
      }
      await this.refreshBasket();
      await this.loadShippingRates();
      this.bindEvents();
      this.initialized = true;
      return true;
    } catch (error) {
      console.error("Error initializing cart:", error);
      return false;
    }
  }
  
  renderShippingRates() {
    const container = document.getElementById('shipping-rates-container');
    if (!container) return;
  
    if (this.shippingRates.length === 0 || this.items.size === 0) {
      container.innerHTML = `
        <div class="shipping-rates mb-3">
          <p class="mb-2">Shipping</p>
          <p class="text-muted">Add items to cart to see shipping options</p>
        </div>`;
      return;
    }
  
    container.innerHTML = `
      <div class="shipping-rates mb-3">
        <p class="mb-2">Shipping</p>
        ${this.shippingRates.map(rate => `
          <div class="form-check">
            <input type="radio" 
              id="shipping_${rate.shipping_rate__id}" 
              name="shipping_method" 
              class="form-check-input"
              value="${rate.shipping_rate__id}"
              ${this.selectedShippingRate?.shipping_rate__id === rate.shipping_rate__id ? 'checked' : ''}
            />
            <label class="form-check-label" for="shipping_${rate.shipping_rate__id}">
              ${rate.name}: £${rate.amount.toFixed(2)}
            </label>
          </div>
        `).join('')}
      </div>
    `;
  
    // Add event listeners
    const radioButtons = container.querySelectorAll('input[type="radio"]');
    radioButtons.forEach(radio => {
      radio.addEventListener('change', (e) => {
        this.updateShippingRate(parseInt(e.target.value));
      });
    });
  }
  
  
  async loadShippingRates() {
    try {
      const currentBasket = await axiosServices.get('/commerce/basket');
      const basketData = currentBasket.data.basket;
      
      if (!this.items.size) {
        this.shippingRates = [];
        this.selectedShippingRate = null;
        this.renderShippingRates();
        this.updateCheckoutButtonState();
        return;
      }
  
      const response = await axiosServices.get("/commerce/shipping-rates");
      if (response.status && response.data.shippingRates) {
        this.shippingRates = response.data.shippingRates;
        
        // Check if basket has existing shipping rate
        if (basketData.shipping_rate_id) {
          this.selectedShippingRate = this.shippingRates.find(
            rate => rate.shipping_rate__id === basketData.shipping_rate_id
          );
        } else {
          this.selectedShippingRate = null;
        }
        
        this.renderShippingRates();
        this.updateCheckoutButtonState();
      }
    } catch (error) {
      console.error("Error loading shipping rates:", error);
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
      const newTotal = shippingAmount ? this.subtotal + shippingAmount : this.subtotal;
      totalElement.textContent = `£${newTotal.toFixed(2)}`;
    }
  
    if (shippingElement) {
      shippingElement.textContent = shippingAmount ? `£${shippingAmount.toFixed(2)}` : '£0.00';
    }
  }
  
  

  async updateShippingRate(shippingRateId) {
    try {
      const selectedRate = this.shippingRates.find(
        rate => rate.shipping_rate__id === parseInt(shippingRateId)
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
  
      const response = await axiosServices.post('/commerce/basket/update', {
        shipping_rate_id: shippingRateId,
        shipping_charges: selectedRate.amount,
        sub_total: this.subtotal,
        total: this.subtotal + selectedRate.amount
      });
  
      if (response.status) {
        await this.refreshBasket();
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
      shippingChargesElement.textContent = `£${this.selectedShippingRate.amount.toFixed(2)}`;
    }
  }
  
  
  updateCheckoutButtonState() {
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
      const isDisabled = !this.selectedShippingRate;
      checkoutBtn.disabled = isDisabled;
      checkoutBtn.style.opacity = isDisabled ? '0.5' : '1';
      checkoutBtn.style.cursor = isDisabled ? 'not-allowed' : 'pointer';
    }
  }
  
  async addToBasket(stockId, quantity) {
    try {
      // Check if item already exists in basket
      const existingItem = Array.from(this.items.values()).find(item => 
        item.stock_id === stockId
      );
  
      if (existingItem) {
        // Update quantity if item exists
        const newQuantity = existingItem.quantity + quantity;
        await this.updateQuantity(existingItem.basket_item_id, newQuantity);
        this.showToast('Product quantity updated in basket!');
      } else {
        // Add new item if it doesn't exist
        const formData = new FormData();
        formData.append('stock', stockId);
        formData.append('quantity', quantity);
    
        const response = await axiosServices.post('/commerce/basket/add?type=stock', formData);
        
        if (response.status) {
          this.showToast('Product added to basket successfully!');
          await this.refreshBasket();
        }
      }
      return true;
    } catch (error) {
      console.error('Error adding to basket:', error);
      this.showToast('Failed to add product to basket', 'error');
      return false;
    }
  }

  async refreshBasket() {
    try {
      const response = await axiosServices.get('/commerce/basket');
      if (response.status && response.data.basket) {
        const basketData = response.data.basket;
        
        this.subtotal = parseFloat(basketData.sub_total) || 0;
        this.total = parseFloat(basketData.total) || 0;
        this.shippingCharges = parseFloat(basketData.shipping_charges) || 0;
        
        // Update selected shipping rate
        if (basketData.shipping_rate_id) {
          this.selectedShippingRate = this.shippingRates.find(
            rate => rate.shipping_rate__id === basketData.shipping_rate_id
          );
        }
  
        this.items = new Map(basketData.items.map(item => {
          const imageUrl = item.stock?.attachments?.[0]?.path || '/assets/images/default-product.png';
          
          const mappedItem = {
            id: item.stock_id,
            basket_item_id: item.basket_item__id,
            name: item.name,
            price: parseFloat(item.price),
            quantity: item.quantity,
            totalPrice: parseFloat(item.total),
            imageUrl: imageUrl
          };
          
          return [item.stock_id, mappedItem];
        }));
        
        this.renderSavedItems();
        this.updateCartCount();
        this.updateSubtotal();
        this.renderShippingRates();
      }
    } catch (error) {
      console.error('Error refreshing basket:', error);
      this.showToast('Failed to refresh basket', 'error');
    }
  }
  
  

  
  
  
  
  
  
  
  


showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <div class="toast-content">
      <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
      <span>${message}</span>
    </div>
  `;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
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
      const cartItem = target.closest('.cart-item');
      if (!cartItem) return;

      const basketItemId = cartItem.dataset.basketItemId;
      
      if (target.classList.contains('remove-item')) {
          e.stopPropagation();
          await this.removeBasketItem(basketItemId);
          return;
      }

      if (target.classList.contains('qty-btn')) {
          e.stopPropagation();
          const input = cartItem.querySelector('input');
          const currentQty = parseInt(input.value);
          const newQty = target.classList.contains('plus') ? 
              currentQty + 1 : 
              currentQty - 1;
          
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
      <div class="cart-item" data-basket-item-id="${item.basket_item_id}">
        <div class="cart-item-image">
          <img 
            src="${item.imageUrl}" 
            alt="${item.name}"
            onerror="this.onerror=null; this.src='/assets/images/default-product.png';"
          >
        </div>
        <div class="cart-item-details">
          <h3>${item.name}</h3>
          <div class="price-info">
            <span class="price">£${item.price.toFixed(2)}</span>
          </div>
          <div class="quantity-control">
            <button class="qty-btn minus">−</button>
            <input type="number" value="${item.quantity}" min="1" max="99" readonly>
            <button class="qty-btn plus">+</button>
          </div>
        </div>
        <div class="item-total">£${item.totalPrice.toFixed(2)}</div>
        <button class="remove-item" data-basket-item-id="${item.basket_item_id}">×</button>
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
      const formData = new FormData();
      formData.append('basket_item_id', basketItemId);
      formData.append('quantity', newQuantity);
  
      const response = await axiosServices.post('/commerce/basket/update?type=stock', formData);
      
      if (response.status) {
        await this.refreshBasket();
        this.showToast('Quantity updated successfully!');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating quantity:', error);
      this.showToast('Failed to update quantity', 'error');
      return false;
    }
  }
  async removeBasketItem(basketItemId) {
    try {
      const response = await axiosServices.delete(`/commerce/basket/${basketItemId}`);
      
      if (response.status) {
        await this.refreshBasket();
        this.showToast('Item removed from basket');
        
        // Check if basket is empty after refresh
        if (this.items.size === 0) {
          // Reset shipping related data
          this.selectedShippingRate = null;
          this.shippingCharges = 0;
          this.shippingRates = [];
          
          // Update UI without page reload
          this.renderShippingRates();
          this.updateCheckoutButtonState();
          this.updateTotalsWithShipping(0);
          
          // Hide cart if in sidebar mode
          this.hideCart();
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error removing basket item:', error);
      this.showToast('Failed to remove item', 'error');
      return false;
    }
  }
  

  
  
  


  updateCartCount() {
    const countElements = document.querySelectorAll(".cart-count");
    const totalItems = this.getTotalItems();

    countElements.forEach((element) => {
      element.textContent = totalItems;
    });

    const cartTitle = document.querySelector(".cart-header h2");
    if (cartTitle) {
      cartTitle.textContent = `Cart (${totalItems} items)`;
    }
  }

  getTotalItems() {
    let total = 0;
    this.items.forEach((item) => (total += item.quantity));
    return total;
  }
updateSubtotal() {
  const subtotalElement = document.querySelector(".subtotal-amount");
  const totalElement = document.querySelector(".total-amount");
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
}


  renderSavedItems() {
    const cartItems = document.querySelector(".cart-items");
    if (!cartItems) return;

    cartItems.innerHTML = "";
    this.items.forEach((item) => {
      this.addItemUI(item);
    });

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
        const itemHtml = `
            <div class="cart-item" data-basket-item-id="${item.basket_item_id}">
                <img src="${item.imageUrl}" alt="${item.name}" 
                     onerror="this.src='/assets/images/default-product.png'">
                <div class="cart-item-details">
                    <h3 class="item-name">${item.name}</h3>
                    <div class="price-info">
                        <span class="current-price">£${item.price.toFixed(2)}</span>
                    </div>
                    <div class="d-flex align-items-center mt-3">
                        <div class="quantity-control">
                            <button class="qty-btn minus">−</button>
                            <input type="number" value="${item.quantity}" min="1" max="99" readonly>
                            <button class="qty-btn plus">+</button>
                        </div>
                        <span class="item-total">£${item.totalPrice.toFixed(2)}</span>
                    </div>
                </div>
                <button class="remove-item" aria-label="Remove item">×</button>
            </div>`;
        cartItemsContainer.insertAdjacentHTML("beforeend", itemHtml);
    });

    this.initializeCartPageControls();
    this.updateCartPageTotals();
}


initializeCartPageControls() {
  const cartItems = document.querySelectorAll(".cart-item");
  
  cartItems.forEach(item => {
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
