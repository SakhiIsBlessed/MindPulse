import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { PlusCircle, Edit3, Trash2, Search } from 'lucide-react';

const moodEmojis = ['😔', '😐', '😌', '😊', '😄'];

const Journal = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  const [mood, setMood] = useState(3);
  const [content, setContent] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');

  const [editId, setEditId] = useState(null);

  const [dateFilter, setDateFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const tagInputRef = useRef(null);

  useEffect(() => { fetchEntries(); }, []);

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
      const payload = { content, mood_score: mood, tags };
      const token = localStorage.getItem('token');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      if (editId) {
        await axios.put(`/api/journal/${editId}`, payload, config);
      } else {
        await axios.post('/api/journal', payload, config);
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
            <button type="button" className="btn btn-secondary" onClick={resetForm} style={{ gap: 8 }}>Clear</button>
          </div>

          <label style={{ display: 'block', marginBottom: 8 }}>Mood</label>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            {moodEmojis.map((emo, i) => (
              <button key={i} type="button" onClick={() => setMood(i+1)} className="btn" style={{ padding: 12, minWidth: 56, borderRadius: 12, border: mood === i+1 ? `2px solid var(--primary)` : '1px solid rgba(15,23,42,0.06)', background: mood === i+1 ? 'rgba(108,92,231,0.08)' : 'transparent' }}>{emo}</button>
            ))}
          </div>

          <label style={{ display: 'block', marginBottom: 8 }}>Write</label>
          <textarea className="input-field" rows={6} value={content} onChange={e => setContent(e.target.value)} placeholder="Write your thoughts..." style={{ marginBottom: 12 }} />

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
                    <p style={{ margin: '0 0 8px 0', color: 'var(--text-dark)' }}>{entry.content}</p>
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
    </div>
  );
};

export default Journal;
