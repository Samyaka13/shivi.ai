import React, { useState, useEffect, useRef } from 'react';
import { FaRegPaperPlane, FaRobot, FaUser, FaTimes, FaChevronUp } from 'react-icons/fa';

const VirtualTourChatbot = ({ tourData, onPreferenceUpdate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const [preferences, setPreferences] = useState({
    travelStyle: null,
    foodPreference: null,
    budget: null,
    interests: []
  });
  const [currentQuestion, setCurrentQuestion] = useState(0);

  // Initial questions to ask the user
  const questions = [
    "Hi there! I'm your virtual tour assistant. What's your preferred way of traveling? (e.g., luxury, budget, adventure, cultural)",
    "What kind of food do you enjoy the most while traveling?",
    "What's your budget range for activities during this trip? (economy, moderate, luxury)",
    "Tell me about your interests! (e.g., history, nature, shopping, nightlife)"
  ];

  // Initialize chatbot with greeting
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'greeting',
          text: questions[0],
          sender: 'bot',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  }, [messages.length]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat is opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  // Function to handle sending messages
  const handleSendMessage = (e) => {
    e?.preventDefault();
    
    if (!input.trim()) return;
    
    // Add user message
    const userMessage = {
      id: `user-${Date.now()}`,
      text: input.trim(),
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    
    // Process user response to current question
    processUserResponse(input.trim(), currentQuestion);
    
    // Show typing indicator
    setIsTyping(true);
    
    // Set timeout to simulate bot thinking
    setTimeout(() => {
      setIsTyping(false);
      
      // If we have more questions, ask the next one
      if (currentQuestion < questions.length - 1) {
        const nextQuestion = questions[currentQuestion + 1];
        
        setMessages(prev => [
          ...prev, 
          {
            id: `bot-${Date.now()}`,
            text: nextQuestion,
            sender: 'bot',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        
        setCurrentQuestion(prev => prev + 1);
      } else if (currentQuestion === questions.length - 1) {
        // All questions answered, provide personalized recommendations
        provideTourRecommendations();
      }
    }, 1000);
  };

  // Process user responses and update preferences
  const processUserResponse = (response, questionIndex) => {
    switch (questionIndex) {
      case 0: // Travel style
        setPreferences(prev => ({ ...prev, travelStyle: response.toLowerCase() }));
        break;
      case 1: // Food preference
        setPreferences(prev => ({ ...prev, foodPreference: response.toLowerCase() }));
        break;
      case 2: // Budget
        setPreferences(prev => ({ ...prev, budget: response.toLowerCase() }));
        break;
      case 3: // Interests
        const interests = response.split(',').map(item => item.trim().toLowerCase());
        setPreferences(prev => ({ ...prev, interests }));
        
        // Notify parent component about updated preferences
        if (onPreferenceUpdate) {
          onPreferenceUpdate({ ...preferences, interests });
        }
        break;
      default:
        break;
    }
  };

  // Generate personalized recommendations based on preferences
  const provideTourRecommendations = () => {
    const { travelStyle, foodPreference, interests } = preferences;
    const destination = tourData?.destination || 'your destination';
    
    // Create personalized message
    let recommendationText = `Based on your preferences, I've customized your ${destination} virtual tour! `;
    
    // Add travel style recommendation
    if (travelStyle) {
      if (travelStyle.includes('luxury')) {
        recommendationText += `I'll highlight premium experiences and upscale venues. `;
      } else if (travelStyle.includes('budget')) {
        recommendationText += `I'll focus on affordable yet authentic experiences. `;
      } else if (travelStyle.includes('adventure')) {
        recommendationText += `I've emphasized outdoor activities and thrilling experiences. `;
      } else if (travelStyle.includes('cultural')) {
        recommendationText += `I've prioritized cultural sites and local experiences. `;
      }
    }
    
    // Add food recommendation
    if (foodPreference) {
      recommendationText += `For dining, I'll suggest amazing ${foodPreference} options throughout your tour. `;
    }
    
    // Add interests-based recommendation
    if (interests && interests.length > 0) {
      recommendationText += `I've also customized your itinerary to include more ${interests.join(', ')}. `;
    }
    
    // Add final touch
    recommendationText += `Enjoy your personalized virtual tour experience!`;
    
    // Add recommendation message
    setMessages(prev => [
      ...prev, 
      {
        id: `bot-recommendation`,
        text: recommendationText,
        sender: 'bot',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    
    // Increment question counter to prevent further automated questions
    setCurrentQuestion(questions.length);
  };

  // Toggle chat open/closed
  const toggleChat = () => {
    setIsOpen(prev => !prev);
  };

  // Render message bubbles
  const renderMessage = (message) => {
    return (
      <div 
        key={message.id} 
        className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-3`}
      >
        <div className={`flex items-start max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
          <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-white
            ${message.sender === 'user' ? 'bg-teal-600 ml-2' : 'bg-blue-600 mr-2'}`}
          >
            {message.sender === 'user' ? <FaUser size={14} /> : <FaRobot size={14} />}
          </div>
          
          <div className={`px-4 py-2 rounded-lg ${
            message.sender === 'user' 
              ? 'bg-teal-600 text-white rounded-tr-none' 
              : 'bg-gray-200 text-gray-800 rounded-tl-none'
          }`}>
            <p className="text-sm">{message.text}</p>
            <p className={`text-xs mt-1 ${message.sender === 'user' ? 'text-teal-100' : 'text-gray-500'}`}>
              {message.time}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Chat toggle button */}
      <button 
        onClick={toggleChat}
        className="fixed bottom-4 right-4 z-50 bg-teal-600 text-white p-3 rounded-full shadow-lg hover:bg-teal-700 transition-all flex items-center justify-center"
      >
        {isOpen ? <FaTimes size={20} /> : (
          <div className="flex items-center">
            <FaRobot size={20} />
            <span className="ml-2 mr-1">Tour Guide</span>
            <FaChevronUp size={12} />
          </div>
        )}
      </button>
      
      {/* Chat window */}
      <div className={`fixed bottom-20 right-4 z-50 w-[350px] h-[450px] bg-white rounded-lg shadow-xl border border-gray-200 transition-all duration-300 flex flex-col
        ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}`}
      >
        {/* Chat header */}
        <div className="bg-teal-600 text-white py-3 px-4 rounded-t-lg flex justify-between items-center">
          <div className="flex items-center">
            <FaRobot className="mr-2" size={18} />
            <h3 className="font-medium">Virtual Tour Guide</h3>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-white hover:bg-teal-700 rounded p-1">
            <FaTimes size={16} />
          </button>
        </div>
        
        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {messages.map(renderMessage)}
          
          {/* Typing indicator */}
          {isTyping && (
            <div className="flex justify-start mb-3">
              <div className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg rounded-tl-none">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        {/* Chat input */}
        <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-gray-200 rounded-b-lg">
          <div className="flex items-center">
            <input
              type="text"
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your response..."
              className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <button 
              type="submit"
              className="ml-2 bg-teal-600 text-white p-2 rounded-md hover:bg-teal-700 transition-colors"
              disabled={!input.trim()}
            >
              <FaRegPaperPlane />
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default VirtualTourChatbot;