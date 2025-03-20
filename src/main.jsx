import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from './Components/Auth/ProtectedRoute.jsx';

import SignInPage from './Components/Auth/Signin/SignInPage.jsx';
import SignUpPage from './Components/Auth/SignUp/SignUpPage.jsx';
import VirtualTour from './Components/Virtual-tour/virtual-tourPage.jsx';
import ItineraryView from './Components/Itinerary/ItineraryView.jsx';
import UserItineraries from './Components/Itinerary/UserItineraries.jsx';

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      {/* Public routes */}
      <Route path='/' element={<SignInPage />} />
      <Route path='/sign-up' element={<SignUpPage />} />
      
      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route path='/home' element={<App />} />
        
        {/* Virtual Tour routes */}
        <Route path='/virtual-tour' element={<VirtualTour />} /> 
        <Route path='/virtual-tour/:tourId' element={<VirtualTour />} />
        <Route path='/home/virtual-tour' element={<VirtualTour />} />
        
        {/* Itinerary routes */}
        <Route path='/trip_planning/itinerary/:itineraryId' element={<ItineraryView />} />
        <Route path='/trip_planning/user/itineraries' element={<UserItineraries />} />
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