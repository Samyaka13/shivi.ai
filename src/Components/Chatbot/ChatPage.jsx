// src/Components/Chatbot/ChatPage.jsx
import React, { useRef } from 'react';
import { useChatLogic } from '../../hooks/useChatLogic'; // Adjust path if needed
import { IoPersonOutline, IoGlobeOutline } from 'react-icons/io5';
import { FaPaperPlane, FaLocationArrow, FaSmile, FaArrowLeft } from 'react-icons/fa';
import { Link } from 'react-router-dom'; // For Back button

const ChatPage = () => {
    // Initialize chat logic. Pass false to disable automatic welcome if preferred,
    // or adjust the welcome message in the hook itself to be more generic.
    const {
        messages,
        input,
        isTyping,
        chatEndRef,
        setInput,
        handleSubmit,
        requestUserLocation,
        formatMessageText,
    } = useChatLogic(true); // Keep initial welcome for now

    const chatContainerRef = useRef(null);

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            {/* Optional Header Bar */}
            <div className="bg-white shadow-sm sticky top-0 z-20">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
                    <h1 className="text-xl font-semibold text-gray-800">Chat with Ev.ai</h1>
                    <Link
                        to="/" // Link back to home or previous page if possible
                        className="flex items-center text-sm text-viridian-green hover:text-opacity-80"
                    >
                        <FaArrowLeft className="mr-1" /> Back to Home
                    </Link>
                </div>
            </div>

            {/* Main Chat Area */}
            <div ref={chatContainerRef} className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col">
                {/* Chat Message History */}
                <div className="bg-white rounded-lg shadow-md p-4 md:p-6 flex-grow overflow-y-auto mb-6 flex flex-col space-y-4 scroll-smooth">
                    {messages.length === 0 && !isTyping && (
                        <div className="text-center text-gray-500 m-auto"> {/* Centered placeholder */}
                            Ask me anything about travel, destinations, planning, or get inspired!
                        </div>
                    )}
                    {messages.map((message) => (
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

                {/* Chat Input Form - Sticky at the bottom */}
                <form onSubmit={handleSubmit} className="flex items-center gap-2 md:gap-3 p-4 bg-white rounded-lg shadow-md sticky bottom-5 z-10">
                    {/* Location Button */}
                    <button
                        type="button"
                        onClick={requestUserLocation}
                        title="Share Location"
                        className="flex-shrink-0 p-2 text-gray-500 hover:text-viridian-green rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <FaLocationArrow size={18} />
                    </button>
                    {/* Emoji Button */}
                    <button
                        type="button"
                        onClick={() => setInput((prev) => prev + '😊')} // Simple emoji add
                        title="Add Emoji"
                        className="flex-shrink-0 p-2 text-gray-500 hover:text-yellow-500 rounded-full hover:bg-gray-100 transition-colors hidden sm:block"
                    >
                        <FaSmile size={18} />
                    </button>

                    <input
                        type="text"
                        className="flex-grow px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-viridian-green focus:border-transparent text-sm"
                        placeholder="Ask Ev.ai anything..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        aria-label="Chat input"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isTyping} // Disable while typing response too
                        className={`flex-shrink-0 p-2 rounded-full text-white transition-colors ${(!input.trim() || isTyping) ? 'bg-gray-400 cursor-not-allowed' : 'bg-viridian-green hover:bg-opacity-90'}`}
                        aria-label="Send message"
                    >
                        <FaPaperPlane size={18} />
                    </button>
                </form>
            </div>

            {/* Add basic CSS for typing animation */}
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

export default ChatPage;