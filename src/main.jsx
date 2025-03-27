// src/main.jsx
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

// Import the new Chat Page
import ChatPage from './Components/Chatbot/ChatPage.jsx'; // Adjust path if needed

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

      {/* Protected routes */}
      <Route
        element={<ProtectedRoute />}
        errorElement={<ErrorBoundary />}
      >
        {/* Redirect /home to root */}
        <Route path="/home" element={<Navigate to="/" replace />} />

        {/* Virtual Tour routes */}
        {/* Make virtual-tour accessible without ID for listing/creation */}
        <Route path="/virtual-tour" element={<VirtualTour />} />
        <Route path="/virtual-tour/:tourId" element={<VirtualTour />} />
        {/* Remove redundant /home/virtual-tour */}
        {/* <Route path="/home/virtual-tour" element={<VirtualTour />} /> */}

        {/* --- Add the Dedicated Chat Route --- */}
        <Route path="/chat" element={<ChatPage />} />

      </Route>

      {/* Optional: Catch-all for 404 - place it last */}
      <Route path="*" element={<div className='flex justify-center items-center h-screen text-2xl'>404 - Page Not Found</div>} />

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