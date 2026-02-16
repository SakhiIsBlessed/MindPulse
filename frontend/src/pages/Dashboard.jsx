import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import MoodChart from '../components/MoodChart';
import EntryList from '../components/EntryList';
import Chatbot from '../components/Chatbot';
import { motion } from 'framer-motion';
import { LogOut, Heart, TrendingUp, Zap, Mic, StopCircle } from 'lucide-react';

const Dashboard = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [moodScore, setMoodScore] = useState(3);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMood, setFilterMood] = useState(0); // 0 = all
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  // Insights & Goals
  const [insights, setInsights] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [goals, setGoals] = useState(() => {
    try { return JSON.parse(localStorage.getItem('mp_goals')) || { sleep: 8, exercise: 30, journaling: 3 }; } catch { return { sleep: 8, exercise: 30, journaling: 3 }; }
  });
  const [activityLogs, setActivityLogs] = useState(() => {
    try { return JSON.parse(localStorage.getItem('mp_activity')) || []; } catch { return []; }
  });
  const [activityInput, setActivityInput] = useState({ date: '', sleep: '', exercise: '', journaled: false });
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
      if (error.response && error.response.status === 401) {
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

  // Voice recording handlers
  const startRecording = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert('Media recording is not supported in this browser.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        // auto-upload
        await uploadRecording(blob);
        // cleanup
        chunksRef.current = [];
        setRecordingDuration(0);
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach(t => t.stop());
          mediaStreamRef.current = null;
        }
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
      // start duration timer
      let start = Date.now();
      timerRef.current = setInterval(() => {
        setRecordingDuration(Math.floor((Date.now() - start) / 1000));
      }, 500);
    } catch (err) {
      console.error('Failed to start recording', err);
      alert('Could not start recording — permission denied or not available.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const uploadRecording = async (blob) => {
    try {
      const token = localStorage.getItem('token');
      const form = new FormData();
      // backend expects the file field to be named 'voice_note' on POST /api/journal
      form.append('voice_note', blob, 'journal_audio.webm');
      // optional text content and mood
      if (content) form.append('content', content);
      form.append('mood_score', moodScore);
      const config = {
        // Let the browser set the Content-Type with the proper boundary
        headers: { Authorization: `Bearer ${token}` },
      };
      // use the main journal create route which accepts multipart uploads
      await axios.post('/api/journal', form, config);
      // reset text input after uploading
      setContent('');
      setMoodScore(3);
      fetchEntries();
    } catch (err) {
      console.error('Upload failed', err);
      alert('Failed to upload audio entry');
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

  // Client-side filtering
  const filteredEntries = entries.filter((entry) => {
    // search
    if (searchQuery && !entry.content.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    // mood
    if (filterMood && entry.mood_score !== Number(filterMood)) return false;
    // date range
    if (startDate) {
      const s = new Date(startDate);
      const eDate = new Date(entry.createdAt);
      if (eDate < s) return false;
    }
    if (endDate) {
      const e = new Date(endDate);
      const eDate = new Date(entry.createdAt);
      // include entire end day
      e.setHours(23, 59, 59, 999);
      if (eDate > e) return false;
    }
    return true;
  });

  const exportCSV = () => {
    const rows = [['Date', 'Mood', 'Content']];
    filteredEntries.forEach(ent => {
      rows.push([
        new Date(ent.createdAt).toLocaleString(),
        ent.mood_score,
        (ent.content || '').replace(/\n/g, ' ').replace(/\r/g, ' ')
      ]);
    });
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'journal_entries.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // -- Insights / Alerts / Goals Helpers --
  useEffect(() => {
    computeInsights();
    detectAlerts();
  }, [entries]);

  const computeInsights = () => {
    if (!entries || entries.length === 0) {
      setInsights({});
      return;
    }
    // weekday averages
    const byWeekday = [[],[],[],[],[],[],[]];
    entries.forEach(e => {
      const d = new Date(e.createdAt || e.created_at || e.date);
      byWeekday[d.getDay()].push(e.mood_score || 3);
    });
    const weekdayAvg = byWeekday.map(arr => arr.length ? (arr.reduce((a,b)=>a+b,0)/arr.length) : null);
    // find significant drop: weekday avg at least 0.8 less than overall avg
    const overall = entries.reduce((s,e)=>s+(e.mood_score||3),0)/entries.length;
    const drops = weekdayAvg.map((v,i) => ({ day: i, avg: v })).filter(x => x.avg !== null && (overall - x.avg) >= 0.8);

    // journaling benefit: average mood on days with entries vs days without
    // approximate: compare moods on days where count>0 vs overall
    const datesWith = new Set(entries.map(e=>new Date(e.createdAt).toISOString().slice(0,10)));
    const moodsWith = entries.map(e=>e.mood_score||3);
    const avgWith = moodsWith.length ? moodsWith.reduce((a,b)=>a+b,0)/moodsWith.length : null;
    const avgOverall = overall;

    // emotional triggers: top words in negative entries
    const negTexts = entries.filter(e => (e.sentiment_label||'neutral') === 'negative' || (e.mood_score || 3) <= 2).map(e => e.content || '');
    const wordCounts = {};
    negTexts.forEach(t => (t||'').toLowerCase().split(/[^a-zA-Z]+/).filter(Boolean).forEach(w => { if (w.length>3) wordCounts[w]=(wordCounts[w]||0)+1; }));
    const triggers = Object.entries(wordCounts).sort((a,b)=>b[1]-a[1]).slice(0,6).map(x=>x[0]);

    setInsights({ weekdayAvg, drops, avgWith, avgOverall, triggers });
  };

  const detectAlerts = () => {
    const recent = entries.slice(0,6); // last 6 entries
    const lowCount = recent.filter(e => (e.mood_score||3) <= 2).length;
    const newAlerts = [];
    if (lowCount >= 3) {
      newAlerts.push({ type: 'support', message: 'We noticed several low mood entries recently. Try a short breathing exercise or reach out to someone you trust.' });
    }
    // sharp drop detection: compare last 3 avg to previous 3 avg
    if (entries.length >= 6) {
      const last3 = entries.slice(0,3).reduce((s,e)=>s+(e.mood_score||3),0)/3;
      const prev3 = entries.slice(3,6).reduce((s,e)=>s+(e.mood_score||3),0)/3;
      if (prev3 - last3 >= 1.2) newAlerts.push({ type: 'danger', message: 'Your mood has dropped recently. If you feel unsafe, contact emergency services or a trusted contact.' });
    }
    setAlerts(newAlerts);
  };

  // Goals & activity
  const saveGoals = (g) => {
    const newGoals = { ...goals, ...g };
    setGoals(newGoals);
    localStorage.setItem('mp_goals', JSON.stringify(newGoals));
  };

  const addActivityLog = (log) => {
    const list = [log, ...activityLogs].slice(0,365);
    setActivityLogs(list);
    localStorage.setItem('mp_activity', JSON.stringify(list));
  };

  const handleAddActivity = (e) => {
    e.preventDefault();
    if (!activityInput.date) return alert('Choose a date');
    addActivityLog({ date: activityInput.date, sleep: Number(activityInput.sleep)||0, exercise: Number(activityInput.exercise)||0, journaled: !!activityInput.journaled });
    setActivityInput({ date:'', sleep:'', exercise:'', journaled:false });
  };

  const computeGoalProgress = () => {
    // compute last 7 days totals
    const last7 = (new Date()); last7.setDate(last7.getDate()-6);
    const weekLogs = activityLogs.filter(l => new Date(l.date) >= last7);
    const avgSleep = weekLogs.length ? (weekLogs.reduce((s,l)=>s+(l.sleep||0),0)/weekLogs.length) : 0;
    const totalExercise = weekLogs.reduce((s,l)=>s+(l.exercise||0),0);
    const journalingDays = weekLogs.filter(l=>l.journaled).length;
    return {
      sleep: Math.min(100, Math.round((avgSleep / (goals.sleep||8))*100)),
      exercise: Math.min(100, Math.round((totalExercise / (goals.exercise||30))*100)),
      journaling: Math.min(100, Math.round((journalingDays / (goals.journaling||3))*100)),
    };
  };

  const scheduleReminder = (mins=60, text='Time to check-in') => {
    if (!('Notification' in window)) return alert('Notifications not supported');
    Notification.requestPermission().then(p => {
      if (p !== 'granted') return alert('Please allow notifications');
      setTimeout(() => new Notification('MindPulse Reminder', { body: text }), mins*60*1000);
      alert(`Reminder scheduled in ${mins} minute(s)`);
    });
  };

  if (loading) return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      color: 'var(--text-dark)',
      fontSize: '1.2rem'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '4px solid rgba(108,92,231,0.18)',
          borderTop: '4px solid var(--primary)',
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
    <div>
      <motion.main initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
        {/* Personalized Greeting */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} style={{ marginBottom: '2rem' }}>
          <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem' }}>
            Good Evening, <span style={{ background: 'linear-gradient(135deg, #6c5ce7, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{localStorage.getItem('username') || 'User'}</span> 👋
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '1rem' }}>
            Welcome back! Here's your wellness dashboard.
          </p>
        </motion.div>

        {/* Header */}
        <div className="glass-card animate-in" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          padding: '1.5rem 2rem'
        }}>
          <div>
            <h2 style={{ margin: '0 0 0.5rem 0' }}>Dashboard Overview</h2>
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
                <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-dark)', fontSize: '2rem' }}>
                  {avgMood.toFixed(1)}
                </h3>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  {moodLabels[Math.min(Math.floor(avgMood) - 1, 4)]} overall
                </p>
              </div>
              <div style={{
                width: '50px',
                height: '50px',
                background: 'var(--gradient-primary)',
                borderRadius: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                color: 'white'
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
                <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-dark)', fontSize: '2rem' }}>
                  {entries.length}
                </h3>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  Journal entries logged
                </p>
              </div>
              <div style={{
                width: '50px',
                height: '50px',
                background: 'var(--gradient-secondary)',
                borderRadius: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
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
                <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-dark)', fontSize: '2rem' }}>
                  {entries.length > 0 ? Math.floor(entries.length / 7) : 0}w
                </h3>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  Weeks active
                </p>
              </div>
              <div style={{
                width: '50px',
                height: '50px',
                background: 'var(--gradient-accent)',
                borderRadius: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}>
                <TrendingUp size={28} color="white" />
              </div>
            </div>
          </div>
        </div>

        {/* Insights & Alerts */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
          <div className="glass-card animate-in" style={{ padding: '1.25rem', borderRadius: 12, boxShadow: '0 6px 18px rgba(16,24,40,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem' }}>Intelligent Insights</h3>
                <small style={{ color: 'var(--text-muted)' }}>Patterns & nudges based on your recent entries</small>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn" onClick={fetchEntries} title="Refresh insights" style={{ padding: '0.4rem 0.6rem' }}>Refresh</button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ padding: 12, borderRadius: 10, background: 'linear-gradient(180deg, rgba(108,92,231,0.04), rgba(108,92,231,0.02))' }}>
                <strong style={{ display: 'block', marginBottom: 6 }}>Weekday Patterns</strong>
                {insights.drops && insights.drops.length > 0 ? (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{insights.drops.map(d => <span key={d.day} className="tag">{['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.day]}</span>)}</div>
                ) : (
                  <div style={{ color: 'var(--text-muted)' }}>No strong weekday mood drops detected.</div>
                )}
              </div>

              <div style={{ padding: 12, borderRadius: 10, background: 'linear-gradient(180deg, rgba(16,185,129,0.04), rgba(16,185,129,0.02))' }}>
                <strong style={{ display: 'block', marginBottom: 6 }}>Journaling Impact</strong>
                {insights.avgWith != null ? (
                  <div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>{insights.avgWith.toFixed(1)}</div>
                    <div style={{ color: 'var(--text-muted)' }}>Average on journaling entries (overall {insights.avgOverall.toFixed(1)})</div>
                    {insights.avgWith > insights.avgOverall && <div style={{ marginTop: 6, color: 'var(--text-muted)' }}>Journaling appears to be associated with slightly higher mood.</div>}
                  </div>
                ) : <div style={{ color: 'var(--text-muted)' }}>No data yet.</div>}
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              <strong>Possible triggers</strong>
              <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>{insights.triggers && insights.triggers.length ? insights.triggers.map(t => <span key={t} className="tag">{t}</span>) : <span style={{ color: 'var(--text-muted)' }}>No clear triggers detected.</span>}</div>
            </div>
          </div>

          <div className="glass-card animate-in" style={{ padding: '1rem', borderRadius: 12, boxShadow: '0 6px 18px rgba(16,24,40,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem' }}>Alerts</h3>
                <small style={{ color: 'var(--text-muted)' }}>Timely support when you need it</small>
              </div>
            </div>

            <div style={{ marginTop: 10 }}>
              {alerts.length === 0 && <div style={{ color: 'var(--text-muted)' }}>No alerts right now.</div>}
              {alerts.map((a, i) => (
                <div key={i} style={{ marginTop: 10, padding: 12, borderRadius: 10, display: 'flex', gap: 10, alignItems: 'center', background: a.type === 'danger' ? 'rgba(255,240,240,0.9)' : 'rgba(255,250,240,0.9)' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: a.type === 'danger' ? '#ffefef' : '#fff7ed' }}>
                    {a.type === 'danger' ? '⚠️' : '💬'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{a.type === 'danger' ? 'Take care' : 'Support tip'}</div>
                    <div style={{ color: 'var(--text-muted)', marginTop: 4 }}>{a.message}</div>
                    <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                      <button className="btn btn-secondary" onClick={() => { document.querySelector('audio[src$="box-breathing-guide.mp3"]')?.play(); }}>Start Breathing</button>
                      <button className="btn" onClick={() => window.location.href = '/support'}>Get Support</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Goals & Habits Tracker */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
          <div className="glass-card animate-in" style={{ padding: '1.25rem', borderRadius: 12, boxShadow: '0 6px 18px rgba(16,24,40,0.04)' }}>
            <h3 style={{ marginTop: 0 }}>Goals & Habits</h3>
            <small style={{ color: 'var(--text-muted)' }}>Set simple weekly targets to build consistency</small>
            <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
              <label style={{ fontSize: 13 }}>Sleep target (hours)</label>
              <input type="number" value={goals.sleep} onChange={e => saveGoals({ sleep: Number(e.target.value) })} style={{ padding: '8px', borderRadius: 8 }} />
              <label style={{ fontSize: 13 }}>Exercise target (minutes / week)</label>
              <input type="number" value={goals.exercise} onChange={e => saveGoals({ exercise: Number(e.target.value) })} style={{ padding: '8px', borderRadius: 8 }} />
              <label style={{ fontSize: 13 }}>Journaling target (days / week)</label>
              <input type="number" value={goals.journaling} onChange={e => saveGoals({ journaling: Number(e.target.value) })} style={{ padding: '8px', borderRadius: 8 }} />
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button className="btn btn-secondary" onClick={() => scheduleReminder(60, 'Time to journal!')}>Remind in 1h</button>
                <button className="btn" onClick={() => scheduleReminder(24*60, 'Daily reflection time')}>Daily Reminder</button>
              </div>
            </div>
          </div>

          <div className="glass-card animate-in" style={{ padding: '1.25rem', borderRadius: 12, boxShadow: '0 6px 18px rgba(16,24,40,0.04)' }}>
            <h3 style={{ marginTop: 0 }}>Log Activity</h3>
            <small style={{ color: 'var(--text-muted)' }}>Track sleep, exercise and whether you journaled</small>
            <form onSubmit={handleAddActivity} style={{ display: 'grid', gap: 8, marginTop: 10 }}>
              <input type="date" value={activityInput.date} onChange={e => setActivityInput(s=>({ ...s, date: e.target.value }))} style={{ padding: 8, borderRadius: 8 }} />
              <input placeholder="Sleep hours" value={activityInput.sleep} onChange={e => setActivityInput(s=>({ ...s, sleep: e.target.value }))} style={{ padding: 8, borderRadius: 8 }} />
              <input placeholder="Exercise minutes" value={activityInput.exercise} onChange={e => setActivityInput(s=>({ ...s, exercise: e.target.value }))} style={{ padding: 8, borderRadius: 8 }} />
              <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}><input type="checkbox" checked={activityInput.journaled} onChange={e => setActivityInput(s=>({ ...s, journaled: e.target.checked }))} /> Journaled today</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-primary" type="submit">Add</button>
                <button type="button" className="btn" onClick={() => { setActivityInput({ date:'', sleep:'', exercise:'', journaled:false }); }}>Clear</button>
              </div>

              <div style={{ marginTop: 6 }}>
                <strong>Progress (7d)</strong>
                <div style={{ marginTop: 8, display: 'grid', gap: 8 }}>
                  {(() => { const p = computeGoalProgress(); return (
                    <>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Sleep</span><span>{p.sleep}%</span></div>
                        <div style={{ height: 10, background: '#eef2ff', borderRadius: 8, overflow: 'hidden', marginTop: 6 }}><div style={{ width: `${p.sleep}%`, height: '100%', background: 'linear-gradient(90deg,#7c3aed,#4f46e5)' }} /></div>
                      </div>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Exercise</span><span>{p.exercise}%</span></div>
                        <div style={{ height: 10, background: '#fff7ed', borderRadius: 8, overflow: 'hidden', marginTop: 6 }}><div style={{ width: `${p.exercise}%`, height: '100%', background: 'linear-gradient(90deg,#f97316,#fb923c)' }} /></div>
                      </div>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Journaling</span><span>{p.journaling}%</span></div>
                        <div style={{ height: 10, background: '#ecfdf5', borderRadius: 8, overflow: 'hidden', marginTop: 6 }}><div style={{ width: `${p.journaling}%`, height: '100%', background: 'linear-gradient(90deg,#10b981,#34d399)' }} /></div>
                      </div>
                    </>
                  ); })()}
                </div>
              </div>
            </form>
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
                          border: moodScore === score ? '2px solid var(--primary)' : '2px solid rgba(15,23,42,0.04)',
                          background: moodScore === score
                            ? 'rgba(108,92,231,0.08)'
                            : 'transparent',
                          color: 'var(--text-dark)',
                          cursor: 'pointer',
                          fontSize: '1.5rem',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        {moodEmojis[score - 1]}
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-between text-muted" style={{ fontSize: '0.75rem', opacity: 0.8 }}>
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
                    style={{ marginBottom: '1.5rem', fontFamily: 'inherit' }}
                  ></textarea>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <button
                      type="button"
                      onClick={isRecording ? stopRecording : startRecording}
                      className={isRecording ? 'btn btn-danger' : 'btn btn-outline'}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem' }}
                    >
                      {isRecording ? <StopCircle size={16} /> : <Mic size={16} />}
                      {isRecording ? 'Stop Recording' : 'Record Voice'}
                    </button>
                    <div style={{ fontSize: '0.9rem', color: isRecording ? '#ef4444' : 'var(--text-muted)' }}>
                      {isRecording ? `● Recording — ${Math.floor(recordingDuration / 60).toString().padStart(2, '0')}:${(recordingDuration % 60).toString().padStart(2, '0')}` : 'You can record an audio entry instead of writing.'}
                    </div>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', fontSize: '1rem', padding: '1rem' }}>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
              <h2 style={{ margin: 0 }}>Recent Entries</h2>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                  placeholder="Search entries"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid var(--glass-border)' }}
                />
                <select value={filterMood} onChange={(e) => setFilterMood(e.target.value)} style={{ padding: '0.5rem', borderRadius: '0.5rem' }}>
                  <option value={0}>All Moods</option>
                  {[1, 2, 3, 4, 5].map(m => (
                    <option key={m} value={m}>{m} — {moodLabels[m - 1]}</option>
                  ))}
                </select>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ padding: '0.35rem', borderRadius: '0.35rem' }} />
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ padding: '0.35rem', borderRadius: '0.35rem' }} />
                <button onClick={exportCSV} className="btn btn-secondary" style={{ padding: '0.5rem 0.75rem' }}>Export CSV</button>
                <button onClick={() => { setSearchQuery(''); setFilterMood(0); setStartDate(''); setEndDate(''); }} className="btn" style={{ padding: '0.5rem 0.5rem' }}>Clear</button>
              </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              <EntryList entries={filteredEntries} onDelete={fetchEntries} />
            </div>
          </div>
        </div>

      </motion.main>
      {/* Chatbot */}
      <Chatbot />
    </div>
  );
};

export default Dashboard;
