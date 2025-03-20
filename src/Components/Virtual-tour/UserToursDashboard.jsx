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
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Your Virtual Tours</h2>
        <button
          onClick={() => navigate('/home')}
          className="bg-viridian-green text-white flex items-center px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors"
        >
          <FaPlusCircle className="mr-2" />
          Create New Tour
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
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <h3 className="text-xl font-medium text-gray-700 mb-4">No tours found</h3>
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
  );
};

export default UserToursDashboard;