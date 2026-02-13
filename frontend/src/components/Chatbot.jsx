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
            boxShadow: '0 4px 20px rgba(99, 102, 241, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.1)';
            e.target.style.boxShadow = '0 6px 30px rgba(99, 102, 241, 0.8)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)';
            e.target.style.boxShadow = '0 4px 20px rgba(99, 102, 241, 0.6)';
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
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.15) 100%)',
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Sparkles size={22} color="#6366f1" />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600' }}>MindPulse AI</h3>
              </div>
              <button 
                onClick={toggleChat} 
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: 'white', 
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
                        ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' 
                        : 'rgba(99, 102, 241, 0.15)',
                      padding: '0.75rem 1rem',
                      borderRadius: msg.sender === 'user' ? '1rem 1rem 0.25rem 1rem' : '1rem 1rem 1rem 0.25rem',
                      fontSize: '0.95rem',
                      lineHeight: '1.4',
                      border: msg.sender === 'user' ? 'none' : '1px solid rgba(99, 102, 241, 0.3)',
                      boxShadow: msg.sender === 'user' ? '0 2px 8px rgba(99, 102, 241, 0.3)' : 'none'
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
                borderTop: '1px solid rgba(255, 255, 255, 0.1)', 
                display: 'flex', 
                gap: '0.75rem',
                background: 'rgba(0, 0, 0, 0.1)'
              }}
            >
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                style={{ 
                  flex: 1, 
                  background: 'rgba(30, 41, 59, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '0.75rem', 
                  padding: '0.75rem 1rem', 
                  color: 'white',
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
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  border: 'none', 
                  color: 'white', 
                  cursor: 'pointer',
                  padding: '0.75rem 1rem',
                  borderRadius: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                  boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)'
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
