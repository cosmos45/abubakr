// scripts/main.js
import { loadComponent } from "./utils/components.js";
import { initCarousel } from "../components/carousel/carousel.js";
import { ProductCard } from "../components/product-card/product-card.js";
import { Cart } from "./modules/cart.js";
import { ProductService } from "./services/product-service.js";
import { renderPopularCategories } from '../components/popular-categories/popular-categories.js';
import { initStartCartSlider } from "../components/start-cart/start-cart.js";
import { initMostPopularSlider } from "../components/most-popular/most-popular.js";
import { CategoryManager } from "./modules/category-manager.js";
import { SearchService } from "./services/search-service.js";
import { HeaderSearch } from "./modules/header-search.js";

let cart; // Global cart instance

// Main initialization
async function initializeApp() {
  try {
    await ProductService.getDealsProducts();

    // Initialize cart first
    
    cart = new Cart();
    const cartInitialized = await cart.init();

    if (!cartInitialized) {
      console.error("Cart failed to initialize");
      return;
    }
    const categoryManager = new CategoryManager();
    await categoryManager.init();

    // Load all components
    await Promise.all([
      loadComponent("header", "/components/header/header.html"),
      loadComponent("carousel-container", "/components/carousel/carousel.html"),
      loadComponent("features-container", "/components/features/features.html"),
      loadComponent(
        "featured-deals-container",
        "/components/featured-deals/featured-deals.html"
      ),
    
      loadComponent(
        "popular-categories",
        "/components/popular-categories/popular-categories.html"
      ),
      loadComponent("fresh-finds", "/components/fresh-finds/fresh-finds.html"),
      await loadComponent(
        "promo-banners",
        "/components/promo-banners/promo-banners.html"
      ),
      loadComponent(
        "most-popular",
        "/components/most-popular/most-popular.html"
      ),
      loadComponent(
        "shop-with-us",
        "/components/shop-with-us/shop-with-us.html"
      ),
      loadComponent(
        "subscribe-section",
        "/components/subscribe/subscribe.html"
      ),
      await loadComponent("footer", "/components/footer/footer.html"),
      await loadComponent(
        "best-deals-container",
        "/components/best-deals/best-deals.html"
    )
    ]);
    categoryManager.initializeNavigation();

    // Initialize all components in sequence
    initializeMobileMenu();
    initCarousel();
    await initializeBestDeals();
    await renderPopularCategories();

    await initializeStartCart();
    await initializeFreshFinds();
    initializeCartIcon();
    initializeQuantityControls();
    initializeAddToCart();
    new HeaderSearch();
  } catch (error) {
    console.error("Error initializing application:", error);
    const mainContainer = document.querySelector("main.container");
    if (mainContainer) {
      mainContainer.innerHTML =
        '<div class="alert alert-danger">Failed to load application. Please refresh the page.</div>';
    }
  }
}

function initializeMobileMenu() {
  const menuToggle = document.querySelector(".mobile-menu-toggle");
  const navMenu = document.querySelector(".nav-menu");
  const body = document.body;

  const overlay = document.createElement("div");
  overlay.className = "menu-overlay";
  body.appendChild(overlay);

  menuToggle?.addEventListener("click", function (e) {
    e.stopPropagation();
    navMenu.classList.toggle("active");
    overlay.classList.toggle("active");
    body.style.overflow = navMenu.classList.contains("active") ? "hidden" : "";
  });

  overlay.addEventListener("click", function () {
    navMenu.classList.remove("active");
    overlay.classList.remove("active");
    body.style.overflow = "";
  });
}

export async function initializeBestDeals() {
  const slider = document.getElementById('deals-slider');
  if (!slider) {
      console.warn('Deals slider not found');
      return;
  }

  try {
      slider.innerHTML = '<div class="loading">Loading deals...</div>';
      
      const dealsProducts = await ProductService.getDealsProducts();
      
      if (!dealsProducts?.length) {
          slider.innerHTML = '<div class="no-deals">No deals available</div>';
          return;
      }

      slider.innerHTML = '';
      
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
              size: product.size
          });
          
          const cardHtml = await productCard.render();
          const tempContainer = document.createElement('div');
          tempContainer.innerHTML = cardHtml;
          const cardElement = tempContainer.firstElementChild;
          
          // Initialize listeners before adding to DOM
          ProductCard.initializeCardListeners(cardElement);
          fragment.appendChild(cardElement);
      }
      
      slider.appendChild(fragment);
      initializeSliderControls();
      
  } catch (error) {
      console.error('Error initializing best deals:', error);
      slider.innerHTML = '<div class="error">Failed to load deals</div>';
  }
}



