import { useState, useEffect, useRef, useCallback } from 'react';
import { IoPersonOutline, IoGlobeOutline } from 'react-icons/io5'; // Keep icons if needed for message display

// Define API Keys directly or use environment variables
const GEMINI_API_KEY = 'AIzaSyBqZsyWeXFBEO72704FcoYFM_YjIVS0QeM'; // Replace with your actual key
const MAPS_API_KEY = 'AIzaSyBbSshnFwPb50Tj--k7-W8wzqP90qORGKA'; // Replace with your actual key

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
        precise_location_string: null, // Added for clarity
    });
    const [locationMessageShown, setLocationMessageShown] = useState(false);
    const [usedSuggestions] = useState(new Set()); // Keep if suggestions logic is used later

    const chatEndRef = useRef(null); // Ref for scrolling

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


    // Format message text with basic markdown (simplified)
    const formatMessageText = useCallback((text) => {
        let formattedText = text.replace(/\n/g, '<br>');
        // Basic bold/italic handling if needed
        formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        formattedText = formattedText.replace(/\*(.*?)\*/g, '<em>$1</em>');
        // Handle bullet points (simple version)
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
                    // Try to get a more precise name (street, poi, etc.)
                    if (!precise && (comp.types.includes('point_of_interest') || comp.types.includes('premise') || comp.types.includes('route'))) {
                        precise = comp.long_name;
                    }
                });

                updatedLocation.city = city;
                updatedLocation.country = country;
                updatedLocation.precise_location_string = precise || city || result.formatted_address.split(',')[0]; // Fallback logic

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
            setUserLocation(updatedLocation); // Store coords even if details fail
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
        // (Keep the detailed context prompt from your original ChatbotComponent.jsx)
        const baseContext = `You are Ev.ai, an intelligent travel assistant chatbot... (rest of your detailed prompt)`; // <-- PASTE YOUR FULL PROMPT HERE

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
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`; // Use 1.5 Flash
        const travelContext = getTravelContext();
        const prompt = `${travelContext}\n\nUser: ${userMessage}\n\nEv.ai:`;

        const requestData = {
            contents: [{ parts: [{ text: prompt }] }],
            // Optional: Add safetySettings, generationConfig if needed
            generationConfig: {
                temperature: 0.7, // Adjust creativity vs factuality
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
    }, [getTravelContext, userLocation]); // Include userLocation dependency


    // Process user input
    const processUserInput = useCallback(async (userInputText) => {
        const trimmedInput = userInputText.trim();
        if (!trimmedInput) return;

        addMessage(trimmedInput, 'user');
        setInput(''); // Clear input immediately
        setIsTyping(true);
        scrollToBottom(); // Scroll after adding user message

        try {
            const aiResponse = await callGeminiAPI(trimmedInput);
            addMessage(aiResponse, 'bot');
        } catch (error) {
            addMessage("Error getting response. Please try again.", 'bot');
            console.error('Error processing message:', error);
        } finally {
            setIsTyping(false);
            // Ensure scroll happens after bot response too
            // Use setTimeout to allow DOM update before scrolling
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
            // Add slight delay for visual effect if needed
            setTimeout(() => {
                addMessage("Hi there! I'm Ev.ai, your travel assistant for this virtual tour. Ask me anything about this destination, or general travel questions!", 'bot');
                // Optionally request location automatically
                setTimeout(requestUserLocation, 1500);
            }, 500);
        }
        // Dependency array ensures this runs only once on mount if messages are initially empty
    }, [initialWelcome, addMessage, requestUserLocation, messages.length]);


    return {
        messages,
        input,
        isTyping,
        userLocation,
        chatEndRef, // Expose ref for parent component if needed
        setInput,
        handleSubmit,
        requestUserLocation,
        formatMessageText, // Expose formatter
        addMessage, // Expose addMessage for potential external triggers
    };
};