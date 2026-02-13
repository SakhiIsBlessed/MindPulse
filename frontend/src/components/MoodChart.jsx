import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Legend
} from 'recharts';
import { TrendingUp } from 'lucide-react';

const MoodChart = ({ entries }) => {
  if (!entries || entries.length === 0) return (
    <div style={{ 
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '300px',
      color: 'var(--text-muted)'
    }}>
      <TrendingUp size={40} style={{ opacity: 0.3, marginBottom: '1rem' }} />
      <p>No mood data available yet. Start journaling to see your trends!</p>
    </div>
  );

  // Process data: reverse to show chronological order (oldest first)
  const data = [...entries]
    .reverse()
    .slice(-12) // Show last 12 entries
    .map((entry) => ({
      date: new Date(entry.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      mood: entry.mood_score,
      sentiment: entry.sentiment_analysis?.label || 'neutral',
      fullDate: new Date(entry.createdAt).toLocaleDateString()
    }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload[0]) {
      const data = payload[0].payload;
      const sentimentEmojis = { positive: '😊', negative: '😔', neutral: '😐' };
      return (
        <div style={{
          backgroundColor: 'rgba(30, 41, 59, 0.9)',
          border: '1px solid rgba(99, 102, 241, 0.5)',
          borderRadius: '0.75rem',
          padding: '0.75rem',
          color: '#f8fafc'
        }}>
          <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.9rem', fontWeight: '600' }}>
            {data.fullDate}
          </p>
          <p style={{ margin: '0', fontSize: '0.85rem', color: '#6366f1' }}>
            Mood: {data.mood}/5 {sentimentEmojis[data.sentiment] || '😐'}
          </p>
          <p style={{ margin: '0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {data.sentiment}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ width: '100%', height: 320 }}>
      <style>{`
        .recharts-cartesian-axis-tick text {
          font-size: 12px !important;
        }
      `}</style>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="rgba(255,255,255,0.08)"
            verticalPoints={data.length}
          />
          <XAxis 
            dataKey="date" 
            stroke="#94a3b8"
            style={{ fontSize: '12px' }}
            tick={{ fill: '#94a3b8' }}
          />
          <YAxis 
            domain={[0, 5]} 
            stroke="#94a3b8"
            ticks={[0, 1, 2, 3, 4, 5]}
            tick={{ fill: '#94a3b8' }}
            width={35}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="mood"
            fill="url(#colorMood)"
            radius={[8, 8, 0, 0]}
            opacity={0.6}
            isAnimationActive={true}
          />
          <Line
            type="monotone"
            dataKey="mood"
            stroke="#6366f1"
            strokeWidth={3}
            dot={{ 
              r: 5, 
              fill: '#6366f1',
              stroke: '#ffffff',
              strokeWidth: 2
            }}
            activeDot={{ 
              r: 8,
              fill: '#6366f1',
              stroke: '#ffffff',
              strokeWidth: 2
            }}
            isAnimationActive={true}
            animationDuration={1000}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MoodChart;
