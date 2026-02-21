import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Badge definitions — each badge has an icon, label, description, and a check function
// that receives { entries, streak, avgMood }
const BADGES = [
  {
    id: 'first_entry',
    icon: '🌱',
    label: 'First Step',
    desc: 'Wrote your very first journal entry',
    check: ({ entries }) => entries.length >= 1,
    color: '#10b981',
  },
  {
    id: 'streak_3',
    icon: '✨',
    label: '3-Day Streak',
    desc: 'Journaled 3 days in a row',
    check: ({ streak }) => streak >= 3,
    color: '#6c5ce7',
  },
  {
    id: 'streak_7',
    icon: '🔥',
    label: 'Week Warrior',
    desc: 'Maintained a 7-day journaling streak',
    check: ({ streak }) => streak >= 7,
    color: '#f59e0b',
  },
  {
    id: 'streak_30',
    icon: '🏆',
    label: 'Month Master',
    desc: '30-day journaling streak — incredible!',
    check: ({ streak }) => streak >= 30,
    color: '#fbbf24',
  },
  {
    id: 'entries_10',
    icon: '📝',
    label: 'Dedicated Writer',
    desc: 'Logged 10 journal entries',
    check: ({ entries }) => entries.length >= 10,
    color: '#8b5cf6',
  },
  {
    id: 'entries_30',
    icon: '📖',
    label: 'Journaling Pro',
    desc: 'Logged 30 journal entries',
    check: ({ entries }) => entries.length >= 30,
    color: '#06b6d4',
  },
  {
    id: 'calm_week',
    icon: '🧘',
    label: 'Calm Week',
    desc: 'Averaged mood ≥ 4 across the last 7 entries',
    check: ({ entries }) => {
      const r = entries.slice(0, 7);
      if (r.length < 3) return false;
      const avg = r.reduce((s, e) => s + (e.mood_score || 3), 0) / r.length;
      return avg >= 4;
    },
    color: '#34d399',
  },
  {
    id: 'happy_mood',
    icon: '😄',
    label: 'Sunshine Vibes',
    desc: 'Logged a perfect mood score of 5',
    check: ({ entries }) => entries.some(e => (e.mood_score || 0) === 5),
    color: '#fcd34d',
  },
  {
    id: 'consistent',
    icon: '💎',
    label: 'Consistency King',
    desc: 'Journaled on at least 5 different calendar weeks',
    check: ({ entries }) => {
      const weeks = new Set(entries.map(e => {
        const d = new Date(e.createdAt || e.created_at);
        const jan1 = new Date(d.getFullYear(), 0, 1);
        return `${d.getFullYear()}-${Math.ceil(((d - jan1) / 86400000 + jan1.getDay() + 1) / 7)}`;
      }));
      return weeks.size >= 5;
    },
    color: '#a78bfa',
  },
  {
    id: 'reflective',
    icon: '🌙',
    label: 'Night Owl',
    desc: 'Wrote a journal entry after 9 PM',
    check: ({ entries }) => entries.some(e => {
      const h = new Date(e.createdAt || e.created_at).getHours();
      return h >= 21;
    }),
    color: '#7c3aed',
  },
];

/**
 * Compute the current journaling streak (consecutive days ending today or yesterday).
 */
