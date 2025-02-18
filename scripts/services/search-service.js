import { ProductService } from './product-service.js';
import { categoryData } from './category-service.js';

export class SearchService {
    constructor() {
        this.products = [];
        this.categories = [];
        this.init();
    }

    async init() {
        try {
            // Initialize categories first
            this.categories = await categoryData.fetchCategories();
            // Initialize products by waiting for them to load
            const products = await ProductService.getDealsProducts();
            this.products = products || [];
        } catch (error) {
            console.error('Error initializing SearchService:', error);
            this.products = [];
        }
    }
    async getAllCategories() {
        if (!this.categories.length) {
            this.categories = await categoryData.fetchCategories();
        }

        const flattenCategories = (categories) => {
            if (!categories) return [];
            
            let result = [];
            categories.forEach(category => {
                result.push({
                    id: category.uid,
                    name: category.name,
                    is_active: category.is_active
                });

                if (category.child && category.child.length > 0) {
                    result = result.concat(flattenCategories(category.child));
                }
            });
            return result;
        };

        return flattenCategories(this.categories);
    }

    search(query, categoryId = 'all') {
        if (!query) return [];
        
        query = query.toLowerCase();
        let filteredProducts = this.products;

        if (categoryId !== 'all') {
            filteredProducts = filteredProducts.filter(product => {
                return product.category_uid === categoryId;
            });
        }

        return filteredProducts.filter(product => 
            product.name.toLowerCase().includes(query) ||
            (product.description && product.description.toLowerCase().includes(query))
        ).slice(0, 5);
    }
}
