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
      const response = await API.post('/v1/auth/otpless/verify', otplessData);
      return response.data;
    } catch (error) {
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
      // Extract relevant data from OTPless response
      const authData = {
        token: otplessUser.token,
        timestamp: otplessUser.timestamp,
        method: otplessUser.method || 'whatsapp', // Default to whatsapp
        waId: otplessUser.waId,
        phoneNumber: otplessUser.phoneNumber,
        email: otplessUser.email,
        name: otplessUser.name || '',
      };
      
      // Send to backend for verification
      const response = await otplessAuthService.verifyOTPlessAuth(authData);
      
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
          },
          user: response.user || null
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