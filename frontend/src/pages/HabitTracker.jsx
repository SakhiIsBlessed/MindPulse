import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, CheckCircle, Circle, Flame, Trophy } from 'lucide-react';

const STORAGE_KEY = 'mp_habits_v2';
const TODAY = new Date().toISOString().slice(0, 10);

// Get past 7 days as YYYY-MM-DD strings
function last7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });
}

// Compute streak for a habit (consecutive days from today backward)
function computeHabitStreak(completions) {
  if (!completions || !completions[TODAY]) return 0;
  let streak = 0;
  const d = new Date();
  while (true) {
    const key = d.toISOString().slice(0, 10);
    if (completions[key]) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

function loadHabits() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || getDefaultHabits();
  } catch {
    return getDefaultHabits();
  }
}

function getDefaultHabits() {
  return [
    { id: 1, name: 'Drink 8 glasses of water 💧', color: '#0ea5e9', completions: {} },
    { id: 2, name: 'Meditate for 10 mins 🧘', color: '#6c5ce7', completions: {} },
    { id: 3, name: 'Exercise / Walk 🏃', color: '#10b981', completions: {} },
    { id: 4, name: 'Journal entry 📝', color: '#f59e0b', completions: {} },
    { id: 5, name: 'Read for 20 mins 📖', color: '#ec4899', completions: {} },
  ];
}

function saveHabits(habits) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
}

const PALETTE = ['#6c5ce7', '#10b981', '#f59e0b', '#ec4899', '#0ea5e9', '#7c3aed', '#ef4444', '#06b6d4'];

