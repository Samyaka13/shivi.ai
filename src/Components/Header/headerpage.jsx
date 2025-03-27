import React, { useState /* Remove useRef */ } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import LogoutButton from "../Auth/LogoutButton";

import { FaUser, FaComments, FaSignInAlt, FaRoute } from "react-icons/fa";

const Header = () => {
  const [isNavActive, setIsNavActive] = useState(false);
  // Remove chatbot state: const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const { isAuthenticated, currentUser } = useAuth();
  // Remove chatbot ref: const chatbotRef = useRef();
  const navigate = useNavigate();

  const toggleNav = () => {
    setIsNavActive(!isNavActive);
  };

  // Renamed function for clarity
  const navigateToChat = () => {
    if (!isAuthenticated) {
      // Redirect to sign in if not authenticated
      navigate('/sign-in');
    } else {
      // Navigate to the dedicated chat page
      navigate('/chat');
      // Close the mobile nav if it's open after clicking
      if (isNavActive) {
        setIsNavActive(false);
      }
    }
  };

  // Function to handle clicks on protected features (Keep as is)
  const handleProtectedFeature = (path) => {
    if (!isAuthenticated) {
      navigate('/sign-in');
    } else {
      navigate(path);
      // Close the mobile nav if it's open after clicking
      if (isNavActive) {
        setIsNavActive(false);
      }
    }
  };

  return (
    <header className="bg-viridian-green py-5 relative z-30"> {/* Added z-index */}
      <div className="container mx-auto px-6 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-white text-3xl font-semibold">
          SHIVI
        </Link>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded focus:outline-none"
          onClick={toggleNav}
          aria-label="Toggle Menu"
        >
          {/* ... SVG icons ... */}
          {isNavActive ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-9 w-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-9 w-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>

        {/* Navigation Menu */}
        <nav className={`absolute md:static top-full left-0 w-full md:w-auto bg-viridian-green md:bg-transparent z-20 shadow-lg md:shadow-none ${isNavActive ? "block" : "hidden md:block"}`}> {/* Adjusted z-index */}
          <ul className="flex flex-col md:flex-row md:gap-8 items-center py-5 md:py-0">
            {/* Navigation Links */}
            <li className="py-2 md:py-0">
              <button
                onClick={() => handleProtectedFeature('/virtual-tour')} // Assuming this leads to a list or latest tour
                className="text-white text-lg font-medium py-2 px-4 block border-b-2 border-transparent hover:border-white w-full text-left"
              >
                Virtual Tour
              </button>
            </li>
            {/* Optional: Link to My Tours Dashboard */}
            {/* <li className="py-2 md:py-0">
              <button
                onClick={() => handleProtectedFeature('/my-tours')} // Example route
                className="text-white text-lg font-medium py-2 px-4 block border-b-2 border-transparent hover:border-white w-full text-left"
              >
                My Tours
              </button>
            </li> */}

            {/* --- Updated ChatBot Button --- */}
            <li className="py-2 md:py-0">
              <button
                onClick={navigateToChat} // Use the updated handler
                className="text-white text-lg font-medium py-2 px-4 block border-b-2 border-transparent hover:border-white flex items-center"
              >
                <FaComments className="mr-2" /> ChatBot
              </button>
            </li>

            {/* User info and logout/login (Mobile) */}
            {/* ... keep the existing mobile auth block ... */}
            {isAuthenticated ? (
              <li className="py-2 md:hidden">
                <div className="flex flex-col items-center mt-4 border-t border-white/30 pt-4 px-4">
                  {currentUser && (
                    <div className="flex items-center mb-2 text-white">
                      <FaUser className="mr-2" />
                      <span>{currentUser.full_name || currentUser.username}</span>
                    </div>
                  )}
                  <LogoutButton />
                </div>
              </li>
            ) : (
              <li className="py-2 md:hidden">
                <div className="flex flex-col items-center mt-4 border-t border-white/30 pt-4 px-4">
                  <Link to="/sign-in" className="flex items-center text-white mb-2">
                    <FaSignInAlt className="mr-2" />
                    <span>Sign In</span>
                  </Link>
                </div>
              </li>
            )}
          </ul>
        </nav>

        {/* Right side actions (Desktop Auth) */}
        {/* ... keep the existing desktop auth block ... */}
        <div className="hidden md:flex items-center gap-6">
          {isAuthenticated ? (
            <>
              {currentUser && (
                <div className="flex items-center text-white">
                  <FaUser className="mr-2" />
                  <span className="hidden lg:inline">{currentUser.full_name || currentUser.username}</span>
                </div>
              )}
              <LogoutButton />
            </>
          ) : (
            <Link to="/sign-in" className="bg-white text-viridian-green font-bold py-2.5 px-6 rounded-md border-2 border-white hover:bg-transparent hover:text-white transition-colors">
              Sign In
            </Link>
          )}
        </div>
      </div>

      {/* Remove the old Chatbot instance */}
      {/* {isAuthenticated && (
        // <Chatbot ref={chatbotRef} isOpen={isChatbotOpen} setIsOpen={setIsChatbotOpen} />
      )} */}
    </header>
  );
};

export default Header;