import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Youtube, Lightbulb, ThumbsUp, ThumbsDown, ArrowLeft, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { helpContent } from '../data/helpContent';
import Skeleton from '../components/Skeleton';

const HelpTopic = () => {
  const { topic } = useParams();
  const content = helpContent[topic];
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    // Simulate content loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);

    // Check for existing feedback in localStorage
    const savedFeedback = localStorage.getItem(`help_feedback_${topic}`);
    if (savedFeedback) {
      setFeedback(savedFeedback);
    }

    return () => clearTimeout(timer);
  }, [topic]);

  const handleFeedback = (type) => {
    setFeedback(type);
    localStorage.setItem(`help_feedback_${topic}`, type);
  };

  if (!content && !loading) {
    return (
      <main className="page-container">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card" 
          style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center', padding: '3rem' }}
        >
          <AlertCircle size={64} color="#ef4444" style={{ marginBottom: '1.5rem', opacity: 0.8 }} />
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Topic Not Found</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
            Sorry, we couldn't find the help resources you're looking for.
          </p>
          <Link to="/support" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <ArrowLeft size={18} /> Back to Support
          </Link>
        </motion.div>
      </main>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <main className="page-container stress-help-container">
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          style={{ marginBottom: '1.5rem' }}
        >
          <Link to="/support" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 500 }}>
            <ArrowLeft size={16} /> Back to Support
          </Link>
        </motion.div>

        <motion.div 
          className="glass-card"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ padding: '2.5rem', textAlign: 'left' }}
        >
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Skeleton width="60%" height="32px" />
              <Skeleton width="90%" height="20px" />
              <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <Skeleton height="150px" />
                <Skeleton height="60px" />
                <Skeleton height="60px" />
              </div>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <span style={{ fontSize: '2.5rem' }}>{content.icon}</span>
                <h1 style={{ margin: 0, fontSize: '2.2rem' }}>{content.title}</h1>
              </div>
              <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '2.5rem', lineHeight: 1.6 }}>
                {content.description}
              </p>

              <div style={{ marginBottom: '3rem' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                   <Lightbulb size={20} color="var(--primary)" /> Recommended Tips
                </h3>
                <motion.div 
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}
                >
                  {content.tips.map((tip, idx) => (
                    <motion.div 
                      key={idx}
                      variants={itemVariants}
                      whileHover={{ scale: 1.02 }}
                      style={{ 
                        padding: '1rem', 
                        background: 'rgba(108, 92, 231, 0.05)', 
                        border: '1px solid rgba(108, 92, 231, 0.1)', 
                        borderRadius: '0.8rem',
                        fontSize: '0.95rem',
                        color: 'var(--text-dark)'
                      }}
                    >
                      • {tip}
                    </motion.div>
                  ))}
                </motion.div>
              </div>

              <div>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                   <Youtube size={20} color="#ef4444" /> Video Resources
                </h3>
                <motion.div 
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="video-list"
                >
                  {content.videos.map((v, idx) => (
                    <motion.a
                      key={idx}
                      variants={itemVariants}
                      href={v.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="video-link"
                      whileHover={{ scale: 1.01, backgroundColor: 'rgba(15, 23, 42, 0.05)' }}
                      whileTap={{ scale: 0.99 }}
                      style={{ padding: '1.25rem' }}
                    >
                      <Youtube size={32} className="video-icon" />
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span className="video-title" style={{ fontSize: '1.05rem' }}>{v.title}</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Watch on YouTube</span>
                      </div>
                    </motion.a>
                  ))}
                </motion.div>
              </div>

              {/* Was this helpful? button */}
              <div 
                style={{ 
                  marginTop: '4rem', 
                  paddingTop: '2rem', 
                  borderTop: '1px solid rgba(15, 23, 42, 0.08)',
                  textAlign: 'center'
                }}
              >
                <p style={{ fontWeight: 600, marginBottom: '1rem', color: 'var(--text-dark)' }}>
                  {feedback ? "Thanks for your feedback!" : "Was this helpful?"}
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                  <button 
                    onClick={() => handleFeedback('up')}
                    className={`btn-sm ${feedback === 'up' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '0.6rem 1.25rem', fontSize: '0.9rem' }}
                    disabled={!!feedback}
                  >
                    <ThumbsUp size={18} /> Yes
                  </button>
                  <button 
                    onClick={() => handleFeedback('down')}
                    className={`btn-sm ${feedback === 'down' ? 'btn-danger' : 'btn-secondary'}`}
                    style={{ padding: '0.6rem 1.25rem', fontSize: '0.9rem' }}
                    disabled={!!feedback}
                  >
                    <ThumbsDown size={18} /> No
                  </button>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </main>
  );
};

export default HelpTopic;
