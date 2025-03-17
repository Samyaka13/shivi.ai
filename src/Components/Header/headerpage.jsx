import { useState } from "react";

const Header = () => {
  const [isNavActive, setIsNavActive] = useState(false);

  const toggleNav = () => {
    setIsNavActive(!isNavActive);
  };

  return (
    <header className="bg-viridian-green py-5 relative">
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
        <nav className={`absolute md:static top-full left-0 w-full md:w-auto bg-viridian-green md:bg-transparent z-10 shadow-lg md:shadow-none ${isNavActive ? "block" : "hidden md:block"}`}>
          <ul className="flex flex-col md:flex-row md:gap-8 items-center py-5 md:py-0">
            {["Home", "About Us", "Tours", "Destinations", "Blog", "Contact Us"].map((item, index) => (
              <li key={index} className="py-2 md:py-0">
                <a href="#" className="text-white text-lg font-medium py-2 px-4 block border-b-2 border-transparent hover:border-white">
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Booking Button */}
        <div className="hidden md:block">
          <a href="#" className="bg-white text-viridian-green font-bold py-2.5 px-6 rounded-md border-2 border-white hover:bg-transparent hover:text-white transition-colors">
            Booking Now
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;