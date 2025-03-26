import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const SignUp = () => {
  const navigate = useNavigate();
  const otplessContainerRef = useRef(null);

  useEffect(() => {
    // The OTPless UI will be rendered in this container
    if (otplessContainerRef.current && window.otplessInit) {
      window.otplessInit();
    }
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
            {/* OTP container at the top of the form */}
            <div className="mb-8">
              <div id="otpless-login-page" ref={otplessContainerRef} className="flex justify-center"></div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link to="/sign-in" className="text-teal-600 hover:text-teal-800 font-medium">
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SignUp;