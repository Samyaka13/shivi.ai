import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { itineraryService } from '../../services/itineraryService';
import { FaMapMarkerAlt, FaCalendarAlt, FaClock, FaDownload, FaArrowLeft } from 'react-icons/fa';
import LoadingIndicator from '../UI/LoadingIndicator';
import ErrorAlert from '../UI/ErrorAlert';
import ReactMarkdown from 'react-markdown';

const ItineraryView = () => {
  const [itineraryData, setItineraryData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();
  const { itineraryId } = useParams();

  useEffect(() => {
    const fetchItineraryData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Check if we have itinerary in localStorage (from form submission)
        const storedData = localStorage.getItem('itineraryData');
        let data;
        
        if (storedData) {
          data = JSON.parse(storedData);
          // If we have itineraryId from URL and it matches stored data, use it
          if (itineraryId && data.itinerary_id === itineraryId) {
            setItineraryData(data);
          } else if (itineraryId) {
            // If different itinerary is requested, fetch it
            const fetchedData = await itineraryService.getItineraryById(itineraryId);
            setItineraryData(fetchedData);
          } else {
            // Just use stored data
            setItineraryData(data);
          }
        } else if (itineraryId) {
          // No stored data but we have ID, fetch it
          const fetchedData = await itineraryService.getItineraryById(itineraryId);
          setItineraryData(fetchedData);
        } else {
          throw new Error('No itinerary data found. Please create an itinerary first.');
        }
      } catch (err) {
        console.error('Error loading itinerary data:', err);
        setError(err.message || 'Failed to load itinerary data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchItineraryData();
  }, [itineraryId]);

  const handleDownload = () => {
    if (!itineraryData) return;
    
    // Create a text representation of the itinerary
    let content = itineraryData.itinerary;
    
    // Create and download the file
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `itinerary-${itineraryId || 'new'}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md px-4">
          <LoadingIndicator 
            message="Loading your itinerary..." 
            subMessage="Please wait while we prepare your travel plan" 
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

  if (!itineraryData || !itineraryData.itinerary) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
        <div className="text-xl text-gray-700 mb-4">No itinerary data available</div>
        <button 
          className="bg-viridian-green text-white font-bold py-2 px-5 rounded-md flex items-center"
          onClick={() => navigate('/home')}
        >
          <FaArrowLeft className="mr-2" /> Return to Home
        </button>
      </div>
    );
  }

  // Make sure itineraryData fields are safely accessed
  const destination = typeof itineraryData.destination === 'string' ? itineraryData.destination : 'Destination';
  const origin = typeof itineraryData.origin === 'string' ? itineraryData.origin : 'Origin';
  const duration = typeof itineraryData.duration === 'number' ? itineraryData.duration : 
                  (typeof itineraryData.duration === 'string' ? itineraryData.duration : '');
  const itineraryContent = typeof itineraryData.itinerary === 'string' ? itineraryData.itinerary : '';

  return (
    <div className="min-h-screen bg-gray-50 pt-10 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Itinerary Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Travel Itinerary: {destination}
              </h1>
              <div className="flex flex-wrap items-center text-gray-600 mb-4">
                <div className="flex items-center mr-6 mb-2 md:mb-0">
                  <FaMapMarkerAlt className="text-viridian-green mr-2" />
                  <span>From {origin} to {destination}</span>
                </div>
                <div className="flex items-center">
                  <FaClock className="text-viridian-green mr-2" />
                  <span>{duration} Days</span>
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
        
        {/* Itinerary Content */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="prose max-w-none">
            <ReactMarkdown>{itineraryContent}</ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItineraryView;