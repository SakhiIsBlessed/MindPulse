import React, { useState, useEffect } from 'react';
import { AlertTriangle, LifeBuoy, Phone, HeartHandshake, Wind, Brain, Plus, X, Edit2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import AffirmationWidget from '../components/AffirmationWidget';

const BreathingGuide = () => {
  const [isBreathing, setIsBreathing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = React.useRef(null);

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
        setIsBreathing(true);
      }
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setIsBreathing(false);
    setCurrentTime(0);
  };

  const formatTime = (time) => {
    if (!time || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const progressPercent = duration ? (currentTime / duration) * 100 : 0;

  return (
    <motion.div className="glass-card breathing-card small" whileHover={{ scale: 1.02 }}>
      <div className="breathing-header">
        <Wind size={24} className="breathing-icon" />
        <h3>Box Breathing Guide</h3>
      </div>
      <p className="breathing-description">60-second calming exercise</p>

      <div className="breathing-instructions">
        <div className="breath-step">
          <div className="step-number">1</div>
          <div className="step-text">Inhale for 4 seconds</div>
        </div>
        <div className="breath-step">
          <div className="step-number">2</div>
          <div className="step-text">Hold for 4 seconds</div>
        </div>
        <div className="breath-step">
          <div className="step-number">3</div>
          <div className="step-text">Exhale for 4 seconds</div>
        </div>
        <div className="breath-step">
          <div className="step-number">4</div>
          <div className="step-text">Hold for 4 seconds</div>
        </div>
      </div>

      {/* Audio Player */}
      <audio
        ref={audioRef}
        src="/box-breathing-guide.mp3"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />

      {isPlaying && (
        <div className="audio-progress-bar" style={{ marginBottom: '0.75rem' }}>
          <div
            className="progress-fill"
            style={{
              width: `${progressPercent}%`,
              height: '4px',
              backgroundColor: '#8b5cf6',
              borderRadius: '2px'
            }}
          />
        </div>
      )}

      {isPlaying && (
        <div className="audio-time-display" style={{
          fontSize: '0.75rem',
          color: '#a0aec0',
          textAlign: 'center',
          marginBottom: '0.75rem'
        }}>
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      )}

      <div className="breathing-actions">
        <button
          className={`btn ${isBreathing ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => {
            setIsBreathing(!isBreathing);
            if (!isBreathing) {
              alert('Take slow, deep breaths. Follow the 4-4-4-4 pattern.');
            }
          }}
        >
          {isBreathing ? '⏸ Pause' : '⏵ Breathe'}
        </button>
        <button
          className={`btn ${isPlaying ? 'btn-primary' : 'btn-secondary'}`}
          onClick={handlePlayPause}
        >
          {isPlaying ? '⏸ Pause' : '🎵 Play Guide'}
        </button>
      </div>
    </motion.div>
  );
};

const EmergencyContact = ({ isHighRisk = false }) => {
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', relation: '' });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch contacts from database on mount
  useEffect(() => {
    fetchContacts();
  }, []);

  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  const fetchContacts = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getAuthToken();

      if (!token) {
        setEmergencyContacts([]);
        setLoading(false);
        return;
      }

      const response = await fetch('/api/user/emergency-contacts', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setEmergencyContacts(data);
      } else if (response.status === 401) {
        setEmergencyContacts([]);
      } else {
        throw new Error(`Failed to fetch contacts: ${response.statusText}`);
      }
    } catch (err) {
      console.error('Error fetching emergency contacts:', err);
      setError(err.message);
      setEmergencyContacts([]);
    } finally {
      setLoading(false);
    }
  };

  // Add or update contact
  const handleSaveContact = async () => {
    if (!formData.name || !formData.phone || !formData.relation) {
      alert('Please fill all fields');
      return;
    }

    try {
      const token = getAuthToken();
      if (!token) {
        alert('Please log in first');
        return;
      }

      let response;

      if (editingId) {
        // Update existing
        response = await fetch(`/api/user/emergency-contacts/${editingId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        });
      } else {
        // Add new
        response = await fetch('/api/user/emergency-contacts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        });
      }

      if (response.ok) {
        await fetchContacts();
        setFormData({ name: '', phone: '', relation: '' });
        setEditingId(null);
        setShowForm(false);
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (err) {
      console.error('Error saving contact:', err);
      alert(`Error saving contact: ${err.message}`);
    }
  };

  // Delete contact
  const handleDeleteContact = async (id) => {
    if (window.confirm('Remove this emergency contact?')) {
      try {
        const token = getAuthToken();
        const response = await fetch(`/api/user/emergency-contacts/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          await fetchContacts();
        } else {
          const error = await response.json();
          alert(`Error: ${error.message}`);
        }
      } catch (err) {
        console.error('Error deleting contact:', err);
        alert(`Error deleting contact: ${err.message}`);
      }
    }
  };

  // Start editing
  const handleEditContact = (contact) => {
    setFormData({ name: contact.name, phone: contact.phone, relation: contact.relation });
    setEditingId(contact.id);
    setShowForm(true);
  };

  // Make call
  const handleCall = (phone) => {
    window.location.href = `tel:${phone}`;
  };

  return (
    <motion.div className="glass-card emergency-contact-card small" whileHover={{ scale: 1.02 }}>
      <div className="emergency-header">
        <Phone size={24} className="emergency-icon" style={{ color: '#ef4444' }} />
        <h3>Emergency Contact</h3>
      </div>

      {error && (
        <div style={{ padding: '0.5rem', backgroundColor: '#fee2e2', borderRadius: '0.375rem', marginBottom: '0.75rem' }}>
          <p style={{ fontSize: '0.875rem', color: '#991b1b' }}>⚠️ Error loading contacts</p>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '1rem' }}>
          <p style={{ color: '#a0aec0' }}>Loading contacts...</p>
        </div>
      ) : emergencyContacts.length === 0 ? (
        <div className="no-contact-state">
          <p className="no-contact-text">No emergency contact set up yet</p>
          <button
            className="btn btn-secondary"
            onClick={() => {
              setShowForm(true);
              setEditingId(null);
              setFormData({ name: '', phone: '', relation: '' });
            }}
          >
            <Plus size={16} /> Add Contact
          </button>
        </div>
      ) : (
        <>
          {/* Display Emergency Contacts */}
          <div className="emergency-contacts-list">
            {emergencyContacts.map((contact) => (
              <motion.div
                key={contact.id}
                className="emergency-contact-item"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="contact-info">
                  <div className="contact-name">{contact.name}</div>
                  <div className="contact-relation" style={{ fontSize: '0.75rem', color: '#a0aec0' }}>
                    {contact.relation}
                  </div>
                </div>

                <div className="contact-actions">
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => handleCall(contact.phone)}
                    title={`Call ${contact.name}`}
                  >
                    <Phone size={16} /> Call
                  </button>
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => handleEditContact(contact)}
                    title="Edit"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDeleteContact(contact.id)}
                    title="Delete"
                  >
                    <X size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Add Another Contact Button */}
          {emergencyContacts.length > 0 && (
            <button
              className="btn btn-secondary btn-block"
              onClick={() => {
                setShowForm(true);
                setEditingId(null);
                setFormData({ name: '', phone: '', relation: '' });
              }}
              style={{ marginTop: '0.75rem' }}
            >
              <Plus size={16} /> Add Another
            </button>
          )}
        </>
      )}

      {/* Form Modal (rendered via portal to avoid stacking issues) */}
      {showForm && createPortal(
        <motion.div
          className="form-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            setShowForm(false);
            setEditingId(null);
            setFormData({ name: '', phone: '', relation: '' });
          }}
        >
          <motion.div
            className="form-modal"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="form-header">
              <h4>{editingId ? 'Edit Emergency Contact' : 'Add Emergency Contact'}</h4>
              <button
                className="btn-close"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setFormData({ name: '', phone: '', relation: '' });
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="form-body">
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  placeholder="e.g., Mom, Best Friend"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  placeholder="e.g., +1-555-0123"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Relation *</label>
                <select
                  value={formData.relation}
                  onChange={(e) => setFormData({ ...formData, relation: e.target.value })}
                >
                  <option value="">-- Select --</option>
                  <option value="Parent">Parent</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Friend">Friend</option>
                  <option value="Partner">Partner</option>
                  <option value="Counselor">Counselor</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-actions">
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setFormData({ name: '', phone: '', relation: '' });
                  }}
                >
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleSaveContact}>
                  {editingId ? 'Update' : 'Add'} Contact
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>,
        document.body
      )}

      {/* High Risk Alert with Call CTA */}
      {isHighRisk && emergencyContacts.length > 0 && (
        <motion.div
          className="high-risk-alert"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            marginTop: '0.75rem',
            padding: '0.75rem',
            backgroundColor: '#fee2e2',
            borderRadius: '0.5rem',
            border: '1px solid #fca5a5'
          }}
        >
          <p style={{ fontSize: '0.875rem', color: '#991b1b', marginBottom: '0.5rem' }}>
            ⚠️ Reach out to your emergency contact now
          </p>
          {emergencyContacts.slice(0, 1).map((contact) => (
            <button
              key={contact.id}
              className="btn btn-danger btn-block"
              onClick={() => handleCall(contact.phone)}
              style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                padding: '0.5rem'
              }}
            >
              📞 Call {contact.name} Now
            </button>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};

const Support = ({ risk = 'low', recommendations = [] }) => {
  const isHigh = risk === 'high';
  const aiRec = recommendations.length ? recommendations : [
    'Try a 5 minute walk and journal one positive thing',
    'Practice box breathing for 60 seconds',
    'Reach out to a friend or counselor for support',
  ];

  // Sentiment alert states
  const [sentimentAlert, setSentimentAlert] = useState(null);
  const [checkingSentiment, setCheckingSentiment] = useState(false);
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [sendingAlert, setSendingAlert] = useState(false);

  // Check journal sentiment pattern on component mount
  useEffect(() => {
    checkJournalSentiment();
  }, []);

  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  const checkJournalSentiment = async () => {
    try {
      setCheckingSentiment(true);
      const token = getAuthToken();
      
      if (!token) return;

      // Fetch recent journal entries
      const journalRes = await fetch('/api/journal', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!journalRes.ok) return;

      const entries = await journalRes.json();
      if (!Array.isArray(entries) || entries.length === 0) return;

      // Fetch emergency contacts
      const contactsRes = await fetch('/api/user/emergency-contacts', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (contactsRes.ok) {
        const contacts = await contactsRes.json();
        setEmergencyContacts(contacts);
      }

      // Analyze sentiment from last 5 entries
      const negativeKeywords = ['sad', 'depressed', 'stressed', 'stress', 'anxious', 'anxiety', 'worried', 'worry', 'upset', 'angry', 'frustrated', 'lonely', 'alone', 'hopeless', 'helpless'];
      
      let negativeCount = 0;
      const recentEntries = entries.slice(0, 5);

      recentEntries.forEach(entry => {
        const content = (entry.content || '').toLowerCase();
        const label = (entry.sentiment_label || '').toLowerCase();
        
        if (label === 'negative' || negativeKeywords.some(kw => content.includes(kw))) {
          negativeCount++;
        }
      });

      const negativePercentage = (negativeCount / recentEntries.length) * 100;

      // If more than 60% of recent entries are negative, show alert
      if (negativePercentage >= 60) {
        setSentimentAlert({
          shows: true,
          message: `We've detected continuous stress and negative sentiment in your recent entries (${negativePercentage.toFixed(0)}% of last ${recentEntries.length} entries).`,
          negativePercentage: negativePercentage.toFixed(0),
          hasContacts: contacts && contacts.length > 0,
          contacts: contacts || []
        });
      }
    } catch (err) {
      console.error('Error checking sentiment:', err);
    } finally {
      setCheckingSentiment(false);
    }
  };

  const sendEmergencyAlert = async (contactId) => {
    try {
      setSendingAlert(true);
      const token = getAuthToken();

      const response = await fetch('/api/user/alert-emergency-contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ contactId })
      });

      const data = await response.json();

      if (data.success) {
        // In a real app, you'd send the WhatsApp message here
        // For now, we'll show a success message
        const contact = sentimentAlert.contacts.find(c => c.id === contactId);
        alert(`✓ Alert ready to send to ${contact.name}!\n\nMessage: "${data.sentimentAnalysis.whatsappMessage}"\n\nNote: In production, this would be sent via WhatsApp.`);
        setSentimentAlert(null);
      } else {
        alert(`Alert not sent: ${data.message}`);
      }
    } catch (err) {
      console.error('Error sending alert:', err);
      alert('Failed to send alert. Please try again.');
    } finally {
      setSendingAlert(false);
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  return (
    <motion.main
      className="page-container support-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      variants={containerVariants}
    >
      {isHigh && (
        <motion.div className="alert high" variants={cardVariants}>
          <div className="alert-icon">
            <AlertTriangle />
          </div>
          <div className="alert-content">
            <strong>Immediate Support Recommended</strong>
            <p>If you feel you might be at risk, please contact your local emergency services or reach out to one of our helplines below. You are not alone.</p>
          </div>
        </motion.div>
      )}

      {sentimentAlert && sentimentAlert.shows && (
        <motion.div 
          className="alert high" 
          variants={cardVariants}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            marginBottom: '2rem',
            padding: '1.5rem',
            backgroundColor: '#fff7ed',
            borderLeft: '4px solid #fb923c'
          }}
        >
          <div className="alert-icon" style={{ color: '#fb923c' }}>
            <AlertTriangle />
          </div>
          <div className="alert-content">
            <strong>Continuous Stress Detected</strong>
            <p>{sentimentAlert.message}</p>
            {sentimentAlert.hasContacts && sentimentAlert.contacts.length > 0 && (
              <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <p style={{ width: '100%', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#666' }}>
                  📢 Would you like to notify an emergency contact?
                </p>
                {sentimentAlert.contacts.map(contact => (
                  <button
                    key={contact.id}
                    onClick={() => sendEmergencyAlert(contact.id)}
                    disabled={sendingAlert}
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: '0.375rem',
                      border: 'none',
                      backgroundColor: '#10b981',
                      color: '#fff',
                      cursor: sendingAlert ? 'not-allowed' : 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      opacity: sendingAlert ? 0.6 : 1
                    }}
                  >
                    {sendingAlert ? '⏳ Sending...' : `💬 Message ${contact.name}`}
                  </button>
                ))}
              </div>
            )}
            {!sentimentAlert.hasContacts && (
              <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#666' }}>
                ⚠️ Please add an emergency contact to receive alerts.
              </p>
            )}
          </div>
        </motion.div>
      )}

      <div className="support-grid">
        {/* Main Content */}
        <div className="support-main">
          {/* AI Recommendations */}
          <motion.div className="glass-card support-section" variants={cardVariants}>
            <div className="section-header">
              <Brain size={28} />
              <div>
                <h2>AI Recommendations</h2>
                <p className="section-description">Personalized suggestions based on your mood entries</p>
              </div>
            </div>

            <ul className="rec-list">
              {aiRec.map((r, i) => (
                <motion.li
                  key={i}
                  className="rec-item"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <span className="rec-bullet">•</span>
                  <span>{r}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Counselor & Resources */}
          <motion.div className="glass-card support-section" variants={cardVariants}>
            <div className="section-header">
              <LifeBuoy size={28} />
              <div>
                <h2>Professional Resources</h2>
                <p className="section-description">Get help from qualified professionals</p>
              </div>
            </div>

            <div className="resources-grid">
              <div className="resource-card">
                <div className="resource-title">Campus Counselor</div>
                <div className="resource-details">
                  <p>📧 counselor@university.edu</p>
                  <p>📞 Ext: 1234</p>
                </div>
              </div>

              <div className="resource-card">
                <div className="resource-title">Emergency Helpline (24/7)</div>
                <div className="resource-details">
                  <p>📞 85309 32462</p>
                  <p>📞 96073 40088</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Motivation */}
          <motion.div className="glass-card support-section motivation-section" variants={cardVariants}>
            <h2>Daily Motivation</h2>
            <AffirmationWidget />
            <p className="motivation-text" style={{ marginTop: '1rem' }}>Remember that recovery and wellbeing is a journey. Be kind to yourself.</p>
          </motion.div>
        </div>

        {/* Sidebar */}
        <aside className="support-sidebar">
          {/* Breathing Guide */}
          <BreathingGuide />

          {/* Emergency Contact */}
          <EmergencyContact isHighRisk={isHigh} />

          {/* Quick Contacts */}
          <motion.div className="glass-card quick-contacts small" variants={cardVariants}>
            <h3>Quick Contacts</h3>
            <div className="quick-contact-item">
              <Phone size={18} />
              <div>
                <div className="contact-label">Local Helpline</div>
                <div className="contact-value">
                  <a href="tel:8530932462" className="contact-link" style={{color: '#000'}}>85309 32462</a>
                </div>
              </div>
            </div>
            <div className="quick-contact-item">
              <HeartHandshake size={18} />
              <div>
                <div className="contact-label">Peer Support</div>
                <div className="contact-value">
                  <a href="https://mail.google.com/mail/?view=cm&fs=1&to=mindpulse1801@gmail.com" target="_blank" rel="noopener noreferrer" className="contact-link" style={{color: '#000'}}>mindpulse1801@gmail.com</a>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Resources Links */}
          <motion.div className="glass-card resource-links small" variants={cardVariants}>
            <h3>Helpful Resources</h3>
            <ul className="links-list">
              <li><Link to="/help/sleep">🛌 Sleep Tips</Link></li>
              <li><Link to="/help/study-balance">⚖️ Study-Life Balance</Link></li>
              <li><Link to="/help/stress">😌 Stress Management</Link></li>
              <li><Link to="/help/nutrition">🥗 Nutrition Guide</Link></li>
            </ul>
          </motion.div>
        </aside>
      </div>
    </motion.main>
  );
};

export default Support;
