// scripts/modules/mobile-menu.js
import { categoryData } from "../services/category-service.js";
import { navbarCategoryData } from "../services/category-service.js";

export class MobileMenu {
  constructor() {
    this.menuToggle = document.querySelector(".mobile-menu-toggle");
    this.menuClose = document.querySelector("#mobile-menu-close");
    this.menuOverlay = document.querySelector("#menu-overlay");
    this.mobileMenuContainer = document.querySelector("#mobile-menu-container");
    this.body = document.body;
  }

  async init() {
    if (!this.menuToggle) return;
    
    this.setupEventListeners();
    
    // Add this to populate the menu content
    await this.populateMobileMenuCategories();
  }

  async populateMobileMenuCategories() {
    const mobileMenuList = document.querySelector("#mobile-menu-list");
    if (!mobileMenuList) return;
    
    try {
      const categories = await navbarCategoryData.fetchNavbarCategories();
      
      // Clear existing menu items
      mobileMenuList.innerHTML = "";
      
      // Populate with categories
      categories.slice(0, 10).forEach((category) => {
        const li = document.createElement("li");
        li.className = "mobile-menu-item";
        li.dataset.categoryId = category.uid;
        
        const a = document.createElement("a");
        a.href = category.child?.length > 0 
          ? "javascript:void(0)" 
          : `/pages/category/category-page.html?name=${encodeURIComponent(category.name)}`;
        a.innerHTML = `${category.name} ${category.child?.length > 0 ? '<i class="fas fa-chevron-right"></i>' : ''}`;
        
        li.appendChild(a);
        
        // Add submenu if category has children
        if (category.child?.length > 0) {
          this.createSubmenu(li, category);
        }
        
        mobileMenuList.appendChild(li);
      });
      
      // Setup submenu event listeners
      this.setupSubmenuListeners();
      
    } catch (error) {
      console.error("Error populating mobile menu categories:", error);
    }
  }
  
 
// Add this to your MobileMenu class
setupSubmenuListeners() {
  document.querySelectorAll('.mobile-menu-item').forEach(item => {
    const link = item.querySelector('a');
    const submenu = item.querySelector('.mobile-submenu');
    
    if (link && submenu) {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Show the submenu
        submenu.classList.add('active');
        
        // Hide sibling items at the same level
        const siblings = Array.from(item.parentElement.children);
        siblings.forEach(sibling => {
          if (sibling !== item && sibling.classList.contains('mobile-menu-item')) {
            sibling.classList.add('parent-active');
          }
        });
        
        // Mark current parent
        item.classList.add('current-parent');
      });
    }
  });
}
createSubmenu(parentLi, category) {
  // Create submenu container
  const submenu = document.createElement("div");
  submenu.className = "mobile-submenu";
  submenu.id = `submenu-${category.slug}`;  // use slug instead of uid

  // Create submenu header
  const submenuHeader = document.createElement("div");
  submenuHeader.className = "mobile-submenu-header";

  // Create back button
  const backBtn = document.createElement("button");
  backBtn.className = "mobile-back-btn";
  backBtn.innerHTML = '<i class="fas fa-chevron-left"></i> Back';
  backBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    submenu.classList.remove('active');

    // Show all parent categories again
    const parentItems = document.querySelectorAll('.mobile-menu-item.parent-active');
    parentItems.forEach(item => {
      item.classList.remove('parent-active');
    });

    // Remove current parent marker
    parentLi.classList.remove('current-parent');
  });

  // Create title
  const title = document.createElement("h3");
  title.className = "mobile-submenu-title";
  title.textContent = category.name;

  // Add header elements to header
  submenuHeader.appendChild(backBtn);
  submenuHeader.appendChild(title);
  submenu.appendChild(submenuHeader);

  // Create submenu list
  const submenuList = document.createElement("ul");
  submenuList.className = "mobile-menu-list";

  // Add child categories
  category.child.forEach(childCategory => {
    // No uid check, just use name and slug
    const childLi = document.createElement("li");
    childLi.className = "mobile-menu-item";
    // No data-category-id attribute

    const childA = document.createElement("a");
    childA.href = childCategory.child?.length > 0 
      ? "javascript:void(0)" 
      : `/pages/category/category-page.html?name=${encodeURIComponent(childCategory.name)}`;
    childA.innerHTML = `${childCategory.name} ${childCategory.child?.length > 0 ? '<i class="fas fa-chevron-right"></i>' : ''}`;

    childLi.appendChild(childA);

    // Recursively create grandchild submenu if needed
    if (childCategory.child?.length > 0) {
      this.createSubmenu(childLi, childCategory);
    }

    submenuList.appendChild(childLi);
  });

  submenu.appendChild(submenuList);
  parentLi.appendChild(submenu);
}


  setupEventListeners() {
    this.menuToggle?.addEventListener("click", (e) => {
      e.stopPropagation();
      this.showMenu();
    });

    this.menuClose?.addEventListener("click", () => {
      this.hideMenu();
    });

    this.menuOverlay?.addEventListener("click", () => {
      this.hideMenu();
    });
  }

  showMenu() {
    this.menuOverlay.classList.add("active");
    this.mobileMenuContainer.classList.add("active");
    this.body.style.overflow = "hidden";
  }

  hideMenu() {
    this.menuOverlay.classList.remove("active");
    this.mobileMenuContainer.classList.remove("active");
    this.body.style.overflow = "";

    // Reset all submenus
    const activeSubmenus = document.querySelectorAll(".mobile-submenu.active");
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
  }
}
