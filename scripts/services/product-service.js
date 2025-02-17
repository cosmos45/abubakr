// services/product-service.js
import axiosServices from './axiosService.js';

export class ProductService {
  static async getDealsProducts() {
    try {
      const response = await axiosServices.get('/commerce/stock', {
        params: {
          category: 'fKKghUh1VQ'
        }
      });
      
      console.log('Deals API Response:', response);
      
      if (!response.data?.stock?.data) {
        console.error('Invalid deals data structure:', response);
        return [];
      }
      
      return response.data.stock.data.map(item => ({
        id: item.uid,
        name: item.name,
        price: item.price,
        oldPrice: item.retail_price !== item.price ? item.retail_price : null,
        imageUrl: item.attachments?.[0]?.path || '/assets/images/placeholder.jpg', // Correct path
        size: item.size,
        description: item.short_description
      }));
      
    } catch (error) {
      console.error('Error fetching deals:', error);
      return [];
    }
  }
}
