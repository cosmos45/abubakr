import { ProductService } from "./product-service.js";
import { categoryData } from "./category-service.js";

export class SearchService {
  constructor() {
    this.products = [];
    this.categories = [];
    this.init();
  }

  async init() {
    try {
      // Initialize categories first
      this.categories = await categoryData.fetchCategories();
      // Initialize products by waiting for them to load
      const allProducts = await ProductService.getAllProducts(); // Fetch all products instead of just special offers
      this.products = allProducts || [];
    } catch (error) {
      console.error("Error initializing SearchService:", error);
      this.products = [];
    }
  }

  async getAllCategories() {
    if (!this.categories.length) {
      this.categories = await categoryData.fetchCategories();
    }

    const flattenCategories = (categories) => {
      if (!categories) return [];

      let result = [];
      categories.forEach((category) => {
        result.push({
          id: category.uid,
          name: category.name,
          is_active: category.is_active,
        });

        if (category.child && category.child.length > 0) {
          result = result.concat(flattenCategories(category.child));
        }
      });
      return result;
    };

    return flattenCategories(this.categories);
  }

  async search(query, categoryId = "all") {
    if (!query || query.length < 3) return [];

    query = query.toLowerCase();
    let filteredProducts = [...this.products];

    // Filter by category if specified
    if (categoryId !== "all") {
      filteredProducts = filteredProducts.filter((product) => {
        return this.isProductInCategory(product, categoryId);
      });
    }

    // Search by name and description
    return filteredProducts
      .filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          (product.description &&
            product.description.toLowerCase().includes(query))
      )
      .slice(0, 5); // Limit results to the top 5 matches
  }

  isProductInCategory(product, categoryId) {
    const category = this.findCategory(this.categories, categoryId);
    if (!category) return false;

    return this.isProductInCategoryTree(product, category);
  }

  isProductInCategoryTree(product, category) {
    if (product.category_uid === category.uid) return true;
    if (!category.child) return false;

    return category.child.some((child) =>
      this.isProductInCategoryTree(product, child)
    );
  }

  findCategory(categories, categoryId) {
    for (const category of categories) {
      if (category.uid === categoryId) return category;
      if (category.child) {
        const found = this.findCategory(category.child, categoryId);
        if (found) return found;
      }
    }
    return null;
  }
}
