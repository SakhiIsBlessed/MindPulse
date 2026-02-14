import React, { useState } from 'react';
import { AlertTriangle, LifeBuoy, Phone, HeartHandshake, Wind, Brain } from 'lucide-react';
import { motion } from 'framer-motion';

const BreathingGuide = () => {
  const [isBreathing, setIsBreathing] = useState(false);

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
      
      <div className="breathing-actions">
        <button 
          className={`btn ${isBreathing ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => {
            setIsBreathing(!isBreathing);
            alert(isBreathing ? 'Breathing exercise ended' : 'Start breathing: inhale...');
          }}
        >
          {isBreathing ? 'Stop' : 'Start'}
        </button>
        <button className="btn btn-secondary" onClick={() => alert('Guided audio coming soon!')}>
          🎵 Audio
        </button>
      </div>
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
            <blockquote className="motivation-quote">
              "Small steps every day lead to big changes."
            </blockquote>
            <p className="motivation-text">Remember that recovery and wellbeing is a journey. Be kind to yourself.</p>
            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              <button 
                className="btn btn-primary"
                onClick={() => alert('You have the strength to get through this. One day at a time! 💪')}
              >
                Need Inspiration?
              </button>
            </div>
          </motion.div>
        </div>

        {/* Sidebar */}
        <aside className="support-sidebar">
          {/* Breathing Guide */}
          <BreathingGuide />

          {/* Quick Contacts */}
          <motion.div className="glass-card quick-contacts small" variants={cardVariants}>
            <h3>Quick Contacts</h3>
            <div className="quick-contact-item">
              <Phone size={18} />
              <div>
                <div className="contact-label">Local Helpline</div>
                <div className="contact-value">85309 32462</div>
              </div>
            </div>
            <div className="quick-contact-item">
              <HeartHandshake size={18} />
              <div>
                <div className="contact-label">Peer Support</div>
                <div className="contact-value">mindpulse1801@gmail.com</div>
              </div>
            </div>
          </motion.div>

          {/* Resources Links */}
          <motion.div className="glass-card resource-links small" variants={cardVariants}>
            <h3>Helpful Resources</h3>
            <ul className="links-list">
              <li><a href="/help/sleep">🛌 Sleep Tips</a></li>
              <li><a href="/help/study-balance">⚖️ Study-Life Balance</a></li>
              <li><a href="/help/stress">😌 Stress Management</a></li>
              <li><a href="/help/nutrition">🥗 Nutrition Guide</a></li>
            </ul>
          </motion.div>
        </aside>
      </div>
    </motion.main>
  );
};

export default Support;
