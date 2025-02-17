//product-service.js
export const productData = {
  products: [
    {
      id: 1,
      name: "Hand Cream",
      price: 2.99,
      imageUrl: "assets/images/hand-cream.jpg",
    },
    {
      id: 2,
      name: "Herbal Tea 16 ct.",
      price: 3.99,
      imageUrl: "assets/images/herbal-tea.jpg",
    },
    {
      id: 3,
      name: "Strawberries - 1lb",
      price: 4.49,
      oldPrice: 4.99,
      imageUrl: "assets/images/strawberries.jpg",
    },
    {
      id: 4,
      name: "Hass Avocados, Ready-to-Eat - 1lb",
      price: 2.69,
      oldPrice: 2.99,
      imageUrl: "assets/images/avocados.jpg",
    },
    {
      id: 5,
      name: "Boneless Chicken Thighs - 1lb",
      price: 4.04,
      oldPrice: 4.49,
      imageUrl: "assets/images/chicken-thighs.jpg",
    },
    {
      id: 6,
      name: "Boneless Chicken Breasts - 1lb",
      price: 4.0,
      oldPrice: 5.99,
      imageUrl: "assets/images/chicken-breasts.jpg",
    },
  ],

  categoryProducts: [
    {
      id: 201,
      name: "Fresh Carrots",
      price: 1.99,
      oldPrice: 2.49,
      imageUrl: "/assets/images/products/carrots.jpg",
      categoryId: 2, // Fresh Vegetables
      isPublished: true,
      isFeatured: true,
      choices: {
        weight: ["500g", "1kg", "2kg"],
        type: ["Organic", "Regular"],
      },
    },
    {
      id: 202,
      name: "Fresh Tomatoes",
      price: 2.49,
      oldPrice: 2.99,
      imageUrl: "/assets/images/products/tomatoes.jpg",
      categoryId: 2,
      isPublished: true,
      isFeatured: true,
      choices: {
        weight: ["500g", "1kg"],
        type: ["Organic", "Regular"],
      },
    },
    {
      id: 203,
      name: "Fresh Spinach",
      price: 1.79,
      imageUrl: "/assets/images/products/spinach.jpg",
      categoryId: 2,
      isPublished: true,
      choices: {
        weight: ["250g", "500g"],
        type: ["Organic"],
      },
    },
    // Add more products for other categories...
  ],

  getProductsByCategory(categoryId) {
    return this.categoryProducts.filter(
      (p) => p.categoryId === categoryId && p.isPublished
    );
  },

  // Keep existing methods
  getProductById(id) {
    return (
      this.products.find((p) => p.id.toString() === id.toString()) ||
      this.categoryProducts.find((p) => p.id.toString() === id.toString())
    );
  },
};
