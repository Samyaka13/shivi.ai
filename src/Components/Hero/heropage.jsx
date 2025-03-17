import image1 from '../../assets/images/shape-1.png' 
import image2 from '../../assets/images/shape-2.png' 
import image3 from '../../assets/images/shape-3.png' 
import heroBanner from '../../assets/images/hero-banner.png' 
 
const Hero = () => { 
  return ( 
    <section className="h-screen flex items-center relative overflow-hidden bg-white"> 
      <div className="container mx-auto px-6 md:flex md:items-center md:justify-between md:gap-6 lg:gap-10"> 
        <div className="md:w-1/2 lg:w-5/12 space-y-4 md:space-y-5"> 
          <p className="text-yellow-400 text-2xl mb-1 md:text-5xl font-['Comforter_Brush']">Explore Your Travel</p> 
           
          <h2 className=" text-oxford-blue text-4xl md:text-5xl lg:text-6xl font-['Abril_Fatface'] font-medium leading-tight">Trusted Travel Agency</h2> 
           
          <p className="text-[#64748b] text-base md:text-lg leading-relaxed max-w-lg"> 
            I travel not to go anywhere, but to go. I travel for travel's sake the great affair is to move. 
          </p> 
           
          <div className="flex flex-wrap gap-4 pt-2"> 
            <a href="#" className="bg-viridian-green text-white font-bold py-2 px-5 rounded-md border-2 border-viridian-green hover:bg-transparent hover:text-viridian-green transition-colors">Contact Us</a> 
             
            <a href="#" className="text-[#1e293b] py-2 px-5 rounded-md border-2 border-gray-400 hover:border-viridian-green hover:text-viridian-green transition-colors font-bold">Learn More</a> 
          </div> 
        </div> 
         
        <figure className="hidden md:block md:w-1/2 lg:w-5/12"> 
          <img  
            src={heroBanner}  
            alt="hero banner"  
            className="w-full" 
            loading="lazy" 
          /> 
        </figure> 
      </div> 
       
      {/* Decorative shapes */} 
      <img src={image1} alt="" className="hidden lg:block absolute w-[50px] h-[50px] top-[15%] left-[47%] animate-spin-slow" aria-hidden="true" /> 
      <img src={image2} alt="" className="hidden lg:block absolute w-[45px] h-[60px] top-[20%] right-[8%] animate-spin-slow" aria-hidden="true" /> 
      <img src={image3} alt="" className="hidden lg:block absolute w-[45px] h-[60px] left-[40%] bottom-[20%] animate-spin-slow animation-delay-500" aria-hidden="true" /> 
    </section> 
  ); 
}; 
 
export default Hero;