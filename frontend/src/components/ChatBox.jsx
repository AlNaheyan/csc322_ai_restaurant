import { useState, useEffect, useRef } from 'react';
import { chatService } from '../services/chatService';

const ChatBox = () => {
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
    const initSession = async () => {
      try {
        const result = await chatService.createSession();
        setSessionId(result.data.session_id);
      } catch (err) {
        setError('Failed to start chat session');
      }
    };
    initSession();
  }, []);

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
    <div style={{
      backgroundColor: 'white',
      borderRadius: '16px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
      overflow: 'hidden',
      border: '1px solid #e5e7eb',
      height: '650px',
      display: 'flex',
      flexDirection: 'column',
      maxWidth: '900px',
      margin: '0 auto'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #9333ea 0%, #7c3aed 100%)',
        color: 'white',
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>Restaurant Assistant</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
            <div style={{
              width: '8px',
              height: '8px',
              backgroundColor: '#4ade80',
              borderRadius: '50%',
              animation: 'pulse 2s infinite'
            }}></div>
            <span style={{ fontSize: '13px', opacity: 0.9 }}>Online Now</span>
          </div>
        </div>
      </div>

      {error && (
        <div style={{
          padding: '12px 20px',
          backgroundColor: '#fef2f2',
          color: '#dc2626',
          fontSize: '14px',
          borderBottom: '1px solid #fecaca'
        }}>
          {error}
        </div>
      )}

      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '24px',
        backgroundColor: '#f9fafb'
      }}>
        {messages.length === 0 && !loading && (
          <div style={{ textAlign: 'center', marginTop: '60px' }}>
            <p style={{ color: '#6b7280', fontSize: '18px', fontWeight: '500', marginBottom: '8px' }}>
              Welcome! How can I help you today?
            </p>
            <p style={{ color: '#9ca3af', fontSize: '14px' }}>
              Ask me about our menu, policies, delivery, and more
            </p>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {messages.map((msg, idx) => (
            <div key={idx} style={{
              display: 'flex',
              justifyContent: msg.message_type === 'user' ? 'flex-end' : 'flex-start'
            }}>
              <div style={{
                maxWidth: '70%',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}>
                {msg.message_type === 'bot' && (
                  <span style={{
                    fontSize: '12px',
                    color: '#9ca3af',
                    marginLeft: '12px',
                    marginBottom: '2px'
                  }}>
                    Restaurant Assistant
                  </span>
                )}

                <div style={{
                  backgroundColor: msg.message_type === 'user' ? '#9333ea' : 'white',
                  color: msg.message_type === 'user' ? 'white' : '#1f2937',
                  padding: '14px 18px',
                  borderRadius: '16px',
                  boxShadow: msg.message_type === 'bot' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  border: msg.message_type === 'bot' ? '1px solid #e5e7eb' : 'none'
                }}>
                  <p style={{ margin: 0, fontSize: '15px', lineHeight: '1.5' }}>{msg.content}</p>

                  {msg.message_type === 'bot' && msg.source && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      marginTop: '12px',
                      paddingTop: '12px',
                      borderTop: '1px solid #f3f4f6'
                    }}>
                      <div style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: msg.source === 'knowledge_base' ? '#10b981' : msg.source === 'ollama' ? '#8b5cf6' : '#9ca3af'
                      }}></div>
                      <span style={{ fontSize: '11px', color: '#6b7280', textTransform: 'capitalize' }}>
                        {msg.source.replace('_', ' ')}
                      </span>
                    </div>
                  )}

                  {msg.message_type === 'bot' && msg.kb_article_id && !msg.rating && (
                    <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f3f4f6' }}>
                      <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 10px 0', fontWeight: '600' }}>
                        Was this helpful?
                      </p>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {[0, 1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            onClick={() => handleRateMessage(msg.message_id, star)}
                            style={{
                              width: '32px',
                              height: '32px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '16px',
                              background: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              borderRadius: '8px',
                              transition: 'all 0.2s'
                            }}
                            title={star === 0 ? 'Not helpful' : `${star} stars`}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            {star === 0 ? '👎' : '⭐'}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {msg.rating !== undefined && msg.rating !== null && (
                    <div style={{
                      marginTop: '12px',
                      paddingTop: '12px',
                      borderTop: '1px solid #f3f4f6',
                      fontSize: '12px',
                      color: '#6b7280'
                    }}>
                      {msg.rating === 0 ? '👎 Marked as not helpful' : `⭐ Rated ${msg.rating}/5 stars`}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <div style={{
                backgroundColor: 'white',
                padding: '14px 18px',
                borderRadius: '16px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    backgroundColor: '#9333ea',
                    borderRadius: '50%',
                    animation: 'bounce 1.4s infinite ease-in-out both'
                  }}></div>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    backgroundColor: '#9333ea',
                    borderRadius: '50%',
                    animation: 'bounce 1.4s infinite ease-in-out both',
                    animationDelay: '0.16s'
                  }}></div>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    backgroundColor: '#9333ea',
                    borderRadius: '50%',
                    animation: 'bounce 1.4s infinite ease-in-out both',
                    animationDelay: '0.32s'
                  }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div style={{
        padding: '20px',
        borderTop: '1px solid #e5e7eb',
        backgroundColor: 'white'
      }}>
        <form onSubmit={handleSendMessage} style={{ position: 'relative' }}>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Reply to Restaurant Assistant..."
            disabled={loading || !sessionId}
            style={{
              width: '100%',
              padding: '14px 50px 14px 18px',
              border: '2px solid #e5e7eb',
              borderRadius: '24px',
              fontSize: '15px',
              outline: 'none',
              transition: 'border-color 0.2s',
              backgroundColor: '#f9fafb',
              color: '#000000'
            }}
            onFocus={(e) => e.target.style.borderColor = '#9333ea'}
            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
          />
          <button
            type="submit"
            disabled={loading || !sessionId || !inputValue.trim()}
            style={{
              position: 'absolute',
              right: '6px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '40px',
              height: '40px',
              backgroundColor: inputValue.trim() ? '#9333ea' : '#e5e7eb',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              cursor: inputValue.trim() ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.2s'
            }}
          >
            <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
        <p style={{
          margin: '12px 0 0 0',
          textAlign: 'center',
          fontSize: '12px',
          color: '#9ca3af'
        }}>
          Powered by AI Assistant
        </p>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default ChatBox;
