// services/product-service.js
import axiosServices from './axiosService.js';

export class ProductService {
  static products = [];

  static async getSpecialOffersProducts() {
    try {
      const response = await axiosServices.get('/commerce/stock', {
        params: {
          categories: 'Special Offers' // Using name instead of UID
        }
      });
      
      if (response.status && response.data.stock.data) {
        return response.data.stock.data.map(stock => ({
          id: stock.uid,
          name: stock.name,
          price: stock.price,
          stock_id: stock.uid,
          imageUrl: stock.attachments?.[0]?.path || '',
          oldPrice: stock.retail_price !== stock.price ? stock.retail_price : null,
          size: stock.size
        }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching special offers products:', error);
      return [];
    }
  }
  
  static async getMeatProducts() {
    try {
      const response = await axiosServices.get('/commerce/stock', {
        params: {
          categories: 'Meat' // Using Meat category name
        }
      });
      
      if (response.status && response.data.stock.data) {
        return response.data.stock.data.map(stock => ({
          id: stock.uid,
          name: stock.name,
          price: stock.price,
          stock_id: stock.uid,
          imageUrl: stock.attachments?.[0]?.path || '',
          oldPrice: stock.retail_price !== stock.price ? stock.retail_price : null,
          size: stock.size
        }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching meat products:', error);
      return [];
    }
  }

  static async getOrganicFoodsProducts() {
    try {
      const response = await axiosServices.get('/commerce/stock', {
        params: {
          categories: 'Organic Foods' // Using category name
        }
      });
      console.log('organic food', response)
      if (response.status && response.data.stock.data) {
        return response.data.stock.data.map(stock => ({
          id: stock.uid,
          name: stock.name,
          price: stock.price,
          stock_id: stock.uid,
          imageUrl: stock.attachments?.[0]?.path || '',
          oldPrice: stock.retail_price !== stock.price ? stock.retail_price : null,
          size: stock.size
        }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching organic foods products:', error);
      return [];
    }
  }
}

// Add the missing ProductServiceCategory class
export class ProductServiceCategory {
  static async getStockByCategory(categoryId, page = 1) {
    try {
      const response = await axiosServices.get('/commerce/stock', {
        params: {
          categories: categoryId,
          page: page
        }
      });
      
      if (response.status && response.data.stock) {
        // Extract pagination data
        const pagination = {
          currentPage: response.data.stock.current_page,
          lastPage: response.data.stock.last_page,
          total: response.data.stock.total,
          perPage: response.data.stock.per_page
        };
        
        // Map products data
        const products = response.data.stock.data.map(stock => ({
          id: stock.uid,
          name: stock.name,
          price: stock.price,
          stock_id: stock.uid,
          imageUrl: stock.attachments?.[0]?.path || '',
          oldPrice: stock.retail_price !== stock.price ? stock.retail_price : null,
          size: stock.size,
          attributes: stock.attributes || {}
        }));
        
        return {
          products,
          pagination
        };
      }
      
      return {
        products: [],
        pagination: null
      };
    } catch (error) {
      console.error('Error fetching category stock:', error);
      throw error;
    }
  }
}
