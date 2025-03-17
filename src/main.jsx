import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider, Routes } from 'react-router-dom';

import SignInPage from './Components/Auth/Signin/SignInPage.jsx';
import SignUpPage from './Components/Auth/SignUp/SignUpPage.jsx';
const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path='/' element={<SignUpPage />}></Route>
      <Route path='/sign-in' element={<SignInPage />} />
      <Route path='/home' element={<App />} />
    </>

  )
)


createRoot(document.getElementById('root')).render(
  <React.StrictMode>
      {/* <App /> */}
      <RouterProvider router={router} />
  </React.StrictMode>
);