import React from 'react';
// Import Link from react-router-dom
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';

const Footer = () => {
  return (
    // Add an ID if you want to scroll here later
    <footer id="footer-contact" className="bg-gray-900 text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        {/* Footer Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* About Column */}
          <div>
            <h3 className="text-xl font-bold mb-4">About Us</h3>
            <p className="text-gray-300 mb-4">
              We are dedicated to providing unforgettable travel experiences to
              destinations around the world. Our team of experts is committed to
              making your journey smooth and memorable.
            </p>
            {/* Social links remain external <a> tags */}
            <div className="flex space-x-4">
              <a href="#" target="_blank" rel="noopener noreferrer" className="text-white hover:text-blue-400 transition-colors">
                <FaFacebook size={20} />
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="text-white hover:text-blue-400 transition-colors">
                <FaTwitter size={20} />
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="text-white hover:text-blue-400 transition-colors">
                <FaInstagram size={20} />
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="text-white hover:text-blue-400 transition-colors">
                <FaYoutube size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links Column */}
          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {/* Use Link for internal navigation */}
              <li><Link to="/" className="text-gray-300 hover:text-white transition-colors">Home</Link></li>
              {/* Link sections back to home page for now */}
              <li><Link to="/" className="text-gray-300 hover:text-white transition-colors">Destinations</Link></li>
              <li><Link to="/" className="text-gray-300 hover:text-white transition-colors">Tours</Link></li>
              <li><Link to="/" className="text-gray-300 hover:text-white transition-colors">About</Link></li>
              <li><Link to="/" className="text-gray-300 hover:text-white transition-colors">Blog</Link></li>
              <li><Link to="/" className="text-gray-300 hover:text-white transition-colors">Contact</Link></li>
              {/* Consider linking Contact to /#footer-contact if using HashLink later */}
            </ul>
          </div>

          {/* Popular Destinations Column */}
          <div>
            <h3 className="text-xl font-bold mb-4">Popular Destinations</h3>
            <ul className="space-y-2">
              {/* Link these to the main page for now, or a dedicated /destinations route if you create one */}
              <li><Link to="/" className="text-gray-300 hover:text-white transition-colors">Bali, Indonesia</Link></li>
              <li><Link to="/" className="text-gray-300 hover:text-white transition-colors">Santorini, Greece</Link></li>
              <li><Link to="/" className="text-gray-300 hover:text-white transition-colors">Paris, France</Link></li>
              <li><Link to="/" className="text-gray-300 hover:text-white transition-colors">Tokyo, Japan</Link></li>
              <li><Link to="/" className="text-gray-300 hover:text-white transition-colors">New York, USA</Link></li>
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h3 className="text-xl font-bold mb-4">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <FaMapMarkerAlt className="mt-1 mr-3 text-blue-400 flex-shrink-0" /> {/* Added flex-shrink-0 */}
                <span className="text-gray-300">123 Travel Street, Tourism City, TC 12345</span>
              </li>
              <li className="flex items-center">
                <FaPhoneAlt className="mr-3 text-blue-400" />
                {/* Make phone number clickable */}
                <a href="tel:+11234567890" className="text-gray-300 hover:text-white transition-colors">+1 (123) 456-7890</a>
              </li>
              <li className="flex items-center">
                <FaEnvelope className="mr-3 text-blue-400" />
                 {/* Make email clickable */}
                <a href="mailto:info@travelwebsite.com" className="text-gray-300 hover:text-white transition-colors">info@travelwebsite.com</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter Section (form remains standard HTML form) */}
        <div className="border-t border-gray-700 pt-8 pb-12">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-xl font-bold mb-2">Subscribe to Our Newsletter</h3>
            <p className="text-gray-300 mb-4">Get the latest travel deals and updates directly to your inbox</p>
            <form className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                placeholder="Your email address"
                required // Add basic validation
                className="px-4 py-2 rounded-md flex-1 bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-blue-400"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="border-t border-gray-700 pt-8 text-center">
          <p className="text-gray-400">
            © {new Date().getFullYear()} SHIVI Travels. All rights reserved. {/* Updated Name */}
          </p>
          <div className="mt-4 flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-6">
             {/* Link to the new policy pages */}
            <Link to="/privacy-policy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms-of-service" className="text-gray-400 hover:text-white transition-colors">Terms of Service</Link>
            <Link to="/cookie-policy" className="text-gray-400 hover:text-white transition-colors">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;