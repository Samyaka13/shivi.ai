import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { virtualTourService } from '../../services/virtualTourService';
import image1 from '../../assets/images/shape-1.png';
import image2 from '../../assets/images/shape-2.png';
import image3 from '../../assets/images/shape-3.png';
import heroBanner from '../../assets/images/hero-banner.png';
import loadinggif from '../../assets/images/loading.gif';

// Check if the API key is loaded
const MAPS_API_KEY = import.meta.env.VITE_MAPS_API_KEY;
if (!MAPS_API_KEY) {
    console.warn("VITE_MAPS_API_KEY is not loaded. Check your .env file and restart the dev server.");
}

const budgetRanges = [
    { value: 'economy', label: '₹0 - ₹1,000', range: '0-1000' },
    { value: 'moderate', label: '₹1,000 - ₹3,000', range: '1000-3000' },
    { value: 'comfort', label: '₹3,000 - ₹5,000', range: '3000-5000' },
    { value: 'luxury', label: '₹5,000 - ₹10,000', range: '5000-10000' },
    { value: 'ultra', label: '₹10,000+', range: '10000-plus' }
];

const Hero = () => {
    // ===== STATE MANAGEMENT =====
    // Form inputs
    const [origin, setOrigin] = useState('');
    const [destination, setDestination] = useState('');
    const [travelDate, setTravelDate] = useState('');
    const [returnDate, setReturnDate] = useState('');
    const [members, setMembers] = useState(1);
    const [budget, setBudget] = useState(budgetRanges[1].value); // Default to moderate
    const [preferences, setPreferences] = useState('');
    const [specialRequirements, setSpecialRequirements] = useState('');
    
    // UI states
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

    // City suggestions
    const [originSuggestions, setOriginSuggestions] = useState([]);
    const [destinationSuggestions, setDestinationSuggestions] = useState([]);
    const [showOriginSuggestions, setShowOriginSuggestions] = useState(false);
    const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

    // Refs
    const originRef = useRef(null);
    const destinationRef = useRef(null);
    const suggestionTimeoutRef = useRef(null);

    const navigate = useNavigate();

    // ===== CITY SUGGESTION FUNCTIONS =====
    const fetchCitySuggestions = async (input, isOrigin = true) => {
        if (!input || input.length < 2) {
            if (isOrigin) {
                setOriginSuggestions([]);
                setShowOriginSuggestions(false);
            } else {
                setDestinationSuggestions([]);
                setShowDestinationSuggestions(false);
            }
            return;
        }

        if (!MAPS_API_KEY) {
            console.error("Maps API Key is missing.");
            setError("Suggestion service is unavailable.");
            return;
        }

        setIsLoadingSuggestions(true);

        try {
            const apiUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&types=(cities)&key=${MAPS_API_KEY}`;
            const response = await fetch(apiUrl);

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Google Places API request failed:', response.status, errorData);
                throw new Error(`API Error: ${errorData.error_message || response.statusText}`);
            }

            const data = await response.json();

            if (data.status === 'OK') {
                const formattedSuggestions = data.predictions.map(prediction => ({
                    id: prediction.place_id,
                    name: prediction.description
                }));

                if (isOrigin) {
                    setOriginSuggestions(formattedSuggestions);
                    setShowOriginSuggestions(true);
                } else {
                    setDestinationSuggestions(formattedSuggestions);
                    setShowDestinationSuggestions(true);
                }
            } else if (data.status === 'ZERO_RESULTS') {
                if (isOrigin) {
                    setOriginSuggestions([]);
                    setShowOriginSuggestions(false);
                } else {
                    setDestinationSuggestions([]);
                    setShowDestinationSuggestions(false);
                }
            } else {
                console.error('Google Places API Error:', data.status, data.error_message);
                throw new Error(`Places API Error: ${data.error_message || data.status}`);
            }
        } catch (error) {
            console.error('Error fetching city suggestions:', error);
            if (isOrigin) {
                setOriginSuggestions([]);
                setShowOriginSuggestions(false);
            } else {
                setDestinationSuggestions([]);
                setShowDestinationSuggestions(false);
            }
        } finally {
            setIsLoadingSuggestions(false);
        }
    };

    const debouncedFetchSuggestions = (value, isOrigin) => {
        if (suggestionTimeoutRef.current) {
            clearTimeout(suggestionTimeoutRef.current);
        }
        suggestionTimeoutRef.current = setTimeout(() => {
            fetchCitySuggestions(value, isOrigin);
        }, 300);
    };

    // ===== UTILITY FUNCTIONS =====
    const calculateDuration = () => {
        if (!travelDate || !returnDate) return 1;
        const start = new Date(travelDate);
        const end = new Date(returnDate);
        if (start > end) return 1;
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return diffDays > 0 ? diffDays : 1;
    };

    const formatTravelDates = () => {
        if (!travelDate || !returnDate) return '';
        if (new Date(travelDate) > new Date(returnDate)) return '';

        const formatDate = (dateStr) => {
            const date = new Date(dateStr);
            const options = { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' };
            return date.toLocaleDateString('en-US', options);
        };

        return `${formatDate(travelDate)} to ${formatDate(returnDate)}`;
    };

    // ===== EVENT HANDLERS =====
    const handleOriginChange = (e) => {
        const value = e.target.value;
        setOrigin(value);
        debouncedFetchSuggestions(value, true);
    };

    const handleDestinationChange = (e) => {
        const value = e.target.value;
        setDestination(value);
        debouncedFetchSuggestions(value, false);
    };

    const handleSelectSuggestion = (suggestion, isOrigin = true) => {
        if (isOrigin) {
            setOrigin(suggestion.name);
            setShowOriginSuggestions(false);
            setOriginSuggestions([]);
        } else {
            setDestination(suggestion.name);
            setShowDestinationSuggestions(false);
            setDestinationSuggestions([]);
        }
    };

    const handleKeyPress = (e) => {
        const activeEl = document.activeElement;
        if (activeEl?.closest('.suggestion-dropdown') || e.key !== 'Enter') {
            return;
        }
        handleVirtualTour();
    };

    const handleVirtualTour = async () => {
        try {
            // Input validation
            if (!origin.trim()) { 
                setError('Please enter an origin city.'); 
                return; 
            }
            if (!destination.trim()) { 
                setError('Please enter a destination city.'); 
                return; 
            }
            if (!travelDate || !returnDate) { 
                setError('Please select both travel and return dates.'); 
                return; 
            }
            if (new Date(travelDate) > new Date(returnDate)) { 
                setError('Return date cannot be before travel date.'); 
                return; 
            }

            // Advanced options check
            if (!showAdvancedOptions && (
                budget !== budgetRanges[1].value ||
                preferences.trim() !== '' ||
                specialRequirements.trim() !== '' ||
                members !== 1
            )) {
                setShowAdvancedOptions(true);
                return;
            }

            setError('');
            setIsLoading(true);

            const travel_dates_formatted = formatTravelDates();
            if (!travel_dates_formatted) {
                setError('Invalid date range selected.');
                setIsLoading(false);
                return;
            }

            let preferencesObj = {};
            if (preferences.trim()) {
                preferences.split(',').map(p => p.trim()).filter(p => p).forEach(p => preferencesObj[p] = true);
            }

            const selectedBudgetRange = budgetRanges.find(range => range.value === budget);

            const payload = {
                origin,
                destination,
                travel_dates: travel_dates_formatted,
                ...(Object.keys(preferencesObj).length > 0 && { preferences: preferencesObj }),
                ...(selectedBudgetRange && budget !== budgetRanges[1].value && { budget: selectedBudgetRange.range }),
                ...(members > 1 && { members: members }),
                ...(specialRequirements.trim() && { special_requirements: specialRequirements.trim() }),
            };

            Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);

            const processingMessage = document.getElementById('processing-message');
            if (processingMessage) {
                processingMessage.style.display = 'block';
            }

            const tourData = await virtualTourService.generateTour(payload);

            localStorage.setItem('tourData', JSON.stringify(tourData));
            navigate('/virtual-tour');

        } catch (error) {
            console.error('Error generating virtual tour:', error);
            if (error.code === 'ECONNABORTED') {
                setError('Request timed out. AI generation can take time. Please try again.');
            } else {
                setError(error.response?.data?.detail || 'Failed to generate virtual tour. Please try again.');
            }
            
            const processingMessage = document.getElementById('processing-message');
            if (processingMessage) processingMessage.style.display = 'none';

        } finally {
            setIsLoading(false);
            setTimeout(() => {
                const processingMessage = document.getElementById('processing-message');
                if (processingMessage) processingMessage.style.display = 'none';
            }, 100);
        }
    };

    // ===== EFFECTS =====
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
            if (suggestionTimeoutRef.current) {
                clearTimeout(suggestionTimeoutRef.current);
            }
        };
    }, []);

    return (
        <section className="min-h-screen flex items-center relative pt-20 pb-10 md:pt-24 bg-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 md:flex md:items-center md:justify-between md:gap-6 lg:gap-10">
                {/* Left Column - Text and Form */}
                <div className="md:w-1/2 lg:w-5/12 space-y-4 md:space-y-5">
                    {/* Header Text - Enhanced with gradient and animation */}
                    <p className="text-yellow-400 text-2xl mb-1 md:text-5xl font-['Comforter_Brush'] animate-fade-in">
                        Explore Your Travel
                    </p>
                    <h2 className="text-oxford-blue text-4xl md:text-5xl lg:text-6xl font-['Abril_Fatface'] font-medium leading-tight bg-gradient-to-r from-oxford-blue to-viridian-green bg-clip-text ">
                        Trusted Travel Agency
                    </h2>
                    <p className="text-[#64748b] text-base md:text-lg leading-relaxed max-w-lg animate-fade-in-delay">
                        I travel not to go anywhere, but to go. I travel for travel's sake; the great affair is to move.
                    </p>
                    {/* Search Form */}
                    <div className="pt-4">
                        <div className="bg-white rounded-xl shadow-xl p-5 border border-gray-100">
                            {/* Error Message */}
                            {error && (
                                <div className="mb-3 p-2 bg-red-100 text-red-700 text-sm rounded">
                                    {error}
                                </div>
                            )}
                            
                            {/* Basic Form Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                {/* Origin Field */}
                                <div className="relative" ref={originRef}>
                                    <div className="border border-gray-300 hover:border-viridian-green focus-within:border-viridian-green transition-colors duration-200 rounded-md overflow-hidden">
                                        <div className="flex flex-col px-3 py-2">
                                            <label className="text-xs text-gray-500 font-medium">Origin</label>
                                            <input
                                                type="text"
                                                placeholder="Enter city"
                                                className="w-full py-1 focus:outline-none text-gray-700 bg-transparent"
                                                value={origin}
                                                onChange={handleOriginChange}
                                                onFocus={() => origin.length >= 2 && setShowOriginSuggestions(true)}
                                                onKeyPress={handleKeyPress}
                                                autoComplete="off"
                                            />
                                        </div>
                                        {isLoadingSuggestions && origin.length >= 2 && showOriginSuggestions && (
                                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                                <div className="h-4 w-4 border-2 border-viridian-green border-t-transparent rounded-full animate-spin"></div>
                                            </div>
                                        )}
                                    </div>
                                    {/* Origin Suggestions Dropdown */}
                                    {showOriginSuggestions && originSuggestions.length > 0 && (
                                        <div className="suggestion-dropdown absolute z-20 w-full bg-white border border-gray-300 rounded-md mt-1 shadow-lg max-h-60 overflow-y-auto animate-fade-down">
                                            {originSuggestions.map((suggestion) => (
                                                <div
                                                    key={suggestion.id}
                                                    className="px-4 py-2 hover:bg-gray-100 hover:text-viridian-green cursor-pointer text-sm text-gray-700 transition-colors duration-150"
                                                    onClick={() => handleSelectSuggestion(suggestion, true)}
                                                    onMouseDown={(e) => e.preventDefault()}
                                                >
                                                    {suggestion.name}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Destination Field */}
                                <div className="relative" ref={destinationRef}>
                                    <div className="border border-gray-300 hover:border-viridian-green focus-within:border-viridian-green transition-colors duration-200 rounded-md overflow-hidden">
                                        <div className="flex flex-col px-3 py-2">
                                            <label className="text-xs text-gray-500 font-medium">Destination</label>
                                            <input
                                                type="text"
                                                placeholder="Enter city"
                                                className="w-full py-1 focus:outline-none text-gray-700 bg-transparent"
                                                value={destination}
                                                onChange={handleDestinationChange}
                                                onFocus={() => destination.length >= 2 && setShowDestinationSuggestions(true)}
                                                onKeyPress={handleKeyPress}
                                                autoComplete="off"
                                            />
                                        </div>
                                        {isLoadingSuggestions && destination.length >= 2 && showDestinationSuggestions && (
                                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                                <div className="h-4 w-4 border-2 border-viridian-green border-t-transparent rounded-full animate-spin"></div>
                                            </div>
                                        )}
                                    </div>
                                    {/* Destination Suggestions Dropdown */}
                                    {showDestinationSuggestions && destinationSuggestions.length > 0 && (
                                        <div className="suggestion-dropdown absolute z-20 w-full bg-white border border-gray-300 rounded-md mt-1 shadow-lg max-h-60 overflow-y-auto">
                                            {destinationSuggestions.map((suggestion) => (
                                                <div
                                                    key={suggestion.id}
                                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-700"
                                                    onClick={() => handleSelectSuggestion(suggestion, false)}
                                                    onMouseDown={(e) => e.preventDefault()}
                                                >
                                                    {suggestion.name}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Travel Date Field */}
                                <div className="border border-gray-300 rounded-md overflow-hidden">
                                    <div className="flex flex-col px-3 py-2">
                                        <label className="text-xs text-gray-500 font-medium">Travel Date</label>
                                        <input
                                            type="date"
                                            className="w-full py-1 focus:outline-none text-gray-700 bg-transparent"
                                            value={travelDate}
                                            onChange={(e) => setTravelDate(e.target.value)}
                                            min={new Date().toISOString().split('T')[0]}
                                        />
                                    </div>
                                </div>

                                {/* Return Date Field */}
                                <div className="border border-gray-300 rounded-md overflow-hidden">
                                    <div className="flex flex-col px-3 py-2">
                                        <label className="text-xs text-gray-500 font-medium">Return Date</label>
                                        <input
                                            type="date"
                                            className="w-full py-1 focus:outline-none text-gray-700 bg-transparent"
                                            value={returnDate}
                                            onChange={(e) => setReturnDate(e.target.value)}
                                            min={travelDate || new Date().toISOString().split('T')[0]}
                                        />
                                    </div>
                                </div>

                                {/* Members Field */}
                                <div className="border border-gray-300 rounded-md overflow-hidden">
                                    <div className="flex flex-col px-3 py-2">
                                        <label className="text-xs text-gray-500 font-medium">Members</label>
                                        <input
                                            type="number"
                                            min="1"
                                            placeholder="1"
                                            className="w-full py-1 focus:outline-none text-gray-700 bg-transparent"
                                            value={members}
                                            onChange={(e) => setMembers(Math.max(1, parseInt(e.target.value) || 1))}
                                        />
                                    </div>
                                </div>

                                {/* Advanced Options Toggle */}
                                <div className="flex items-center justify-start md:justify-center md:col-span-1">
                                    <button
                                        type="button"
                                        className="text-sm text-viridian-green hover:text-teal-700 font-medium px-3 py-2 flex items-center transition-colors duration-200"
                                        onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                                    >
                                        {showAdvancedOptions ? (
        <>
            <span>Hide Advanced</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
        </>
    ) : (
        <>
            <span>Show Advanced</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
        </>
    )}
                                    </button>
                                </div>
                            </div>

                            {/* Advanced Options Section */}
                            <div className={`grid grid-cols-1 md:grid-cols-2 gap-3 mb-3 border-t border-gray-200 pt-3 transition-all duration-300 ease-in-out ${showAdvancedOptions ? 'opacity-100 max-h-96' : 'opacity-0 max-h-0 overflow-hidden'}`}>
                                {/* Budget Level */}
                                <div className="border border-gray-300 rounded-md overflow-hidden">
                                    <div className="flex flex-col px-3 py-2">
                                        <label className="text-xs text-gray-500 font-medium">Budget (Per Person Per Day)</label>
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
                                <div className="border border-gray-300 rounded-md overflow-hidden">
                                    <div className="flex flex-col px-3 py-2">
                                        <label className="text-xs text-gray-500 font-medium">Preferences (comma-separated)</label>
                                        <input
                                            type="text"
                                            placeholder="e.g., Food, Adventure, Relax"
                                            className="w-full py-1 focus:outline-none text-gray-700 bg-transparent"
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
                                            placeholder="e.g., Accessibility needs, dietary restrictions"
                                            className="w-full py-1 focus:outline-none text-gray-700 resize-none bg-transparent"
                                            rows={2}
                                            value={specialRequirements}
                                            onChange={(e) => setSpecialRequirements(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="mt-4">
                                {isLoading ? (
                                    <div className="flex justify-center items-center w-full h-12">
                                        <img
                                            src={loadinggif}
                                            alt="Loading..."
                                            className="h-12"
                                        />
                                    </div>
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            className="bg-viridian-green text-white font-bold py-3 px-6 rounded-md border-2 border-viridian-green hover:bg-transparent hover:text-viridian-green transition-all duration-300 flex-1 flex items-center justify-center min-w-[200px] shadow-md hover:shadow-lg transform hover:-translate-y-1"
                                            onClick={handleVirtualTour}
                                            disabled={isLoading}
                                            type="button"
                                        >
                                            Generate Virtual Tour
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Processing Message */}
                            <div
    id="processing-message"
    className="mt-3 text-sm text-center text-gray-600 bg-gray-50 p-3 rounded-md border border-gray-200 animate-pulse"
    style={{ display: 'none' }}
>
    <div className="flex items-center justify-center">
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-viridian-green" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Creating your tour... AI generation can take 1-2 minutes. Please wait.
    </div>
</div>

                        </div>
                    </div>
                </div>

                {/* Right Column - Hero Image */}
                <figure className="hidden md:block md:w-1/2 lg:w-5/12 mt-10 md:mt-0">
                    <img
                        src={heroBanner}
                        alt="Smiling woman with travel gear"
                        className="w-full object-contain"
                        loading="lazy"
                    />
                </figure>
            </div>

            {/* Decorative Elements */}
            <img 
                src={image1} 
                alt="" 
                className="hidden lg:block absolute w-[50px] h-[50px] top-[15%] left-[47%] animate-spin-slow" 
                aria-hidden="true" 
            />
            <img 
                src={image2} 
                alt="" 
                className="hidden lg:block absolute w-[45px] h-[60px] top-[20%] right-[8%] animate-spin-slow" 
                aria-hidden="true" 
            />
            <img 
                src={image3} 
                alt="" 
                className="hidden lg:block absolute w-[45px] h-[60px] left-[65%] bottom-[20%] animate-spin-slow animation-delay-500" 
                aria-hidden="true" 
            />
        </section>
    );
};

export default Hero;
