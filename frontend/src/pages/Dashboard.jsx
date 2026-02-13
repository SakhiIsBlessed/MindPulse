import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import MoodChart from '../components/MoodChart';
import EntryList from '../components/EntryList';
import Chatbot from '../components/Chatbot';
import { LogOut, Heart, TrendingUp, Zap } from 'lucide-react';

const Dashboard = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [moodScore, setMoodScore] = useState(3);
  const navigate = useNavigate();

  const fetchEntries = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      const { data } = await axios.get('/api/journal', config);
      setEntries(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching entries', error);
      if(error.response && error.response.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      await axios.post('/api/journal', { content, mood_score: moodScore }, config);
      setContent('');
      setMoodScore(3);
      fetchEntries(); // Refresh list
    } catch (error) {
      console.error('Error creating entry', error);
      alert('Failed to create entry');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Calculate average mood
  const avgMood = entries.length > 0 
    ? Math.round(entries.reduce((sum, e) => sum + e.mood_score, 0) / entries.length * 10) / 10
    : 0;

  const moodEmojis = ['😔', '😐', '😌', '😊', '😄'];
  const moodLabels = ['Very Low', 'Low', 'Neutral', 'Good', 'Great'];

  if (loading) return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      color: 'white',
      fontSize: '1.2rem'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '4px solid rgba(99, 102, 241, 0.3)',
          borderTop: '4px solid #6366f1',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          margin: '0 auto 1rem'
        }} />
        <p>Loading your dashboard...</p>
      </div>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div className="glass-card animate-in" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '2rem',
        padding: '1.5rem 2rem'
      }}>
        <div>
          <h1 style={{ margin: '0 0 0.5rem 0' }}>MindPulse Dashboard</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.95rem' }}>
            Monitor your mental wellness journey
          </p>
        </div>
        <button 
          onClick={handleLogout} 
          className="btn btn-secondary"
          style={{ gap: '0.5rem' }}
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <div className="glass-card animate-in" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
              <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Average Mood
              </p>
              <h3 style={{ margin: '0 0 0.5rem 0', color: 'white', fontSize: '2rem' }}>
                {avgMood.toFixed(1)}
              </h3>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                {moodLabels[Math.min(Math.floor(avgMood) - 1, 4)]} overall
              </p>
            </div>
            <div style={{
              width: '50px',
              height: '50px',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              borderRadius: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem'
            }}>
              {moodEmojis[Math.min(Math.floor(avgMood) - 1, 4)]}
            </div>
          </div>
        </div>

        <div className="glass-card animate-in" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
              <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Total Entries
              </p>
              <h3 style={{ margin: '0 0 0.5rem 0', color: 'white', fontSize: '2rem' }}>
                {entries.length}
              </h3>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Journal entries logged
              </p>
            </div>
            <div style={{
              width: '50px',
              height: '50px',
              background: 'linear-gradient(135deg, #ec4899 0%, #f87171 100%)',
              borderRadius: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Heart size={28} color="white" />
            </div>
          </div>
        </div>

        <div className="glass-card animate-in" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
              <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Streak
              </p>
              <h3 style={{ margin: '0 0 0.5rem 0', color: 'white', fontSize: '2rem' }}>
                {entries.length > 0 ? Math.floor(entries.length / 7) : 0}w
              </h3>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Weeks active
              </p>
            </div>
            <div style={{
              width: '50px',
              height: '50px',
              background: 'linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)',
              borderRadius: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <TrendingUp size={28} color="white" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '2rem',
        marginBottom: '2rem'
      }}>
        {/* Left Column */}
        <div>
          {/* New Entry Form */}
          <div className="glass-card animate-in mb-4">
            <h2>New Journal Entry</h2>
            <form onSubmit={handleSubmit}>
              {/* Mood Selector */}
              <div className="mb-4">
                <label style={{ marginBottom: '1rem' }}>
                  How are you feeling today? {moodEmojis[moodScore - 1]}
                </label>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(5, 1fr)',
                  gap: '0.75rem',
                  marginBottom: '1rem'
                }}>
                  {[1, 2, 3, 4, 5].map(score => (
                    <button
                      key={score}
                      type="button"
                      onClick={() => setMoodScore(score)}
                      style={{
                        padding: '0.875rem',
                        borderRadius: '0.75rem',
                        border: moodScore === score ? '2px solid #6366f1' : '2px solid rgba(255, 255, 255, 0.2)',
                        background: moodScore === score 
                          ? 'rgba(99, 102, 241, 0.2)' 
                          : 'rgba(255, 255, 255, 0.05)',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '1.5rem',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {moodEmojis[score - 1]}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between text-muted" style={{fontSize: '0.75rem', opacity: 0.8}}>
                    <span>Very Bad</span>
                    <span>Bad</span>
                    <span>Okay</span>
                    <span>Good</span>
                    <span>Great</span>
                </div>
              </div>

              {/* Text Area */}
              <div className="mb-4">
                <label>Share your thoughts</label>
                <textarea
                  className="input-field"
                  rows="5"
                  placeholder="Write what's on your mind... Be honest and open."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  style={{ marginBottom: '1.5rem', fontFamily: 'inherit' }}
                ></textarea>
              </div>

              <button type="submit" className="btn btn-primary" style={{width: '100%', fontSize: '1rem', padding: '1rem'}}>
                <Zap size={20} style={{ marginRight: '0.5rem' }} />
                Save Entry
              </button>
            </form>
          </div>

          {/* Mood Trends Chart */}
          <div className="glass-card animate-in" style={{ padding: '1.5rem' }}>
            <h2>Emotional Trends</h2>
            <MoodChart entries={entries} />
          </div>
        </div>

        {/* Right Column - Recent Entries */}
        <div className="glass-card animate-in" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <h2>Recent Entries</h2>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <EntryList entries={entries} />
          </div>
        </div>
      </div>

      {/* Chatbot */}
      <Chatbot />
    </div>
  );
};

export default Dashboard;
