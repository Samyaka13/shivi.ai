import { useState, useEffect } from 'react';
import Header from './Components/Header/headerpage';
import Hero from './components/Hero/heropage';
import Destination from './components/Destination/destinationpage';
import FeaturedToursSection from './Components/Featured/featuredpage';
import AboutUsSection from './Components/About us/aboutuspage';
import BlogPostSection from './Components/Blog/blogpage';
import Footer from './Components/Footer/footerpage';
import ScrollToTop from './Components/ScrollUp/scrollupbutton';


function App() {
  return (
    <>
      <Header />
      
      <main className=''>
        <Hero />
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