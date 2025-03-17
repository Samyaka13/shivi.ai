import React from 'react'
import popular1 from '../../assets/images/popular-1.jpg'
import popular2 from '../../assets/images/popular-2.jpg'
import popular3 from '../../assets/images/popular-3.jpg'
import { FaStar, FaRegStar, FaClock } from 'react-icons/fa';

const FeaturedToursSection = () => {
  const popularTours = [
    {
      id: 1,
      image: popular1,
      duration: '12 Days',
      price: 'From $50.00',
      rating: 4,
      ratingCount: 2,
      title: 'A good traveler has no fixed plans and is not intent on arriving.',
      location: 'Kuala Lumpur, Malaysia'
    },
    {
      id: 2,
      image: popular2,
      duration: '12 Days',
      price: 'From $50.00',
      rating: 4,
      ratingCount: 2,
      title: 'A good traveler has no fixed plans and is not intent on arriving.',
      location: 'Kuala Lumpur, Malaysia'
    },
    {
      id: 3,
      image: popular3,
      duration: '12 Days',
      price: 'From $50.00',
      rating: 4,
      ratingCount: 2,
      title: 'A good traveler has no fixed plans and is not intent on arriving.',
      location: 'Kuala Lumpur, Malaysia'
    }
  ];

  // Generate stars based on rating
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className="text-yellow-400 text-xl">
          {i <= rating ? (
            <FaStar />
          ) : (
            <FaRegStar />
          )}
        </span>
      );
    }
    return stars;
  };

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <p className="text-center text-yellow-500 text-5xl font-['Comforter_Brush']">Featured Tours</p>
        <h2 className="text-center text-3xl font-medium font-['Abril_Fatface'] text-gray-800 mb-12">Most Popular Tours</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {popularTours.map((tour) => (
            <div key={tour.id} className="bg-white rounded-lg overflow-hidden shadow-lg">
              <div className="relative">
                <a href="#">
                  <img 
                    src={tour.image} 
                    alt={tour.location} 
                    className="w-full h-64 object-cover"
                  />
                </a>
                <span className="absolute top-4 left-4 bg-yellow-500 text-white px-3 py-2 rounded-md flex items-center">
                  <FaClock className="mr-1" />
                  <time>{tour.duration}</time>
                </span>
              </div>

              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <div className="text-teal-600 font-bold">{tour.price}</div>
                  <div className="flex items-center">
                    {renderStars(tour.rating)}
                    <span className="ml-1 text-gray-500">({tour.ratingCount})</span>
                  </div>
                </div>

                <h3 className="text-lg font-medium text-gray-700 mb-3">
                  <a href="#" className="hover:text-teal-600 transition duration-300">
                    {tour.title}
                  </a>
                </h3>

                <address className="text-gray-500 not-italic">
                  {tour.location}
                </address>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedToursSection;