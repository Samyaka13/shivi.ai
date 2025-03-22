import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from './Components/Auth/ProtectedRoute.jsx';
import ErrorBoundary from './Components/UI/ErrorBoundary.jsx';

import SignInPage from './Components/Auth/Signin/SignInPage.jsx';
import SignUpPage from './Components/Auth/SignUp/SignUpPage.jsx';
import VirtualTour from './Components/Virtual-tour/virtual-tourPage.jsx';
import ItineraryView from './Components/Itinerary/ItineraryView.jsx';
import UserItineraries from './Components/Itinerary/UserItineraries.jsx';
import GoogleCallback from './Components/Auth/GoogleCallback.jsx';

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      {/* Public routes */}
      <Route
        path="/"
        element={<App />}
        errorElement={<ErrorBoundary />}
      />

      <Route
        path="/sign-in"
        element={<SignInPage />}
        errorElement={<ErrorBoundary />}
      />

      <Route
        path="/sign-up"
        element={<SignUpPage />}
        errorElement={<ErrorBoundary />}
      />

      {/* Google OAuth Callback route - must be public */}
      <Route
        path='/google-callback'
        element={<GoogleCallback />}
        errorElement={<ErrorBoundary />}
      />

      {/* Protected routes */}
      <Route
        element={<ProtectedRoute />}
        errorElement={<ErrorBoundary />}
      >
        {/* Redirect /home to root for simplicity */}
        <Route path="/home" element={<Navigate to="/" replace />} />

        {/* Virtual Tour routes */}
        <Route path="/virtual-tour" element={<VirtualTour />} />
        <Route path="/virtual-tour/:tourId" element={<VirtualTour />} />
        <Route path="/home/virtual-tour" element={<VirtualTour />} />

        {/* Itinerary routes */}
        <Route path="/trip_planning/itinerary/:itineraryId" element={<ItineraryView />} />
        <Route path="/trip_planning/user/itineraries" element={<UserItineraries />} />
      </Route>
    </>
  )
);

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);