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


export class ProductServiceCategory {
  static async getStockByCategory(categoryId, page = 1) {
    try {
      console.debug(`Fetching stock data for category: ${categoryId}, page: ${page}`);
      
      const response = await axiosServices.get('/commerce/stock', {
        params: { 
          category: categoryId,
          page: page 
        }
      });
      
      if (response.status && response.data.stock) {
        const { data, current_page, last_page, total } = response.data.stock;
        
        const products = data.map(stock => ({
          id: stock.uid,
          name: stock.name,
          price: parseFloat(stock.price),
          stock_id: stock.uid,
          imageUrl: stock.attachments?.[0]?.path || '',
          oldPrice: stock.retail_price !== stock.price ? parseFloat(stock.retail_price) : null,
          size: stock.size,
          barcode: stock.barcode,
          weight: stock.weight,
          is_featured: stock.is_featured,
          short_description: stock.short_description
        }));
        
        return {
          products,
          pagination: {
            currentPage: current_page,
            lastPage: last_page,
            total: total
          }
        };
      }
      
      return { products: [], pagination: null };
    } catch (error) {
      console.error('Error fetching category stock:', error);
      throw error;
    }
  }
}

