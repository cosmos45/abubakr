import { categoryData } from "../services/category-service.js";
import { navbarCategoryData } from "../services/category-service.js";

export class CategoryManager {
  constructor() {
    this.categories = [];
    this.maxFeaturedCategories = 8;
  }

  async init() {
    
    // Call navigation initialization after categories are loaded
    await this.initializeNavigation();
  }

 
async initializeNavigation() {
  const navMenu = document.querySelector(".nav-menu");
  const mobileMenuList = document.querySelector("#mobile-menu-list");
  
  
  if (!navMenu && !mobileMenuList) {
    console.error("Navigation elements not found in DOM");
    return;
  }
    try {
      // const allFeaturedCategories = await categoryData.getFeaturedCategories();
      
      const featuredCategories = await navbarCategoryData.fetchNavbarCategories();
      
      if (navMenu) {
        // Clear existing menu items except mobile-profile
        const mobileProfile = navMenu.querySelector(".mobile-profile");
        navMenu.innerHTML = "";
        if (mobileProfile) navMenu.appendChild(mobileProfile);
  
        featuredCategories.forEach((category) => {
          const li = document.createElement("li");
          li.className = "category-item";
  
          const a = document.createElement("a");
          a.href = `/pages/category/category-page.html?name=${encodeURIComponent(category.name)}`;
          a.textContent = category.name;
  
          li.appendChild(a);
  
          // First level dropdown
          if (category.child?.length > 0) {
            const dropdown = document.createElement("div");
            dropdown.className = "category-dropdown";
            
            // Sort child categories - items with children go to the top
            const sortedChildren = [...category.child].sort((a, b) => {
              const aHasChildren = a.child?.length > 0;
              const bHasChildren = b.child?.length > 0;
              return bHasChildren - aHasChildren; // Items with children first
            });
  
            sortedChildren.forEach((childCategory) => {
              if (childCategory) {
                const childItem = document.createElement("div");
                childItem.className = "category-dropdown-item";
                
                // Add a class if this item has children
                if (childCategory.child?.length > 0) {
                  childItem.classList.add("has-children");
                }
  
                const childLink = document.createElement("a");
                childLink.href = `/pages/category/category-page.html?name=${encodeURIComponent(childCategory.name)}`;
                childLink.textContent = childCategory.name;
                childItem.appendChild(childLink);
  
                // Second level dropdown
                if (childCategory.child?.length > 0) {
                  const subDropdown = document.createElement("div");
                  subDropdown.className = "category-subdropdown";
  
                  childCategory.child.forEach((grandChild) => {
                    if (grandChild) {
                      const grandChildLink = document.createElement("a");
                      grandChildLink.href = `/pages/category/category-page.html?name=${encodeURIComponent(grandChild.name)}`;
                      grandChildLink.textContent = grandChild.name;
                      subDropdown.appendChild(grandChildLink);
                    }
                  });
  
                  if (subDropdown.children.length > 0) {
                    // Add arrow indicator for items with children
                    childLink.innerHTML = `${childCategory.name} <span class="dropdown-arrow"></span>`;
                    childItem.appendChild(subDropdown);
                  }
                }
  
                dropdown.appendChild(childItem);
              }
            });
  
            if (dropdown.children.length > 0) {
              li.appendChild(dropdown);
            }
          }
  
          navMenu.appendChild(li);
        });
        
        // Add event listeners to adjust subdropdown positions
        this.adjustSubdropdownPositions();
      }
  
      // Initialize mobile navigation
      if (mobileMenuList) {
        mobileMenuList.innerHTML = "";
  
        featuredCategories.forEach((category) => {
          const li = document.createElement("li");
          li.className = "mobile-menu-item";
          li.dataset.categoryId = category.uid;
  
          const a = document.createElement("a");
          // Changed from id to name parameter to match desktop behavior
          a.href = category.child?.length > 0 
            ? "javascript:void(0)" 
            : `/pages/category/category-page.html?name=${encodeURIComponent(category.name)}`;
          a.innerHTML = `${category.name} ${category.child?.length > 0 ? '<i class="fas fa-chevron-right"></i>' : ''}`;
          a.style.fontWeight = "700";
  
          li.appendChild(a);
  
          // First level submenu
          if (category.child?.length > 0) {
            const submenu = document.createElement("div");
            submenu.className = "mobile-submenu";
            submenu.id = `submenu-${category.uid}`;
  
            const submenuHeader = document.createElement("div");
            submenuHeader.className = "mobile-submenu-header";
            
            const backBtn = document.createElement("button");
            backBtn.className = "mobile-back-btn";
            backBtn.innerHTML = '<i class="fas fa-chevron-left"></i> Back';
            backBtn.addEventListener('click', () => {
              submenu.classList.remove('active');
              
              // Show all parent categories again
              const parentItems = document.querySelectorAll('.mobile-menu-item.parent-active, .mobile-menu-item.current-parent');
              parentItems.forEach(item => {
                item.classList.remove('parent-active');
                item.classList.remove('current-parent');
              });
            });
            
            const title = document.createElement("h3");
            title.className = "mobile-submenu-title";
            title.textContent = category.name;
            
            submenuHeader.appendChild(backBtn);
            submenuHeader.appendChild(title);
            submenu.appendChild(submenuHeader);
  
            const submenuList = document.createElement("ul");
            submenuList.className = "mobile-menu-list";
  
            category.child.forEach((childCategory) => {
              if (childCategory) {
                const childLi = document.createElement("li");
                childLi.className = "mobile-menu-item";
                childLi.dataset.categoryId = childCategory.uid;
  
                const childA = document.createElement("a");
                // Changed from id to name parameter to match desktop behavior
                childA.href = childCategory.child?.length > 0 
                  ? "javascript:void(0)" 
                  : `/pages/category/category-page.html?name=${encodeURIComponent(childCategory.name)}`;
                childA.innerHTML = `${childCategory.name} ${childCategory.child?.length > 0 ? '<i class="fas fa-chevron-right"></i>' : ''}`;
                childA.style.fontWeight = childCategory.child?.length > 0 ? "700" : "normal";
  
                childLi.appendChild(childA);
  
                // Second level submenu
                if (childCategory.child?.length > 0) {
                  const childSubmenu = document.createElement("div");
                  childSubmenu.className = "mobile-submenu";
                  childSubmenu.id = `submenu-${childCategory.uid}`;
  
                  const childSubmenuHeader = document.createElement("div");
                  childSubmenuHeader.className = "mobile-submenu-header";
                  
                  const childBackBtn = document.createElement("button");
                  childBackBtn.className = "mobile-back-btn";
                  childBackBtn.innerHTML = '<i class="fas fa-chevron-left"></i> Back';
                  childBackBtn.addEventListener('click', () => {
                    childSubmenu.classList.remove('active');
                  });
                  
                  const childTitle = document.createElement("h3");
                  childTitle.className = "mobile-submenu-title";
                  childTitle.textContent = childCategory.name;
                  
                  childSubmenuHeader.appendChild(childBackBtn);
                  childSubmenuHeader.appendChild(childTitle);
                  childSubmenu.appendChild(childSubmenuHeader);
  
                  const childSubmenuList = document.createElement("ul");
                  childSubmenuList.className = "mobile-menu-list";
  
                  childCategory.child.forEach((grandChild) => {
                    if (grandChild) {
                      const grandChildLi = document.createElement("li");
                      grandChildLi.className = "mobile-menu-item";
  
                      const grandChildA = document.createElement("a");
                      // Changed from id to name parameter to match desktop behavior
                      grandChildA.href = `/pages/category/category-page.html?name=${encodeURIComponent(grandChild.name)}`;
                      grandChildA.textContent = grandChild.name;
  
                      grandChildLi.appendChild(grandChildA);
                      childSubmenuList.appendChild(grandChildLi);
                    }
                  });
  
                  childSubmenu.appendChild(childSubmenuList);
                  childLi.appendChild(childSubmenu);
  
                  // Add click event to open child submenu
                  childA.addEventListener('click', (e) => {
                    if (childCategory.child?.length > 0) {
                      e.preventDefault();
                      childSubmenu.classList.add('active');
                    }
                  });
                }
  
                submenuList.appendChild(childLi);
              }
            });
  
            submenu.appendChild(submenuList);
            li.appendChild(submenu);
  
            // Add click event to open submenu
            a.addEventListener('click', (e) => {
              if (category.child?.length > 0) {
                e.preventDefault();
                submenu.classList.add('active');
                
                // Hide all other parent categories
                const allParentItems = document.querySelectorAll('.mobile-menu-item');
                allParentItems.forEach(item => {
                  if (item !== li && item.parentElement === mobileMenuList) {
                    item.classList.add('parent-active');
                  }
                });
                
                // Mark this as the current parent
                li.classList.add('current-parent');
              }
            });
          }
  
          mobileMenuList.appendChild(li);
        });
      }
    } catch (error) {
      console.error("Error initializing navigation:", error);
    }
  }
  
