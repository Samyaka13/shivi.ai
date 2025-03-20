import React from 'react';
import { FaSpinner } from 'react-icons/fa';

const LoadingIndicator = ({ message, subMessage }) => {
  return (
    <div className="flex flex-col items-center justify-center p-6">
      <FaSpinner className="animate-spin text-viridian-green text-4xl mb-4" />
      {message && <p className="text-gray-700 text-lg mb-2">{message}</p>}
      {subMessage && <p className="text-gray-500 text-sm">{subMessage}</p>}
    </div>
  );
};

export default LoadingIndicator;