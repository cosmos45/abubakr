// services/product-service.js

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


  static async getAllProducts() {
    try {
      const response = await axiosServices.get('/commerce/stock'); // Adjust endpoint as necessary
      
      if (response.status && response.data.stock.data) {
        return response.data.stock.data.map(stock => ({
          id: stock.uid,
          name: stock.name,
          price: stock.price,
          stock_id: stock.uid,
          imageUrl: stock.attachments?.[0]?.path || '',
          oldPrice: stock.retail_price !== stock.price ? stock.retail_price : null,
          size: stock.size,
          description: stock.description,
          sku: stock.sku,
          attributes: stock.attributes || {}
        }));
      }
      
      return [];
      
    } catch (error) {
      console.error('Error fetching all products:', error);
      return [];
    }}

  static async getProductById(productId) {
    try {
      const response = await axiosServices.get(`/commerce/stock/${productId}`);
      
      if (response.status && response.data.stock) {
        const stock = response.data.stock;
        return {
          id: stock.uid,
          name: stock.name,
          price: stock.price,
          stock_id: stock.uid,
          imageUrl: stock.attachments?.[0]?.path || '',
          oldPrice: stock.retail_price !== stock.price ? stock.retail_price : null,
          size: stock.size,
          description: stock.description,
          sku: stock.sku,
          attributes: stock.attributes || {}
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching product by ID:', error);
      return null;
    }
  }
  // Add this to your services/product-service.js file
static async getChineseProducts() {
  try {
    const response = await axiosServices.get('/commerce/stock', {
      params: {
        categories: 'Chinese' // Using Chinese category name
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
    console.error('Error fetching Chinese products:', error);
    return [];
  }
}

  static async getMeatProducts() {
    try {
      const response = await axiosServices.get('/commerce/stock', {
        params: {
          categories: 'Halal Meat' // Using Meat category name
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

  // services/product-service.js
static async getDairyProducts() {
  try {
    const response = await axiosServices.get('/commerce/stock', {
      params: {
        categories: 'Milk & Dairy' // Using category name
      }
    });
    console.log(response)
    
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
    console.error('Error fetching dairy products:', error);
    return [];
  }
}

}

// Add the missing ProductServiceCategory class
export class ProductServiceCategory {

  static async getStockByCategory(categoryName, page = 1) {
    try {
      const response = await axiosServices.get('/commerce/stock', {

        params: {
          categories: categoryName,
          page: page
        }
      });
      
      if (response.status && response.data.stock) {
        const pagination = {
          currentPage: response.data.stock.current_page,
          lastPage: response.data.stock.last_page,
          total: response.data.stock.total,
          perPage: response.data.stock.per_page
        };
        
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