  adjustSubdropdownPositions() {
    const dropdownItems = document.querySelectorAll('.category-dropdown-item');
    
    dropdownItems.forEach(item => {
      const subdropdown = item.querySelector('.category-subdropdown');
      if (subdropdown) {
        // Add a special class to indicate this item has a subdropdown
        item.classList.add('has-subdropdown');
        
        // Calculate the optimal position for the subdropdown
        item.addEventListener('mouseenter', () => {
          const dropdownRect = item.parentElement.getBoundingClientRect();
          const itemRect = item.getBoundingClientRect();
          
          // Reset any previous positioning
          subdropdown.style.top = '';
          
          // Get the height of the subdropdown
          const subdropdownHeight = subdropdown.offsetHeight;
          
          // Calculate available space below the item
          const spaceBelow = window.innerHeight - itemRect.bottom;
          
          // If not enough space below, position at the top
          if (spaceBelow < subdropdownHeight) {
            // Position at the top of the parent dropdown
            subdropdown.style.top = '0';
          }
        });
      }
    });
  }
  

  // Add these methods to your CategoryManager class

// async initializeMobileNavigation() {
//   // Get all categories for mobile menu
//   const allCategories = await categoryData.getActiveCategories();
  
//   // Get DOM elements
//   const mobileMainCategories = document.getElementById('mobile-main-categories');
//   const mobileSubCategories = document.getElementById('mobile-sub-categories');
//   const mobileSubSubCategories = document.getElementById('mobile-sub-sub-categories');
//   const leveltrueTitle = document.getElementById('level-1-title');
//   const level2Title = document.getElementById('level-2-title');
  
//   if (!mobileMainCategories) return;
  
//   // Clear existing items
//   mobileMainCategories.innerHTML = '';
  
//   // Add Food Cupboard and other main categories
//   allCategories.forEach(category => {
//     if (category.is_active === 1) {
//       const li = document.createElement('li');
//       li.className = 'mobile-category-item';
      
//       const a = document.createElement('a');
//       a.href = 'javascript:void(0)';
//       a.className = 'mobile-category-link';
//       a.textContent = category.name;
      
//       // If has children, add arrow and click handler
//       if (category.child && category.child.length > 0) {
//         const icon = document.createElement('i');
//         icon.className = 'fas fa-chevron-right';
//         a.appendChild(icon);
        
//         a.addEventListener('click', (e) => {
//           e.preventDefault();
          
//           // Update subcategory view
//           mobileSubCategories.innerHTML = '';
//           level1Title.textContent = category.name;
          
//           // Add subcategories
//           category.child.forEach(subCategory => {
//             if (subCategory.is_active === 1) {
//               const subLi = document.createElement('li');
//               subLi.className = 'mobile-category-item';
              
//               const subA = document.createElement('a');
//               subA.href = 'javascript:void(0)';
//               subA.className = 'mobile-category-link';
//               subA.textContent = subCategory.name;
              
//               // If has children, add arrow and click handler
//               if (subCategory.child && subCategory.child.length > 0) {
//                 const subIcon = document.createElement('i');
//                 subIcon.className = 'fas fa-chevron-right';
//                 subA.appendChild(subIcon);
                
//                 subA.addEventListener('click', (e) => {
//                   e.preventDefault();
                  
//                   // Update sub-subcategory view
//                   mobileSubSubCategories.innerHTML = '';
//                   level2Title.textContent = subCategory.name;
                  
//                   // Add sub-subcategories
//                   subCategory.child.forEach(subSubCategory => {
//                     if (subSubCategory.is_active === 1) {
//                       const subSubLi = document.createElement('li');
//                       subSubLi.className = 'mobile-category-item';
                      
//                       const subSubA = document.createElement('a');
//                       subSubA.href = `/pages/category/category-page.html?id=${subSubCategory.uid}`;
//                       subSubA.className = 'mobile-category-link';
//                       subSubA.textContent = subSubCategory.name;
                      
//                       subSubLi.appendChild(subSubA);
//                       mobileSubSubCategories.appendChild(subSubLi);
//                     }
//                   });
                  
//                   // Show level 2 view
//                   document.getElementById('category-level-0').classList.remove('active');
//                   document.getElementById('category-level-1').classList.remove('active');
//                   document.getElementById('category-level-2').classList.add('active');
//                 });
//               } else {
//                 // No children, link directly to category page
//                 subA.href = `/pages/category/category-page.html?id=${subCategory.uid}`;
//               }
              
//               subLi.appendChild(subA);
//               mobileSubCategories.appendChild(subLi);
//             }
//           });
          
//           // Show level 1 view
//           document.getElementById('category-level-0').classList.remove('active');
//           document.getElementById('category-level-1').classList.add('active');
//           document.getElementById('category-level-2').classList.remove('active');
//         });
//       } else {
//         // No children, link directly to category page
//         a.href = `/pages/category/category-page.html?id=${category.uid}`;
//       }
      
//       li.appendChild(a);
//       mobileMainCategories.appendChild(li);
//     }
//   });
  
//   // Set up back buttons
//   const backButtons = document.querySelectorAll('.mobile-back-btn');
//   backButtons.forEach(button => {
//     button.addEventListener('click', () => {
//       const level = parseInt(button.getAttribute('data-level'));
      
//       // Hide all views
//       document.getElementById('category-level-0').classList.remove('active');
//       document.getElementById('category-level-1').classList.remove('active');
//       document.getElementById('category-level-2').classList.remove('active');
      
//       // Show target level
//       document.getElementById(`category-level-${level}`).classList.add('active');
//     });
//   });
// }

}


