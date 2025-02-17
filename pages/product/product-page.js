import { loadComponent } from '../../scripts/utils/components.js';
import { Cart } from '../../scripts/modules/cart.js';
import { productData } from '../../scripts/services/product-service.js';

class ProductPage {
    constructor() {
        this.productId = new URLSearchParams(window.location.search).get('id');
        this.cart = new Cart();
    }
    async init() {
        try {
            // Load header and footer first
            await Promise.all([
                loadComponent('header', '/abu-bakr-store-v2/components/header/header.html'),
                loadComponent('footer', '/abu-bakr-store-v2/components/footer/footer.html')
            ]);
    
            // Initialize cart and ensure proper DOM structure
            await this.cart.init();
            this.moveCartToBody();
    
            await this.loadProductData();
            this.initializeEventListeners();
            this.initializeSections();
            this.initializeCartIcon();
        } catch (error) {
            console.error('Error initializing product page:', error);
        }
    }
      
    
    
    
    hideCartSidebar() {
        const cartSidebar = document.querySelector('.cart-sidebar');
        const cartOverlay = document.querySelector('.cart-overlay');
        if (cartSidebar && cartOverlay) {
            cartSidebar.classList.remove('active');
            cartOverlay.classList.remove('active');
            document.body.style.overflow = '';
            setTimeout(() => {
                cartSidebar.style.visibility = 'hidden';
                cartOverlay.style.visibility = 'hidden';
            }, 300);
        }
    }


    showCartSidebar() {
        const cartSidebar = document.querySelector('.cart-sidebar');
        const cartOverlay = document.querySelector('.cart-overlay');
        if (cartSidebar && cartOverlay) {
            cartSidebar.style.visibility = 'visible';
            cartOverlay.style.visibility = 'visible';
            // Force reflow
            cartSidebar.offsetHeight;
            cartSidebar.classList.add('active');
            cartOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }
    moveCartToBody() {
        const mainCartElements = document.querySelectorAll('main .cart-sidebar, main .cart-overlay');
        mainCartElements.forEach(element => element.remove());
    
        const cartSidebar = document.querySelector('.cart-sidebar');
        const cartOverlay = document.querySelector('.cart-overlay');
    
        if (cartSidebar && cartSidebar.parentElement !== document.body) {
            document.body.appendChild(cartSidebar);
        }
        if (cartOverlay && cartOverlay.parentElement !== document.body) {
            document.body.appendChild(cartOverlay);
        }
    
        if (cartSidebar && cartOverlay) {
            // Ensure proper initial state
            cartSidebar.style.visibility = 'hidden';
            cartOverlay.style.visibility = 'hidden';
            cartSidebar.classList.remove('active');
            cartOverlay.classList.remove('active');
        }
    }
    
      

   
    initializeCartIcon() {
        const cartIcon = document.querySelector('.cart-icon');
        const closeBtn = document.querySelector('.close-cart');
        const overlay = document.querySelector('.cart-overlay');

        cartIcon?.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.cart.showCart();
        });

        closeBtn?.addEventListener('click', () => this.cart.hideCart());
        overlay?.addEventListener('click', () => this.cart.hideCart());
    }
    

    async loadProductData() {
        const product = productData.getProductById(this.productId);
        if (!product) {
            console.error('Product not found');
            return;
        }

        // Update page elements
        document.title = `${product.name} - Abu Bakr Store`;
        document.getElementById('product-name-breadcrumb').textContent = product.name;
        document.getElementById('product-title').textContent = product.name;
        document.getElementById('product-image').src = product.imageUrl;
        document.getElementById('product-image').alt = product.name;
        document.getElementById('product-price').textContent = `£${product.price.toFixed(2)}`;
        document.getElementById('product-sku').textContent = `00${product.id}`;
        
        if (product.oldPrice) {
            document.getElementById('product-old-price').textContent = `£${product.oldPrice.toFixed(2)}`;
        }

        // Set section contents
        document.getElementById('product-info-content').innerHTML = product.description || 
            "Product information will be updated soon.";
        document.getElementById('return-policy-content').innerHTML = 
            "We have a 30-day return policy, which means you have 30 days after receiving your item to request a return.";
        document.getElementById('shipping-info-content').innerHTML = 
            "We offer free shipping on all orders over £50. Standard delivery takes 3-5 working days.";
    }

    initializeSections() {
        document.querySelectorAll('.section-header').forEach(header => {
            const content = header.nextElementSibling;
            const icon = header.querySelector('.toggle-icon');

            if (header.classList.contains('active')) {
                content.style.display = 'block';
            }

            header.addEventListener('click', () => {
                const isActive = header.classList.contains('active');
                
                // Hide all sections
                document.querySelectorAll('.section-header').forEach(h => {
                    h.classList.remove('active');
                    h.querySelector('.toggle-icon').textContent = '+';
                    h.nextElementSibling.style.display = 'none';
                });

                // Toggle clicked section
                if (!isActive) {
                    header.classList.add('active');
                    icon.textContent = '−';
                    content.style.display = 'block';
                }
            });
        });
    }

    initializeEventListeners() {
        const quantityInput = document.querySelector('.quantity-control input');
        const minusBtn = document.querySelector('.quantity-control .minus');
        const plusBtn = document.querySelector('.quantity-control .plus');
        const addToCartBtn = document.querySelector('.add-to-cart-btn');

        minusBtn?.addEventListener('click', () => {
            const currentValue = parseInt(quantityInput.value);
            if (currentValue > 1) quantityInput.value = currentValue - 1;
        });

        plusBtn?.addEventListener('click', () => {
            const currentValue = parseInt(quantityInput.value);
            if (currentValue < 99) quantityInput.value = currentValue + 1;
        });

        addToCartBtn?.addEventListener('click', () => {
            const product = productData.getProductById(this.productId);
            if (product) {
                this.cart.addItem({
                    ...product,
                    quantity: parseInt(quantityInput.value)
                });
                addToCartBtn.textContent = 'Added!';
                setTimeout(() => {
                    addToCartBtn.textContent = 'Add to Cart';
                }, 2000);
                // Show cart after adding item
                this.cart.toggleCart(true);
            }
        });
        
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const productPage = new ProductPage();
    productPage.init();
});
