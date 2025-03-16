import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { ClerkProvider } from '@clerk/clerk-react';
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider, Routes } from 'react-router-dom';
// import SignIn from './Components/Auth/Signin/SignIn.jsx';
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
// Import your Publishable Key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} signInUrl='/sign-in' afterSignOutUrl="/">
      {/* <App /> */}
      <RouterProvider router={router} />
    </ClerkProvider>
  </React.StrictMode>
);