import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import ScrollProgress from './ScrollProgress';

const PageWrapper = ({ title, description, children, showScrollProgress = true }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <>
      <Helmet>
        <title>{title} | MindPulse</title>
        <meta name="description" content={description} />
      </Helmet>
      
      {showScrollProgress && <ScrollProgress />}
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="page-content"
      >
        {children}
      </motion.div>
    </>
  );
};

export default PageWrapper;
