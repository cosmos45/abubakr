// scripts/main.js
// scripts/main.js
import { loadComponent } from "./utils/components.js";
import { initCarousel } from "../components/carousel/carousel.js";
import { ProductCard } from "../components/product-card/product-card.js";
import { Cart } from "./modules/cart.js";
import { ProductService } from "./services/product-service.js";
import { renderPopularCategories } from "../components/popular-categories/popular-categories.js";
import { initStartCartSlider } from "../components/start-cart/start-cart.js";
import { initializeMostPopular } from "../components/most-popular/most-popular.js";
import { CategoryManager } from "./modules/category-manager.js";
import { SearchService } from "./services/search-service.js";
import { HeaderSearch } from "./modules/header-search.js";
import BrandBanner from "../components/brand-banner/brand-banner.js";
import { GlobalSearch } from "./modules/global-search.js";
import { MobileMenu } from "./modules/mobile-menu.js";
import { initializeFooter } from "../components/footer/footer.js";
import {initializeStickyHeader} from "../scripts/modules/sticky-header.js"
import { initializeSocialMedia } from "../components/social-media/social-media.js";


let cart; // Global cart instance

// Main initialization
async function initializeApp() {
  try {

    // Initialize mobile menu
    const mobileMenu = new MobileMenu();
    mobileMenu.init();
    loadComponent("header", "/components/header/header.html")

    // Initialize cart only once using the singleton pattern
    if (!window.globalCart) {
      cart = new Cart();
      window.globalCart = cart; // Store reference globally
      
      const initResult = await cart.init();
      if (!initResult) {
        console.error("Cart failed to initialize");
        return;
      }
    } else {
      cart = window.globalCart; // Use existing global reference
    }

    const categoryManager = new CategoryManager();
    await categoryManager.init();
    await categoryManager.initializeNavigation();
    
    // Initialize the brand banner
    const brandBanner = new BrandBanner();
    await brandBanner.init();
    
    // Load all components
    await Promise.all([
      loadComponent("carousel-container", "/components/carousel/carousel.html"),
      loadComponent("features-container", "/components/features/features.html"),
      loadComponent(
        "featured-deals-container",
        "/components/featured-deals/featured-deals.html"
      ),
      await loadComponent(
        "best-deals-container",
        "/components/best-deals/best-deals.html"
      ),
      loadComponent(
        "popular-categories",
        "/components/popular-categories/popular-categories.html"
      ),
      loadComponent("fresh-finds", "/components/fresh-finds/fresh-finds.html"),
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
      await loadComponent(
        "start-cart-container",
        "/components/start-cart/start-cart.html"
      ),
      await loadComponent(
        "promo-banners",
        "/components/promo-banners/promo-banners.html"
      ),
      loadComponent("social-media-container", "/components/social-media/social-media.html"),

      await loadComponent(
        "brand-banner-container",
        "/components/brand-banner/brand-banner.html"
      ),
      await loadComponent("footer", "/components/footer/footer.html")
    ]);
    initializeStickyHeader();

   // Add GlobalSearch initialization here, after header is loaded
   const globalSearch = new GlobalSearch();
   await globalSearch.init();
    categoryManager.initializeNavigation();

    // Initialize all components in sequence
    initializeMobileMenu();
    initCarousel();
    await initializeBestDeals();
    await renderPopularCategories();
    await initializeMeatInStartCart();
    await initializeMostPopular();
    await initializeFreshFinds();
    initializeSocialMedia();

    // Initialize cart-related UI elements
    initializeCartIcon();
    initializeQuantityControls();
    initializeAddToCart();

    await initializeFooter();


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
  const menuClose = document.querySelector("#mobile-menu-close");
  const menuOverlay = document.querySelector("#menu-overlay");
  const mobileMenuContainer = document.querySelector("#mobile-menu-container");
  const body = document.body;

  if (menuToggle) {
    menuToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      menuOverlay.classList.add("active");
      mobileMenuContainer.classList.add("active");
      body.style.overflow = "hidden";
    });
  }

  if (menuClose) {
    menuClose.addEventListener("click", () => {
      menuOverlay.classList.remove("active");
      mobileMenuContainer.classList.remove("active");
      body.style.overflow = "";

      // Reset all submenus
      const activeSubmenus = document.querySelectorAll(
        ".mobile-submenu.active"
      );
      activeSubmenus.forEach((submenu) => {
        submenu.classList.remove("active");
      });

      // Reset parent categories visibility
      const parentItems = document.querySelectorAll(
        ".mobile-menu-item.parent-active, .mobile-menu-item.current-parent"
      );
      parentItems.forEach((item) => {
        item.classList.remove("parent-active");
        item.classList.remove("current-parent");
      });
    });
  }

  if (menuOverlay) {
    menuOverlay.addEventListener("click", () => {
      menuOverlay.classList.remove("active");
      mobileMenuContainer.classList.remove("active");
      body.style.overflow = "";

      // Reset all submenus
      const activeSubmenus = document.querySelectorAll(
        ".mobile-submenu.active"
      );
      activeSubmenus.forEach((submenu) => {
        submenu.classList.remove("active");
      });

      // Reset parent categories visibility
      const parentItems = document.querySelectorAll(
        ".mobile-menu-item.parent-active, .mobile-menu-item.current-parent"
      );
      parentItems.forEach((item) => {
        item.classList.remove("parent-active");
        item.classList.remove("current-parent");
      });
    });
  }
}



async function initializeMeatInStartCart() {
  const slider = document.getElementById("start-cart-products");
  if (!slider) {
    console.warn("Start cart slider not found");
    return;
  }

  try {
    slider.innerHTML = '<div class="loading">Loading meat products...</div>';
    
    // Use getMeatProducts instead of getSpecialOffersProducts
    const meatProducts = await ProductService.getMeatProducts();
    
    if (!meatProducts?.length) {
      slider.innerHTML = '<div class="no-products">No meat products available</div>';
      return;
    }

    slider.innerHTML = "";
    
    // Batch render products for better performance
    const fragment = document.createDocumentFragment();
    
    for (const product of meatProducts) {
      const productCard = new ProductCard({
        id: product.id,
        name: product.name,
        price: product.price,
        stock_id: product.id,
        imageUrl: product.imageUrl,
        oldPrice: product.oldPrice,
        size: product.size,
        has_variants: product.has_variants


      });
      
      const cardHtml = await productCard.render();
      const tempContainer = document.createElement("div");
      tempContainer.innerHTML = cardHtml;
      const cardElement = tempContainer.firstElementChild;
      
      // Initialize listeners before adding to DOM
      ProductCard.initializeCardListeners(cardElement);
      fragment.appendChild(cardElement);
    }
    
    slider.appendChild(fragment);
    
    // Update the section title to reflect Meat products
    const sectionTitle = document.querySelector(".start-cart-section .section-title");
    if (sectionTitle) {
      sectionTitle.textContent = "Halal Meat";
    }
    
    // Update the "Shop More" button link to the Halal Meat category
    const shopMoreBtn = document.querySelector(".start-cart-section .shop-more-btn");
    if (shopMoreBtn) {
      shopMoreBtn.href = "/pages/category/category-page.html?name=Halal%20Meat";
      shopMoreBtn.textContent = "Shop Halal Meat";
    }
    
    initStartCartSlider(); // Reuse the existing slider initialization
  } catch (error) {
    console.error("Error initializing meat products in start cart:", error);
    const slider = document.getElementById("start-cart-products");
    if (slider) {
      slider.innerHTML = '<div class="error">Failed to load meat products</div>';
    }
  }
}

