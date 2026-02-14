import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

const Profile = ({ user = {} }) => {
  const [username, setUsername] = useState(user.username || '');
  const [email, setEmail] = useState(user.email || '');
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [privacy, setPrivacy] = useState(user.privateAccount || false);
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Minimal client-side validation
      if (!username || !email) return alert('Username and email required');
      // Send update to backend (assumes /api/user/update)
      await axios.post('/api/user/update', { username, email, privacy });
      alert('Profile updated');
    } catch (err) {
      console.error(err);
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!oldPass || !newPass) return alert('Fill both password fields');
    if (newPass.length < 8) return alert('New password must be 8+ chars');
    try {
      await axios.post('/api/user/change-password', { oldPass, newPass });
      setOldPass(''); setNewPass('');
      alert('Password changed successfully');
    } catch (err) {
      console.error(err);
      alert('Could not change password');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete your account? This cannot be undone.')) return;
    try {
      await axios.post('/api/user/delete');
      localStorage.clear();
      window.location.href = '/login';
    } catch (err) {
      console.error(err);
      alert('Failed to delete account');
    }
  };

  return (
    <motion.main className="page-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="glass-card">
        <h2>Account Settings</h2>
        <div className="profile-avatar">
          <div className="avatar-initials">{(username || 'U').split(' ').map(n=>n[0]).slice(0,2).join('').toUpperCase()}</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1rem' }}>{username || 'Username'}</div>
            <div className="avatar-upload">Change profile photo (coming soon)</div>
          </div>
        </div>

        <form onSubmit={handleSave} className="form-grid" style={{ marginTop: '1rem' }}>
          <div>
            <label>Username</label>
            <input className="input-field" value={username} onChange={e => setUsername(e.target.value)} />

            <label>Email</label>
            <input className="input-field" type="email" value={email} onChange={e => setEmail(e.target.value)} />
          </div>

          <div>
            <label>Privacy</label>
            <div>
              <label className="switch">
                <input type="checkbox" checked={privacy} onChange={e => setPrivacy(e.target.checked)} />
                <span className="slider" />
              </label>
            </div>

            <div style={{ height: 8 }} />
            <div style={{ textAlign: 'right' }}>
              <button className="btn" disabled={saving}>Save Changes</button>
            </div>
          </div>
        </form>
      </div>

      <div className="glass-card">
        <h2>Change Password</h2>
        <form onSubmit={handleChangePassword} className="form-grid">
          <div>
            <label>Current Password</label>
            <input className="input-field" type="password" value={oldPass} onChange={e => setOldPass(e.target.value)} />

            <label>New Password</label>
            <input className="input-field" type="password" value={newPass} onChange={e => setNewPass(e.target.value)} />
          </div>

          <div />
          <div style={{ textAlign: 'right' }}>
            <button className="btn btn-primary">Change Password</button>
          </div>
        </form>
      </div>

      <div className="glass-card">
        <h2>Danger Zone</h2>
        <p>Delete your account and all associated data.</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
          <button className="btn" onClick={() => alert('Export not implemented')}>Export Data</button>
          <button className="btn btn-danger" onClick={handleDelete}>Delete Account</button>
        </div>
      </div>

    </motion.main>
  );
};

export default Profile;