export function computeStreak(entries) {
  if (!entries || entries.length === 0) return 0;

  // Get unique sorted dates (ascending)
  const dates = [...new Set(
    entries.map(e => new Date(e.createdAt || e.created_at).toISOString().slice(0, 10))
  )].sort();

  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  // Streak must include today or yesterday to be "active"
  const last = dates[dates.length - 1];
  if (last !== today && last !== yesterday) return 0;

  let streak = 1;
  for (let i = dates.length - 1; i > 0; i--) {
    const curr = new Date(dates[i]);
    const prev = new Date(dates[i - 1]);
    const diff = (curr - prev) / 86400000;
    if (diff === 1) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export default function Achievements({ entries = [] }) {
  const streak = computeStreak(entries);
  const avgMood =
    entries.length > 0
      ? entries.reduce((s, e) => s + (e.mood_score || 3), 0) / entries.length
      : 0;

  const ctx = { entries, streak, avgMood };

  const earned = BADGES.filter(b => b.check(ctx));
  const locked = BADGES.filter(b => !b.check(ctx));

  const [newUnlocks, setNewUnlocks] = useState([]);

  // Detect newly unlocked badges (compare vs localStorage)
  useEffect(() => {
    if (entries.length === 0) return;
    try {
      const prev = JSON.parse(localStorage.getItem('mp_badges') || '[]');
      const current = earned.map(b => b.id);
      const fresh = current.filter(id => !prev.includes(id));
      if (fresh.length > 0) {
        setNewUnlocks(fresh);
        localStorage.setItem('mp_badges', JSON.stringify(current));
        setTimeout(() => setNewUnlocks([]), 3500);
      } else {
        localStorage.setItem('mp_badges', JSON.stringify(current));
      }
    } catch {}
  }, [entries.length]); // eslint-disable-line

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="glass-card"
      style={{
        padding: '1.5rem',
        borderRadius: 16,
        marginBottom: '2rem',
        background: 'linear-gradient(135deg, rgba(108,92,231,0.07) 0%, rgba(139,92,246,0.04) 100%)',
        border: '1px solid rgba(108,92,231,0.18)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <div style={{
          width: 44, height: 44,
          background: 'linear-gradient(135deg, #f59e0b, #fcd34d)',
          borderRadius: 12,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.4rem',
        }}>🏅</div>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--text-dark)' }}>Achievements</h3>
          <small style={{ color: 'var(--text-muted)' }}>
            {earned.length} / {BADGES.length} badges earned
          </small>
        </div>
        {/* Streak pill */}
        <div style={{
          marginLeft: 'auto',
          background: streak > 0 ? 'linear-gradient(135deg, #f59e0b, #fb923c)' : 'rgba(15,23,42,0.08)',
          color: streak > 0 ? 'white' : 'var(--text-muted)',
          borderRadius: 999,
          padding: '0.35rem 0.9rem',
          fontSize: '0.9rem',
          fontWeight: 700,
          display: 'flex', alignItems: 'center', gap: '0.35rem',
        }}>
          🔥 {streak}d streak
        </div>
      </div>

      {/* New unlock toast */}
      <AnimatePresence>
        {newUnlocks.length > 0 && (
          <motion.div
            key="new-unlock"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            style={{
              background: 'linear-gradient(135deg, #10b981, #34d399)',
              color: 'white',
              borderRadius: 10,
              padding: '0.75rem 1rem',
              marginBottom: '1rem',
              fontWeight: 600,
              fontSize: '0.9rem',
            }}
          >
            🎉 New badge{newUnlocks.length > 1 ? 's' : ''} unlocked:{' '}
            {newUnlocks.map(id => BADGES.find(b => b.id === id)?.label).join(', ')}!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Earned badges */}
      {earned.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <p style={{ margin: '0 0 0.6rem 0', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Earned</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
            {earned.map((badge, i) => (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.06, type: 'spring', stiffness: 260, damping: 20 }}
                title={badge.desc}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.45rem',
                  background: `${badge.color}18`,
                  border: `1.5px solid ${badge.color}40`,
                  borderRadius: 10,
                  padding: '0.45rem 0.85rem',
                  cursor: 'default',
                  transition: 'transform 0.15s',
                }}
                whileHover={{ scale: 1.07 }}
              >
                <span style={{ fontSize: '1.15rem' }}>{badge.icon}</span>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: badge.color }}>{badge.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Locked badges (dimmed) */}
      {locked.length > 0 && (
        <div>
          <p style={{ margin: '0 0 0.6rem 0', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Locked</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
            {locked.map(badge => (
              <div
                key={badge.id}
                title={badge.desc}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.45rem',
                  background: 'rgba(15,23,42,0.05)',
                  border: '1.5px solid rgba(15,23,42,0.10)',
                  borderRadius: 10,
                  padding: '0.45rem 0.85rem',
                  opacity: 0.45,
                  cursor: 'default',
                  filter: 'grayscale(0.6)',
                }}
              >
                <span style={{ fontSize: '1.15rem' }}>{badge.icon}</span>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>{badge.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {entries.length === 0 && (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.5rem' }}>
          Start journaling to earn your first badge! 🌱
        </p>
      )}
    </motion.div>
  );
}
