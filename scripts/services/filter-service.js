// scripts/services/filter-service.js

export const FilterService = {
  async getFilters() {
    try {
      const response = await axiosServices.get("/commerce/filters");
      return response.data;
    } catch (error) {
      console.error("Error fetching filters:", error);
      throw error;
    }
  },
};
