import React from 'react';
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './Components/Auth/ProtectedRoute';
import ErrorBoundary from './Components/UI/ErrorBoundary';

import App from './App';
import SignInPage from './Components/Auth/Signin/SignInPage';
import SignUpPage from './Components/Auth/SignUp/SignUpPage';
import VirtualTour from './Components/Virtual-tour/virtual-tourPage';
import ItineraryView from './Components/Itinerary/ItineraryView';
import UserItineraries from './Components/Itinerary/UserItineraries';
// import GoogleCallback from './Components/Auth/GoogleCallback';

// Auth wrapper to handle authentication state
const AuthWrapper = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-teal-600 border-r-transparent"></div>
      </div>
    );
  }
  
  return children;
};

// Auth redirect component - redirects to sign in if not authenticated
const RequireAuth = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    // Save the current location they were trying to go to
    return <Navigate to="/sign-in" replace />;
  }
  
  return children;
};

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      {/* Public routes with home page available to all users */}
      <Route
        path='/'
        element={<App />}
        errorElement={<ErrorBoundary />}
      />
      
      {/* Authentication routes */}
      <Route
        path='/sign-in'
        element={<SignInPage />}
        errorElement={<ErrorBoundary />}
      />
      <Route
        path='/sign-up'
        element={<SignUpPage />}
        errorElement={<ErrorBoundary />}
      />
      {/* <Route
        path='/google-callback'
        element={<GoogleCallback />}
        errorElement={<ErrorBoundary />}
      /> */}

      {/* Protected routes that require authentication */}
      <Route element={<AuthWrapper />}>
        <Route
          path='/home'
          element={<App />}
        />
        
        {/* Virtual Tour routes */}
        <Route 
          path='/virtual-tour' 
          element={
            <RequireAuth>
              <VirtualTour />
            </RequireAuth>
          }
        />
        <Route 
          path='/virtual-tour/:tourId' 
          element={
            <RequireAuth>
              <VirtualTour />
            </RequireAuth>
          }
        />
        
        {/* Itinerary routes */}
        <Route 
          path='/trip_planning/itinerary/:itineraryId' 
          element={
            <RequireAuth>
              <ItineraryView />
            </RequireAuth>
          }
        />
        <Route 
          path='/trip_planning/user/itineraries' 
          element={
            <RequireAuth>
              <UserItineraries />
            </RequireAuth>
          }
        />
      </Route>
    </>
  )
);

const AppRouter = () => {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
};

export default AppRouter;