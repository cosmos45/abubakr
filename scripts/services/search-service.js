// scripts/services/search-service.js

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
      console.log(
        `SearchService initialized with ${this.products.length} products`
      );
    } catch (error) {
      console.error("Error initializing SearchService:", error);
    }
  }

  async loadProducts() {
    try {
      const response = await axiosServices.get("/commerce/products");

      // Updated to match products API response structure
      if (response.data && response.data && response.data.products.data) {
        this.products = response.data.products.data;
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

  async search(query, categoryId = "all") {
    if (!this.initialized) {
      await this.init();
    }

    query = query.toLowerCase().trim();

    if (query.length < 3) {
      return [];
    }

    try {
      const response = await axiosServices.get("/commerce/products", {
        params: { query: query },
      });

      // Updated to match products API response structure
      let results = [];
      if (response.data && response.data && response.data.products.data) {
        results = response.data.products.data;
        console.log("Search results found:", results.length);
      } else {
        console.warn(
          "Unexpected search API response structure:",
          response.data
        );
      }

      // Format results based on product structure instead of stock
      return results.map((product) => ({
        id: product.uid,
        stockId: product.uid,
        name: product.name || "Unknown Product",
        price: parseFloat(product.price) || 0,
        oldPrice: product.compare_price,
        imageUrl: this.getProductImageUrl(product),
        description: product.short_description || "",
        size: product.size || "",
        category: product.categories?.[0] || "Uncategorized",
        hasVariants: product.choices && product.choices.length > 0,
        defaultVariantId: product.default_variant?.pvariant__id || null,
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
    return "/assets/images/default-product.png";
  }

  localSearch(query) {
    query = query.toLowerCase().trim();

    let results = this.products.filter((product) => {
      const name = (product.name || "").toLowerCase();
      const description = (product.short_description || "").toLowerCase();

      return name.includes(query) || description.includes(query);
    });

    // Updated to match product structure instead of stock
    return results.map((product) => ({
      id: product.uid,
      stockId: product.uid,
      name: product.name || "Unknown Product",
      price: parseFloat(product.price) || 0,
      oldPrice: product.compare_price,
      imageUrl: this.getProductImageUrl(product),
      description: product.short_description || "",
      size: product.size || "",
      category: product.categories?.[0] || "Uncategorized",
      hasVariants: product.choices && product.choices.length > 0,
      defaultVariantId: product.default_variant?.pvariant__id || null,
    }));
  }

  async getAllCategories() {
    try {
      const response = await axiosServices.get("/commerce/categories");
      return response.data.categories || [];
    } catch (error) {
      console.error("Error fetching categories for search:", error);
      return [];
    }
  }
}
