import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { virtualTourService } from '../../services/virtualTourService';
import { FaMapMarkerAlt, FaCalendarAlt, FaArrowLeft, FaDownload, FaSpinner, FaPaperPlane, FaLocationArrow, FaSmile } from 'react-icons/fa'; // Added icons
import { IoPersonOutline, IoGlobeOutline } from 'react-icons/io5'; // Icons for messages
import ItineraryDay from './ItineraryDay'; // Assuming ItineraryDay is in the same folder
import LoadingIndicator from '../UI/LoadingIndicator';
import ErrorAlert from '../UI/ErrorAlert';
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
    chatEndRef,
    setInput,
    handleSubmit,
    requestUserLocation,
    formatMessageText
  } = useChatLogic();

  const chatContainerRef = useRef(null);

  useEffect(() => {
    const fetchTourData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        let data;
        if (tourId) {
          data = await virtualTourService.getTourById(tourId);
        } else {
          const storedData = localStorage.getItem('tourData');
          if (storedData) data = JSON.parse(storedData);
          else throw new Error('No tour data found. Please create a tour first.');
        }

        setTourData(data);
      } catch (err) {
        console.error('Error loading tour data:', err);
        setError(err.message || 'Failed to load tour data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchTourData();
  }, [tourId]);

  const handleDownload = () => {
    
    if (!tourData) return;
    let content = `# Virtual Tour: ${tourData.origin} to ${tourData.destination}\n`;
    content += `Travel Dates: ${tourData.travel_dates}\n\n`;
    tourData.day_by_day_plan.forEach(day => {
      content += `## ${day.day}\n${day.plan}\n\n`;
    });
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `virtual-tour-${tourData.destination.replace(/\s+/g, '-').toLowerCase()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md px-4">
          <LoadingIndicator
            message="Generating your virtual tour..."
            subMessage="AI-powered tour generation may take up to 1-2 minutes"


          />
          {/* ... (keep the 'What's happening?' box) ... */}
          <div className="mt-8 bg-blue-50 p-4 rounded-md text-blue-800 text-sm">
            <p className="font-medium mb-2">What's happening?</p>
            <p>Our AI is creating a custom itinerary for your destination and generating unique images for each day of your trip.</p>
            <p className="mt-2">Please be patient as this process requires significant computation.</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
        <div className="max-w-md w-full">
          <ErrorAlert message={error} />
          <button
            className="bg-viridian-green text-white font-bold py-2 px-5 rounded-md flex items-center mt-4" // Added margin top
            onClick={() => navigate('/home')}
          >
            <FaArrowLeft className="mr-2" /> Return to Home
          </button>
        </div>
      </div>
    );
  }

  if (!tourData || !tourData.day_by_day_plan || tourData.day_by_day_plan.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
        <div className="text-xl text-gray-700 mb-4">No tour data available for this tour.</div>
        <button
          className="bg-viridian-green text-white font-bold py-2 px-5 rounded-md flex items-center"
          onClick={() => navigate('/home')}
        >
          <FaArrowLeft className="mr-2" /> Return to Home
        </button>
      </div>
    );
  }

  const activeItinerary = tourData.day_by_day_plan[activeDay];

  // --- Render Component ---
  return (
    <div className="min-h-screen bg-gray-100 pt-10 pb-20"> {/* Changed bg color */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* --- Tour Header --- */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          {/* ... (keep existing header content) ... */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {tourData.origin} to {tourData.destination}
              </h1>
              <div className="flex flex-wrap items-center text-gray-600 mb-4">
                <div className="flex items-center mr-6 mb-2 md:mb-0">
                  <FaMapMarkerAlt className="text-viridian-green mr-2" />
                  <span>{tourData.destination} Virtual Tour</span>
                </div>
                <div className="flex items-center">
                  <FaCalendarAlt className="text-viridian-green mr-2" />
                  <span>{tourData.travel_dates}</span>
                </div>
              </div>
            </div>

            <div className="flex space-x-4 mt-4 md:mt-0">
              <button
                onClick={handleDownload}
                className="flex items-center bg-viridian-green text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors"
              >
                <FaDownload className="mr-2" /> Download Itinerary
              </button>
              <button
                onClick={() => navigate('/home')}
                className="flex items-center bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
              >
                <FaArrowLeft className="mr-2" /> Back to Home
              </button>
            </div>
          </div>
        </div>

        {/* --- Day Selection Tabs --- */}
        <div className="mb-6 overflow-x-auto">
          {/* ... (keep existing tabs) ... */}
          <div className="flex space-x-2 pb-2 min-w-max">
            {tourData.day_by_day_plan.map((day, index) => (
              <button
                key={index}
                className={`px-4 py-2 rounded-md font-medium whitespace-nowrap ${index === activeDay // Added whitespace-nowrap
                  ? 'bg-viridian-green text-white shadow-sm' // Added shadow
                  : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                onClick={() => setActiveDay(index)}
              >
                {day.day}
              </button>
            ))}
          </div>
        </div>

        {/* --- Itinerary Content --- */}
        <div className="mb-12"> {/* Added margin bottom */}
          <ItineraryDay
            day={activeItinerary.day}
            plan={activeItinerary.plan}
            image={activeItinerary.image}
          />
        </div>

        {/* --- Inline Chat Section --- */}
        <div ref={chatContainerRef} className="mt-12 pt-8 border-t border-gray-300"> {/* Added top border */}
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Chat with Ev.ai</h2>

          {/* Chat Message History */}
          <div className="bg-white rounded-lg shadow-md p-4 md:p-6 h-[500px] overflow-y-auto mb-6 flex flex-col space-y-4 scroll-smooth">
            {messages.length === 0 && !isTyping && (
              <div className="text-center text-gray-500 pt-10">
                Start the conversation below! Ask about {tourData.destination}, travel tips, or anything else.
              </div>
            )}
            {messages.map(message => (
              <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] flex items-end gap-2 ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                  {/* Avatar */}
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white ${message.sender === 'bot' ? 'bg-viridian-green' : 'bg-gray-500'}`}>
                    {message.sender === 'bot' ? <IoGlobeOutline size={16} /> : <IoPersonOutline size={16} />}
                  </div>
                  {/* Message Bubble */}
                  <div className={`rounded-xl px-4 py-2 shadow-sm ${message.sender === 'user' ? 'bg-blue-100 text-gray-800 rounded-br-none' : 'bg-gray-100 text-gray-800 rounded-bl-none'}`}>
                    <p
                      className="text-sm break-words"
                      dangerouslySetInnerHTML={{ __html: formatMessageText(message.text) }}
                    />
                    <div className={`text-xs mt-1 ${message.sender === 'user' ? 'text-right text-blue-500' : 'text-left text-gray-500'}`}>
                      {message.time}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-end gap-2">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-viridian-green text-white">
                    <IoGlobeOutline size={16} />
                  </div>
                  <div className="rounded-xl px-4 py-3 bg-gray-100 shadow-sm rounded-bl-none">
                    <div className="flex space-x-1 items-center h-4">
                      <span className="typing-dot"></span>
                      <span className="typing-dot animation-delay-200"></span>
                      <span className="typing-dot animation-delay-400"></span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Invisible element to scroll to */}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input Form */}
          <form onSubmit={handleSubmit} className="flex items-center gap-2 md:gap-3 p-4 bg-white rounded-lg shadow-md sticky bottom-5 z-10"> {/* Sticky bottom */}
            {/* Location Button */}
            <button
              type="button"
              onClick={requestUserLocation}
              title="Share Location"
              className="flex-shrink-0 p-2 text-gray-500 hover:text-viridian-green rounded-full hover:bg-gray-100 transition-colors"
            >
              <FaLocationArrow size={18} />
            </button>
            {/* Emoji Button (Basic) */}
            <button
              type="button"
              onClick={() => setInput(prev => prev + '😊')} // Simple emoji add
              title="Add Emoji"
              className="flex-shrink-0 p-2 text-gray-500 hover:text-yellow-500 rounded-full hover:bg-gray-100 transition-colors hidden sm:block" // Hide on small screens
            >
              <FaSmile size={18} />
            </button>

            <input
              type="text"
              className="flex-grow px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-viridian-green focus:border-transparent text-sm"
              placeholder="Ask Ev.ai about your trip..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              aria-label="Chat input"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading} // Disable while loading response
              className={`flex-shrink-0 p-2 rounded-full text-white transition-colors ${(!input.trim() || isLoading) ? 'bg-gray-400 cursor-not-allowed' : 'bg-viridian-green hover:bg-opacity-90'}`}
              aria-label="Send message"
            >
              <FaPaperPlane size={18} />
            </button>
          </form>
        </div>

        {/* --- Old Chatbot Removed --- */}
        {/* <Chatbot
          ref={chatbotRef}
          isOpen={isChatbotOpen}
          setIsOpen={setIsChatbotOpen}
          // pageName="virtualTour" // prop might not be needed now
        /> */}
      </div>

      {/* Add some basic CSS for typing animation if not using a library */}
      <style jsx global>{`
        .typing-dot {
          width: 6px;
          height: 6px;
          background-color: #9ca3af; /* gray-400 */
          border-radius: 50%;
          display: inline-block;
          animation: bounce 1.3s linear infinite;
        }
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-3px); }
        }
        .animation-delay-200 { animation-delay: 0.15s; }
        .animation-delay-400 { animation-delay: 0.3s; }
      `}</style>
    </div>
  );
};

export default VirtualTour;