import React, { useState, useEffect, useRef } from 'react';
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaPhone, FaSearch, FaChevronDown, FaChevronUp, FaGoogle } from 'react-icons/fa';
import { Link, useNavigate, useLocation } from 'react-router-dom';

// Sample country data with codes and flags
const countries = [
  { name: 'United States', code: '+1', flag: '🇺🇸' },
  { name: 'United Kingdom', code: '+44', flag: '🇬🇧' },
  { name: 'India', code: '+91', flag: '🇮🇳' },
  { name: 'Canada', code: '+1', flag: '🇨🇦' },
  { name: 'Australia', code: '+61', flag: '🇦🇺' },
  { name: 'Germany', code: '+49', flag: '🇩🇪' },
  { name: 'France', code: '+33', flag: '🇫🇷' },
  { name: 'China', code: '+86', flag: '🇨🇳' },
  { name: 'Japan', code: '+81', flag: '🇯🇵' },
  { name: 'Brazil', code: '+55', flag: '🇧🇷' },
  { name: 'Mexico', code: '+52', flag: '🇲🇽' },
  { name: 'Spain', code: '+34', flag: '🇪🇸' },
  { name: 'Italy', code: '+39', flag: '🇮🇹' },
  { name: 'Russia', code: '+7', flag: '🇷🇺' },
  { name: 'South Korea', code: '+82', flag: '🇰🇷' },
  // Add more countries as needed
];

const SignUp = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Parse URL parameters to check for Google auth data
  const searchParams = new URLSearchParams(location.search);
  const googleAuthCode = searchParams.get('code');
  const googleAuthEmail = searchParams.get('email');
  const isGoogleSignUp = searchParams.get('google_signup') === 'true';

  const [formData, setFormData] = useState({
    fullName: '',
    email: googleAuthEmail || '',
    password: '',
    confirmPassword: '',
    phone: '',
    googleAuthCode: googleAuthCode || ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [isGoogleAuth, setIsGoogleAuth] = useState(!!googleAuthCode);

  // Country selector state
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.code.includes(searchTerm)
  );

  // If Google auth email is provided, prefill the email field
  useEffect(() => {
    if (googleAuthEmail) {
      setFormData(prev => ({
        ...prev,
        email: googleAuthEmail
      }));
    }
  }, [googleAuthEmail]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const validatePassword = (password) => {
    // Skip password validation if using Google auth
    if (isGoogleAuth) return '';

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

    // Validate password as user types (only if not Google auth)
    if (name === 'password' && !isGoogleAuth) {
      setPasswordError(validatePassword(value));

      // Also check if confirm password matches
      if (formData.confirmPassword && value !== formData.confirmPassword) {
        setConfirmPasswordError('Passwords do not match');
      } else {
        setConfirmPasswordError('');
      }
    }

    // Validate confirm password as user types
    if (name === 'confirmPassword' && !isGoogleAuth) {
      if (value !== formData.password) {
        setConfirmPasswordError('Passwords do not match');
      } else {
        setConfirmPasswordError('');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Different signup flow based on whether it's Google auth or regular signup
    if (isGoogleAuth) {
      try {
        // If using Google auth, we need to complete the registration with additional info
        const response = await fetch('/api/auth/google/complete-signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code: formData.googleAuthCode,
            full_name: formData.fullName,
            phone: `${selectedCountry.code}${formData.phone}`
          }),
        });

        const data = await response.json();

        if (response.ok) {
          // Store tokens and redirect to home
          localStorage.setItem('accessToken', data.access_token);
          localStorage.setItem('refreshToken', data.refresh_token);
          navigate('/home');
        } else {
          alert(`Signup failed: ${data.detail}`);
        }
      } catch (error) {
        console.error('Error during Google signup completion:', error);
        alert('An error occurred during signup. Please try again.');
      }
    } else {
      // Regular email/password signup
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

      // Include the country code with the phone number
      const formDataWithCountryCode = {
        ...formData,
        phone: `${selectedCountry.code}${formData.phone}`
      };

      try {
        // Standard signup endpoint
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formDataWithCountryCode.email,
            password: formDataWithCountryCode.password,
            full_name: formDataWithCountryCode.fullName,
            phone: formDataWithCountryCode.phone
          }),
        });

        const data = await response.json();

        if (response.ok) {
          // If signup successful, either show OTP verification or redirect to login
          setShowOtpVerification(true);
        } else {
          alert(`Signup failed: ${data.detail}`);
        }
      } catch (error) {
        console.error('Error during signup:', error);
        alert('An error occurred during signup. Please try again.');
      }
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      // Fetch Google authorization URL from backend
      const response = await fetch('/api/auth/google/authorize');
      const data = await response.json();
      
      // Redirect to Google authorization URL
      window.location.href = data.authorization_url;
    } catch (error) {
      console.error('Error initiating Google sign up:', error);
      alert('Failed to connect to Google authentication. Please try again.');
    }
  };

  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [otp, setOtp] = useState('');

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          otp: otp
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('accessToken', data.access_token);
        localStorage.setItem('refreshToken', data.refresh_token);
        navigate('/home');
      } else {
        alert(`OTP verification failed: ${data.detail}`);
      }
    } catch (error) {
      console.error('Error during OTP verification:', error);
      alert('An error occurred during verification. Please try again.');
    }
  };

  if (showOtpVerification) {
    return (
      <section className="py-16 bg-gray-50 min-h-screen flex items-center">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-8">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-medium text-gray-800">Verify Your Email</h1>
                <p className="text-gray-500 mt-3">Enter the OTP sent to {formData.email}</p>
              </div>

              <form onSubmit={handleVerifyOtp}>
                <div className="mb-5">
                  <label htmlFor="otp" className="block text-gray-700 font-medium mb-2">OTP Code</label>
                  <input
                    type="text"
                    id="otp"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md"
                    placeholder="Enter your OTP"
                    required
                  />
                </div>

                <button type="submit" className="w-full bg-teal-600 text-white py-3 px-4 rounded-md">Verify OTP</button>
              </form>
              <p className="mt-4 text-center text-gray-600">
                Didn't receive the code?{' '}
                <button
                  className="text-teal-600 hover:underline"
                  onClick={async () => {
                    try {
                      await fetch('/api/auth/resend-otp', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ email: formData.email }),
                      });
                      alert('OTP resent to your email');
                    } catch (error) {
                      console.error('Error resending OTP:', error);
                    }
                  }}
                >Resend OTP</button>
              </p>
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
              <p className="text-yellow-500 text-5xl font-['Comforter_Brush']">Join Us</p>
              <h1 className="text-3xl font-medium font-['Abril_Fatface'] text-gray-800 mt-2">
                Create Account
              </h1>
              <p className="text-gray-500 mt-3">
                {isGoogleAuth 
                  ? "Complete your Google signup" 
                  : "Start your journey with us and explore the world"}
              </p>
            </div>

            {/* Google Sign Up Button - Only show if not already using Google auth */}
            {!isGoogleAuth && (
              <div className="mb-6">
                <button
                  type="button"
                  onClick={handleGoogleSignUp}
                  className="w-full flex items-center justify-center bg-white border border-gray-300 rounded-md py-3 px-4 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
                >
                  <svg className="h-5 w-5 mr-2" fill="#4285F4" viewBox="0 0 24 24">
                    <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
                  </svg>
                  Sign up with Google
                </button>
              </div>
            )}

            {!isGoogleAuth && (
              <div className="flex items-center my-6">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="mx-4 text-gray-500 text-sm">OR</span>
                <div className="flex-grow border-t border-gray-300"></div>
              </div>
            )}

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
                    readOnly={isGoogleAuth} // Make readonly if from Google
                  />
                </div>
              </div>

              <div className="mb-5">
                <label htmlFor="phone" className="block text-gray-700 font-medium mb-2">
                  Phone Number
                </label>
                <div className="flex">
                  {/* Country code dropdown */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      type="button"
                      className="flex items-center justify-between w-32 pl-3 pr-2 py-3 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent bg-white"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                      <span className="flex items-center">
                        <span className="mr-2 text-lg">{selectedCountry.flag}</span>
                        <span>{selectedCountry.code}</span>
                      </span>
                      {isDropdownOpen ? <FaChevronUp className="text-gray-400" /> : <FaChevronDown className="text-gray-400" />}
                    </button>

                    {isDropdownOpen && (
                      <div className="absolute z-10 w-64 mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                        <div className="p-2 border-b border-gray-200">
                          <div className="relative">
                            <FaSearch className="absolute left-3 top-3 text-gray-400" />
                            <input
                              type="text"
                              placeholder="Search countries..."
                              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="max-h-60 overflow-y-auto">
                          {filteredCountries.map((country, index) => (
                            <button
                              key={index}
                              type="button"
                              className="flex items-center w-full px-4 py-2 text-left hover:bg-gray-100"
                              onClick={() => {
                                setSelectedCountry(country);
                                setIsDropdownOpen(false);
                                setSearchTerm('');
                              }}
                            >
                              <span className="mr-3 text-lg">{country.flag}</span>
                              <span className="flex-1">{country.name}</span>
                              <span className="text-gray-500">{country.code}</span>
                            </button>
                          ))}
                          {filteredCountries.length === 0 && (
                            <div className="px-4 py-2 text-gray-500">No countries found</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Phone number input */}
                  <div className="relative flex-1">
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                      placeholder="Phone number"
                    />
                  </div>
                </div>
              </div>

              {/* Only show password fields for regular signup */}
              {!isGoogleAuth && (
                <>
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
                        className={`w-full pl-10 pr-10 py-3 border ${passwordError ? 'border-red-500' : 'border-gray-300'
                          } rounded-md focus:outline-none focus:ring-2 ${passwordError ? 'focus:ring-red-500' : 'focus:ring-teal-600'
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
                        className={`w-full pl-10 pr-10 py-3 border ${confirmPasswordError ? 'border-red-500' : 'border-gray-300'
                          } rounded-md focus:outline-none focus:ring-2 ${confirmPasswordError ? 'focus:ring-red-500' : 'focus:ring-teal-600'
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
                </>
              )}

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
                {isGoogleAuth ? "Complete Sign Up" : "Create Account"}
              </button>
            </form>
            <p className="mt-6 text-center text-gray-600">
              Already have an account?{' '}
              <Link to="/" className="text-teal-600 hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SignUp;