// scripts/modules/cart.js

import axiosServices from '../../scripts/services/axiosService.js';

export class Cart {
  constructor() {
    if (Cart.instance) {
      return Cart.instance; // Return existing instance
    }
    Cart.instance = this; // Create new instance
    this.items = new Map();
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return true; // Prevent re-initialization

    try {
      if (!document.querySelector(".cart-sidebar")) {
        this.createCartStructure();
      }
      this.loadCartFromStorage();
      this.bindEvents();
      this.renderSavedItems();
      this.initialized = true;
      return true;
    } catch (error) {
      console.error("Error initializing cart:", error);
      return false;
    }
  }

  async refreshCart() {
    this.loadCartFromStorage();
    this.renderSavedItems();
    this.updateCartCount();
    this.updateSubtotal();
  }

  async addToBasket(stockId, quantity) {
    try {
      const formData = new FormData();
      formData.append('stock', stockId);
      formData.append('quantity', quantity);
  
      const response = await axiosServices.post('/commerce/basket/add?type=stock', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
  
      if (response.status) {
        this.showToast('Product added to basket successfully!');
        await this.refreshBasket();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error adding to basket:', error);
      this.showToast('Failed to add product to basket', 'error');
      return false;
    }
  }
  

  async refreshBasket() {
    try {
      const response = await axiosServices.get('/commerce/basket');
      if (response.status) {
        const basketData = response.data.data.basket;
        this.items = new Map(basketData.items.map(item => [
          item.stock_id,
          {
            id: item.stock_id,
            basket_item_id: item.basket_item__id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            totalPrice: item.total,
            tax_amount: item.tax_amount || 0,
            total_discount: item.total_discount || 0
          }
        ]));
        this.renderSavedItems();
        this.updateCartCount();
        this.updateSubtotal();
      }
    } catch (error) {
      console.error('Error refreshing basket:', error);
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

    cartItems?.addEventListener("click", (e) => {
      const target = e.target;
      const item = target.closest(".cart-item");
      if (!item) return;

      const productId = item.dataset.id;
      if (target.classList.contains("plus")) {
        this.updateQuantity(productId, 1);
      } else if (target.classList.contains("minus")) {
        this.updateQuantity(productId, -1);
      } else if (target.classList.contains("remove-item")) {
        this.removeBasketItem(productId);
      }
    });


  document.querySelectorAll('.remove-item').forEach(button => {
    button.addEventListener('click', async (e) => {
      const basketItemId = e.target.dataset.basketItemId;
      if (basketItemId) {
        const success = await this.removeBasketItem(basketItemId);
        if (success) {
          await this.refreshBasket();
        }
      }
    });
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

  loadCartFromStorage() {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      const cartData = JSON.parse(savedCart);
      this.items = new Map(cartData);
    }
  }

  saveCartToStorage() {
    const cartData = Array.from(this.items.entries());
    localStorage.setItem("cart", JSON.stringify(cartData));
  }

  addItem(product) {
    if (!product || !product.id) return;

    const productId = product.id.toString();
    const existingItem = this.items.get(productId);
    const quantity = parseInt(product.quantity) || 1;

    if (existingItem) {
      const newQuantity = Math.min(existingItem.quantity + quantity, 99);
      existingItem.quantity = newQuantity;
      existingItem.totalPrice = existingItem.price * newQuantity;
      this.updateItemUI(existingItem);
    } else {
      const newItem = {
        id: productId,
        name: product.name,
        price: product.price,
        quantity: quantity,
        imageUrl: product.imageUrl,
        oldPrice: product.oldPrice,
        totalPrice: product.price * quantity,
      };
      this.items.set(productId, newItem);
      this.addItemUI(newItem);
    }

    this.updateCartCount();
    this.updateSubtotal();
    this.saveCartToStorage();
    this.showCart();
  }

  addItemUI(product) {
    const cartItems = document.querySelector(".cart-items");
    if (!cartItems) return;
  
    const itemHTML = `
      <div class="cart-item" data-stock-id="${product.id}" data-basket-item-id="${product.basket_item__id}">
        <div class="cart-item-image">
          <img src="${product.imageUrl || '/assets/img/default-product.jpg'}" alt="${product.name}">
        </div>
        <div class="cart-item-details">
          <h3>${product.name}</h3>
          <div class="price-info">
            <span class="price">£${product.price.toFixed(2)}</span>
            ${product.total_discount > 0 ? `<span class="discount">-£${product.total_discount}</span>` : ''}
          </div>
          <div class="quantity-control">
            <button class="qty-btn minus">−</button>
            <input type="number" value="${product.quantity}" min="1" max="99" readonly>
            <button class="qty-btn plus">+</button>
          </div>
        </div>
        <div class="item-total">£${product.totalPrice.toFixed(2)}</div>
        <button class="remove-item" data-basket-item-id="${product.basket_item_id}">×</button>
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

  updateQuantity(productId, change) {
    const item = this.items.get(productId);
    if (!item) return;

    const newQuantity = item.quantity + change;
    if (newQuantity > 0 && newQuantity <= 99) {
      item.quantity = newQuantity;
      this.updateItemUI(item);
    }
  }
  async removeBasketItem(basketItemId) {
    try {
      const response = await axiosServices.delete(`/commerce/basket/item/${basketItemId}`);
      
      if (response.status) {
        // Remove item from UI
        const itemElement = document.querySelector(`.cart-item[data-basket-item-id="${basketItemId}"]`);
        if (itemElement) {
          itemElement.remove();
        }
        
        // Refresh basket data
        await this.refreshBasket();
        
        // Show success message
        this.showToast('Item removed from basket');
        
        // Hide cart if empty
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

  // Add or update these methods in the Cart class
  async refreshCart() {
    this.loadCartFromStorage();
    this.renderSavedItems();
    this.updateCartCount();
    this.updateSubtotal();
    if (window.location.pathname.includes("cart-page.html")) {
      this.renderCartPage();
    }
  }

  renderCartPage() {
    const cartItemsContainer = document.getElementById("cart-items-container");
    if (!cartItemsContainer) return;

    cartItemsContainer.innerHTML = "";
    let hasItems = false;

    this.items.forEach((item) => {
      hasItems = true;
      const itemHtml = `
            <div class="cart-item" data-id="${item.id}">
                <div class="cart-item-image">
                    <img src="${item.imageUrl}" alt="${item.name}">
                </div>
                <div class="cart-item-content">
                    <div class="item-header">
                        <h3 class="product-name">${item.name}</h3>
                        <div class="price-info">
                            ${
                              item.oldPrice
                                ? `<span class="old-price">£${item.oldPrice.toFixed(
                                    2
                                  )}</span>`
                                : ""
                            }
                            <span class="current-price">£${item.price.toFixed(
                              2
                            )}</span>
                        </div>
                    </div>
                    <div class="item-controls">
                        <div class="quantity-control">
                            <button class="minus">−</button>
                            <input type="number" value="${
                              item.quantity
                            }" min="1" max="99" readonly>
                            <button class="plus">+</button>
                        </div>
                        <span class="item-total">£${(
                          item.price * item.quantity
                        ).toFixed(2)}</span>
                        <button class="remove-item">
                            <i class="far fa-trash-alt"></i>
                        </button>
                    </div>
                </div>
            </div>`;
      cartItemsContainer.insertAdjacentHTML("beforeend", itemHtml);
    });

    if (!hasItems) {
      cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                <p>Your cart is empty</p>
                <a href="/" class="continue-shopping">Continue Shopping</a>
            </div>`;
    } else {
      // Add note section after products
      const noteSection = `
            <div class="note-section">
                <a href="#" class="add-note">
                    <i class="fas fa-pencil-alt"></i> Add a note
                </a>
            </div>`;
      cartItemsContainer.insertAdjacentHTML("beforeend", noteSection);
    }

    this.initializeCartControls();
    this.updateSubtotalForPage();
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
