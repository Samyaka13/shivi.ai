
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../../services/api';
import { FaSpinner } from 'react-icons/fa';

const GoogleCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleClose = () => {
    if (window.opener) {
      window.close();
    } else {
      navigate('/sign-in');
    }
  };

  const [status, setStatus] = useState('Processing your login...');
  const [error, setError] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const urlParams = new URLSearchParams(location.search);
        const code = urlParams.get('code');

        if (!code) {
          setStatus('Error: No authorization code received');
          setError('No authorization code received');
          sendMessageToParent({ type: 'GOOGLE_AUTH_ERROR', error: 'No authorization code received' });
          navigate('/sign-up');
          return;
        }

        // Exchange the code for tokens
        const tokens = await authService.handleGoogleCallback(code);

        if (!tokens) {
          setStatus('Error: No tokens received');
          setError('Authentication failed - No tokens received');
          navigate('/sign-up');
          return;
        }

        // Notify the opener window of successful authentication
        sendMessageToParent({ type: 'GOOGLE_AUTH_SUCCESS', tokens });

        setStatus('Authentication successful! Redirecting...');

        // Close this window after a short delay
        setTimeout(() => {
          if (window.opener) {
            window.close();
          } else {
            navigate('/home');
          }
        }, 150000);

      } catch (error) {
        console.error('Google callback error:', error);
        setStatus('Authentication failed');
        setError(error.response?.data?.detail || 'Authentication failed. Please try again.');
        sendMessageToParent({
          type: 'GOOGLE_AUTH_ERROR',
          error: error.response?.data?.detail || 'Authentication failed'
        });
        navigate('/sign-up');
      } 
    };

    const sendMessageToParent = (message) => {
      if (window.opener && !window.opener.closed) {
        window.opener.postMessage(message, window.location.origin);
      }
    };

    handleCallback();
  }, [location, navigate]);

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
      <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Google Authentication</h2>

        {!error ? (
          <>
            <div className="flex justify-center mb-4">
              <FaSpinner className="animate-spin text-teal-600 text-3xl" />
            </div>
            <p className="text-gray-600">{status}</p>
          </>
        ) : (
          <>
            <div className="text-red-500 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-800 font-medium mb-2">{status}</p>
            <p className="text-red-600">{error}</p>
            <button
              onClick={handleClose}
              className="mt-4 px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 transition-colors"
            >
              Close Window
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default GoogleCallback;