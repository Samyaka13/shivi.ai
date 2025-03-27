import { useState, useEffect, useRef } from 'react';
// Add Link if not already imported
import { useNavigate, useParams, Link } from 'react-router-dom';
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
import { IoPersonOutline, IoGlobeOutline, IoChatboxEllipsesSharp } from 'react-icons/io5';
import ItineraryDay from './ItineraryDay';
import LoadingIndicator from '../UI/LoadingIndicator';
import ErrorAlert from '../UI/ErrorAlert';
import { useChatLogic } from '../../hooks/useChatLogic';
import SuggestionChips from '../suggestion'; // Assuming this path is correct

// --- Import Background/Decorative Images ---
// Assuming these are the shapes used in your Hero section or similar suitable assets
// Adjust paths as needed
import bgShape1 from '../../assets/images/shape-1.png'; // Example reuse
import bgShape2 from '../../assets/images/shape-2.png'; // Example reuse
import bgShape3 from '../../assets/images/shape-3.png'; // Example reuse
import bgShape4 from '../../assets/images/virtualPage.png'; // Example reuse
// You could add more specific ones, e.g., world map outlines, etc.
// import worldMapOutline from '../../assets/images/world-map-outline.svg';


const VirtualTour = () => {
  // --- State and Hooks (Keep existing code) ---
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
    usedSuggestions, // Make sure this is exported and handled by useChatLogic if SuggestionChips need it
    setInput,
    handleSubmit,
    requestUserLocation,
    formatMessageText,
    handleSuggestionClick // Make sure this is exported and handled by useChatLogic
  } = useChatLogic(true); // Enable welcome message

  const chatContainerRef = useRef(null);

  // --- Effects (Keep existing code) ---
  useEffect(() => {
    // Scroll effect
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 100);
  }, [messages, isTyping]);

  useEffect(() => {
    // Fetch tour data effect
    const fetchTourData = async () => {
       setIsLoading(true);
       setError(null);
       try {
         let data;
         if (tourId) {
           data = await virtualTourService.getTourById(tourId);
         } else {
           const storedData = localStorage.getItem('tourData');
           if (storedData) {
               data = JSON.parse(storedData);
               // Optional: Clear local storage? Decide based on UX.
               // localStorage.removeItem('tourData');
            }
           else throw new Error('No specific tour requested and no recent tour data found.');
         }
         setTourData(data);
       } catch (err) {
         console.error('Error loading tour data:', err);
         setError(err.message || 'Could not load the virtual tour data. Please try again.');
       } finally {
         setIsLoading(false);
       }
     };
     fetchTourData();
  }, [tourId]);

  // --- Event Handlers (Keep existing code) ---
  const handleDownload = () => {
     if (!tourData) return;
     let content = `# Virtual Tour: ${tourData.origin} to ${tourData.destination}\n`;
     content += `Travel Dates: ${tourData.travel_dates}\n\n`;
     tourData.day_by_day_plan.forEach(day => {
       content += `## ${day.day}\n${day.plan}\n\n`;
     });
     const element = document.createElement('a');
     const file = new Blob([content], { type: 'text/plain;charset=utf-8' });
     element.href = URL.createObjectURL(file);
     element.download = `virtual-tour-${tourData.destination?.replace(/\s+/g, '-').toLowerCase() ?? 'details'}.txt`;
     document.body.appendChild(element);
     element.click();
     document.body.removeChild(element);
     URL.revokeObjectURL(element.href);
   };

  // --- Render States (Keep existing code) ---
  if (isLoading) {
    // Loading state JSX remains the same
    return (
       <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 p-4">
         <div className="text-center max-w-lg px-6 py-10 bg-white rounded-xl shadow-lg border border-gray-100">
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
    // Error state JSX remains the same
     return (
       <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-red-50 to-gray-100">
         <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-xl border border-red-100 text-center">
           <div className="text-5xl text-red-500 mb-5 flex justify-center">
              <FaCompass className="opacity-50" /> {/* Or an error icon */}
           </div>
           <h2 className="text-xl font-semibold text-gray-800 mb-3">Oops! Something went wrong.</h2>
           <p className="text-red-600 bg-red-50 p-3 rounded-md mb-6">{error}</p>
           <Link
             to="/"
             className="inline-flex items-center bg-gradient-to-r from-viridian-green to-teal-500 text-white font-bold py-2.5 px-6 rounded-lg hover:shadow-lg transition-all duration-200"
           >
             <FaArrowLeft className="mr-2" /> Go Back Home
           </Link>
         </div>
       </div>
     );
  }

  if (!tourData || !Array.isArray(tourData.day_by_day_plan) || tourData.day_by_day_plan.length === 0) {
    // No data state JSX remains the same
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
           <Link
             to="/"
             className="inline-flex items-center bg-gradient-to-r from-viridian-green to-teal-500 text-white font-bold py-3 px-6 rounded-lg hover:shadow-lg transition-all duration-200"
           >
             <FaArrowLeft className="mr-2" /> Create a New Tour
           </Link>
         </div>
       </div>
     );
  }

  // Ensure activeDay is valid
   const currentActiveDay = Math.max(0, Math.min(activeDay, tourData.day_by_day_plan.length - 1));
   const activeItinerary = tourData.day_by_day_plan[currentActiveDay];

  return (
    // --- Main Container: Add relative positioning ---
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pt-10 pb-20 relative overflow-hidden"> {/* Added relative and overflow-hidden */}

       {/* --- START: Background Decorative Elements --- */}
       {/* Element 1 (e.g., Top Right) */}
        <img
          src={bgShape2} // Reuse shape 2
          alt=""
          className="absolute z-10 top-10 right-[-50px] lg:right-[-80px] w-[100px] lg:w-[180px] h-auto text-viridian-green opacity-25 transform rotate-12  animate-pulse-subtle"
          aria-hidden="true"
          loading="lazy"
        />
        {/* Element 2 (e.g., Mid Left) */}
        <img
          src={bgShape1} // Reuse shape 1
          alt=""
          className="absolute z-10  top-1/3 left-[-60px] lg:left-[-100px] w-[120px] lg:w-[240px] h-auto text-teal-500 opacity-10 transform -rotate-15  animate-spin-slow"
          aria-hidden="true"
          loading="lazy"
        />
         {/* Element 3 (e.g., Bottom Right - near chat) */}
         <img
          src={bgShape3} // Reuse shape 3
          alt=""
          className="absolute bottom-20 right-[-40px] lg:right-5 w-[80px] lg:w-[150px] h-auto text-blue-500 opacity-25 transform -rotate-45  animate-pulse-subtle animation-delay-400" // Added delay
          aria-hidden="true"
          loading="lazy"
        />
         <img
          src={bgShape4} // Reuse shape 3
          alt=""
          className="absolute top-20 left-[30px] lg:right-5 w-[80px] lg:w-[150px] h-auto text-blue-500 opacity-25 transform -rotate-12  animate-pulse-subtle animation-delay-400" // Added delay
          aria-hidden="true"
          loading="lazy"
        />
        {/* Optional: Subtle full background pattern (example) */}
        {/* <div
          className="absolute inset-0 z-[-11] bg-[url('/path/to/your/subtle-pattern.svg')] bg-repeat bg-center opacity-5"
          aria-hidden="true"
        ></div> */}
      {/* --- END: Background Decorative Elements --- */}


      {/* --- Main Content Area (Keep relative positioning to stack above background) --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10"> {/* Add relative z-10 */}

        {/* --- Tour Header (Keep existing code) --- */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100 transition-all duration-300 hover:shadow-xl">
           <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
             <div className="flex-1">
               <h1 className="text-3xl lg:text-4xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-viridian-green to-teal-600 leading-tight">
                 {tourData.origin} <span className="text-gray-400 font-light mx-1">to</span> {tourData.destination}
               </h1>
               <div className="flex flex-wrap items-center text-sm text-gray-600 gap-x-6 gap-y-2">
                 <div className="flex items-center">
                   <div className=" bg-opacity-10 p-1.5 rounded-full mr-2">
                     <FaMapMarkerAlt className="text-viridian-green text-xs" />
                   </div>
                   <span>{tourData.destination} Virtual Tour</span>
                 </div>
                 <div className="flex items-center">
                   <div className=" bg-opacity-10 p-1.5 rounded-full mr-2">
                     <FaCalendarAlt className="text-viridian-green text-xs" />
                   </div>
                   <span>{tourData.travel_dates}</span>
                 </div>
               </div>
             </div>
             <div className="flex-shrink-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 mt-4 md:mt-0">
               <button
                 onClick={handleDownload}
                 className="flex items-center justify-center bg-gradient-to-r from-viridian-green to-teal-500 text-white px-5 py-2.5 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 text-sm font-medium"
               >
                 <FaDownload className="mr-2 text-base" /> Download
               </button>
               <Link
                 to="/"
                 className="flex items-center justify-center bg-white border border-gray-200 text-gray-700 px-5 py-2.5 rounded-lg hover:bg-gray-50 hover:shadow-sm transition-all duration-200 text-sm font-medium"
               >
                 <FaArrowLeft className="mr-2 text-base" /> Back Home
               </Link>
             </div>
           </div>
         </div>


        {/* --- Day Selection Tabs (Keep existing code) --- */}
        <div className="mb-8 bg-white p-2.5 rounded-xl shadow-md border border-gray-100">
          <div className="flex space-x-2 overflow-x-auto pb-1 min-w-max">
             {tourData.day_by_day_plan.map((day, index) => (
               <button
                 key={index}
                 className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all duration-200 text-sm ${
                   index === currentActiveDay
                     ? 'bg-gradient-to-r from-viridian-green to-teal-500 text-white shadow-md transform scale-105 ring-2 ring-offset-2 ring-viridian-green/50'
                     : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                 }`}
                 onClick={() => setActiveDay(index)}
               >
                 {day.day}
               </button>
             ))}
           </div>
        </div>


        {/* --- Itinerary Content Wrapper (Keep existing code) --- */}
         <div className="mb-12 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-xl">
             {activeItinerary ? (
                 <ItineraryDay
                     key={currentActiveDay}
                     day={activeItinerary.day}
                     plan={activeItinerary.plan}
                     image={activeItinerary.image}
                 />
             ) : (
                 <div className="p-8 text-center text-gray-500">Select a day to view the plan.</div>
             )}
         </div>


        {/* --- Inline Chat Section (Keep existing code) --- */}
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
                   <IoChatboxEllipsesSharp size={32} className="text-viridian-green" />
                 </div>
                 <p className="font-medium text-gray-700">
                   Ask me about {tourData.destination}!
                 </p>
                 <p className="text-sm mt-2 text-gray-400 max-w-sm">
                   Get tips on attractions, food, culture, or just chat about travel.
                 </p>
                 {/* Suggestions */}
                  {/* Ensure handleSuggestionClick is available from useChatLogic */}
                  {handleSuggestionClick && (
                       <div className="mt-6 w-full max-w-md">
                          <SuggestionChips
                              destination={tourData.destination}
                              onSuggestionClick={handleSuggestionClick}
                              usedSuggestions={usedSuggestions} // Assuming usedSuggestions is managed in useChatLogic
                          />
                      </div>
                   )}
               </div>
             )}

            {/* Messages */}
            {messages.map(message => (
              // Message rendering JSX remains the same
              <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
                  {/* ... existing message structure ... */}
                    <div className={`max-w-[80%] flex items-end gap-2.5 ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-white shadow-sm transition-transform hover:scale-105 ${ message.sender === 'bot' ? 'bg-gradient-to-br from-viridian-green to-teal-600' : 'bg-gradient-to-br from-blue-500 to-indigo-600' }`}>
                            {message.sender === 'bot' ? <IoChatboxEllipsesSharp size={18} /> : <IoPersonOutline size={18} />}
                        </div>
                        <div className={`rounded-2xl px-4 py-2.5 shadow-sm ${ message.sender === 'user' ? 'bg-blue-50 text-gray-800 rounded-br-none border border-blue-100' : 'bg-gray-50 text-gray-800 rounded-bl-none border border-gray-100' }`}>
                             <div className="text-sm leading-relaxed break-words [&>strong]:font-semibold [&>em]:italic [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mt-1" dangerouslySetInnerHTML={{ __html: formatMessageText(message.text) }} />
                             <div className={`text-xs mt-2 ${message.sender === 'user' ? 'text-right text-blue-600' : 'text-left text-gray-500'}`}>
                              {message.time}
                            </div>
                        </div>
                    </div>
              </div>
            ))}

             {/* Suggestions after bot messages */}
             {messages.length > 0 && messages[messages.length - 1].sender === 'bot' && !isTyping && handleSuggestionClick && (
                 <div className="pl-12 pt-3 animate-fadeIn"> {/* Added padding top */}
                     <SuggestionChips
                         destination={tourData.destination}
                         onSuggestionClick={handleSuggestionClick}
                         usedSuggestions={usedSuggestions}
                     />
                 </div>
             )}


            {/* Typing indicator (Keep existing code) */}
             {isTyping && (
              <div className="flex justify-start animate-fadeIn">
                {/* ... existing typing indicator structure ... */}
                    <div className="flex items-end gap-2.5">
                       <div className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center bg-gradient-to-br from-viridian-green to-teal-600 text-white shadow-sm">
                        <IoChatboxEllipsesSharp size={18} />
                      </div>
                      <div className="rounded-2xl px-5 py-3.5 bg-gray-100 shadow-sm rounded-bl-none border border-gray-200">
                        <div className="flex space-x-1.5 items-center h-4">
                          <span className="typing-dot"></span>
                          <span className="typing-dot animation-delay-200"></span>
                          <span className="typing-dot animation-delay-400"></span>
                        </div>
                      </div>
                    </div>
              </div>
            )}


            {/* Scroll anchor (Keep existing code) */}
            <div ref={chatEndRef} className="h-px" />
          </div>

          {/* Chat Input Form (Keep existing beautified code) */}
          <form
             onSubmit={handleSubmit}
             className="flex items-center gap-2 md:gap-3 p-3 bg-white rounded-xl shadow-lg sticky bottom-5 z-10 border border-gray-200/80 ring-1 ring-black/5"
           >
             {/* Input form content remains the same */}
              <button type="button" onClick={requestUserLocation} title="Share Location" className="flex-shrink-0 p-3 text-gray-400 hover:text-viridian-green rounded-full hover:bg-gray-100 active:scale-90 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-viridian-green/50"> <FaLocationArrow size={18} /> </button>
              <button type="button" onClick={() => setInput(prev => prev + '😊')} title="Add Emoji" className="flex-shrink-0 p-3 text-gray-400 hover:text-yellow-500 rounded-full hover:bg-gray-100 active:scale-90 transition-all duration-200 hidden sm:block focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-yellow-500/50"> <FaSmile size={18} /> </button>
              <input type="text" className="flex-grow px-4 py-2.5 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-viridian-green/50 focus:border-viridian-green text-sm md:text-base placeholder:text-gray-400 transition duration-200" placeholder={tourData?.destination ? `Ask about ${tourData.destination}...` : 'Ask Shivi.ai anything...'} value={input} onChange={(e) => setInput(e.target.value)} aria-label="Chat input" />
              <button type="submit" disabled={!input.trim() || isTyping} className={`flex-shrink-0 p-3 rounded-full text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-viridian-green/70 ${ (!input.trim() || isTyping) ? 'bg-gray-300 cursor-not-allowed' : 'bg-gradient-to-r from-viridian-green to-teal-500 hover:shadow-md active:scale-95 hover:opacity-95' }`} aria-label="Send message"> <FaPaperPlane size={18} /> </button>
           </form>
        </div>


      </div> {/* End Main Content Area */}

       {/* --- Keep existing CSS/Style block --- */}
       <style jsx global>{`
         .typing-dot {
           width: 7px;
           height: 7px;
           background-color: ${isTyping ? '#0d9488' : '#9ca3af'};
           border-radius: 50%;
           display: inline-block;
           animation: bounce 1.4s ease-in-out infinite;
         }
         @keyframes bounce {
           0%, 80%, 100% { transform: scale(0); }
           40% { transform: scale(1.0); }
         }
         .animation-delay-200 { animation-delay: 0.16s; }
         .animation-delay-400 { animation-delay: 0.32s; }
         @keyframes fadeIn {
           from { opacity: 0; transform: translateY(8px) scale(0.98); }
           to { opacity: 1; transform: translateY(0) scale(1); }
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
             animation: pulse 2s infinite cubic-bezier(0.4, 0, 0.6, 1); /* Smoother pulse */
         }
         @keyframes spin-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
         .animate-spin-slow {
           animation: spin-slow 15s linear infinite;
         }
         /* Optional: Style for Suggestion Chips if not handled by the component */
         /* .suggestion-chip { ... } */
       `}</style>
    </div> // End Main Container
  );
};

export default VirtualTour;