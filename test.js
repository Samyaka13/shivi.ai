'use strict';

const chatbotToggle = document.querySelector('.chatbot-toggle');
const chatbotContainer = document.querySelector('.chatbot-container');

if (chatbotToggle && chatbotContainer) {
  console.log("Chatbot elements found");
  chatbotToggle.addEventListener('click', function() {
    console.log("Toggle clicked");
    this.classList.toggle('active');
    chatbotContainer.classList.toggle('active');
  });
} else {
  console.log("Chatbot elements not found", {
    toggle: chatbotToggle,
    container: chatbotContainer
  });
}
chatbotToggle.addEventListener('click', function() {
    this.classList.toggle('active');
    chatbotContainer.classList.toggle('active');
  });
// Event listener for chatbot toggle (fixing the error at line 19 - duplicated event listener)
if (chatbotToggle) { // Wrapping in conditional to avoid errors if element doesn't exist
  chatbotToggle.addEventListener('click', function() {
    this.classList.toggle('active');
    chatbotContainer.classList.toggle('active');
  });
}


// Store conversation suggestions history to avoid repetition
let usedSuggestions = new Set();

// Wait for DOM to be fully loaded before accessing elements
document.addEventListener('DOMContentLoaded', function() {
  // Check if this is a page reload or first load
  const lastLoadTime = localStorage.getItem('evai_last_load_time');
  const currentTime = new Date().getTime();
  localStorage.setItem('evai_last_load_time', currentTime);
  
  // If it's a reload (within last hour), mark it for fresh suggestions
  const isReload = lastLoadTime && (currentTime - lastLoadTime < 3600000);
  
  initChatbot(isReload);
});

