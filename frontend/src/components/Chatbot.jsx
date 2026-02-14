import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi! I'm your MindPulse assistant. How are you feeling today?", sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const toggleChat = () => setIsOpen(!isOpen);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMsg = { id: Date.now(), text: input, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    // Simulate bot response
    setTimeout(() => {
      const botMsg = { 
        id: Date.now() + 1, 
        text: "Thanks for sharing. Remember to log your mood in the journal! I'm here to listen.", 
        sender: 'bot' 
      };
      setMessages(prev => [...prev, botMsg]);
    }, 1000);
  };

  return (
    <>
      {!isOpen && (
        <button 
          onClick={toggleChat}
          className="btn btn-primary"
          style={{ 
            position: 'fixed',
            bottom: '2rem', 
            right: '2rem', 
            zIndex: 1000,
            borderRadius: '50%', 
            width: '60px', 
            height: '60px', 
            padding: 0, 
            boxShadow: '0 6px 24px rgba(108, 92, 231, 0.18)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.1)';
            e.target.style.boxShadow = '0 8px 32px rgba(108, 92, 231, 0.22)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)';
            e.target.style.boxShadow = '0 6px 24px rgba(108, 92, 231, 0.18)';
          }}
        >
          <MessageCircle size={28} />
        </button>
      )}

      {isOpen && (
        <div style={{ 
          position: 'fixed',
          bottom: '2rem', 
          right: '2rem', 
          zIndex: 1000,
          animation: 'slideUp 0.3s ease-out'
        }}>
          <style>{`
            @keyframes slideUp {
              from {
                opacity: 0;
                transform: translateY(20px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          `}</style>
          
          <div className="glass-card" style={{ 
            width: '380px', 
            height: '500px', 
            display: 'flex', 
            flexDirection: 'column', 
            padding: 0, 
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)'
          }}>
            {/* Header */}
            <div style={{ 
              padding: '1.25rem', 
              background: 'var(--gradient-primary)',
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              borderBottom: '1px solid var(--glass-border)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Sparkles size={22} color="var(--primary)" />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-dark)' }}>MindPulse AI</h3>
              </div>
              <button 
                onClick={toggleChat} 
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: 'var(--text-dark)', 
                  cursor: 'pointer',
                  padding: '0.5rem',
                  borderRadius: '0.5rem',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center'
                }}
                onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.1)'}
                onMouseLeave={(e) => e.target.style.background = 'none'}
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Messages Container */}
            <div style={{ 
              flex: 1, 
              padding: '1rem', 
              overflowY: 'auto',
              display: 'flex', 
              flexDirection: 'column', 
              gap: '0.75rem'
            }}>
              {messages.map((msg, idx) => (
                <div 
                  key={msg.id} 
                  style={{ 
                    alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                    animation: `fadeIn 0.3s ease ${idx * 0.05}s backwards`,
                    maxWidth: '85%'
                  }}
                >
                  <div
                    style={{
                      background: msg.sender === 'user' 
                            ? 'var(--gradient-primary)' 
                            : 'rgba(108, 92, 231, 0.08)',
                      padding: '0.75rem 1rem',
                      borderRadius: msg.sender === 'user' ? '1rem 1rem 0.25rem 1rem' : '1rem 1rem 1rem 0.25rem',
                      fontSize: '0.95rem',
                      lineHeight: '1.4',
                          border: msg.sender === 'user' ? 'none' : '1px solid rgba(108, 92, 231, 0.12)',
                          boxShadow: msg.sender === 'user' ? '0 4px 12px rgba(108, 92, 231, 0.08)' : 'none',
                          color: msg.sender === 'user' ? '#ffffff' : 'var(--text-dark)'
                    }}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form 
              onSubmit={handleSend} 
              style={{ 
                padding: '1rem', 
                borderTop: '1px solid var(--glass-border)', 
                display: 'flex', 
                gap: '0.75rem',
                background: 'transparent'
              }}
            >
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                style={{ 
                  flex: 1, 
                  background: '#fff',
                  border: '1px solid rgba(15, 23, 42, 0.06)',
                  borderRadius: '0.75rem', 
                  padding: '0.75rem 1rem', 
                  color: 'var(--text-dark)',
                  fontSize: '0.9rem',
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = 'rgba(99, 102, 241, 0.5)'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)'}
              />
              <button 
                type="submit" 
                style={{ 
                  background: 'var(--gradient-primary)',
                  border: 'none', 
                  color: 'white', 
                  cursor: 'pointer',
                  padding: '0.75rem 1rem',
                  borderRadius: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                  boxShadow: '0 4px 12px rgba(108, 92, 231, 0.12)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'scale(1.05)';
                  e.target.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)';
                  e.target.style.boxShadow = '0 2px 8px rgba(99, 102, 241, 0.3)';
                }}
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
};

export default Chatbot;
