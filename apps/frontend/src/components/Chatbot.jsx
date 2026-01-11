import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import Icon from './UI/Icon';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! 👋 I'm your AI assistant for Mastersolis Infotech. I'm here to help you learn about our enterprise HRMS solutions, assist with job applications, answer your questions, and guide you through our services. How can I assist you today?",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [showResumeUpload, setShowResumeUpload] = useState(false);
  const [typingIndicator, setTypingIndicator] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState([]);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  const inputRef = useRef(null);

  // Initialize session ID
  useEffect(() => {
    if (!sessionId) {
      setSessionId(`session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
    }
  }, [sessionId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingIndicator]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, isMinimized]);

  // Generate suggested questions based on conversation
  const generateSuggestions = (lastMessage) => {
    const suggestions = [];
    const lowerMessage = lastMessage?.toLowerCase() || '';
    
    if (lowerMessage.includes('service') || lowerMessage.includes('hrms') || lowerMessage.includes('feature')) {
      suggestions.push(
        'What industries do you serve?',
        'How does your payroll system work?',
        'Tell me about your analytics features'
      );
    } else if (lowerMessage.includes('job') || lowerMessage.includes('career') || lowerMessage.includes('hiring')) {
      suggestions.push(
        'What positions are currently open?',
        'How do I apply for a job?',
        'What is your company culture like?'
      );
    } else if (lowerMessage.includes('contact') || lowerMessage.includes('reach')) {
      suggestions.push(
        'Schedule a demo',
        'Get pricing information',
        'Talk to sales team'
      );
    } else {
      suggestions.push(
        'What services do you offer?',
        'Show me job openings',
        'How can I contact you?'
      );
    }
    
    return suggestions.slice(0, 3);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputMessage;
    setInputMessage('');
    setIsLoading(true);
    setTypingIndicator(true);
    setSuggestedQuestions([]);

    try {
      const response = await axios.post('/api/chatbot/chat', {
        message: currentInput,
        sessionId
      });

      if (response.data.success) {
        const assistantMessage = {
          role: 'assistant',
          content: response.data.response,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
        
        // Generate suggested follow-up questions
        const suggestions = generateSuggestions(currentInput);
        setSuggestedQuestions(suggestions);
      } else {
        const errorMessage = {
          role: 'assistant',
          content: response.data.response || response.data.message || "I'm sorry, I encountered an error. Please try again or contact support.",
          timestamp: new Date(),
          error: true
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        role: 'assistant',
        content: error.response?.data?.response || "I'm sorry, I encountered a technical issue. Please try again in a moment, or feel free to contact our support team directly at info@mastersolisinfotech.com",
        timestamp: new Date(),
        error: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setTypingIndicator(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInputMessage(suggestion);
    setSuggestedQuestions([]);
    // Auto-send after a brief delay
    setTimeout(() => {
      const fakeEvent = { preventDefault: () => {} };
      setInputMessage(suggestion);
      handleSendMessage(fakeEvent);
    }, 100);
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('resume', file);
    formData.append('sessionId', sessionId);

    setIsLoading(true);
    setTypingIndicator(true);

    try {
      const response = await axios.post('/api/chatbot/resume/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        const uploadMessage = {
          role: 'assistant',
          content: `✅ Resume uploaded successfully! ${response.data.analysis ? '\n\n' + response.data.analysis : ''}`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, uploadMessage]);
        setShowResumeUpload(false);
      }
    } catch (error) {
      console.error('Resume upload error:', error);
      const errorMessage = {
        role: 'assistant',
        content: "Sorry, there was an error uploading your resume. Please try again or contact our HR team directly.",
        timestamp: new Date(),
        error: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setTypingIndicator(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: "Hello! 👋 I'm your AI assistant for Mastersolis Infotech. I'm here to help you learn about our enterprise HRMS solutions, assist with job applications, answer your questions, and guide you through our services. How can I assist you today?",
        timestamp: new Date()
      }
    ]);
    setSuggestedQuestions([]);
  };

  const quickActions = [
    { label: 'Our Services', action: () => setInputMessage('Tell me about your HRMS services and solutions') },
    { label: 'Job Openings', action: () => setInputMessage('Show me current job openings and career opportunities') },
    { label: 'Contact Info', action: () => setInputMessage('How can I contact your sales or support team?') },
    { label: 'Upload Resume', action: () => setShowResumeUpload(true) }
  ];

  // Format message content (simple markdown-like formatting)
  const formatMessage = (content) => {
    if (!content) return '';
    
    // Convert **bold** to <strong>
    let formatted = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Convert *italic* to <em>
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
    // Convert - list items to bullets
    formatted = formatted.replace(/^-\s(.+)$/gm, '• $1');
    // Convert numbered lists
    formatted = formatted.replace(/^\d+\.\s(.+)$/gm, '$1');
    // Convert line breaks
    formatted = formatted.replace(/\n/g, '<br />');
    
    return formatted;
  };

  return (
    <>
      {/* Chatbot Toggle Button - Enhanced Design */}
      <motion.button
        onClick={() => {
          setIsOpen(!isOpen);
          setIsMinimized(false);
        }}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 text-white rounded-full shadow-2xl hover:shadow-3xl flex items-center justify-center transition-all duration-300 group"
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Toggle Chatbot"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Icon name="x" size="lg" />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative"
            >
              <Icon name="chat" size="lg" />
              {/* Pulse animation indicator */}
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse border-2 border-white"></span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chatbot Window - Enhanced Aesthetic Design */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 30 }}
            className={`fixed bottom-24 right-6 z-50 bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden ${
              isMinimized ? 'w-80 h-16' : 'w-[420px] h-[650px]'
            } transition-all duration-300 border border-gray-100`}
            style={{ 
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)'
            }}
          >
            {/* Enhanced Header with Gradient */}
            <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white p-5 flex items-center justify-between relative overflow-hidden">
              {/* Decorative background pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full -ml-12 -mb-12"></div>
              </div>
              
              <div className="flex items-center space-x-3 relative z-10">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30 shadow-lg">
                  <Icon name="chat" size="lg" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Mastersolis Assistant</h3>
                  <p className="text-xs text-blue-100 flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    AI-Powered Support
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2 relative z-10">
                {!isMinimized && messages.length > 1 && (
                  <button
                    onClick={clearChat}
                    className="p-2 hover:bg-white/20 rounded-lg transition-all duration-200 hover:scale-110"
                    aria-label="Clear Chat"
                    title="Clear Chat"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-all duration-200 hover:scale-110"
                  aria-label={isMinimized ? "Maximize" : "Minimize"}
                >
                  <Icon name={isMinimized ? "maximize" : "minimize"} size="sm" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-all duration-200 hover:scale-110"
                  aria-label="Close"
                >
                  <Icon name="x" size="sm" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Enhanced Messages Container */}
                <div
                  ref={chatContainerRef}
                  className="flex-1 overflow-y-auto p-5 space-y-4 bg-gradient-to-b from-gray-50 to-white"
                  style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#CBD5E0 transparent'
                  }}
                >
                  {messages.map((message, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.03 }}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex items-start gap-2 max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        {/* Avatar */}
                        {message.role === 'assistant' && (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-md">
                            <Icon name="chat" size="sm" />
                          </div>
                        )}
                        
                        <div
                          className={`rounded-2xl px-4 py-3 shadow-sm ${
                            message.role === 'user'
                              ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white'
                              : message.error
                              ? 'bg-red-50 text-red-800 border border-red-200'
                              : 'bg-white text-gray-800 border border-gray-100'
                          }`}
                          style={{
                            boxShadow: message.role === 'user' 
                              ? '0 4px 12px rgba(37, 99, 235, 0.3)' 
                              : '0 2px 8px rgba(0, 0, 0, 0.08)'
                          }}
                        >
                          <div 
                            className="text-sm leading-relaxed whitespace-pre-wrap"
                            dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
                          />
                          <p className={`text-xs mt-2 ${message.role === 'user' ? 'text-blue-100' : 'text-gray-400'}`}>
                            {new Date(message.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  
                  {/* Typing Indicator */}
                  {(isLoading || typingIndicator) && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div className="flex items-start gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-md">
                          <Icon name="chat" size="sm" />
                        </div>
                        <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-100">
                          <div className="flex space-x-1.5">
                            <motion.div 
                              className="w-2 h-2 bg-blue-500 rounded-full"
                              animate={{ y: [0, -8, 0] }}
                              transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                            ></motion.div>
                            <motion.div 
                              className="w-2 h-2 bg-blue-500 rounded-full"
                              animate={{ y: [0, -8, 0] }}
                              transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                            ></motion.div>
                            <motion.div 
                              className="w-2 h-2 bg-blue-500 rounded-full"
                              animate={{ y: [0, -8, 0] }}
                              transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                            ></motion.div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  {/* Suggested Questions */}
                  {suggestedQuestions.length > 0 && !isLoading && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-2 mt-4"
                    >
                      <p className="text-xs font-medium text-gray-500 px-2">Suggested questions:</p>
                      <div className="flex flex-col gap-2">
                        {suggestedQuestions.map((suggestion, idx) => (
                          <motion.button
                            key={idx}
                            onClick={() => handleSuggestionClick(suggestion)}
                            whileHover={{ scale: 1.02, x: 4 }}
                            whileTap={{ scale: 0.98 }}
                            className="text-left px-4 py-2 text-sm bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-lg hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 border border-blue-100 hover:border-blue-300"
                          >
                            {suggestion}
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Actions - Enhanced */}
                {messages.length === 1 && (
                  <div className="px-5 py-3 border-t border-gray-200 bg-white">
                    <p className="text-xs font-medium text-gray-500 mb-3">Quick actions:</p>
                    <div className="flex flex-wrap gap-2">
                      {quickActions.map((action, index) => (
                        <motion.button
                          key={index}
                          onClick={action.action}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-3 py-1.5 text-xs font-medium bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-full hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 border border-blue-100"
                        >
                          {action.label}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Resume Upload - Enhanced */}
                {showResumeUpload && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="px-5 py-3 border-t border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-semibold text-gray-700">Upload Resume</p>
                      <button
                        onClick={() => setShowResumeUpload(false)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <Icon name="x" size="sm" />
                      </button>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={handleResumeUpload}
                      className="text-sm w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </motion.div>
                )}

                {/* Enhanced Input Area */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white">
                  <div className="flex items-center space-x-3">
                    <div className="flex-1 relative">
                      <input
                        ref={inputRef}
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isLoading}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage(e);
                          }
                        }}
                      />
                    </div>
                    <motion.button
                      type="submit"
                      disabled={isLoading || !inputMessage.trim()}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-3 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl hover:from-blue-700 hover:to-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <Icon name="send" size="md" />
                    </motion.button>
                  </div>
                  <p className="text-xs text-gray-400 mt-2 text-center">
                    Powered by Google Gemini AI
                  </p>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;
