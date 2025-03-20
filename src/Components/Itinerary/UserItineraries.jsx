import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { itineraryService } from '../../services/itineraryService';
import { FaPlus, FaMapMarkerAlt, FaCalendarAlt, FaTrash, FaEye } from 'react-icons/fa';
import LoadingIndicator from '../UI/LoadingIndicator';
import ErrorAlert from '../UI/ErrorAlert';

const UserItineraries = () => {
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItineraries, setTotalItineraries] = useState(0);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const itemsPerPage = 10;
  const navigate = useNavigate();

  // Fetch itineraries on mount and when page changes
  useEffect(() => {
    const fetchItineraries = async () => {
      try {
        setLoading(true);
        const skip = (currentPage - 1) * itemsPerPage;
        const response = await itineraryService.getUserItineraries(itemsPerPage, skip);
        
        if (response.success) {
          setItineraries(response.itineraries || []);
          setTotalItineraries(response.total || 0);
        } else {
          setError(response.error || 'Failed to load itineraries');
        }
      } catch (err) {
        console.error('Error fetching itineraries:', err);
        setError('Failed to load your itineraries. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchItineraries();
  }, [currentPage]);

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

  // Handle itinerary deletion
  const handleDelete = async (itineraryId) => {
    if (!window.confirm('Are you sure you want to delete this itinerary?')) {
      return;
    }
    
    try {
      setDeleteLoading(itineraryId);
      const response = await itineraryService.deleteItinerary(itineraryId);
      
      if (response.success) {
        setItineraries(itineraries.filter(item => item.id !== itineraryId));
        setTotalItineraries(prev => prev - 1);
      } else {
        setError(response.error || 'Failed to delete itinerary');
      }
    } catch (err) {
      console.error('Error deleting itinerary:', err);
      setError('Failed to delete itinerary. Please try again.');
    } finally {
      setDeleteLoading(null);
    }
  };

  // Calculate total pages
  const totalPages = Math.ceil(totalItineraries / itemsPerPage);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingIndicator message="Loading your itineraries..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Itineraries</h1>
          <button
            onClick={() => navigate('/home')}
            className="flex items-center bg-viridian-green text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors"
          >
            <FaPlus className="mr-2" /> Create New Itinerary
          </button>
        </div>

        {error && (
          <div className="mb-8">
            <ErrorAlert 
              message={error} 
              onRetry={() => {
                setError(null);
                setCurrentPage(1);
              }} 
            />
          </div>
        )}

        {itineraries.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">No itineraries found</h2>
            <p className="text-gray-600 mb-6">
              You haven't created any travel itineraries yet. Start planning your next adventure now!
            </p>
            <button
              onClick={() => navigate('/home')}
              className="inline-flex items-center bg-viridian-green text-white px-6 py-3 rounded-md hover:bg-opacity-90 transition-colors"
            >
              <FaPlus className="mr-2" /> Create Your First Itinerary
            </button>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Destination
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Origin
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created On
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {itineraries.map((itinerary) => (
                      <tr key={itinerary.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <FaMapMarkerAlt className="text-viridian-green mr-2" />
                            <div className="text-sm font-medium text-gray-900">{itinerary.destination}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{itinerary.origin}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-500">
                            <FaCalendarAlt className="mr-2 text-gray-400" />
                            {formatDate(itinerary.created_at)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => navigate(`/trip_planning/itinerary/${itinerary.id}`)}
                              className="text-viridian-green hover:text-teal-800"
                              title="View Itinerary"
                            >
                              <FaEye />
                            </button>
                            <button
                              onClick={() => handleDelete(itinerary.id)}
                              className="text-red-500 hover:text-red-700"
                              disabled={deleteLoading === itinerary.id}
                              title="Delete Itinerary"
                            >
                              {deleteLoading === itinerary.id ? (
                                <span className="inline-block h-4 w-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></span>
                              ) : (
                                <FaTrash />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <nav className="flex items-center">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded-l-md ${
                      currentPage === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-viridian-green hover:bg-gray-50'
                    } border border-gray-300`}
                  >
                    Previous
                  </button>
                  
                  {/* Page numbers */}
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`px-3 py-1 border-t border-b border-gray-300 ${
                        currentPage === i + 1
                          ? 'bg-viridian-green text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded-r-md ${
                      currentPage === totalPages
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-viridian-green hover:bg-gray-50'
                    } border border-gray-300`}
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UserItineraries;