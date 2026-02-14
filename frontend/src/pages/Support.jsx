import React from 'react';
import { AlertTriangle, LifeBuoy, Phone, HeartHandshake } from 'lucide-react';
import { motion } from 'framer-motion';

const BreathingGuide = () => (
  <div className="glass-card small">
    <h3>Quick 60s Breathing</h3>
    <p>Follow this simple box-breathing exercise to calm your mind.</p>
    <ol>
      <li>Inhale for 4 seconds</li>
      <li>Hold for 4 seconds</li>
      <li>Exhale for 4 seconds</li>
      <li>Hold for 4 seconds</li>
    </ol>
    <div className="btn-row">
      <button className="btn" onClick={() => alert('Start breathing: inhale...')}>Start</button>
      <button className="btn" onClick={() => alert('Guided audio not available')}>Play audio</button>
    </div>
  </div>
);

const Support = ({ risk = 'low', recommendations = [] }) => {
  const isHigh = risk === 'high';
  const aiRec = recommendations.length ? recommendations : [
    'Try a 5 minute walk and journal one positive thing',
    'Practice box breathing for 60 seconds',
    'Reach out to a friend or counselor for support',
  ];

  return (
    <motion.main className="page-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {isHigh && (
        <div className="alert high">
          <AlertTriangle />
          <div>
            <strong>Immediate support recommended</strong>
            <div>If you feel you might be at risk, call your local emergency number or the helpline below.</div>
          </div>
        </div>
      )}

      <section style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '1rem' }}>
        <div>
          <div className="glass-card">
            <h2>AI Recommendations</h2>
            <p>Personalized suggestions based on your recent mood entries.</p>
            <ul className="rec-list">
              {aiRec.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>

          <div className="glass-card">
            <h2>Counselor & Campus Resources</h2>
            <p>Contact the campus counselor for professional help.</p>
            <div className="contact-row">
              <LifeBuoy /> <div>
                <strong>Campus Counselor</strong>
                <div>counselor@university.edu | Ext: 1234</div>
              </div>
            </div>

            <div className="contact-row">
              <Phone /> <div>
                <strong>Emergency Helpline</strong>
                <div>85309 32462 (24/7)</div>
                <div>96073 40088 (24/7)</div>
              </div>
            </div>
          </div>

          <div className="glass-card">
            <h2>Motivation</h2>
            <blockquote className="motivation">“Small steps every day lead to big changes.”</blockquote>
            <div style={{ textAlign: 'right' }}>
              <button className="btn btn-primary" onClick={() => alert('You are doing great — keep going!')}>Inspire Me</button>
            </div>
          </div>
        </div>

        <aside>
          <BreathingGuide />

          <div className="glass-card small">
            <h3>Quick Contacts</h3>
            <div className="contact-row"><Phone /> <div>Local Helpline: 85309 32462</div></div>
            <div className="contact-row"><HeartHandshake /> <div>Peer Support: mindpulse1801@gmail.com</div></div>
          </div>

          <div className="glass-card small">
            <h3>Resources</h3>
            <ul>
              <li><a href="/help/sleep">Sleep tips</a></li>
              <li><a href="/help/study-balance">Study-life balance</a></li>
            </ul>
          </div>
        </aside>
      </section>
    </motion.main>
  );
};

export default Support;
