import { categoryData } from '../../scripts/services/category-service.js';

async function renderPopularCategories() {
    try {
        const categories = await categoryData.getActiveCategories();
        const categoriesWithImages = categories.filter(cat => cat.thumbnail);
        const gridContainer = document.getElementById('categoriesGrid');
        
        // Sort categories to match the desired order
        const categoryOrder = [
            'Vegetables', 'Bakery', 'Juice', 'Dairy & Eggs',
            'Meat & Poultry', 'Soft Drinks', 'Cleaning Supplies', 'Cereals & Snacks'
        ];
        
        const sortedCategories = categoryOrder
            .map(name => categoriesWithImages.find(cat => cat.name === name))
            .filter(Boolean)
            .slice(0, 8);

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
    card.href = `/category/${category.uid}`;
    
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

export { renderPopularCategories };
