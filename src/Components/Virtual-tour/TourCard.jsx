import React from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Import Link
import { FaMapMarkerAlt, FaCalendarAlt, FaClock, FaRegCalendarCheck } from 'react-icons/fa'; // Added calendar check

const TourCard = ({ tour }) => {
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
      });
    } catch {
      return dateString; // Fallback
    }
  };

  const firstImage = tour?.day_by_day_plan?.[0]?.image;
  const daysCount = tour?.day_by_day_plan?.length ?? 0;
  const destinationName = tour?.destination ?? 'Unknown Destination';
  const originName = tour?.origin ?? 'Unknown Origin';

  // Use Link for navigation to prevent full page reload if desired,
  // though onClick handler works fine too.
  const tourPath = `/virtual-tour/${tour.tour_id}`;

  return (
    <Link to={tourPath} className="block group"> {/* Wrap card in Link */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 ease-in-out border border-gray-100 group-hover:shadow-xl group-hover:-translate-y-1">
        {/* Image Section */}
        <div className="relative h-48 sm:h-52 overflow-hidden">
          {firstImage ? (
            <img
              src={firstImage}
              alt={`Visual for ${destinationName} Tour`}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <FaMapMarkerAlt className="text-gray-400 text-5xl opacity-70" />
            </div>
          )}
          {/* Darker Overlay for better text contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
          {/* Text on Image */}
          <div className="absolute bottom-0 left-0 p-4 text-white">
            <h3 className="text-lg font-bold leading-tight mb-1 line-clamp-2">{destinationName}</h3>
            <p className="text-xs opacity-80 font-medium">{`From ${originName}`}</p>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-5">
          {/* Travel Dates */}
          <div className="flex items-center text-sm text-gray-600 mb-3">
            <FaCalendarAlt className="mr-2.5 text-viridian-green flex-shrink-0" />
            <span className="truncate">{tour.travel_dates || 'Dates not specified'}</span>
          </div>

          {/* Duration */}
          <div className="flex items-center text-sm text-gray-600 mb-4">
            <FaClock className="mr-2.5 text-viridian-green flex-shrink-0" />
            <span>{daysCount} {daysCount === 1 ? 'Day' : 'Days'} Itinerary</span>
          </div>

          {/* Creation Date (Optional) */}
          {tour.created_at && (
            <div className="border-t border-gray-100 pt-3 mt-3 flex items-center text-xs text-gray-500">
               <FaRegCalendarCheck className="mr-2 text-gray-400 flex-shrink-0"/>
               <span>Created: {formatDate(tour.created_at)}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default TourCard;