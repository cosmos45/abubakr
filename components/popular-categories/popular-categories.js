// components/popular-categories/popular-categories.js
import { categoryData } from '../../scripts/services/category-service.js';

export async function renderPopularCategories() {
    try {
        // Use the cached categories data
        const categories = await categoryData.getActiveCategories();
        const categoriesWithImages = categories.filter(cat => cat.thumbnail);
        const gridContainer = document.getElementById('categoriesGrid');
        
        if (!gridContainer) {
            console.warn('Categories grid container not found');
            return;
        }
        
        // Sort categories to match the desired order
        const categoryOrder = [
            'Special Offers', 'Fruit & Vegetables', 'Bakery Items', 'Juice & Drinks', 'Milk & Dairy',
            'Halal Meat', 'Cans (Drinks)', 'Household Items', 'Biscuits & Cereals'
        ];
        
        const sortedCategories = categoryOrder
            .map(name => categoriesWithImages.find(cat => cat.name === name))
            .filter(Boolean)
            .slice(0, 8);

        gridContainer.innerHTML = ''; // Clear existing content
        
        sortedCategories.forEach(category => {
            const categoryCard = createCategoryCard(category);
            gridContainer.appendChild(categoryCard);
        });

        initPopularCategories();
    } catch (error) {
        console.error('Error rendering categories:', error);
    }
}

function createCategoryCard(category) {
    const card = document.createElement('a');
    card.className = 'category-card';
    card.href = `/pages/category/category-page.html?name=${encodeURIComponent(category.name)}`;
    
    card.innerHTML = `
        <div class="circle-background"></div>
        <img src="${category.thumbnail.path}" alt="${category.name}">
        <h3>${category.name}</h3>
    `;
    
    return card;
}

function initPopularCategories() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, {
        threshold: 0.2
    });

    document.querySelectorAll('.category-card').forEach(card => {
        observer.observe(card);
    });
}
