import API from './api';

export const routeCalculationService = {
  /**
   * Calculate travel routes based on user inputs
   * @param {Object} routeRequest - The route request parameters
   * @returns {Promise<Object>} - The calculated route options
   */
  calculateRoute: async (routeRequest) => {
    try {
      // Ensure proper number formatting for budget and num_people
      const formattedRequest = {
        ...routeRequest,
        budget: typeof routeRequest.budget === 'string' ? parseFloat(routeRequest.budget) : routeRequest.budget,
        num_people: typeof routeRequest.num_people === 'string' ? parseInt(routeRequest.num_people, 10) : routeRequest.num_people
      };
      
      const response = await API.post('/api/travel/plan', formattedRequest);
      return response.data;
    } catch (error) {
      console.error('Error calculating route:', error);
      throw error;
    }
  },

  /**
   * Get a specific route plan by ID
   * @param {string} planId - The ID of the route plan
   * @returns {Promise<Object>} - The route plan details
   */
  getRoutePlan: async (planId) => {
    try {
      const response = await API.get(`/api/travel/plan/${planId}`);
      if (response.data && !response.data.content && typeof response.data === 'object') {
        // If we get an object without content property, this might be an error response
        console.warn("Unusual response format from API:", response.data);
        
        // If we have content inside a nested object, extract it
        if (response.data.plan && response.data.plan.content) {
          return response.data.plan;
        }
      }
      return response.data;
    } catch (error) {
      console.error('Error retrieving route plan:', error);
      if (error.response && error.response.data) {
        console.error('API error response:', error.response.data);
      }
      throw error;
    }
  },

  /**
   * Get all route plans for the current user
   * @returns {Promise<Array>} - List of user's route plans
   */
  getUserRoutePlans: async () => {
    try {
      const response = await API.get('/api/travel/plans/user');
      
      // Check if the response has a nested structure where plans might be
      if (response.data && Array.isArray(response.data.plans)) {
        return response.data.plans;
      }
      
      // If it's already an array, return it directly
      if (Array.isArray(response.data)) {
        return response.data;
      }
      
      // Handle unexpected response format
      console.warn("Unexpected response format from route plans API:", response.data);
      return [];
    } catch (error) {
      console.error('Error retrieving user route plans:', error);
      throw error;
    }
  },
  
  /**
   * Delete a route plan
   * @param {string} planId - The ID of the route plan to delete
   * @returns {Promise<Object>} - Response indicating success or failure
   */
  deleteRoutePlan: async (planId) => {
    try {
      const response = await API.delete(`/api/travel/plan/${planId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting route plan:', error);
      throw error;
    }
  }
};

export default routeCalculationService;