export default function HabitTracker() {
  const [habits, setHabits] = useState(loadHabits);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(PALETTE[0]);
  const [showForm, setShowForm] = useState(false);
  const days = last7Days();

  const update = useCallback((updated) => {
    setHabits(updated);
    saveHabits(updated);
  }, []);

  const toggle = (habitId, date) => {
    const updated = habits.map(h => {
      if (h.id !== habitId) return h;
      const c = { ...h.completions, [date]: !h.completions[date] };
      if (!c[date]) delete c[date];
      return { ...h, completions: c };
    });
    update(updated);
  };

  const addHabit = () => {
    if (!newName.trim()) return;
    const updated = [...habits, {
      id: Date.now(),
      name: newName.trim(),
      color: newColor,
      completions: {},
    }];
    update(updated);
    setNewName('');
    setNewColor(PALETTE[Math.floor(Math.random() * PALETTE.length)]);
    setShowForm(false);
  };

  const removeHabit = (id) => {
    update(habits.filter(h => h.id !== id));
  };

  const totalToday = habits.filter(h => h.completions[TODAY]).length;
  const completionRate = habits.length ? Math.round((totalToday / habits.length) * 100) : 0;

  return (
    <div style={{ padding: '2rem', maxWidth: 900, margin: '0 auto' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card"
        style={{ marginBottom: '1.5rem' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '2rem' }}>✅</span>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.6rem' }}>Habit Tracker</h1>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Build positive routines, one day at a time
            </p>
          </div>
        </div>

        {/* Daily progress summary */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px,1fr))',
          gap: '1rem', marginTop: '1rem'
        }}>
          <div style={statCard('#10b981')}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981' }}>{totalToday}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Done Today</div>
          </div>
          <div style={statCard('#6c5ce7')}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#6c5ce7' }}>{habits.length}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Total Habits</div>
          </div>
          <div style={statCard('#f59e0b')}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f59e0b' }}>{completionRate}%</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Today's Rate</div>
          </div>
          <div style={statCard('#ec4899')}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ec4899' }}>
              {Math.max(...habits.map(h => computeHabitStreak(h.completions)), 0)}
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Best Streak 🔥</div>
          </div>
        </div>
      </motion.div>

      {/* Weekly Grid */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card"
        style={{ marginBottom: '1.5rem', overflowX: 'auto' }}
      >
        <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>7-Day Overview</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560 }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', paddingBottom: '0.75rem', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, minWidth: 180 }}>
                Habit
              </th>
              {days.map(d => (
                <th key={d} style={{ textAlign: 'center', paddingBottom: '0.75rem', color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 600 }}>
                  <div>{new Date(d + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' })}</div>
                  <div style={{ fontSize: '0.9rem', color: d === TODAY ? 'var(--primary)' : 'inherit' }}>
                    {new Date(d + 'T12:00:00').getDate()}
                  </div>
                </th>
              ))}
              <th style={{ textAlign: 'center', paddingBottom: '0.75rem', color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 600 }}>
                🔥 Streak
              </th>
              <th style={{ paddingBottom: '0.75rem' }}></th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {habits.map((habit, idx) => {
                const streak = computeHabitStreak(habit.completions);
                return (
                  <motion.tr
                    key={habit.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ delay: idx * 0.04 }}
                    style={{ borderTop: '1px solid rgba(15,23,42,0.06)' }}
                  >
                    <td style={{ padding: '0.7rem 0.5rem 0.7rem 0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: habit.color, flexShrink: 0 }} />
                        <span style={{ fontSize: '0.88rem', color: 'var(--text-dark)', fontWeight: 500 }}>{habit.name}</span>
                      </div>
                    </td>
                    {days.map(d => {
                      const done = !!habit.completions[d];
                      return (
                        <td key={d} style={{ textAlign: 'center', padding: '0.5rem' }}>
                          <motion.button
                            whileTap={{ scale: 0.85 }}
                            onClick={() => toggle(habit.id, d)}
                            style={{
                              background: 'none', border: 'none', cursor: 'pointer',
                              color: done ? habit.color : 'rgba(15,23,42,0.2)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              margin: '0 auto',
                            }}
                            title={done ? 'Mark incomplete' : 'Mark complete'}
                          >
                            {done ? <CheckCircle size={22} fill={habit.color} color={habit.color} /> : <Circle size={22} />}
                          </motion.button>
                        </td>
                      );
                    })}
                    <td style={{ textAlign: 'center' }}>
                      <span style={{
                        fontWeight: 700, fontSize: '0.95rem',
                        color: streak > 0 ? habit.color : 'var(--text-muted)',
                      }}>
                        {streak > 0 ? `${streak}d` : '—'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', paddingRight: '0.25rem' }}>
                      <button
                        onClick={() => removeHabit(habit.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.25rem' }}
                        title="Remove habit"
                      >
                        <X size={16} />
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </motion.div>

      {/* Add Habit */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: showForm ? '1rem' : 0 }}>
          <h3 style={{ margin: 0 }}>Add New Habit</h3>
          <button
            onClick={() => setShowForm(s => !s)}
            style={{
              background: showForm ? 'rgba(239,68,68,0.1)' : 'linear-gradient(135deg,#6c5ce7,#8b5cf6)',
              color: showForm ? '#ef4444' : 'white',
              border: 'none', borderRadius: 8, padding: '0.5rem 1rem',
              cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem',
              display: 'flex', alignItems: 'center', gap: '0.4rem',
            }}
          >
            {showForm ? <><X size={16} /> Cancel</> : <><Plus size={16} /> Add Habit</>}
          </button>
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="e.g., Drink water 💧"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addHabit()}
                  style={{
                    flex: 1, minWidth: 200, padding: '0.65rem 1rem',
                    borderRadius: 8, border: '1.5px solid rgba(108,92,231,0.25)',
                    background: 'rgba(255,255,255,0.6)', fontSize: '0.9rem',
                    outline: 'none', color: 'var(--text-dark)',
                  }}
                />
                {/* Color picker */}
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {PALETTE.map(c => (
                    <button
                      key={c}
                      onClick={() => setNewColor(c)}
                      style={{
                        width: 24, height: 24, borderRadius: '50%', background: c,
                        border: newColor === c ? '2.5px solid rgba(15,23,42,0.5)' : '2px solid transparent',
                        cursor: 'pointer', outline: 'none', transition: 'transform 0.15s',
                        transform: newColor === c ? 'scale(1.2)' : 'scale(1)',
                      }}
                    />
                  ))}
                </div>
                <button
                  onClick={addHabit}
                  style={{
                    background: 'linear-gradient(135deg, #10b981, #34d399)',
                    color: 'white', border: 'none', borderRadius: 8,
                    padding: '0.65rem 1.25rem', cursor: 'pointer',
                    fontWeight: 700, fontSize: '0.9rem',
                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                  }}
                >
                  <Plus size={16} /> Add
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Achievement hint */}
      {completionRate === 100 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            marginTop: '1.5rem',
            background: 'linear-gradient(135deg, #f59e0b, #fcd34d)',
            color: 'white',
            borderRadius: 12,
            padding: '1rem 1.25rem',
            textAlign: 'center',
            fontWeight: 700,
            fontSize: '1rem',
          }}
        >
          🏆 Perfect day! All habits completed! Keep it up! 🔥
        </motion.div>
      )}
    </div>
  );
}

const statCard = (color) => ({
  padding: '1rem',
  borderRadius: 10,
  background: `${color}12`,
  border: `1px solid ${color}25`,
  textAlign: 'center',
});
