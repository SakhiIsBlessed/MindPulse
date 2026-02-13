import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const MoodChart = ({ entries }) => {
  if (!entries || entries.length === 0) return <p className="text-muted">No mood data available yet. Start journaling!</p>;

  // Process data: reverse to show chronological order
  const data = [...entries].reverse().map((entry) => ({
    date: new Date(entry.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    mood: entry.mood_score,
    sentiment: entry.sentiment_analysis?.label || 'neutral'
  }));

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="date" stroke="#94a3b8" />
          <YAxis domain={[1, 5]} stroke="#94a3b8" ticks={[1, 2, 3, 4, 5]} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '0.5rem' }}
            itemStyle={{ color: '#f8fafc' }}
          />
          <Line
            type="monotone"
            dataKey="mood"
            stroke="#6366f1"
            strokeWidth={3}
            dot={{ r: 4, fill: '#6366f1' }}
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MoodChart;