export async function initializeBestDeals() {
  const slider = document.getElementById("deals-slider");
  if (!slider) {
    console.warn("Deals slider not found");
    return;
  }

  try {
    slider.innerHTML = '<div class="loading">Loading deals...</div>';

    const dealsProducts = await ProductService.getSpecialOffersProducts();

    if (!dealsProducts?.length) {
      slider.innerHTML = '<div class="no-deals">No deals available</div>';
      return;
    }

    slider.innerHTML = "";

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
        size: product.size,
        has_variants: product.has_variants
      });

      const cardHtml = await productCard.render();
      const tempContainer = document.createElement("div");
      tempContainer.innerHTML = cardHtml;
      const cardElement = tempContainer.firstElementChild;

      // Initialize listeners before adding to DOM
      ProductCard.initializeCardListeners(cardElement);
      fragment.appendChild(cardElement);
    }

    slider.appendChild(fragment);
    initializeSliderControls();
  } catch (error) {
    console.error("Error initializing best deals:", error);
    slider.innerHTML = '<div class="error">Failed to load deals</div>';
  }
}

function initializeSliderControls() {
  const prevBtn = document.querySelector(".prev-btn");
  const nextBtn = document.querySelector(".next-btn");
  const slider = document.querySelector(".products-slider");

  if (!slider || !prevBtn || !nextBtn) {
    console.error("Slider controls not found");
    return;
  }

  const cards = slider.querySelectorAll(".product-card");
  if (!cards.length) {
    prevBtn.style.display = "none";
    nextBtn.style.display = "none";
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
  document.querySelectorAll(".add-to-cart-btn").forEach((button) => {
    button.addEventListener("click", (e) => {
      const card = e.target.closest(".product-card");
      const product = {
        uid: card.dataset.productId,
        name: card.querySelector(".product-name").textContent,
        price: parseFloat(
          card.querySelector(".price").textContent.replace("£", "")
        ),
        quantity: parseInt(card.querySelector(".quantity-control input").value),
        size: card.querySelector(".size")?.textContent || null,
        imageUrl: card.querySelector("img").src,
      };

      if (cart) {
        cart.addItem(product);
        button.textContent = "Added!";
        setTimeout(() => {
          button.textContent = "Add to Cart";
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

async function initializeFreshFinds() {
  const slider = document.getElementById("fresh-finds-slider");
  if (!slider) {
    console.warn("Fresh finds slider not found");
    return;
  }

  try {
    slider.innerHTML =
      '<div class="loading">Loading Chinese cuisine products...</div>';

    // Use Chinese products instead of Special Offers
    const products = await ProductService.getChineseProducts();

    if (!products?.length) {
      console.warn("No Chinese products available");
      slider.innerHTML =
        '<div class="no-products">No Chinese cuisine products available</div>';
      return;
    }

    slider.innerHTML = "";

    // Batch render products for better performance
    const fragment = document.createDocumentFragment();

    for (const product of products) {
      const productCard = new ProductCard({
        id: product.id,
        name: product.name,
        price: product.price,
        stock_id: product.id,
        imageUrl: product.imageUrl,
        oldPrice: product.oldPrice,
        size: product.size,
        has_variants: product.has_variants

      });

      const cardHtml = await productCard.render();
      const tempContainer = document.createElement("div");
      tempContainer.innerHTML = cardHtml;
      const cardElement = tempContainer.firstElementChild;

      // Initialize listeners before adding to DOM
      ProductCard.initializeCardListeners(cardElement);
      fragment.appendChild(cardElement);
    }

    slider.appendChild(fragment);

    // Update the section title
    const sectionTitle = document.querySelector(
      ".fresh-finds-section .section-title"
    );
    if (sectionTitle) {
      sectionTitle.textContent = "Chinese Cuisine";
    }

    // Update the "Continue Shopping" button text
    const continueShoppingBtn = document.querySelector(
      ".fresh-finds-section .continue-shopping"
    );
    if (continueShoppingBtn) {
      continueShoppingBtn.textContent = "Shop Chinese Cuisine";
    }

    // Initialize the slider controls
    initializeFreshFindsSlider();
  } catch (error) {
    console.error("Error initializing Chinese cuisine products:", error);
    slider.innerHTML =
      '<div class="error">Failed to load Chinese cuisine products</div>';
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

    prevBtn.style.opacity = currentIndex === 0 ? "0.5" : "1";
    nextBtn.style.opacity = currentIndex >= maxIndex ? "0.5" : "1";
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

