import { useState } from "react";

const Header = () => {
  const [isNavActive, setIsNavActive] = useState(false);

  const toggleNav = () => {
    setIsNavActive(!isNavActive);
  };

  return (
    <header className="bg-teal-600 py-5">
      <div className="container mx-auto px-6 flex justify-between items-center">
        {/* Logo */}
        <a href="#" className="text-white text-3xl font-semibold">Tourest</a>

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
        <nav className={`absolute md:static top-[70px] left-0 w-full md:w-auto bg-teal-600 md:bg-transparent transition-all duration-300 ease-in-out overflow-hidden md:overflow-visible ${isNavActive ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0 md:max-h-full md:opacity-100"}`}>
          <ul className="flex flex-col md:flex-row md:gap-8 items-center space-y-5 md:space-y-0 py-5 md:py-0">
            {["Home", "About Us", "Tours", "Destinations", "Blog", "Contact Us"].map((item, index) => (
              <li key={index}>
                <a href="#" className="text-white text-lg font-medium py-2 px-4 border-b-2 border-transparent hover:border-white">
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Booking Button */}
        <div className="hidden md:block">
          <a href="#" className="bg-white text-teal-600 font-bold py-2.5 px-6 rounded-md border-2 border-white hover:bg-transparent hover:text-white transition-colors">
            Booking Now
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;
