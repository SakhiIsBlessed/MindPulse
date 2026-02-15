import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { User, Lock, AlertCircle, Download } from 'lucide-react';
import { getGravatarUrl } from '../utils/gravatar';

const Profile = ({ user = {} }) => {
  const [username, setUsername] = useState(user.username || '');
  const [email, setEmail] = useState(user.email || '');
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [saving, setSaving] = useState(false);
  const [changingPass, setChangingPass] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        const storedUsername = localStorage.getItem('username');

        if (!token) return;

        // First, try to get from localStorage
        if (storedUsername) {
          setUsername(storedUsername);
        }

        // Fetch full user data from backend
        const config = {
          headers: { Authorization: `Bearer ${token}` },
        };
        const { data } = await axios.get('/api/user/profile', config);
        setUsername(data.username || storedUsername);
        setEmail(data.email);
      } catch (err) {
        console.error('Error fetching user data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (!username || !email) return alert('Username and email required');
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      await axios.post('/api/user/update', { username, email }, config);
      localStorage.setItem('username', username);
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
    setChangingPass(true);
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      await axios.post('/api/user/change-password', { oldPass, newPass }, config);
      setOldPass('');
      setNewPass('');
      alert('Password changed successfully');
    } catch (err) {
      console.error(err);
      alert('Could not change password');
    } finally {
      setChangingPass(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete your account? This cannot be undone.')) return;
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      await axios.post('/api/user/delete', {}, config);
      localStorage.clear();
      window.location.href = '/login';
    } catch (err) {
      console.error(err);
      alert('Failed to delete account');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.main
      className="page-container profile-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      variants={containerVariants}
    >
      {/* Profile Header */}
      <motion.div className="profile-header-section" variants={cardVariants}>
        <div className="profile-header-content">
          <div style={{ position: 'relative' }}>
            <img
              src={getGravatarUrl(email, 200)}
              alt={username}
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '3px solid var(--primary)',
                boxShadow: '0 4px 12px rgba(108, 92, 231, 0.2)'
              }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            {!email && (
              <div className="avatar-initials">{(username || 'U').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}</div>
            )}
          </div>
          <div className="profile-header-info">
            <h1>{username || 'Your Profile'}</h1>
            <p className="text-muted">{email || 'user@example.com'}</p>
          </div>
        </div>
      </motion.div>

      {/* Account Information */}
      <motion.div className="glass-card profile-section" variants={cardVariants}>
        <div className="section-header">
          <User size={24} />
          <div>
            <h2>Account Information</h2>
            <p className="section-description">Manage your profile details and account settings</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="profile-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                className="input-field"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Enter your username"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                className="input-field"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div className="form-actions">
            <button className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </motion.div>

      {/* Security Section */}
      <motion.div className="glass-card profile-section" variants={cardVariants}>
        <div className="section-header">
          <Lock size={24} />
          <div>
            <h2>Security</h2>
            <p className="section-description">Update your password to keep your account secure</p>
          </div>
        </div>

        <form onSubmit={handleChangePassword} className="profile-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="oldPass">Current Password</label>
              <input
                id="oldPass"
                className="input-field"
                type="password"
                value={oldPass}
                onChange={e => setOldPass(e.target.value)}
                placeholder="Enter current password"
              />
            </div>

            <div className="form-group">
              <label htmlFor="newPass">New Password</label>
              <input
                id="newPass"
                className="input-field"
                type="password"
                value={newPass}
                onChange={e => setNewPass(e.target.value)}
                placeholder="Enter new password (min. 8 characters)"
              />
              <p className="password-hint">Must be at least 8 characters long</p>
            </div>
          </div>

          <div className="form-actions">
            <button className="btn btn-primary" disabled={changingPass}>
              {changingPass ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </motion.div>

      {/* Danger Zone */}
      <motion.div className="glass-card profile-section danger-zone" variants={cardVariants}>
        <div className="section-header danger">
          <AlertCircle size={24} />
          <div>
            <h2>Danger Zone</h2>
            <p className="section-description">Irreversible actions - proceed with caution</p>
          </div>
        </div>

        <div className="danger-actions">
          <button
            className="btn btn-secondary"
            onClick={() => alert('Export not implemented')}
          >
            <Download size={18} />
            Export Data
          </button>
          <button
            className="btn btn-danger"
            onClick={handleDelete}
          >
            <AlertCircle size={18} />
            Delete Account
          </button>
        </div>
      </motion.div>
    </motion.main>
  );
};

export default Profile;
