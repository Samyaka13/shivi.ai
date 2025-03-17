import React from 'react';
import aboutBanner from '../../assets/images/about-banner.png';
import { FaCompass, FaBriefcase } from 'react-icons/fa';
import { IoUmbrellaOutline } from 'react-icons/io5';

const AboutUsSection = () => {
  const features = [
    {
      id: 1,
      icon: 'compass',
      title: 'Tour guide',
      description: 'Lorem Ipsum available, but the majority have suffered alteration in some.'
    },
    {
      id: 2,
      icon: 'briefcase',
      title: 'Friendly price',
      description: 'Lorem Ipsum available, but the majority have suffered alteration in some.'
    },
    {
      id: 3,
      icon: 'umbrella-outline',
      title: 'Reliable tour',
      description: 'Lorem Ipsum available, but the majority have suffered alteration in some.'
    }
  ];

  // Function to render the appropriate icon based on the icon name
  const renderIcon = (iconName) => {
    switch (iconName) {
      case 'compass':
        return <FaCompass size={24} />;
      case 'briefcase':
        return <FaBriefcase size={24} />;
      case 'umbrella-outline':
        return <IoUmbrellaOutline size={24} />;
      default:
        return null;
    }
  };

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-8">
          <div className="lg:w-1/2">
            <p className="text-yellow-500 text-5xl font-['Comforter_Brush'] mb-2">About Us</p>
            <h2 className="text-3xl font-medium font-['Abril_Fatface'] text-gray-800 mb-4">
              Explore all tour of the world with us.
            </h2>
            <p className="text-gray-500 mb-8">
              Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or
              randomised words which don't look even slightly believable.
            </p>

            <div className="space-y-6 mb-8">
              {features.map((feature) => (
                <div key={feature.id} className="flex gap-4">
                  <div className="bg-teal-600 text-white p-4 rounded-full h-16 w-16 flex items-center justify-center flex-shrink-0">
                    {renderIcon(feature.icon)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-1">{feature.title}</h3>
                    <p className="text-gray-500">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <a 
              href="#" 
              className="inline-block bg-teal-600 text-white font-bold py-3 px-6 rounded-md border-2 border-teal-600 hover:bg-transparent hover:text-teal-600 transition duration-300"
            >
              Booking Now
            </a>
          </div>

          <div className="lg:w-1/2">
            <img 
              src={aboutBanner}
              alt="About banner" 
              className="w-full" 
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUsSection;