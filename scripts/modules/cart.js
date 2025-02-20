// scripts/modules/cart.js

import axiosServices from '../../scripts/services/axiosService.js';

export class Cart {
  constructor() {
    if (Cart.instance) return Cart.instance;
    Cart.instance = this;
    this.items = new Map();
    this.initialized = false;
  }


  async init() {
    if (this.initialized) return true;
    try {
      if (!document.querySelector(".cart-sidebar")) {
        this.createCartStructure();
      }
      await this.refreshBasket(); // Only use API data
      this.bindEvents();
      this.initialized = true;
      return true;
    } catch (error) {
      console.error("Error initializing cart:", error);
      return false;
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
      console.log('Basket Response:', response.data.basket);
  
      if (response.status && response.data.basket) {
        const basketData = response.data.basket;
        
        // Map items directly from basket data
        this.items = new Map(basketData.items.map(item => {
          console.log('Basket Item:', item);
          
          // Get image from stock attachments in basket data
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
          
          console.log('Mapped Item:', mappedItem);
          return [item.stock_id, mappedItem];
        }));
        
        console.log('Final Items Map:', Object.fromEntries(this.items));
        
        this.renderSavedItems();
        this.updateCartCount();
        this.updateSubtotal();
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
        
        if (this.items.size === 0) {
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
    let total = 0;
    this.items.forEach((item) => (total += item.price * item.quantity));

    const subtotalElement = document.querySelector(".subtotal-amount");
    if (subtotalElement) {
      subtotalElement.textContent = `£${total.toFixed(2)}`;
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
                        <span class="item-total">£${(item.price * item.quantity).toFixed(2)}</span>
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
  
  if (!subtotalElement || !totalElement) return;

  let subtotal = 0;
  this.items.forEach(item => {
      subtotal += item.price * item.quantity;
  });

  subtotalElement.textContent = `£${subtotal.toFixed(2)}`;
  totalElement.textContent = `£${subtotal.toFixed(2)}`;
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
