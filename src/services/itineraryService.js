import API from './api';

export const itineraryService = {
  /**
   * Generates a travel itinerary based on user preferences
   * @param {Object} travelRequest - The travel request parameters
   * @param {string} travelRequest.origin - Traveler's starting location
   * @param {string} travelRequest.destination - Target destination for the trip
   * @param {number} travelRequest.duration - Trip length in days
   * @param {string} travelRequest.budget - Budget level (e.g., "Budget", "Mid-range", "Luxury")
   * @param {string} travelRequest.preferences - Traveler's interests and preferences
   * @param {string} travelRequest.special_requirements - Any special needs or requests
   * @returns {Promise<Object>} - The generated itinerary response
   */
  generateItinerary: async (travelRequest) => {
    try {
      console.log('Sending itinerary request with payload:', JSON.stringify(travelRequest));
      
      // Ensure all fields match the expected types from the API's model
      const formattedRequest = {
        origin: String(travelRequest.origin),
        destination: String(travelRequest.destination),
        duration: String(travelRequest.duration),
        budget: String(travelRequest.budget),
        preferences: String(travelRequest.preferences),
        special_requirements: travelRequest.special_requirements || ""
      };
      
      const response = await API.post('/trip_planning/itinerary', formattedRequest);
      return response.data;
    } catch (error) {
      console.error('Error generating itinerary:', error);
      console.error('Error details:', error.response?.data);
      throw error;
    }
  },

  /**
   * Retrieves an itinerary by its ID
   * @param {string} itineraryId - The MongoDB ObjectId of the itinerary
   * @returns {Promise<Object>} - The retrieved itinerary
   */
  getItineraryById: async (itineraryId) => {
    try {
      const response = await API.get(`/trip_planning/itinerary/${itineraryId}`);
      return response.data;
    } catch (error) {
      console.error('Error retrieving itinerary:', error);
      throw error;
    }
  },

  /**
   * Lists all itineraries with pagination
   * @param {number} limit - Maximum number of results to return
   * @param {number} skip - Number of results to skip
   * @returns {Promise<Object>} - The list of itineraries with pagination info
   */
  listItineraries: async (limit = 10, skip = 0) => {
    try {
      const response = await API.get(`/trip_planning/itineraries?limit=${limit}&skip=${skip}`);
      return response.data;
    } catch (error) {
      console.error('Error listing itineraries:', error);
      throw error;
    }
  },

  /**
   * Lists all itineraries for the current user
   * @param {number} limit - Maximum number of results to return
   * @param {number} skip - Number of results to skip
   * @returns {Promise<Object>} - The list of user's itineraries with pagination info
   */
  getUserItineraries: async (limit = 10, skip = 0) => {
    try {
      const response = await API.get(`/trip_planning/user/itineraries?limit=${limit}&skip=${skip}`);
      return response.data;
    } catch (error) {
      console.error('Error retrieving user itineraries:', error);
      throw error;
    }
  },

  /**
   * Deletes an itinerary by its ID
   * @param {string} itineraryId - The MongoDB ObjectId of the itinerary to delete
   * @returns {Promise<Object>} - The deletion response
   */
  deleteItinerary: async (itineraryId) => {
    try {
      const response = await API.delete(`/trip_planning/itinerary/${itineraryId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting itinerary:', error);
      throw error;
    }
  }
};

export default itineraryService;