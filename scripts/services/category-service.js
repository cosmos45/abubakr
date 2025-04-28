// category-service.js

// Global cache for categories
let categoriesCache = null;
let fetchPromise = null;




export const navbarCategoryData = {
  async fetchNavbarCategories() {
    if (!this.cache) {
      this.cache = fetch('/scripts/services/navbar-categories.json')
        .then(res => res.json())
        .catch(() => []);
    }
    return this.cache;
  }
};

export const categoryData = {
  async fetchCategories(forceRefresh = false) {
    try {
      // If we already have categories and no force refresh, return the cached data
      if (categoriesCache && !forceRefresh) {
        return categoriesCache;
      }

      // If there's already a fetch in progress, return that promise
      if (fetchPromise) {
        return fetchPromise;
      }

      // Start a new fetch
      fetchPromise = axiosServices
        .get("/commerce/categories")
        .then((response) => {
          const categories = response.data.categories || [];
          categoriesCache = categories;
          fetchPromise = null;
          return categories;
        })
        .catch((error) => {
          console.error("Error fetching categories:", error);
          fetchPromise = null;
          return [];
        });

      return fetchPromise;
    } catch (error) {
      console.error("Error in fetchCategories:", error);
      return [];
    }
  },

  async getCategoryByName(name) {
    try {
      const categories = await this.fetchCategories();

      // Helper function to search through category tree
      const findCategoryByName = (categories, targetName) => {
        for (const category of categories) {
          if (category.name === targetName) {
            return category;
          }
          if (category.child && category.child.length > 0) {
            const found = findCategoryByName(category.child, targetName);
            if (found) return found;
          }
        }
        return null;
      };

      const category = findCategoryByName(categories, name);

      // If not found in cache, try direct API call as fallback
      if (!category) {
        const response = await axiosServices.get("/commerce/products", {
          params: { categories: name },
        });
        if (response.status && response.data.categories) {
          return response.data.categories.find((cat) => cat.name === name);
        }
      }

      return category;
    } catch (error) {
      console.error("Error fetching category by name:", error);
      return null;
    }
  },

  async getActiveCategories() {
    const categories = await this.fetchCategories();
    return categories.filter((cat) => cat.is_active === true);
  },

  async getFeaturedCategories() {
    try {
      // Force a fresh fetch to ensure we have the latest data
      const categories = await this.fetchCategories(true);


      // Check if categories exist and filter featured ones
      const featuredCategories = categories.filter(
        (cat) => cat.is_active === true && cat.is_featured === true
      );


      // If no featured categories found, return all active categories as fallback
      if (featuredCategories.length === false) {
        console.warn(
          "No featured categories found, using all active categories as fallback"
        );
        return categories.filter((cat) => cat.is_active === true).slice(0, 8);
      }

      return featuredCategories;
    } catch (error) {
      console.error("Error in getFeaturedCategories:", error);
      return [];
    }
  },
  async getCategory(uid) {
    const categories = await this.fetchCategories();

    const findCategory = (categories, targetUid) => {
      for (const category of categories) {
        if (category.uid === targetUid) {
          return category;
        }
        if (category.child && category.child.length > 0) {
          const found = findCategory(category.child, targetUid);
          if (found) return found;
        }
      }
      return null;
    };

    return findCategory(categories, uid);
  },

  async getCategoryParent(childUid) {
    const categories = await this.fetchCategories();

    const findParent = (categories) => {
      for (const category of categories) {
        if (category.child) {
          const childCategory = category.child.find(
            (child) => child.uid === childUid
          );
          if (childCategory) {
            return category;
          }
        }
      }
      return null;
    };

    return findParent(categories);
  },

  // Method to prefetch categories at app startup
  async prefetchCategories() {
    if (!categoriesCache) {
      return this.fetchCategories();
    }
    return categoriesCache;
  },

  // New methods to fetch products by category (replacing stock)
  async getCategoryProducts(categoryName, page = 1) {
    try {
      console.debug(
        `Fetching products for category: ${categoryName}, page: ${page}`
      );
      console.log(
        `Fetching products for category: ${categoryName}, page: ${page}`
      );

      const response = await axiosServices.get("/commerce/products", {
        params: {
          categories: categoryName,
          page: page,
          limit: 12,
        },
      });

      if (response.status && response.data.products) {
        const productsData = response.data.products;

        const pagination = {
          currentPage: productsData.current_page,
          lastPage: productsData.last_page,
          total: productsData.total,
          perPage: productsData.per_page,
        };

        const products = productsData.data.map((product) => ({
          id: product.uid,
          name: product.name,
          price: product.price,
          stock_id: product.uid,
          imageUrl: product.attachments?.[0]?.url || "",
          oldPrice: product.compare_price,
          brand: product.brand,
          description: product.short_description,
          has_variants: product.has_variants,
          defaultVariant: product.default_variant,
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
      console.error("Error fetching category products:", error);
      throw error;
    }
  },

  async getFilteredCategoryProducts(categoryName, filters = {}, page = 1) {
    try {
      // Construct the params object for the API request
      const filterParams = {
        categories: categoryName,
        page: page,
        limit:12,
      };

      // Process all active filters
      Object.entries(filters).forEach(([filterType, values]) => {
        if (filterType === "Size" || filterType === "Colour") {
          // Size and Colour go into choices parameter
          if (!filterParams.choices) {
            filterParams.choices = [];
          }
          filterParams.choices = filterParams.choices.concat(values);
        } else if (filterType === "Categories") {
          // Override the category parameter if specified in filters
          if (values && values.length > 0) {
            filterParams.categories = values.join(",");
          }
        } else {
          // For other filter types, add as separate parameters
          filterParams[filterType] = Array.isArray(values)
            ? values.join(",")
            : values;
        }
      });

      // Convert choices array to comma-separated string if it exists
      if (filterParams.choices && filterParams.choices.length > 0) {
        filterParams.choices = filterParams.choices.join(",");
      }

      console.debug("Filter parameters:", filterParams);

      const response = await axiosServices.get("/commerce/products", {
        params: filterParams,
        limit:12,
      });

      if (response.status && response.data.products) {
        const productsData = response.data.products;

        const pagination = {
          currentPage: productsData.current_page,
          lastPage: productsData.last_page,
          total: productsData.total,
          perPage: productsData.per_page,
        };

        const products = productsData.data.map((product) => ({
          id: product.uid,
          name: product.name,
          price: product.price,
          stock_id: product.uid,
          imageUrl: product.attachments?.[0]?.url || "",
          oldPrice: product.compare_price,
          brand: product.brand,
          description: product.short_description,
          has_variants: product.has_variants, // Make sure to use the original has_variants property
          hasVariants: product.has_variants, // Keep both for compatibility
          defaultVariant: product.default_variant,
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
      console.error("Error fetching filtered category products:", error);
      throw error;
    }
  },
};

// Export the cache for direct access if needed
export const getCategoriesCache = () => categoriesCache;
