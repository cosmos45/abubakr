// category-service.js

// Global cache for categories
let categoriesCache = null;
let fetchPromise = null;

export const categoryData = {
    async fetchCategories(forceRefresh = false) {
        try {
            // If we already have categories and no force refresh, return the cached data
            if (categoriesCache && !forceRefresh) {
                console.log('Using cached categories data');
                return categoriesCache;
            }
            
            // If there's already a fetch in progress, return that promise
            if (fetchPromise) {
                console.log('Using existing categories fetch promise');
                return fetchPromise;
            }
            
            // Start a new fetch
            console.log('Fetching categories from API');
            fetchPromise = axiosServices.get('/commerce/categories')
                .then(response => {
                    console.log('cats', response)
                    const categories = response.data.categories || [];
                    categoriesCache = categories;
                    fetchPromise = null;
                    return categories;
                })
                .catch(error => {
                    console.error('Error fetching categories:', error);
                    fetchPromise = null;
                    return [];
                });
                
            return fetchPromise;
        } catch (error) {
            console.error('Error in fetchCategories:', error);
            return [];
        }
    },

    async getCategoryByName(name) {
        try {
            const categories = await this.fetchCategories();
            
            // Helper function to search through category tree
            const findCategoryByName = (categories, targetName) => {
                for (const category of categories) {
                    if (category.name === targetName) {
                        return category;
                    }
                    if (category.child && category.child.length > 0) {
                        const found = findCategoryByName(category.child, targetName);
                        if (found) return found;
                    }
                }
                return null;
            };
            
            const category = findCategoryByName(categories, name);
            
            // If not found in cache, try direct API call as fallback
            if (!category) {
                const response = await axiosServices.get('/commerce/categories', {
                    params: { name: name }
                });
                if (response.status && response.data.categories) {
                    return response.data.categories.find(cat => cat.name === name);
                }
            }
            
            return category;
        } catch (error) {
            console.error('Error fetching category by name:', error);
            return null;
        }
    },

    async getActiveCategories() {
        const categories = await this.fetchCategories();
        return categories.filter(cat => cat.is_active === 1);
    },

    async getFeaturedCategories() {
        const categories = await this.fetchCategories();
        return categories.filter(cat => 
            cat.is_active === 1 && cat.is_featured === 1
        );
    },

    async getCategory(uid) {
        const categories = await this.fetchCategories();
        
        const findCategory = (categories, targetUid) => {
            for (const category of categories) {
                if (category.uid === targetUid) {
                    return category;
                }
                if (category.child && category.child.length > 0) {
                    const found = findCategory(category.child, targetUid);
                    if (found) return found;
                }
            }
            return null;
        };

        return findCategory(categories, uid);
    },

    async getCategoryParent(childUid) {
        const categories = await this.fetchCategories();
        
        const findParent = (categories) => {
            for (const category of categories) {
                if (category.child) {
                    const childCategory = category.child.find(child => child.uid === childUid);
                    if (childCategory) {
                        return category;
                    }
                }
            }
            return null;
        };

        return findParent(categories);
    },
    
    // Method to prefetch categories at app startup
    async prefetchCategories() {
        if (!categoriesCache) {
            console.log('Prefetching categories data');
            return this.fetchCategories();
        }
        return categoriesCache;
    }
};

// Export the cache for direct access if needed
export const getCategoriesCache = () => categoriesCache;
