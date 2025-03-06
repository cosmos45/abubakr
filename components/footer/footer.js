// components/footer/footer.js
import { categoryData } from '../../scripts/services/category-service.js';

export async function initializeFooter() {
    try {
        await populateFooterMenuCategories();
        await populateFooterPopularCategories();
    } catch (error) {
        console.error('Error initializing footer:', error);
    }
}

async function populateFooterMenuCategories() {
    try {
        // Get featured categories for the Menu section
        const featuredCategories = await categoryData.getFeaturedCategories();
        const menuCategoriesContainer = document.getElementById('footer-menu-categories');
        
        if (!menuCategoriesContainer) return;
        
        // Clear existing items except the first one (Deals)
        const firstItem = menuCategoriesContainer.querySelector('li');
        menuCategoriesContainer.innerHTML = '';
        if (firstItem) menuCategoriesContainer.appendChild(firstItem);
        
        // Add featured categories
        featuredCategories.forEach(category => {
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

async function populateFooterPopularCategories() {
    try {
        // Use the same categories as in popular-categories component
        const categories = await categoryData.getActiveCategories();
        const categoriesWithImages = categories.filter(cat => cat.thumbnail);
        const popularCategoriesContainer = document.getElementById('footer-popular-categories');
        
        if (!popularCategoriesContainer) return;
        
        // Clear existing items
        popularCategoriesContainer.innerHTML = '';
        
        // Sort categories to match the desired order from popular-categories
        const categoryOrder = [
            'Fruit & Vegetables', 'Bakery Items', 'Juice & Drinks', 'Milk & Dairy',
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
