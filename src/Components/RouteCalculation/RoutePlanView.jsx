import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { routeCalculationService } from '../../services/routeCalculationService';
import { FaMapMarkerAlt, FaCalendarAlt, FaArrowLeft, FaDownload } from 'react-icons/fa';
import LoadingIndicator from '../UI/LoadingIndicator';
import ErrorAlert from '../UI/ErrorAlert';
import ReactMarkdown from 'react-markdown';

const RoutePlanView = () => {
  const [routeData, setRouteData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();
  const { planId } = useParams();

  useEffect(() => {
    const fetchRouteData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Check if we have route plan in localStorage (from form submission)
        const storedData = localStorage.getItem('routePlanData');
        let data;
        
        if (storedData) {
          data = JSON.parse(storedData);
          // If we have planId from URL and it matches stored data, use it
          if (planId && (data.id === planId || data._id === planId)) {
            setRouteData(data);
          } else if (planId) {
            // If different plan is requested, fetch it
            const fetchedData = await routeCalculationService.getRoutePlan(planId);
            setRouteData(fetchedData);
          } else {
            // Just use stored data
            setRouteData(data);
          }
        } else if (planId) {
          // No stored data but we have ID, fetch it
          const fetchedData = await routeCalculationService.getRoutePlan(planId);
          setRouteData(fetchedData);
        } else {
          throw new Error('No route plan data found. Please create a route plan first.');
        }
        
        // Log out what we received to debug
        console.log('Route data loaded:', data || 'Fetched from API');
      } catch (err) {
        console.error('Error loading route plan data:', err);
        setError(err.message || 'Failed to load route plan data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRouteData();
  }, [planId]);

  const handleDownload = () => {
    if (!routeData) return;
    
    // Create a text representation of the route plan
    let content = typeof routeData.content === 'string' 
      ? routeData.content 
      : JSON.stringify(routeData.content, null, 2);
    
    // Create and download the file
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `route-plan-${planId || 'new'}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md px-4">
          <LoadingIndicator 
            message="Calculating your route..." 
            subMessage="Please wait while we analyze the best travel options" 
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

  if (!routeData || (!routeData.content && typeof routeData.content !== 'string')) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
        <div className="text-xl text-gray-700 mb-4">
          No route plan data available
          {routeData && <pre className="text-xs mt-4 text-gray-500 p-2 bg-gray-100 rounded overflow-auto max-w-md">
            {JSON.stringify(routeData, null, 2)}
          </pre>}
        </div>
        <button 
          className="bg-viridian-green text-white font-bold py-2 px-5 rounded-md flex items-center"
          onClick={() => navigate('/home')}
        >
          <FaArrowLeft className="mr-2" /> Return to Home
        </button>
      </div>
    );
  }

  // Handle different response formats - make sure we can access origin and destination
  const origin = routeData.origin || 'Origin';
  const destination = routeData.destination || 'Destination';
  const content = typeof routeData.content === 'string' 
    ? routeData.content 
    : (routeData.content && typeof routeData.content === 'object')
      ? JSON.stringify(routeData.content, null, 2)
      : 'Content not available';

  return (
    <div className="min-h-screen bg-gray-50 pt-10 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Route Plan Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {origin} to {destination}
              </h1>
              <div className="flex flex-wrap items-center text-gray-600 mb-4">
                <div className="flex items-center mr-6 mb-2 md:mb-0">
                  <FaMapMarkerAlt className="text-viridian-green mr-2" />
                  <span>Route Options</span>
                </div>
                <div className="flex items-center">
                  <FaCalendarAlt className="text-viridian-green mr-2" />
                  <span>Created on {new Date(routeData.created_at || Date.now()).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-4 mt-4 md:mt-0">
              <button 
                onClick={handleDownload}
                className="flex items-center bg-viridian-green text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors"
              >
                <FaDownload className="mr-2" /> Download Route Plan
              </button>
              <button 
                onClick={() => navigate('/route-plans')}
                className="flex items-center bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
              >
                <FaArrowLeft className="mr-2" /> Back to My Routes
              </button>
            </div>
          </div>
        </div>
        
        {/* Route Plan Content */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="prose max-w-none">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoutePlanView;