import image1 from '../../assets/images/shape-1.png'
import image2 from '../../assets/images/shape-2.png'
import image3 from '../../assets/images/shape-3.png'
import heroBanner from '../../assets/images/hero-banner.png'


const Hero = () => {
    return (
      <section className="py-16 md:py-0 md:min-h-[550px] lg:min-h-[680px] flex items-center relative overflow-hidden bg-white">
        <div className="container mx-auto px-4 md:flex md:items-center md:gap-10">
          <div className="mb-12 md:mb-0">
            <p className="text-yellow-400 text-4xl font-['Comforter_Brush'] mb-4">Explore Your Travel</p>
            
            <h2 className="text-[#1e293b] text-5xl md:text-6xl lg:text-[6rem] font-['Abril_Fatface'] font-medium leading-tight max-w-[11ch] mb-4">Trusted Travel Agency</h2>
            
            <p className="text-[#64748b] text-lg lg:text-xl leading-relaxed mb-4">
              I travel not to go anywhere, but to go. I travel for travel's sake the great affair is to move.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <a href="#" className="bg-teal-600 text-white font-bold py-2.5 px-6 rounded-md border-2 border-teal-600 hover:bg-transparent hover:text-teal-600 transition-colors">Contact Us</a>
              
              <a href="#" className="text-[#1e293b] py-2.5 px-6 rounded-md border-2 border-gray-400 hover:border-teal-600 hover:text-teal-600 transition-colors font-bold">Learn More</a>
            </div>
          </div>
          
          <figure className="w-full md:w-1/2">
            <img 
              src={heroBanner} 
              alt="hero banner" 
              className="w-full"
              loading="lazy"
            />
          </figure>
        </div>
        
        {/* Decorative shapes */}
        <img src={image1} alt="Vector Shape" className="hidden lg:block absolute w-[61px] h-[61px] top-[60px] left-[47%] animate-spin-slow" />
        <img src={image2} alt="Vector Shape" className="hidden lg:block absolute w-[56px] h-[74px] top-[20%] right-[50px] animate-spin-slow animation-delay-250" />
        <img src={image3} alt="Vector Shape" className="hidden lg:block absolute w-[57px] h-[72px] left-[40%] bottom-[20%] animate-spin-slow animation-delay-500" />
      </section>
    );
  };
  
  export default Hero;