import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart } from 'recharts';
import { AlertCircle, TrendingUp, Heart, Zap, Brain, ArrowUp, ArrowDown } from 'lucide-react';

const Insights = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const { data } = await axios.get('/api/journal', config);
      setEntries(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch entries', err);
    } finally {
      setLoading(false);
    }
  };

  // === ANALYTICS CALCULATIONS ===

  // 1. Emotional Trend Data (last 14 days)
  const getTrendData = () => {
    const last14 = entries.slice(-14);
    return last14.map((e, i) => ({
      date: new Date(e.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      mood: e.mood_score || 3,
      entries: i + 1
    }));
  };

  // 2. Sentiment Breakdown
  const getSentimentBreakdown = () => {
    let pos = 0, neu = 0, neg = 0;
    entries.forEach(e => {
      const s = e.sentiment_analysis?.label || 'neutral';
      if (s === 'positive') pos++;
      else if (s === 'negative') neg++;
      else neu++;
    });
    const total = entries.length || 1;
    return [
      { name: 'Positive', value: Math.round((pos / total) * 100), count: pos },
      { name: 'Neutral', value: Math.round((neu / total) * 100), count: neu },
      { name: 'Negative', value: Math.round((neg / total) * 100), count: neg }
    ];
  };

  // 3. Mood Distribution
  const getMoodDistribution = () => {
    const dist = [0, 0, 0, 0, 0];
    entries.forEach(e => {
      const score = (e.mood_score || 1) - 1;
      dist[Math.max(0, Math.min(4, score))]++;
    });
    return [
      { name: '😔 Very Bad', value: dist[0] },
      { name: '😐 Bad', value: dist[1] },
      { name: '😌 Okay', value: dist[2] },
      { name: '😊 Good', value: dist[3] },
      { name: '😄 Great', value: dist[4] }
    ].filter(x => x.value > 0);
  };

  // 4. Risk Level & Burnout Score
  const getRiskMetrics = () => {
    if (entries.length === 0) return { riskScore: 0, burnoutScore: 0, riskLevel: 'Low' };

    const recentMood = entries.slice(-7).reduce((s, e) => s + (e.mood_score || 3), 0) / Math.min(7, entries.length);
    const negativeCount = entries.filter(e => (e.sentiment_analysis?.label || 'neutral') === 'negative').length;
    const negativeRatio = (negativeCount / entries.length) * 100;

    // Risk: downward trend + negative sentiment
    const trendDeclining = recentMood < 3;
    const highNegative = negativeRatio > 30;
    let riskScore = 0;
    if (trendDeclining) riskScore += 40;
    if (highNegative) riskScore += 40;
    riskScore += Math.max(0, Math.min(20, (4 - recentMood) * 10));

    // Burnout: low mood + stress tags + frequency
    let burnoutScore = 0;
    const stressEntries = entries.filter(e => (e.tags || []).some(t => ['stress', 'burnout', 'overwhelmed', 'exhausted'].includes(t.toLowerCase())));
    if (stressEntries.length > entries.length * 0.3) burnoutScore += 40;
    if (recentMood < 2.5) burnoutScore += 30;
    if (entries.length > 20) burnoutScore += Math.min(20, (entries.length - 20) / 2);

    let riskLevel = 'Low';
    if (riskScore > 50) riskLevel = 'High';
    else if (riskScore > 30) riskLevel = 'Moderate';

    return { riskScore: Math.round(riskScore), burnoutScore: Math.round(burnoutScore), riskLevel };
  };

  // 5. Keyword Analysis
  const getTopKeywords = () => {
    const wordFreq = {};
    const stopwords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'be', 'is', 'am', 'are', 'was', 'were', 'have', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'i', 'you', 'he', 'she', 'it', 'we', 'they']);

    entries.forEach(e => {
      if (!e.content) return;
      const words = e.content.toLowerCase().match(/\b\w+\b/g) || [];
      words.forEach(w => {
        if (w.length > 3 && !stopwords.has(w)) {
          wordFreq[w] = (wordFreq[w] || 0) + 1;
        }
      });
    });

    return Object.entries(wordFreq)
      .map(([word, freq]) => ({ word, freq }))
      .sort((a, b) => b.freq - a.freq)
      .slice(0, 10);
  };

  // 6. Predictive Trend (simple: project current trend 7 days forward)
  const getPredictiveTrend = () => {
    if (entries.length < 3) return getTrendData();

    const recent = entries.slice(-7);
    const avgMood = recent.reduce((s, e) => s + (e.mood_score || 3), 0) / recent.length;
    const trend = recent.length > 1 ? (recent[recent.length - 1].mood_score - recent[0].mood_score) / recent.length : 0;

    const today = new Date();
    const predictions = [];
    for (let i = 1; i <= 7; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      const predictedMood = Math.max(1, Math.min(5, avgMood + trend * i + (Math.random() - 0.5) * 0.5));
      predictions.push({
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        mood: Math.round(predictedMood * 2) / 2,
        isPrediction: true
      });
    }
    return getTrendData().concat(predictions);
  };

  const trendData = getTrendData();
  const sentimentData = getSentimentBreakdown();
  const moodDist = getMoodDistribution();
  const { riskScore, burnoutScore, riskLevel } = getRiskMetrics();
  const keywords = getTopKeywords();
  const predictions = getPredictiveTrend();

  const COLORS = ['#6c5ce7', '#94a3b8', '#ff6b6b'];

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: 'var(--text-dark)' }}>
      <div style={{ textAlign: 'center' }}>
        <Brain size={48} style={{ opacity: 0.4, marginBottom: '1rem' }} />
        <p>Analyzing your emotions...</p>
      </div>
    </div>
  );

  return (
    <div style={{ padding: '2rem', maxWidth: 1400, margin: '0 auto' }}>
      {/* Header */}
      <motion.div className="glass-card" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
          <Brain size={32} style={{ color: 'var(--primary)' }} />
          <h1 style={{ margin: 0 }}>AI Insights & Analytics</h1>
        </div>
        <p style={{ color: 'var(--text-muted)', margin: 0 }}>Emotional trends, sentiment analysis, and burnout detection powered by AI</p>
      </motion.div>

      {/* Risk & Burnout Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Risk Level */}
        <motion.div className="glass-card" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <AlertCircle size={20} style={{ color: riskLevel === 'High' ? '#ff6b6b' : riskLevel === 'Moderate' ? '#fbbf24' : '#34d399' }} />
            <h3 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-muted)' }}>Risk Level</h3>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: riskLevel === 'High' ? '#ff6b6b' : riskLevel === 'Moderate' ? '#fbbf24' : '#34d399', marginBottom: '0.5rem' }}>
            {riskLevel}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {riskLevel === 'High' && 'Consider reaching out for support'}
            {riskLevel === 'Moderate' && 'Monitor your emotional state'}
            {riskLevel === 'Low' && 'You are doing well!'}
          </div>
          <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'rgba(15,23,42,0.03)', borderRadius: '0.5rem', fontSize: '0.8rem' }}>
            Risk Score: <strong>{riskScore}/100</strong>
          </div>
        </motion.div>

        {/* Burnout Score */}
        <motion.div className="glass-card" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Zap size={20} style={{ color: 'var(--primary)' }} />
            <h3 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-muted)' }}>Burnout Detection</h3>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: burnoutScore > 60 ? '#ff6b6b' : burnoutScore > 40 ? '#fbbf24' : '#34d399', marginBottom: '0.5rem' }}>
            {burnoutScore}%
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {burnoutScore > 60 && 'High burnout risk—take a break'}
            {burnoutScore <= 60 && burnoutScore > 40 && 'Moderate stress detected'}
            {burnoutScore <= 40 && 'Healthy stress levels'}
          </div>
          <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'rgba(15,23,42,0.03)', borderRadius: '0.5rem' }}>
            <div style={{ fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between' }}>
              <span>Energy Level:</span>
              <span style={{ fontWeight: 600 }}>{Math.round(100 - burnoutScore)}%</span>
            </div>
          </div>
        </motion.div>

        {/* Average Mood */}
        <motion.div className="glass-card" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Heart size={20} style={{ color: 'var(--secondary)' }} />
            <h3 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-muted)' }}>Average Mood</h3>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--secondary)', marginBottom: '0.5rem' }}>
            {entries.length > 0 ? (Math.round(entries.reduce((s, e) => s + (e.mood_score || 3), 0) / entries.length * 10) / 10).toFixed(1) : '—'}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>From {entries.length} entries</div>
        </motion.div>
      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Emotional Trend & Prediction */}
        <motion.div className="glass-card" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h2 style={{ marginTop: 0 }}>Emotional Trend (with 7-day forecast)</h2>
          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart data={predictions}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,23,42,0.03)" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 5]} />
              <Tooltip contentStyle={{ background: '#fff', border: '1px solid rgba(15,23,42,0.06)' }} />
              <Line type="monotone" dataKey="mood" stroke="#6c5ce7" strokeWidth={2} dot={{ r: 4 }} />
              <Bar dataKey="mood" fill="rgba(108,92,231,0.1)" />
            </ComposedChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Sentiment Breakdown */}
        <motion.div className="glass-card" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <h2 style={{ marginTop: 0 }}>Sentiment Breakdown</h2>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={sentimentData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {sentimentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value}%`} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ marginTop: '1rem', display: 'grid', gap: '0.5rem', fontSize: '0.9rem' }}>
            {sentimentData.map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', background: 'rgba(15,23,42,0.03)', borderRadius: '0.5rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: COLORS[i] }} />
                  {item.name}
                </span>
                <strong>{item.value}%</strong>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Mood Distribution */}
        <motion.div className="glass-card" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h2 style={{ marginTop: 0 }}>Mood Distribution</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={moodDist}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,23,42,0.03)" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#6c5ce7" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Top Keywords */}
      <motion.div className="glass-card" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <Brain size={24} style={{ color: 'var(--primary)' }} />
          <h2 style={{ margin: 0 }}>Top Emotional Keywords</h2>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>Words most frequently used in your journal entries</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
          {keywords.length > 0 ? (
            keywords.map((kw, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                style={{
                  padding: '0.6rem 1rem',
                  borderRadius: '999px',
                  background: `rgba(108, 92, 231, ${0.08 + i * 0.02})`,
                  color: 'var(--primary)',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  border: '1px solid rgba(108,92,231,0.12)',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(108, 92, 231, 0.2)';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = `rgba(108, 92, 231, ${0.08 + i * 0.02})`;
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                {kw.word} <span style={{ opacity: 0.6, fontSize: '0.8rem' }}>({kw.freq})</span>
              </motion.div>
            ))
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>Not enough data to analyze keywords</p>
          )}
        </div>
      </motion.div>

      {/* Recommendations */}
      {entries.length > 0 && (
        <motion.div className="glass-card" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} style={{ marginTop: '1.5rem', background: 'linear-gradient(135deg, rgba(108,92,231,0.08), rgba(6,182,212,0.06))' }}>
          <h2 style={{ marginTop: 0 }}>Personalized Recommendations</h2>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {riskLevel === 'High' && (
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <AlertCircle size={20} style={{ flexShrink: 0, color: '#ff6b6b', marginTop: '2px' }} />
                <div>
                  <strong>High risk detected:</strong> Consider reaching out to a mental health professional or trusted person. Your journal patterns suggest increased emotional strain.
                </div>
              </div>
            )}
            {burnoutScore > 60 && (
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <Zap size={20} style={{ flexShrink: 0, color: '#fbbf24', marginTop: '2px' }} />
                <div>
                  <strong>Take a break:</strong> High burnout detected. Prioritize rest, self-care, and activities that bring you joy.
                </div>
              </div>
            )}
            {keywords.some(kw => ['stressed', 'anxious', 'overwhelm', 'tired'].includes(kw.word)) && (
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <Heart size={20} style={{ flexShrink: 0, color: 'var(--primary)', marginTop: '2px' }} />
                <div>
                  <strong>Self-care reminder:</strong> You frequently mention stress. Try meditation, journaling, or speaking with someone you trust.
                </div>
              </div>
            )}
            {sentimentData[0]?.value > 60 && (
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <TrendingUp size={20} style={{ flexShrink: 0, color: '#34d399', marginTop: '2px' }} />
                <div>
                  <strong>Great progress:</strong> Your sentiment is predominantly positive. Keep maintaining those healthy habits!
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Monthly Mood Heatmap */}
      <MoodHeatmap entries={entries} />
    </div>
  );
};

// ── Monthly Mood Heatmap ──────────────────────────────────────────────────────
function MoodHeatmap({ entries }) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed

  // Build a map: "YYYY-MM-DD" -> average mood_score
  const dayMap = {};
  entries.forEach(e => {
    const d = new Date(e.createdAt);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const key = d.toISOString().slice(0, 10);
      if (!dayMap[key]) dayMap[key] = [];
      dayMap[key].push(e.mood_score || 3);
    }
  });

  const avgMap = {};
  Object.entries(dayMap).forEach(([k, arr]) => {
    avgMap[k] = arr.reduce((a, b) => a + b, 0) / arr.length;
  });

  // Days in month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstWeekday = new Date(year, month, 1).getDay(); // 0=Sun

  const moodColor = (avg) => {
    if (!avg) return 'rgba(15,23,42,0.07)';
    if (avg >= 4.5) return '#10b981'; // great - green
    if (avg >= 3.5) return '#34d399'; // good - light green
    if (avg >= 2.5) return '#fbbf24'; // neutral - yellow
    if (avg >= 1.5) return '#f97316'; // low - orange
    return '#ef4444';                  // very low - red
  };

  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = now.getDate();
  const monthName = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <motion.div
      className="glass-card"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45 }}
      style={{ marginTop: '1.5rem' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
        <span style={{ fontSize: '1.5rem' }}>📅</span>
        <div>
          <h2 style={{ margin: 0 }}>Monthly Mood Heatmap</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>{monthName} — color by average mood</p>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.25rem', alignItems: 'center' }}>
        {[
          { color: '#ef4444', label: 'Very Low (1)' },
          { color: '#f97316', label: 'Low (2)' },
          { color: '#fbbf24', label: 'Neutral (3)' },
          { color: '#34d399', label: 'Good (4)' },
          { color: '#10b981', label: 'Great (5)' },
          { color: 'rgba(15,23,42,0.07)', label: 'No entry' },
        ].map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            <div style={{ width: 14, height: 14, borderRadius: 3, background: item.color, border: '1px solid rgba(15,23,42,0.08)' }} />
            {item.label}
          </div>
        ))}
      </div>

      {/* Weekday headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '4px' }}>
        {DAYS.map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', padding: '0.2rem 0' }}>
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
        {/* Empty cells for first week offset */}
        {Array.from({ length: firstWeekday }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {/* Day cells */}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
          const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const avg = avgMap[key];
          const isToday = day === today;
          return (
            <motion.div
              key={day}
              whileHover={{ scale: 1.12, zIndex: 5 }}
              title={avg ? `Day ${day}: avg mood ${avg.toFixed(1)}` : `Day ${day}: no entry`}
              style={{
                aspectRatio: '1',
                borderRadius: 6,
                background: moodColor(avg),
                border: isToday ? '2px solid #6c5ce7' : '1px solid rgba(15,23,42,0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.7rem',
                fontWeight: isToday ? 800 : 500,
                color: avg ? 'white' : 'var(--text-muted)',
                cursor: 'default',
                boxShadow: isToday ? '0 0 0 2px rgba(108,92,231,0.3)' : 'none',
                position: 'relative',
                textShadow: avg ? '0 1px 2px rgba(0,0,0,0.25)' : 'none',
              }}
            >
              {day}
            </motion.div>
          );
        })}
      </div>

      {Object.keys(avgMap).length === 0 && (
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '1rem', fontSize: '0.9rem' }}>
          No entries this month yet. Start journaling to see the heatmap! 📝
        </p>
      )}
    </motion.div>
  );
}

export default Insights;

