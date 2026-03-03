import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { User, Lock, AlertCircle, Download } from 'lucide-react';
import { getGravatarUrl } from '../utils/gravatar';
import { generateJournalPDF } from '../utils/pdfExport';

const Profile = ({ user = {} }) => {
  const [username, setUsername] = useState(user.username || '');
  const [email, setEmail] = useState(user.email || '');
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [saving, setSaving] = useState(false);
  const [changingPass, setChangingPass] = useState(false);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [emergencyAlertEnabled, setEmergencyAlertEnabled] = useState(false);
  const [emergencyContact, setEmergencyContact] = useState({ name: '', phone: '', relation: '', email: '', email_verified: false });
  const [contactId, setContactId] = useState(null);
  const [savingContact, setSavingContact] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [tempContact, setTempContact] = useState({ name: '', phone: '', relation: '', email: '' });

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
        setEmergencyAlertEnabled(data.emergency_alert_enabled || false);

        // Fetch emergency contacts
        const { data: contacts } = await axios.get('/api/user/emergency-contacts', config);
        if (contacts && contacts.length > 0) {
          // For now, we only handle one primary contact
          setEmergencyContact(contacts[0]);
          setContactId(contacts[0].id);
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        const message = err.response?.data?.message || err.message;
        if (err.response?.status === 401 && message.toLowerCase().includes('expire')) {
          alert('Session expired. Please log in again.');
          localStorage.clear();
          window.location.href = '/login';
        }
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
      if (emergencyAlertEnabled && !emergencyContact.email_verified) {
        return alert('Cannot enable alerts: Emergency contact email must be verified first.');
      }
      
      await axios.post('/api/user/update', { 
        username, 
        email, 
        emergency_alert_enabled: emergencyAlertEnabled 
      }, config);
      localStorage.setItem('username', username);
      alert('Profile updated');
    } catch (err) {
      console.error(err);
      const message = err.response?.data?.message || 'Failed to update profile';
      alert(message);
      if (err.response?.status === 401 && message.toLowerCase().includes('expire')) {
        localStorage.clear();
        window.location.href = '/login';
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSaveContact = async (e) => {
    e.preventDefault();
    const { name, phone, relation, email: cEmail } = tempContact;
    if (!name || !relation || !cEmail) return alert('Name, Relation, and Email are required');
    
    setSavingContact(true);
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      
      if (contactId) {
        const { data } = await axios.put(`/api/user/emergency-contacts/${contactId}`, tempContact, config);
        setEmergencyContact(data);
      } else {
        const { data } = await axios.post('/api/user/emergency-contacts', tempContact, config);
        setContactId(data.id);
        setEmergencyContact(data);
      }
      setIsContactModalOpen(false);
      alert('Emergency contact updated');
    } catch (err) {
      console.error(err);
      const message = err.response?.data?.message || 'Failed to update emergency contact';
      alert(message);
      if (err.response?.status === 401 && message.toLowerCase().includes('expire')) {
        localStorage.clear();
        window.location.href = '/login';
      }
    } finally {
      setSavingContact(false);
    }
  };

  const openEditModal = () => {
    setTempContact({ ...emergencyContact });
    setIsContactModalOpen(true);
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

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const { data: entries } = await axios.get('/api/journal', config);
      
      generateJournalPDF(entries, username, email);
    } catch (err) {
      console.error('Export Error:', err);
      alert(`Failed to generate PDF: ${err.message || 'Unknown error'}.`);
    } finally {
      setExporting(false);
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
          <div style={{ position: 'relative', width: '80px', height: '80px' }}>
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
              <div
                className="avatar-initials"
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)'
                }}
              >
                {(username || 'U').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
              </div>
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

      {/* Emergency Alert Settings */}
      <motion.div className="glass-card profile-section" variants={cardVariants}>
        <div className="section-header">
          <AlertCircle size={24} className="text-red-500" />
          <div>
            <h2>Serious Emergency Escalation</h2>
            <p className="section-description">Manage critical wellness notifications and emergency contacts</p>
          </div>
        </div>

        <div className="emergency-toggle-row" style={{ marginBottom: '20px', padding: '15px', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 'bold' }}>Enable Emergency Alerts</h3>
                <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem', color: '#666' }}>
                    Receive a notification if sustained low mood or high-risk indicators are detected.
                </p>
            </div>
            <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '50px', height: '26px' }}>
                <input 
                    type="checkbox" 
                    checked={emergencyAlertEnabled}
                    onChange={(e) => {
                        if (e.target.checked && !emergencyContact.email_verified) {
                            alert('Please verify your emergency contact email before enabling alerts.');
                            return;
                        }
                        setEmergencyAlertEnabled(e.target.checked);
                    }}
                    style={{ opacity: 0, width: 0, height: 0 }}
                    disabled={!emergencyContact.email_verified}
                />
                <span className="slider round" style={{ 
                    position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, 
                    backgroundColor: (emergencyAlertEnabled && emergencyContact.email_verified) ? '#ef4444' : '#ccc', 
                    transition: '.4s', borderRadius: '34px',
                    opacity: emergencyContact.email_verified ? 1 : 0.5
                }}>
                    <span style={{ 
                        position: 'absolute', content: '""', height: '18px', width: '18px', left: '4px', bottom: '4px', 
                        backgroundColor: 'white', transition: '.4s', borderRadius: '50%',
                        transform: (emergencyAlertEnabled && emergencyContact.email_verified) ? 'translateX(24px)' : 'none'
                    }}></span>
                </span>
            </label>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '10px', fontStyle: 'italic' }}>
            * This feature is consent-based. You will be asked to confirm before any alert is sent.
          </p>
        </div>

        <div className="contact-info-display" style={{ 
          padding: '20px', 
          background: 'rgba(255, 255, 255, 0.5)', 
          borderRadius: '12px', 
          border: '1px solid rgba(0,0,0,0.05)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {contactId ? (
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{emergencyContact.name}</h3>
              <p style={{ margin: '5px 0', color: '#666', fontSize: '0.9rem' }}>
                {emergencyContact.relation} • {emergencyContact.email} 
                <span style={{ 
                  marginLeft: '10px',
                  fontSize: '0.75rem', 
                  padding: '2px 8px', 
                  borderRadius: '10px', 
                  background: emergencyContact.email_verified ? 'rgba(34, 197, 94, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                  color: emergencyContact.email_verified ? '#22c55e' : '#f59e0b',
                  border: `1px solid ${emergencyContact.email_verified ? '#22c55e' : '#f59e0b'}`
                }}>
                  {emergencyContact.email_verified ? 'Verified ✅' : 'Pending Verification ⚠'}
                </span>
              </p>
            </div>
          ) : (
            <p style={{ margin: 0, color: '#888' }}>No emergency contact added yet.</p>
          )}
          <button 
            className="btn btn-secondary" 
            onClick={openEditModal}
            style={{ padding: '8px 16px', fontSize: '0.9rem' }}
          >
            {contactId ? 'Edit Contact' : 'Add Contact'}
          </button>
        </div>

        <div className="form-actions" style={{ marginTop: '20px' }}>
          <button type="button" onClick={handleSave} className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save All Settings'}
          </button>
        </div>

        {/* Contact Modal */}
        {isContactModalOpen && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
          }}>
            <motion.div 
              className="glass-card" 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{ width: '100%', maxWidth: '500px', padding: '30px', margin: '20px' }}
            >
              <h2 style={{ marginTop: 0, marginBottom: '20px' }}>{contactId ? 'Edit Emergency Contact' : 'Add Emergency Contact'}</h2>
              <form onSubmit={handleSaveContact}>
                <div className="form-group" style={{ marginBottom: '15px' }}>
                  <label>Name*</label>
                  <input
                    className="input-field"
                    required
                    value={tempContact.name}
                    onChange={e => setTempContact({ ...tempContact, name: e.target.value })}
                    placeholder="Full name"
                  />
                </div>
                <div className="form-group" style={{ marginBottom: '15px' }}>
                  <label>Email Address*</label>
                  <input
                    className="input-field"
                    type="email"
                    required
                    value={tempContact.email}
                    onChange={e => setTempContact({ ...tempContact, email: e.target.value })}
                    placeholder="email@example.com"
                  />
                </div>
                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      className="input-field"
                      value={tempContact.phone}
                      onChange={e => setTempContact({ ...tempContact, phone: e.target.value })}
                      placeholder="+1 234 567 890"
                    />
                  </div>
                  <div className="form-group">
                    <label>Relation*</label>
                    <select
                      className="input-field"
                      required
                      value={tempContact.relation}
                      onChange={e => setTempContact({ ...tempContact, relation: e.target.value })}
                      style={{ background: 'white' }}
                    >
                      <option value="">Select relationship</option>
                      <option value="Parent">Parent</option>
                      <option value="Sibling">Sibling</option>
                      <option value="Friend">Friend</option>
                      <option value="Partner">Partner</option>
                      <option value="Counselor">Counselor</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setIsContactModalOpen(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={savingContact} style={{ background: '#ef4444', borderColor: '#ef4444' }}>
                    {savingContact ? 'Saving...' : (contactId ? 'Update Contact' : 'Add Contact')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
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
            onClick={handleExportPDF}
            disabled={exporting}
          >
            <Download size={18} />
            {exporting ? 'Generating PDF...' : 'Export Data'}
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
