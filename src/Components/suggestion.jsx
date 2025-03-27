import React, { useState, useEffect } from 'react';

const SuggestionChips = ({ destination, onSuggestionClick, usedSuggestions = new Set() }) => {
  const [suggestions, setSuggestions] = useState([]);
  
  // Generate a list of potential suggestions
  useEffect(() => {
    const allSuggestions = [
      // General travel questions
      `What's the best time to visit ${destination}?`,
      `What local dishes should I try in ${destination}?`,
      `What are the must-see attractions in ${destination}?`,
      'What should I pack for this trip?',
      'How do locals typically get around?',
      'Any safety tips for travelers?',
      'What cultural customs should I be aware of?',
      'Can you recommend any hidden gems?',
      'Whats the local currency and tipping etiquette?',
      'What language do they speak here?',
      
      // Activity-based questions
      `Are there any festivals happening in ${destination} soon?`,
      'What are the best photo spots?',
      'Where can I find authentic local experiences?',
      'Any recommended day trips from here?',
      'What outdoor activities are popular here?',
      
      // Nightlife and entertainment
      'Whats the nightlife like?',
      'Any recommended local music or performances?',
      'Where do locals hang out on weekends?',
      
      // Shopping
      'Where can I buy authentic souvenirs?',
      'Are there any local markets worth visiting?'
    ];
    
    // Filter out suggestions that have been used already
    const availableSuggestions = allSuggestions.filter(suggestion => !usedSuggestions.has(suggestion));
    
    // Select 2-3 random suggestions
    const randomCount = Math.floor(Math.random() * 2) + 2; // Either 2 or 3
    const shuffled = availableSuggestions.sort(() => 0.5 - Math.random());
    
    setSuggestions(shuffled.slice(0, randomCount));
  }, [destination, usedSuggestions]);
  
  if (suggestions.length === 0) return null;
  
  return (
    <div className="flex flex-wrap gap-2 mt-3 mb-1">
      {suggestions.map((suggestion, index) => (
        <button
          key={index}
          onClick={() => onSuggestionClick(suggestion)}
          className="px-3 py-2 bg-gray-50 text-sm rounded-full border border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-viridian-green transition-all duration-200 hover:shadow-sm whitespace-normal text-left"
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
};

export default SuggestionChips;