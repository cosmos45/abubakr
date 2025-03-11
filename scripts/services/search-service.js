// scripts/services/search-service.js
import axiosServices from './axiosService.js';

export class SearchService {
  constructor() {
    console.log("Initializing SearchService...");
    this.products = [];
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;
    
    try {
      await this.loadProducts();
      this.initialized = true;
      console.log(`SearchService initialized with ${this.products.length} products`);
    } catch (error) {
      console.error("Error initializing SearchService:", error);
    }
  }

  async loadProducts() {
    try {
      const response = await axiosServices.get('/commerce/stock');
      // Correctly access the products array from the response
      if (response.data && response.data.data && response.data.data.stock && response.data.data.stock.data) {
        this.products = response.data.data.stock.data;
        console.log("Products loaded:", this.products.length);
      } else {
        console.warn("Unexpected API response structure:", response.data);
        this.products = [];
      }
    } catch (error) {
      console.error("Error loading products for search:", error);
      this.products = [];
    }
  }

  async search(query, categoryId = 'all') {
    if (!this.initialized) {
      await this.init();
    }

    query = query.toLowerCase().trim();
    
    if (query.length < 3) {
      return [];
    }

    try {
      // Use the API for search
      const response = await axiosServices.get('/commerce/stock', {
        params: { query: query }
      });
      
      // Correctly access the products from the response
      let results = [];
      if (response.data && response.data.stock && response.data.stock.data) {
        results = response.data.stock.data;
        console.log("Search results found:", results.length);
      } else {
        console.warn("Unexpected search API response structure:", response.data);
      }
      
      // Format results based on the actual API response structure
      return results.map(product => ({
        id: product.uid,
        stockId: product.uid,
        name: product.name || 'Unknown Product',
        price: parseFloat(product.price) || 0,
        oldPrice: product.retail_price && product.retail_price !== product.price ? 
                 parseFloat(product.retail_price) : null,
        imageUrl: this.getProductImageUrl(product),
        description: product.short_description || '',
        size: product.size || '',
        category: product.brand || 'Uncategorized'
      }));
    } catch (error) {
      console.error("Search API error:", error);
      
      // Fallback to local search if API fails
      return this.localSearch(query);
    }
  }

  // Helper method to get the image URL from attachments
  getProductImageUrl(product) {
    if (product.attachments && product.attachments.length > 0) {
      return product.attachments[0].path;
    }
    return '/assets/images/default-product.png';
  }

  localSearch(query) {
    query = query.toLowerCase().trim();
    
    let results = this.products.filter(product => {
      const name = (product.name || '').toLowerCase();
      const description = (product.short_description || '').toLowerCase();
      
      return name.includes(query) || description.includes(query);
    });
    
    // Format results based on the actual data structure
    return results.map(product => ({
      id: product.uid,
      stockId: product.uid,
      name: product.name || 'Unknown Product',
      price: parseFloat(product.price) || 0,
      oldPrice: product.retail_price && product.retail_price !== product.price ? 
               parseFloat(product.retail_price) : null,
      imageUrl: this.getProductImageUrl(product),
      description: product.short_description || '',
      size: product.size || '',
      category: product.brand || 'Uncategorized'
    }));
  }

  async getAllCategories() {
    try {
      const response = await axiosServices.get('/commerce/categories');
      return response.data.categories || [];
    } catch (error) {
      console.error("Error fetching categories for search:", error);
      return [];
    }
  }
}
