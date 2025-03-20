// import React from 'react';
// import { createRoot } from 'react-dom/client';
// import './index.css';
// import App from './App.jsx';

// import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider, Routes } from 'react-router-dom';

// import SignInPage from './Components/Auth/Signin/SignInPage.jsx';
// import SignUpPage from './Components/Auth/SignUp/SignUpPage.jsx';
// import VirtualTour from './Components/Virtual-tour/virtual-tourPage.jsx';
// const router = createBrowserRouter(
//   createRoutesFromElements(
//     <>
//       <Route path='/' element={<SignInPage />}></Route>
//       <Route path='/sign-up' element={<SignUpPage />} />
//       <Route path='/home' element={<App />} />
//       <Route path='/virtual-tour' element={<VirtualTour/>} /> 
//       <Route path='/home/virtual-tour' element={<VirtualTour/>} />
//     </>

//   )
// )


// createRoot(document.getElementById('root')).render(
//   <React.StrictMode>
//       {/* <App /> */}
//       <RouterProvider router={router} />
//   </React.StrictMode>
// );
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

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      {/* Public routes */}
      <Route path='/' element={<SignInPage />} />
      <Route path='/sign-up' element={<SignUpPage />} />
      
      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route path='/home' element={<App />} />
        <Route path='/virtual-tour' element={<VirtualTour />} /> 
        <Route path='/virtual-tour/:tourId' element={<VirtualTour />} /> 
        <Route path='/home/virtual-tour' element={<VirtualTour />} />
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