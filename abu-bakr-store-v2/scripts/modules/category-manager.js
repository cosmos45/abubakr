import { categoryData } from '../services/category-service.js';

export class CategoryManager {
    constructor() {
        this.categories = [];
        this.maxFeaturedCategories = 5;
    }

    async init() {
        this.categories = await categoryData.getActiveCategories();
    }

    async initializeNavigation() {
        const navMenu = document.querySelector('.nav-menu');
        if (!navMenu) return;
    
        try {
            const allFeaturedCategories = await categoryData.getFeaturedCategories();
            const featuredCategories = allFeaturedCategories.slice(0, this.maxFeaturedCategories);
            
            // Clear existing menu items except mobile-profile
            const mobileProfile = navMenu.querySelector('.mobile-profile');
            navMenu.innerHTML = '';
            if (mobileProfile) navMenu.appendChild(mobileProfile);
    
            featuredCategories.forEach(category => {
                const li = document.createElement('li');
                li.className = 'category-item';
                
                const a = document.createElement('a');
                a.href = `/abu-bakr-store-v2/pages/category/category-page.html?id=${category.uid}`;
                a.textContent = category.name;
                
                li.appendChild(a);
    
                // First level dropdown
                if (category.child?.length > 0) {
                    const dropdown = document.createElement('div');
                    dropdown.className = 'category-dropdown';
                    
                    category.child.forEach(childCategory => {
                        if (childCategory.is_active === 1) {
                            const childItem = document.createElement('div');
                            childItem.className = 'category-dropdown-item';
                            
                            const childLink = document.createElement('a');
                            childLink.href = `/abu-bakr-store-v2/pages/category/category-page.html?id=${childCategory.uid}`;
                            childLink.textContent = childCategory.name;
                            childItem.appendChild(childLink);
    
                            // Second level dropdown
                            if (childCategory.child?.length > 0) {
                                console.log('childofchild',childCategory.child)
                                const subDropdown = document.createElement('div');
                                subDropdown.className = 'category-subdropdown';
                                
                                childCategory.child.forEach(grandChild => {
                                    if (grandChild.is_active === 1) {
                                        const grandChildLink = document.createElement('a');
                                        grandChildLink.href = `/abu-bakr-store-v2/pages/category/category-page.html?id=${grandChild.uid}`;
                                        grandChildLink.textContent = grandChild.name;
                                        subDropdown.appendChild(grandChildLink);
                                    }
                                });
    
                                if (subDropdown.children.length > 0) {
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
        } catch (error) {
            console.error('Error initializing navigation:', error);
        }
    }
    
}
