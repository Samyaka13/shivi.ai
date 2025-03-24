import React, { useState, useEffect, useRef } from 'react';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaSpinner } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

const SignInPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showOtpVerification, setShowOtpVerification] = useState();
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const otplessContainerRef = useRef(null);

  // If user is already authenticated, redirect to home
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home');
    }
  }, [isAuthenticated, navigate]);

  // Initialize OTPless login container
  useEffect(() => {
    // The OTPless UI will be rendered in this container
    if (otplessContainerRef.current && window.otplessInit) {
      window.otplessInit();
    }
  }, []);
  useEffect(() => {
    // Ensure otplessInit gets called after SDK is loaded
    const initOtpless = () => {
      if (window.otplessInit) {
        console.log("Initializing OTPless UI");
        window.otplessInit();
      } else {
        console.log("OTPless SDK not loaded yet, retrying...");
        setTimeout(initOtpless, 500);
      }
    };

    // Call initialization
    initOtpless();

    // Listen for successful OTPless auth
    const handleOtplessSuccess = (event) => {
      if (event.data && event.data.type === "OTPLESS_AUTH_SUCCESS") {
        console.log("OTPless auth detected, redirecting...");
        window.location.href = "/";
      }
    };

    window.addEventListener('message', handleOtplessSuccess);

    return () => {
      window.removeEventListener('message', handleOtplessSuccess);
    };
  }, []);
  // Legacy login form handler (kept for backward compatibility)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const result = await login(email, password, rememberMe);

      if (result.success) {
        navigate('/home');
      } else {
        // Check if the error indicates account doesn't exist
        if (result.error === 'User not found' || result.error === 'Account not found' || result.error.includes('not found') || result.error.includes('doesn\'t exist') || result.error.includes('Failed to obtain access token from Google')) {
          // Redirect to signup page with email pre-filled
          navigate('/sign-up', { state: { email } });
        } else {
          setError(result.error);
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const emailForVerification = sessionStorage.getItem('email_for_verification') || email;

      const result = await verifyOtp(emailForVerification, otp, rememberMe);

      if (result.success) {
        // Clean up
        sessionStorage.removeItem('email_for_verification');

        // Redirect to home page
        navigate('/home');
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error('OTP verification error:', err);
      setError('Failed to verify OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setError('');

    try {
      const emailForVerification = sessionStorage.getItem('email_for_verification') || email;

      const response = await fetch('http://localhost:8000/v1/auth/resend-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: emailForVerification }),
      });

      if (response.ok) {
        setSuccessMessage('OTP has been resent to your email.');
      } else {
        const data = await response.json();
        setError(data.detail || 'Failed to resend OTP. Please try again.');
      }
    } catch (err) {
      console.error('Resend OTP error:', err);
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      const result = await googleLogin();

      if (result.success) {
        navigate('/home');
      } else {
        // Check if error indicates account doesn't exist
        if (result.error === 'User not found' || result.error === 'Account not found' || result.error.includes('not found') || result.error.includes('doesn\'t exist') || result.error.includes('Google callback error')) {
          // Redirect to signup page
          navigate('/sign-up');
        } else {
          setError(result.error || 'Failed to sign in with Google');
        }
      }
    } catch (err) {
      console.error('Google login error:', err);
      setError('An error occurred during Google sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // OTP verification view
  if (showOtpVerification) {
    return (
      <section className="py-16 bg-gray-50 min-h-screen flex items-center">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-8">
              <div className="text-center mb-8">
                <p className="text-yellow-500 text-5xl font-['Comforter_Brush']">Verify Your Email</p>
                <h1 className="text-3xl font-medium font-['Abril_Fatface'] text-gray-800 mt-2">
                  Enter OTP
                </h1>
                <p className="text-gray-500 mt-3">
                  We've sent a verification code to your email
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                  {error}
                </div>
              )}

              {successMessage && (
                <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
                  {successMessage}
                </div>
              )}

              <form onSubmit={handleVerifyOtp}>
                <div className="mb-6">
                  <label htmlFor="otp" className="block text-gray-700 font-medium mb-2">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    id="otp"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                    placeholder="Enter the OTP code"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-teal-600 text-white font-bold py-3 px-6 rounded-md border-2 cursor-pointer border-teal-600 hover:bg-teal-700 hover:border-teal-700 transition duration-300 mb-4"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <FaSpinner className="animate-spin mr-2" />
                      Verifying...
                    </span>
                  ) : (
                    'Verify OTP'
                  )}
                </button>
              </form>

              <div className="text-center mt-4">
                <p className="text-gray-600 mb-2">
                  Didn't receive the code?
                </p>
                <button
                  onClick={handleResendOtp}
                  className="text-teal-600 hover:text-teal-800 font-medium"
                  disabled={loading}
                >
                  {loading ? 'Sending...' : 'Resend OTP'}
                </button>
              </div>

              <div className="mt-6 text-center">
                <button
                  onClick={() => setShowOtpVerification(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Back to Sign In
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }
  return (
    <section className="py-16 bg-gray-50 min-h-screen flex items-center">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-8">
            <div className="text-center mb-8">
              <p className="text-yellow-500 text-5xl font-['Comforter_Brush']">Welcome Back</p>
              <h1 className="text-3xl font-medium font-['Abril_Fatface'] text-gray-800 mt-2">
                Sign In
              </h1>
              <p className="text-gray-500 mt-3">
                Access your travel account and continue your journey
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
                {successMessage}
              </div>
            )}

            {/* OTPless Login Button Container */}
            <div className="my-6">
              <div id="otpless-login-page" ref={otplessContainerRef} className="flex justify-center"></div>
            </div>

            <div className="relative flex items-center my-8">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="flex-shrink mx-4 text-gray-500">or sign in with email</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>

            {/* Traditional Login Form */}
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>

              <div className="mb-6">
                <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                    placeholder="••••••••"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                      {showPassword ? <FaEyeSlash className='cursor-pointer' /> : <FaEye className='cursor-pointer' />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="remember"
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                    className="h-4 w-4 text-teal-600 cursor-pointer focus:ring-teal-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                    Remember me
                  </label>
                </div>
                <Link to="/forgot-password" className="text-sm text-teal-600 hover:text-teal-800">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                className="w-full bg-teal-600 text-white font-bold py-3 px-6 rounded-md border-2 cursor-pointer border-teal-600 hover:bg-teal-700 hover:border-teal-700 transition duration-300"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <FaSpinner className="animate-spin mr-2" />
                    Signing In...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Don't have an account?{' '}
                <Link to="/sign-up" className="text-teal-600 hover:text-teal-800 font-medium">
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SignInPage;