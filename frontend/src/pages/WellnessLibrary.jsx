import React from 'react';
import { motion } from 'framer-motion';
import { Wind, Music, Heart, Leaf } from 'lucide-react';
import MeditationPlayer from '../components/MeditationPlayer';

const YOGA_TIPS = [
  { pose: 'Child\'s Pose 🙇', benefit: 'Releases lower back tension & calms the mind', duration: '1–3 min' },
  { pose: 'Cat-Cow Stretch 🐄', benefit: 'Improves spinal flexibility & reduces stress', duration: '1–2 min' },
  { pose: 'Legs-Up-The-Wall 🧘', benefit: 'Relieves fatigue & anxiety quickly', duration: '5–10 min' },
  { pose: 'Seated Forward Bend 🤸', benefit: 'Calms the nervous system', duration: '1–3 min' },
  { pose: 'Supine Twist 🌀', benefit: 'Releases spine tension & aids digestion', duration: '1 min each side' },
  { pose: 'Shavasana (Rest) 💤', benefit: 'Full-body relaxation & integration', duration: '5–10 min' },
];

const BREATHING_EXERCISES = [
  { name: 'Box Breathing', steps: 'Inhale 4s → Hold 4s → Exhale 4s → Hold 4s', emoji: '📦', for: 'Stress & focus' },
  { name: '4-7-8 Technique', steps: 'Inhale 4s → Hold 7s → Exhale 8s', emoji: '🌙', for: 'Sleep & anxiety' },
  { name: 'Belly Breathing', steps: 'Place hand on belly. Breathe in slow deep breaths, feeling belly rise.', emoji: '🫁', for: 'Relaxation' },
  { name: 'Alternate Nostril', steps: 'Close right nostril → inhale left → close left → exhale right. Repeat.', emoji: '👃', for: 'Balance & calm' },
];

export default function WellnessLibrary() {
  return (
    <div style={{ padding: '2rem', maxWidth: 1300, margin: '0 auto' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card"
        style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, rgba(108,92,231,0.09) 0%, rgba(16,185,129,0.07) 100%)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '2.5rem' }}>🌿</span>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.7rem' }}>Wellness Library</h1>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Meditation, breathing exercises, and gentle movement for your mind & body
            </p>
          </div>
        </div>
      </motion.div>

      {/* 2-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>

        {/* Meditation Player */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <MeditationPlayer />
        </motion.div>

        {/* Breathing Exercises */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card"
          style={{ padding: '1.5rem', borderRadius: 16 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'linear-gradient(135deg, #0ea5e9, #06b6d4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Wind size={22} color="white" />
            </div>
            <div>
              <h3 style={{ margin: 0 }}>Breathing Exercises</h3>
              <small style={{ color: 'var(--text-muted)' }}>Science-backed techniques</small>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {BREATHING_EXERCISES.map((ex, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.07 }}
                style={{
                  padding: '0.9rem 1rem',
                  borderRadius: 10,
                  background: 'rgba(14,165,233,0.07)',
                  border: '1px solid rgba(14,165,233,0.15)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <span style={{ fontSize: '1.2rem' }}>{ex.emoji}</span>
                  <strong style={{ color: 'var(--text-dark)', fontSize: '0.95rem' }}>{ex.name}</strong>
                  <span style={{
                    marginLeft: 'auto', fontSize: '0.72rem', fontWeight: 600,
                    background: 'rgba(14,165,233,0.15)', color: '#0ea5e9',
                    padding: '0.15rem 0.5rem', borderRadius: 999,
                  }}>
                    For: {ex.for}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{ex.steps}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Mini Yoga Sessions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card"
          style={{ padding: '1.5rem', borderRadius: 16 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'linear-gradient(135deg, #10b981, #34d399)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.3rem',
            }}>🧘</div>
            <div>
              <h3 style={{ margin: 0 }}>Mini Yoga Poses</h3>
              <small style={{ color: 'var(--text-muted)' }}>Gentle movement for stress relief</small>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            {YOGA_TIPS.map((y, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.02, y: -2 }}
                style={{
                  padding: '0.85rem',
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(52,211,153,0.05))',
                  border: '1px solid rgba(16,185,129,0.18)',
                  cursor: 'default',
                }}
              >
                <div style={{ fontWeight: 700, marginBottom: '0.3rem', fontSize: '0.88rem', color: 'var(--text-dark)' }}>{y.pose}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.4, marginBottom: '0.4rem' }}>{y.benefit}</div>
                <div style={{
                  fontSize: '0.72rem', fontWeight: 600, color: '#10b981',
                  background: 'rgba(16,185,129,0.12)', borderRadius: 999,
                  padding: '0.15rem 0.5rem', display: 'inline-block',
                }}>
                  ⏱ {y.duration}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Wellness Tips */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card"
          style={{ padding: '1.5rem', borderRadius: 16, background: 'linear-gradient(135deg, rgba(245,158,11,0.07) 0%, rgba(251,146,60,0.05) 100%)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'linear-gradient(135deg, #f59e0b, #fb923c)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Heart size={22} color="white" />
            </div>
            <div>
              <h3 style={{ margin: 0 }}>Daily Wellness Tips</h3>
              <small style={{ color: 'var(--text-muted)' }}>Simple habits for a healthy mind</small>
            </div>
          </div>

          {[
            { icon: '💧', tip: 'Stay hydrated — even mild dehydration worsens mood and focus.', time: 'All day' },
            { icon: '🚶', tip: 'A 10-minute walk in nature can reduce cortisol significantly.', time: 'Anytime' },
            { icon: '📵', tip: 'Screen-free 30 minutes before bed improves sleep quality.', time: 'Evening' },
            { icon: '🤸', tip: 'Stretch your neck and shoulders every 90 minutes if studying.', time: 'Study hours' },
            { icon: '🌞', tip: 'Morning sunlight for 5 minutes sets your circadian rhythm.', time: 'Morning' },
            { icon: '🍽️', tip: 'Eat regular meals — blood sugar swings directly affect mood.', time: 'Meals' },
          ].map((item, i) => (
            <div key={i} style={{
              display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
              paddingBottom: i < 5 ? '0.85rem' : 0,
              borderBottom: i < 5 ? '1px solid rgba(245,158,11,0.1)' : 'none',
              marginBottom: i < 5 ? '0.85rem' : 0,
            }}>
              <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{item.icon}</span>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-dark)', lineHeight: 1.5 }}>{item.tip}</p>
              </div>
              <span style={{
                flexShrink: 0, fontSize: '0.72rem', fontWeight: 600,
                background: 'rgba(245,158,11,0.15)', color: '#f59e0b',
                padding: '0.15rem 0.5rem', borderRadius: 999,
              }}>
                {item.time}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
