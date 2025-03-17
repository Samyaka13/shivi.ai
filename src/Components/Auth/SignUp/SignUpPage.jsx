import React, { useState, useEffect } from 'react';
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaPhone } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const SignUp = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const validatePassword = (password) => {
    // Check if password has at least 8 characters
    const hasMinLength = password.length >= 8;
    // Check if password has at least one uppercase letter
    const hasUppercase = /[A-Z]/.test(password);
    // Check if password has at least one digit
    const hasDigit = /\d/.test(password);
    // Check if password has at least one special character
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    if (!hasMinLength) {
      return 'Password must be at least 8 characters long';
    } else if (!hasUppercase) {
      return 'Password must contain at least one uppercase letter';
    } else if (!hasDigit) {
      return 'Password must contain at least one digit';
    } else if (!hasSpecial) {
      return 'Password must contain at least one special character';
    }
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Validate password as user types
    if (name === 'password') {
      setPasswordError(validatePassword(value));
      
      // Also check if confirm password matches
      if (formData.confirmPassword && value !== formData.confirmPassword) {
        setConfirmPasswordError('Passwords do not match');
      } else {
        setConfirmPasswordError('');
      }
    }

    // Validate confirm password as user types
    if (name === 'confirmPassword') {
      if (value !== formData.password) {
        setConfirmPasswordError('Passwords do not match');
      } else {
        setConfirmPasswordError('');
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate password before submission
    const passwordValidationError = validatePassword(formData.password);
    
    if (passwordValidationError) {
      setPasswordError(passwordValidationError);
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      return;
    }
    
    // Form submission would connect to your existing backend
    console.log('Sign up attempt with:', formData);
  };

  return (
    <section className="py-16 bg-gray-50 min-h-screen flex items-center">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-8">
            <div className="text-center mb-8">
              <p className="text-yellow-500 text-5xl font-['Comforter_Brush']">Join Us</p>
              <h1 className="text-3xl font-medium font-['Abril_Fatface'] text-gray-800 mt-2">
                Create Account
              </h1>
              <p className="text-gray-500 mt-3">
                Start your journey with us and explore the world
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-5">
                <label htmlFor="fullName" className="block text-gray-700 font-medium mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>

              <div className="mb-5">
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
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>

              <div className="mb-5">
                <label htmlFor="phone" className="block text-gray-700 font-medium mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaPhone className="text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <div className="mb-5">
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
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-10 py-3 border ${
                      passwordError ? 'border-red-500' : 'border-gray-300'
                    } rounded-md focus:outline-none focus:ring-2 ${
                      passwordError ? 'focus:ring-red-500' : 'focus:ring-teal-600'
                    } focus:border-transparent`}
                    placeholder="••••••••"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>
                {passwordError && (
                  <p className="mt-1 text-sm text-red-600">{passwordError}</p>
                )}
                <p className="mt-1 text-sm text-gray-500">
                  Password must be at least 8 characters long and contain at least one uppercase letter, one digit, and one special character.
                </p>
              </div>

              <div className="mb-6">
                <label htmlFor="confirmPassword" className="block text-gray-700 font-medium mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="text-gray-400" />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-10 py-3 border ${
                      confirmPasswordError ? 'border-red-500' : 'border-gray-300'
                    } rounded-md focus:outline-none focus:ring-2 ${
                      confirmPasswordError ? 'focus:ring-red-500' : 'focus:ring-teal-600'
                    } focus:border-transparent`}
                    placeholder="••••••••"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>
                {confirmPasswordError && (
                  <p className="mt-1 text-sm text-red-600">{confirmPasswordError}</p>
                )}
              </div>

              <div className="mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                    required
                  />
                  <span className="ml-2 text-sm text-gray-600">
                    I agree to the{' '}
                    <a href="#" className="text-teal-600 hover:underline">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="#" className="text-teal-600 hover:underline">
                      Privacy Policy
                    </a>
                  </span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-teal-600 text-white py-3 px-4 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-colors duration-200"
              >
                Create Account
              </button>
            </form>

            <p className="mt-6 text-center text-gray-600">
              Already have an account?{' '}
              <Link to="/sign-in" className="text-teal-600 hover:underline">
                Sign in
              </Link>
              <br />
              <Link to="/home" className="text-teal-600 hover:underline">
                Home
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SignUp;