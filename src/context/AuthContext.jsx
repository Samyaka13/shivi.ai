import React, { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/api';

// Create context
const AuthContext = createContext(null);

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      // Check for token in storage
      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Try to get user profile
        const user = await authService.getProfile();
        setCurrentUser(user);
        setIsAuthenticated(true);
      } catch (error) {
        // Token may be invalid, try to refresh
        try {
          const refreshToken = localStorage.getItem('refresh_token') || sessionStorage.getItem('refresh_token');
          if (refreshToken) {
            const tokens = await authService.refreshToken(refreshToken);

            // Determine which storage to use
            const storage = localStorage.getItem('refresh_token') ? localStorage : sessionStorage;

            // Save new tokens
            storage.setItem('access_token', tokens.access_token);
            storage.setItem('refresh_token', tokens.refresh_token);

            // Try to get user profile again with new token
            const user = await authService.getProfile();
            setCurrentUser(user);
            setIsAuthenticated(true);
          }
        } catch (refreshError) {
          // Clear tokens if refresh failed
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          sessionStorage.removeItem('access_token');
          sessionStorage.removeItem('refresh_token');
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Login function
  const login = async (email, password, rememberMe = false) => {
    try {
      const response = await authService.login(email, password);

      // Store tokens based on rememberMe flag
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('access_token', response.access_token);
      storage.setItem('refresh_token', response.refresh_token);

      // Get user profile
      const userProfile = await authService.getProfile();
      setCurrentUser(userProfile);
      setIsAuthenticated(true);

      return {
        success: true,
        isActive: userProfile.is_active,
        user: userProfile
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Login failed'
      };
    }
  };

  // Signup function
  const signup = async (userData) => {
    try {
      const response = await authService.signup(userData);
      return { success: true, data: response };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Signup failed'
      };
    }
  };

  // Verify OTP function
  const verifyOtp = async (email, otp, rememberMe = false) => {
    try {
      const response = await authService.verifyOtp(email, otp);

      // Store tokens based on rememberMe flag
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('access_token', response.access_token);
      storage.setItem('refresh_token', response.refresh_token);

      // Get user profile
      const userProfile = await authService.getProfile();
      setCurrentUser(userProfile);
      setIsAuthenticated(true);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'OTP verification failed'
      };
    }
  };

  // Google Login function
  const googleLogin = async () => {
    try {
      // Initialize Google OAuth process
      const googleAuthUrl = await authService.getGoogleAuthUrl();
      
      // Open the Google OAuth popup/window
      const width = 500;
      const height = 600;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      
      const popup = window.open(
        googleAuthUrl,
        'googleAuth',
        `width=${width},height=${height},left=${left},top=${top}`
      );
      
      // Listen for messages from the popup
      return new Promise((resolve) => {
        window.addEventListener('message', async (event) => {
          // Verify origin for security
          if (event.origin !== window.location.origin) return;
          
          // Close the popup
          if (popup) popup.close();
          
          if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
            const { tokens } = event.data;
            
            // Save tokens
            const storage = localStorage; // Usually we want to remember Google logins
            storage.setItem('access_token', tokens.access_token);
            storage.setItem('refresh_token', tokens.refresh_token);
            
            // Get user profile
            const userProfile = await authService.getProfile();
            setCurrentUser(userProfile);
            setIsAuthenticated(true);
            
            resolve({ success: true });
          } else {
            resolve({
              success: false,
              error: event.data.error || 'Google authentication failed'
            });
          }
        }, { once: true });
      });
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to initialize Google login'
      };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      if (isAuthenticated) {
        await authService.logout();
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear auth state and tokens
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      sessionStorage.removeItem('access_token');
      sessionStorage.removeItem('refresh_token');

      setCurrentUser(null);
      setIsAuthenticated(false);
    }
  };

  // Context value
  const value = {
    currentUser,
    isAuthenticated,
    loading,
    login,
    signup,
    verifyOtp,
    logout,
    googleLogin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;