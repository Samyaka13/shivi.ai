import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { virtualTourService } from '../../services/virtualTourService';
import { 
  FaMapMarkerAlt, 
  FaCalendarAlt, 
  FaArrowLeft, 
  FaDownload, 
  FaPaperPlane, 
  FaLocationArrow, 
  FaSmile,
  FaCompass
} from 'react-icons/fa';
import { IoPersonOutline, IoGlobeOutline,IoChatboxEllipsesSharp } from 'react-icons/io5';
import ItineraryDay from './ItineraryDay';
import LoadingIndicator from '../UI/LoadingIndicator';
import ErrorAlert from '../UI/ErrorAlert';
import { useChatLogic } from '../../hooks/useChatLogic';
import SuggestionChips from '../suggestion';

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
    usedSuggestions,
    setInput,
    handleSubmit,
    requestUserLocation,
    formatMessageText,
    handleSuggestionClick
  } = useChatLogic();

  const chatContainerRef = useRef(null);

  // Auto-scroll effect when messages change
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="text-center max-w-md px-4 py-8 bg-white rounded-xl shadow-md">
          <LoadingIndicator
            message="Generating your virtual tour..."
            subMessage="AI-powered tour generation may take up to 1-2 minutes"
          />
          <div className="mt-8 bg-blue-50 p-5 rounded-lg border border-blue-100 text-blue-800 text-sm">
            <p className="font-medium mb-2 text-base">What's happening?</p>
            <p>Our AI is creating a custom itinerary for your destination and generating unique images for each day of your trip.</p>
            <p className="mt-2">Please be patient as this process requires significant computation.</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="max-w-md w-full bg-white p-6 rounded-xl shadow-md">
          <ErrorAlert message={error} />
          <button
            className="bg-gradient-to-r from-viridian-green to-teal-500 text-white font-bold py-3 px-5 rounded-lg flex items-center mt-5 hover:shadow-md transition-all duration-200"
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
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="bg-white p-8 rounded-xl shadow-md text-center">
          <div className="text-6xl text-gray-300 mb-4 flex justify-center">
            <FaCompass />
          </div>
          <div className="text-xl text-gray-700 mb-6">No tour data available for this tour.</div>
          <button
            className="bg-gradient-to-r from-viridian-green to-teal-500 text-white font-bold py-3 px-5 rounded-lg flex items-center mx-auto hover:shadow-md transition-all duration-200"
            onClick={() => navigate('/home')}
          >
            <FaArrowLeft className="mr-2" /> Return to Home
          </button>
        </div>
      </div>
    );
  }

  const activeItinerary = tourData.day_by_day_plan[activeDay];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pt-10 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* --- Tour Header --- */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100 transform transition-all duration-300 hover:shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-viridian-green to-teal-600">
                {tourData.origin} to {tourData.destination}
              </h1>
              <div className="flex flex-wrap items-center text-gray-600 mb-4">
                <div className="flex items-center mr-6 mb-2 md:mb-0">
                  <div className="bg-opacity-10 p-2 rounded-full mr-2">
                    <FaMapMarkerAlt className="text-viridian-green" />
                  </div>
                  <span>{tourData.destination} Virtual Tour</span>
                </div>
                <div className="flex items-center">
                  <div className="bg-opacity-10 p-2 rounded-full mr-2">
                    <FaCalendarAlt className="text-viridian-green" />
                  </div>
                  <span>{tourData.travel_dates}</span>
                </div>
              </div>
            </div>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <button
                onClick={handleDownload}
                className="flex items-center bg-gradient-to-r from-viridian-green to-teal-500 text-white px-5 py-3 rounded-lg hover:shadow-md transition-all duration-200"
              >
                <FaDownload className="mr-2" /> Download Itinerary
              </button>
              <button
                onClick={() => navigate('/home')}
                className="flex items-center bg-white border border-gray-200 text-gray-700 px-5 py-3 rounded-lg hover:bg-gray-50 hover:shadow-sm transition-all duration-200"
              >
                <FaArrowLeft className="mr-2" /> Back to Home
              </button>
            </div>
          </div>
        </div>

        {/* --- Day Selection Tabs --- */}
        <div className="mb-6 overflow-x-auto bg-white p-3 rounded-xl shadow-md">
          <div className="flex space-x-2 pb-2 min-w-max">
            {tourData.day_by_day_plan.map((day, index) => (
              <button
                key={index}
                className={`px-5 py-2.5 rounded-lg font-medium whitespace-nowrap transition-all duration-200 ${
                  index === activeDay
                    ? 'bg-gradient-to-r from-viridian-green to-teal-500 text-white shadow-md transform scale-105' 
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-100'
                }`}
                onClick={() => setActiveDay(index)}
              >
                {day.day}
              </button>
            ))}
          </div>
        </div>

        {/* --- Itinerary Content --- */}
        <div className="mb-12 bg-white rounded-xl shadow-lg p-6 border border-gray-100 transform transition-all duration-300 hover:shadow-xl">
          <ItineraryDay
            day={activeItinerary.day}
            plan={activeItinerary.plan}
            image={activeItinerary.image}
          />
        </div>

        {/* --- Inline Chat Section --- */}
        <div ref={chatContainerRef} className="mt-12 pt-8 border-t-2 border-viridian-green border-opacity-20">
          <div className="flex items-center justify-center mb-8">
            <div className="h-px bg-gray-200 flex-grow"></div>
            <h2 className="text-2xl font-bold text-gray-800 px-4 bg-clip-text text-transparent bg-gradient-to-r from-viridian-green to-teal-600">
              Ask From Shivi.ai
            </h2>
            <div className="h-px bg-gray-200 flex-grow"></div>
          </div>

          {/* Chat Message History */}
          <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 h-[500px] overflow-y-auto mb-6 flex flex-col space-y-4 scroll-smooth border border-gray-100">
            {messages.length === 0 && !isTyping && (
              <div className="text-center text-gray-500 pt-10 flex flex-col items-center">
                <div className="w-16 h-16 mb-4 rounded-full bg-viridian-green bg-opacity-10 flex items-center justify-center">
                  <IoChatboxEllipsesSharp size={28} className="text-viridian-green" />
                </div>
                <p className="font-medium">
                  Start the conversation below! Ask about {tourData.destination}, travel tips, or anything else.
                </p>
                <p className="text-sm mt-2 text-gray-400 max-w-md">
                  I can help with local attractions, cuisine recommendations, cultural insights, and more.
                </p>
                
                {/* Show suggestion chips when there are no messages */}
                <div className="mt-5">
                  <SuggestionChips 
                    destination={tourData.destination}
                    onSuggestionClick={handleSuggestionClick}
                    usedSuggestions={usedSuggestions}
                  />
                </div>
              </div>
            )}
            
            {messages.map(message => (
              <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
                <div className={`max-w-[75%] flex items-end gap-2.5 ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                  {/* Avatar */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white shadow-md transition-transform hover:scale-105 ${
                    message.sender === 'bot' 
                      ? 'bg-gradient-to-br from-viridian-green to-teal-600' 
                      : 'bg-gradient-to-br from-blue-500 to-blue-600'
                  }`}>
                    {message.sender === 'bot' ? <IoChatboxEllipsesSharp size={18} /> : <IoPersonOutline size={18} />}
                  </div>
                  
                  {/* Message Bubble */}
                  <div className={`rounded-2xl px-5 py-3.5 shadow-sm ${
                    message.sender === 'user' 
                      ? 'bg-blue-50 text-gray-800 rounded-br-none border-r border-t border-blue-100' 
                      : 'bg-gray-50 text-gray-800 rounded-bl-none border-l border-t border-gray-100'
                  }`}>
                    <p
                      className="text-base break-words leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: formatMessageText(message.text) }}
                    />
                    <div className={`text-xs mt-2 ${message.sender === 'user' ? 'text-right text-blue-500' : 'text-left text-gray-500'}`}>
                      {message.time}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Show suggestions after bot messages */}
            {messages.length > 0 && messages[messages.length - 1].sender === 'bot' && !isTyping && (
              <div className="pl-12 animate-fadeIn">
                <SuggestionChips 
                  destination={tourData.destination}
                  onSuggestionClick={handleSuggestionClick}
                  usedSuggestions={usedSuggestions}
                />
              </div>
            )}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start animate-fadeIn">
                <div className="flex items-end gap-2">
                  <div className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center bg-gradient-to-br from-viridian-green to-teal-600 text-white shadow-sm">
                    <IoChatboxEllipsesSharp size={18} />
                  </div>
                  <div className="rounded-2xl px-5 py-4 bg-gray-50 shadow-sm rounded-bl-none border-l border-t border-gray-100">
                    <div className="flex space-x-2 items-center h-4">
                      <span className="typing-dot"></span>
                      <span className="typing-dot animation-delay-200"></span>
                      <span className="typing-dot animation-delay-400"></span>
                    </div>
                  </div>
                </div>
              </div>
            )}

<div ref={chatEndRef} />
          </div>

          {/* Chat Input Form */}
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-lg border border-gray-200 ring-1 ring-black/5 transition-all duration-300 hover:shadow-xl"
          >
            {/* Location Button */}
            <button
              type="button"
              onClick={requestUserLocation}
              title="Share Location"
              className="flex-shrink-0 p-3 text-gray-400 hover:text-viridian-green rounded-full hover:bg-gray-100 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-viridian-green/50"
            >
              <FaLocationArrow size={18} />
            </button>

            {/* Emoji Button */}
            <button
              type="button"
              onClick={() => setInput(prev => prev + '😊')}
              title="Add Emoji"
              className="flex-shrink-0 p-3 text-gray-400 hover:text-yellow-500 rounded-full hover:bg-gray-100 active:scale-95 transition-all duration-200 hidden sm:block focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
            >
              <FaSmile size={18} />
            </button>

            {/* Text Input */}
            <input
              type="text"
              className="flex-grow px-5 py-3 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-viridian-green/50 focus:border-viridian-green text-base placeholder:text-gray-400 transition-all duration-200"
              placeholder={tourData?.destination ? `Ask about ${tourData.destination}...` : 'Ask Shivi.ai anything...'}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              aria-label="Chat input"
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className={`flex-shrink-0 p-3.5 rounded-full text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-viridian-green/70 ${
                (!input.trim() || isTyping)
                  ? 'bg-gray-300 cursor-not-allowed opacity-70' 
                  : 'bg-gradient-to-r from-viridian-green to-teal-500 hover:shadow-md active:scale-95 hover:opacity-90'
              }`}
              aria-label="Send message"
            >
              <FaPaperPlane size={18} />
            </button>
          </form>
        </div>
      </div>

      {/* Enhanced CSS for animations */}
      <style jsx global>{`
        .typing-dot {
          width: 8px;
          height: 8px;
          background-color: #10b981;
          border-radius: 50%;
          display: inline-block;
          animation: bounce 1.4s ease infinite;
        }
        
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-5px); }
        }
        
        .animation-delay-200 { animation-delay: 0.2s; }
        .animation-delay-400 { animation-delay: 0.4s; }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.35s ease-out forwards;
        }
        
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
          100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
        
        .animate-pulse-subtle {
          animation: pulse 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default VirtualTour;

