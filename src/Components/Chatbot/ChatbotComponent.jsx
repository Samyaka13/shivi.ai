import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { IoPersonOutline, IoGlobeOutline, IoLocationOutline, IoHappyOutline } from 'react-icons/io5';
import './Chatbot.css';

const Chatbot = forwardRef(({ isOpen, setIsOpen }, ref) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isChatbotActive, setIsChatbotActive] = useState(isOpen || false);
  const [notificationActive, setNotificationActive] = useState(true);
  const [userLocation, setUserLocation] = useState({
    lat: null,
    lng: null,
    city: null,
    country: null,
    formatted_address: null
  });
  const [locationMessageShown, setLocationMessageShown] = useState(false);
  const [usedSuggestions] = useState(new Set());
  
  const messagesEndRef = useRef(null);
  const chatbotRef = useRef(null);
  const chatFormRef = useRef(null);
  
  // API Keys - Replace these with your actual API keys
  const GEMINI_API_KEY = 'AIzaSyBqZsyWeXFBEO72704FcoYFM_YjIVS0QeM';
  const MAPS_API_KEY = 'AIzaSyBbSshnFwPb50Tj--k7-W8wzqP90qORGKA';

  // Expose methods to parent component via ref
  useImperativeHandle(ref, () => ({
    toggleChatbot: () => setIsChatbotActive(prev => !prev),
    openChatbot: () => setIsChatbotActive(true),
    closeChatbot: () => setIsChatbotActive(false)
  }));

  // Effect to sync with isOpen prop
  useEffect(() => {
    if (isOpen !== undefined) {
      setIsChatbotActive(isOpen);
    }
  }, [isOpen]);

  // Effect to sync back to parent state
  useEffect(() => {
    if (setIsOpen && isChatbotActive !== isOpen) {
      setIsOpen(isChatbotActive);
    }
  }, [isChatbotActive, isOpen, setIsOpen]);

  // Get current time for messages
  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
  };

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // One-time initialization effect
  useEffect(() => {
    // Check if this is a page reload or first load
    const lastLoadTime = localStorage.getItem('evai_last_load_time');
    const currentTime = new Date().getTime();
    localStorage.setItem('evai_last_load_time', currentTime);
    
    // If it's a reload (within last hour), mark it for fresh suggestions
    const isReload = lastLoadTime && (currentTime - lastLoadTime < 3600000);
    
    // Initialize interface
    initInterface(isReload);
    
    // Event listener for escape key to close chat
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape' && isChatbotActive) {
        setIsChatbotActive(false);
      }
    };
    
    // Event listener for clicking outside chat to close it
    const handleOutsideClick = (e) => {
      if (chatbotRef.current && 
          !chatbotRef.current.contains(e.target) && 
          isChatbotActive &&
          !e.target.classList.contains('chatbot-toggle')) {
        setIsChatbotActive(false);
      }
    };
    
    document.addEventListener('keydown', handleEscapeKey);
    document.addEventListener('click', handleOutsideClick);
    
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.removeEventListener('click', handleOutsideClick);
    };
    // Empty dependency array to ensure this only runs once on mount
  }, []);

  // Initialize interface
  const initInterface = (isReload) => {
    // Add welcome message
    setTimeout(() => {
      addMessage("Hi there! I'm your travel assistant. Ask me anything about destinations, flights, accommodations, or share your location for personalized recommendations!", 'bot');
      
      // Add quick replies
      if (isReload) {
        const reloadSuggestions = getPageReloadSuggestions();
        addQuickReplies('', reloadSuggestions);
      } else {
        addQuickReplies('');
      }
      
      // Automatically request geolocation
      setTimeout(() => {
        requestUserLocation();
      }, 1500);
    }, 1000);
  };
  
  // Request user's geolocation
  const requestUserLocation = () => {
    console.log("Starting location request process");
    addMessage("I'll be able to give you better travel recommendations if you share your location. Requesting access...", 'bot');
    
    if (navigator.geolocation) {
      console.log("Geolocation is supported by this browser");
      navigator.geolocation.getCurrentPosition(
        position => {
          console.log("Location access granted:", {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
          getLocationDetails(position);
        },
        error => {
          console.error("Location access error:", {
            code: error.code,
            message: error.message
          });
          handleLocationError(error);
        },
        { 
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      console.warn("Geolocation is not supported by this browser");
      addMessage("Geolocation is not supported by your browser. I'll provide general travel recommendations instead.", 'bot');
    }
  };
  
  // Handle location errors
  const handleLocationError = (error) => {
    console.error('Geolocation error:', error);
    let errorMessage;
    
    switch(error.code) {
      case error.PERMISSION_DENIED:
        errorMessage = "You've declined location sharing. That's okay! I can still provide great travel recommendations.";
        break;
      case error.POSITION_UNAVAILABLE:
        errorMessage = "Location information is unavailable right now. I'll provide general travel recommendations instead.";
        break;
      case error.TIMEOUT:
        errorMessage = "The request to get your location timed out. I'll provide general travel recommendations instead.";
        break;
      default:
        errorMessage = "An unknown error occurred getting your location. I'll provide general travel recommendations instead.";
    }
    
    addMessage(errorMessage, 'bot');
  };
  
  // Get location details from coordinates
  const getLocationDetails = async (position) => {
    // Store the raw coordinates
    const updatedLocation = {
      ...userLocation,
      lat: position.coords.latitude,
      lng: position.coords.longitude
    };
    
    try {
      // Construct the API URL
      const apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${updatedLocation.lat},${updatedLocation.lng}&result_type=street_address|point_of_interest|premise|subpremise&key=${MAPS_API_KEY}`;
      
      // Make the request
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to get location details: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.status === 'OK' && data.results && data.results.length > 0) {
        // Extract the most detailed location first
        const mostDetailedResult = data.results[0];
        updatedLocation.formatted_address = mostDetailedResult.formatted_address;
        
        // Extract detailed components
        const addressComponents = mostDetailedResult.address_components;
        
        // Initialize location details
        updatedLocation.exactLocation = null;
        updatedLocation.premise = null;
        updatedLocation.street_number = null;
        updatedLocation.street = null;
        updatedLocation.sublocality = null;
        updatedLocation.city = null;
        updatedLocation.state = null;
        updatedLocation.country = null;
        
        // Extract location details
        for (const component of addressComponents) {
          if (component.types.includes('point_of_interest')) {
            updatedLocation.exactLocation = component.long_name;
          }
          if (component.types.includes('premise')) {
            updatedLocation.premise = component.long_name;
          }
          if (component.types.includes('street_number')) {
            updatedLocation.street_number = component.long_name;
          }
          if (component.types.includes('route')) {
            updatedLocation.street = component.long_name;
          }
          if (component.types.includes('sublocality_level_1')) {
            updatedLocation.sublocality = component.long_name;
          }
          if (component.types.includes('locality')) {
            updatedLocation.city = component.long_name;
          }
          if (component.types.includes('administrative_area_level_1')) {
            updatedLocation.state = component.long_name;
          }
          if (component.types.includes('country')) {
            updatedLocation.country = component.long_name;
          }
        }
        
        // Check if we need to look at other results for specific point_of_interest or premise
        if (!updatedLocation.exactLocation && !updatedLocation.premise) {
          // Look through other results to find a point of interest or premise name
          for (const result of data.results) {
            const types = result.types;
            
            // If this result is a point of interest or premise, use its formatted address
            if (types.includes('point_of_interest') || types.includes('premise') || types.includes('subpremise')) {
              // Extract from address components
              for (const component of result.address_components) {
                if (component.types.includes('point_of_interest') || component.types.includes('premise')) {
                  updatedLocation.exactLocation = component.long_name;
                  break;
                }
              }
              
              // If we found a specific location, we can break out
              if (updatedLocation.exactLocation) {
                break;
              }
            }
          }
        }
        
        // Construct location string
        let locationString = '';
        
        if (updatedLocation.exactLocation) {
          locationString = updatedLocation.exactLocation;
          
          if (updatedLocation.sublocality && updatedLocation.city) {
            locationString += `, ${updatedLocation.sublocality}, ${updatedLocation.city}`;
          } else if (updatedLocation.city) {
            locationString += `, ${updatedLocation.city}`;
          }
        } else if (updatedLocation.premise) {
          locationString = updatedLocation.premise;
          
          if (updatedLocation.street) {
            locationString += `, ${updatedLocation.street}`;
          }
          
          if (updatedLocation.sublocality && updatedLocation.city) {
            locationString += `, ${updatedLocation.sublocality}, ${updatedLocation.city}`;
          } else if (updatedLocation.city) {
            locationString += `, ${updatedLocation.city}`;
          }
        } else if (updatedLocation.street_number && updatedLocation.street) {
          locationString = `${updatedLocation.street_number} ${updatedLocation.street}`;
          
          if (updatedLocation.sublocality && updatedLocation.city) {
            locationString += `, ${updatedLocation.sublocality}, ${updatedLocation.city}`;
          } else if (updatedLocation.city) {
            locationString += `, ${updatedLocation.city}`;
          }
        } else if (updatedLocation.city && updatedLocation.country) {
          locationString = `${updatedLocation.city}, ${updatedLocation.country}`;
        } else {
          locationString = updatedLocation.formatted_address;
        }
        
        updatedLocation.precise_location_string = locationString;
        
        // Update location state
        setUserLocation(updatedLocation);
        
        // Only show location message if it hasn't been shown before
        if (!locationMessageShown) {
          const locationMessage = `I see you're at ${locationString}. I'll tailor travel recommendations when relevant!`;
          addMessage(locationMessage, 'bot');
          setLocationMessageShown(true);
        }
        
        // Add relevant quick replies based on location
        addQuickReplies('');
      } else {
        throw new Error(`Unable to determine your location from coordinates: ${data.status}`);
      }
    } catch (error) {
      console.error('Error getting location details:', error);
      addMessage("I couldn't determine your exact location, but I can still help with your travel plans!", 'bot');
    }
  };
  
  // Get travel context with location awareness
  const getTravelContext = () => {
    const baseContext = `You are Ev.ai, an intelligent travel assistant chatbot.
    Provide ultra-concise (1-2 lines) yet insightful travel advice tailored to each user's specific needs.
    Respond with practical, actionable information a savvy travel agent would know.
    Draw from knowledge of real destinations, current travel trends, and authentic local experiences of best trips.
    Skip unnecessary pleasantries and focus on delivering precise, valuable travel insights.
    Use natural language with occasional emojis (maximum 1 per message).
    Ask targeted follow-up questions only when essential for clarification.
    When recommending places, mention one specific authentic experience rather than generic attractions.
    For pricing questions, give realistic ranges based on current market rates.
    Seamlessly redirect non-travel topics back to travel planning.
    Only reference the user's location when directly relevant to their query.
    
    RESPONSE LENGTH AND INTELLIGENCE GUIDELINES:
    - For general travel questions, keep responses ultra-concise (1-2 lines).
    - For specific trip planning requests (e.g., "plan a 7-day trip to Dubai"), provide detailed, structured itineraries with day-by-day recommendations.
    - For questions about a specific destination that don't request an itinerary, provide 3-4 focused recommendations.
    - For budget planning queries, provide specific price ranges broken down by category (accommodation, food, activities).
    - When users mention specific interests (adventure, food, culture, relaxation), tailor recommendations precisely to those interests.
    - If the user asks for comparison between multiple destinations, create a brief, insightful point-by-point comparison highlighting key differences.
    - For seasonal travel questions, mention specific time-sensitive events and weather considerations.
    - For safety inquiries, provide current, factual information about travel advisories and local conditions.
    - For family travel, include age-appropriate suggestions that balance adult and children's interests.
    - For luxury travel, emphasize exclusive experiences rather than just expensive options.
    - For solo travelers, include both safety tips and social opportunities.
    - When a user shows decision paralysis or overwhelm, simplify options into 2-3 clear choices.
    - For transportation questions, provide specific routes, providers, and approximate costs.
    - Always incorporate local cultural context and etiquette tips when relevant.
    - Use data intelligence to recommend less-obvious but highly-rated alternatives to tourist traps.
    - When users are in planning mode, provide actionable next steps to advance their trip planning.
    - Always prioritize quality of information over length - be comprehensive for complex requests, concise for simple ones.`;
    
    // Only include location context if available
    if (userLocation.lat && userLocation.lng) {
      const safeGet = (obj, prop) => {
        try {
          return obj && typeof obj[prop] !== 'undefined' ? obj[prop] : null;
        } catch (e) {
          return null;
        }
      };
      
      // Format street address
      let streetAddress = 'Not available';
      if (safeGet(userLocation, 'street_number') && safeGet(userLocation, 'street')) {
        streetAddress = `${userLocation.street_number} ${userLocation.street}`;
      }
      
      // Build location context
      const locationContext = `
      The user is currently located at ${safeGet(userLocation, 'precise_location_string') || `${safeGet(userLocation, 'city') || 'an area'}, ${safeGet(userLocation, 'country') || ''}`}.
      IMPORTANT: Only mention the user's location if they specifically ask about nearby destinations, local attractions, or travel from their location.
      Don't force location references into every response.
      If they ask about general travel topics not specific to their location, don't refer to their location.
      
      If the user requests trip planning FROM their current location, use these location details:
      - Exact location/POI: ${safeGet(userLocation, 'exactLocation') || 'Not available'}
      - Premise: ${safeGet(userLocation, 'premise') || 'Not available'}
      - Street address: ${streetAddress}
      - Neighborhood: ${safeGet(userLocation, 'sublocality') || 'Not available'}
      - City: ${safeGet(userLocation, 'city') || 'Not available'}
      - State/Region: ${safeGet(userLocation, 'state') || 'Not available'}
      - Country: ${safeGet(userLocation, 'country') || 'Not available'}
      
      When suggesting nearby destinations, consider:
      - Their specific location context for more personalized recommendations
      - Local transportation options from their exact location
      - Current season and weather at their location
      - Time of day if they're looking for immediate activities
      `;
      
      return baseContext + locationContext;
    }
    
    return baseContext;
  };
  
  // Call Gemini API for chat responses
  const callGeminiAPI = async (userMessage) => {
    const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
    
    // Get the travel context with location awareness
    const travelContext = getTravelContext();
    
    // Check if the user message is location-relevant
    const lowerMsg = userMessage.toLowerCase();
    const locationTerms = ['near me', 'nearby', 'local', 'around here', 'from here', 'my city', 'my location', 'close to me'];
    const isLocationRelevant = locationTerms.some(term => lowerMsg.includes(term));
    
    // Include location information only if relevant
    let locationInfo = '';
    if (userLocation.lat && userLocation.lng && isLocationRelevant) {
      locationInfo = `User's location: ${userLocation.formatted_address || `${userLocation.city}, ${userLocation.country}`}`;
    }
    
    // Combine context with user message
    const prompt = `${travelContext}\n${locationInfo}\n\nUser: ${userMessage}\n\nEv.ai:`;
    
    // Request data
    const requestData = {
      contents: [{
        parts: [{ text: prompt }]
      }]
    };
    
    try {
      // Make the API call
      const response = await fetch(`${apiUrl}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });
      
      // Check if the request was successful
      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
      }
      
      // Parse and return the response
      const data = await response.json();
      
      // Extract the response text
      if (data.candidates && data.candidates.length > 0) {
        const textContent = data.candidates[0].content.parts[0].text;
        return textContent;
      } else {
        throw new Error('No response content found');
      }
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      return "I'm having trouble connecting to my knowledge base right now. Could you try asking again in a moment? 🔄";
    }
  };
  
  // Format message text with basic markdown
  const formatMessageText = (text) => {
    // Handle line breaks
    let formattedText = text.replace(/\n/g, '<br>');
    
    // Handle bullet lists
    formattedText = formattedText.replace(/(?:<br>|^)([-•]) (.*?)(?=<br>|$)/g, '<li>$2</li>');
    
    // Wrap lists in <ul> tags
    if (formattedText.includes('<li>')) {
      formattedText = formattedText.replace(/(<li>.*?<\/li>)+/g, match => `<ul>${match}</ul>`);
    }
    
    // Handle bold text
    formattedText = formattedText.replace(/(\*\*|__)(.*?)\1/g, '<strong>$2</strong>');
    
    // Handle italic text
    formattedText = formattedText.replace(/(\*|_)([^*_]+)\1/g, '<em>$2</em>');
    
    return formattedText;
  };
  
  // Add a message to the chat
  const addMessage = (text, sender) => {
    const newMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text,
      sender,
      time: getCurrentTime()
    };
    
    setMessages(prevMessages => [...prevMessages, newMessage]);
  };
  
  // Process user input and get AI response
  const processUserInput = async (userInput) => {
    // Add user message to chat
    addMessage(userInput, 'user');
    
    // Show typing indicator
    setIsTyping(true);
    
    try {
      // Get response from Gemini API
      const aiResponse = await callGeminiAPI(userInput);
      
      // Hide typing indicator
      setIsTyping(false);
      
      // Add AI response to chat
      addMessage(aiResponse, 'bot');
      
      // Add new quick reply options based on the conversation
      setTimeout(() => {
        addQuickReplies(userInput);
      }, 500);
    } catch (error) {
      // Hide typing indicator
      setIsTyping(false);
      
      // Show error message
      addMessage("I'm having trouble connecting right now. Please try again later.", 'bot');
      console.error('Error processing message:', error);
    }
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (input.trim()) {
      processUserInput(input.trim());
      setInput('');
    }
  };
  
  // Add emoji to input
  const addEmoji = () => {
    setInput(prev => prev + ' 😊');
    // Focus on input after adding emoji
    document.querySelector('.chatbot-input').focus();
  };
  
  // Function to get fresh suggestions on page reload
  const getPageReloadSuggestions = () => {
    // Travel themes for different suggestion categories
    const themes = {
      adventure: [
        "Tell me about adventure travel in Patagonia",
        "Best places for zip lining",
        "Extreme sports destinations",
        "Mountain climbing for beginners"
      ],
      relaxation: [
        "Top all-inclusive resorts worldwide",
        "Best spa retreats in Europe",
        "Quiet beach destinations",
        "Relaxing countryside getaways"
      ],
      culture: [
        "UNESCO world heritage sites to visit",
        "Best museums in the world",
        "Food tours in Italy",
        "Cultural festivals this year"
      ],
      nature: [
        "Amazing national parks to visit",
        "Best wildlife safaris",
        "Tropical rainforest destinations",
        "Most beautiful hiking trails"
      ],
      unique: [
        "Unusual accommodations around the world",
        "Off-the-beaten-path destinations",
        "Strangest festivals globally",
        "Underwater hotels and restaurants"
      ],
      trending: [
        "Up and coming travel destinations 2025",
        "Travel trends this year",
        "Most Instagrammable places",
        "Destinations everyone's talking about"
      ],
      practical: [
        "Tips for booking cheap flights",
        "How to pack efficiently",
        "Travel insurance explained",
        "Money-saving travel hacks"
      ],
      seasonal: {
        winter: [
          "Best winter sun destinations",
          "Top ski resorts worldwide",
          "Christmas markets to visit",
          "Winter festivals not to miss"
        ],
        spring: [
          "Cherry blossom destinations",
          "Spring break ideas",
          "Easter holiday destinations",
          "Flower festivals worldwide"
        ],
        summer: [
          "Best beaches for summer",
          "Summer family vacation ideas",
          "Music festivals this summer",
          "Beat the heat destinations"
        ],
        fall: [
          "Fall foliage destinations",
          "Harvest festivals to visit",
          "Autumn city breaks",
          "Wine regions to visit in fall"
        ]
      }
    };

    // Get current season
    const currentMonth = new Date().getMonth();
    let currentSeason;
    
    if (currentMonth >= 11 || currentMonth <= 1) {
      currentSeason = 'winter';
    } else if (currentMonth >= 2 && currentMonth <= 4) {
      currentSeason = 'spring';
    } else if (currentMonth >= 5 && currentMonth <= 7) {
      currentSeason = 'summer';
    } else {
      currentSeason = 'fall';
    }
    
    // Function to get random items from array that haven't been used recently
    const getRandomFreshItems = (array, count) => {
      const freshItems = array.filter(item => !usedSuggestions.has(item));
      
      // If we've used all items, reset
      if (freshItems.length < count) {
        array.forEach(item => usedSuggestions.delete(item));
        return getRandomItems(array, count);
      }
      
      return getRandomItems(freshItems, count);
    };
    
    // Function to get random items from array
    const getRandomItems = (array, count) => {
      const shuffled = [...array].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, count);
      
      // Add selected items to used set
      selected.forEach(item => usedSuggestions.add(item));
      
      return selected;
    };
    
    // Select random categories
    const allCategories = ['adventure', 'relaxation', 'culture', 'nature', 'unique', 'trending', 'practical'];
    const numCategories = Math.floor(Math.random() * 2) + 2; // 2-3 categories
    const selectedCategories = getRandomItems(allCategories, numCategories);
    
    // Get suggestions
    const suggestions = [];
    
    // Get one suggestion from each selected category
    selectedCategories.forEach(category => {
      suggestions.push(...getRandomFreshItems(themes[category], 1));
    });
    
    // Add one seasonal suggestion
    suggestions.push(...getRandomFreshItems(themes.seasonal[currentSeason], 1));
    
    // If there's space for one more suggestion, add another random one
    if (suggestions.length < 4) {
      const randomCategory = getRandomItems(allCategories, 1)[0];
      suggestions.push(...getRandomFreshItems(themes[randomCategory], 1));
    }
    
    return suggestions;
  };
  
  // Add quick replies
  const addQuickReplies = (userMessage = '', customSuggestions = null) => {
    // Default inspirational phrases
    const inspirationalPhrases = [
      "Inspire me where to go",
      "Find family hotels in Dubai",
      "Build a 7 day island hopping trip",
      "I want to do a family safari",
      "Vacation spots with sandy beaches",
      "Where to go to see the northern lights",
      "Plan me a road trip in the US",
      "Best destinations for solo travelers"
    ];

    // Location-aware inspirational phrases
    const locationPhrases = userLocation.city ? [
      `Weekend getaways from ${userLocation.city}`,
      `Best time to visit ${userLocation.city}`,
      `Flights from ${userLocation.city} to popular destinations`,
      `Hidden gems in ${userLocation.city}`,
      `Day trips from ${userLocation.city}`,
      `${userLocation.city} travel tips`,
      `Best restaurants in ${userLocation.city}`,
      `${userLocation.city} to popular beach destinations`
    ] : [];

    // Season-specific suggestions
    const currentMonth = new Date().getMonth();
    const seasonalSuggestions = [];
    
    // Winter (Northern Hemisphere)
    if (currentMonth >= 11 || currentMonth <= 1) {
      seasonalSuggestions.push(
        "Winter getaway destinations",
        "Best ski resorts",
        "Winter sun destinations", 
        "Christmas markets to visit"
      );
    } 
    // Spring
    else if (currentMonth >= 2 && currentMonth <= 4) {
      seasonalSuggestions.push(
        "Spring break destinations",
        "Cherry blossom viewing spots",
        "Spring festivals worldwide",
        "Shoulder season travel deals"
      );
    }
    // Summer
    else if (currentMonth >= 5 && currentMonth <= 7) {
      seasonalSuggestions.push(
        "Best beach destinations",
        "Family summer vacation ideas",
        "Music festivals this summer",
        "Beat the heat destinations"
      );
    }
    // Fall
    else {
      seasonalSuggestions.push(
        "Fall foliage destinations",
        "Harvest festivals to visit",
        "Best places for autumn travel",
        "Off-season travel deals"
      );
    }

    // Function to select random phrases
    const getRandomPhrases = (phrases, count = 2) => {
      const shuffled = [...phrases].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, count);
    };

    // If custom suggestions are provided, use those
    if (customSuggestions) {
      return customSuggestions;
    }

    // Determine which quick replies to show based on user message and context
    let replyOptions = [];
    const lowerMsg = userMessage.toLowerCase();

    // Location-specific queries
    if (lowerMsg.includes('near me') || lowerMsg.includes('local') || 
        lowerMsg.includes('my location') || lowerMsg.includes('nearby') ||
        lowerMsg.includes('around here') || lowerMsg.includes('in this area')) {
      
      if (!userLocation.lat || !userLocation.lng) {
        // User hasn't shared location but wants local recommendations
        replyOptions = ['Share my location', 'Popular destinations', 'Travel tips', 'How to find local experiences'];
      } else {
        // User has shared location and wants local recommendations
        replyOptions = [
          `Things to do in ${userLocation.city || 'my area'}`,
          `Hidden gems in ${userLocation.city || 'my area'}`,
          `Day trips from ${userLocation.city || 'here'}`,
          `Local cuisine in ${userLocation.city || 'this region'}`
        ];
      }
    }
    // Destination discovery queries
    else if (lowerMsg.includes('destination') || lowerMsg.includes('where') || 
        lowerMsg.includes('place') || lowerMsg.includes('location') || 
        lowerMsg.includes('country') || lowerMsg.includes('city')) {
      
      // If we know their location, offer some location-relative suggestions but not all
      if (userLocation.city && Math.random() < 0.5) { // Only 50% of the time
        replyOptions = [
          `Destinations similar to ${userLocation.city}`, 
          'Trending destinations 2025',
          'Hidden gem destinations',
          'Underrated cities to visit'
        ];
      } else {
        replyOptions = [
          'Best family destinations', 
          'Trending destinations 2025', 
          'Family-friendly destinations', 
          'Off-the-beaten-path places'
        ];
      }
    }
    // Budget and pricing queries
    else if (lowerMsg.includes('price') || lowerMsg.includes('cost') || 
             lowerMsg.includes('budget') || lowerMsg.includes('expensive') || 
             lowerMsg.includes('cheap') || lowerMsg.includes('affordable')) {
      
      replyOptions = [
        'Budget destinations 2025', 
        'Luxury for less tips', 
        'All-inclusive value deals', 
        'How to find flight deals'
      ];
    }
    // Default options or new conversation
    else {
      // Check if it's a new conversation (no user message)
      if (!userMessage) {
        // Blend seasonal and inspirational phrases, with location only sometimes
        if (userLocation.city && locationPhrases.length > 0 && Math.random() < 0.3) {
          // Only occasionally mix in location-specific options (30% of the time)
          const randomLocationPhrases = getRandomPhrases(locationPhrases, 1);
          const randomSeasonalPhrases = getRandomPhrases(seasonalSuggestions, 1);
          const randomInspirationPhrases = getRandomPhrases(inspirationalPhrases, 2);
          replyOptions = [...randomLocationPhrases, ...randomSeasonalPhrases, ...randomInspirationPhrases];
        } else {
          // Most of the time, don't focus on location
          const randomSeasonalPhrases = getRandomPhrases(seasonalSuggestions, 2);
          const randomInspirationPhrases = getRandomPhrases(inspirationalPhrases, 2);
          replyOptions = [...randomSeasonalPhrases, ...randomInspirationPhrases];
        }
      } else {
        // Generic options but include location sharing if location not yet known
        if (!userLocation.lat || !userLocation.lng) {
          replyOptions = ['Share my location', 'Popular destinations', 'Travel trends 2025', 'Trip planning tips'];
        } else {
          // User has location but message doesn't fit other categories
          replyOptions = [
            'Current travel deals',
            'Popular destinations 2025',
            'Travel inspiration',
            'Trip planning assistance'
          ];
        }
      }
    }
    
    return replyOptions;
  };

  return (
    <>
      {/* Chatbot Toggle Button */}
      <button 
        className={`chatbot-toggle ${isChatbotActive ? 'active' : ''}`} 
        onClick={() => setIsChatbotActive(prev => !prev)}
      >
        <IoGlobeOutline />
        {notificationActive && !isChatbotActive && <span className="notification-badge"></span>}
      </button>
      
      {/* Chatbot Container */}
      <div 
        ref={chatbotRef} 
        className={`chatbot-container ${isChatbotActive ? 'active' : ''}`}
      >
        <div className="chatbot-header">
          <h3>Travel Assistant</h3>
          <button className="close-btn" onClick={() => setIsChatbotActive(false)}>×</button>
        </div>
        
        <div className="chatbot-messages">
          {messages.map(message => (
            <div key={message.id} className={`message-item ${message.sender}`}>
              <div className="message-avatar">
                {message.sender === 'bot' ? <IoGlobeOutline /> : <IoPersonOutline />}
              </div>
              <div className="message-content">
                <p dangerouslySetInnerHTML={{ __html: formatMessageText(message.text) }}></p>
                <div className="message-time">{message.time}</div>
              </div>
            </div>
          ))}
          
          {/* Typing indicator */}
          {isTyping && (
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          )}
          
          {/* Quick replies */}
          <div className="quick-replies">
            {addQuickReplies().map((option, index) => (
              <button 
                key={`quick-reply-${index}-${Date.now()}`} 
                className="quick-reply-btn"
                onClick={() => {
                  if (option === 'Share my location') {
                    requestUserLocation();
                  } else {
                    processUserInput(option);
                  }
                }}
              >
                {option}
              </button>
            ))}
          </div>
          
          <div ref={messagesEndRef} />
        </div>
        
        <form ref={chatFormRef} className="chatbot-input-form" onSubmit={handleSubmit}>
          <input
            type="text"
            className="chatbot-input"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="button" className="emoji-picker-btn" onClick={addEmoji}>
            <IoHappyOutline />
          </button>
          <button type="button" className="location-btn" onClick={requestUserLocation}>
            <IoLocationOutline />
          </button>
          <button type="submit" className="send-btn">Send</button>
        </form>
      </div>
    </>
  );
});

// Add display name for debugging
Chatbot.displayName = 'Chatbot';

export default Chatbot;