import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { virtualTourService } from '../../services/virtualTourService';
import TourCard from './TourCard';
import LoadingIndicator from '../UI/LoadingIndicator';
import ErrorAlert from '../UI/ErrorAlert';
import { FaPlusCircle } from 'react-icons/fa';

const UserToursDashboard = () => {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserTours = async () => {
      try {
        setLoading(true);
        const userTours = await virtualTourService.getUserTours();
        setTours(userTours);
        setError(null);
      } catch (err) {
        console.error('Error fetching user tours:', err);
        setError('Failed to load your tours. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserTours();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <LoadingIndicator message="Loading your tours..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Virtual Tours</h1>
          <button
            onClick={() => navigate('/home')}
            className="flex items-center bg-viridian-green text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors"
          >
            <FaPlusCircle className="mr-2" /> Create New Tour
          </button>
        </div>

        {error && (
          <div className="mb-6">
            <ErrorAlert 
              message={error} 
              onRetry={() => window.location.reload()}
            />
          </div>
        )}

        {!loading && tours.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">No tours found</h2>
            <p className="text-gray-600 mb-6">
              You haven't created any virtual tours yet. Start by creating your first tour!
            </p>
            <button
              onClick={() => navigate('/home')}
              className="bg-viridian-green text-white flex items-center px-4 py-2 rounded-md mx-auto hover:bg-opacity-90 transition-colors"
            >
              <FaPlusCircle className="mr-2" />
              Create Your First Tour
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {tours.map((tour) => (
              <TourCard key={tour.tour_id} tour={tour} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserToursDashboard;