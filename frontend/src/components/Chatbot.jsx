import React, { useState, useEffect, useRef } from 'react';
import './Chatbot.css';
import { MessageCircle, X, Send, Mic, Volume2, VolumeX, Heart, Music, Phone } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi there! I'm MindPulse, your wellness companion. 💜 How are you feeling today?",
      sender: 'bot',
      type: 'text'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(true); // Default sound on
  const [currentEmotion, setCurrentEmotion] = useState('neutral');
  const messagesEndRef = useRef(null);

  // Auto-scroll
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Emotion Emoji Map
  const emotionMap = {
    happy: '🌟',
    sad: '💙',
    stressed: '🌿',
    anxious: '💜',
    neutral: '🤖',
    distress: '🚨'
  };

  // Speech Recognition Setup
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = SpeechRecognition ? new SpeechRecognition() : null;

  if (recognition) {
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputText(transcript);
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };
  }

  const toggleListening = () => {
    if (isListening) {
      recognition?.stop();
      setIsListening(false);
    } else {
      recognition?.start();
      setIsListening(true);
    }
  };

  // Text to Speech
  const speak = (text) => {
    if (!isSpeaking) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.volume = 1;
    utterance.rate = 1;
    utterance.pitch = 1.1; // Slightly friendlier pitch
    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = async (text = inputText) => {
    if (!text.trim()) return;

    // Add User Message
    const newUserMsg = { id: Date.now(), text, sender: 'user', type: 'text' };
    setMessages(prev => [...prev, newUserMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      const response = await fetch('http://localhost:5001/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });

      const data = await response.json();

      setIsTyping(false);
      setCurrentEmotion(data.emotion || 'neutral');

      // Determine response type (check risk)
      if (data.risk) {
        const riskMsg = {
          id: Date.now() + 1,
          text: data.text,
          sender: 'bot',
          type: 'risk',
          suggestions: data.suggestions
        };
        setMessages(prev => [...prev, riskMsg]);
        speak(data.text);
      } else {
        const botMsg = {
          id: Date.now() + 1,
          text: data.text,
          sender: 'bot',
          type: 'text',
          suggestions: data.suggestions
        };
        setMessages(prev => [...prev, botMsg]);
        speak(data.text);
      }

    } catch (error) {
      console.error("Chat error:", error);
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: "I'm having a little trouble connecting right now. 😔 But I'm still here with you.",
        sender: 'bot',
        type: 'error'
      }]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSendMessage();
  };

  const handleSuggestionClick = (suggestion) => {
    handleSendMessage(`I'd like to try ${suggestion}`);
  };

  return (
    <div className="chatbot-container">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="chat-window"
          >
            {/* Header */}
            <div className="chat-header">
              <div className="header-info">
                <div className="bot-avatar">
                  {emotionMap[currentEmotion] || '🤖'}
                </div>
                <div className="bot-status">
                  MindPulse AI
                  <span>Online & Listening 🌿</span>
                </div>
              </div>
              <div className="header-controls">
                <button onClick={() => setIsSpeaking(!isSpeaking)} className="icon-btn" style={{ color: 'white' }}>
                  {isSpeaking ? <Volume2 size={18} /> : <VolumeX size={18} />}
                </button>
                <button onClick={() => setIsOpen(false)} className="icon-btn" style={{ color: 'white' }}>
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="messages-area">
              {messages.map((msg) => (
                <div key={msg.id} style={{ display: 'flex', flexDirection: 'column' }}>
                  <div className={`message ${msg.sender === 'user' ? 'user-message' : 'bot-message'} ${msg.type === 'error' ? 'error' : ''}`}>
                    {msg.text}
                  </div>
                  {/* Risk Panel */}
                  {msg.type === 'risk' && (
                    <div className="risk-panel">
                      <div className="risk-title"><Phone size={16} /> Help Resources</div>
                      <div>You are important. Please reach out:</div>
                      <ul className="risk-resources">
                        {msg.suggestions?.map((rec, idx) => (
                          <li key={idx}>🔹 {rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {/* Suggestion Chips (only on latest bot message) */}
                  {msg.sender === 'bot' && msg.suggestions && msg.id === messages[messages.length - 1].id && !msg.type.includes('risk') && (
                    <div className="suggestion-chips">
                      {msg.suggestions.map((chip, idx) => (
                        <button key={idx} className="chip" onClick={() => handleSuggestionClick(chip)}>
                          {chip}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {isTyping && (
                <div className="typing-indicator">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="input-area">
              <button
                onClick={toggleListening}
                className={`icon-btn ${isListening ? 'listening' : ''}`}
                title="Speak"
              >
                <Mic size={20} />
              </button>
              <input
                type="text"
                className="chat-input"
                placeholder="Type a message..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button onClick={() => handleSendMessage()} className="icon-btn active">
                <Send size={20} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button className="chatbot-toggle" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
      </button>
    </div>
  );
};

export default Chatbot;