function initChatbot(isReload = false) {
  // API Keys - Replace these with your actual API keys
  const GEMINI_API_KEY = 'AIzaSyBqZsyWeXFBEO72704FcoYFM_YjIVS0QeM';
  const MAPS_API_KEY = 'AIzaSyBbSshnFwPb50Tj--k7-W8wzqP90qORGKA'; // Replace with your Google Maps API key
  
  // User location data
  let userLocation = {
    lat: null,
    lng: null,
    city: null,
    country: null,
    formatted_address: null
  };
  
  // Flag to track if location message has been shown
  let locationMessageShown = false;
  
  // DOM Elements
  const chatbotContainer = document.querySelector('.chatbot-container');
  const chatbotToggle = document.querySelector('.chatbot-toggle');
  const chatbotMessages = document.querySelector('.chatbot-messages');
  const chatbotForm = document.querySelector('.chatbot-input-form');
  const chatbotInput = document.querySelector('.chatbot-input');
  const quickReplyButtons = document.querySelectorAll('.quick-reply-btn');
  const notificationBadge = document.querySelector('.notification-badge');
  const emojiButton = document.querySelector('.emoji-picker-btn');
  const locationButton = document.createElement('button');
  
  // Add location button to the chatbot interface
  function addLocationButton() {
    locationButton.className = 'location-btn';
    // locationButton.innerHTML = '<ion-icon name="location-outline"></ion-icon>';
    locationButton.title = 'Share your location';
    
    // Insert button next to emoji button
    if (emojiButton && emojiButton.parentNode) {
      emojiButton.parentNode.insertBefore(locationButton, emojiButton.nextSibling);
    } else if (chatbotForm) {
      // Fallback - add to form
      chatbotForm.appendChild(locationButton);
    }
    
    // Add event listener
    locationButton.addEventListener('click', requestUserLocation);
  }
  
  // Set current time for messages
  function getCurrentTime() {
    const now = new Date();
    return now.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
  }

  // Initialize the chat interface
  function initInterface() {
    // Set current time for the welcome message
    document.querySelectorAll('.message-time').forEach(timeElement => {
      timeElement.textContent = getCurrentTime();
    });
    
    // Show notification badge when chatbot is closed
    if (!chatbotContainer.classList.contains('active')) {
      notificationBadge.classList.add('active');
    }
    
    // Add location button
    addLocationButton();
    
    // Automatically request geolocation on start
    setTimeout(() => {
      requestUserLocation();
    }, 1500); // Short delay to allow welcome message to appear first
  }

  // Request user's geolocation
  function requestUserLocation() {
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
  }
  
  
  async function getLocationDetails(position) {
    console.log("Raw coordinates received:", {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      timestamp: new Date(position.timestamp).toISOString()
    });
  
    // Store the raw coordinates
    userLocation.lat = position.coords.latitude;
    userLocation.lng = position.coords.longitude;
    
    try {
      // Construct and log the API URL before making the request
      const apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${userLocation.lat},${userLocation.lng}&result_type=street_address|point_of_interest|premise|subpremise&key=${MAPS_API_KEY}`;
      console.log("Making Google Maps Geocoding API request with URL:", apiUrl.replace(MAPS_API_KEY, "API_KEY_HIDDEN"));
      
      // Request with high result_type parameter to get more detailed results
      const response = await fetch(apiUrl);
      
      // Log response status
      console.log("Google Maps API response status:", response.status, response.statusText);
      
      if (!response.ok) {
        throw new Error(`Failed to get location details: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("Google Maps API response status:", data.status);
      
      // Log the first result to help with debugging
      if (data.results && data.results.length > 0) {
        console.log("First result type:", data.results[0].types);
        console.log("First result formatted address:", data.results[0].formatted_address);
      } else {
        console.warn("No results returned from Google Maps API");
      }
      
      if (data.status === 'OK' && data.results && data.results.length > 0) {
        // Store all results for filtering
        userLocation.allResults = data.results;
        console.log(`Received ${data.results.length} location results from API`);
        
        // Extract the most detailed location first (usually first result is most specific)
        const mostDetailedResult = data.results[0];
        userLocation.formatted_address = mostDetailedResult.formatted_address;
        
        // Extract detailed components
        const addressComponents = mostDetailedResult.address_components;
        console.log("Processing address components:", addressComponents);
        
        // Initialize location details
        userLocation.exactLocation = null;
        userLocation.premise = null;
        userLocation.street_number = null;
        userLocation.street = null;
        userLocation.sublocality = null;
        userLocation.city = null;
        userLocation.state = null;
        userLocation.country = null;
        
        // Extract all relevant address components
        console.log("Extracting address components...");
        for (const component of addressComponents) {
          console.log(`Processing component: ${component.long_name}, types: ${component.types.join(', ')}`);
          
          if (component.types.includes('point_of_interest')) {
            userLocation.exactLocation = component.long_name;
            console.log(`Found point of interest: ${component.long_name}`);
          }
          if (component.types.includes('premise')) {
            userLocation.premise = component.long_name;
            console.log(`Found premise: ${component.long_name}`);
          }
          if (component.types.includes('street_number')) {
            userLocation.street_number = component.long_name;
            console.log(`Found street number: ${component.long_name}`);
          }
          if (component.types.includes('route')) {
            userLocation.street = component.long_name;
            console.log(`Found street: ${component.long_name}`);
          }
          if (component.types.includes('sublocality_level_1')) {
            userLocation.sublocality = component.long_name;
            console.log(`Found sublocality: ${component.long_name}`);
          }
          if (component.types.includes('locality')) {
            userLocation.city = component.long_name;
            console.log(`Found city: ${component.long_name}`);
          }
          if (component.types.includes('administrative_area_level_1')) {
            userLocation.state = component.long_name;
            console.log(`Found state: ${component.long_name}`);
          }
          if (component.types.includes('country')) {
            userLocation.country = component.long_name;
            console.log(`Found country: ${component.long_name}`);
          }
        }
        
        // Check if we need to look at other results for specific point_of_interest or premise
        if (!userLocation.exactLocation && !userLocation.premise) {
          console.log("No exact location or premise found in first result, checking additional results...");
          
          // Look through other results to find a point of interest or premise name
          for (const result of data.results) {
            const types = result.types;
            console.log(`Checking result with types: ${types.join(', ')}`);
            
            // If this result is a point of interest or premise, use its formatted address
            if (types.includes('point_of_interest') || types.includes('premise') || types.includes('subpremise')) {
              console.log("Found a relevant result type, checking components...");
              
              // Extract from address components
              for (const component of result.address_components) {
                if (component.types.includes('point_of_interest') || component.types.includes('premise')) {
                  userLocation.exactLocation = component.long_name;
                  console.log(`Found specific location from additional results: ${component.long_name}`);
                  break;
                }
              }
              
              // If we found a specific location, we can break out
              if (userLocation.exactLocation) {
                console.log("Breaking out of additional results loop - found what we needed");
                break;
              }
            }
          }
        }
        
        // Construct the most precise location string possible
        console.log("Building precise location string...");
        let locationString = '';
        
        if (userLocation.exactLocation) {
          // If we have a specific building or landmark name (like "Birla Aurora")
          locationString = userLocation.exactLocation;
          console.log(`Using exact location as base: ${locationString}`);
          
          if (userLocation.sublocality && userLocation.city) {
            locationString += `, ${userLocation.sublocality}, ${userLocation.city}`;
          } else if (userLocation.city) {
            locationString += `, ${userLocation.city}`;
          }
        } else if (userLocation.premise) {
          // If we have a premise but not a specific POI name
          locationString = userLocation.premise;
          console.log(`Using premise as base: ${locationString}`);
          
          if (userLocation.street) {
            locationString += `, ${userLocation.street}`;
          }
          
          if (userLocation.sublocality && userLocation.city) {
            locationString += `, ${userLocation.sublocality}, ${userLocation.city}`;
          } else if (userLocation.city) {
            locationString += `, ${userLocation.city}`;
          }
        } else if (userLocation.street_number && userLocation.street) {
          // If we have a street address
          locationString = `${userLocation.street_number} ${userLocation.street}`;
          console.log(`Using street address as base: ${locationString}`);
          
          if (userLocation.sublocality && userLocation.city) {
            locationString += `, ${userLocation.sublocality}, ${userLocation.city}`;
          } else if (userLocation.city) {
            locationString += `, ${userLocation.city}`;
          }
        } else if (userLocation.city && userLocation.country) {
          // Fallback to city, country
          locationString = `${userLocation.city}, ${userLocation.country}`;
          console.log(`Using city/country as fallback: ${locationString}`);
        } else {
          // Ultimate fallback
          locationString = userLocation.formatted_address;
          console.log(`Using formatted address as final fallback: ${locationString}`);
        }
        
        userLocation.precise_location_string = locationString;
        console.log(`Final precise location string: ${locationString}`);
        
        // Log a structured debug object (without modifying the original structure)
        const locationDebugInfo = {
          coordinates: {
            lat: userLocation.lat,
            lng: userLocation.lng
          },
          formattedAddress: userLocation.formatted_address,
          preciseString: locationString,
          components: {
            exactLocation: userLocation.exactLocation,
            premise: userLocation.premise,
            streetNumber: userLocation.street_number,
            street: userLocation.street,
            sublocality: userLocation.sublocality,
            city: userLocation.city,
            state: userLocation.state,
            country: userLocation.country
          }
        };
        console.log("Location data summary:", locationDebugInfo);
        
        // Only show location message if it hasn't been shown before
        if (!locationMessageShown) {
          const locationMessage = `I see you're at ${locationString}. I'll tailor travel recommendations when relevant!`;
          console.log(`Showing location message to user: ${locationMessage}`);
          addMessage(locationMessage, 'bot');
          locationMessageShown = true;
        } else {
          console.log("Location message already shown, skipping");
        }
        
        // Add relevant quick replies based on location
        console.log("Adding location-relevant quick replies");
        addQuickReplies('');
      } else {
        console.error(`API returned status: ${data.status}, with ${data.results ? data.results.length : 0} results`);
        throw new Error(`Unable to determine your location from coordinates: ${data.status}`);
      }
    } catch (error) {
      console.error('Error getting location details:', error);
      console.error(error.stack);
      addMessage("I couldn't determine your exact location, but I can still help with your travel plans!", 'bot');
    }
    
    // Final debug logging
    console.log("==== Location Summary ====");
    console.log(`The user is currently in ${userLocation.city || 'an unknown city'}`);
    console.log(`User's exact location: ${userLocation.exactLocation || 'Not available'}, ${userLocation.city || ''}, ${userLocation.country || ''}`);
    console.log(`User's precise location: ${userLocation.precise_location_string || 'Location not available'}`);
    console.log("==== Location Processing Complete ====");
    
    // No return statement to maintain original function behavior
  }
  // Handle location errors
  function handleLocationError(error) {
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
  }
  // Function to get fresh suggestions on page reload
  function getPageReloadSuggestions() {
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

    // Get current season for seasonal suggestions
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
    function getRandomFreshItems(array, count) {
      const freshItems = array.filter(item => !usedSuggestions.has(item));
      
      // If we've used all items, reset
      if (freshItems.length < count) {
        array.forEach(item => usedSuggestions.delete(item));
        return getRandomItems(array, count);
      }
      
      return getRandomItems(freshItems, count);
    }
    
    // Function to get random items from array
    function getRandomItems(array, count) {
      const shuffled = [...array].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, count);
      
      // Add selected items to used set
      selected.forEach(item => usedSuggestions.add(item));
      
      return selected;
    }
    
    // Select random categories to display (pick 3-4 categories)
    const allCategories = ['adventure', 'relaxation', 'culture', 'nature', 'unique', 'trending', 'practical'];
    const numCategories = Math.floor(Math.random() * 2) + 3; // Random number between 3-4
    const selectedCategories = getRandomItems(allCategories, numCategories);
    
    // Always include seasonal suggestions
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
  }


  
  function getTravelContext() {
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
    
    // Only include location context if available AND it might be relevant
    try {
      if (userLocation && userLocation.lat && userLocation.lng) {
        // Safely access location properties with null checks
        const safeGet = (obj, prop) => {
          try {
            return obj && typeof obj[prop] !== 'undefined' ? obj[prop] : null;
          } catch (e) {
            console.error(`Error accessing ${prop}:`, e);
            return null;
          }
        };
        
        // Format street address with error handling
        let streetAddress = 'Not available';
        try {
          if (safeGet(userLocation, 'street_number') && safeGet(userLocation, 'street')) {
            streetAddress = `${userLocation.street_number} ${userLocation.street}`;
          }
        } catch (e) {
          console.error('Error formatting street address:', e);
        }
        
        // Build location context with error handling for each property
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
    } catch (error) {
      console.error('Error in location context generation:', error);
      // Fallback to base context if any error occurs
    }
    
    return baseContext;
  }

  
  // Function to call Gemini API for chat responses
  async function callGeminiAPI(userMessage) {
    const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
    
    // Get the travel context with location awareness if available
    const travelContext = getTravelContext();
    
    // Check if the user message is location-relevant to include location info
    const lowerMsg = userMessage.toLowerCase();
    const locationTerms = ['near me', 'nearby', 'local', 'around here', 'from here', 'my city', 'my location', 'close to me'];
    const isLocationRelevant = locationTerms.some(term => lowerMsg.includes(term));
    
    // Include location information in the prompt only if relevant
    let locationInfo = '';
    if (userLocation.lat && userLocation.lng && isLocationRelevant) {
      locationInfo = `User's location: ${userLocation.formatted_address || `${userLocation.city}, ${userLocation.country}`}`;
    }
    
    // Combine the travel context with the user message and location (if relevant)
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
  }

  // Function to format message text with basic markdown
  function formatMessageText(text) {
    // Handle line breaks
    let formattedText = text.replace(/\n/g, '<br>');
    
    // Handle bullet lists (lines starting with • or -)
    formattedText = formattedText.replace(/(?:<br>|^)([-•]) (.*?)(?=<br>|$)/g, '<li>$2</li>');
    
    // Wrap lists in <ul> tags if there are list items
    if (formattedText.includes('<li>')) {
      // Find consecutive list items and wrap them in <ul>
      formattedText = formattedText.replace(/(<li>.*?<\/li>)+/g, match => `<ul>${match}</ul>`);
    }
    
    // Handle bold text (between ** or __)
    formattedText = formattedText.replace(/(\*\*|__)(.*?)\1/g, '<strong>$2</strong>');
    
    // Handle italic text (between * or _)
    formattedText = formattedText.replace(/(\*|_)(.*?)\1/g, '<em>$2</em>');
    
    return formattedText;
  }

  // Function to add a message to the chat
  function addMessage(text, sender) {
    const messageItem = document.createElement('div');
    messageItem.classList.add('message-item', sender);
    
    const avatarIcon = sender === 'bot' ? 'globe-outline' : 'person-outline';
    const formattedText = formatMessageText(text);
    
    messageItem.innerHTML = `
      <div class="message-avatar">
        <ion-icon name="${avatarIcon}"></ion-icon>
      </div>
      <div class="message-content">
        <p>${formattedText}</p>
        <div class="message-time">${getCurrentTime()}</div>
      </div>
    `;
    
    chatbotMessages.appendChild(messageItem);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    
    return messageItem;
  }
  
  // Function to show typing indicator
  function showTypingIndicator() {
    // Remove existing typing indicator if present
    hideTypingIndicator();
    
    const typingIndicator = document.createElement('div');
    typingIndicator.classList.add('typing-indicator');
    typingIndicator.id = 'typing-indicator';
    typingIndicator.innerHTML = `
      <span></span>
      <span></span>
      <span></span>
    `;
    chatbotMessages.appendChild(typingIndicator);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
  }
  
  // Function to hide typing indicator
  function hideTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
      typingIndicator.remove();
    }
  }

  // Enhanced function to add quick replies with smarter location awareness and conversation context
  function addQuickReplies(userMessage = '') {
    // Remove existing quick replies
    const existingReplies = document.querySelector('.quick-replies');
    if (existingReplies) {
      existingReplies.remove();
    }

    const quickRepliesDiv = document.createElement('div');
    quickRepliesDiv.classList.add('quick-replies');

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

    // Location-aware inspirational phrases - more specific to user's exact location
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

    // Season-specific suggestions based on current month
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
    function getRandomPhrases(phrases, count = 2) {
      const shuffled = [...phrases].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, count);
    }

    // Determine which quick replies to show based on user message and conversation context
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
          `Tell me about ${userLocation.city || 'an unknown city'}`, 
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
    // Booking and reservation queries
    else if (lowerMsg.includes('book') || lowerMsg.includes('reservation') || 
             lowerMsg.includes('payment') || lowerMsg.includes('confirm') || 
             lowerMsg.includes('cancel') || lowerMsg.includes('deposit')) {
      
      replyOptions = [
        'Best time to book flights', 
        'Hotel booking tips', 
        'Understanding cancellation policies', 
        'Should I get travel insurance?'
      ];
    }
    // Transportation queries
    else if (lowerMsg.includes('flight') || lowerMsg.includes('airplane') || 
             lowerMsg.includes('train') || lowerMsg.includes('car') || 
             lowerMsg.includes('transfer') || lowerMsg.includes('transport')) {
      
      replyOptions = [
        'Best flight search engines', 
        'Train vs. plane in Europe', 
        'Airport transfer options', 
        'Road trip planning tips'
      ];
    }
    // Weather and season queries
    else if (lowerMsg.includes('weather') || lowerMsg.includes('season') || 
             lowerMsg.includes('when to go') || lowerMsg.includes('climate') || 
             lowerMsg.includes('temperature') || lowerMsg.includes('rainy')) {
      
      replyOptions = [
        'Weather planning resources', 
        'Avoiding rainy seasons', 
        'Current global weather trends',
        'Packing for unpredictable weather'
      ];
    }
    // Activity-specific queries (new category)
    else if (lowerMsg.includes('beach') || lowerMsg.includes('hiking') || 
             lowerMsg.includes('food') || lowerMsg.includes('museum') || 
             lowerMsg.includes('culture') || lowerMsg.includes('adventure')) {
      
      const activity = lowerMsg.includes('beach') ? 'beach' :
                      lowerMsg.includes('hiking') ? 'hiking' :
                      lowerMsg.includes('food') ? 'food' :
                      lowerMsg.includes('museum') ? 'museum' :
                      lowerMsg.includes('culture') ? 'cultural' : 'adventure';
      
      replyOptions = [
        `World's best ${activity} destinations`,
        `${activity} travel planning tips`,
        `Unusual ${activity} experiences`,
        `${activity} travel essentials`
      ];
    }
    // Family travel (new category)
    else if (lowerMsg.includes('family') || lowerMsg.includes('kid') || 
             lowerMsg.includes('child') || lowerMsg.includes('baby') || 
             lowerMsg.includes('teen')) {
      
      replyOptions = [
        'Family-friendly destinations',
        'Traveling with toddlers tips',
        'Teen-approved vacations',
        'Multi-generational trip ideas'
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

    // Create and append quick reply buttons
    replyOptions.forEach(option => {
      const button = document.createElement('button');
      button.classList.add('quick-reply-btn');
      button.textContent = option;
      button.addEventListener('click', function() {
        // Special handling for "Share my location" button
        if (this.textContent === 'Share my location') {
          requestUserLocation();
        } else {
          processUserInput(this.textContent);
        }
      });
      quickRepliesDiv.appendChild(button);
    });

    chatbotMessages.appendChild(quickRepliesDiv);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
  }

  // Function to process user input and get AI response
  async function processUserInput(userInput) {
    // Remove existing quick replies when user sends a message
    const existingReplies = document.querySelector('.quick-replies');
    if (existingReplies) {
      existingReplies.remove();
    }
    
    // Add user message to chat
    addMessage(userInput, 'user');
    
    // Show typing indicator
    showTypingIndicator();
    
    try {
      // Get response from Gemini API
      const aiResponse = await callGeminiAPI(userInput);
      
      // Hide typing indicator
      hideTypingIndicator();
      
      // Add AI response to chat
      addMessage(aiResponse, 'bot');
      
      // Add new quick reply options based on the conversation
      setTimeout(() => {
        addQuickReplies(userInput);
      }, 500);
    } catch (error) {
      // Hide typing indicator
      hideTypingIndicator();
      
      // Show error message
      addMessage("I'm having trouble connecting right now. Please try again later.", 'bot');
      console.error('Error processing message:', error);
    }
  }

  // Set up emoji picker button
  if (emojiButton) {
    emojiButton.addEventListener('click', function() {
      // In a real implementation, you would show an emoji picker
      // For this demo, let's just add a simple emoji to the input
      chatbotInput.value += ' 😊';
      chatbotInput.focus();
    });
  }

  // Set up quick reply buttons
  if (quickReplyButtons) {
    quickReplyButtons.forEach(button => {
      button.addEventListener('click', function() {
        processUserInput(this.textContent);
      });
    });
  }

  // Event Listeners
  if (chatbotToggle) {
    chatbotToggle.addEventListener('click', function() {
      this.classList.toggle('active');
      chatbotContainer.classList.toggle('active'); 
      
      // Hide notification badge when opened
      if (chatbotContainer.classList.contains('active')) {
        notificationBadge.classList.remove('active');
        chatbotInput.focus();
      }
    });
  }

  if (chatbotForm) {
    chatbotForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const userInput = chatbotInput.value.trim();
      
      if (userInput) {
        processUserInput(userInput);
        chatbotInput.value = '';
      }
    });
  }

  // Add escape key functionality to close chat
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && chatbotContainer.classList.contains('active')) {
      chatbotToggle.classList.remove('active');
      chatbotContainer.classList.remove('active');
    }
  });

  // Close chat when clicking outside
  document.addEventListener('click', function(e) {
    if (chatbotContainer.classList.contains('active') && 
        !chatbotContainer.contains(e.target) && 
        e.target !== chatbotToggle) {
      chatbotToggle.classList.remove('active');
      chatbotContainer.classList.remove('active');
    }
  });
  
  // Initialize interface on load
  initInterface();
  
  // Add a welcome message with fresh suggestions
  setTimeout(() => {
    // addMessage("Hi there! I'm your travel assistant. Ask me anything about destinations, flights, accommodations, or share your location for personalized recommendations!", 'bot');
    
    // If it's a page reload, use the reload-specific suggestions
    if (isReload) {
      const reloadSuggestions = getPageReloadSuggestions();
      
      // Create custom quick replies div
      const quickRepliesDiv = document.createElement('div');
      quickRepliesDiv.classList.add('quick-replies');
      
      // Create and append new suggestion buttons
      reloadSuggestions.forEach(option => {
        const button = document.createElement('button');
        button.classList.add('quick-reply-btn');
        button.textContent = option;
        button.addEventListener('click', function() {
          processUserInput(this.textContent);
        });
        quickRepliesDiv.appendChild(button);
      });
      
      chatbotMessages.appendChild(quickRepliesDiv);
    } else {
      // Normal first-load suggestions
      addQuickReplies();
    }
  }, 1000);}