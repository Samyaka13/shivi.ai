import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { virtualTourService } from '../../services/virtualTourService';
import { itineraryService } from '../../services/itineraryService';
import { routeCalculationService } from '../../services/routeCalculationService';
import image1 from '../../assets/images/shape-1.png';
import image2 from '../../assets/images/shape-2.png';
import image3 from '../../assets/images/shape-3.png';
import heroBanner from '../../assets/images/hero-banner.png';

const budgetRanges = [
  { value: 'economy', label: '₹0 - ₹1,000', range: '0-1000' },
  { value: 'moderate', label: '₹1,000 - ₹3,000', range: '1000-3000' },
  { value: 'comfort', label: '₹3,000 - ₹5,000', range: '3000-5000' },
  { value: 'luxury', label: '₹5,000 -₹10,000', range: '5000-10000' },
  { value: 'ultra', label: '₹10,000+', range: '10000-plus' }
];

const Hero = () => {
  // State for form inputs
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [travelDate, setTravelDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [members, setMembers] = useState(1);
  const [budget, setBudget] = useState(budgetRanges[1].value); // Default to moderate range
  const [preferences, setPreferences] = useState('');
  const [specialRequirements, setSpecialRequirements] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  // New state for city suggestions
  const [originSuggestions, setOriginSuggestions] = useState([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState([]);
  const [showOriginSuggestions, setShowOriginSuggestions] = useState(false);
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  const originRef = useRef(null);
  const destinationRef = useRef(null);

  const navigate = useNavigate();

  // Function to fetch city suggestions based on user input
  const fetchCitySuggestions = async (input, isOrigin = true) => {
    if (!input || input.length < 2) {
      isOrigin ? setOriginSuggestions([]) : setDestinationSuggestions([]);
      return;
    }

    setIsLoadingSuggestions(true);

    try {
      // Replace this URL with your chosen API endpoint
      // For example with Google Places API:
      // const response = await fetch(`https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${input}&types=(cities)&key=YOUR_API_KEY`);

      // This is a mock implementation - replace with actual API call
      const mockCities = [
        { id: '1', name: `${input}abad` },
        { id: '2', name: `${input} City` },
        { id: '3', name: `New ${input}` },
        { id: '4', name: `${input}ville` },
        { id: '5', name: `${input} Springs` },
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));

      // Update the appropriate suggestions state
      if (isOrigin) {
        setOriginSuggestions(mockCities);
        setShowOriginSuggestions(true);
      } else {
        setDestinationSuggestions(mockCities);
        setShowDestinationSuggestions(true);
      }
    } catch (error) {
      console.error('Error fetching city suggestions:', error);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  // Handle click outside to close suggestion boxes
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (originRef.current && !originRef.current.contains(event.target)) {
        setShowOriginSuggestions(false);
      }
      if (destinationRef.current && !destinationRef.current.contains(event.target)) {
        setShowDestinationSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle origin input change
  const handleOriginChange = (e) => {
    const value = e.target.value;
    setOrigin(value);
    fetchCitySuggestions(value, true);
  };

  // Handle destination input change
  const handleDestinationChange = (e) => {
    const value = e.target.value;
    setDestination(value);
    fetchCitySuggestions(value, false);
  };

  // Handle suggestion selection
  const handleSelectSuggestion = (suggestion, isOrigin = true) => {
    if (isOrigin) {
      setOrigin(suggestion.name);
      setShowOriginSuggestions(false);
    } else {
      setDestination(suggestion.name);
      setShowDestinationSuggestions(false);
    }
  };

  // Calculate trip duration from travel dates
  const calculateDuration = () => {
    if (!travelDate || !returnDate) return 1;

    const start = new Date(travelDate);
    const end = new Date(returnDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays > 0 ? diffDays : 1;
  };

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

  // Handle Virtual Tour button click
  const handleVirtualTour = async () => {
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

      // Virtual tour doesn't use advanced options, so we don't need to check them here

      // Clear previous errors and set loading state
      setError('');
      setIsLoading(true);

      // Format travel dates
      const travel_dates = formatTravelDates();

      // Prepare payload for API call - keep virtual tour format as is
      const payload = {
        origin,
        destination,
        travel_dates
      };

      // Inform user about the processing time
      const processingMessage = document.getElementById('processing-message');
      if (processingMessage) {
        setTimeout(() => {
          processingMessage.style.display = 'block';
        }, 5000); // Show the message after 5 seconds
      }

      // Make API call to generate virtual tour
      const tourData = await virtualTourService.generateTour(payload);

      // Store the data in localStorage to access it on the next page
      localStorage.setItem('tourData', JSON.stringify(tourData));

      // Redirect to the virtual tour page
      navigate('/virtual-tour');

    } catch (error) {
      console.error('Error generating virtual tour:', error);
      if (error.code === 'ECONNABORTED') {
        setError('The request timed out. Our AI generation takes a bit longer. Please try again and be patient.');
      } else {
        setError(error.response?.data?.detail || 'Failed to generate virtual tour. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Itinerary button click
  const handleItinerary = async () => {
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

      // Before submitting, check if advanced options need to be displayed
      if (!showAdvancedOptions && (
        budget !== 'Mid-range' ||
        preferences !== '' ||
        specialRequirements !== '' ||
        members !== 1
      )) {
        // If there are non-default values but advanced options are hidden, show them
        setShowAdvancedOptions(true);
        return; // Don't submit yet, let the user see the populated advanced fields
      }

      // Clear previous errors and set loading state
      setError('');
      setIsLoading(true);

      // Calculate duration from dates
      const duration = calculateDuration();

      // Prepare payload for API call - keep itinerary format as is (string values)
      const travelRequest = {
        origin,
        destination,
        duration: String(duration), // Convert to string as the API expects string format
        budget, // Budget level: "Budget", "Mid-range", "Luxury" (already string)
        preferences: preferences || 'Travel, Sightseeing, Culture', // Default if empty
        special_requirements: specialRequirements || '' // Ensure this has at least empty string
      };

      // Show processing message
      const processingMessage = document.getElementById('processing-message');
      if (processingMessage) {
        setTimeout(() => {
          processingMessage.style.display = 'block';
        }, 5000); // Show the message after 5 seconds
      }

      // Make API call to generate itinerary
      const itineraryResponse = await itineraryService.generateItinerary(travelRequest);

      // Safely handle the response
      if (itineraryResponse && itineraryResponse.success) {
        // Make sure we're storing a valid object
        try {
          // Store the data in localStorage to access it on the next page
          localStorage.setItem('itineraryData', JSON.stringify(itineraryResponse));

          // Safely access itinerary_id
          const itineraryId = itineraryResponse.itinerary_id || 'new';

          // Redirect to the itinerary detail page
          navigate(`/trip_planning/itinerary/${itineraryId}`);
        } catch (jsonError) {
          console.error('Error storing itinerary data:', jsonError);
          setError('There was an error processing the itinerary data.');
        }
      } else {
        // Make sure we have a string message
        const errorMessage = itineraryResponse && typeof itineraryResponse.message === 'string'
          ? itineraryResponse.message
          : 'Failed to generate itinerary';
        setError(errorMessage);
      }

    } catch (error) {
      console.error('Error generating itinerary:', error);
      if (error.code === 'ECONNABORTED') {
        setError('The request timed out. Our AI generation takes a bit longer. Please try again and be patient.');
      } else {
        setError(error.response?.data?.detail || 'Failed to generate itinerary. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Flight Search button click (Route Calculation)
  const handleFlightSearch = async () => {
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

      // Before submitting, check if advanced options need to be displayed
      if (!showAdvancedOptions && (
        budget !== 'Mid-range' ||
        preferences !== '' ||
        specialRequirements !== '' ||
        members !== 1
      )) {
        // If there are non-default values but advanced options are hidden, show them
        setShowAdvancedOptions(true);
        return; // Don't submit yet, let the user see the populated advanced fields
      }

      // Clear previous errors and set loading state
      setError('');
      setIsLoading(true);

      // Format travel dates for the request
      const travelDates = formatTravelDates();

      // Prepare payload for API call
      const routeRequest = {
        origin,
        destination,
        travel_dates: travelDates,
        budget: budget, // Will be converted to number in the service
        preferences: preferences || 'Travel, Sightseeing',
        num_people: members, // Will be converted to number in the service
        mode: 'driving' // Default mode
      };

      // Show processing message
      const processingMessage = document.getElementById('processing-message');
      if (processingMessage) {
        setTimeout(() => {
          processingMessage.style.display = 'block';
        }, 5000); // Show the message after 5 seconds
      }

      // Call the route calculation service
      const routeData = await routeCalculationService.calculateRoute(routeRequest);

      // Store the data in localStorage to access it on the next page
      localStorage.setItem('routePlanData', JSON.stringify(routeData));

      // Redirect to the route plan page
      navigate('/route-plan');

    } catch (error) {
      console.error('Error calculating route:', error);
      setError(error.response?.data?.detail || 'Failed to calculate route. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleVirtualTour();
    }
  };

  return (
    <section className="min-h-screen flex items-center relative mt-24 bg-white">
      <div className="container mx-auto px-6 md:flex md:items-center md:justify-between md:gap-6 lg:gap-10">
        <div className="md:w-1/2 lg:w-5/12 space-y-4 md:space-y-5">
          <p className="text-yellow-400 text-2xl mb-1 md:text-5xl font-['Comforter_Brush']">Explore Your Travel</p>
          <h2 className="text-oxford-blue text-4xl md:text-5xl lg:text-6xl font-['Abril_Fatface'] font-medium leading-tight">
            Trusted Travel Agency
          </h2>
          <p className="text-[#64748b] text-base md:text-lg leading-relaxed max-w-lg">
            I travel not to go anywhere, but to go. I travel for travel's sake; the great affair is to move.
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
                {/* Origin with autocomplete */}
                <div className="border border-gray-300 rounded-md overflow-hidden relative" ref={originRef}>
                  <div className="flex flex-col px-3 py-2">
                    <label className="text-xs text-gray-500 font-medium">Origin</label>
                    <input
                      type="text"
                      placeholder="Enter city or airport"
                      className="w-full py-1 focus:outline-none text-gray-700"
                      value={origin}
                      onChange={handleOriginChange}
                      onFocus={() => origin.length >= 2 && setShowOriginSuggestions(true)}
                      onKeyPress={handleKeyPress}
                    />
                  </div>

                  {/* Origin suggestions dropdown */}
                  {showOriginSuggestions && originSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 shadow-lg max-h-60 overflow-y-auto">
                      {originSuggestions.map((suggestion) => (
                        <div
                          key={suggestion.id}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => handleSelectSuggestion(suggestion, true)}
                        >
                          {suggestion.name}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Show loading indicator */}
                  {isLoadingSuggestions && origin.length >= 2 && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="h-4 w-4 border-2 border-viridian-green border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>

                {/* Destination with autocomplete */}
                <div className="border border-gray-300 rounded-md overflow-hidden relative" ref={destinationRef}>
                  <div className="flex flex-col px-3 py-2">
                    <label className="text-xs text-gray-500 font-medium">Destination</label>
                    <input
                      type="text"
                      placeholder="Enter city or airport"
                      className="w-full py-1 focus:outline-none text-gray-700"
                      value={destination}
                      onChange={handleDestinationChange}
                      onFocus={() => destination.length >= 2 && setShowDestinationSuggestions(true)}
                      onKeyPress={handleKeyPress}
                    />
                  </div>

                  {/* Destination suggestions dropdown */}
                  {showDestinationSuggestions && destinationSuggestions.length > 0 && (
                    <div
                      className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 shadow-lg max-h-60 overflow-y-auto"
                    >
                      {destinationSuggestions.map((suggestion) => (
                        <div
                          key={suggestion.id}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => handleSelectSuggestion(suggestion, false)}
                        >
                          {suggestion.name}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Show loading indicator */}
                  {isLoadingSuggestions && destination.length >= 2 && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="h-4 w-4 border-2 border-viridian-green border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
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
                <div className="border border-gray-300 rounded-md overflow-hidden">
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

                {/* Advanced Options Toggle */}
                <div className="flex items-center justify-center">
                  <button
                    type="button"
                    className="text-viridian-green hover:text-teal-700 font-medium"
                    onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                  >
                    {showAdvancedOptions ? 'Hide' : 'Show'} Advanced Options
                  </button>
                </div>
              </div>

              {/* Advanced Options - Expanded content */}
              <div className={`grid grid-cols-1 md:grid-cols-2 gap-3 mb-3 border-t border-gray-200 pt-3 transition-all duration-300 ${showAdvancedOptions ? 'block' : 'hidden'}`}>
                {/* Budget Level */}
                <div className="border border-gray-300 rounded-md overflow-hidden">
                  <div className="flex flex-col px-3 py-2">
                    <label className="text-xs text-gray-500 font-medium">Budget Range</label>
                    <select
                      className="w-full py-1 focus:outline-none text-gray-700 bg-white"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                    >
                      {budgetRanges.map((range) => (
                        <option key={range.value} value={range.value}>
                          {range.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Preferences */}
                <div className="border border-gray-300 rounded-md overflow-hidden md:col-span-2">
                  <div className="flex flex-col px-3 py-2">
                    <label className="text-xs text-gray-500 font-medium">Preferences (comma-separated)</label>
                    <input
                      type="text"
                      placeholder="e.g., Food, Culture, Shopping, History, Adventure"
                      className="w-full py-1 focus:outline-none text-gray-700"
                      value={preferences}
                      onChange={(e) => setPreferences(e.target.value)}
                    />
                  </div>
                </div>

                {/* Special Requirements */}
                <div className="border border-gray-300 rounded-md overflow-hidden md:col-span-2">
                  <div className="flex flex-col px-3 py-2">
                    <label className="text-xs text-gray-500 font-medium">Special Requirements</label>
                    <textarea
                      placeholder="Any special needs or requests"
                      className="w-full py-1 focus:outline-none text-gray-700 resize-none"
                      rows={2}
                      value={specialRequirements}
                      onChange={(e) => setSpecialRequirements(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Action buttons - remain visible regardless of advanced options */}
              <div className="flex flex-wrap gap-2">
                <button
                  className="bg-viridian-green text-white font-bold py-2 px-5 rounded-md border-2 border-viridian-green hover:bg-transparent hover:text-viridian-green transition-colors flex-1 flex items-center justify-center"
                  onClick={handleVirtualTour}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                      Processing...
                    </>
                  ) : (
                    'Generate Virtual Tour'
                  )}
                </button>
                <button
                  className="bg-oxford-blue text-white font-bold py-2 px-5 rounded-md border-2 border-oxford-blue hover:bg-transparent hover:text-oxford-blue transition-colors flex-1"
                  onClick={handleItinerary}
                  disabled={isLoading}
                >
                  {isLoading ? 'Processing...' : 'Create Itinerary'}
                </button>
                <button
                  className="bg-yellow-400 text-white font-bold py-2 px-5 rounded-md border-2 border-yellow-400 hover:bg-transparent hover:text-yellow-400 transition-colors flex-1"
                  onClick={handleFlightSearch}
                  disabled={isLoading}
                >
                  {isLoading ? 'Processing...' : 'Calculate Routes'}
                </button>
              </div>

              {/* Processing message (hidden by default) */}
              <div
                id="processing-message"
                className="mt-3 text-sm text-gray-600 hidden"
              >
                Our AI is working hard to create your perfect itinerary. This may take up to 1-2 minutes, please be patient...
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