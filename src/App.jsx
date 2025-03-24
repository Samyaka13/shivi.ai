import React from 'react';
import Header from './Components/Header/headerpage.jsx';
import Hero from './Components/Hero/heropage.jsx';
import Destination from './Components/Destination/destinationpage.jsx';
import FeaturedToursSection from './Components/Featured/featuredpage.jsx';
import AboutUsSection from './Components/About us/aboutuspage.jsx';
import BlogPostSection from './Components/Blog/blogpage.jsx';
import Footer from './Components/Footer/footerpage.jsx';
import ScrollToTop from './Components/ScrollUp/scrollupbutton.jsx';

// Import the Chatbot CSS for global application
import './Components/Chatbot/Chatbot.css';

function App() {
  return (
    <>
      <Header />
      
      <main className=''>
        <div className='z-40'>
        <Hero />
        </div>
        <Destination />
        <FeaturedToursSection/>
        <AboutUsSection/>
        <BlogPostSection/>
      </main>
      <Footer/>
      <ScrollToTop/>
    </>
  );
}

export default App;