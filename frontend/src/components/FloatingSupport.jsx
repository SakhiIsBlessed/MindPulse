import React from 'react';
import { MessageCircle, Phone } from 'lucide-react';
import { motion } from 'framer-motion';

const FloatingSupport = () => {
  return (
    <motion.a
      href="/support"
      className="floating-support-btn"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      transition={{ delay: 1, type: 'spring' }}
      style={{
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        background: 'var(--primary)',
        color: 'white',
        padding: '0.8rem 1.2rem',
        borderRadius: '50px',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        boxShadow: '0 4px 12px rgba(108, 92, 231, 0.4)',
        zIndex: 1000,
        textDecoration: 'none',
        fontWeight: '600'
      }}
      aria-label="Get Support"
    >
      <MessageCircle size={20} />
      <span style={{ fontSize: '0.9rem' }}>Need Help?</span>
    </motion.a>
  );
};

export default FloatingSupport;
