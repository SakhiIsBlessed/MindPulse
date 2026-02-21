import React from 'react';
import { useParams } from 'react-router-dom';
import StressHelp from './StressHelp';

const HelpTopic = () => {
  const { topic } = useParams();
  if (topic === 'stress') {
    return <StressHelp />;
  }

  // generic placeholder for other topics
  return (
    <main className="page-container">
      <div className="glass-card" style={{ maxWidth: '600px', margin: '2rem auto', textAlign: 'center' }}>
        <h2>{topic.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</h2>
        <p>Resources for this topic will be coming soon. Check back later!</p>
      </div>
    </main>
  );
};

export default HelpTopic;
