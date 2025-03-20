import axios from 'axios';

// Create axios instance with custom configuration
const API = axios.create({
  baseURL: 'http://localhost:8000', // Change to your API URL (or read from .env)
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// Add request interceptor to attach auth token
API.interceptors.request.use(
  (config) => {
    // Get token from storage
    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    
    // If token exists, add it to request headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle token refresh
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 and not from a refresh token request and we haven't tried to refresh yet
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/v1/auth/refresh-token')
    ) {
      originalRequest._retry = true;
      
      try {
        // Get the refresh token
        const refreshToken = localStorage.getItem('refresh_token') || sessionStorage.getItem('refresh_token');
        
        if (!refreshToken) {
          // No refresh token available, redirect to login
          window.location.href = '/';
          return Promise.reject(error);
        }
        
        // Try to get a new access token
        const response = await API.post('/v1/auth/refresh-token', {
          refresh_token: refreshToken
        });
        
        // Determine which storage to use
        const storage = localStorage.getItem('refresh_token') ? localStorage : sessionStorage;
        
        // Save the new tokens
        storage.setItem('access_token', response.data.access_token);
        storage.setItem('refresh_token', response.data.refresh_token);
        
        // Update auth header
        API.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`;
        originalRequest.headers.Authorization = `Bearer ${response.data.access_token}`;
        
        // Retry the original request
        return API(originalRequest);
      } catch (refreshError) {
        // Refresh token is invalid or expired
        // Clear tokens and redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('refresh_token');
        
        window.location.href = '/';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth API service
export const authService = {
  // Login user
  login: async (email, password) => {
    try {
      const response = await API.post('/v1/auth/login', { email, password });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Get user profile
  getProfile: async () => {
    try {
      const response = await API.get('/v1/auth/me');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Sign up user
  signup: async (userData) => {
    try {
      const response = await API.post('/v1/auth/signup', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Verify OTP
  verifyOtp: async (email, otp) => {
    try {
      const response = await API.post('/v1/auth/verify-otp', { email, otp });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Resend OTP
  resendOtp: async (email) => {
    try {
      const response = await API.post('/v1/auth/resend-otp', { email });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Logout user
  logout: async () => {
    try {
      const response = await API.post('/v1/auth/logout');
      return response.data;
    } catch (error) {
      // Even if logout fails server-side, clear client-side tokens
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      sessionStorage.removeItem('access_token');
      sessionStorage.removeItem('refresh_token');
      throw error;
    }
  },
  
  // Refresh token
  refreshToken: async (refreshToken) => {
    try {
      const response = await API.post('/v1/auth/refresh-token', { refresh_token: refreshToken });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default API;