import React from 'react';
import { Trash2 } from 'lucide-react';
import axios from 'axios';

const EntryList = ({ entries, onDelete }) => {
  if (!entries || entries.length === 0) return <p className="text-muted text-center">No entries yet.</p>;

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

  return (
    <div className="entry-list" style={{ maxHeight: '600px', overflowY: 'auto', paddingRight: '0.5rem' }}>
      {entries.map((entry) => (
        <div key={entry._id} className="glass-card mb-4" style={{ padding: '1.5rem', background: 'rgba(30, 41, 59, 0.4)' }}>
          <div className="flex justify-between items-start mb-2">
            <span className="text-muted" style={{ fontSize: '0.85rem' }}>
                {new Date(entry.createdAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
            <div className="flex items-center gap-4">
                <span 
                    style={{ 
                        padding: '0.25rem 0.75rem', 
                        borderRadius: '1rem', 
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        backgroundColor: 
                            entry.sentiment_analysis?.label === 'positive' ? 'rgba(74, 222, 128, 0.2)' : 
                            entry.sentiment_analysis?.label === 'negative' ? 'rgba(248, 113, 113, 0.2)' : 'rgba(148, 163, 184, 0.2)',
                        color: 
                            entry.sentiment_analysis?.label === 'positive' ? '#4ade80' : 
                            entry.sentiment_analysis?.label === 'negative' ? '#f87171' : '#94a3b8' 
                    }}
                >
                {entry.sentiment_analysis?.label?.toUpperCase() || 'NEUTRAL'}
                </span>
                <button 
                    onClick={() => handleDelete(entry._id)}
                    style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0 }}
                    title="Delete Entry"
                >
                    <Trash2 size={16} />
                </button>
            </div>
          </div>
          <p style={{ lineHeight: '1.6', margin: '0.5rem 0' }}>{entry.content}</p>
          <div className="mt-2 text-muted" style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>Mood Score:</span>
            <div style={{ display: 'flex', gap: '2px' }}>
                {[...Array(5)].map((_, i) => (
                    <div 
                        key={i} 
                        style={{ 
                            width: '8px', 
                            height: '8px', 
                            borderRadius: '50%', 
                            backgroundColor: i < entry.mood_score ? '#6366f1' : '#334155' 
                        }} 
                    />
                ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EntryList;
