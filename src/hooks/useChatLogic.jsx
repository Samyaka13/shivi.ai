import { useState, useEffect, useRef, useCallback } from 'react';
import { IoPersonOutline, IoGlobeOutline } from 'react-icons/io5';

// Define API Keys directly or use environment variables
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const MAPS_API_KEY = import.meta.env.VITE_MAPS_API_KEY;
if (!GEMINI_API_KEY || !MAPS_API_KEY) {
    console.warn("API Keys not loaded! Check your .env file and ensure it uses VITE_ prefix and the dev server was restarted.");
}

export const useChatLogic = (initialWelcome = true) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [userLocation, setUserLocation] = useState({
        lat: null,
        lng: null,
        city: null,
        country: null,
        formatted_address: null,
        precise_location_string: null,
    });
    const [locationMessageShown, setLocationMessageShown] = useState(false);
    const [usedSuggestions, setUsedSuggestions] = useState(new Set()); // Track used suggestions

    const chatEndRef = useRef(null);

    // Get current time for messages
    const getCurrentTime = useCallback(() => {
        const now = new Date();
        return now.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
    }, []);

    // Scroll to bottom of messages
    const scrollToBottom = useCallback(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    // Effect to scroll when messages change
    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    // Add a message to the chat
    const addMessage = useCallback((text, sender) => {
        const newMessage = {
            id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            text,
            sender,
            time: getCurrentTime(),
        };
        setMessages(prevMessages => [...prevMessages, newMessage]);
    }, [getCurrentTime]);

    // Format message text with basic markdown
    const formatMessageText = useCallback((text) => {
        let formattedText = text.replace(/\n/g, '<br>');
        formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        formattedText = formattedText.replace(/\*(.*?)\*/g, '<em>$1</em>');
        formattedText = formattedText.replace(/(\r\n|\n|^)[\*|-]\s/g, '<br>• ');
        return formattedText;
    }, []);

    // --- Location Logic ---
    const handleLocationError = useCallback((error) => {
        console.error('Geolocation error:', error);
        let errorMessage;
        switch (error.code) {
            case error.PERMISSION_DENIED:
                errorMessage = "Location sharing declined. I can still provide general travel advice!";
                break;
            case error.POSITION_UNAVAILABLE:
                errorMessage = "Location info unavailable. Using general travel recommendations.";
                break;
            case error.TIMEOUT:
                errorMessage = "Location request timed out. Using general travel recommendations.";
                break;
            default:
                errorMessage = "Unknown location error. Using general travel recommendations.";
        }
        addMessage(errorMessage, 'bot');
    }, [addMessage]);

    const getLocationDetails = useCallback(async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const updatedLocation = { lat, lng, city: null, country: null, formatted_address: null, precise_location_string: null };

        try {
            const apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${MAPS_API_KEY}`;
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error(`Geocoding API error: ${response.status}`);
            const data = await response.json();

            if (data.status === 'OK' && data.results && data.results.length > 0) {
                const result = data.results[0];
                updatedLocation.formatted_address = result.formatted_address;

                let city = null, country = null, precise = null;
                result.address_components.forEach(comp => {
                    if (comp.types.includes('locality')) city = comp.long_name;
                    if (comp.types.includes('country')) country = comp.long_name;
                    if (!precise && (comp.types.includes('point_of_interest') || comp.types.includes('premise') || comp.types.includes('route'))) {
                        precise = comp.long_name;
                    }
                });

                updatedLocation.city = city;
                updatedLocation.country = country;
                updatedLocation.precise_location_string = precise || city || result.formatted_address.split(',')[0];

                setUserLocation(updatedLocation);

                if (!locationMessageShown) {
                    const locString = updatedLocation.precise_location_string || updatedLocation.city || 'your current area';
                    addMessage(`Got it! You seem to be near ${locString}. I can use this for relevant suggestions.`, 'bot');
                    setLocationMessageShown(true);
                }
            } else {
                throw new Error(`Geocoding failed: ${data.status}`);
            }
        } catch (error) {
            console.error('Error getting location details:', error);
            addMessage("Couldn't pinpoint your exact location, but I can still help!", 'bot');
            setUserLocation(updatedLocation);
        }
    }, [addMessage, locationMessageShown]);

    const requestUserLocation = useCallback(() => {
        if (!navigator.geolocation) {
            addMessage("Your browser doesn't support Geolocation.", 'bot');
            return;
        }
        addMessage("Requesting location access...", 'bot');
        navigator.geolocation.getCurrentPosition(
            getLocationDetails,
            handleLocationError,
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    }, [addMessage, getLocationDetails, handleLocationError]);

    // --- API Call & Context ---
    const getTravelContext = useCallback(() => {
        // Base context prompt
        const baseContext = `You are Shivi.ai, an intelligent travel assistant chatbot...`; // Your full prompt here

        if (userLocation.lat && userLocation.lng) {
            const locationContext = `
      User's current location context:
      - Coordinates: ${userLocation.lat}, ${userLocation.lng}
      - General Area: ${userLocation.precise_location_string ? `${userLocation.precise_location_string}, ` : ''}${userLocation.city ? `${userLocation.city}, ` : ''}${userLocation.country || ''}
      - Full Address (if available): ${userLocation.formatted_address || 'Not available'}
      IMPORTANT: Only mention the user's location if their query is explicitly about nearby places, local info, or travel FROM their location. Do not force location into unrelated topics.
      `;
            return baseContext + locationContext;
        }
        return baseContext;
    }, [userLocation]);

    const callGeminiAPI = useCallback(async (userMessage) => {
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;
        const travelContext = getTravelContext();
        const prompt = `${travelContext}\n\nUser: ${userMessage}\n\nShivi.ai:`;

        const requestData = {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.7,
                topP: 0.9,
                maxOutputTokens: 500,
            }
        };

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestData),
            });

            if (!response.ok) {
                const errorBody = await response.text();
                console.error("API Error Response:", errorBody);
                throw new Error(`API request failed: ${response.status}`);
            }

            const data = await response.json();

            if (data.candidates && data.candidates.length > 0 && data.candidates[0].content?.parts?.length > 0) {
                return data.candidates[0].content.parts[0].text.trim();
            } else if (data.promptFeedback?.blockReason) {
                console.warn("Response blocked:", data.promptFeedback.blockReason);
                return `My response was blocked due to safety settings (${data.promptFeedback.blockReason}). Could you rephrase your request?`;
            }
            else {
                console.error("Unexpected API response structure:", data);
                throw new Error('No valid response content received from API.');
            }
        } catch (error) {
            console.error('Error calling Gemini API:', error);
            return "Sorry, I encountered an issue connecting to my knowledge base. Please try again in a moment. 🔄";
        }
    }, [getTravelContext]);

    // Handle suggestion click
    const handleSuggestionClick = useCallback((suggestion) => {
        // Add the suggestion to used suggestions
        setUsedSuggestions(prev => new Set([...prev, suggestion]));
        
        // Set input to the suggestion text and process it
        setInput(suggestion);
        processUserInput(suggestion);
    }, []);

    // Process user input
    const processUserInput = useCallback(async (userInputText) => {
        const trimmedInput = userInputText.trim();
        if (!trimmedInput) return;

        addMessage(trimmedInput, 'user');
        setInput('');
        setIsTyping(true);
        scrollToBottom();

        try {
            const aiResponse = await callGeminiAPI(trimmedInput);
            addMessage(aiResponse, 'bot');
        } catch (error) {
            addMessage("Error getting response. Please try again.", 'bot');
            console.error('Error processing message:', error);
        } finally {
            setIsTyping(false);
            setTimeout(scrollToBottom, 100);
        }
    }, [addMessage, callGeminiAPI, scrollToBottom]);

    // Handle form submission
    const handleSubmit = useCallback((e) => {
        e.preventDefault();
        processUserInput(input);
    }, [input, processUserInput]);

    // Initial welcome message and location request
    useEffect(() => {
        if (initialWelcome && messages.length === 0) {
            setTimeout(() => {
                addMessage("Hi there! I'm Shivi.ai, your travel assistant for this virtual tour. Ask me anything about this destination, or general travel questions!", 'bot');
                setTimeout(requestUserLocation, 1500);
            }, 500);
        }
    }, [initialWelcome, addMessage, requestUserLocation, messages.length]);

    return {
        messages,
        input,
        isTyping,
        userLocation,
        chatEndRef,
        usedSuggestions,
        setInput,
        handleSubmit,
        requestUserLocation,
        formatMessageText,
        addMessage,
        handleSuggestionClick
    };
};