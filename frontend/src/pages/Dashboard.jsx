import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import MoodChart from '../components/MoodChart';
import EntryList from '../components/EntryList';
import Chatbot from '../components/Chatbot';

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

  if (loading) return <div className="text-center mt-4">Loading...</div>;

  return (
    <div className="container">
      <header className="flex justify-between items-center mb-4 glass-card">
        <h1>MindPulse Dashboard</h1>
        <button onClick={handleLogout} className="btn" style={{background: 'transparent', border: '1px solid var(--primary)'}}>Logout</button>
      </header>

      <div className="grid-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div className="left-column">
          <div className="glass-card mb-4">
            <h2>New Journal Entry</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label style={{display: 'block', marginBottom: '0.5rem'}}>How are you feeling? (1-5)</label>
                <input 
                  type="range" 
                  min="1" 
                  max="5" 
                  value={moodScore} 
                  onChange={(e) => setMoodScore(Number(e.target.value))}
                  style={{width: '100%'}}
                />
                <div className="flex justify-between text-muted" style={{fontSize: '0.8rem'}}>
                    <span>Sad</span>
                    <span>Neutral</span>
                    <span>Happy</span>
                </div>
              </div>
              <textarea
                className="input-field"
                rows="4"
                placeholder="Write your thoughts..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              ></textarea>
              <button type="submit" className="btn btn-primary" style={{width: '100%'}}>Save Entry</button>
            </form>
          </div>
          
          <div className="glass-card">
            <h2>Emotional Trends</h2>
            <MoodChart entries={entries} />
          </div>
        </div>

        <div className="right-column glass-card">
          <h2>Recent Entries</h2>
          <EntryList entries={entries} />
        </div>
      </div>
      <Chatbot />
    </div>
  );
};

export default Dashboard;
