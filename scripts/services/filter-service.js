// scripts/services/filter-service.js
import axiosService from './axiosService.js';

export const FilterService = {
  async getFilters() {
    try {
      const response = await axiosService.get('/commerce/filters');
      return response.data;
    } catch (error) {
      console.error('Error fetching filters:', error);
      throw error;
    }
  }
};
