import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { routeCalculationService } from '../../services/routeCalculationService';
import { FaPlus, FaCalendarAlt, FaTrash } from 'react-icons/fa';
import LoadingIndicator from '../UI/LoadingIndicator';
import ErrorAlert from '../UI/ErrorAlert';

const UserRoutePlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRoutePlans = async () => {
      try {
        setLoading(true);
        const userPlans = await routeCalculationService.getUserRoutePlans();
        setPlans(userPlans);
        setError(null);
      } catch (err) {
        console.error('Error fetching route plans:', err);
        setError('Failed to load your route plans. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchRoutePlans();
  }, []);

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

  // Handle plan deletion
  const handleDelete = async (planId) => {
    if (!window.confirm('Are you sure you want to delete this route plan?')) {
      return;
    }
    
    try {
      setDeleteLoading(planId);
      const response = await routeCalculationService.deleteRoutePlan(planId);
      
      if (response.deleted) {
        setPlans(plans.filter(plan => (plan.id !== planId && plan._id !== planId)));
      } else {
        setError('Failed to delete route plan');
      }
    } catch (err) {
      console.error('Error deleting route plan:', err);
      setError('Failed to delete route plan. Please try again.');
    } finally {
      setDeleteLoading(null);
    }
  };

  // Handle view plan - properly handle MongoDB _id vs id properties
  const handleViewPlan = (plan) => {
    const planId = plan.id || plan._id; // Handle both possible ID formats
    if (planId) {
      navigate(`/route-plan/${planId}`);
    } else {
      setError('Could not determine plan ID. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingIndicator message="Loading your route plans..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Route Plans</h1>
          <button
            onClick={() => navigate('/home')}
            className="flex items-center bg-viridian-green text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors"
          >
            <FaPlus className="mr-2" /> Create New Route Plan
          </button>
        </div>

        {error && (
          <div className="mb-8">
            <ErrorAlert 
              message={error} 
              onRetry={() => {
                setError(null);
                window.location.reload();
              }} 
            />
          </div>
        )}

        {plans.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">No route plans found</h2>
            <p className="text-gray-600 mb-6">
              You haven't created any travel route plans yet. Start planning your next journey now!
            </p>
            <button
              onClick={() => navigate('/home')}
              className="inline-flex items-center bg-viridian-green text-white px-6 py-3 rounded-md hover:bg-opacity-90 transition-colors"
            >
              <FaPlus className="mr-2" /> Create Your First Route Plan
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const planId = plan.id || plan._id;
              return (
                <div 
                  key={planId} 
                  className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-all relative"
                  onClick={() => handleViewPlan(plan)}
                >
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      {plan.origin} to {plan.destination}
                    </h3>
                    
                    <div className="flex items-center text-gray-600 mb-4">
                      <FaCalendarAlt className="mr-2 text-viridian-green" />
                      <span>Created: {formatDate(plan.created_at)}</span>
                    </div>
                    
                    <div className="absolute top-2 right-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent triggering the card click
                          handleDelete(planId);
                        }}
                        className="text-red-500 hover:text-red-700 p-2"
                        disabled={deleteLoading === planId}
                      >
                        {deleteLoading === planId ? (
                          <span className="inline-block h-4 w-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></span>
                        ) : (
                          <FaTrash />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserRoutePlans;