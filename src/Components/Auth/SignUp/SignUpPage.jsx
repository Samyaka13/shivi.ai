import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { FaSpinner } from 'react-icons/fa';

const SignUp = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Script to initialize OTPless with direct callback
  useEffect(() => {
    // Script to add OTPless SDK if not already added
    if (!document.getElementById('otpless-sdk')) {
      const script = document.createElement('script');
      script.id = 'otpless-sdk';
      script.type = 'text/javascript';
      script.src = 'https://otpless.com/v4/auth.js';
      script.setAttribute('data-appid', 'SZFITUEBZPKCUR0T26KQ');
      document.body.appendChild(script);
    }

    // Direct OTPless callback with immediate navigation
    window.otpless = function(response) {
      console.log("OTPless auth response received:", response);
      
      if (response && (response.token || response.email || response.phoneNumber)) {
        // OTPless authentication successful, navigate to home
        console.log("Auth data detected, navigating to home");
        // Allow a brief moment for auth state to update
        setTimeout(() => {
          window.location.href = '/';
        }, 300);
      }
    };

    return () => {
      // Clean up by removing our direct callback when component unmounts
      window.otpless = null;
    };
  }, []);

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

            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                {error}
              </div>
            )}

            {/* Primary Sign-up Method: OTPless */}
            <div className="my-6 text-center">
              <p className="text-gray-600 mb-4">Sign up quickly and securely:</p>
              
              {/* OTPless container */}
              <div id="otpless-login-page" className="flex justify-center"></div>
              
              {loading && (
                <div className="mt-4 flex justify-center">
                  <FaSpinner className="animate-spin text-teal-600 text-xl" />
                </div>
              )}
            </div>

            <div className="mt-6 text-center">
              <p className="text-gray-500 text-sm mb-2">By signing up, you agree to our</p>
              <div className="flex justify-center gap-4 text-sm">
                <a href="#" className="text-teal-600 hover:underline">Terms of Service</a>
                <span className="text-gray-400">•</span>
                <a href="#" className="text-teal-600 hover:underline">Privacy Policy</a>
              </div>
            </div>

            <p className="mt-6 text-center text-gray-600">
              Already have an account?{' '}
              <Link to="/sign-in" className="text-teal-600 hover:underline font-medium">
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

// const SignUp = () => {
//   const [formData, setFormData] = useState({
//     fullName: '',
//     email: '',
//     phone: '',
//     password: '',
//     confirmPassword: ''
//   });
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//   const [agreeTerms, setAgreeTerms] = useState(false);
//   const [passwordError, setPasswordError] = useState('');
//   const [confirmPasswordError, setConfirmPasswordError] = useState('');
  
// //   // Country selector state
//   const [selectedCountry, setSelectedCountry] = useState(countries[0]);
//   const [isDropdownOpen, setIsDropdownOpen] = useState(false);
//   const [searchTerm, setSearchTerm] = useState('');
//   const dropdownRef = useRef(null);

//   const filteredCountries = countries.filter(country =>
//     country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     country.code.includes(searchTerm)
//   );

//   // Close dropdown when clicking outside
//   useEffect(() => {
//     function handleClickOutside(event) {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//         setIsDropdownOpen(false);
//       }
//     }

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const validatePassword = (password) => {
//     // Check if password has at least 8 characters
//     const hasMinLength = password.length >= 8;
//     // Check if password has at least one uppercase letter
//     const hasUppercase = /[A-Z]/.test(password);
//     // Check if password has at least one digit
//     const hasDigit = /\d/.test(password);
//     // Check if password has at least one special character
//     const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

//     if (!hasMinLength) {
//       return 'Password must be at least 8 characters long';
//     } else if (!hasUppercase) {
//       return 'Password must contain at least one uppercase letter';
//     } else if (!hasDigit) {
//       return 'Password must contain at least one digit';
//     } else if (!hasSpecial) {
//       return 'Password must contain at least one special character';
//     }
//     return '';
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({
//       ...formData,
//       [name]: value
//     });

//     // Validate password as user types
//     if (name === 'password') {
//       setPasswordError(validatePassword(value));

//       // Also check if confirm password matches
//       if (formData.confirmPassword && value !== formData.confirmPassword) {
//         setConfirmPasswordError('Passwords do not match');
//       } else {
//         setConfirmPasswordError('');
//       }
//     }

//     // Validate confirm password as user types
//     if (name === 'confirmPassword') {
//       if (value !== formData.password) {
//         setConfirmPasswordError('Passwords do not match');
//       } else {
//         setConfirmPasswordError('');
//       }
//     }
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();

//     // Validate password before submission
//     const passwordValidationError = validatePassword(formData.password);

//     if (passwordValidationError) {
//       setPasswordError(passwordValidationError);
//       return;
//     }

//     if (formData.password !== formData.confirmPassword) {
//       setConfirmPasswordError('Passwords do not match');
//       return;
//     }
    
//     // Include the country code with the phone number
//     const formDataWithCountryCode = {
//       ...formData,
//       phone: `${selectedCountry.code}${formData.phone}`
//     };
    
//     // Form submission would connect to your existing backend
//     console.log('Sign up attempt with:', formDataWithCountryCode);
//   };

//   return (
//     <section className="py-16 bg-gray-50 min-h-screen flex items-center">
//       <div className="container mx-auto px-4">
//         <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
//           <div className="p-8">
//             <div className="text-center mb-8">
//               <p className="text-yellow-500 text-5xl font-['Comforter_Brush']">Join Us</p>
//               <h1 className="text-3xl font-medium font-['Abril_Fatface'] text-gray-800 mt-2">
//                 Create Account
//               </h1>
//               <p className="text-gray-500 mt-3">
//                 Start your journey with us and explore the world
//               </p>
//             </div>

//             <form onSubmit={handleSubmit}>
//               <div className="mb-5">
//                 <label htmlFor="fullName" className="block text-gray-700 font-medium mb-2">
//                   Full Name
//                 </label>
//                 <div className="relative">
//                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                     <FaUser className="text-gray-400" />
//                   </div>
//                   <input
//                     type="text"
//                     id="fullName"
//                     name="fullName"
//                     value={formData.fullName}
//                     onChange={handleChange}
//                     className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
//                     placeholder="John Doe"
//                     required
//                   />
//                 </div>
//               </div>

//               <div className="mb-5">
//                 <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
//                   Email Address
//                 </label>
//                 <div className="relative">
//                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                     <FaEnvelope className="text-gray-400" />
//                   </div>
//                   <input
//                     type="email"
//                     id="email"
//                     name="email"
//                     value={formData.email}
//                     onChange={handleChange}
//                     className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
//                     placeholder="your@email.com"
//                     required
//                   />
//                 </div>
//               </div>

//               <div className="mb-5">
//                 <label htmlFor="phone" className="block text-gray-700 font-medium mb-2">
//                   Phone Number
//                 </label>
//                 <div className="flex">
//                   {/* Country code dropdown */}
//                   <div className="relative" ref={dropdownRef}>
//                     <button
//                       type="button"
//                       className="flex items-center justify-between w-32 pl-3 pr-2 py-3 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent bg-white"
//                       onClick={() => setIsDropdownOpen(!isDropdownOpen)}
//                     >
//                       <span className="flex items-center">
//                         <span className="mr-2 text-lg">{selectedCountry.flag}</span>
//                         <span>{selectedCountry.code}</span>
//                       </span>
//                       {isDropdownOpen ? <FaChevronUp className="text-gray-400" /> : <FaChevronDown className="text-gray-400" />}
//                     </button>

//                     {isDropdownOpen && (
//                       <div className="absolute z-10 w-64 mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
//                         <div className="p-2 border-b border-gray-200">
//                           <div className="relative">
//                             <FaSearch className="absolute left-3 top-3 text-gray-400" />
//                             <input
//                               type="text"
//                               placeholder="Search countries..."
//                               className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
//                               value={searchTerm}
//                               onChange={(e) => setSearchTerm(e.target.value)}
//                             />
//                           </div>
//                         </div>
//                         <div className="max-h-60 overflow-y-auto">
//                           {filteredCountries.map((country, index) => (
//                             <button
//                               key={index}
//                               type="button"
//                               className="flex items-center w-full px-4 py-2 text-left hover:bg-gray-100"
//                               onClick={() => {
//                                 setSelectedCountry(country);
//                                 setIsDropdownOpen(false);
//                                 setSearchTerm('');
//                               }}
//                             >
//                               <span className="mr-3 text-lg">{country.flag}</span>
//                               <span className="flex-1">{country.name}</span>
//                               <span className="text-gray-500">{country.code}</span>
//                             </button>
//                           ))}
//                           {filteredCountries.length === 0 && (
//                             <div className="px-4 py-2 text-gray-500">No countries found</div>
//                           )}
//                         </div>
//                       </div>
//                     )}
//                   </div>

//                   {/* Phone number input */}
//                   <div className="relative flex-1">
//                     <input
//                       type="tel"
//                       id="phone"
//                       name="phone"
//                       value={formData.phone}
//                       onChange={handleChange}
//                       className="w-full px-4 py-3 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
//                       placeholder="Phone number"
//                     />
//                   </div>
//                 </div>
//               </div>

//               <div className="mb-5">
//                 <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
//                   Password
//                 </label>
//                 <div className="relative">
//                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                     <FaLock className="text-gray-400" />
//                   </div>
//                   <input
//                     type={showPassword ? "text" : "password"}
//                     id="password"
//                     name="password"
//                     value={formData.password}
//                     onChange={handleChange}
//                     className={`w-full pl-10 pr-10 py-3 border ${passwordError ? 'border-red-500' : 'border-gray-300'
//                       } rounded-md focus:outline-none focus:ring-2 ${passwordError ? 'focus:ring-red-500' : 'focus:ring-teal-600'
//                       } focus:border-transparent`}
//                     placeholder="••••••••"
//                     required
//                   />
//                   <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
//                     <button
//                       type="button"
//                       onClick={() => setShowPassword(!showPassword)}
//                       className="text-gray-400 hover:text-gray-600 focus:outline-none"
//                     >
//                       {showPassword ? <FaEyeSlash /> : <FaEye />}
//                     </button>
//                   </div>
//                 </div>
//                 {passwordError && (
//                   <p className="mt-1 text-sm text-red-600">{passwordError}</p>
//                 )}
//                 <p className="mt-1 text-sm text-gray-500">
//                   Password must be at least 8 characters long and contain at least one uppercase letter, one digit, and one special character.
//                 </p>
//               </div>

//               <div className="mb-6">
//                 <label htmlFor="confirmPassword" className="block text-gray-700 font-medium mb-2">
//                   Confirm Password
//                 </label>
//                 <div className="relative">
//                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                     <FaLock className="text-gray-400" />
//                   </div>
//                   <input
//                     type={showConfirmPassword ? "text" : "password"}
//                     id="confirmPassword"
//                     name="confirmPassword"
//                     value={formData.confirmPassword}
//                     onChange={handleChange}
//                     className={`w-full pl-10 pr-10 py-3 border ${confirmPasswordError ? 'border-red-500' : 'border-gray-300'
//                       } rounded-md focus:outline-none focus:ring-2 ${confirmPasswordError ? 'focus:ring-red-500' : 'focus:ring-teal-600'
//                       } focus:border-transparent`}
//                     placeholder="••••••••"
//                     required
//                   />
//                   <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
//                     <button
//                       type="button"
//                       onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//                       className="text-gray-400 hover:text-gray-600 focus:outline-none"
//                     >
//                       {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
//                     </button>
//                   </div>
//                 </div>
//                 {confirmPasswordError && (
//                   <p className="mt-1 text-sm text-red-600">{confirmPasswordError}</p>
//                 )}
//               </div>

//               <div className="mb-6">
//                 <label className="flex items-center">
//                   <input
//                     type="checkbox"
//                     checked={agreeTerms}
//                     onChange={(e) => setAgreeTerms(e.target.checked)}
//                     className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
//                     required
//                   />
//                   <span className="ml-2 text-sm text-gray-600">
//                     I agree to the{' '}
//                     <a href="#" className="text-teal-600 hover:underline">
//                       Terms of Service
//                     </a>{' '}
//                     and{' '}
//                     <a href="#" className="text-teal-600 hover:underline">
//                       Privacy Policy
//                     </a>
//                   </span>
//                 </label>
//               </div>

//               <button
//                 type="submit"
//                 className="w-full bg-teal-600 text-white py-3 px-4 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-colors duration-200"
//               >
//                 Create Account
//               </button>
//             </form>

//             <p className="mt-6 text-center text-gray-600">
//               Already have an account?{' '}
//               <Link to="/sign-in" className="text-teal-600 hover:underline">
//                 Sign in
//               </Link>
//               <br />
//               <Link to="/home" className="text-teal-600 hover:underline">
//                 Home
//               </Link>
//             </p>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default SignUp;



// import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Link } from 'react-router-dom';


// export default SignUp;
