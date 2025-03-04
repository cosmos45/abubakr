// category-service.js
import axiosServices from './axiosService.js';
export const categoryData = {
    async fetchCategories() {
        try {
            const response = await axiosServices.get('/commerce/categories');
            return response.data.categories || [];
        } catch (error) {
            console.error('Error fetching categories:', error);
            return [];
        }
    },

    async getCategoryByName(name) {
        try {
          const response = await axiosServices.get('/commerce/categories', {
            params: { name: name }
          });
          if (response.status && response.data.categories) {
            return response.data.categories.find(cat => cat.name === name);
          }
          return null;
        } catch (error) {
          console.error('Error fetching category by name:', error);
          return null;
        }
      }
,      

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
    }
};
