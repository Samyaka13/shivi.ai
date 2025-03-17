import image1 from '../../assets/images/destination-1.jpg';
import image2 from '../../assets/images/destination-2.jpg';
import image3 from '../../assets/images/destination-3.jpg';
import image4 from '../../assets/images/destination-4.jpg';
import image5 from '../../assets/images/destination-5.jpg';

const Destination = () => {
  return (
    <section className="py-10 md:py-16">
      <div className="container mx-auto px-4">
        <p className="text-center text-yellow-400 text-5xl font-['Comforter_Brush'] mb-2">Destinations</p>
        
        <h2 className="text-center text-3xl md:text-4xl lg:text-5xl font-['Abril_Fatface'] text-gray-800 mb-16">Choose Your Place</h2>
        
        <div className="flex flex-col gap-6">
          {/* Top row - Two larger cards */}
          <div className="flex flex-col md:flex-row gap-6">
            {/* Maldives */}
            <a href="#" className="block w-full md:w-1/2 relative rounded-md overflow-hidden group h-[400px]">
              <figure className="h-full">
                <img 
                  src={image1} 
                  alt="Malé, Maldives" 
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  loading="lazy"
                />
              </figure>
              
              <div className="absolute bottom-0 left-0 w-full p-8 z-10">
                <p className="text-yellow-400 text-3xl  font-['Comforter_Brush']">Malé</p>
                <h3 className="text-white text-2xl md:text-3xl font-['Abril_Fatface']">Maldives</h3>
              </div>
              
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[rgba(31,41,55,0.7)]"></div>
            </a>
            
            {/* Thailand */}
            <a href="#" className="block w-full md:w-1/2 relative rounded-md overflow-hidden group h-[400px]">
              <figure className="h-full">
                <img 
                  src={image2} 
                  alt="Bangkok, Thailand" 
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  loading="lazy"
                />
              </figure>
              
              <div className="absolute bottom-0 left-0 w-full p-8 z-10">
                <p className="text-yellow-400 text-3xl font-['Comforter_Brush']">Bangkok</p>
                <h3 className="text-white text-2xl md:text-3xl font-['Abril_Fatface']">Thailand</h3>
              </div>
              
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[rgba(31,41,55,0.7)]"></div>
            </a>
          </div>
          
          {/* Bottom row - Three smaller cards */}
          <div className="flex flex-col md:flex-row gap-6">
            {/* Malaysia */}
            <a href="#" className="block w-full md:w-1/3 relative rounded-md overflow-hidden group h-[300px]">
              <figure className="h-full">
                <img 
                  src={image3} 
                  alt="Kuala Lumpur, Malaysia" 
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  loading="lazy"
                />
              </figure>
              
              <div className="absolute bottom-0 left-0 w-full p-6 z-10">
                <p className="text-yellow-400 text-3xl font-['Comforter_Brush']">Kuala Lumpur</p>
                <h3 className="text-white text-2xl font-['Abril_Fatface']">Malaysia</h3>
              </div>
              
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[rgba(31,41,55,0.7)]"></div>
            </a>
            
            {/* Nepal */}
            <a href="#" className="block w-full md:w-1/3 relative rounded-md overflow-hidden group h-[300px]">
              <figure className="h-full">
                <img 
                  src={image4} 
                  alt="Kathmandu, Nepal" 
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  loading="lazy"
                />
              </figure>
              
              <div className="absolute bottom-0 left-0 w-full p-6 z-10">
                <p className="text-yellow-400 text-3xl font-['Comforter_Brush']">Kathmandu</p>
                <h3 className="text-white text-2xl font-['Abril_Fatface']">Nepal</h3>
              </div>
              
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[rgba(31,41,55,0.7)]"></div>
            </a>
            
            {/* Indonesia */}
            <a href="#" className="block w-full md:w-1/3 relative rounded-md overflow-hidden group h-[300px]">
              <figure className="h-full">
                <img 
                  src={image5} 
                  alt="Jakarta, Indonesia" 
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  loading="lazy"
                />
              </figure>
              
              <div className="absolute bottom-0 left-0 w-full p-6 z-10">
                <p className="text-yellow-400 text-3xl font-['Comforter_Brush']">Jakarta</p>
                <h3 className="text-white text-2xl font-['Abril_Fatface']">Indonesia</h3>
              </div>
              
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[rgba(31,41,55,0.7)]"></div>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Destination;