// services/product-service.js
import axiosServices from './axiosService.js';


// services/product-service.js
export class ProductService {
  static products = [];

  static async getDealsProducts() {
    try {
      const response = await axiosServices.get('/commerce/stock', {
        params: {
          category: 'fKKghUh1VQ'
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
      console.error('Error fetching deals products:', error);
      return [];
    }
  }
}
