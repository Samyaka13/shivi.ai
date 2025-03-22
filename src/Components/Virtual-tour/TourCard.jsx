import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaCalendarAlt, FaClock } from 'react-icons/fa';

const TourCard = ({ tour }) => {
  const navigate = useNavigate();
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  // Take the first image from day_by_day_plan if available
  const firstImage = tour.day_by_day_plan && 
                    tour.day_by_day_plan[0] && 
                    tour.day_by_day_plan[0].image;
  
  // Count the number of days in the itinerary
  const daysCount = tour.day_by_day_plan ? tour.day_by_day_plan.length : 0;
  
  // Navigate to tour detail view
  const handleClick = () => {
    navigate(`/virtual-tour/${tour.tour_id}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg cursor-pointer" onClick={handleClick}>
      <div className="relative h-48">
        {firstImage ? (
          <img 
            src={firstImage} 
            alt={`${tour.destination} Tour`} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <FaMapMarkerAlt className="text-gray-400 text-4xl" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-4 text-white">
          <h3 className="text-xl font-bold">{tour.destination}</h3>
          <p className="text-sm opacity-90">{`From ${tour.origin}`}</p>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex items-center text-sm text-gray-600 mb-2">
          <FaCalendarAlt className="mr-2 text-viridian-green" />
          <span>{tour.travel_dates}</span>
        </div>
        
        <div className="flex items-center text-sm text-gray-600 mb-4">
          <FaClock className="mr-2 text-viridian-green" />
          <span>{daysCount} {daysCount === 1 ? 'Day' : 'Days'} Itinerary</span>
        </div>
        
        {tour.created_at && (
          <div className="text-xs text-gray-500 mb-4">
            Created on {formatDate(tour.created_at)}
          </div>
        )}
      </div>
    </div>
  );
};

export default TourCard;