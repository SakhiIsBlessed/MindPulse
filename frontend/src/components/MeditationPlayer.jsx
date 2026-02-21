import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, Volume2, Music } from 'lucide-react';

// Free-to-use ambient tracks from public sources
const TRACKS = [
  {
    id: 1,
    title: 'Calm Forest Rain',
    category: 'Nature',
    emoji: '🌧️',
    duration: '∞',
    src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    color: '#10b981',
  },
  {
    id: 2,
    title: 'Deep Focus',
    category: 'Meditation',
    emoji: '🧘',
    duration: '∞',
    src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    color: '#6c5ce7',
  },
  {
    id: 3,
    title: 'Ocean Waves',
    category: 'Nature',
    emoji: '🌊',
    duration: '∞',
    src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    color: '#0ea5e9',
  },
  {
    id: 4,
    title: 'Sleep Stories',
    category: 'Sleep',
    emoji: '🌙',
    duration: '∞',
    src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    color: '#7c3aed',
  },
  {
    id: 5,
    title: 'Morning Clarity',
    category: 'Mindfulness',
    emoji: '☀️',
    duration: '∞',
    src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    color: '#f59e0b',
  },
  {
    id: 6,
    title: 'Anxiety Relief',
    category: 'Wellness',
    emoji: '💆',
    duration: '∞',
    src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
    color: '#ec4899',
  },
];

const categories = ['All', ...new Set(TRACKS.map(t => t.category))];

export default function MeditationPlayer() {
  const [currentTrack, setCurrentTrack] = useState(TRACKS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [filter, setFilter] = useState('All');
  const audioRef = useRef(null);

  const filteredTracks = filter === 'All' ? TRACKS : TRACKS.filter(t => t.category === filter);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    // Reset + load new track whenever currentTrack changes
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.load();
      if (isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      }
    }
    setProgress(0);
    setCurrentTime(0);
  }, [currentTrack]); // eslint-disable-line

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(err => {
        console.warn('Playback error:', err);
        setIsPlaying(false);
      });
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const cur = audioRef.current.currentTime;
    const dur = audioRef.current.duration || 0;
    setCurrentTime(cur);
    setDuration(dur);
    setProgress(dur ? (cur / dur) * 100 : 0);
  };

  const handleSeek = (e) => {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    audioRef.current.currentTime = pct * duration;
  };

  const nextTrack = () => {
    const idx = TRACKS.indexOf(currentTrack);
    setCurrentTrack(TRACKS[(idx + 1) % TRACKS.length]);
  };

  const prevTrack = () => {
    const idx = TRACKS.indexOf(currentTrack);
    setCurrentTrack(TRACKS[(idx - 1 + TRACKS.length) % TRACKS.length]);
  };

  const fmt = (s) => {
    if (!s || isNaN(s)) return '0:00';
    return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="glass-card"
      style={{ padding: '1.5rem', borderRadius: 16 }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <div style={{
          width: 44, height: 44,
          background: 'linear-gradient(135deg, #6c5ce7, #8b5cf6)',
          borderRadius: 12,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Music size={22} color="white" />
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-dark)' }}>Meditation Player</h3>
          <small style={{ color: 'var(--text-muted)' }}>Ambient sounds for calm & focus</small>
        </div>
      </div>

      {/* Category filter */}
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            style={{
              padding: '0.3rem 0.75rem',
              borderRadius: 999,
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 600,
              background: filter === cat ? 'linear-gradient(135deg, #6c5ce7, #8b5cf6)' : 'rgba(108,92,231,0.09)',
              color: filter === cat ? 'white' : 'var(--primary)',
              transition: 'all 0.18s',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Now Playing */}
      <div style={{
        background: `linear-gradient(135deg, ${currentTrack.color}15, ${currentTrack.color}08)`,
        border: `1px solid ${currentTrack.color}30`,
        borderRadius: 12,
        padding: '1rem',
        marginBottom: '1.1rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '2rem' }}>{currentTrack.emoji}</span>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--text-dark)', fontSize: '1rem' }}>{currentTrack.title}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{currentTrack.category}</div>
          </div>
          {isPlaying && (
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '3px', alignItems: 'flex-end', height: 18 }}>
              {[1,2,3,4].map(i => (
                <motion.div
                  key={i}
                  animate={{ height: ['4px', '14px', '6px', '12px', '4px'] }}
                  transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                  style={{ width: 3, background: currentTrack.color, borderRadius: 2 }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div
          onClick={handleSeek}
          style={{
            height: 6, background: 'rgba(15,23,42,0.1)', borderRadius: 3,
            cursor: 'pointer', marginBottom: '0.4rem', position: 'relative',
          }}
        >
          <motion.div
            style={{
              height: '100%', borderRadius: 3,
              background: `linear-gradient(90deg, ${currentTrack.color}, ${currentTrack.color}aa)`,
              width: `${progress}%`,
            }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <span>{fmt(currentTime)}</span>
          <span>{fmt(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <button onClick={prevTrack} style={btnStyle}>
          <SkipBack size={20} />
        </button>
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={togglePlay}
          style={{
            ...btnStyle,
            width: 52, height: 52,
            background: 'linear-gradient(135deg, #6c5ce7, #8b5cf6)',
            color: 'white',
            borderRadius: '50%',
            boxShadow: '0 4px 16px rgba(108,92,231,0.35)',
          }}
        >
          {isPlaying ? <Pause size={22} /> : <Play size={22} />}
        </motion.button>
        <button onClick={nextTrack} style={btnStyle}>
          <SkipForward size={20} />
        </button>

        {/* Volume */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginLeft: '0.5rem' }}>
          <Volume2 size={16} style={{ color: 'var(--text-muted)' }} />
          <input
            type="range" min={0} max={1} step={0.05} value={volume}
            onChange={e => setVolume(Number(e.target.value))}
            style={{ width: 70, accentColor: '#6c5ce7' }}
          />
        </div>
      </div>

      {/* Track list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: 220, overflowY: 'auto' }}>
        {filteredTracks.map(track => (
          <motion.div
            key={track.id}
            whileHover={{ x: 3 }}
            onClick={() => { setCurrentTrack(track); setIsPlaying(true); }}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.65rem 0.85rem',
              borderRadius: 10,
              cursor: 'pointer',
              background: currentTrack.id === track.id
                ? `linear-gradient(135deg, ${track.color}20, ${track.color}10)`
                : 'rgba(15,23,42,0.03)',
              border: currentTrack.id === track.id ? `1px solid ${track.color}35` : '1px solid transparent',
              transition: 'background 0.18s',
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>{track.emoji}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-dark)' }}>{track.title}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{track.category}</div>
            </div>
            {currentTrack.id === track.id && isPlaying && (
              <span style={{ fontSize: '0.75rem', color: track.color, fontWeight: 700 }}>▶ Now playing</span>
            )}
          </motion.div>
        ))}
      </div>

      <audio
        ref={audioRef}
        src={currentTrack.src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleTimeUpdate}
        onEnded={nextTrack}
      />
    </motion.div>
  );
}

const btnStyle = {
  background: 'rgba(108,92,231,0.1)',
  border: 'none',
  borderRadius: '50%',
  width: 40, height: 40,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  color: 'var(--primary)',
  cursor: 'pointer',
  transition: 'background 0.18s',
};
