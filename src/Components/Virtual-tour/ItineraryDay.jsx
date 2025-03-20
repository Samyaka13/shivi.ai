import React from 'react';
import { FaMapMarkerAlt, FaUtensils, FaCamera, FaBed, FaClock } from 'react-icons/fa';

const ItineraryDay = ({ day, plan, image }) => {
  // Helper function to extract and highlight key parts of the itinerary
  const processItinerary = (text) => {
    // This could be more sophisticated with better parsing of the itinerary
    const parts = [];
    
    // Split by newlines first
    const paragraphs = text.split('\n').filter(p => p.trim());
    
    paragraphs.forEach((paragraph, index) => {
      // Try to identify different sections based on common patterns
      let icon = null;
      let className = '';
      
      if (/morning|breakfast|wake up/i.test(paragraph)) {
        icon = <FaClock className="text-yellow-500" />;
        className = 'border-l-4 border-yellow-500 pl-3';
      } else if (/lunch|dinner|restaurant|café|cafe|food|eat/i.test(paragraph)) {
        icon = <FaUtensils className="text-red-500" />;
        className = 'border-l-4 border-red-500 pl-3';
      } else if (/visit|explore|tour|museum|gallery|park|garden|castle|palace/i.test(paragraph)) {
        icon = <FaMapMarkerAlt className="text-blue-500" />;
        className = 'border-l-4 border-blue-500 pl-3';
      } else if (/photo|picture|photography|camera|view|scenic/i.test(paragraph)) {
        icon = <FaCamera className="text-green-500" />;
        className = 'border-l-4 border-green-500 pl-3';
      } else if (/hotel|accommodation|check-in|check-out|resort|stay|night|sleep/i.test(paragraph)) {
        icon = <FaBed className="text-purple-500" />;
        className = 'border-l-4 border-purple-500 pl-3';
      }
      
      parts.push({ text: paragraph, icon, className });
    });
    
    // If we couldn't split it into meaningful parts, just return the whole text
    if (parts.length === 0) {
      return [{ text, icon: null, className: '' }];
    }
    
    return parts;
  };
  
  const itineraryParts = processItinerary(plan);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Image */}
      {image && (
        <div className="relative">
          <img
            src={image}
            alt={`Day ${day} of itinerary`}
            className="w-full h-64 sm:h-80 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-4 text-white">
            <h2 className="text-2xl font-bold">{day}</h2>
          </div>
        </div>
      )}
      
      {/* Itinerary Content */}
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Daily Itinerary</h3>
        
        <div className="space-y-4">
          {itineraryParts.map((part, index) => (
            <div 
              key={index} 
              className={`p-3 rounded-md bg-gray-50 ${part.className}`}
            >
              {part.icon && (
                <div className="flex items-start">
                  <span className="mt-1 mr-3">{part.icon}</span>
                  <p className="text-gray-700">{part.text}</p>
                </div>
              )}
              {!part.icon && (
                <p className="text-gray-700">{part.text}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ItineraryDay;