import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaSignOutAlt, FaSpinner } from 'react-icons/fa';

const LogoutButton = ({ className }) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoggingOut}
      className={`flex items-center ${className || 'text-white hover:text-teal-200 transition-colors'}`}
    >
      {isLoggingOut ? (
        <FaSpinner className="animate-spin mr-2" />
      ) : (
        <FaSignOutAlt className="mr-2" />
      )}
      {isLoggingOut ? 'Logging out...' : 'Logout'}
    </button>
  );
};

export default LogoutButton;