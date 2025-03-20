import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import LogoutButton from "../Auth/LogoutButton";
import Chatbot from "../Chatbot/ChatbotComponent";
import { FaUser, FaComments } from "react-icons/fa";

const Header = () => {
  const [isNavActive, setIsNavActive] = useState(false);
  const { isAuthenticated, currentUser } = useAuth();

  const toggleNav = () => {
    setIsNavActive(!isNavActive);
  };

  return (
    <header className="bg-viridian-green py-5 relative">
      <div className="container mx-auto px-6 flex justify-between items-center">
        {/* Logo */}
        <Link to={isAuthenticated ? "/home" : "/"} className="text-white text-3xl font-semibold">
          SHIVI
        </Link>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded focus:outline-none"
          onClick={toggleNav}
          aria-label="Toggle Menu"
        >
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
        <nav className={`absolute md:static top-full left-0 w-full md:w-auto bg-viridian-green md:bg-transparent z-10 shadow-lg md:shadow-none ${isNavActive ? "block" : "hidden md:block"}`}>
          <ul className="flex flex-col md:flex-row md:gap-8 items-center py-5 md:py-0">
            {isAuthenticated && (
              <>
                <li className="py-2 md:py-0">
                  <Link to="/home" className="text-white text-lg font-medium py-2 px-4 block border-b-2 border-transparent hover:border-white">
                    Home
                  </Link>
                </li>
                <li className="py-2 md:py-0">
                  <Link to="/home#tours" className="text-white text-lg font-medium py-2 px-4 block border-b-2 border-transparent hover:border-white">
                    Tours
                  </Link>
                </li>
                <li className="py-2 md:py-0">
                  <Link to="/home#destinations" className="text-white text-lg font-medium py-2 px-4 block border-b-2 border-transparent hover:border-white">
                    Destinations
                  </Link>
                </li>
                <li className="py-2 md:py-0">
                  <Link to="/home#blog" className="text-white text-lg font-medium py-2 px-4 block border-b-2 border-transparent hover:border-white">
                    Blog
                  </Link>
                </li>
                <li className="py-2 md:py-0">
                  <Link to="/virtual-tour" className="text-white text-lg font-medium py-2 px-4 block border-b-2 border-transparent hover:border-white">
                    Virtual Tour
                  </Link>
                </li>
                <li className="py-2 md:py-0">
                  <Link to="/trip_planning/user/itineraries" className="text-white text-lg font-medium py-2 px-4 block border-b-2 border-transparent hover:border-white">
                    My Itineraries
                  </Link>
                </li>
                <li className="py-2 md:py-0">
                  <button className="text-white text-lg font-medium py-2 px-4 block border-b-2 border-transparent hover:border-white flex items-center">
                    <FaComments className="mr-2" /> ChatBot
                  </button>
                </li>

                {/* User info and logout button (mobile) */}
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
              </>
            )}
          </ul>
        </nav>

        {/* Right side actions */}
        <div className="hidden md:flex items-center gap-6">
          {isAuthenticated ? (
            <>
              {/* User info (desktop) */}
              {currentUser && (
                <div className="flex items-center text-white">
                  <FaUser className="mr-2" />
                  <span className="hidden lg:inline">{currentUser.full_name || currentUser.username}</span>
                </div>
              )}
              <LogoutButton />
            </>
          ) : (
            <Link to="/" className="bg-white text-viridian-green font-bold py-2.5 px-6 rounded-md border-2 border-white hover:bg-transparent hover:text-white transition-colors">
              Sign In
            </Link>
          )}
        </div>
      </div>
      
      {/* Chatbot Component */}
      <Chatbot />
    </header>
  );
};

export default Header;