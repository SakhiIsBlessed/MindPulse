import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { PlusCircle, Edit3, Trash2, Search, Mic, Square, Play, Music, Share2, Download, TrendingUp, Archive, Copy, Check, FileText } from 'lucide-react';
import { generateJournalPDF } from '../utils/pdfExport';

const moodEmojis = ['😔', '😐', '😌', '😊', '😄'];
const entryStickers = ['✨', '💫', '🌟', '⭐', '🎨', '🎭', '🎪', '🎯', '💝', '🌸', '🌺', '🌻', '🌷', '🦋', '🌈'];

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

  // New feature states
  const [selectedSticker, setSelectedSticker] = useState('✨');
  const [entryColor, setEntryColor] = useState('#6c5ce7');
  const [showMoodStats, setShowMoodStats] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [archivedEntries, setArchivedEntries] = useState([]);
  const [shareModalEntry, setShareModalEntry] = useState(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [aiInsights, setAiInsights] = useState(null);
  const [showInsightsModal, setShowInsightsModal] = useState(false);
  const [dailyQuestion, setDailyQuestion] = useState(null);
  const [userData, setUserData] = useState({ username: '', email: '' });
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  // Quick entry templates
  const entryTemplates = [
    { name: 'Gratitude', prompt: 'Three things I\'m grateful for today...', emoji: '🙏' },
    { name: 'Challenge', prompt: 'Today\'s challenge and how I overcame it...', emoji: '💪' },
    { name: 'Goals', prompt: 'My goals for today and progress...', emoji: '🎯' },
    { name: 'Reflection', prompt: 'What I learned today...', emoji: '🧠' },
    { name: 'Wellness', prompt: 'How I\'m taking care of myself...', emoji: '🌿' },
  ];

  // Daily Reflection Questions
  const reflectionQuestions = [
    { emoji: '😊', text: 'What made you smile today?' },
    { emoji: '🤔', text: 'What challenged you today?' },
    { emoji: '🌟', text: 'What are you proud of?' },
    { emoji: '💭', text: 'What are you grateful for?' },
    { emoji: '🔮', text: 'What are you hoping for?' },
    { emoji: '🌱', text: 'What did you learn today?' },
    { emoji: '❤️', text: 'Who made a difference in your day?' },
    { emoji: '✨', text: 'What was the highlight of your day?' },
    { emoji: '🎯', text: 'What would make tomorrow better?' },
    { emoji: '🌈', text: 'How are you taking care of yourself?' },
  ];

  const tagInputRef = useRef(null);

  useEffect(() => { 
    fetchEntries(); 
    loadMemories(); 
    loadSongs(); 
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const { data } = await axios.get('/api/user/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserData({ username: data.username, email: data.email });
    } catch (err) {
      console.error('Failed to fetch user data for export:', err);
      // Fallback to localStorage if API fails
      setUserData({ 
        username: localStorage.getItem('username') || 'Student', 
        email: '' 
      });
    }
  };

  useEffect(() => {
    // Set daily question based on current date
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    const questionIndex = dayOfYear % reflectionQuestions.length;
    setDailyQuestion(reflectionQuestions[questionIndex]);
  }, []);

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
    setSelectedSticker('✨'); setEntryColor('#667eea');
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
        fd.append('selectedSticker', selectedSticker);
        fd.append('entryColor', entryColor);
        if (voiceNote) fd.append('voice_note', voiceNote, 'voice.webm');
        if (voiceTranscription) fd.append('transcription', voiceTranscription);
        attachments.forEach((a, idx) => fd.append('attachments', a.file, a.file.name || `file${idx}`));

        if (editId) {
          await axios.put(`/api/journal/${editId}`, fd, { ...config, headers: { ...(config.headers || {}), 'Content-Type': 'multipart/form-data' } });
        } else {
          await axios.post('/api/journal', fd, { ...config, headers: { ...(config.headers || {}), 'Content-Type': 'multipart/form-data' } });
        }
      } else {
        const payload = { content, mood_score: mood, tags, transcription: voiceTranscription, selectedSticker, entryColor };
        if (editId) {
          await axios.put(`/api/journal/${editId}`, payload, config);
        } else {
          await axios.post('/api/journal', payload, config);
        }
      }
      await fetchEntries();
      
      // Generate AI insights for new entries only
      if (!editId) {
        const newEntry = { content, mood_score: mood, tags, transcription: voiceTranscription };
        generateInsights(newEntry);
      }
      
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
    setSelectedSticker(entry.selectedSticker || '✨');
    setEntryColor(entry.entryColor || '#667eea');
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

  // New feature functions
  const getMoodStats = () => {
    const moodCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    entries.forEach(e => { moodCounts[e.mood_score || 3] += 1; });
    const total = entries.length;
    const average = total > 0 ? (Object.keys(moodCounts).reduce((sum, mood) => sum + parseInt(mood) * moodCounts[mood], 0) / total).toFixed(2) : 0;
    return { moodCounts, average, total };
  };

  const exportToJSON = () => {
    const dataStr = JSON.stringify(entries, null, 2);
    const element = document.createElement('a');
    element.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(dataStr);
    element.download = `journal-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Mood', 'Content', 'Tags'];
    const rows = entries.map(e => [
      new Date(e.createdAt).toLocaleString(),
      e.mood_score,
      '"' + (e.content || '').replace(/"/g, '""') + '"',
      (e.tags || []).join('; ')
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const element = document.createElement('a');
    element.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    element.download = `journal-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const exportToPDF = async () => {
    try {
      setIsExportingPDF(true);
      generateJournalPDF(entries, userData.username, userData.email);
    } catch (err) {
      console.error('PDF Export failed', err);
      alert('Failed to generate PDF report.');
    } finally {
      setIsExportingPDF(false);
    }
  };

  const copyToClipboard = (entryId, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(entryId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const printEntry = (entry) => {
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(`
      <html><head><title>Journal Entry</title><style>
        body { font-family: Arial; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #333; }
        .entry { background: white; padding: 20px; border-radius: 8px; }
        h2 { color: #667eea; }
        .meta { color: #666; font-size: 12px; margin-bottom: 10px; }
      </style></head><body>
        <div class="entry">
          <h2>Journal Entry</h2>
          <div class="meta">${new Date(entry.createdAt).toLocaleString()} • Mood: ${moodEmojis[entry.mood_score - 1]}</div>
          <p>${(entry.content || '').replace(/\n/g, '<br>')}</p>
        </div>
      </body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const loadTemplateContent = (template) => {
    setContent(template.prompt);
    setSelectedTemplate(template);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setShowTemplates(false);
  };

  // Generate AI Reflection Insights
  const generateInsights = async (newEntry) => {
    const moodTrend = getMoodStats();
    const moodEmojisMap = { 1: 'stressed', 2: 'anxious', 3: 'neutral', 4: 'happy', 5: 'elated' };
    const currentMoodLabel = moodEmojisMap[newEntry.mood_score || 3];
    
    // Analyze content for keywords
    const text = (newEntry.content || '').toLowerCase();
    const keywords = {
      positive: ['happy', 'joy', 'grateful', 'blessed', 'love', 'amazing', 'wonderful', 'proud', 'accomplished', 'excited', 'delighted', 'hopeful'],
      challenges: ['stressed', 'anxious', 'worried', 'difficult', 'hard', 'struggling', 'overwhelmed', 'tired', 'sad', 'confused'],
      selfcare: ['exercise', 'yoga', 'meditation', 'sleep', 'relax', 'walk', 'read', 'creative', 'hobby', 'nature']
    };

    const findKeywords = (cat) => keywords[cat].filter(k => text.includes(k));
    const posKeywords = findKeywords('positive');
    const chalKeywords = findKeywords('challenges');
    const careKeywords = findKeywords('selfcare');

    const insights = {
      moodTrend: null,
      suggestions: [],
      encouragement: null,
      keywords: { positive: posKeywords, challenges: chalKeywords, selfcare: careKeywords }
    };

    // Generate mood trend insight
    const moodCounts = moodTrend.moodCounts;
    const stressCount = (moodCounts[1] || 0) + (moodCounts[2] || 0);
    if (stressCount > 0) {
      insights.moodTrend = `✅ You've felt stressed or anxious ${stressCount} time${stressCount > 1 ? 's' : ''} recently. That's valid—remember you're stronger than you think.`;
    } else {
      insights.moodTrend = `✨ Your mood has been mostly positive! You're doing great.`;
    }

    // Generate suggestions
    if (chalKeywords.length > 0 && !careKeywords.length) {
      insights.suggestions.push('💡 Try a 5-minute breathing exercise or short walk to ease tension.');
    }
    if (careKeywords.length > 0) {
      insights.suggestions.push('🌟 Great job prioritizing self-care! Keep it up.');
    } else if (newEntry.mood_score <= 2) {
      insights.suggestions.push('💡 Have you tried a calming activity? Even 10 minutes of something you enjoy can help.');
    }
    if (posKeywords.length > 0) {
      insights.suggestions.push(`🌱 You mentioned "${posKeywords[0]}" — that positive energy is powerful. Hold onto it!`);
    }

    // Generate encouragement
    const encouragements = [
      '🌟 Every entry is a step toward understanding yourself better.',
      '💝 Your feelings matter. Thank you for taking time to reflect.',
      '🎯 You\'re doing the hardest part—being honest with yourself.',
      '🌈 Growth happens one day at a time. You\'re on the right path.',
      '✨ Journaling is a powerful tool for healing and growth.'
    ];
    insights.encouragement = encouragements[Math.floor(Math.random() * encouragements.length)];

    setAiInsights(insights);
    setShowInsightsModal(true);
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
    <div style={{ 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      padding: '2rem',
      color: '#333'
    }}>
      <style>{`
        .journal-container { max-width: 1400px; margin: 0 auto; }
        .journal-header { 
          background: linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(245,247,250,0.95) 100%);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 32px;
          margin-bottom: 32px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.15);
          border: 2px solid rgba(255,255,255,0.5);
        }
        .journal-header h1 { 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-size: 2.5em;
          margin: 0; 
          font-weight: 700;
        }
        .journal-header p { color: #888; margin: 10px 0 0 0; font-size: 1.05em; }
        
        .form-card {
          background: linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(245,247,250,0.98) 100%);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 28px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.12);
          border: 2px solid rgba(255,255,255,0.5);
          margin-bottom: 24px;
        }
        
        .entries-card {
          background: linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(245,247,250,0.98) 100%);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 28px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.12);
          border: 2px solid rgba(255,255,255,0.5);
        }
        
        .memories-scroll::-webkit-scrollbar {
          height: 8px;
        }
        .memories-scroll::-webkit-scrollbar-track {
          background: linear-gradient(90deg, rgba(102,126,234,0.08), rgba(118,75,162,0.05));
          borderRadius: 10px;
        }
        .memories-scroll::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, rgba(102,126,234,0.6), rgba(118,75,162,0.5));
          borderRadius: 10px;
        }
        .memories-scroll::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, rgba(102,126,234,0.8), rgba(118,75,162,0.7));
        }
        
        .memories-upload:hover {
          border-color: #667eea !important;
          background: linear-gradient(135deg, rgba(102,126,234,0.1), rgba(118,75,162,0.08)) !important;
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(102,126,234,0.25) !important;
        }
        
        .memories-container {
          background: linear-gradient(135deg, rgba(102,126,234,0.05) 0%, rgba(118,75,162,0.04) 100%);
          border-radius: 16px;
          padding: 20px;
          border: 2px solid rgba(102,126,234,0.15);
        }
        
        .mood-badge { 
          background: linear-gradient(135deg, rgba(102,126,234,0.15), rgba(118,75,162,0.1));
          border: 2px solid rgba(102,126,234,0.3);
          border-radius: 12px;
          padding: 8px 14px;
          font-weight: 600;
          color: #667eea;
        }
        
        .template-chip {
          background: linear-gradient(135deg, rgba(102,126,234,0.1), rgba(118,75,162,0.08));
          border: 2px solid rgba(102,126,234,0.2);
          border-radius: 12px;
          padding: 12px 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-weight: 500;
        }
        .template-chip:hover {
          background: linear-gradient(135deg, rgba(102,126,234,0.2), rgba(118,75,162,0.15));
          border-color: rgba(102,126,234,0.4);
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(102,126,234,0.2);
        }
        
        .stats-box {
          background: linear-gradient(135deg, rgba(102,126,234,0.1), rgba(118,75,162,0.08));
          border: 2px solid rgba(102,126,234,0.2);
          border-radius: 12px;
          padding: 16px;
          text-align: center;
        }
        
        .action-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 10px;
          padding: 10px 16px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .action-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(102,126,234,0.4);
        }
        
        .entry-card {
          background: linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(245,247,250,0.9) 100%);
          border-left: 5px solid var(--entry-color, #667eea);
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 16px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(0,0,0,0.08);
        }
        .entry-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 30px rgba(102,126,234,0.2);
        }
        
        .sticker-btn {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          border: 2px solid transparent;
          background: rgba(102,126,234,0.05);
          cursor: pointer;
          font-size: 20px;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .sticker-btn:hover {
          background: rgba(102,126,234,0.15);
          border-color: #667eea;
          transform: scale(1.1);
        }
        .sticker-btn.selected {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-color: #667eea;
        }
      `}</style>

      <div className="journal-container">
        {/* AI Insights Modal */}
        {showInsightsModal && aiInsights && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              backdropFilter: 'blur(4px)'
            }}
            onClick={() => setShowInsightsModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              onClick={e => e.stopPropagation()}
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(245,247,250,0.98) 100%)',
                backdropFilter: 'blur(10px)',
                borderRadius: '20px',
                padding: '32px',
                maxWidth: '500px',
                width: '90%',
                border: '2px solid rgba(102,126,234,0.2)',
                boxShadow: '0 25px 50px rgba(0,0,0,0.2)'
              }}
            >
              <h2 style={{ margin: '0 0 20px 0', color: '#667eea', fontSize: '1.6em', fontWeight: 700 }}>
                ✨ Your Reflection Insights
              </h2>

              {aiInsights.moodTrend && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  style={{
                    padding: '14px',
                    marginBottom: '16px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, rgba(102,126,234,0.1), rgba(118,75,162,0.08))',
                    border: '2px solid rgba(102,126,234,0.2)',
                    color: '#333',
                    lineHeight: '1.6',
                    fontSize: '0.95em'
                  }}
                >
                  {aiInsights.moodTrend}
                </motion.div>
              )}

              {aiInsights.suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h3 style={{ color: '#333', marginTop: '16px', marginBottom: '12px', fontSize: '1em' }}>💡 Suggestions</h3>
                  {aiInsights.suggestions.map((sugg, idx) => (
                    <motion.p
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + idx * 0.1 }}
                      style={{
                        margin: '8px 0',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        background: 'rgba(102,126,234,0.05)',
                        color: '#333',
                        fontSize: '0.95em',
                        lineHeight: '1.5'
                      }}
                    >
                      {sugg}
                    </motion.p>
                  ))}
                </motion.div>
              )}

              {aiInsights.encouragement && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  style={{
                    padding: '16px',
                    marginTop: '16px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, rgba(240,147,251,0.15), rgba(245,158,11,0.1))',
                    border: '2px solid rgba(240,147,251,0.2)',
                    color: '#333',
                    fontWeight: '500',
                    fontSize: '0.95em',
                    textAlign: 'center',
                    lineHeight: '1.6'
                  }}
                >
                  {aiInsights.encouragement}
                </motion.div>
              )}

              <button
                onClick={() => setShowInsightsModal(false)}
                className="action-btn"
                style={{
                  width: '100%',
                  marginTop: '24px',
                  justifyContent: 'center',
                  fontSize: '1em',
                  padding: '12px 24px'
                }}
              >
                🙏 Thank You
              </button>
            </motion.div>
          </motion.div>
        )}

        {/* Enhanced Header */}
        <motion.div 
          className="journal-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1>✨ My Journal</h1>
          <p>A safe space for your thoughts, feelings, and beautiful moments</p>
          
          {/* Quick Stats Bar */}
          <div style={{ display: 'flex', gap: 20, marginTop: 20, flexWrap: 'wrap' }}>
            <div className="stats-box" style={{ flex: 1, minWidth: 150 }}>
              <div style={{ fontSize: 24, fontWeight: 700, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {entries.length}
              </div>
              <small style={{ color: '#888' }}>Total Entries</small>
            </div>
            <div className="stats-box" style={{ flex: 1, minWidth: 150 }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#667eea' }}>{getMoodStats().average}</div>
              <small style={{ color: '#888' }}>Average Mood</small>
            </div>
            <button 
              className="action-btn"
              onClick={() => setShowMoodStats(!showMoodStats)}
              style={{ flex: 1, minWidth: 150, justifyContent: 'center' }}
            >
              <TrendingUp size={18} /> Mood Trends
            </button>
            <button 
              className="action-btn"
              onClick={exportToJSON}
              style={{ flex: 1, minWidth: 150, justifyContent: 'center' }}
              title="Export as JSON"
            >
              <Download size={18} /> JSON
            </button>
            <button 
              className="action-btn"
              onClick={exportToPDF}
              disabled={isExportingPDF}
              style={{ 
                flex: 1, 
                minWidth: 150, 
                justifyContent: 'center',
                background: isExportingPDF ? '#888' : 'linear-gradient(135deg, #FF512F 0%, #DD2476 100%)'
              }}
              title="Export as PDF Report"
            >
              <FileText size={18} /> {isExportingPDF ? 'Exporting...' : 'PDF Report'}
            </button>
          </div>

          {/* Mood Stats */}
          {showMoodStats && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ marginTop: 20, padding: 16, background: 'rgba(102,126,234,0.05)', borderRadius: 12, border: '2px solid rgba(102,126,234,0.1)' }}
            >
              <h3 style={{ margin: '0 0 12px 0', color: '#667eea' }}>📊 Your Mood Distribution</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
                {Object.entries(getMoodStats().moodCounts).map(([mood, count]) => (
                  <div key={mood} style={{ textAlign: 'center', padding: 12, background: 'white', borderRadius: 8, border: '1px solid rgba(102,126,234,0.1)' }}>
                    <div style={{ fontSize: 28 }}>{moodEmojis[parseInt(mood) - 1]}</div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: '#667eea', marginTop: 4 }}>{count}</div>
                    <small style={{ color: '#888' }}>{((count / entries.length) * 100).toFixed(0)}%</small>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Templates and Writing Area */}
        {showTemplates && (
          <motion.div 
            className="form-card"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ marginBottom: 24 }}
          >
            <h3 style={{ margin: '0 0 16px 0', color: '#667eea' }}>📝 Quick Start Templates</h3>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {entryTemplates.map((template, idx) => (
                <div 
                  key={idx}
                  className="template-chip"
                  onClick={() => loadTemplateContent(template)}
                >
                  <span>{template.emoji}</span>
                  <span>{template.name}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
          {/* Form Card */}
          <motion.div 
            className="form-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ margin: 0, color: '#333', fontSize: '1.4em', fontWeight: 700 }}>
                {editId ? '✏️ Edit Entry' : '📝 New Entry'}
              </h2>
              <button 
                onClick={() => setShowTemplates(!showTemplates)}
                className="action-btn"
              >
                📋 Templates
              </button>
            </div>

            {/* Daily Reflection Question */}
            {!editId && dailyQuestion && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  padding: '16px',
                  marginBottom: '20px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, rgba(240,147,251,0.15), rgba(245,158,11,0.1))',
                  border: '2px solid rgba(240,147,251,0.3)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px'
                }}
              >
                <span style={{ fontSize: '1.8em', minWidth: '40px' }}>{dailyQuestion.emoji}</span>
                <div>
                  <p style={{ margin: '0 0 8px 0', color: '#667eea', fontWeight: 600, fontSize: '0.9em' }}>💭 Today's Reflection</p>
                  <p style={{ margin: 0, color: '#333', fontSize: '1em', fontWeight: 500 }}>"{dailyQuestion.text}"</p>
                </div>
              </motion.div>
            )}

            <form onSubmit={handleSave}>
              {/* Ambient Controls */}
              <div style={{ marginBottom: 20, padding: 16, background: 'linear-gradient(135deg, rgba(102,126,234,0.05), rgba(118,75,162,0.04))', borderRadius: 12, border: '2px solid rgba(102,126,234,0.1)' }}>
                <label style={{ display: 'block', marginBottom: 12, fontWeight: 600, color: '#667eea' }}>🎵 Ambience</label>
                <div style={{ display: 'flex', gap: 10 }}>
                  {['rain', 'forest', 'piano'].map(name => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => toggleAmbient(name)}
                      className="action-btn"
                      style={{
                        background: ambient === name ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'linear-gradient(135deg, rgba(102,126,234,0.1), rgba(118,75,162,0.08))',
                        color: ambient === name ? 'white' : '#667eea',
                        border: '2px solid ' + (ambient === name ? '#667eea' : 'rgba(102,126,234,0.2)'),
                        flex: 1
                      }}
                    >
                      {ambient === name ? <Square size={16}/> : <Play size={16}/>}
                      {name.charAt(0).toUpperCase() + name.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mood Selection */}
              <label style={{ display: 'block', marginBottom: 10, fontWeight: 600, color: '#333' }}>How are you feeling? 😊</label>
              <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                {moodEmojis.map((emo, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setMood(i + 1)}
                    className="sticker-btn"
                    style={{
                      fontSize: 28,
                      width: 50,
                      height: 50,
                      borderColor: mood === i + 1 ? '#667eea' : 'transparent',
                      background: mood === i + 1 ? 'linear-gradient(135deg, rgba(102,126,234,0.2), rgba(118,75,162,0.15))' : 'rgba(102,126,234,0.05)',
                    }}
                  >
                    {emo}
                  </button>
                ))}
              </div>

              {/* Stickers & Color */}
              <div style={{ marginBottom: 20, padding: 16, background: 'linear-gradient(135deg, rgba(102,126,234,0.05), rgba(118,75,162,0.04))', borderRadius: 12, border: '2px solid rgba(102,126,234,0.1)' }}>
                <label style={{ display: 'block', marginBottom: 12, fontWeight: 600, color: '#667eea' }}>🎨 Decorate Your Entry</label>
                <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
                  {entryStickers.map(sticker => (
                    <button
                      key={sticker}
                      type="button"
                      onClick={() => setSelectedSticker(sticker)}
                      className="sticker-btn"
                      style={{
                        fontSize: 24,
                        borderColor: selectedSticker === sticker ? '#667eea' : 'transparent',
                        background: selectedSticker === sticker ? 'linear-gradient(135deg, rgba(102,126,234,0.2), rgba(118,75,162,0.15))' : 'rgba(102,126,234,0.05)',
                      }}
                    >
                      {sticker}
                    </button>
                  ))}
                </div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9em', color: '#666', fontWeight: 500 }}>Entry Theme Color:</label>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#fa709a'].map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setEntryColor(color)}
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 8,
                        background: color,
                        border: entryColor === color ? '3px solid #333' : '2px solid rgba(0,0,0,0.1)',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Memories and Songs */}
              <label style={{ display: 'block', marginBottom: 12, fontWeight: 600, fontSize: 15 }}>💝 Favorite Memories</label>
              <div style={{ marginBottom: 16 }} className="memories-container">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 20px', borderRadius: 10, border: '2px dashed rgba(102,126,234,0.3)', background: 'rgba(102,126,234,0.04)', color: '#000', cursor: 'pointer', transition: 'all 0.3s ease', fontWeight: 500 }} className="memories-upload">
                    <input type="file" accept="image/*" multiple onChange={handleAddMemory} style={{ display: 'none' }} />
                    <span style={{ fontSize: 20 }}>📸</span>
                    <span>Add Memory Photo</span>
                  </label>
                  <small style={{ color: '#888', fontSize: 13 }}>Upload your cherished moments</small>
                </div>

                {favoriteMemories.length > 0 && (
                  <div style={{ position: 'relative' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, paddingBottom: 8, borderBottom: '2px solid rgba(102,126,234,0.1)' }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#333' }}>📦 {favoriteMemories.length} Memory Photos</span>
                      {favoriteMemories.length > 3 && (
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button type="button" onClick={() => scrollMemories('left')} className="action-btn" style={{ padding: '8px 12px' }}>←</button>
                          <button type="button" onClick={() => scrollMemories('right')} className="action-btn" style={{ padding: '8px 12px' }}>→</button>
                        </div>
                      )}
                    </div>

                    <div ref={memoriesScrollRef} style={{ display: 'flex', gap: 14, overflowX: 'auto', overflowY: 'hidden', paddingBottom: 8 }} className="memories-scroll">
                      {favoriteMemories.map(memory => (
                        <motion.div
                          key={memory.id}
                          initial={{ opacity: 0, scale: 0.85 }}
                          animate={{ opacity: 1, scale: 1 }}
                          style={{
                            position: 'relative',
                            minWidth: 180,
                            height: 180,
                            borderRadius: 14,
                            overflow: 'hidden',
                            flexShrink: 0,
                            cursor: 'pointer',
                            boxShadow: '0 8px 20px rgba(102,126,234,0.2)',
                            border: '2px solid rgba(102,126,234,0.2)',
                            transition: 'all 0.3s ease'
                          }}
                          whileHover={{ scale: 1.08, boxShadow: '0 12px 32px rgba(102,126,234,0.3)' }}
                        >
                          <img src={memory.preview} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} alt={memory.name} />
                          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.5) 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 12, opacity: 0, transition: 'opacity 0.3s ease' }} onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }} onMouseLeave={(e) => { e.currentTarget.style.opacity = '0'; }}>
                            <button
                              type="button"
                              onClick={() => removeMemory(memory.id)}
                              style={{
                                background: 'rgba(255,76,76,0.9)',
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
                                fontWeight: 'bold'
                              }}
                            >
                              ✕
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Favorite Music Section */}
              <label style={{ display: 'block', marginBottom: 12, fontWeight: 600, fontSize: 15 }}>🎵 Favorite Music</label>
              <div style={{ marginBottom: 16 }} className="memories-container">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 20px', borderRadius: 10, border: '2px dashed rgba(102,126,234,0.3)', background: 'rgba(102,126,234,0.04)', color: '#000', cursor: 'pointer', transition: 'all 0.3s ease', fontWeight: 500 }} className="memories-upload">
                    <input type="file" accept="audio/*" multiple onChange={handleAddSong} disabled={isLoadingMusic} style={{ display: 'none' }} />
                    <span style={{ fontSize: 20 }}>🎵</span>
                    <span>{isLoadingMusic ? 'Uploading...' : 'Add Music'}</span>
                  </label>
                  <small style={{ color: '#888', fontSize: 13 }}>Upload your favorite songs (mp3, wav, ogg)</small>
                </div>

                {favoriteSongs.length > 0 && (
                  <div style={{ position: 'relative' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, paddingBottom: 8, borderBottom: '2px solid rgba(102,126,234,0.1)' }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#333' }}>🎵 {favoriteSongs.length} Song{favoriteSongs.length > 1 ? 's' : ''}</span>
                      {favoriteSongs.length > 3 && (
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button type="button" onClick={() => scrollSongs('left')} className="action-btn" style={{ padding: '8px 12px' }}>←</button>
                          <button type="button" onClick={() => scrollSongs('right')} className="action-btn" style={{ padding: '8px 12px' }}>→</button>
                        </div>
                      )}
                    </div>

                    <div ref={songsScrollRef} style={{ display: 'flex', gap: 14, overflowX: 'auto', overflowY: 'hidden', paddingBottom: 8 }} className="memories-scroll">
                      {favoriteSongs.map(song => (
                        <motion.div
                          key={song._id}
                          initial={{ opacity: 0, scale: 0.85 }}
                          animate={{ opacity: 1, scale: 1 }}
                          style={{
                            position: 'relative',
                            minWidth: 200,
                            borderRadius: 14,
                            flexShrink: 0,
                            cursor: 'pointer',
                            boxShadow: currentPlayingSong?._id === song._id ? '0 12px 32px rgba(102,126,234,0.4)' : '0 8px 20px rgba(102,126,234,0.2)',
                            border: '2px solid ' + (currentPlayingSong?._id === song._id ? '#667eea' : 'rgba(102,126,234,0.2)'),
                            transition: 'all 0.3s ease',
                            background: 'linear-gradient(135deg, rgba(102,126,234,0.08), rgba(118,75,162,0.06))',
                            padding: '16px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px'
                          }}
                          whileHover={{ scale: 1.05, boxShadow: '0 12px 32px rgba(102,126,234,0.3)' }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: '1.6em' }}>🎼</span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ margin: 0, fontSize: '0.9em', fontWeight: 600, color: '#333', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {song.title || 'Untitled'}
                              </p>
                              <small style={{ color: '#888', display: 'block' }}>
                                {song.duration ? `${Math.floor(song.duration / 60)}:${String(Math.floor(song.duration % 60)).padStart(2, '0')}` : 'Unknown duration'}
                              </small>
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: 6 }}>
                            <button
                              type="button"
                              onClick={() => playSong(song)}
                              className="action-btn"
                              style={{
                                flex: 1,
                                justifyContent: 'center',
                                padding: '8px 12px',
                                fontSize: '0.85em',
                                background: currentPlayingSong?._id === song._id ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'rgba(102,126,234,0.1)',
                                color: currentPlayingSong?._id === song._id ? 'white' : '#667eea',
                                border: 'none'
                              }}
                            >
                              {currentPlayingSong?._id === song._id ? <Square size={14} /> : <Play size={14} />}
                            </button>
                            <button
                              type="button"
                              onClick={() => removeSong(song._id)}
                              className="action-btn"
                              style={{
                                padding: '8px 12px',
                                fontSize: '0.85em',
                                background: 'rgba(255,107,107,0.2)',
                                color: '#ff6b6b',
                                border: 'none'
                              }}
                              title="Delete song"
                            >
                              ✕
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Music Player */}
                    {currentPlayingSong && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                          marginTop: 16,
                          padding: '16px',
                          borderRadius: '12px',
                          background: 'linear-gradient(135deg, rgba(102,126,234,0.15), rgba(118,75,162,0.1))',
                          border: '2px solid rgba(102,126,234,0.2)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                          <span style={{ fontSize: '1.8em' }}>🎵</span>
                          <div style={{ flex: 1 }}>
                            <p style={{ margin: 0, fontSize: '0.95em', fontWeight: 600, color: '#333' }}>
                              Now Playing: {currentPlayingSong.title || 'Untitled'}
                            </p>
                            <small style={{ color: '#888' }}>Click play to start listening</small>
                          </div>
                        </div>
                        <audio
                          ref={musicPlayerRef}
                          style={{ width: '100%' }}
                          controls
                          src={currentPlayingSong.url || currentPlayingSong.path}
                          onPlay={() => console.log('Playing:', currentPlayingSong.title)}
                          onError={(e) => {
                            console.error('Audio playback error:', e);
                            alert('Could not play this song. File may be missing or unsupported.');
                          }}
                        />
                      </motion.div>
                    )}
                  </div>
                )}
              </div>

              {/* Attachments & Recording */}
              <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 10, border: '2px solid rgba(102,126,234,0.2)', background: 'linear-gradient(135deg, rgba(102,126,234,0.05), rgba(118,75,162,0.04))', color: '#667eea', cursor: 'pointer', transition: 'all 0.2s', fontWeight: 500, flex: 1, justifyContent: 'center' }}>
                  <input type="file" accept="image/*,audio/*" multiple onChange={handleFileAdd} style={{ display: 'none' }} />
                  📎 Attach Files
                </label>
                <button 
                  type="button" 
                  onClick={() => isRecording ? stopRecording() : startRecording()}
                  className="action-btn"
                  style={{ flex: 1, justifyContent: 'center', background: isRecording ? '#ff6b6b' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                >
                  {isRecording ? <Square size={16}/> : <Mic size={16}/>}
                  {isRecording ? 'Stop Recording' : 'Record Voice'}
                </button>
              </div>

              {/* Content */}
              <label style={{ display: 'block', marginBottom: 10, fontWeight: 600, color: '#333' }}>💭 Your Thoughts</label>
              <textarea 
                rows={6}
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Pour your heart out here... Don't hold back, this is your safe space 🌟"
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: 10,
                  border: '2px solid rgba(102,126,234,0.2)',
                  fontFamily: 'inherit',
                  fontSize: '0.95em',
                  resize: 'vertical',
                  background: 'linear-gradient(135deg, rgba(102,126,234,0.03), rgba(118,75,162,0.02))',
                  marginBottom: 12
                }}
              />

              {sentimentSummary && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ marginBottom: 12, padding: 12, borderRadius: 10, background: 'linear-gradient(135deg, rgba(102,126,234,0.1), rgba(118,75,162,0.08))', border: '2px solid rgba(102,126,234,0.2)' }}
                >
                  <strong style={{ color: '#667eea' }}>💭 Sentiment Analysis:</strong>
                  <div style={{ marginTop: 8 }}>
                    <span style={{ display: 'inline-block', background: sentimentSummary.sentiment === 'positive' ? 'rgba(67,233,123,0.15)' : sentimentSummary.sentiment === 'negative' ? 'rgba(255,107,107,0.15)' : 'rgba(102,126,234,0.15)', color: sentimentSummary.sentiment === 'positive' ? '#43e97b' : sentimentSummary.sentiment === 'negative' ? '#ff6b6b' : '#667eea', padding: '4px 12px', borderRadius: 20, fontWeight: 600, fontSize: '0.9em' }}>
                      {sentimentSummary.sentiment.toUpperCase()}
                    </span>
                    <small style={{ color: '#888', marginLeft: 12 }}>Positive: {sentimentSummary.positive} | Negative: {sentimentSummary.negative}</small>
                  </div>
                </motion.div>
              )}

              {/* Tags */}
              <label style={{ display: 'block', marginBottom: 10, fontWeight: 600, color: '#333' }}>🏷️ Tags</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                {tags.map(t => (
                  <div key={t} className="mood-badge" style={{ display: 'inline-flex', gap: 8, alignItems: 'center', padding: '8px 12px' }}>
                    <span>{t}</span>
                    <button type="button" onClick={() => handleRemoveTag(t)} style={{ background: 'none', border: 'none', color: '#667eea', cursor: 'pointer', fontSize: '1.2em', padding: 0 }}>×</button>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                <input
                  ref={tagInputRef}
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  placeholder="Add a tag..."
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    borderRadius: 10,
                    border: '2px solid rgba(102,126,234,0.2)',
                    fontSize: '0.95em',
                    background: 'rgba(102,126,234,0.02)'
                  }}
                />
                <button type="button" onClick={handleAddTag} className="action-btn">
                  <PlusCircle size={16}/> Add
                </button>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: 12 }}>
                <button type="submit" className="action-btn" style={{ flex: 1, justifyContent: 'center', fontSize: '1em' }}>
                  {editId ? '✅ Save Changes' : '✨ Save Entry'}
                </button>
                <button type="button" onClick={() => { setContent(''); setTags([]); setMood(3); }} className="action-btn" style={{ flex: 1, justifyContent: 'center', fontSize: '1em', background: 'rgba(255,107,107,0.2)', color: '#ff6b6b' }}>
                  🗑️ Clear
                </button>
              </div>
            </form>
          </motion.div>

          {/* Entries List */}
          <motion.div 
            className="entries-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 style={{ margin: '0 0 20px 0', color: '#333', fontSize: '1.4em', fontWeight: 700 }}>📚 Your Entries</h2>

            {/* Search & Filter */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
              <input 
                type="date" 
                value={dateFilter} 
                onChange={e => setDateFilter(e.target.value)}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: 10,
                  border: '2px solid rgba(102,126,234,0.2)',
                  fontSize: '0.95em',
                  background: 'rgba(102,126,234,0.02)'
                }}
              />
              <div style={{ position: 'relative', flex: 1 }}>
                <input 
                  placeholder="Search..." 
                  value={searchQuery} 
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px 10px 40px',
                    borderRadius: 10,
                    border: '2px solid rgba(102,126,234,0.2)',
                    fontSize: '0.95em',
                    background: 'rgba(102,126,234,0.02)'
                  }}
                />
                <Search size={18} style={{ position: 'absolute', left: 14, top: 11, color: '#667eea' }} />
              </div>
            </div>

            {/* Entries */}
            <div>
              {loading && <p style={{ textAlign: 'center', color: '#888' }}>⏳ Loading entries...</p>}
              {!loading && filtered.length === 0 && <p style={{ textAlign: 'center', color: '#888' }}>📝 No entries yet. Start writing!</p>}
              {filtered.map(entry => (
                <motion.div 
                  key={entry._id || entry.id}
                  className="entry-card"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ borderLeftColor: entry.entryColor || '#667eea' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8 }}>
                        <span style={{ fontSize: '1.4em' }}>{entry.selectedSticker || '✨'}</span>
                        <small style={{ color: '#888', fontWeight: 500 }}>📅 {new Date(entry.createdAt).toLocaleString()}</small>
                        <small style={{ color: '#667eea', fontWeight: 600, fontSize: '1.1em' }}>{moodEmojis[entry.mood_score - 1]}</small>
                      </div>
                      <p style={{ margin: '0 0 12px 0', color: '#333', lineHeight: '1.6', fontSize: '0.95em' }} dangerouslySetInnerHTML={{ __html: highlightEmotional(entry.content || '') }} />
                      
                      {entry.tags && (entry.tags || []).length > 0 && (
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                          {(entry.tags || []).map(t => (
                            <span key={t} className="mood-badge" style={{ padding: '4px 10px', fontSize: '0.85em' }}>{t}</span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <button 
                        onClick={() => copyToClipboard(entry._id, entry.content)}
                        className="action-btn"
                        style={{ padding: '8px 12px', fontSize: '0.85em' }}
                        title="Copy to clipboard"
                      >
                        {copiedId === entry._id ? <Check size={16}/> : <Copy size={16}/>}
                      </button>
                      <button 
                        onClick={() => printEntry(entry)}
                        className="action-btn"
                        style={{ padding: '8px 12px', fontSize: '0.85em' }}
                        title="Print"
                      >
                        🖨️
                      </button>
                      <button 
                        onClick={() => startEdit(entry)}
                        className="action-btn"
                        style={{ padding: '8px 12px', fontSize: '0.85em' }}
                        title="Edit"
                      >
                        <Edit3 size={16}/>
                      </button>
                      <button 
                        onClick={() => handleDelete(entry._id || entry.id)}
                        className="action-btn"
                        style={{ padding: '8px 12px', fontSize: '0.85em', background: 'rgba(255,107,107,0.2)', color: '#ff6b6b' }}
                        title="Delete"
                      >
                        <Trash2 size={16}/>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <audio ref={ambientAudioRef} style={{ display: 'none' }} />
    </div>
  );
};

export default Journal;
