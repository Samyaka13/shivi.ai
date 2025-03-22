import React, { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/api';
import { otplessAuthService } from '../services/otplessAuthService';

// Create context
const AuthContext = createContext(null);

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // // Check authentication status on mount
  // useEffect(() => {
  //   const checkAuthStatus = async () => {
  //     // Check for token in storage
  //     const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');

  //     if (!token) {
  //       setLoading(false);
  //       return;
  //     }

  //     try {
  //       // Try to get user profile
  //       const user = await authService.getProfile();
  //       setCurrentUser(user);
  //       setIsAuthenticated(true);
  //     } catch (error) {
  //       // Token may be invalid, try to refresh
  //       try {
  //         const refreshToken = localStorage.getItem('refresh_token') || sessionStorage.getItem('refresh_token');
  //         if (refreshToken) {
  //           const tokens = await authService.refreshToken(refreshToken);

  //           // Determine which storage to use
  //           const storage = localStorage.getItem('refresh_token') ? localStorage : sessionStorage;

  //           // Save new tokens
  //           storage.setItem('access_token', tokens.access_token);
  //           storage.setItem('refresh_token', tokens.refresh_token);

  //           // Try to get user profile again with new token
  //           const user = await authService.getProfile();
  //           setCurrentUser(user);
  //           setIsAuthenticated(true);
  //         }
  //       } catch (refreshError) {
  //         // Clear tokens if refresh failed
  //         localStorage.removeItem('access_token');
  //         localStorage.removeItem('refresh_token');
  //         sessionStorage.removeItem('access_token');
  //         sessionStorage.removeItem('refresh_token');
  //       }
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   checkAuthStatus();
  // }, []);

  // Initialize OTPless SDK
  useEffect(() => {
    // Load OTPless SDK
    const loadOTPlessSDK = () => {
      if (document.getElementById('otpless-sdk')) return;
      
      const script = document.createElement('script');
      script.id = 'otpless-sdk';
      script.type = 'text/javascript';
      script.src = 'https://otpless.com/v4/auth.js';
      script.setAttribute('data-appid', 'YOUR_APP_ID'); // Replace with your actual OTPless App ID
      document.body.appendChild(script);
      
      return () => {
        if (document.getElementById('otpless-sdk')) {
          document.getElementById('otpless-sdk').remove();
        }
      };
    };
    
    loadOTPlessSDK();
    
    // Set up the global OTPless callback
    window.otpless = async (otplessUser) => {
      if (otplessUser) {
        await handleOTPlessLogin(otplessUser);
      }
    };
  }, []);

  // OTPless authentication handler
  const handleOTPlessLogin = async (otplessUser, rememberMe = true) => {
    try {
      setLoading(true);
      
      const result = await otplessAuthService.handleOTPlessAuth(otplessUser, rememberMe);
      
      if (result.success && result.user) {
        setCurrentUser(result.user);
        setIsAuthenticated(true);
        return { success: true, user: result.user };
      } else {
        return { success: false, error: result.error || 'Authentication failed' };
      }
    } catch (error) {
      console.error('OTPless authentication error:', error);
      return { success: false, error: 'Authentication failed' };
    } finally {
      setLoading(false);
    }
  };

  // Login function (kept for legacy purposes)
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
    logout,
    handleOTPlessLogin,
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