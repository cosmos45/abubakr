// services/product-service.js
import axiosServices from './axiosService.js';

export class ProductService {
  static products = [];

  static async getSpecialOffersProducts() {
    try {
      const response = await axiosServices.get('/commerce/stock', {
        params: {
          category_name: 'Special Offers' // Using name instead of UID
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
          category_name: 'Meat' // Using Meat category name
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
          category_name: 'Organic Foods' // Using category name
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
      console.error('Error fetching organic foods products:', error);
      return [];
    }
  }
}
