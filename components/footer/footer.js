// components/footer/footer.js
import { categoryData, getCategoriesCache } from '../../scripts/services/category-service.js';

export async function initializeFooter() {
    try {
        // Get categories from cache if available
        const categories = getCategoriesCache() || await categoryData.getActiveCategories();
        
        // Filter for featured categories
        const featuredCategories = categories.filter(cat => cat.is_featured === true);
        
        await populateFooterMenuCategories(featuredCategories);
        await populateFooterPopularCategories(categories);
    } catch (error) {
        console.error('Error initializing footer:', error);
    }
}

async function populateFooterMenuCategories(featuredCategories) {
    try {
        const menuCategoriesContainer = document.getElementById('footer-menu-categories');
        
        if (!menuCategoriesContainer) return;
        
        // Clear existing items except the first one (Deals)
        const firstItem = menuCategoriesContainer.querySelector('li');
        menuCategoriesContainer.innerHTML = '';
        if (firstItem) menuCategoriesContainer.appendChild(firstItem);
        
        // Limit to 8 categories
        const limitedCategories = featuredCategories.slice(0, 8);
        
        // Add featured categories
        limitedCategories.forEach(category => {
            const listItem = document.createElement('li');
            const link = document.createElement('a');
            link.href = `/pages/category/category-page.html?name=${encodeURIComponent(category.name)}`;
            link.textContent = category.name;
            listItem.appendChild(link);
            menuCategoriesContainer.appendChild(listItem);
        });
    } catch (error) {
        console.error('Error populating footer menu categories:', error);
    }
}

async function populateFooterPopularCategories(categories) {
    try {
        const categoriesWithImages = categories.filter(cat => cat.thumbnail);
        const popularCategoriesContainer = document.getElementById('footer-popular-categories');
        
        if (!popularCategoriesContainer) return;
        
        // Clear existing items
        popularCategoriesContainer.innerHTML = '';
        
        // Sort categories to match the desired order from popular-categories
        const categoryOrder = [
            'Herbs', 'Bakery Items', 'Juice & Drinks', 'Milk & Dairy',
            'Halal Meat', 'Cans (Drinks)', 'Household Items', 'Biscuits & Cereals'
        ];
        
        const sortedCategories = categoryOrder
            .map(name => categoriesWithImages.find(cat => cat.name === name))
            .filter(Boolean)
            .slice(0, 8);
        
        // Add popular categories
        sortedCategories.forEach(category => {
            const listItem = document.createElement('li');
            const link = document.createElement('a');
            link.href = `/pages/category/category-page.html?name=${encodeURIComponent(category.name)}`;
            link.textContent = category.name;
            listItem.appendChild(link);
            popularCategoriesContainer.appendChild(listItem);
        });
    } catch (error) {
        console.error('Error populating footer popular categories:', error);
    }
}
