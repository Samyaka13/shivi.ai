import API from './api';

// OTPless auth service for handling OTPless authentication
export const otplessAuthService = {
  /**
   * Verify OTPless authentication data with backend
   * @param {Object} otplessData - The user data received from OTPless
   * @returns {Promise<Object>} - Authentication response with tokens
   */
  verifyOTPlessAuth: async (otplessData) => {
    try {
      console.log("Sending OTPless data to backend:", otplessData);
      const response = await API.post('/v1/auth/otpless/verify', otplessData);
      return response.data;
    } catch (error) {
      console.error("Error verifying OTPless auth:", error);
      console.error("Error response:", error.response?.data);
      throw error;
    }
  },
  
  /**
   * Handle OTPless login/signup
   * @param {Object} otplessUser - User data from OTPless SDK
   * @param {boolean} rememberMe - Whether to remember the user
   * @returns {Promise<Object>} - Processing result with user data and tokens
   */
  handleOTPlessAuth: async (otplessUser, rememberMe = true) => {
    try {
      console.log("Raw OTPless response:", otplessUser);
      
      // The OTPless data structure has changed - just forward it as is
      const response = await otplessAuthService.verifyOTPlessAuth(otplessUser);
      
      if (response && response.access_token) {
        // Store tokens based on rememberMe flag
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem('access_token', response.access_token);
        storage.setItem('refresh_token', response.refresh_token);
        
        return {
          success: true,
          tokens: {
            access_token: response.access_token,
            refresh_token: response.refresh_token
          }
        };
      } else {
        throw new Error('Invalid response from authentication server');
      }
    } catch (error) {
      console.error('OTPless auth error:', error);
      return {
        success: false,
        error: error.response?.data?.detail || 'Authentication failed'
      };
    }
  }
};

export default otplessAuthService;