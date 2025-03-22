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
      
      // Debug the response to see what format we're getting
      console.log('Virtual Tour API response:', response.data);
      
      // Handle different response formats
      if (response.data && response.data.tours && Array.isArray(response.data.tours)) {
        // Format: { tours: [...] }
        return response.data.tours;
      } else if (response.data && response.data.tour && Array.isArray(response.data.tour)) {
        // Format: { tour: [...] }
        return response.data.tour;
      } else if (Array.isArray(response.data)) {
        // Format: [...]
        return response.data;
      } else if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
        // Format: { tour_id: ..., origin: ..., ... } (single tour object)
        return [response.data]; // Wrap in array
      }
      
      // If we can't determine format, return empty array
      console.warn('Unexpected response format from virtual tour API:', response.data);
      return [];
    } catch (error) {
      console.error('Error retrieving user tours:', error);
      throw error;
    }
  }
};

export default virtualTourService;