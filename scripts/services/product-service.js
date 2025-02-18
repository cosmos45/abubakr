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
      
      if (!response.data?.stock?.data) {
        return [];
      }
      
      this.products = response.data.stock.data.map(item => ({
        id: item.uid,
        name: item.name,
        price: item.price,
        oldPrice: item.retail_price !== item.price ? item.retail_price : null,
        imageUrl: item.attachments?.[0]?.path || '/assets/images/placeholder.jpg',
        size: item.size,
        description: item.short_description
      }));

      return this.products;
    } catch (error) {
      console.error('Error fetching deals:', error);
      return [];
    }
  }
}
