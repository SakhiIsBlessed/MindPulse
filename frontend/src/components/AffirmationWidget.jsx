import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AFFIRMATIONS = [
  "You are stronger than you think. Every small step forward counts. 🌱",
  "Your feelings are valid. Allow yourself to feel, heal, and grow. 💜",
  "You deserve rest and peace. Taking a break is not giving up. 🌙",
  "Be proud of how far you've come. Progress is progress, no matter how slow. 🚀",
  "Today you don't have to be perfect — just present. ✨",
  "You are not your worst day. You are the sum of all your courage. 💪",
  "Breathe. This moment is temporary. Better days are ahead. 🌅",
  "You are worthy of love, support, and kindness — especially from yourself. 💫",
  "One step at a time. You don't have to have it all figured out today. 🎯",
  "Your mental health matters. You matter. 💙",
  "It's okay to ask for help. Strength is knowing when you need support. 🤝",
  "You've survived 100% of your difficult days so far — that's remarkable. 🌟",
  "Today, give yourself permission to just be. 🍃",
  "Your journey is unique. Stop comparing your chapter 1 to someone else's chapter 20. 📖",
  "You are doing the best you can, and that is enough. 🌸",
  "Even on hard days, you are still growing — roots grow deeper in storms. 🌳",
  "Choosing to show up for yourself today is an act of bravery. 🦋",
  "You are not alone in this. There are people who care about you deeply. 💞",
  "Small moments of joy are worth celebrating. Notice them today. ☀️",
  "Healing is not linear. Be gentle with yourself on the difficult days. 🌊",
  "You have the power to begin again, at any moment. 🔄",
  "Every time you try, you are already winning. 🥇",
  "Your voice matters. Your story matters. Don't dim your light for anyone. 🕯️",
  "You are braver than you believe and more resilient than you know. 🏔️",
  "Rest when you need to. A candle cannot light others if its own flame is out. 🕊️",
  "Prioritizing your wellbeing is one of the greatest things you can do. 🌿",
  "Emotions are messengers, not enemies. Listen to them kindly. 💛",
  "You are a work in progress — and that is a beautiful thing. 🎨",
  "The fact that you're trying is already something to be proud of. 🌈",
  "You are enough, exactly as you are, right now. 💖",
];

// Pick one affirmation seeded by today's date (consistent across page reloads)
function getDailyAffirmation() {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  return AFFIRMATIONS[seed % AFFIRMATIONS.length];
}

export default function AffirmationWidget() {
  const [affirmation, setAffirmation] = useState(getDailyAffirmation());
  const [manualIndex, setManualIndex] = useState(null);
  const [visible, setVisible] = useState(true);

  const shuffle = () => {
    setVisible(false);
    setTimeout(() => {
      const current = manualIndex !== null ? manualIndex : AFFIRMATIONS.indexOf(getDailyAffirmation());
      const next = (current + 1 + Math.floor(Math.random() * (AFFIRMATIONS.length - 2))) % AFFIRMATIONS.length;
      setManualIndex(next);
      setAffirmation(AFFIRMATIONS[next]);
      setVisible(true);
    }, 280);
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(108,92,231,0.09) 0%, rgba(6,182,212,0.07) 100%)',
      border: '1px solid rgba(108,92,231,0.18)',
      borderRadius: 14,
      padding: '1.5rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
        <span style={{ fontSize: '1.3rem' }}>💬</span>
        <h3 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--text-dark)' }}>Daily Affirmation</h3>
        <span style={{
          marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-muted)',
          background: 'rgba(108,92,231,0.1)', borderRadius: 999, padding: '0.2rem 0.6rem', fontWeight: 600
        }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
        </span>
      </div>

      <AnimatePresence mode="wait">
        {visible && (
          <motion.blockquote
            key={affirmation}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28 }}
            style={{
              margin: '0 0 1.25rem 0',
              padding: '1rem 1.25rem',
              background: 'rgba(255,255,255,0.55)',
              borderRadius: 10,
              borderLeft: '4px solid #6c5ce7',
              color: 'var(--text-dark)',
              fontSize: '1rem',
              lineHeight: 1.65,
              fontStyle: 'italic',
            }}
          >
            "{affirmation}"
          </motion.blockquote>
        )}
      </AnimatePresence>

      <button
        onClick={shuffle}
        style={{
          background: 'linear-gradient(135deg, #6c5ce7, #8b5cf6)',
          color: 'white',
          border: 'none',
          borderRadius: 8,
          padding: '0.55rem 1.1rem',
          cursor: 'pointer',
          fontSize: '0.88rem',
          fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: '0.4rem',
          transition: 'opacity 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
      >
        🔀 New Affirmation
      </button>
    </div>
  );
}
