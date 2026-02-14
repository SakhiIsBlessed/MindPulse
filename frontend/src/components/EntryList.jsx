import React from 'react';
import { Trash2, Calendar, MessageSquare } from 'lucide-react';
import axios from 'axios';

const EntryList = ({ entries, onDelete }) => {
  if (!entries || entries.length === 0) return (
    <div style={{ 
      textAlign: 'center', 
      padding: '2rem 1rem',
      color: 'var(--text-muted)'
    }}>
      <MessageSquare size={40} style={{ opacity: 0.3, margin: '0 auto 1rem' }} />
      <p style={{ fontSize: '0.95rem' }}>No entries yet. Start journaling to track your mood!</p>
    </div>
  );

  const handleDelete = async (id) => {
      if(window.confirm('Delete this entry?')) {
          try {
             const token = localStorage.getItem('token');
             await axios.delete(`/api/journal/${id}`, {
                 headers: { Authorization: `Bearer ${token}` }
             });
             // Basic reload for now, ideally pass a refresh callback
             window.location.reload();
          } catch(err) {
              console.error(err);
              alert('Failed to delete');
          }
      }
  }

  const moodEmojis = ['😔', '😐', '😌', '😊', '😄'];
  const sentimentColors = {
    positive: { bg: 'rgba(74, 222, 128, 0.15)', text: '#4ade80', border: 'rgba(74, 222, 128, 0.3)' },
    negative: { bg: 'rgba(248, 113, 113, 0.15)', text: '#f87171', border: 'rgba(248, 113, 113, 0.3)' },
    neutral: { bg: 'rgba(148, 163, 184, 0.15)', text: '#94a3b8', border: 'rgba(148, 163, 184, 0.3)' }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {entries.map((entry, idx) => {
        const sentiment = entry.sentiment_analysis?.label || 'neutral';
        const colors = sentimentColors[sentiment] || sentimentColors.neutral;
        
        return (
          <div 
            key={entry._id} 
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--glass-border)',
              borderRadius: '1rem',
              padding: '1rem',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              animation: `fadeInUp 0.4s ease ${idx * 0.05}s backwards`
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#fff';
              e.currentTarget.style.borderColor = 'rgba(108, 92, 231, 0.08)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--bg-card)';
              e.currentTarget.style.borderColor = 'var(--glass-border)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {/* Header with date and mood */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={16} style={{ color: 'var(--text-muted)' }} />
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    {new Date(entry.createdAt).toLocaleDateString(undefined, { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {/* Sentiment Badge */}
                <div 
                    style={{ 
                        padding: '0.35rem 0.75rem', 
                        borderRadius: '0.75rem', 
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        backgroundColor: colors.bg,
                        color: colors.text,
                        border: `1px solid ${colors.border}`,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                    }}
                >
                  {sentiment}
                </div>
                
                {/* Mood Emoji */}
                <div style={{ fontSize: '1.2rem' }}>
                  {moodEmojis[Math.max(0, Math.min(4, entry.mood_score - 1))]}
                </div>

                {/* Delete Button */}
                <button 
                    onClick={() => handleDelete(entry._id)}
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      color: 'var(--text-muted)', 
                      cursor: 'pointer', 
                      padding: '0.25rem',
                      display: 'flex',
                      alignItems: 'center',
                      transition: 'all 0.2s',
                      opacity: 0.7
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#f87171';
                      e.currentTarget.style.opacity = '1';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'var(--text-muted)';
                      e.currentTarget.style.opacity = '0.7';
                    }}
                    title="Delete Entry"
                >
                    <Trash2 size={18} />
                </button>
              </div>
            </div>

            {/* Content */}
            <p style={{ 
              lineHeight: '1.6', 
              margin: '0.75rem 0', 
              color: 'var(--text-dark)',
              fontSize: '0.95rem',
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical'
            }}>
              {entry.content}
            </p>

            {/* Mood Score Indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem' }}>
              <div style={{ display: 'flex', gap: '3px' }}>
                  {[...Array(5)].map((_, i) => (
                      <div 
                          key={i} 
                          style={{ 
                              width: '6px', 
                              height: '6px', 
                              borderRadius: '50%', 
                                backgroundColor: i < entry.mood_score ? 'var(--primary)' : '#e6edf6',
                              transition: 'all 0.3s ease'
                          }} 
                      />
                  ))}
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Mood: {entry.mood_score}/5
              </span>
            </div>
          </div>
        );
      })}

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default EntryList;
