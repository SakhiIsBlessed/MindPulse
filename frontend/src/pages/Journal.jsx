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

  const [dateFilter, setDateFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const tagInputRef = useRef(null);

  useEffect(() => { fetchEntries(); }, []);

  useEffect(() => {
    // update sentiment summary live for current content
    setSentimentSummary(analyzeEmotion(content || voiceTranscription || ''));
  }, [content, voiceTranscription]);

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
          await axios.put(`/api/journal/${editId}`, fd, { ...config, headers: { ...(config.headers||{}), 'Content-Type': 'multipart/form-data' } });
        } else {
          await axios.post('/api/journal', fd, { ...config, headers: { ...(config.headers||{}), 'Content-Type': 'multipart/form-data' } });
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
      const d = new Date(e.createdAt || e.created_at || e.date).toISOString().slice(0,10);
      if (d !== dateFilter) return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!((e.content||'').toLowerCase().includes(q) || (e.tags||[]).join(' ').toLowerCase().includes(q))) return false;
    }
    return true;
  });

  // Ambient sound control
  const toggleAmbient = (name) => {
    if (ambient === name) {
      ambientAudioRef.current?.pause();
      setAmbient('');
    } else {
      setAmbient(name);
      const src = {
        rain: '/ambient/rain.mp3',
        forest: '/ambient/forest.mp3',
        piano: '/ambient/piano.mp3'
      }[name];
      if (ambientAudioRef.current) {
        ambientAudioRef.current.src = src;
        ambientAudioRef.current.loop = true;
        ambientAudioRef.current.play().catch(()=>{});
      }
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
          for (let i=0;i<ev.results.length;i++) {
            if (ev.results[i].isFinal) final += ev.results[i][0].transcript + ' ';
            else interim += ev.results[i][0].transcript + ' ';
          }
          setVoiceTranscription(prev => (final || interim) );
        };
        recognitionRef.current.start();
      }
    } catch (err) { console.error('record failed', err); alert('Microphone access denied'); }
  };

  const stopRecording = () => {
    try {
      mediaRecorderRef.current?.stop();
      recognitionRef.current?.stop();
    } catch (e) {}
    setIsRecording(false);
  };

  // Attachments
  const handleFileAdd = (ev) => {
    const files = Array.from(ev.target.files || []);
    const newFiles = files.map(f => ({ file: f, preview: f.type.startsWith('image/') ? URL.createObjectURL(f) : null, type: f.type }));
    setAttachments(prev => [...prev, ...newFiles]);
    ev.target.value = '';
  };
  const removeAttachment = (idx) => setAttachments(prev => { const p=[...prev]; p.splice(idx,1); return p; });

  // Emotion detection helpers
  function analyzeEmotion(text) {
    if (!text) return null;
    const pos = ['happy','joy','delighted','glad','love','content','relieved','optimistic','grateful','excited'];
    const neg = ['sad','depressed','angry','upset','anxious','worried','lonely','hate','tired','frustrated'];
    const words = text.toLowerCase().split(/[^a-zA-Z]+/).filter(Boolean);
    let p=0,n=0; const found=[];
    for (const w of words) {
      if (pos.includes(w)) { p++; found.push({word:w,type:'positive'}); }
      if (neg.includes(w)) { n++; found.push({word:w,type:'negative'}); }
    }
    const score = p - n;
    const sentiment = score > 0 ? 'positive' : score < 0 ? 'negative' : 'neutral';
    return { positive: p, negative: n, score, sentiment, keywords: found };
  }

  const escapeHtml = (s) => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const highlightEmotional = (text) => {
    const res = analyzeEmotion(text);
    if (!res) return escapeHtml(text);
    let out = escapeHtml(text);
    const uniq = Array.from(new Set(res.keywords.map(k=>k.word)));
    uniq.forEach(w => {
      const re = new RegExp('\\b'+w+'\\b','ig');
      out = out.replace(re, m => `<mark style="background: rgba(255,205,210,0.5)">${m}</mark>`);
    });
    return out;
  };

  return (
    <div style={{ padding: '2rem', maxWidth: 1200, margin: '0 auto' }}>
      <motion.div className="glass-card" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0 }}>Journal</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: 6 }}>Write daily entries, track mood, tag and search.</p>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <motion.form className="glass-card" onSubmit={handleSave} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h2 style={{ margin: 0 }}>{editId ? 'Edit Entry' : 'New Entry'}</h2>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsFocusMode(f => !f)} title="Toggle Focus Mode">{isFocusMode ? 'Focus On' : 'Focus'}</button>
              <button type="button" className="btn btn-secondary" onClick={() => setIsDistractionFree(f => !f)} title="Toggle Distraction Free">{isDistractionFree ? 'Distraction Off' : 'Distraction Free'}</button>
              <button type="button" className="btn btn-secondary" onClick={resetForm} style={{ gap: 8 }}>Clear</button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 6 }}>
              <button type="button" className="btn" onClick={() => toggleAmbient('rain')} title="Rain"><Music /> Rain</button>
              <button type="button" className="btn" onClick={() => toggleAmbient('forest')} title="Forest"><Music /> Forest</button>
              <button type="button" className="btn" onClick={() => toggleAmbient('piano')} title="Piano"><Music /> Piano</button>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                <input type="file" accept="image/*,audio/*" multiple onChange={handleFileAdd} style={{ display: 'none' }} />
                <span className="btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>📎 Attach</span>
              </label>
              <button type="button" className="btn btn-primary" onClick={() => isRecording ? stopRecording() : startRecording()}>{isRecording ? <Square /> : <Mic />} {isRecording ? 'Stop' : 'Record'}</button>
            </div>
          </div>

          <label style={{ display: 'block', marginBottom: 8 }}>Mood</label>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            {moodEmojis.map((emo, i) => (
              <button key={i} type="button" onClick={() => setMood(i+1)} className="btn" style={{ padding: 12, minWidth: 56, borderRadius: 12, border: mood === i+1 ? `2px solid var(--primary)` : '1px solid rgba(15,23,42,0.06)', background: mood === i+1 ? 'rgba(108,92,231,0.08)' : 'transparent' }}>{emo}</button>
            ))}
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
                      <div style={{ width: 18, height: 18, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{moodEmojis[(entry.mood_score || 1)-1]}</div>
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
