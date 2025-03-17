import React, { useState, useEffect } from 'react';
import { IoChevronUpOutline } from 'react-icons/io5';

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  
  const toggleVisibility = () => {
    if (window.scrollY > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Set up scroll event listener
  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    
    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-4 right-4 bg-viridian-green text-white p-3 rounded-md shadow-md transition-all duration-300 
        ${isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-4 pointer-events-none'}`}
      aria-label="Go To Top"
    >
      <IoChevronUpOutline size={20} />
    </button>
  );
};

export default ScrollToTop;