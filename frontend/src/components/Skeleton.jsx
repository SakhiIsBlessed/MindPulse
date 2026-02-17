import React from 'react';
import { motion } from 'framer-motion';

const Skeleton = ({ width = '100%', height = '20px', borderRadius = '8px', className = '' }) => {
  return (
    <div
      className={`skeleton-wrapper ${className}`}
      style={{
        width,
        height,
        borderRadius,
        background: 'rgba(15, 23, 42, 0.1)',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      <motion.div
        style={{
          width: '100%',
          height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent)',
          position: 'absolute',
          top: 0,
          left: 0,
        }}
        initial={{ translateX: '-100%' }}
        animate={{ translateX: '100%' }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
};

export default Skeleton;
