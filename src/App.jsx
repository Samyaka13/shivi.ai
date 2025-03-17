import Header from './Components/Header/headerpage.jsx';
import Hero from './components/Hero/heropage.jsx';
import Destination from './components/Destination/destinationpage.jsx';
import FeaturedToursSection from './Components/Featured/featuredpage.jsx';
import AboutUsSection from './Components/About us/aboutuspage.jsx';
import BlogPostSection from './Components/Blog/blogpage.jsx';
import Footer from './Components/Footer/footerpage.jsx';
import ScrollToTop from './Components/ScrollUp/scrollupbutton.jsx';


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