import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom'; // Added Link
import { virtualTourService } from '../../services/virtualTourService';
import {
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaArrowLeft,
  FaDownload,
  FaPaperPlane,
  FaLocationArrow,
  FaSmile,
  FaCompass // Kept Compass icon
} from 'react-icons/fa';
import { IoPersonOutline, IoGlobeOutline } from 'react-icons/io5';
import ItineraryDay from './ItineraryDay';
import LoadingIndicator from '../UI/LoadingIndicator'; // Assuming styled
import ErrorAlert from '../UI/ErrorAlert'; // Assuming styled
import { useChatLogic } from '../../hooks/useChatLogic';

const VirtualTour = () => {
  const [tourData, setTourData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeDay, setActiveDay] = useState(0);
  const navigate = useNavigate();
  const { tourId } = useParams();
  const {
    messages,
    input,
    isTyping,
    chatEndRef, // Using ref from hook for scrolling
    setInput,
    handleSubmit,
    requestUserLocation,
    formatMessageText
  } = useChatLogic(true); // Enable welcome message

  const chatContainerRef = useRef(null); // Ref for main chat container if needed

  // Auto-scroll effect remains the same
  useEffect(() => {
    setTimeout(() => { // Timeout helps ensure DOM is updated
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 100);
  }, [messages, isTyping]);


  useEffect(() => {
    const fetchTourData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        let data;
        if (tourId) {
          // Fetch specific tour by ID
          data = await virtualTourService.getTourById(tourId);
        } else {
          // Fallback: Try getting the last generated tour from localStorage
          const storedData = localStorage.getItem('tourData');
          if (storedData) {
            data = JSON.parse(storedData);
            // Optional: Clear localStorage after loading if it's only for immediate transfer
            // localStorage.removeItem('tourData');
          } else {
            // If no ID and no localStorage, show error or redirect
            throw new Error('No specific tour requested and no recent tour data found.');
          }
        }
        setTourData(data);
      } catch (err) {
        console.error('Error loading tour data:', err);
        // Provide more specific error messages if possible
        setError(err.message || 'Could not load the virtual tour data. Please try again or create a new tour.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchTourData();
  }, [tourId]); // Re-run if tourId changes

  const handleDownload = () => {
    // Download logic remains the same
    if (!tourData) return;
    let content = `# Virtual Tour: ${tourData.origin} to ${tourData.destination}\n`;
    content += `Travel Dates: ${tourData.travel_dates}\n\n`;
    tourData.day_by_day_plan.forEach(day => {
      content += `## ${day.day}\n${day.plan}\n\n`;
    });
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain;charset=utf-8' }); // Added charset
    element.href = URL.createObjectURL(file);
    element.download = `virtual-tour-${tourData.destination?.replace(/\s+/g, '-').toLowerCase() ?? 'details'}.txt`; // Safer filename
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    URL.revokeObjectURL(element.href); // Clean up blob URL
  };

  // --- Render States ---

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 p-4">
        <div className="text-center max-w-lg px-6 py-10 bg-white rounded-xl shadow-lg border border-gray-100">
           {/* Using a simple spinner here, replace with your LoadingIndicator if preferred */}
           <div className="w-12 h-12 border-4 border-viridian-green border-t-transparent rounded-full animate-spin mx-auto mb-5"></div>
           <h2 className="text-xl font-semibold text-gray-800 mb-2">Generating Your Virtual Tour...</h2>
           <p className="text-gray-600 mb-6">AI-powered generation can take 1-2 minutes. Thanks for your patience!</p>
          <div className="mt-6 bg-teal-50 p-4 rounded-lg border border-teal-100 text-teal-800 text-sm">
            <p className="font-medium text-base mb-1">What's happening?</p>
            <p>Our AI is crafting a day-by-day itinerary and finding unique images for your trip.</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-red-50 to-gray-100">
        <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-xl border border-red-100 text-center">
          <div className="text-5xl text-red-500 mb-5 flex justify-center">
             <FaCompass className="opacity-50" /> {/* Or an error icon */}
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Oops! Something went wrong.</h2>
          {/* Use your ErrorAlert component or display directly */}
          <p className="text-red-600 bg-red-50 p-3 rounded-md mb-6">{error}</p>
          <Link // Use Link for navigation
            to="/" // Link to home/creation page
            className="inline-flex items-center bg-gradient-to-r from-viridian-green to-teal-500 text-white font-bold py-2.5 px-6 rounded-lg hover:shadow-lg transition-all duration-200"
          >
            <FaArrowLeft className="mr-2" /> Go Back Home
          </Link>
        </div>
      </div>
    );
  }

  // Added a more specific check for tour data structure
  if (!tourData || !Array.isArray(tourData.day_by_day_plan) || tourData.day_by_day_plan.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="bg-white p-10 rounded-xl shadow-lg text-center border border-gray-100">
          <div className="text-6xl text-gray-300 mb-5 flex justify-center">
            <FaCompass />
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Tour Data Not Found</h2>
          <p className="text-gray-500 mb-8 max-w-sm">
            We couldn't find the details for this tour. It might not exist or the data is incomplete.
          </p>
          <Link // Use Link for navigation
            to="/" // Link to home/creation page
            className="inline-flex items-center bg-gradient-to-r from-viridian-green to-teal-500 text-white font-bold py-3 px-6 rounded-lg hover:shadow-lg transition-all duration-200"
          >
            <FaArrowLeft className="mr-2" /> Create a New Tour
          </Link>
        </div>
      </div>
    );
  }

  // Ensure activeDay is valid
  const currentActiveDay = Math.min(activeDay, tourData.day_by_day_plan.length - 1);
  const activeItinerary = tourData.day_by_day_plan[currentActiveDay];


  return (
    // Consistent gradient background
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pt-10 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* --- Tour Header --- (Already mostly styled, minor tweaks) */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100 transition-all duration-300 hover:shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"> {/* Added gap */}
            <div className="flex-1"> {/* Allow text to wrap */}
              <h1 className="text-3xl lg:text-4xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-viridian-green to-teal-600 leading-tight">
                {tourData.origin} <span className="text-gray-400 font-light mx-1">to</span> {tourData.destination}
              </h1>
              <div className="flex flex-wrap items-center text-sm text-gray-600 gap-x-6 gap-y-2"> {/* Adjusted gap */}
                <div className="flex items-center">
                  <div className="bg-viridian-green bg-opacity-10 p-1.5 rounded-full mr-2"> {/* Smaller padding */}
                    <FaMapMarkerAlt className="text-viridian-green text-xs" /> {/* Smaller icon */}
                  </div>
                  <span>{tourData.destination} Virtual Tour</span>
                </div>
                <div className="flex items-center">
                  <div className="bg-viridian-green bg-opacity-10 p-1.5 rounded-full mr-2">
                    <FaCalendarAlt className="text-viridian-green text-xs" />
                  </div>
                  <span>{tourData.travel_dates}</span>
                </div>
              </div>
            </div>
            {/* Action Buttons */}
            <div className="flex-shrink-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 mt-4 md:mt-0">
              <button
                onClick={handleDownload}
                className="flex items-center justify-center bg-gradient-to-r from-viridian-green to-teal-500 text-white px-5 py-2.5 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 text-sm font-medium"
              >
                <FaDownload className="mr-2 text-base" /> Download
              </button>
              <Link // Use Link for navigation
                to="/" // Link to home/creation page
                className="flex items-center justify-center bg-white border border-gray-200 text-gray-700 px-5 py-2.5 rounded-lg hover:bg-gray-50 hover:shadow-sm transition-all duration-200 text-sm font-medium"
              >
                <FaArrowLeft className="mr-2 text-base" /> Back Home
              </Link>
            </div>
          </div>
        </div>

        {/* --- Day Selection Tabs --- (Already mostly styled, minor tweaks) */}
        <div className="mb-8 bg-white p-2.5 rounded-xl shadow-md border border-gray-100">
          <div className="flex space-x-2 overflow-x-auto pb-1 min-w-max">
            {tourData.day_by_day_plan.map((day, index) => (
              <button
                key={index}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all duration-200 text-sm ${ // Adjusted padding/text size
                  index === currentActiveDay // Use corrected active day
                    ? 'bg-gradient-to-r from-viridian-green to-teal-500 text-white shadow-md transform scale-105 ring-2 ring-offset-2 ring-viridian-green/50' // Added ring for focus
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                }`}
                onClick={() => setActiveDay(index)}
              >
                {day.day}
              </button>
            ))}
          </div>
        </div>

        {/* --- Itinerary Content Wrapper --- */}
        <div className="mb-12 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-xl">
          {/* ItineraryDay component renders inside */}
           {activeItinerary ? (
                <ItineraryDay
                    key={currentActiveDay} // Add key to force re-render on day change if needed
                    day={activeItinerary.day}
                    plan={activeItinerary.plan}
                    image={activeItinerary.image}
                />
            ) : (
                <div className="p-8 text-center text-gray-500">Select a day to view the plan.</div>
            )}
        </div>

        {/* --- Inline Chat Section --- (Refinements) */}
        <div ref={chatContainerRef} className="pt-8 border-t-2 border-viridian-green border-opacity-20">
          {/* Chat Title */}
          <div className="flex items-center justify-center mb-8">
            <div className="h-px bg-gray-200 flex-grow max-w-xs"></div>
            <h2 className="text-2xl font-bold text-gray-800 px-4 mx-2 text-center bg-clip-text text-transparent bg-gradient-to-r from-viridian-green to-teal-600">
              Chat with Shivi.ai
            </h2>
            <div className="h-px bg-gray-200 flex-grow max-w-xs"></div>
          </div>

          {/* Chat Message History */}
          <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 h-[500px] overflow-y-auto mb-6 flex flex-col space-y-4 scroll-smooth border border-gray-100">
            {/* Placeholder */}
            {messages.length === 0 && !isTyping && (
              <div className="text-center text-gray-500 m-auto flex flex-col items-center p-6">
                <div className="w-16 h-16 mb-5 rounded-full bg-gradient-to-br from-viridian-green/10 to-teal-600/10 flex items-center justify-center ring-4 ring-white">
                  <IoGlobeOutline size={32} className="text-viridian-green" />
                </div>
                <p className="font-medium text-gray-700">
                  Ask me about {tourData.destination}!
                </p>
                <p className="text-sm mt-2 text-gray-400 max-w-sm">
                  Get tips on attractions, food, culture, or just chat about travel.
                </p>
              </div>
            )}
             {/* Messages */}
            {messages.map(message => (
              <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
                <div className={`max-w-[80%] flex items-end gap-2.5 ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                  {/* Avatar */}
                  <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-white shadow-sm transition-transform hover:scale-105 ${
                    message.sender === 'bot'
                      ? 'bg-gradient-to-br from-viridian-green to-teal-600'
                      : 'bg-gradient-to-br from-blue-500 to-indigo-600' // Slightly different user color
                  }`}>
                    {message.sender === 'bot' ? <IoGlobeOutline size={18} /> : <IoPersonOutline size={18} />}
                  </div>
                  {/* Message Bubble */}
                  <div className={`rounded-2xl px-4 py-2.5 shadow-sm ${ // Adjusted padding
                    message.sender === 'user'
                      ? 'bg-blue-50 text-gray-800 rounded-br-none border border-blue-100' // Added border
                      : 'bg-gray-50 text-gray-800 rounded-bl-none border border-gray-100' // Added border
                  }`}>
                    {/* Using div for better rendering control with dangerouslySetInnerHTML */}
                     <div
                      className="text-sm leading-relaxed break-words [&>strong]:font-semibold [&>em]:italic [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mt-1" // Add basic styling for markdown elements
                      dangerouslySetInnerHTML={{ __html: formatMessageText(message.text) }}
                    />
                    <div className={`text-xs mt-2 ${message.sender === 'user' ? 'text-right text-blue-600' : 'text-left text-gray-500'}`}> {/* Adjusted time style */}
                      {message.time}
                    </div>
                  </div>
                </div>
              </div>
            ))}


            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start animate-fadeIn">
                <div className="flex items-end gap-2.5">
                   <div className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center bg-gradient-to-br from-viridian-green to-teal-600 text-white shadow-sm">
                    <IoGlobeOutline size={18} />
                  </div>
                  <div className="rounded-2xl px-5 py-3.5 bg-gray-100 shadow-sm rounded-bl-none border border-gray-200"> {/* Adjusted padding/bg */}
                    <div className="flex space-x-1.5 items-center h-4"> {/* Adjusted spacing */}
                      <span className="typing-dot"></span>
                      <span className="typing-dot animation-delay-200"></span>
                      <span className="typing-dot animation-delay-400"></span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Scroll anchor */}
            <div ref={chatEndRef} className="h-px" />
          </div>

          {/* Chat Input Form */}
          <form onSubmit={handleSubmit} className="flex items-center gap-2 md:gap-3 p-3 bg-white rounded-xl shadow-lg sticky bottom-5 z-10 border border-gray-100 ring-1 ring-black/5">
            {/* Location Button */}
             <button
              type="button"
              onClick={requestUserLocation}
              title="Share Location"
              className="flex-shrink-0 p-2.5 text-gray-400 hover:text-viridian-green rounded-full hover:bg-gray-100 transition-all duration-200" // Adjusted colors
            >
              <FaLocationArrow size={18} />
            </button>
             {/* Emoji Button */}
            <button
              type="button"
              onClick={() => setInput(prev => prev + '😊')}
              title="Add Emoji"
              className="flex-shrink-0 p-2.5 text-gray-400 hover:text-yellow-500 rounded-full hover:bg-gray-100 transition-all duration-200 hidden sm:block" // Adjusted colors
            >
              <FaSmile size={18} />
            </button>

            <input
              type="text"
              className="flex-grow px-4 py-2.5 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-viridian-green/50 focus:border-viridian-green text-sm transition-colors duration-200" // Adjusted padding/focus
              placeholder={`Ask Shivi.ai about ${tourData.destination}...`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              aria-label="Chat input"
            />
            {/* Send Button */}
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className={`flex-shrink-0 p-2.5 rounded-full text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-viridian-green/70 ${ // Added focus ring
                (!input.trim() || isTyping)
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-gradient-to-r from-viridian-green to-teal-500 hover:shadow-md active:scale-95' // Added active state
              }`}
              aria-label="Send message"
            >
              <FaPaperPlane size={18} />
            </button>
          </form>
        </div>
      </div>

      {/* Enhanced CSS for animations (Keep or adjust as needed) */}
      <style jsx global>{`
        .typing-dot {
          width: 7px; /* Slightly smaller */
          height: 7px;
          /* Use a color from your theme */
          background-color: ${isTyping ? '#0d9488' : '#9ca3af'}; /* teal-600 or gray-400 */
          border-radius: 50%;
          display: inline-block;
          animation: bounce 1.4s ease-in-out infinite;
        }

        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1.0); }
        }
        /* Alternative bounce:
         @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-4px); }
        } */

        .animation-delay-200 { animation-delay: 0.16s; }
        .animation-delay-400 { animation-delay: 0.32s; }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .animate-fadeIn {
          animation: fadeIn 0.35s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default VirtualTour;