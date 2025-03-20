import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { virtualTourService } from '../../services/virtualTourService';
import { FaMapMarkerAlt, FaCalendarAlt, FaArrowLeft, FaDownload, FaSpinner } from 'react-icons/fa';
import ItineraryDay from './ItineraryDay';
import LoadingIndicator from '../UI/LoadingIndicator';
import ErrorAlert from '../UI/ErrorAlert';

const VirtualTour = () => {
  const [tourData, setTourData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeDay, setActiveDay] = useState(0);
  
  const navigate = useNavigate();
  const { tourId } = useParams();  // In case we're fetching a specific tour

  useEffect(() => {
    const fetchTourData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        let data;
        
        // If we have a tourId parameter, fetch that specific tour
        if (tourId) {
          data = await virtualTourService.getTourById(tourId);
        } else {
          // Otherwise, try to get from localStorage
          const storedData = localStorage.getItem('tourData');
          if (storedData) {
            data = JSON.parse(storedData);
          } else {
            throw new Error('No tour data found. Please create a tour first.');
          }
        }
        
        setTourData(data);
      } catch (err) {
        console.error('Error loading tour data:', err);
        setError(err.message || 'Failed to load tour data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTourData();
  }, [tourId]);

  const handleDownload = () => {
    if (!tourData) return;
    
    // Create a text representation of the itinerary
    let content = `# Virtual Tour: ${tourData.origin} to ${tourData.destination}\n`;
    content += `Travel Dates: ${tourData.travel_dates}\n\n`;
    
    tourData.day_by_day_plan.forEach(day => {
      content += `## ${day.day}\n${day.plan}\n\n`;
    });
    
    // Create and download the file
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `virtual-tour-${tourData.destination.replace(/\s+/g, '-').toLowerCase()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingIndicator 
            message="Generating your virtual tour..." 
            subMessage="This may take up to 30 seconds" 
          />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
        <div className="max-w-md w-full">
          <ErrorAlert message={error} />
          <button 
            className="bg-viridian-green text-white font-bold py-2 px-5 rounded-md flex items-center"
            onClick={() => navigate('/home')}
          >
            <FaArrowLeft className="mr-2" /> Return to Home
          </button>
        </div>
      </div>
    );
  }

  if (!tourData || !tourData.day_by_day_plan || tourData.day_by_day_plan.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
        <div className="text-xl text-gray-700 mb-4">No tour data available</div>
        <button 
          className="bg-viridian-green text-white font-bold py-2 px-5 rounded-md flex items-center"
          onClick={() => navigate('/home')}
        >
          <FaArrowLeft className="mr-2" /> Return to Home
        </button>
      </div>
    );
  }

  const activeItinerary = tourData.day_by_day_plan[activeDay];

  return (
    <div className="min-h-screen bg-gray-50 pt-10 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Tour Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {tourData.origin} to {tourData.destination}
              </h1>
              <div className="flex flex-wrap items-center text-gray-600 mb-4">
                <div className="flex items-center mr-6 mb-2 md:mb-0">
                  <FaMapMarkerAlt className="text-viridian-green mr-2" />
                  <span>{tourData.destination} Virtual Tour</span>
                </div>
                <div className="flex items-center">
                  <FaCalendarAlt className="text-viridian-green mr-2" />
                  <span>{tourData.travel_dates}</span>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-4 mt-4 md:mt-0">
              <button 
                onClick={handleDownload}
                className="flex items-center bg-viridian-green text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors"
              >
                <FaDownload className="mr-2" /> Download Itinerary
              </button>
              <button 
                onClick={() => navigate('/home')}
                className="flex items-center bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
              >
                <FaArrowLeft className="mr-2" /> Back to Home
              </button>
            </div>
          </div>
        </div>
        
        {/* Day Selection Tabs */}
        <div className="mb-6 overflow-x-auto">
          <div className="flex space-x-2 pb-2 min-w-max">
            {tourData.day_by_day_plan.map((day, index) => (
              <button
                key={index}
                className={`px-4 py-2 rounded-md font-medium ${
                  index === activeDay 
                    ? 'bg-viridian-green text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => setActiveDay(index)}
              >
                {day.day}
              </button>
            ))}
          </div>
        </div>
        
        {/* Tour Content */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Days List (Mobile: Hidden, Desktop: Shown) */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="font-bold text-lg mb-4 text-gray-800">Itinerary</h3>
              <ul className="space-y-2">
                {tourData.day_by_day_plan.map((day, index) => (
                  <li key={index}>
                    <button
                      className={`w-full text-left p-2 rounded ${
                        index === activeDay 
                          ? 'bg-viridian-green text-white' 
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                      onClick={() => setActiveDay(index)}
                    >
                      {day.day}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* Active Day Content */}
          <div className="lg:col-span-4">
            <ItineraryDay 
              day={activeItinerary.day}
              plan={activeItinerary.plan}
              image={activeItinerary.image}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VirtualTour;