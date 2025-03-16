import { useState, useEffect } from 'react';
import Header from './Components/Header/headerpage';
import Hero from './components/Hero/heropage';
import Destination from './components/Destination/destinationpage';
// import Popular from './components/Popular';
// import About from './components/About';
// import Blog from './components/Blog';
// import Footer from './components/Footer';
// import GoTop from './components/GoTop';

function App() {
  return (
    <>
      <Header />
      
      <main>
        <Hero />
        <Destination />
        {/* <Popular /> */}
        {/* <About /> */}
        {/* <Blog /> */}
      </main>

      {/* <Footer /> */}
      {/* <GoTop /> */}
    </>
  );
}

export default App;