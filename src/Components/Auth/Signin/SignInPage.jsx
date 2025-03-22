// http://redirectmeto.com/http://localhost:8000/v1/auth/google/callback

import React, { useState } from 'react';
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
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [otp, setOtp] = useState('');

  const navigate = useNavigate();
  const { login, verifyOtp, googleLogin } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const result = await login(email, password, rememberMe);

      if (result.success) {
        if (result.isActive) {
          navigate('/home');
        } else {
          // User exists but isn't active - needs OTP verification
          setShowOtpVerification(true);
          setSuccessMessage('Please verify your email with the OTP sent to your inbox.');
          // Store email for OTP verification
          sessionStorage.setItem('email_for_verification', email);
        }
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

  // Sign in view
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

            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <FaSpinner className="animate-spin mr-2" />
                      Connecting...
                    </span>
                  ) : (
                    <>
                      <svg className="h-5 w-5 mr-2" fill="#4285F4" viewBox="0 0 24 24">
                        <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
                      </svg>
                      Sign in with Google
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SignInPage;