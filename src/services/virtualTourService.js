import API from './api';

export const virtualTourService = {
  /**
   * Generates a virtual tour based on the provided travel details
   * @param {Object} tourData - The travel details
   * @param {string} tourData.origin - Departure location
   * @param {string} tourData.destination - Arrival location
   * @param {string} tourData.travel_dates - Date range for the travel
   * @param {Object} [tourData.preferences] - User preferences as a JSON object
   * @param {string} [tourData.budget] - Budget level for the trip
   * @param {number} [tourData.members] - Number of travelers
   * @param {string} [tourData.special_requirements] - Any special requirements
   * @returns {Promise<Object>} - The generated virtual tour data
   */
  generateTour: async (tourData) => {
    try {
      console.log("Sending virtual tour request with payload:", JSON.stringify(tourData));
      
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
  },
  
  /**
   * Delete a specific virtual tour
   * @param {string} tourId - The ID of the tour to delete
   * @returns {Promise<Object>} - Response from the server
   */
  deleteTour: async (tourId) => {
    try {
      const response = await API.delete(`/api/virtual-tour/${tourId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting virtual tour:', error);
      throw error;
    }
  },
  
  /**
   * Updates an existing virtual tour
   * @param {string} tourId - The ID of the tour to update
   * @param {Object} updateData - The data to update
   * @returns {Promise<Object>} - The updated tour data
   */
  updateTour: async (tourId, updateData) => {
    try {
      const response = await API.put(`/api/virtual-tour/${tourId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating virtual tour:', error);
      throw error;
    }
  }
};

export default virtualTourService;