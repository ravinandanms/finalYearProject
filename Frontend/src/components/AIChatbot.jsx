import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AIChatbot({ context, initialPrompt, onClosePrompt }) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    // If the component receives an initial prompt (e.g. from clicking a service card)
    if (initialPrompt && !isOpen) {
      setIsOpen(true);
      // Wait for state to update and panel to open before sending
      setTimeout(() => {
        handleSend(initialPrompt);
        if (onClosePrompt) onClosePrompt(); // Clear the prompt so it doesn't trigger again
      }, 300);
    } else if (initialPrompt && isOpen) {
      handleSend(initialPrompt);
      if (onClosePrompt) onClosePrompt();
    }
  }, [initialPrompt]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Add welcome message
      setMessages([
        {
          role: 'assistant',
          content: "Hi! I'm Teleseva AI. I can help diagnose symptoms, recommend specialist doctors, find budget & premium hospitals near you, plan diets, and assist with consultations."
        }
      ]);
    }
    scrollToBottom();
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (textToSend) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    if (!textToSend) setInput('');
    setIsLoading(true);

    const userMessage = { role: 'user', content: text.trim(), timestamp: new Date() };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          conversationId,
          context: context || {}
        }),
      });

      const data = await response.json();

      if (data.success) {
        setConversationId(data.conversationId);
        setMessages((prev) => [
          ...prev,
          { 
            role: 'assistant', 
            content: data.reply, 
            timestamp: new Date(),
            specialistRecommendation: data.specialistRecommendation,
            userQuery: text.trim()
          }
        ]);
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: "I'm sorry, I couldn't process that request right now. Please try again.", isError: true }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickActions = [
    "Check my symptoms",
    "Find Nearby Doctors & Hospitals",
    "Create a diet plan",
    "Help me use Teleseva"
  ];

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-teal-600 text-white rounded-full shadow-xl hover:bg-teal-700 hover:scale-105 transition-all flex items-center justify-center z-50 focus:outline-none focus:ring-4 focus:ring-teal-300"
          aria-label="Open Teleseva AI Assistant"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z" />
          </svg>
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-full max-w-[380px] h-[580px] max-h-[85vh] bg-white rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden border border-slate-200">
          {/* Header */}
          <div className="bg-slate-800 text-white p-4 flex justify-between items-center rounded-t-2xl">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-white">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-sm leading-tight">TeleSeva AI</h3>
                <p className="text-[10px] text-teal-400">Diagnosis & Hospital Finder</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-slate-300 hover:text-white transition-colors p-1"
              aria-label="Close chat"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto bg-slate-50 flex flex-col gap-3.5">
            {messages.map((msg, idx) => {
              const recommendation = msg.specialistRecommendation;

              return (
                <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[88%] rounded-2xl px-4 py-2.5 shadow-xs ${
                    msg.role === 'user' 
                      ? 'bg-teal-600 text-white rounded-br-xs' 
                      : msg.isError 
                        ? 'bg-red-100 text-red-700 rounded-bl-xs' 
                        : 'bg-white text-slate-700 border border-slate-200 rounded-bl-xs'
                  }`}>
                    <div className="text-xs sm:text-sm whitespace-pre-wrap break-words leading-relaxed">{msg.content}</div>
                  </div>

                  {/* Specialist & Doctor Finding Action Chip */}
                  {msg.role === 'assistant' && recommendation && recommendation.specialty && (
                    <div className="mt-2 w-full max-w-[88%] bg-teal-50 border border-teal-200 p-2.5 rounded-xl text-xs space-y-2">
                      <div className="flex items-center gap-1.5 text-teal-900 font-semibold">
                        <span>🩺</span>
                        <span>Suggested: {recommendation.specialty}</span>
                      </div>
                      <p className="text-[11px] text-slate-600">
                        Find budget & premium {recommendation.specialty} doctors near you.
                      </p>
                      <button
                        onClick={() => {
                          setIsOpen(false);
                          navigate('/doctor-finder', {
                            state: {
                              specialty: recommendation.specialty,
                              symptoms: msg.userQuery || ''
                            }
                          });
                        }}
                        className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-1.5 px-2.5 rounded-lg text-center transition-colors flex items-center justify-center gap-1"
                      >
                        <span>🏥 View Doctors & Hospitals</span>
                        <span>➔</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
            
            {/* Quick Actions */}
            {messages.length === 1 && !isLoading && (
              <div className="flex flex-wrap gap-2 mt-2">
                {quickActions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      if (action === "Find Nearby Doctors & Hospitals") {
                        setIsOpen(false);
                        navigate('/doctor-finder');
                      } else {
                        handleSend(action);
                      }
                    }}
                    className="text-xs bg-white border border-teal-200 text-teal-700 px-3 py-1.5 rounded-full hover:bg-teal-50 transition-colors shadow-2xs font-medium"
                  >
                    {action}
                  </button>
                ))}
              </div>
            )}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 text-slate-500 px-4 py-2 rounded-2xl rounded-bl-xs shadow-xs flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                  <div className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-slate-200">
            <div className="flex items-end gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-teal-500 focus-within:border-transparent transition-all">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask symptoms, doctors, diet..."
                className="flex-1 bg-transparent border-none focus:outline-none resize-none max-h-28 text-xs sm:text-sm text-slate-700 py-1"
                rows={input.split('\n').length > 1 ? Math.min(input.split('\n').length, 3) : 1}
                disabled={isLoading}
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                className="text-teal-600 disabled:text-slate-300 p-1 mb-0.5 hover:text-teal-700 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
                </svg>
              </button>
            </div>
            <div className="text-[10px] text-center text-slate-400 mt-1.5">
              TeleSeva AI is an assistant. Check critical information with real doctors.
            </div>
          </div>
        </div>
      )}
    </>
  );
}
