import React from 'react';
import { FaMapMarkerAlt, FaUtensils, FaCamera, FaBed, FaClock } from 'react-icons/fa';

// Function to determine icon and style based on paragraph content
const getParagraphStyle = (paragraph) => {
  if (/morning|breakfast|wake up|early/i.test(paragraph)) {
    return { icon: <FaClock className="text-yellow-500" />, className: 'border-yellow-400 bg-yellow-50/50' };
  }
  if (/lunch|dinner|restaurant|café|cafe|food|eat|cuisine|taste/i.test(paragraph)) {
    return { icon: <FaUtensils className="text-red-500" />, className: 'border-red-400 bg-red-50/50' };
  }
  if (/visit|explore|tour|museum|gallery|park|garden|castle|palace|site|landmark|attraction/i.test(paragraph)) {
    return { icon: <FaMapMarkerAlt className="text-blue-500" />, className: 'border-blue-400 bg-blue-50/50' };
  }
  if (/photo|picture|photography|camera|view|scenic|capture|instagram/i.test(paragraph)) {
    return { icon: <FaCamera className="text-green-500" />, className: 'border-green-400 bg-green-50/50' };
  }
  if (/hotel|accommodation|check-in|check-out|resort|stay|night|sleep|rest/i.test(paragraph)) {
    return { icon: <FaBed className="text-purple-500" />, className: 'border-purple-400 bg-purple-50/50' };
  }
  // Default style if no keyword matches
  return { icon: null, className: 'border-gray-200 bg-gray-50/50' };
};

const ItineraryDay = ({ day, plan, image }) => {

  // Split plan into paragraphs and apply styling
  const itineraryParts = plan
    .split('\n')
    .map(p => p.trim())
    .filter(p => p) // Remove empty lines
    .map((paragraph, index) => {
      const { icon, className } = getParagraphStyle(paragraph);
      return { id: index, text: paragraph, icon, className };
    });

  return (
    // Removed shadow/border here as parent container in VirtualTour will handle it
    <div className="bg-white rounded-lg overflow-hidden">
      {/* Image Section */}
      {image && (
        <div className="relative group overflow-hidden">
          <img
            src={image}
            alt={`Visual representation for ${day}`}
            className="w-full h-64 sm:h-80 lg:h-96 object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
          />
          {/* Enhanced Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
          {/* Day Title on Image */}
          <div className="absolute bottom-0 left-0 p-6 md:p-8 text-white">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">{day}</h2>
          </div>
        </div>
      )}

      {/* Itinerary Content Section */}
      <div className="p-6 md:p-8">
        <h3 className="text-2xl font-semibold text-gray-800 mb-6">Daily Plan</h3>

        {/* Itinerary Steps */}
        <div className="space-y-5">
          {itineraryParts.map((part) => (
            <div
              key={part.id}
              // Applied consistent base styling + dynamic border/bg
              className={`flex items-start p-4 rounded-lg border-l-4 transition-all duration-200 hover:shadow-sm ${part.className}`}
            >
              {/* Icon Wrapper */}
              {part.icon && (
                <div className="flex-shrink-0 w-8 h-8 mr-4 mt-1 flex items-center justify-center rounded-full bg-white shadow-sm border border-gray-200">
                  {part.icon}
                </div>
              )}
              {/* Text Content */}
              <p className={`text-gray-700 leading-relaxed ${!part.icon ? 'ml-0' : ''}`}> {/* Remove margin if no icon */}
                {part.text}
              </p>
            </div>
          ))}
           {/* Handle case where plan might be empty */}
           {itineraryParts.length === 0 && (
             <p className="text-gray-500 italic">No detailed plan provided for this day.</p>
           )}
        </div>
      </div>
    </div>
  );
};

export default ItineraryDay;