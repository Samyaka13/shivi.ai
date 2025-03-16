import image1 from '../../assets/images/destination-1.jpg';
import image2 from '../../assets/images/destination-2.jpg';
import image3 from '../../assets/images/destination-3.jpg';
import image4 from '../../assets/images/destination-4.jpg';
import image5 from '../../assets/images/destination-5.jpg';

const Destination = () => {
  const destinations = [
    {
      id: 1,
      city: 'Malé',
      country: 'Maldives',
      image: image1,
      width: 'w-full md:w-[calc(50%-20px)]'
    },
    {
      id: 2,
      city: 'Bangkok',
      country: 'Thailand',
      image: image2,
      width: 'w-full md:w-[calc(50%-20px)]'
    },
    {
      id: 3,
      city: 'Kuala Lumpur',
      country: 'Malaysia',
      image: image3,
      width: 'w-full'
    },
    {
      id: 4,
      city: 'Kathmandu',
      country: 'Nepal',
      image: image4,
      width: 'w-full'
    },
    {
      id: 5,
      city: 'Jakarta',
      country: 'Indonesia',
      image: image5,
      width: 'w-full'
    }
  ];

  return (
    <section className="py-10 md:py-16">
      <div className="container mx-auto px-4">
        <p className="text-center text-yellow-400 text-4xl font-['Comforter_Brush'] mb-4">Destinations</p>
        
        <h2 className="text-center text-3xl md:text-4xl lg:text-5xl font-['Abril_Fatface'] text-gray-800 mb-16">Choose Your Place</h2>
        
        <ul className="flex flex-wrap gap-8 justify-center">
          {destinations.map(destination => (
            <li key={destination.id} className={destination.width}>
              <a href="#" className="block relative rounded-md overflow-hidden group">
                <figure className="bg-gray-400">
                  <img 
                    src={destination.image} 
                    alt={`${destination.city}, ${destination.country}`} 
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    loading="lazy"
                  />
                </figure>
                
                <div className="absolute bottom-0 left-0 w-full p-8 z-10">
                  <p className="text-yellow-400 text-xl font-['Comforter_Brush']">{destination.city}</p>
                  <h3 className="text-white text-2xl md:text-3xl font-['Abril_Fatface']">{destination.country}</h3>
                </div>
                
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[rgba(31,41,55,0.7)]"></div>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default Destination;