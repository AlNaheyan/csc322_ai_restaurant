import { useState, useEffect, useRef } from 'react';
import { chatService } from '../services/chatService';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !sessionId) {
      const initSession = async () => {
        try {
          const result = await chatService.createSession();
          setSessionId(result.data.session_id);
        } catch (err) {
          setError('Failed to start chat session');
        }
      };
      initSession();
    }
  }, [isOpen, sessionId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || loading) return;

    const userMessage = { message_type: 'user', content: inputValue, created_at: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);
    setError('');

    try {
      const result = await chatService.sendMessage(sessionId, inputValue);
      const botMessage = result.data.botMessage;
      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      setError('Failed to get response');
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const handleRateMessage = async (messageId, rating) => {
    try {
      await chatService.rateMessage(messageId, rating);
      setMessages(prev => prev.map(msg =>
        msg.message_id === messageId ? { ...msg, rating } : msg
      ));
    } catch (err) {
      setError('Failed to rate message');
    }
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-16 h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 z-50 group"
          aria-label="Open chat"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 border-2 border-white rounded-full"></div>
        </button>
      )}

      {isOpen && (
        <div className={`fixed bottom-6 right-6 w-96 bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200 transition-all ${isMinimized ? 'h-16' : 'h-[600px]'}`}>
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Restaurant Assistant</h3>
                <p className="text-xs text-blue-100">Online • Instant replies</p>
              </div>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
                aria-label="Minimize chat"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
                aria-label="Close chat"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {!isMinimized && messages.length === 0 && !loading && (
            <div className="p-6 bg-gradient-to-b from-blue-50 to-white">
              <h4 className="font-semibold text-gray-900 mb-3">Hi there! 👋</h4>
              <p className="text-sm text-gray-600 mb-4">I'm here to help you with:</p>
              <div className="space-y-2">
                {['Restaurant hours & location', 'Menu & pricing info', 'Delivery & VIP benefits', 'Orders & account help'].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          )}

          {!isMinimized && <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.message_type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] ${msg.message_type === 'user' ? 'bg-blue-600 text-white' : 'bg-white text-gray-900 shadow-sm border border-gray-100'} rounded-2xl px-4 py-2.5`}>
                  <p className="text-sm leading-relaxed">{msg.content}</p>

                  {msg.message_type === 'bot' && msg.source && (
                    <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-gray-100">
                      <div className={`w-1.5 h-1.5 rounded-full ${msg.source === 'knowledge_base' ? 'bg-green-500' : msg.source === 'ollama' ? 'bg-purple-500' : 'bg-gray-400'}`}></div>
                      <span className="text-xs text-gray-500 capitalize">{msg.source.replace('_', ' ')}</span>
                    </div>
                  )}

                  {msg.message_type === 'bot' && msg.kb_article_id && !msg.rating && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-600 mb-2">Was this helpful?</p>
                      <div className="flex gap-1">
                        {[0, 1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            onClick={() => handleRateMessage(msg.message_id, star)}
                            className="w-7 h-7 flex items-center justify-center text-lg hover:scale-125 transition-transform"
                            title={star === 0 ? 'Not helpful' : `${star} stars`}
                          >
                            {star === 0 ? '👎' : '⭐'}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {msg.rating !== undefined && msg.rating !== null && (
                    <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                      <span>Your rating:</span>
                      <span className="font-medium">{msg.rating === 0 ? '👎 Not helpful' : `⭐ ${msg.rating}/5`}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-100">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>}

          {!isMinimized && error && (
            <div className="px-4 py-2 bg-red-50 text-red-700 text-sm border-t border-red-100">
              {error}
            </div>
          )}

          {!isMinimized && <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white rounded-b-2xl">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask me anything..."
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                disabled={loading || !sessionId}
              />
              <button
                type="submit"
                disabled={loading || !sessionId || !inputValue.trim()}
                className="w-10 h-10 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                aria-label="Send message"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">Powered by AI • Instant answers</p>
          </form>}
        </div>
      )}
    </>
  );
};

export default ChatWidget;
