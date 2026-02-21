import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import MoodChart from '../components/MoodChart';
import EntryList from '../components/EntryList';
import Chatbot from '../components/Chatbot';
import { motion } from 'framer-motion';
import { LogOut, Heart, TrendingUp, Zap, Mic, StopCircle, Lightbulb, AlertCircle, Target, Activity, Bell, Clock, X } from 'lucide-react';
import Achievements, { computeStreak } from '../components/Achievements';

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
  // Reminders & Notifications
  const [reminders, setReminders] = useState(() => {
    try { return JSON.parse(localStorage.getItem('mp_reminders')) || []; } catch { return []; }
  });
  const [notifications, setNotifications] = useState([]);
  const [reminderText, setReminderText] = useState('');
  const [reminderTime, setReminderTime] = useState('08:00');
  const [showReminderForm, setShowReminderForm] = useState(false);
  const notificationTimeoutRef = useRef({});
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

  // Cleanup notification timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(notificationTimeoutRef.current).forEach(timeout => clearTimeout(timeout));
    };
  }, []);

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
    
    // Show encouragement
    const goalKeys = Object.keys(g);
    if (goalKeys.includes('sleep')) showNotification(`🎯 Sleep goal updated to ${g.sleep}h`, 'success');
    if (goalKeys.includes('exercise')) showNotification(`🎯 Exercise goal updated to ${g.exercise}min/week`, 'success');
    if (goalKeys.includes('journaling')) showNotification(`🎯 Journaling goal updated to ${g.journaling}d/week`, 'success');
  };

  const addActivityLog = (log) => {
    const list = [log, ...activityLogs].slice(0,365);
    setActivityLogs(list);
    localStorage.setItem('mp_activity', JSON.stringify(list));
    
    // Trigger real-time feedback based on progress
    const last7 = (new Date()); last7.setDate(last7.getDate()-6);
    const weekLogs = list.filter(l => new Date(l.date) >= last7);
    const avgSleep = weekLogs.length ? (weekLogs.reduce((s,l)=>s+(l.sleep||0),0)/weekLogs.length) : 0;
    const totalExercise = weekLogs.reduce((s,l)=>s+(l.exercise||0),0);
    const journalingDays = weekLogs.filter(l=>l.journaled).length;
    
    const sleepProg = Math.min(100, Math.round((avgSleep / (goals.sleep||8))*100));
    const exerciseProg = Math.min(100, Math.round((totalExercise / (goals.exercise||30))*100));
    const journalProg = Math.min(100, Math.round((journalingDays / (goals.journaling||3))*100));
    
    if (journalProg === 100) {
      showNotification('🎉 Journaling goal complete this week!', 'success');
    } else if (exerciseProg === 100) {
      showNotification('💪 Exercise goal complete this week!', 'success');
    } else if (sleepProg === 100) {
      showNotification('😴 Sleep goal complete this week!', 'success');
    }
  };

  const handleAddActivity = (e) => {
    e.preventDefault();
    if (!activityInput.date) return alert('Choose a date');
    
    const activityLog = { 
      date: activityInput.date, 
      sleep: Number(activityInput.sleep)||0, 
      exercise: Number(activityInput.exercise)||0, 
      journaled: !!activityInput.journaled 
    };
    
    addActivityLog(activityLog);
    
    // Show encouragement notifications
    let encouragements = [];
    if (activityLog.sleep > 0) encouragements.push(`😴 ${activityLog.sleep}h sleep logged!`);
    if (activityLog.exercise > 0) encouragements.push(`🏃 ${activityLog.exercise}min exercise!`);
    if (activityLog.journaled) encouragements.push('📝 Great journaling today!');
    
    if (encouragements.length > 0) {
      showNotification(`✅ ${encouragements.join(' • ')}`, 'success');
    }
    
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

  // Enhanced reminder management
  const addCustomReminder = () => {
    if (!reminderText.trim()) return alert('Enter a reminder message');
    if (!reminderTime) return alert('Select a time');
    const newReminder = {
      id: Date.now(),
      message: reminderText,
      time: reminderTime,
      type: 'custom',
      enabled: true,
      createdAt: new Date().toISOString()
    };
    const updated = [...reminders, newReminder];
    setReminders(updated);
    localStorage.setItem('mp_reminders', JSON.stringify(updated));
    setReminderText('');
    setReminderTime('08:00');
    setShowReminderForm(false);
    showNotification(`✅ Reminder added for ${reminderTime}`, 'success');
  };

  const deleteReminder = (id) => {
    const updated = reminders.filter(r => r.id !== id);
    setReminders(updated);
    localStorage.setItem('mp_reminders', JSON.stringify(updated));
    showNotification('🗑️ Reminder removed', 'info');
  };

  const toggleReminder = (id) => {
    const updated = reminders.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r);
    setReminders(updated);
    localStorage.setItem('mp_reminders', JSON.stringify(updated));
  };

  const showNotification = (message, type = 'info') => {
    const id = Date.now();
    const notification = { id, message, type };
    setNotifications(prev => [...prev, notification]);
    
    // Auto remove after 4 seconds
    if (notificationTimeoutRef.current[id]) {
      clearTimeout(notificationTimeoutRef.current[id]);
    }
    notificationTimeoutRef.current[id] = setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
      delete notificationTimeoutRef.current[id];
    }, 4000);
  };

  const getEncouragementMessage = () => {
    const progress = computeGoalProgress();
    if (progress.journaling === 100) return "🎉 You've crushed your journaling goal!";
    if (progress.exercise === 100) return "💪 Amazing exercise effort!";
    if (progress.sleep === 100) return "😴 Great sleep consistency!";
    if (progress.journaling >= 75) return "📝 Almost there on journaling!";
    if (progress.exercise >= 75) return "🏃 Keep up the great work!";
    if (progress.sleep >= 75) return "✨ You're doing fantastic!";
    if (activityLogs.length > 0 && activityLogs[0].date === new Date().toISOString().split('T')[0]) {
      return "🌟 Great start today!";
    }
    return "💪 Let's build those habits!";
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
      {/* Notification Toast Container */}
      <div style={{
        position: 'fixed',
        top: '1.5rem',
        right: '1.5rem',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem'
      }}>
        {notifications.map(notif => (
          <motion.div
            key={notif.id}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.3 }}
            style={{
              padding: '1rem 1.25rem',
              borderRadius: 12,
              background: notif.type === 'success' 
                ? 'linear-gradient(135deg, #10b981, #34d399)'
                : notif.type === 'error'
                ? 'linear-gradient(135deg, #ef4444, #f87171)'
                : 'linear-gradient(135deg, #6c5ce7, #8b5cf6)',
              color: 'white',
              fontWeight: 600,
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
              minWidth: '280px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '1rem'
            }}
          >
            <span>{notif.message}</span>
            <button
              onClick={() => setNotifications(prev => prev.filter(n => n.id !== notif.id))}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                padding: '0.25rem',
                borderRadius: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={18} />
            </button>
          </motion.div>
        ))}
      </div>

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
        {/* <div className="glass-card animate-in" style={{
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
        </div> */}

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
                  Journaling Streak
                </p>
                <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-dark)', fontSize: '2rem' }}>
                  {computeStreak(entries)}d
                </h3>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  {computeStreak(entries) > 0 ? '🔥 Keep the streak alive!' : 'Start logging today!'}
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

        {/* Achievements Panel */}
        <Achievements entries={entries} />

        {/* Insights & Alerts */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          {/* Intelligent Insights Card */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="glass-card animate-in" 
            style={{ 
              padding: '1.5rem', 
              borderRadius: 16, 
              boxShadow: '0 8px 24px rgba(108,92,231,0.12)',
              background: 'linear-gradient(135deg, rgba(108,92,231,0.08) 0%, rgba(139,92,246,0.04) 100%)',
              border: '1px solid rgba(108,92,231,0.2)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{
                width: 44,
                height: 44,
                background: 'linear-gradient(135deg, #6c5ce7, #8b5cf6)',
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '1.5rem'
              }}>
                <Lightbulb size={24} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-dark)' }}>Intelligent Insights</h3>
                <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '0.25rem' }}>Patterns from your entries</small>
              </div>
              <button 
                className="btn" 
                onClick={fetchEntries} 
                title="Refresh insights" 
                style={{ 
                  padding: '0.5rem 0.75rem', 
                  marginLeft: 'auto',
                  fontSize: '0.85rem',
                  background: 'rgba(108,92,231,0.1)',
                  color: '#6c5ce7'
                }}
              >
                Refresh
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Weekday Patterns */}
              <div style={{ 
                padding: '1rem', 
                borderRadius: 12, 
                background: 'linear-gradient(135deg, rgba(108,92,231,0.06) 0%, rgba(139,92,246,0.03) 100%)',
                border: '1px solid rgba(108,92,231,0.15)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '1.1rem' }}>📅</span>
                  <strong style={{ color: 'var(--text-dark)' }}>Weekday Patterns</strong>
                </div>
                {insights.drops && insights.drops.length > 0 ? (
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {insights.drops.map(d => (
                      <span key={d.day} style={{
                        background: 'linear-gradient(135deg, #6c5ce7, #8b5cf6)',
                        color: 'white',
                        padding: '0.4rem 0.8rem',
                        borderRadius: 8,
                        fontSize: '0.85rem',
                        fontWeight: 600
                      }}>
                        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.day]}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>✨ No strong mood drops detected.</div>
                )}
              </div>

              {/* Journaling Impact */}
              <div style={{ 
                padding: '1rem', 
                borderRadius: 12, 
                background: 'linear-gradient(135deg, rgba(16,185,129,0.06) 0%, rgba(52,211,153,0.03) 100%)',
                border: '1px solid rgba(16,185,129,0.15)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '1.1rem' }}>📝</span>
                  <strong style={{ color: 'var(--text-dark)' }}>Journaling Impact</strong>
                </div>
                {insights.avgWith != null ? (
                  <div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#10b981', marginBottom: '0.25rem' }}>
                      {insights.avgWith.toFixed(1)}
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                      Average mood on journaling days (overall {insights.avgOverall.toFixed(1)})
                    </div>
                    {insights.avgWith > insights.avgOverall && (
                      <div style={{ marginTop: '0.5rem', color: '#10b981', fontSize: '0.9rem', fontWeight: 500 }}>
                        ↑ Journaling boosts your mood
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Keep journaling to see insights</div>
                )}
              </div>

              {/* Possible Triggers */}
              <div style={{ 
                padding: '1rem', 
                borderRadius: 12, 
                background: 'linear-gradient(135deg, rgba(245,158,11,0.06) 0%, rgba(251,146,60,0.03) 100%)',
                border: '1px solid rgba(245,158,11,0.15)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '1.1rem' }}>🎯</span>
                  <strong style={{ color: 'var(--text-dark)' }}>Possible Triggers</strong>
                </div>
                {insights.triggers && insights.triggers.length > 0 ? (
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {insights.triggers.map(t => (
                      <span key={t} style={{
                        background: 'linear-gradient(135deg, #f59e0b, #fb923c)',
                        color: 'white',
                        padding: '0.4rem 0.8rem',
                        borderRadius: 8,
                        fontSize: '0.85rem',
                        fontWeight: 600
                      }}>
                        {t}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>No clear triggers detected yet</div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Alerts Card */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="glass-card animate-in" 
            style={{ 
              padding: '1.5rem', 
              borderRadius: 16, 
              boxShadow: '0 8px 24px rgba(239,68,68,0.08)',
              background: 'linear-gradient(135deg, rgba(239,68,68,0.05) 0%, rgba(249,115,22,0.03) 100%)',
              border: '1px solid rgba(239,68,68,0.15)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{
                width: 44,
                height: 44,
                background: 'linear-gradient(135deg, #ef4444, #f97316)',
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '1.5rem'
              }}>
                <AlertCircle size={24} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-dark)' }}>Alerts & Support</h3>
                <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '0.25rem' }}>Stay supported always</small>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {alerts.length === 0 ? (
                <div style={{
                  padding: '1.5rem',
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(52,211,153,0.04) 100%)',
                  border: '1px solid rgba(16,185,129,0.15)',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>✨</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                    You're doing great! No alerts right now.
                  </div>
                </div>
              ) : (
                alerts.map((a, i) => (
                  <div 
                    key={i} 
                    style={{ 
                      padding: '1rem', 
                      borderRadius: 12, 
                      background: a.type === 'danger' 
                        ? 'linear-gradient(135deg, rgba(255,87,87,0.08) 0%, rgba(255,127,80,0.04) 100%)'
                        : 'linear-gradient(135deg, rgba(255,193,7,0.08) 0%, rgba(255,152,0,0.04) 100%)',
                      border: a.type === 'danger' 
                        ? '1px solid rgba(255,87,87,0.15)'
                        : '1px solid rgba(255,193,7,0.15)',
                      display: 'flex', 
                      gap: '1rem'
                    }}
                  >
                    <div style={{ fontSize: '1.5rem' }}>
                      {a.type === 'danger' ? '⚠️' : '💡'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-dark)' }}>
                        {a.type === 'danger' ? 'Take Care' : 'Support Tip'}
                      </div>
                      <div style={{ color: 'var(--text-muted)', marginTop: '0.25rem', fontSize: '0.9rem' }}>
                        {a.message}
                      </div>
                      <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                        <button 
                          className="btn btn-secondary" 
                          onClick={() => { document.querySelector('audio[src$="box-breathing-guide.mp3"]')?.play(); }}
                          style={{ fontSize: '0.85rem', padding: '0.4rem 0.75rem' }}
                        >
                          🧘 Breathe
                        </button>
                        <button 
                          className="btn" 
                          onClick={() => window.location.href = '/support'}
                          style={{ fontSize: '0.85rem', padding: '0.4rem 0.75rem', background: a.type === 'danger' ? '#ef4444' : '#f59e0b', color: 'white' }}
                        >
                          Get Support
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>

        {/* Goals & Habits Tracker */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          {/* Goals Card */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="glass-card animate-in" 
            style={{ 
              padding: '1.5rem', 
              borderRadius: 16, 
              boxShadow: '0 8px 24px rgba(139,92,246,0.12)',
              background: 'linear-gradient(135deg, rgba(139,92,246,0.08) 0%, rgba(167,139,250,0.04) 100%)',
              border: '1px solid rgba(139,92,246,0.2)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{
                width: 44,
                height: 44,
                background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '1.5rem'
              }}>
                <Target size={24} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-dark)' }}>Goals & Habits</h3>
                <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '0.25rem' }}>Weekly targets for consistency</small>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Sleep Goal */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <label style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-dark)' }}>😴 Sleep target (hours)</label>
                  <span style={{ fontSize: '1.8rem', fontWeight: 700, color: '#8b5cf6' }}>{goals.sleep}</span>
                </div>
                <input 
                  type="number" 
                  value={goals.sleep} 
                  onChange={e => saveGoals({ sleep: Number(e.target.value) })} 
                  style={{ 
                    padding: '0.75rem', 
                    borderRadius: 10,
                    width: '100%',
                    border: '1px solid rgba(139,92,246,0.3)',
                    background: 'rgba(139,92,246,0.05)',
                    color: 'var(--text-dark)'
                  }} 
                />
              </div>

              {/* Exercise Goal */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <label style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-dark)' }}>🏃 Exercise (min/week)</label>
                  <span style={{ fontSize: '1.8rem', fontWeight: 700, color: '#f97316' }}>{goals.exercise}</span>
                </div>
                <input 
                  type="number" 
                  value={goals.exercise} 
                  onChange={e => saveGoals({ exercise: Number(e.target.value) })} 
                  style={{ 
                    padding: '0.75rem', 
                    borderRadius: 10,
                    width: '100%',
                    border: '1px solid rgba(249,115,22,0.3)',
                    background: 'rgba(249,115,22,0.05)',
                    color: 'var(--text-dark)'
                  }} 
                />
              </div>

              {/* Journaling Goal */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <label style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-dark)' }}>📔 Journaling (days/week)</label>
                  <span style={{ fontSize: '1.8rem', fontWeight: 700, color: '#10b981' }}>{goals.journaling}</span>
                </div>
                <input 
                  type="number" 
                  value={goals.journaling} 
                  onChange={e => saveGoals({ journaling: Number(e.target.value) })} 
                  style={{ 
                    padding: '0.75rem', 
                    borderRadius: 10,
                    width: '100%',
                    border: '1px solid rgba(16,185,129,0.3)',
                    background: 'rgba(16,185,129,0.05)',
                    color: 'var(--text-dark)'
                  }} 
                />
              </div>

              {/* Encouragement Message */}
              <div style={{
                padding: '1rem',
                borderRadius: 12,
                background: 'linear-gradient(135deg, rgba(251,146,60,0.1) 0%, rgba(239,68,68,0.05) 100%)',
                border: '1px solid rgba(251,146,60,0.2)',
                textAlign: 'center',
                marginTop: '0.5rem'
              }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                  {getEncouragementMessage().split(' ')[0]}
                </div>
                <div style={{ color: 'var(--text-dark)', fontWeight: 600, fontSize: '0.95rem' }}>
                  {getEncouragementMessage()}
                </div>
              </div>

              {/* Quick Reminders & Custom Reminders */}
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(139,92,246,0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <label style={{ fontWeight: 700, color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Bell size={18} /> Reminders ({reminders.length})
                  </label>
                  <button
                    onClick={() => setShowReminderForm(!showReminderForm)}
                    style={{
                      background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
                      color: 'white',
                      border: 'none',
                      padding: '0.5rem 0.75rem',
                      borderRadius: 8,
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: 600
                    }}
                  >
                    {showReminderForm ? '✕ Cancel' : '+ Add Reminder'}
                  </button>
                </div>

                {/* Custom Reminder Form */}
                {showReminderForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{
                      padding: '1rem',
                      background: 'rgba(139,92,246,0.05)',
                      border: '1px solid rgba(139,92,246,0.2)',
                      borderRadius: 10,
                      marginBottom: '1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem'
                    }}
                  >
                    <input
                      type="text"
                      placeholder="What's your reminder?"
                      value={reminderText}
                      onChange={e => setReminderText(e.target.value)}
                      style={{
                        padding: '0.75rem',
                        borderRadius: 8,
                        border: '1px solid rgba(139,92,246,0.3)',
                        background: 'rgba(139,92,246,0.05)',
                        color: 'var(--text-dark)',
                        fontSize: '0.9rem'
                      }}
                    />
                    <input
                      type="time"
                      value={reminderTime}
                      onChange={e => setReminderTime(e.target.value)}
                      style={{
                        padding: '0.75rem',
                        borderRadius: 8,
                        border: '1px solid rgba(139,92,246,0.3)',
                        background: 'rgba(139,92,246,0.05)',
                        color: 'var(--text-dark)',
                        fontSize: '0.9rem'
                      }}
                    />
                    <button
                      onClick={addCustomReminder}
                      style={{
                        padding: '0.75rem',
                        background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 8,
                        cursor: 'pointer',
                        fontWeight: 600
                      }}
                    >
                      Set Reminder
                    </button>
                  </motion.div>
                )}

                {/* Quick Reminder Buttons */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                  <button 
                    onClick={() => {
                      const now = new Date();
                      setTimeout(() => showNotification('⏰ It\'s time to journal!', 'success'), 60000);
                      showNotification('📌 Reminder set for 1 hour', 'info');
                    }}
                    style={{ 
                      padding: '0.75rem',
                      background: 'linear-gradient(135deg, rgba(139,92,246,0.2) 0%, rgba(167,139,250,0.1) 100%)',
                      color: '#8b5cf6',
                      border: '1px solid rgba(139,92,246,0.3)',
                      borderRadius: 8,
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    ⏱️ Remind in 1h
                  </button>
                  <button 
                    onClick={() => {
                      showNotification('📌 Daily reminder set for tomorrow', 'info');
                    }}
                    style={{ 
                      padding: '0.75rem',
                      background: 'linear-gradient(135deg, rgba(139,92,246,0.3) 0%, rgba(167,139,250,0.15) 100%)',
                      color: '#8b5cf6',
                      border: '1px solid rgba(139,92,246,0.4)',
                      borderRadius: 8,
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    📅 Daily Reminder
                  </button>
                </div>

                {/* Reminders List */}
                {reminders.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto' }}>
                    {reminders.map(reminder => (
                      <div
                        key={reminder.id}
                        style={{
                          padding: '0.75rem',
                          background: reminder.enabled 
                            ? 'linear-gradient(135deg, rgba(139,92,246,0.1) 0%, rgba(167,139,250,0.05) 100%)'
                            : 'rgba(200,200,200,0.05)',
                          border: reminder.enabled 
                            ? '1px solid rgba(139,92,246,0.2)'
                            : '1px solid rgba(200,200,200,0.2)',
                          borderRadius: 8,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          opacity: reminder.enabled ? 1 : 0.6
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, color: 'var(--text-dark)', fontSize: '0.9rem' }}>
                            {reminder.message}
                          </div>
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                            <Clock size={14} /> {reminder.time}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => toggleReminder(reminder.id)}
                            style={{
                              background: reminder.enabled ? '#10b981' : '#d1d5db',
                              color: 'white',
                              border: 'none',
                              padding: '0.4rem 0.5rem',
                              borderRadius: 6,
                              cursor: 'pointer',
                              fontSize: '0.75rem',
                              fontWeight: 600
                            }}
                          >
                            {reminder.enabled ? '✓' : '○'}
                          </button>
                          <button
                            onClick={() => deleteReminder(reminder.id)}
                            style={{
                              background: '#ef4444',
                              color: 'white',
                              border: 'none',
                              padding: '0.4rem 0.5rem',
                              borderRadius: 6,
                              cursor: 'pointer',
                              fontSize: '0.75rem'
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '1rem' }}>
                    No custom reminders yet. Add one to stay motivated!
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Log Activity Card */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="glass-card animate-in" 
            style={{ 
              padding: '1.5rem', 
              borderRadius: 16, 
              boxShadow: '0 8px 24px rgba(251,146,60,0.12)',
              background: 'linear-gradient(135deg, rgba(251,146,60,0.08) 0%, rgba(251,191,36,0.04) 100%)',
              border: '1px solid rgba(251,146,60,0.2)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{
                width: 44,
                height: 44,
                background: 'linear-gradient(135deg, #fb923c, #fbbf24)',
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '1.5rem'
              }}>
                <Activity size={24} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-dark)' }}>Log Activity</h3>
                <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '0.25rem' }}>Track your daily progress</small>
              </div>
            </div>

            <form onSubmit={handleAddActivity} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input 
                type="date" 
                value={activityInput.date} 
                onChange={e => setActivityInput(s=>({ ...s, date: e.target.value }))} 
                style={{ 
                  padding: '0.75rem', 
                  borderRadius: 10,
                  border: '1px solid rgba(251,146,60,0.3)',
                  background: 'rgba(251,146,60,0.05)',
                  color: 'var(--text-dark)',
                  fontFamily: 'inherit'
                }} 
              />
              
              <div>
                <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-dark)', display: 'block', marginBottom: '0.5rem' }}>
                  😴 Sleep hours
                </label>
                <input 
                  type="number" 
                  placeholder="8" 
                  value={activityInput.sleep} 
                  onChange={e => setActivityInput(s=>({ ...s, sleep: e.target.value }))} 
                  style={{ 
                    padding: '0.75rem', 
                    borderRadius: 10,
                    width: '100%',
                    border: '1px solid rgba(251,146,60,0.3)',
                    background: 'rgba(251,146,60,0.05)',
                    color: 'var(--text-dark)'
                  }} 
                />
              </div>

              <div>
                <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-dark)', display: 'block', marginBottom: '0.5rem' }}>
                  🏃 Exercise minutes
                </label>
                <input 
                  type="number" 
                  placeholder="30" 
                  value={activityInput.exercise} 
                  onChange={e => setActivityInput(s=>({ ...s, exercise: e.target.value }))} 
                  style={{ 
                    padding: '0.75rem', 
                    borderRadius: 10,
                    width: '100%',
                    border: '1px solid rgba(251,146,60,0.3)',
                    background: 'rgba(251,146,60,0.05)',
                    color: 'var(--text-dark)'
                  }} 
                />
              </div>

              <label style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', padding: '0.75rem', borderRadius: 10, background: 'rgba(251,146,60,0.05)', border: '1px solid rgba(251,146,60,0.2)', cursor: 'pointer', transition: 'all 0.3s ease' }}>
                <input 
                  type="checkbox" 
                  checked={activityInput.journaled} 
                  onChange={e => setActivityInput(s=>({ ...s, journaled: e.target.checked }))}
                  style={{ cursor: 'pointer' }}
                />
                <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-dark)' }}>📔 Journaled today</span>
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <button 
                  className="btn btn-primary" 
                  type="submit"
                  style={{ 
                    background: 'linear-gradient(135deg, #fb923c, #f97316)',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem',
                    fontWeight: 600
                  }}
                >
                  ✓ Add
                </button>
                <button 
                  type="button" 
                  className="btn" 
                  onClick={() => { setActivityInput({ date:'', sleep:'', exercise:'', journaled:false }); }}
                  style={{ 
                    background: 'rgba(251,146,60,0.1)',
                    color: '#fb923c',
                    border: 'none',
                    padding: '0.75rem',
                    fontWeight: 600
                  }}
                >
                  Reset
                </button>
              </div>

              {/* Progress Section */}
              <div style={{ 
                marginTop: '1rem', 
                padding: '1rem', 
                borderRadius: 12,
                background: 'linear-gradient(135deg, rgba(235,245,249,0.8) 0%, rgba(224,242,254,0.4) 100%)',
                border: '1px solid rgba(30,144,255,0.15)'
              }}>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '1rem' }}>
                  📊 Progress (7 days)
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {(() => { const p = computeGoalProgress(); return (
                    <>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                          <span style={{ fontWeight: 600, color: 'var(--text-dark)' }}>😴 Sleep</span>
                          <span style={{ fontWeight: 700, color: '#8b5cf6' }}>{p.sleep}%</span>
                        </div>
                        <div style={{ height: 12, background: 'rgba(139,92,246,0.15)', borderRadius: 10, overflow: 'hidden' }}>
                          <div style={{ width: `${p.sleep}%`, height: '100%', background: 'linear-gradient(90deg, #8b5cf6, #a78bfa)', transition: 'width 0.4s ease' }} />
                        </div>
                      </div>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                          <span style={{ fontWeight: 600, color: 'var(--text-dark)' }}>🏃 Exercise</span>
                          <span style={{ fontWeight: 700, color: '#f97316' }}>{p.exercise}%</span>
                        </div>
                        <div style={{ height: 12, background: 'rgba(249,115,22,0.15)', borderRadius: 10, overflow: 'hidden' }}>
                          <div style={{ width: `${p.exercise}%`, height: '100%', background: 'linear-gradient(90deg, #f97316, #fb923c)', transition: 'width 0.4s ease' }} />
                        </div>
                      </div>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                          <span style={{ fontWeight: 600, color: 'var(--text-dark)' }}>📔 Journaling</span>
                          <span style={{ fontWeight: 700, color: '#10b981' }}>{p.journaling}%</span>
                        </div>
                        <div style={{ height: 12, background: 'rgba(16,185,129,0.15)', borderRadius: 10, overflow: 'hidden' }}>
                          <div style={{ width: `${p.journaling}%`, height: '100%', background: 'linear-gradient(90deg, #10b981, #34d399)', transition: 'width 0.4s ease' }} />
                        </div>
                      </div>
                    </>
                  ); })()}
                </div>
              </div>
            </form>
          </motion.div>
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
