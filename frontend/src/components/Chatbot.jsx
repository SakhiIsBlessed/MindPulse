import React, { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi! I'm your MindPulse assistant. How are you feeling today?", sender: 'bot' }
  ]);
  const [input, setInput] = useState('');

  const toggleChat = () => setIsOpen(!isOpen);

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
    <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 1000 }}>
      {!isOpen && (
        <button 
          onClick={toggleChat}
          className="btn btn-primary"
          style={{ borderRadius: '50%', width: '60px', height: '60px', padding: 0, boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)' }}
        >
          <MessageCircle size={28} />
        </button>
      )}

      {isOpen && (
        <div className="glass-card" style={{ width: '300px', height: '400px', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1rem', background: 'rgba(99, 102, 241, 0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)' }}>
            <h3 style={{ margin: 0, fontSize: '1rem' }}>MindPulse Assistant</h3>
            <button onClick={toggleChat} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
              <X size={20} />
            </button>
          </div>
          
          <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {messages.map(msg => (
              <div 
                key={msg.id} 
                style={{ 
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  background: msg.sender === 'user' ? 'var(--primary)' : 'rgba(255, 255, 255, 0.1)',
                  padding: '0.5rem 1rem',
                  borderRadius: '1rem',
                  maxWidth: '80%',
                  fontSize: '0.9rem'
                }}
              >
                {msg.text}
              </div>
            ))}
          </div>

          <form onSubmit={handleSend} style={{ padding: '0.5rem', borderTop: '1px solid var(--glass-border)', display: 'flex', gap: '0.5rem' }}>
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              style={{ flex: 1, background: 'rgba(0,0,0,0.2)', border: 'none', borderRadius: '0.5rem', padding: '0.5rem', color: 'white' }}
            />
            <button type="submit" style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}>
              <Send size={20} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
