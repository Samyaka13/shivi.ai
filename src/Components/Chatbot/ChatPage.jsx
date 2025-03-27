// src/Components/Chatbot/ChatPage.jsx
import React, { useRef, useEffect } from 'react';
import { useChatLogic } from '../../hooks/useChatLogic';
import { IoPersonOutline, IoGlobeOutline } from 'react-icons/io5';
import { FaPaperPlane, FaLocationArrow, FaSmile, FaArrowLeft } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const ChatPage = () => {
    const {
        messages,
        input,
        isTyping,
        chatEndRef,
        setInput,
        handleSubmit,
        requestUserLocation,
        formatMessageText,
    } = useChatLogic(true);

    const chatContainerRef = useRef(null);
    
    // Auto-scroll effect when messages change
    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isTyping]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col">
            {/* Header Bar with subtle gradient */}
            <div className="bg-gradient-to-r from-viridian-green to-teal-500 shadow-md sticky top-0 z-20 text-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center">
                        <h1 className="text-2xl font-bold tracking-tight">Chat with Shivi.ai</h1>
                    </div>
                    <Link
                        to="/"
                        className="flex items-center text-sm  bg-opacity-20 hover:bg-opacity-30 px-3 py-1.5 rounded-full transition-all duration-200"
                    >
                        <FaArrowLeft className="mr-2" /> Back to Home
                    </Link>
                </div>
            </div>

            {/* Main Chat Area with subtle pattern */}
            <div 
                ref={chatContainerRef} 
                className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col"
                style={{
                    backgroundImage: 'radial-gradient(circle at 25px 25px, rgba(0, 128, 128, 0.03) 2%, transparent 0%), radial-gradient(circle at 75px 75px, rgba(0, 128, 128, 0.03) 2%, transparent 0%)',
                    backgroundSize: '100px 100px'
                }}
            >
                {/* Chat Message History */}
                <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 flex-grow overflow-y-auto mb-6 flex flex-col space-y-4 scroll-smooth border border-gray-100">
                    {messages.length === 0 && !isTyping && (
                        <div className="text-center m-auto py-10"> 
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-viridian-green bg-opacity-10 flex items-center justify-center">
                                <IoGlobeOutline size={28} className="text-viridian-green" />
                            </div>
                            <p className="text-gray-500 font-medium">
                                Ask me anything about travel, destinations, planning, or get inspired!
                            </p>
                            <p className="text-gray-400 text-sm mt-2">
                                I'm here to help with your travel questions.
                            </p>
                        </div>
                    )}
                    
                    {messages.map((message) => (
                        <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
                            <div className={`max-w-[75%] flex items-end gap-2 ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                                {/* Avatar with subtle animation */}
                                <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-white shadow-sm transition-transform hover:scale-105 ${
                                    message.sender === 'bot' 
                                        ? 'bg-gradient-to-br from-viridian-green to-teal-600' 
                                        : 'bg-gradient-to-br from-blue-500 to-blue-600'
                                }`}>
                                    {message.sender === 'bot' ? <IoGlobeOutline size={18} /> : <IoPersonOutline size={18} />}
                                </div>
                                
                                {/* Message Bubble with improved styling */}
                                <div className={`rounded-2xl px-4 py-3 shadow-sm ${
                                    message.sender === 'user' 
                                        ? 'bg-blue-50 text-gray-800 rounded-br-none border-r border-t border-blue-100' 
                                        : 'bg-gray-50 text-gray-800 rounded-bl-none border-l border-t border-gray-100'
                                }`}>
                                    <p
                                        className="text-sm md:text-base break-words leading-relaxed"
                                        dangerouslySetInnerHTML={{ __html: formatMessageText(message.text) }}
                                    />
                                    <div className={`text-xs mt-1.5 ${message.sender === 'user' ? 'text-right text-blue-500' : 'text-left text-gray-500'}`}>
                                        {message.time}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Enhanced typing indicator */}
                    {isTyping && (
                        <div className="flex justify-start animate-fadeIn">
                            <div className="flex items-end gap-2">
                                <div className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center bg-gradient-to-br from-viridian-green to-teal-600 text-white shadow-sm">
                                    <IoGlobeOutline size={18} />
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

                {/* Enhanced Chat Input Form */}
                <form onSubmit={handleSubmit} className="flex items-center gap-2 md:gap-3 p-4 bg-white rounded-xl shadow-lg sticky bottom-5 z-10 border border-gray-100">
                    <button
                        type="button"
                        onClick={requestUserLocation}
                        title="Share Location"
                        className="flex-shrink-0 p-2.5 text-gray-500 hover:text-viridian-green rounded-full hover:bg-gray-100 transition-all duration-200"
                    >
                        <FaLocationArrow size={18} />
                    </button>
                    
                    <button
                        type="button"
                        onClick={() => setInput((prev) => prev + '😊')}
                        title="Add Emoji"
                        className="flex-shrink-0 p-2.5 text-gray-500 hover:text-yellow-500 rounded-full hover:bg-gray-100 transition-all duration-200 hidden sm:block"
                    >
                        <FaSmile size={18} />
                    </button>

                    <input
                        type="text"
                        className="flex-grow px-5 py-3 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-viridian-green focus:border-transparent text-sm md:text-base"
                        placeholder="Ask Shivi.ai anything..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        aria-label="Chat input"
                    />
                    
                    <button
                        type="submit"
                        disabled={!input.trim() || isTyping}
                        className={`flex-shrink-0 p-3 rounded-full text-white transition-all duration-200 ${
                            (!input.trim() || isTyping) 
                                ? 'bg-gray-300 cursor-not-allowed' 
                                : 'bg-gradient-to-r from-viridian-green to-teal-500 hover:shadow-md'
                        }`}
                        aria-label="Send message"
                    >
                        <FaPaperPlane size={18} />
                    </button>
                </form>
            </div>

            {/* Enhanced CSS for animations */}
            <style jsx global>{`
                .typing-dot {
                    width: 8px;
                    height: 8px;
                    background-color: #10b981; /* emerald-500 */
                    border-radius: 50%;
                    display: inline-block;
                    animation: bounce 1.4s ease infinite;
                }
                
                @keyframes bounce {
                    0%, 60%, 100% { transform: translateY(0); }
                    30% { transform: translateY(-4px); }
                }
                
                .animation-delay-200 { animation-delay: 0.2s; }
                .animation-delay-400 { animation-delay: 0.4s; }
                
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default ChatPage;
