// services/product-service.js

export class ProductService {
  static products = [];

  // In ProductService.js
static async getSpecialOffersProducts() {
  try {
    const response = await axiosServices.get("/commerce/products", {
      params: {
        categories: "Special Offers",
        
      },
    });


    if (response.status && response.data.products.data) {
      return response.data.products.data.map((product) => ({
        id: product.uid,
        name: product.name,
        price: product.price,
        stock_id: product.uid,
        imageUrl: product.attachments?.[0]?.url || "",
        oldPrice: product.compare_price,
        size: product.size,
        has_variants: product.has_variants,
        defaultVariantId: product.default_variant?.pvariant__id || null,
      }));

    }
    return [];
  } catch (error) {
    console.error("Error fetching special offers products:", error);
    return [];
  }
}


  static async getProductById(productId) {
    try {
      const response = await axiosServices.get(
        `/commerce/products/${productId}`
      );

      if (response.status && response.data.product) {
        const product = response.data.product;
        return {
          id: product.uid,
          name: product.name,
          price: product.price,
          comparePrice: product.compare_price,
          description: product.long_description || product.short_description,
          sku: product.uid,
          choices: product.choices || [],
          variants: product.variants || [],
          attachments: product.attachments || [],
          categories: product.categories || [],
          has_variants: product.has_variants,
          default_variant: product.default_variant || null,
          description: product.description || null,
        };
      }
      return null;
    } catch (error) {
      console.error("Error fetching product by ID:", error);
      return null;
    }
  }

  // Add method to find matching variant
  static findMatchingVariant(product, selectedOptions) {
    if (!product.variants || !selectedOptions) return null;

    const selectedItems = Object.values(selectedOptions).map(Number);

    return product.variants.find((variant) => {
      const variantItems = variant.items.map((item) => item.citem__id);
      return this.arraysMatch(variantItems, selectedItems);
    });
  }

  static arraysMatch(arr1, arr2) {
    if (arr1.length !== arr2.length) return false;
    return arr1.every((item) => arr2.includes(item));
  }

  static async getAllProducts() {
    try {
      const response = await axiosServices.get("/commerce/products");

      if (response.status && response.data.products.data) {
        return response.data.products.data.map((product) => ({
          id: product.uid,
          name: product.name,
          price: product.price,
          stock_id: product.uid,
          imageUrl: product.attachments?.[0]?.url || "",
          oldPrice: product.compare_price,
          size: product.size,
          description: product.short_description,
          sku: product.sku,
          has_variants: product.has_variants,
          defaultVariantId: product.default_variant?.pvariant__id || null,
        }));
      }

      return [];
    } catch (error) {
      console.error("Error fetching all products:", error);
      return [];
    }
  }

  static async getChineseProducts() {
    try {
      const response = await axiosServices.get("/commerce/products", {
        params: {
          categories: "Chinese",
        },
      });

      if (response.status && response.data.products.data) {
        return response.data.products.data.map((product) => ({
          id: product.uid,
          name: product.name,
          price: product.price,
          stock_id: product.uid,
          imageUrl: product.attachments?.[0]?.url || "",
          oldPrice: product.compare_price,
          size: product.size,
          has_variants: product.has_variants,
          defaultVariantId: product.default_variant?.pvariant__id || null,
        }));
      }
      return [];
    } catch (error) {
      console.error("Error fetching Chinese products:", error);
      return [];
    }
  }

  static async getMeatProducts() {
    try {
      const response = await axiosServices.get("/commerce/products", {
        params: {
          categories: "Halal Meat",
        },
      });

      if (response.status && response.data.products.data) {
        return response.data.products.data.map((product) => ({
          id: product.uid,
          name: product.name,
          price: product.price,
          stock_id: product.uid,
          imageUrl: product.attachments?.[0]?.url || "",
          oldPrice: product.compare_price,
          size: product.size,
          has_variants: product.has_variants,
          defaultVariantId: product.default_variant?.pvariant__id || null,
        }));
      }
      return [];
    } catch (error) {
      console.error("Error fetching meat products:", error);
      return [];
    }
  }

  static async getDairyProducts() {
    try {
      const response = await axiosServices.get("/commerce/products", {
        params: {
          categories: "Milk & Dairy",
        },
      });

      if (response.status && response.data.products.data) {
        return response.data.products.data.map((product) => ({
          id: product.uid,
          name: product.name,
          price: product.price,
          stock_id: product.uid,
          imageUrl: product.attachments?.[0]?.url || "",
          oldPrice: product.compare_price,
          size: product.size,
          has_variants: product.has_variants,
          defaultVariantId: product.default_variant?.pvariant__id || null,
        }));
      }
      return [];
    } catch (error) {
      console.error("Error fetching dairy products:", error);
      return [];
    }
  }
}

// Add the ProductServiceCategory class
export class ProductServiceCategory {
  static async getStockByCategory(categoryName, page = 1) {
    try {
      // This method is already using the products endpoint, so no change needed here
      const response = await axiosServices.get("/commerce/products", {
        params: {
          categories: categoryName,
          page: page,
          limit:12,

        },
      });

      if (response.status && response.data.products.data) {
        const pagination = {
          currentPage: response.data.current_page,
          lastPage: response.data.last_page,
          total: response.data.total,
          perPage: response.data.per_page,
        };

        const products = response.data.products.data.map((product) => ({
          id: product.uid,
          name: product.name,
          price: product.price,
          stock_id: product.uid,
          imageUrl: product.attachments?.[0]?.url || "",
          oldPrice: product.compare_price,
          size: product.size,
          has_variants: product.has_variants,
          defaultVariantId: product.default_variant?.pvariant__id || null,
        }));

        return {
          products,
          pagination,
        };
      }

      return {
        products: [],
        pagination: null,
      };
    } catch (error) {
      console.error("Error fetching category stock:", error);
      throw error;
    }
  }

  // Add a method for applying filters with products endpoint
  static async getFilteredProductsByCategory(page = 1, filters = {}) {
    try {
      // Construct the params object for the API request
      const params = {
        page: page,
        limit:12,
        ...filters, // This will include categories and choices parameters
      };


      const response = await axiosServices.get("/commerce/products", {
        params,
      });

      if (response.status && response.data.products.data) {
        const pagination = {
          currentPage: response.data.current_page,
          lastPage: response.data.last_page,
          total: response.data.total,
          perPage: response.data.per_page,
        };

        const products = response.data.products.data.map((product) => ({
          id: product.uid,
          name: product.name,
          price: product.price,
          stock_id: product.uid,
          imageUrl: product.attachments?.[0]?.url || "",
          oldPrice: product.compare_price,
          size: product.size,
          has_variants: product.has_variants,
          defaultVariantId: product.default_variant?.pvariant__id || null,
        }));

        return { products, pagination };
      }

      return { products: [], pagination: null };
    } catch (error) {
      console.error("Error fetching filtered products:", error);
      throw error;
    }
  }
}
