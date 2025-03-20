import React from 'react';
import { useRouteError, Link } from 'react-router-dom';
import { FaExclamationTriangle, FaHome, FaArrowLeft } from 'react-icons/fa';

const ErrorBoundary = () => {
  const error = useRouteError();
  
  // Format the error message
  const getErrorMessage = (error) => {
    if (typeof error === 'string') return error;
    if (error instanceof Error) return error.message;
    if (error && typeof error === 'object' && 'message' in error) return String(error.message);
    return 'An unexpected error occurred';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-red-600 p-4 flex justify-center">
          <FaExclamationTriangle size={50} className="text-white" />
        </div>
        
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Something went wrong</h1>
          
          <div className="bg-red-50 border-l-4 border-red-600 p-4 mb-6">
            <p className="text-red-800 font-medium">Error: {getErrorMessage(error)}</p>
          </div>
          
          <p className="text-gray-600 mb-6">
            We apologize for the inconvenience. You can try refreshing the page or navigate back.
          </p>
          
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={() => window.location.reload()}
              className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              <FaArrowLeft className="mr-2" /> Refresh Page
            </button>
            
            <Link
              to="/home"
              className="flex items-center bg-viridian-green text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors"
            >
              <FaHome className="mr-2" /> Go to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorBoundary;