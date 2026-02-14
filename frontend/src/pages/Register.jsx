import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Heart, AlertCircle, CheckCircle, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const { data } = await axios.post('/api/auth/register', { username, email, password });
      setSuccessMessage('Account created successfully! Redirecting...');
      setTimeout(() => {
        localStorage.setItem('token', data.token);
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registration failed';
      setError(errorMessage);
      setLoading(false);
    }
  };

  // Determine error type for better styling
  const isAlreadyRegistered = error.toLowerCase().includes('already registered');
  const isEmailTaken = error.toLowerCase().includes('email');

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      width: '100vw',
      margin: 0,
      padding: '2rem 1rem',
      paddingTop: '4rem'
    }}>
      {/* Animated background elements */}
      <div style={{
        position: 'fixed',
        top: '-50%',
        left: '-50%',
        width: '200%',
        height: '200%',
        background: 'radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.15) 0%, transparent 50%)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'fixed',
        bottom: '-50%',
        right: '-50%',
        width: '200%',
        height: '200%',
        background: 'radial-gradient(circle at 80% 80%, rgba(236, 72, 153, 0.15) 0%, transparent 50%)',
        pointerEvents: 'none'
      }} />

      <div className="glass-card animate-in" style={{ 
        width: '100%', 
        maxWidth: '420px',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.6rem' }}>
          <motion.div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem'
            }}
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            <img
              src="/mindpulse-logo.png"
              alt="MindPulse Logo"
              style={{
                height: '80px',
                width: 'auto',
                objectFit: 'contain'
              }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </motion.div>
          <h2 style={{ margin: '0 0 0.25rem 0', color: 'var(--text-dark)' }}>Join MindPulse</h2>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.95rem' }}>
            Create an account and start tracking your mood with beautiful insights.
          </p>
        </div>

        {/* Error Message - Professional styling */}
        {error && (
          <div style={{ 
            background: isAlreadyRegistered 
              ? 'rgba(248, 113, 113, 0.15)'
              : 'rgba(248, 113, 113, 0.15)',
            border: `1.5px solid ${isAlreadyRegistered 
              ? 'rgba(248, 113, 113, 0.4)' 
              : 'rgba(248, 113, 113, 0.4)'}`,
            color: '#fca5a5',
            padding: '1rem',
            borderRadius: '0.875rem',
            marginBottom: '1.5rem',
            fontSize: '0.95rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
            backdropFilter: 'blur(10px)'
          }}>
            <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <p style={{ margin: '0 0 0.25rem 0', fontWeight: '600' }}>
                {isAlreadyRegistered ? 'Account Exists' : 'Registration Error'}
              </p>
              <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.9 }}>
                {error}
              </p>
              {isAlreadyRegistered && (
                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', opacity: 0.8 }}>
                  <Link 
                    to="/login" 
                    style={{ 
                      color: '#fca5a5', 
                      textDecoration: 'underline',
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}
                  >
                    Log in to your account instead
                  </Link>
                </p>
              )}
            </div>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div style={{ 
            background: 'rgba(74, 222, 128, 0.15)',
            border: '1.5px solid rgba(74, 222, 128, 0.4)',
            color: '#86efac',
            padding: '1rem',
            borderRadius: '0.875rem',
            marginBottom: '1.5rem',
            fontSize: '0.95rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
            backdropFilter: 'blur(10px)'
          }}>
            <CheckCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <p style={{ margin: 0, fontWeight: '600' }}>
                {successMessage}
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              placeholder="Choose a username"
              className="input-field"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
            />
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
              This will be your unique profile name
            </p>
          </div>

          <div className="mb-4">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="your@email.com"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
              We'll use this to verify your account
            </p>
          </div>

          <div className="mb-4">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a strong password"
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(s => !s)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="password-toggle"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
              Use a strong password to keep your journal private.
            </p>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '1.5rem' }}
            disabled={loading}
          >
            <UserPlus size={20} style={{ marginRight: '0.5rem' }} />
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        {/* Divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          margin: '2rem 0 1.5rem 0',
          color: 'var(--text-muted)',
          fontSize: '0.9rem'
        }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.1)' }} />
          <span style={{ margin: '0 1rem' }}>Already have an account?</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.1)' }} />
        </div>

        <Link to="/login" style={{ textDecoration: 'none', display: 'flex' }}>
          <button type="button" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', gap: '0.5rem' }}>
            Sign In <ArrowRight size={16} />
          </button>
        </Link>
      </div>
    </div>
  );
};

export default Register;
