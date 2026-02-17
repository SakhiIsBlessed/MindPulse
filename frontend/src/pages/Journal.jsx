import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { PlusCircle, Edit3, Trash2, Search, Mic, Square, Play, Music } from 'lucide-react';

const moodEmojis = ['😔', '😐', '😌', '😊', '😄'];

const Journal = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  const [mood, setMood] = useState(3);
  const [content, setContent] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');

  const [editId, setEditId] = useState(null);

  // New UI states
  const [ambient, setAmbient] = useState(''); // 'rain' | 'forest' | 'piano' | ''
  const ambientAudioRef = useRef(null);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isDistractionFree, setIsDistractionFree] = useState(false);

  // Attachments / voice
  const [attachments, setAttachments] = useState([]); // {file, preview, type}
  const [voiceNote, setVoiceNote] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [voiceTranscription, setVoiceTranscription] = useState('');
  const recognitionRef = useRef(null);

  // Emotion detection
  const [sentimentSummary, setSentimentSummary] = useState(null);

  // Favorite Memories
  const [favoriteMemories, setFavoriteMemories] = useState([]);
  const memoriesScrollRef = useRef(null);

  // Favorite Music
  const [favoriteSongs, setFavoriteSongs] = useState([]);
  const [currentPlayingSong, setCurrentPlayingSong] = useState(null);
  const [isLoadingMusic, setIsLoadingMusic] = useState(false);
  const musicPlayerRef = useRef(null);
  const songsScrollRef = useRef(null);

  const [dateFilter, setDateFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const tagInputRef = useRef(null);

  useEffect(() => { fetchEntries(); loadMemories(); loadSongs(); }, []);

  useEffect(() => {
    // update sentiment summary live for current content
    setSentimentSummary(analyzeEmotion(content || voiceTranscription || ''));
  }, [content, voiceTranscription]);

  const loadMemories = () => {
    try {
      const saved = localStorage.getItem('favoriteMemories');
      if (saved) {
        const parsed = JSON.parse(saved);
        setFavoriteMemories(parsed);
      }
    } catch (err) {
      console.error('Failed to load memories:', err);
    }
  };

  const saveMemories = (memories) => {
    try {
      localStorage.setItem('favoriteMemories', JSON.stringify(memories));
    } catch (err) {
      console.error('Failed to save memories:', err);
    }
  };

  // Favorite Music handlers
  const loadSongs = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const { data } = await axios.get('/api/songs', config);
      setFavoriteSongs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load songs:', err);
    }
  };

  const handleAddSong = async (ev) => {
    const files = Array.from(ev.target.files || []);
    if (files.length === 0) return;

    for (const file of files) {
      if (!file.type.startsWith('audio/')) {
        alert('Please upload audio files only (mp3, wav, ogg, etc.)');
        continue;
      }

      try {
        setIsLoadingMusic(true);
        const token = localStorage.getItem('token');
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const fd = new FormData();
        fd.append('song', file);
        fd.append('title', file.name.replace(/\.[^/.]+$/, ''));

        console.log('Uploading song:', file.name, 'Size:', file.size, 'Type:', file.type);

        const { data } = await axios.post('/api/songs', fd, {
          ...config,
          headers: { ...(config.headers || {}), 'Content-Type': 'multipart/form-data' }
        });

        setFavoriteSongs(prev => [...prev, data]);
        console.log('Song uploaded successfully:', data.title);
      } catch (err) {
        console.error('Failed to upload song:', err.response?.data || err.message);
        const errorMsg = err.response?.data?.error || err.message || 'Failed to upload song';
        alert(errorMsg);
      } finally {
        setIsLoadingMusic(false);
      }
    }
    ev.target.value = '';
  };

  const removeSong = async (songId) => {
    if (!confirm('Delete this song?')) return;
    try {
      const token = localStorage.getItem('token');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      await axios.delete(`/api/songs/${songId}`, config);
      setFavoriteSongs(prev => prev.filter(s => s._id !== songId));
      if (currentPlayingSong?._id === songId) {
        setCurrentPlayingSong(null);
        if (musicPlayerRef.current) musicPlayerRef.current.pause();
      }
    } catch (err) {
      console.error('Failed to delete song:', err);
      alert('Failed to delete song');
    }
  };

  const playSong = (song) => {
    setCurrentPlayingSong(song);
  };

  const scrollSongs = (direction) => {
    if (songsScrollRef.current) {
      const scrollAmount = 300;
      songsScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const { data } = await axios.get('/api/journal', config);
      // Expect array sorted newest first
      setEntries(Array.isArray(data) ? data.reverse() : []);
    } catch (err) {
      console.error('Failed to fetch entries', err);
    } finally { setLoading(false); }
  };

  const resetForm = () => {
    setMood(3); setContent(''); setTags([]); setTagInput(''); setEditId(null);
    setAttachments([]); setVoiceNote(null); setVoiceTranscription(''); setSentimentSummary(null);
    // DO NOT reset favoriteMemories - they should be permanent
  };

  // Favorite Memories handlers
  const handleAddMemory = (ev) => {
    const files = Array.from(ev.target.files || []);
    const newMemories = files.map(f => ({ 
      id: Date.now() + Math.random(), 
      file: f, 
      preview: URL.createObjectURL(f),
      name: f.name,
      uploadDate: new Date().toLocaleDateString()
    }));
    const updated = [...favoriteMemories, ...newMemories];
    setFavoriteMemories(updated);
    saveMemories(updated);
    ev.target.value = '';
  };

  const removeMemory = (id) => {
    const updated = favoriteMemories.filter(m => m.id !== id);
    setFavoriteMemories(updated);
    saveMemories(updated);
  };

  const scrollMemories = (direction) => {
    if (memoriesScrollRef.current) {
      const scrollAmount = 300;
      memoriesScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleAddTag = (ev) => {
    ev.preventDefault();
    const t = tagInput.trim();
    if (!t) return;
    if (!tags.includes(t)) setTags(prev => [...prev, t]);
    setTagInput('');
    tagInputRef.current?.focus();
  };

  const handleRemoveTag = (t) => setTags(prev => prev.filter(x => x !== t));

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

      // Use FormData if we have attachments or voice note
      let useForm = attachments.length > 0 || voiceNote || voiceTranscription;
      if (useForm) {
        const fd = new FormData();
        fd.append('content', content);
        fd.append('mood_score', mood);
        fd.append('tags', JSON.stringify(tags));
        if (voiceNote) fd.append('voice_note', voiceNote, 'voice.webm');
        if (voiceTranscription) fd.append('transcription', voiceTranscription);
        attachments.forEach((a, idx) => fd.append('attachments', a.file, a.file.name || `file${idx}`));

        if (editId) {
          await axios.put(`/api/journal/${editId}`, fd, { ...config, headers: { ...(config.headers || {}), 'Content-Type': 'multipart/form-data' } });
        } else {
          await axios.post('/api/journal', fd, { ...config, headers: { ...(config.headers || {}), 'Content-Type': 'multipart/form-data' } });
        }
      } else {
        const payload = { content, mood_score: mood, tags, transcription: voiceTranscription };
        if (editId) {
          await axios.put(`/api/journal/${editId}`, payload, config);
        } else {
          await axios.post('/api/journal', payload, config);
        }
      }
      await fetchEntries();
      resetForm();
    } catch (err) {
      console.error('Save failed', err);
      alert('Could not save entry');
    }
  };

  const startEdit = (entry) => {
    setEditId(entry._id || entry.id);
    setMood(entry.mood_score || 3);
    setContent(entry.content || '');
    setTags(entry.tags || []);
    // attachments & transcription
    setAttachments((entry.attachments || []).map(f => ({ file: null, preview: f.url || f, type: 'remote' })));
    setVoiceTranscription(entry.transcription || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this entry?')) return;
    try {
      const token = localStorage.getItem('token');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      await axios.delete(`/api/journal/${id}`, config);
      setEntries(prev => prev.filter(e => (e._id || e.id) !== id));
    } catch (err) { console.error('Delete failed', err); alert('Failed to delete'); }
  };

  // Client-side filtering/search
  const filtered = entries.filter(e => {
    if (dateFilter) {
      const d = new Date(e.createdAt || e.created_at || e.date).toISOString().slice(0, 10);
      if (d !== dateFilter) return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!((e.content || '').toLowerCase().includes(q) || (e.tags || []).join(' ').toLowerCase().includes(q))) return false;
    }
    return true;
  });

  // Ambient sound control
  const toggleAmbient = (name) => {
    if (ambient === name) {
      // stop current
      try { ambientAudioRef.current?.pause(); } catch (e) { console.warn('pause failed', e); }
      setAmbient('');
    } else {
      setAmbient(name);
      const src = {
        rain: '/ambient/rain.mp3',
        forest: '/ambient/forest.mp3',
        piano: '/ambient/piano.mp3'
      }[name];

      // Create or reuse an Audio object for more robust playback handling
      let audio = ambientAudioRef.current;
      if (!audio || !(audio instanceof HTMLAudioElement)) {
        audio = new Audio();
        ambientAudioRef.current = audio;
      }

      audio.pause();
      audio.src = src;
      audio.loop = true;
      audio.volume = 0.65;

      // handlers to surface errors
      audio.onplay = () => console.log('Ambient playback started:', src);
      audio.onended = () => console.log('Ambient ended');
      audio.onerror = (ev) => {
        console.error('Ambient audio error for', src, ev);
        // if file missing or blocked, inform the user
        alert(`Unable to play ambience: ${src}.\nPlease ensure the file exists at public/ambient and the browser allows playback.`);
        setAmbient('');
      };

      // Try to play — browsers may reject autoplay if not a user gesture; this is a direct click so should succeed
      audio.play().catch(err => {
        console.error('Play() promise rejected:', err);
        alert('Playback blocked by browser or file missing. Check console for details.');
        setAmbient('');
      });
    }
  };

  // Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = e => audioChunksRef.current.push(e.data);
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setVoiceNote(blob);
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);

      // SpeechRecognition if available
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.lang = 'en-US';
        recognitionRef.current.interimResults = true;
        let interim = '';
        recognitionRef.current.onresult = (ev) => {
          let final = '';
          for (let i = 0; i < ev.results.length; i++) {
            if (ev.results[i].isFinal) final += ev.results[i][0].transcript + ' ';
            else interim += ev.results[i][0].transcript + ' ';
          }
          setVoiceTranscription(prev => (final || interim));
        };
        recognitionRef.current.start();
      }
    } catch (err) { console.error('record failed', err); alert('Microphone access denied'); }
  };

  const stopRecording = () => {
    try {
      mediaRecorderRef.current?.stop();
      recognitionRef.current?.stop();
    } catch (e) { }
    setIsRecording(false);
  };

  // Attachments
  const handleFileAdd = (ev) => {
    const files = Array.from(ev.target.files || []);
    const newFiles = files.map(f => ({ file: f, preview: f.type.startsWith('image/') ? URL.createObjectURL(f) : null, type: f.type }));
    setAttachments(prev => [...prev, ...newFiles]);
    ev.target.value = '';
  };
  const removeAttachment = (idx) => setAttachments(prev => { const p = [...prev]; p.splice(idx, 1); return p; });

  // Emotion detection helpers
  function analyzeEmotion(text) {
    if (!text) return null;
    const pos = ['happy', 'joy', 'delighted', 'glad', 'love', 'content', 'relieved', 'optimistic', 'grateful', 'excited'];
    const neg = ['sad', 'depressed', 'angry', 'upset', 'anxious', 'worried', 'lonely', 'hate', 'tired', 'frustrated'];
    const words = text.toLowerCase().split(/[^a-zA-Z]+/).filter(Boolean);
    let p = 0, n = 0; const found = [];
    for (const w of words) {
      if (pos.includes(w)) { p++; found.push({ word: w, type: 'positive' }); }
      if (neg.includes(w)) { n++; found.push({ word: w, type: 'negative' }); }
    }
    const score = p - n;
    const sentiment = score > 0 ? 'positive' : score < 0 ? 'negative' : 'neutral';
    return { positive: p, negative: n, score, sentiment, keywords: found };
  }

  const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const highlightEmotional = (text) => {
    const res = analyzeEmotion(text);
    if (!res) return escapeHtml(text);
    let out = escapeHtml(text);
    const uniq = Array.from(new Set(res.keywords.map(k => k.word)));
    uniq.forEach(w => {
      const re = new RegExp('\\b' + w + '\\b', 'ig');
      out = out.replace(re, m => `<mark style="background: rgba(255,205,210,0.5)">${m}</mark>`);
    });
    return out;
  };

  return (
    <div style={{ padding: '2rem', maxWidth: 1200, margin: '0 auto' }}>
      <style>{`
        .memories-scroll::-webkit-scrollbar {
          height: 8px;
        }
        .memories-scroll::-webkit-scrollbar-track {
          background: linear-gradient(90deg, rgba(108,92,231,0.05), rgba(108,92,231,0.02));
          borderRadius: 10px;
        }
        .memories-scroll::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, rgba(108,92,231,0.4), rgba(108,92,231,0.3));
          borderRadius: 10px;
          transition: all 0.3s ease;
        }
        .memories-scroll::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, rgba(108,92,231,0.6), rgba(108,92,231,0.5));
          box-shadow: 0 0 10px rgba(108,92,231,0.3);
        }
        .memories-upload:hover {
          border-color: rgba(108,92,231,0.5) !important;
          background: rgba(108,92,231,0.08) !important;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(108,92,231,0.15) !important;
        }
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        .memories-container {
          background: linear-gradient(135deg, rgba(108,92,231,0.04) 0%, rgba(168,85,247,0.03) 100%);
          border-radius: 12px;
          padding: 16px;
          border: 1px solid rgba(108,92,231,0.1);
        }
        .ambient-btn { transition: all 220ms ease; }
        .ambient-btn:hover { transform: translateY(-4px) scale(1.02); }
        .ambient-btn svg { opacity: 0.95; }
      `}</style>
      <motion.div className="glass-card" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0 }}>Journal</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: 6 }}>Write daily entries, track mood, tag and search.</p>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <motion.form className="glass-card" onSubmit={handleSave} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h2 style={{ margin: 0 }}>{editId ? 'Edit Entry' : 'New Entry'}</h2>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', width: '100%', marginBottom: 12 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {/* Streamlined ambient controls: rain / forest / piano */}
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={() => toggleAmbient('rain')}
                    title="Rain ambience"
                    aria-pressed={ambient === 'rain'}
                    className="ambient-btn"
                    style={{
                      padding: '10px 14px',
                      borderRadius: 12,
                      border: 'none',
                      background: ambient === 'rain' ? 'linear-gradient(90deg,#7dd3fc,#60a5fa)' : 'linear-gradient(180deg,#ffffff,#f7fbff)',
                      boxShadow: ambient === 'rain' ? '0 8px 30px rgba(96,165,250,0.18)' : '0 6px 18px rgba(15,23,42,0.04)',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      color: ambient === 'rain' ? '#042C54' : '#0f172a'
                    }}
                  >
                    {ambient === 'rain' ? <Square size={14} /> : <Play size={14} />}
                    <span style={{ fontWeight: 600 }}>Rain</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleAmbient('forest')}
                    title="Forest ambience"
                    aria-pressed={ambient === 'forest'}
                    className="ambient-btn"
                    style={{
                      padding: '10px 14px',
                      borderRadius: 12,
                      border: 'none',
                      background: ambient === 'forest' ? 'linear-gradient(90deg,#86efac,#4ade80)' : 'linear-gradient(180deg,#ffffff,#f7fff6)',
                      boxShadow: ambient === 'forest' ? '0 8px 30px rgba(74,222,128,0.14)' : '0 6px 18px rgba(15,23,42,0.04)',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      color: ambient === 'forest' ? '#052e16' : '#0f172a'
                    }}
                  >
                    {ambient === 'forest' ? <Square size={14} /> : <Play size={14} />}
                    <span style={{ fontWeight: 600 }}>Forest</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleAmbient('piano')}
                    title="Piano ambience"
                    aria-pressed={ambient === 'piano'}
                    className="ambient-btn"
                    style={{
                      padding: '10px 14px',
                      borderRadius: 12,
                      border: 'none',
                      background: ambient === 'piano' ? 'linear-gradient(90deg,#fbcfe8,#c4b5fd)' : 'linear-gradient(180deg,#ffffff,#fffafc)',
                      boxShadow: ambient === 'piano' ? '0 8px 30px rgba(197,139,253,0.14)' : '0 6px 18px rgba(15,23,42,0.04)',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      color: ambient === 'piano' ? '#2b0c3b' : '#0f172a'
                    }}
                  >
                    {ambient === 'piano' ? <Square size={14} /> : <Play size={14} />}
                    <span style={{ fontWeight: 600 }}>Piano</span>
                  </button>
                </div>
              </div>

              <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                  <input type="file" accept="image/*,audio/*" multiple onChange={handleFileAdd} style={{ display: 'none' }} />
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(15,23,42,0.06)', background: '#fff', color: '#000' }}>📎 Attach</span>
                </label>
                <button type="button" className="btn btn-primary" onClick={() => isRecording ? stopRecording() : startRecording()}>{isRecording ? <Square /> : <Mic />} {isRecording ? 'Stop' : 'Record'}</button>
              </div>
            </div>
          </div>

          <label style={{ display: 'block', marginBottom: 8 }}>Mood</label>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            {moodEmojis.map((emo, i) => (
              <button key={i} type="button" onClick={() => setMood(i + 1)} className="btn" style={{ padding: 12, minWidth: 56, borderRadius: 12, border: mood === i + 1 ? `2px solid var(--primary)` : '1px solid rgba(15,23,42,0.06)', background: mood === i + 1 ? 'rgba(108,92,231,0.08)' : 'transparent' }}>{emo}</button>
            ))}
          </div>

          <label style={{ display: 'block', marginBottom: 12, fontWeight: 600, fontSize: 15 }}>💝 Favorite Memories</label>
          <div style={{ marginBottom: 16 }} className="memories-container">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 20px', borderRadius: 10, border: '2px dashed rgba(108,92,231,0.3)', background: 'rgba(108,92,231,0.04)', color: '#000', cursor: 'pointer', transition: 'all 0.3s ease', fontWeight: 500 }} className="memories-upload">
                <input type="file" accept="image/*" multiple onChange={handleAddMemory} style={{ display: 'none' }} />
                <span style={{ fontSize: 20 }}>📸</span>
                <span>Add Memory Photo</span>
              </label>
              <small style={{ color: 'var(--text-muted)', fontSize: 13 }}>Upload photos of loved ones & happy moments</small>
            </div>

            {favoriteMemories.length > 0 && (
              <div style={{ position: 'relative', marginBottom: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid rgba(108,92,231,0.1)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#000' }}>Your Memories</span>
                    <span style={{ padding: '4px 10px', borderRadius: 999, background: 'rgba(108,92,231,0.15)', fontSize: 12, fontWeight: 600, color: 'rgba(108,92,231,0.9)' }}>{favoriteMemories.length}</span>
                  </div>
                  {favoriteMemories.length > 3 && (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button type="button" onClick={() => scrollMemories('left')} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(108,92,231,0.2)', background: 'rgba(108,92,231,0.04)', cursor: 'pointer', fontSize: 16, transition: 'all 0.2s', fontWeight: 600 }} onMouseEnter={(e) => { e.target.style.background = 'rgba(108,92,231,0.12)'; }} onMouseLeave={(e) => { e.target.style.background = 'rgba(108,92,231,0.04)'; }}>←</button>
                      <button type="button" onClick={() => scrollMemories('right')} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(108,92,231,0.2)', background: 'rgba(108,92,231,0.04)', cursor: 'pointer', fontSize: 16, transition: 'all 0.2s', fontWeight: 600 }} onMouseEnter={(e) => { e.target.style.background = 'rgba(108,92,231,0.12)'; }} onMouseLeave={(e) => { e.target.style.background = 'rgba(108,92,231,0.04)'; }}>→</button>
                    </div>
                  )}
                </div>

                <div ref={memoriesScrollRef} style={{ display: 'flex', gap: 14, overflowX: 'auto', overflowY: 'hidden', paddingBottom: 8, scrollBehavior: 'smooth', WebkitOverflowScrolling: 'touch' }} className="memories-scroll">
                  {favoriteMemories.map(memory => (
                    <motion.div
                      key={memory.id}
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      style={{
                        position: 'relative',
                        minWidth: 180,
                        height: 180,
                        borderRadius: 14,
                        overflow: 'hidden',
                        flexShrink: 0,
                        cursor: 'pointer',
                        boxShadow: '0 8px 20px rgba(108,92,231,0.2), inset 0 1px 0 rgba(255,255,255,0.2)',
                        border: '1px solid rgba(255,255,255,0.3)',
                        transition: 'all 0.3s ease'
                      }}
                      whileHover={{ scale: 1.08, boxShadow: '0 12px 32px rgba(108,92,231,0.3)' }}
                    >
                      <img src={memory.preview} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} alt={memory.name} />
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.5) 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 12, opacity: 0, transition: 'opacity 0.3s ease', _hover: { opacity: 1 } }} onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }} onMouseLeave={(e) => { e.currentTarget.style.opacity = '0'; }}>
                        <button
                          type="button"
                          onClick={() => removeMemory(memory.id)}
                          style={{
                            background: 'rgba(255,76,76,0.9)',
                            backdropFilter: 'blur(8px)',
                            border: 'none',
                            borderRadius: 8,
                            color: 'white',
                            cursor: 'pointer',
                            padding: '8px 10px',
                            fontSize: 20,
                            width: 36,
                            height: 36,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s',
                            fontWeight: 'bold',
                            boxShadow: '0 4px 12px rgba(255,76,76,0.3)'
                          }}
                          onMouseEnter={(e) => { e.target.style.background = 'rgba(255,50,50,1)'; e.target.style.transform = 'scale(1.1)'; }}
                          onMouseLeave={(e) => { e.target.style.background = 'rgba(255,76,76,0.9)'; e.target.style.transform = 'scale(1)'; }}
                        >
                          ✕
                        </button>
                        <div style={{ color: 'white', fontSize: 11, textAlign: 'center' }}>
                          <div style={{ fontWeight: 600, marginBottom: 4, textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>{memory.uploadDate}</div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <label style={{ display: 'block', marginBottom: 12, fontWeight: 600, fontSize: 15 }}>🎵 Favorite Songs</label>
          <div style={{ marginBottom: 16 }} className="memories-container">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 20px', borderRadius: 10, border: '2px dashed rgba(108,92,231,0.3)', background: 'rgba(108,92,231,0.04)', color: '#000', cursor: 'pointer', transition: 'all 0.3s ease', fontWeight: 500, opacity: isLoadingMusic ? 0.6 : 1, pointerEvents: isLoadingMusic ? 'none' : 'auto' }} className="memories-upload">
                <input type="file" accept="audio/*" multiple onChange={handleAddSong} disabled={isLoadingMusic} style={{ display: 'none' }} />
                <span style={{ fontSize: 20 }}>🎧</span>
                <span>{isLoadingMusic ? 'Uploading...' : 'Add Song'}</span>
              </label>
              <small style={{ color: 'var(--text-muted)', fontSize: 13 }}>Upload your favorite songs to listen while journaling</small>
            </div>

            {favoriteSongs.length > 0 && (
              <div style={{ position: 'relative', marginBottom: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid rgba(108,92,231,0.1)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#000' }}>Your Songs</span>
                    <span style={{ padding: '4px 10px', borderRadius: 999, background: 'rgba(108,92,231,0.15)', fontSize: 12, fontWeight: 600, color: 'rgba(108,92,231,0.9)' }}>{favoriteSongs.length}</span>
                  </div>
                  {favoriteSongs.length > 2 && (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button type="button" onClick={() => scrollSongs('left')} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(108,92,231,0.2)', background: 'rgba(108,92,231,0.04)', cursor: 'pointer', fontSize: 16, transition: 'all 0.2s', fontWeight: 600 }} onMouseEnter={(e) => { e.target.style.background = 'rgba(108,92,231,0.12)'; }} onMouseLeave={(e) => { e.target.style.background = 'rgba(108,92,231,0.04)'; }}>←</button>
                      <button type="button" onClick={() => scrollSongs('right')} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(108,92,231,0.2)', background: 'rgba(108,92,231,0.04)', cursor: 'pointer', fontSize: 16, transition: 'all 0.2s', fontWeight: 600 }} onMouseEnter={(e) => { e.target.style.background = 'rgba(108,92,231,0.12)'; }} onMouseLeave={(e) => { e.target.style.background = 'rgba(108,92,231,0.04)'; }}>→</button>
                    </div>
                  )}
                </div>

                <div ref={songsScrollRef} style={{ display: 'flex', gap: 14, overflowX: 'auto', overflowY: 'hidden', paddingBottom: 8, scrollBehavior: 'smooth', WebkitOverflowScrolling: 'touch' }} className="memories-scroll">
                  {favoriteSongs.map(song => (
                    <motion.div
                      key={song._id}
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      style={{
                        position: 'relative',
                        minWidth: 160,
                        height: 160,
                        borderRadius: 14,
                        overflow: 'hidden',
                        flexShrink: 0,
                        cursor: 'pointer',
                        background: 'linear-gradient(135deg, rgba(168,85,247,0.2), rgba(108,92,231,0.15))',
                        boxShadow: currentPlayingSong?._id === song._id ? '0 12px 32px rgba(108,92,231,0.4)' : '0 8px 20px rgba(108,92,231,0.2)',
                        border: currentPlayingSong?._id === song._id ? '2px solid rgba(108,92,231,0.8)' : '1px solid rgba(108,92,231,0.3)',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 16
                      }}
                      whileHover={{ scale: 1.06, boxShadow: '0 12px 32px rgba(108,92,231,0.3)' }}
                      onClick={() => playSong(song)}
                    >
                      <div style={{ fontSize: 40, marginBottom: 8 }}>♪</div>
                      <div style={{ textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(108,92,231,0.9)', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }}>
                          {song.title}
                        </div>
                        {currentPlayingSong?._id === song._id && (
                          <div style={{ fontSize: 11, color: 'rgba(108,92,231,0.7)', fontWeight: 500 }}>Now Playing</div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); removeSong(song._id); }}
                        style={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          background: 'rgba(255,76,76,0.8)',
                          backdropFilter: 'blur(8px)',
                          border: 'none',
                          borderRadius: 8,
                          color: 'white',
                          cursor: 'pointer',
                          padding: '6px 8px',
                          fontSize: 16,
                          width: 32,
                          height: 32,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s',
                          fontWeight: 'bold'
                        }}
                        onMouseEnter={(e) => { e.target.style.background = 'rgba(255,50,50,1)'; e.target.style.transform = 'scale(1.1)'; }}
                        onMouseLeave={(e) => { e.target.style.background = 'rgba(255,76,76,0.8)'; e.target.style.transform = 'scale(1)'; }}
                      >
                        ✕
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {currentPlayingSong && (
              <div style={{ marginTop: 16, padding: 12, borderRadius: 10, background: 'linear-gradient(135deg, rgba(108,92,231,0.1), rgba(168,85,247,0.08))', border: '1px solid rgba(108,92,231,0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <span style={{ fontSize: 24 }}>♪</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#000' }}>Now Playing</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{currentPlayingSong.title}</div>
                  </div>
                </div>
                <audio
                  ref={musicPlayerRef}
                  controls
                  src={currentPlayingSong.url}
                  autoPlay
                  style={{
                    width: '100%',
                    height: 32,
                    borderRadius: 8,
                    accentColor: 'rgba(108,92,231,0.9)'
                  }}
                  onEnded={() => setCurrentPlayingSong(null)}
                />
              </div>
            )}
          </div>

          <label style={{ display: 'block', marginBottom: 8 }}>Write</label>
          <textarea className="input-field" rows={isFocusMode ? 10 : 6} value={content} onChange={e => setContent(e.target.value)} placeholder="Write your thoughts..." style={{ marginBottom: 12, width: '100%' }} />

          {voiceTranscription && <div style={{ marginBottom: 8 }}><strong>Transcription:</strong> <em style={{ color: 'var(--text-muted)' }}>{voiceTranscription}</em></div>}

          {sentimentSummary && (
            <div style={{ marginBottom: 12, padding: 8, borderRadius: 8, background: 'rgba(15,23,42,0.03)' }}>
              <strong>Sentiment:</strong> {sentimentSummary.sentiment} — <small style={{ color: 'var(--text-muted)' }}>+{sentimentSummary.positive} / -{sentimentSummary.negative}</small>
            </div>
          )}

          {attachments.length > 0 && (
            <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
              {attachments.map((a, i) => (
                <div key={i} style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
                  {a.preview ? <img src={a.preview} style={{ width: 96, height: 64, objectFit: 'cover', borderRadius: 6 }} /> : <div style={{ width: 96, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Play /></div>}
                  <button type="button" className="btn btn-secondary" onClick={() => removeAttachment(i)} style={{ marginTop: 6 }}>Remove</button>
                </div>
              ))}
            </div>
          )}

          <label style={{ display: 'block', marginBottom: 8 }}>Tags</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
            {tags.map(t => (
              <div key={t} className="tag" style={{ display: 'inline-flex', gap: 8, alignItems: 'center', padding: '6px 10px', borderRadius: 999, background: 'rgba(15,23,42,0.04)' }}>
                <span style={{ fontSize: 13 }}>{t}</span>
                <button type="button" onClick={() => handleRemoveTag(t)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>×</button>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <input ref={tagInputRef} value={tagInput} onChange={e => setTagInput(e.target.value)} className="input-field" placeholder="Add tag and press Add" />
            <button className="btn btn-primary" onClick={handleAddTag} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><PlusCircle /> Add</button>
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>{editId ? 'Save Changes' : 'Save Entry'}</button>
            <button type="button" className="btn btn-secondary" onClick={() => { setContent(''); setTags([]); setMood(3); }}>Discard</button>
          </div>
        </motion.form>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} className="input-field" style={{ flex: 1 }} />
            <div style={{ position: 'relative', flex: 2 }}>
              <input placeholder="Search entries or tags" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="input-field" style={{ paddingLeft: 40 }} />
              <Search style={{ position: 'absolute', left: 10, top: 10, color: 'var(--text-muted)' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gap: 12 }}>
            {loading && <div>Loading entries…</div>}
            {!loading && filtered.length === 0 && <div style={{ color: 'var(--text-muted)' }}>No entries found.</div>}
            {filtered.map(entry => (
              <motion.div key={entry._id || entry.id} className="glass-card" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                      <small style={{ color: 'var(--text-muted)' }}>{new Date(entry.createdAt).toLocaleString()}</small>
                      <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                        {entry.tags && (entry.tags || []).map(t => (<span key={t} className="tag" style={{ padding: '4px 8px', borderRadius: 999, background: 'rgba(15,23,42,0.03)', fontSize: 12 }}>{t}</span>))}
                      </div>
                    </div>
                    <p style={{ margin: '0 0 8px 0', color: 'var(--text-dark)' }} dangerouslySetInnerHTML={{ __html: highlightEmotional(entry.content || '') }} />
                    {entry.attachments && (entry.attachments || []).length > 0 && (
                      <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                        {(entry.attachments || []).map((a, i) => (
                          <a key={i} href={a.url || a} target="_blank" rel="noreferrer"><img src={a.url || a} style={{ width: 96, height: 64, objectFit: 'cover', borderRadius: 6 }} /></a>
                        ))}
                      </div>
                    )}
                    {entry.voice_note && (
                      <div style={{ marginBottom: 8 }}>
                        <audio controls src={entry.voice_note || entry.voiceUrl} />
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <div style={{ width: 18, height: 18, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{moodEmojis[(entry.mood_score || 1) - 1]}</div>
                      <small style={{ color: 'var(--text-muted)' }}>Mood: {entry.mood_score}/5</small>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginLeft: 12 }}>
                    <button className="btn btn-secondary" title="Edit" onClick={() => startEdit(entry)}><Edit3 /></button>
                    <button className="btn" title="Delete" onClick={() => handleDelete(entry._id || entry.id)} style={{ background: 'transparent' }}><Trash2 /></button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
      <audio ref={ambientAudioRef} style={{ display: 'none' }} />
    </div>
  );
};

export default Journal;
