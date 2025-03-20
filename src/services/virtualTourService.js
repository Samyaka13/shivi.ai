import API from './api';

export const virtualTourService = {
  /**
   * Generates a virtual tour based on the provided travel details
   * @param {Object} tourData - The travel details
   * @param {string} tourData.origin - Departure location
   * @param {string} tourData.destination - Arrival location
   * @param {string} tourData.travel_dates - Date range for the travel
   * @returns {Promise<Object>} - The generated virtual tour data
   */
  generateTour: async (tourData) => {
    try {
      // Use a longer timeout specifically for tour generation which is CPU intensive
      const response = await API.post('/api/virtual-tour/generate', tourData, {
        timeout: 180000 // 3 minutes timeout for this specific request
      });
      return response.data;
    } catch (error) {
      console.error('Error generating virtual tour:', error);
      throw error;
    }
  },

  /**
   * Retrieves a virtual tour by its ID
   * @param {string} tourId - The ID of the tour to retrieve
   * @returns {Promise<Object>} - The virtual tour data
   */
  getTourById: async (tourId) => {
    try {
      const response = await API.get(`/api/virtual-tour/${tourId}`);
      return response.data;
    } catch (error) {
      console.error('Error retrieving virtual tour:', error);
      throw error;
    }
  },

  /**
   * Lists all tours created by the current user
   * @returns {Promise<Array>} - The list of user's tours
   */
  getUserTours: async () => {
    try {
      const response = await API.get('/api/virtual-tour/user/tours');
      return response.data.tours;
    } catch (error) {
      console.error('Error retrieving user tours:', error);
      throw error;
    }
  }
};

export default virtualTourService;