import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { virtualTourService } from '../../services/virtualTourService';
import image1 from '../../assets/images/shape-1.png';
import image2 from '../../assets/images/shape-2.png';
import image3 from '../../assets/images/shape-3.png';
import heroBanner from '../../assets/images/hero-banner.png';

const Hero = () => {
  // State for form inputs
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [travelDate, setTravelDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [members, setMembers] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  // Format travel dates as YYYY-MM-DD to YYYY-MM-DD
  const formatTravelDates = () => {
    if (!travelDate || !returnDate) {
      return '';
    }
    
    const formatDate = (dateStr) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    };
    
    return `${formatDate(travelDate)} to ${formatDate(returnDate)}`;
  };

  // Handle Search button click
  const handleSearch = async () => {
    try {
      // Validate inputs
      if (!origin.trim()) {
        setError('Please enter an origin');
        return;
      }
      
      if (!destination.trim()) {
        setError('Please enter a destination');
        return;
      }
      
      if (!travelDate || !returnDate) {
        setError('Please select travel dates');
        return;
      }
      
      // Clear previous errors and set loading state
      setError('');
      setIsLoading(true);
      
      // Format travel dates
      const travel_dates = formatTravelDates();
      
      // Prepare payload for API call
      const payload = {
        origin,
        destination,
        travel_dates
      };
      
      // Make API call to generate virtual tour
      const tourData = await virtualTourService.generateTour(payload);
      
      // Store the data in localStorage to access it on the next page
      localStorage.setItem('tourData', JSON.stringify(tourData));
      
      // Redirect to the virtual tour page
      navigate('/virtual-tour');
      
    } catch (error) {
      console.error('Error generating virtual tour:', error);
      setError(error.response?.data?.detail || 'Failed to generate virtual tour. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <section className="h-screen flex items-center relative overflow-hidden bg-white">
      <div className="container mx-auto px-6 md:flex md:items-center md:justify-between md:gap-6 lg:gap-10">
        <div className="md:w-1/2 lg:w-5/12 space-y-4 md:space-y-5">
          <p className="text-yellow-400 text-2xl mb-1 md:text-5xl font-['Comforter_Brush']">Explore Your Travel</p>

          <h2 className="text-oxford-blue text-4xl md:text-5xl lg:text-6xl font-['Abril_Fatface'] font-medium leading-tight">Trusted Travel Agency</h2>

          <p className="text-[#64748b] text-base md:text-lg leading-relaxed max-w-lg">
            I travel not to go anywhere, but to go. I travel for travel's sake the great affair is to move.
          </p>

          {/* Search bar with inputs */}
          <div className="pt-2">
            <div className="bg-white rounded-lg shadow-lg p-4">
              {error && (
                <div className="mb-3 p-2 bg-red-100 text-red-700 text-sm rounded">
                  {error}
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                {/* Origin */}
                <div className="border border-gray-300 rounded-md overflow-hidden">
                  <div className="flex flex-col px-3 py-2">
                    <label className="text-xs text-gray-500 font-medium">Origin</label>
                    <input
                      type="text"
                      placeholder="Enter city or airport"
                      className="w-full py-1 focus:outline-none text-gray-700"
                      value={origin}
                      onChange={(e) => setOrigin(e.target.value)}
                      onKeyPress={handleKeyPress}
                    />
                  </div>
                </div>

                {/* Destination */}
                <div className="border border-gray-300 rounded-md overflow-hidden">
                  <div className="flex flex-col px-3 py-2">
                    <label className="text-xs text-gray-500 font-medium">Destination</label>
                    <input
                      type="text"
                      placeholder="Enter city or airport"
                      className="w-full py-1 focus:outline-none text-gray-700"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      onKeyPress={handleKeyPress}
                    />
                  </div>
                </div>

                {/* Travel Date */}
                <div className="border border-gray-300 rounded-md overflow-hidden">
                  <div className="flex flex-col px-3 py-2">
                    <label className="text-xs text-gray-500 font-medium">Travel Date</label>
                    <input
                      type="date"
                      className="w-full py-1 focus:outline-none text-gray-700"
                      value={travelDate}
                      onChange={(e) => setTravelDate(e.target.value)}
                    />
                  </div>
                </div>

                {/* Return Date */}
                <div className="border border-gray-300 rounded-md overflow-hidden">
                  <div className="flex flex-col px-3 py-2">
                    <label className="text-xs text-gray-500 font-medium">Return Date</label>
                    <input
                      type="date"
                      className="w-full py-1 focus:outline-none text-gray-700"
                      value={returnDate}
                      onChange={(e) => setReturnDate(e.target.value)}
                      min={travelDate} // Return date should be after travel date
                    />
                  </div>
                </div>

                {/* Members */}
                <div className="border border-gray-300 rounded-md overflow-hidden md:col-span-2">
                  <div className="flex flex-col px-3 py-2">
                    <label className="text-xs text-gray-500 font-medium">Members</label>
                    <input
                      type="number"
                      min="1"
                      placeholder="Enter number of travelers"
                      className="w-full py-1 focus:outline-none text-gray-700"
                      value={members}
                      onChange={(e) => setMembers(parseInt(e.target.value) || 1)}
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  className="bg-viridian-green text-white font-bold py-2 px-5 rounded-md border-2 border-viridian-green hover:bg-transparent hover:text-viridian-green transition-colors flex-1 flex items-center justify-center"
                  onClick={handleSearch}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                      Creating Tour...
                    </>
                  ) : (
                    'Generate Virtual Tour'
                  )}
                </button>
                <button className="bg-yellow-400 text-white font-bold py-2 px-5 rounded-md border-2 border-yellow-400 hover:bg-transparent hover:text-yellow-400 transition-colors flex-1">
                  Flight Search
                </button>
                <button className="bg-oxford-blue text-white font-bold py-2 px-5 rounded-md border-2 border-oxford-blue hover:bg-transparent hover:text-oxford-blue transition-colors flex-1">
                  Hotel Search
                </button>
              </div>
            </div>
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
      <img src={image3} alt="" className="hidden lg:block absolute w-[45px] h-[60px] left-[65%] bottom-[20%] animate-spin-slow animation-delay-500" aria-hidden="true" />
    </section>
  );
};

export default Hero;