function initializeSliderControls() {
    const prevBtn = document.querySelector(".prev-btn");
    const nextBtn = document.querySelector(".next-btn");
    const slider = document.querySelector(".products-slider");
    
    if (!slider || !prevBtn || !nextBtn) {
        console.error('Slider controls not found');
        return;
    }

    const cards = slider.querySelectorAll(".product-card");
    if (!cards.length) {
        prevBtn.style.display = 'none';
        nextBtn.style.display = 'none';
        return;
    }

  let currentIndex = 0;
  const totalCards = cards.length;
  const cardsToShow = 5;
  const cardWidth = 200;
  const cardGap = 20;

  function updateSliderPosition() {
    const offset = currentIndex * (cardWidth + cardGap);
    slider.style.transform = `translateX(-${offset}px)`;

    prevBtn.style.opacity = currentIndex === 0 ? "0.5" : "1";
    nextBtn.style.opacity =
      currentIndex >= totalCards - cardsToShow ? "0.5" : "1";
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex >= totalCards - cardsToShow;
  }

  prevBtn?.addEventListener("click", () => {
    if (currentIndex > 0) {
      currentIndex--;
      updateSliderPosition();
    }
  });

  nextBtn?.addEventListener("click", () => {
    if (currentIndex < totalCards - cardsToShow) {
      currentIndex++;
      updateSliderPosition();
    }
  });

  updateSliderPosition();
}

function initializeQuantityControls() {
  document.querySelectorAll(".quantity-control").forEach((control) => {
    const input = control.querySelector("input");
    const minusBtn = control.querySelector(".minus");
    const plusBtn = control.querySelector(".plus");

    minusBtn?.addEventListener("click", () => {
      const currentValue = parseInt(input.value);
      if (currentValue > 1) input.value = currentValue - 1;
    });

    plusBtn?.addEventListener("click", () => {
      const currentValue = parseInt(input.value);
      if (currentValue < 99) input.value = currentValue + 1;
    });
  });
}

function initializeAddToCart() {
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const card = e.target.closest('.product-card');
            const product = {
                uid: card.dataset.productId,
                name: card.querySelector('.product-name').textContent,
                price: parseFloat(card.querySelector('.price').textContent.replace('£', '')),
                quantity: parseInt(card.querySelector('.quantity-control input').value),
                size: card.querySelector('.size')?.textContent || null,
                imageUrl: card.querySelector('img').src
            };
            
            if (cart) {
                cart.addItem(product);
                button.textContent = 'Added!';
                setTimeout(() => {
                    button.textContent = 'Add to Cart';
                }, 2000);
            }
        });
    });
}


function initializeCartIcon() {
  const cartIcon = document.querySelector(".cart-icon");
  cartIcon?.addEventListener("click", (e) => {
    e.preventDefault();
    if (cart) {
      cart.showCart();
    }
  });
}

// Initialize the application when DOM is ready
document.addEventListener("DOMContentLoaded", initializeApp);


async function initializeStartCart() {
  const slider = document.getElementById("start-cart-products");
  if (!slider) return;

  try {
    slider.innerHTML = "";
    // Wait for products to be loaded
    const products = await ProductService.getDealsProducts();
    if (!products?.length) {
      console.warn('No products available for start cart');
      return;
    }

    const startProducts = products.slice(0, 5);
    for (const product of startProducts) {
      const productCard = new ProductCard(product);
      const cardHtml = await productCard.render();
      slider.insertAdjacentHTML("beforeend", cardHtml);
    }

    initStartCartSlider();
  } catch (error) {
    console.error("Error initializing start cart:", error);
  }
}
// Load popular categories
const popularCategoriesContainer = document.getElementById('popular-categories');
if (popularCategoriesContainer) {
    popularCategoriesContainer.innerHTML = await fetch('/components/popular-categories/popular-categories.html')
        .then(response => response.text());
}

async function initializeFreshFinds() {
  const slider = document.getElementById("fresh-finds-slider");
  if (!slider) return;

  try {
    slider.innerHTML = "";
    // Wait for products to be loaded
    const products = await ProductService.getDealsProducts();
    if (!products?.length) {
      console.warn('No products available for fresh finds');
      return;
    }

    for (const product of products) {
      const productCard = new ProductCard(product);
      const cardHtml = await productCard.render();
      slider.insertAdjacentHTML("beforeend", cardHtml);
    }

    initializeFreshFindsSlider();
  } catch (error) {
    console.error("Error initializing fresh finds:", error);
  }
}



function initializeFreshFindsSlider() {
  const slider = document.querySelector("#fresh-finds-slider");
  const prevBtn = document.querySelector(".fresh-finds-section .prev-btn");
  const nextBtn = document.querySelector(".fresh-finds-section .next-btn");

  if (!slider || !prevBtn || !nextBtn) return;

  let currentIndex = 0;
  const cardWidth = 280;
  const cardGap = 24;
  const totalWidth = cardWidth + cardGap;

  function updateSliderPosition() {
    if (window.innerWidth <= 768) {
      slider.style.transform = "";
      return;
    }

    const containerWidth = slider.parentElement.offsetWidth - 120;
    const visibleCards = Math.floor(containerWidth / totalWidth);
    const maxIndex = Math.max(0, slider.children.length - visibleCards);

    currentIndex = Math.min(currentIndex, maxIndex);
    const offset = currentIndex * totalWidth;

    slider.style.transform = `translateX(-${offset}px)`;

    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex >= maxIndex;
  }

  prevBtn.addEventListener("click", () => {
    if (currentIndex > 0) {
      currentIndex--;
      updateSliderPosition();
    }
  });

  nextBtn.addEventListener("click", () => {
    const containerWidth = slider.parentElement.offsetWidth - 120;
    const visibleCards = Math.floor(containerWidth / totalWidth);
    const maxIndex = Math.max(0, slider.children.length - visibleCards);

    if (currentIndex < maxIndex) {
      currentIndex++;
      updateSliderPosition();
    }
  });

  updateSliderPosition();
  window.addEventListener("resize", () => {
    currentIndex = 0;
    updateSliderPosition();
  });
}

// Add to initializeApp function
await loadComponent(
  "start-cart-container",
  "/components/start-cart/start-cart.html"
);
await initializeStartCart();

async function initializeMostPopular() {
  const slider = document.getElementById("most-popular-slider");
  if (!slider) return;

  try {
    slider.innerHTML = "";
    const popularProducts = ProductService.products.slice(0, 5);

    for (const product of popularProducts) {
      const productCard = new ProductCard(product);
      const cardHtml = await productCard.render();

      const processedHtml = cardHtml
        .replace(/\${name}/g, product.name)
        .replace(/\${price}/g, product.price.toFixed(2))
        .replace(/\${id}/g, product.id)
        .replace(/\${imageUrl}/g, product.imageUrl);

      slider.insertAdjacentHTML("beforeend", processedHtml);
    }

    initMostPopularSlider();
  } catch (error) {
    console.error("Error initializing most popular:", error);
  }
}

// Call initializeMostPopular after loading components
await initializeMostPopular();

async function initializeSearch() {
  try {
    const searchInput = document.getElementById("search-input");
    const categorySelect = document.getElementById("category-select");
    const suggestionsContainer = document.getElementById("search-suggestions");

    if (!searchInput || !categorySelect || !suggestionsContainer) {
      console.warn("Search elements not found in DOM");
      return;
    }

    const searchService = new SearchService();

    // Wait for categories to be initialized
    const categories = await searchService.getAllCategories();

    // Populate category dropdown
    categorySelect.innerHTML = '<option value="all">All categories</option>';
    categories.forEach((category) => {
      const option = document.createElement("option");
      option.value = category.id;
      option.textContent = category.name;
      categorySelect.appendChild(option);
    });

    let debounceTimeout;

    searchInput.addEventListener("input", (e) => {
      clearTimeout(debounceTimeout);
      debounceTimeout = setTimeout(() => {
        const query = e.target.value;
        const selectedCategory = categorySelect.value;

        if (query.length < 2) {
          suggestionsContainer.classList.remove("active");
          return;
        }

        const suggestions = searchService.search(query, selectedCategory);
        renderSuggestions(suggestions);
      }, 300);
    });

    function renderSuggestions(suggestions) {
      suggestionsContainer.innerHTML = "";

      if (suggestions.length === 0) {
        suggestionsContainer.classList.remove("active");
        return;
      }

      suggestions.forEach((product) => {
        const div = document.createElement("div");
        div.className = "suggestion-item";
        div.innerHTML = `
                    <img src="${product.imageUrl}" alt="${product.name}">
                    <div class="product-info">
                        <div class="product-name">${product.name}</div>
                        <div class="product-description">${
                          product.description || ""
                        }</div>
                    </div>
                `;

        div.addEventListener("click", () => {
          window.location.href = `/pages/product/product-page.html?id=${product.id}`;
        });

        suggestionsContainer.appendChild(div);
      });

      suggestionsContainer.classList.add("active");
    }
  } catch (error) {
    console.error("Error initializing search:", error);
  }
}

// Add to initializeApp function
await initializeSearch();
