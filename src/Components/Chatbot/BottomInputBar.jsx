// src/Components/Chatbot/BottomInputBar.jsx
import React, { useState } from 'react';
import { IoSend, IoAdd, IoMicOutline } from 'react-icons/io5';

function BottomInputBar({ onStartChat, isChatActive }) {
  const [input, setInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      onStartChat(input.trim());
      setInput(''); // Clear input after submission
    }
  };

  // Don't render if the chat interface is already active
  if (isChatActive) {
    return null;
  }

  return (
    // Fixed position at the bottom, styled like Gemini input
    // Ensure z-index is higher than footer if footer is also fixed/sticky, but lower than chat component when active
    <div className="fixed bottom-0 left-0 right-0 z-30 p-2 sm:p-4 bg-white dark:bg-[#131314] print:hidden"> {/* Match page background */}
      <div className="max-w-3xl mx-auto"> {/* Centered container */}
        <form
          onSubmit={handleSubmit}
          className="flex items-center space-x-2 bg-gray-100 dark:bg-[#1e1f20] rounded-full px-3 py-2 shadow-md border border-gray-300 dark:border-gray-700"
        >
          {/* Add Button (Optional) */}
          <button
            type="button"
            title="Add context (future)"
            className="p-2 text-gray-500 dark:text-gray-400 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none"
          >
            <IoAdd size={22} />
          </button>

          {/* Input Field */}
          <input
            type="text"
            className="flex-grow bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500 text-sm px-2 py-1 focus:outline-none focus:ring-0 border-none"
            placeholder="Ask Ev.ai anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />

          {/* Mic Button (Optional) */}
          <button
            type="button"
            title="Use voice (future)"
            className="p-2 text-gray-500 dark:text-gray-400 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none"
          >
            <IoMicOutline size={20} />
          </button>

          {/* Send Button */}
          <button
            type="submit"
            title="Send Message"
            disabled={!input.trim()}
            className={`p-2 rounded-full transition-colors duration-200 focus:outline-none ${
              input.trim()
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-gray-200 dark:bg-gray-600 text-gray-400 dark:text-gray-500 cursor-not-allowed'
            }`}
          >
            <IoSend size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}

export default BottomInputBar;