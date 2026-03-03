import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Heart, AlertCircle, CheckCircle, Key, X, Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const navigate = useNavigate();

  // Forgot Password States
  const [forgotStep, setForgotStep] = useState('email'); // 'email', 'otp', 'password'
  const [forgotEmail, setForgotEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [resetToken, setResetToken] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);
    console.log('Attempting login with:', { email, password });
    try {
      const { data } = await axios.post('/api/auth/login', { email, password });
      console.log('Login successful:', data);
      setSuccessMessage('Login successful! Redirecting...');
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', data.username);
      localStorage.setItem('email', data.email);
      setTimeout(() => {
        setLoading(false);
        navigate('/home');
      }, 1500);
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err.response?.data?.message || 'Login failed';
      setError(errorMessage);
      setLoading(false);
    }
  };

  // Forgot Password - Email Step
  const handleForgotPasswordEmail = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');
    setForgotLoading(true);

    try {
      const { data } = await axios.post('/api/auth/forgot-password', { email: forgotEmail });
      setForgotSuccess('OTP sent to your email! Check your inbox.');
      setForgotStep('otp');
      setForgotLoading(false);
    } catch (err) {
      console.error('Forgot password request error:', err);
      const message = err.response?.data?.message || 'Error requesting OTP. Please try again later.';
      setForgotError(message);
      setForgotLoading(false);
    }
  };

  // Forgot Password - OTP Verification
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');
    setForgotLoading(true);

    try {
      const { data } = await axios.post('/api/auth/verify-otp', {
        email: forgotEmail,
        otp
      });
      setResetToken(data.resetToken);
      setForgotSuccess('OTP verified! Now set your new password.');
      setForgotStep('password');
      setForgotLoading(false);
    } catch (err) {
      setForgotError(err.response?.data?.message || 'Invalid OTP');
      setForgotLoading(false);
    }
  };

  // Forgot Password - Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');

    // Validation
    if (!newPassword || !confirmPassword) {
      setForgotError('Please fill in all fields');
      return;
    }

    if (newPassword.length < 6) {
      setForgotError('Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setForgotError('Passwords do not match');
      return;
    }

    setForgotLoading(true);

    try {
      await axios.post('/api/auth/reset-password', {
        email: forgotEmail,
        newPassword,
        resetToken
      });
      setForgotSuccess('✓ Password reset successfully! Logging you in...');
      setTimeout(() => {
        setShowForgotPassword(false);
        setForgotStep('email');
        setForgotEmail('');
        setOtp('');
        setNewPassword('');
        setConfirmPassword('');
        setForgotError('');
        setForgotSuccess('');
      }, 2000);
      setForgotLoading(false);
    } catch (err) {
      setForgotError(err.response?.data?.message || 'Error resetting password');
      setForgotLoading(false);
    }
  };

  const closeForgotPassword = () => {
    setShowForgotPassword(false);
    setForgotStep('email');
    setForgotEmail('');
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setForgotError('');
    setForgotSuccess('');
    setResetToken('');
  };

  const isInvalidCredentials = error.toLowerCase().includes('invalid');

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        width: '100vw',
        margin: 0,
        padding: 0,
        background: 'linear-gradient(135deg, #6366f1 0%, #a21caf 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Animated, colorful background shapes */}
      <div style={{
        position: 'absolute',
        top: '-120px',
        left: '-120px',
        width: '340px',
        height: '340px',
        background: 'radial-gradient(circle at 60% 40%, #818cf8 0%, #a5b4fc 60%, transparent 100%)',
        filter: 'blur(30px)',
        opacity: 0.7,
        zIndex: 0,
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-100px',
        right: '-100px',
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle at 40% 60%, #f472b6 0%, #f9a8d4 60%, transparent 100%)',
        filter: 'blur(30px)',
        opacity: 0.6,
        zIndex: 0,
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '120vw',
        height: '120vh',
        background: 'radial-gradient(circle at 50% 50%, rgba(236, 72, 153, 0.08) 0%, transparent 80%)',
        zIndex: 0,
        pointerEvents: 'none',
      }} />

      <div
        className="glass-card animate-in login-card"
        style={{
          width: '100%',
          maxWidth: '420px',
          position: 'relative',
          zIndex: 2,
          background: 'rgba(255,255,255,0.95)',
          boxShadow: '0 8px 32px 0 rgba(99,102,241,0.18), 0 1.5px 8px 0 rgba(236,72,153,0.10)',
          borderRadius: '1.5rem',
          border: '1.5px solid rgba(99,102,241,0.10)',
          padding: '2.5rem 2rem',
          backdropFilter: 'blur(12px)',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.6rem' }}>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}
          >
            <img
              src="/mindpulse-logo.png"
              alt="MindPulse Logo"
              style={{
                height: '60px',
                width: 'auto',
                borderRadius: '8px',
                objectFit: 'contain'
              }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </motion.div>

          <h2
            style={{
              margin: '0 0 0.5rem 0',
              color: '#7c3aed',
              fontWeight: 800,
              fontSize: '2.1rem',
              letterSpacing: '-1px',
              textShadow: '0 2px 12px #a5b4fc44',
            }}
          >
            Welcome Back
          </h2>
          <p
            style={{
              color: '#a21caf',
              margin: 0,
              fontSize: '1.05rem',
              fontWeight: 500,
              letterSpacing: '0.01em',
            }}
          >
            Track your mental wellness journey
          </p>
        </div>


        {/* Error Message - Professional styling */}
        {error && (
          <div style={{
            background: 'rgba(248, 113, 113, 0.15)',
            border: '1.5px solid rgba(248, 113, 113, 0.4)',
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
                Login Failed
              </p>
              <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.9 }}>
                {error}
              </p>
              {isInvalidCredentials && (
                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', opacity: 0.8 }}>
                  <button
                    onClick={() => setShowForgotPassword(true)}
                    className="forgot-link forgot-inline"
                  >
                    Forgot your password?
                  </button>
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
            <label htmlFor="email" style={{ color: '#7c3aed', fontWeight: 600 }}>Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              className="input-field"
              style={{
                border: '1.5px solid #a5b4fc',
                borderRadius: '0.75rem',
                padding: '0.85rem 1rem',
                fontSize: '1rem',
                marginTop: '0.3rem',
                background: '#f5f3ff',
                color: '#312e81',
                outline: 'none',
                boxShadow: '0 1.5px 8px 0 #a5b4fc22',
              }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" style={{ color: '#7c3aed', fontWeight: 600 }}>Password</label>
            <div className="input-wrapper">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Your secure password"
                className="input-field"
                style={{
                  border: '1.5px solid #f472b6',
                  borderRadius: '0.75rem',
                  padding: '0.85rem 1rem',
                  fontSize: '1rem',
                  marginTop: '0.3rem',
                  background: '#fdf2f8',
                  color: '#701a75',
                  outline: 'none',
                  boxShadow: '0 1.5px 8px 0 #f472b622',
                }}
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
                style={{ background: 'none', border: 'none', marginLeft: '-2.2rem', marginTop: '0.4rem', color: '#a21caf', cursor: 'pointer' }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="forgot-container" style={{ marginTop: '0.35rem' }}>
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="forgot-link"
                style={{ color: '#a21caf', background: 'none', border: 'none', fontWeight: 500, cursor: 'pointer', textDecoration: 'underline', fontSize: '0.97rem' }}
              >
                Forgot your password?
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{
              width: '100%',
              marginTop: '1rem',
              background: 'linear-gradient(90deg, #6366f1 0%, #a21caf 100%)',
              color: '#fff',
              fontWeight: 700,
              fontSize: '1.1rem',
              border: 'none',
              borderRadius: '0.9rem',
              boxShadow: '0 2px 12px #a5b4fc33',
              padding: '0.9rem 0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'background 0.2s',
            }}
            disabled={loading}
          >
            <LogIn size={20} style={{ marginRight: '0.5rem' }} />
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          margin: '1.5rem 0',
          color: 'var(--text-muted)',
          fontSize: '0.9rem'
        }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.1)' }} />
          <span style={{ margin: '0 1rem' }}>New here?</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.1)' }} />
        </div>

        <Link to="/register" style={{ textDecoration: 'none' }}>
          <button
            type="button"
            className="btn btn-secondary"
            style={{
              width: '100%',
              background: 'linear-gradient(90deg, #f472b6 0%, #6366f1 100%)',
              color: '#fff',
              fontWeight: 700,
              fontSize: '1.1rem',
              border: 'none',
              borderRadius: '0.9rem',
              boxShadow: '0 2px 12px #f472b633',
              padding: '0.9rem 0',
              marginTop: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'background 0.2s',
            }}
            onClick={() => navigate('/home')}
          >
            Create an Account
          </button>
        </Link>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="forgot-overlay">
          <div className="glass-card animate-in" style={{
            width: '100%',
            maxWidth: '420px',
            position: 'relative',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '40px',
                  height: '40px',
                  borderRadius: '0.75rem',
                  background: 'linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)'
                }}>
                  <Key size={20} color="white" />
                </div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-dark)' }}>Reset Password</h3>
              </div>
              <button
                onClick={closeForgotPassword}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-dark)',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Error Message */}
            {forgotError && (
              <div style={{
                background: 'rgba(248, 113, 113, 0.15)',
                border: '1.5px solid rgba(248, 113, 113, 0.4)',
                color: '#fca5a5',
                padding: '0.875rem',
                borderRadius: '0.75rem',
                marginBottom: '1rem',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.5rem'
              }}>
                <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                <p style={{ margin: 0 }}>{forgotError}</p>
              </div>
            )}

            {/* Success Message */}
            {forgotSuccess && (
              <div style={{
                background: 'rgba(74, 222, 128, 0.15)',
                border: '1.5px solid rgba(74, 222, 128, 0.4)',
                color: '#86efac',
                padding: '0.875rem',
                borderRadius: '0.75rem',
                marginBottom: '1rem',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.5rem'
              }}>
                <CheckCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                <p style={{ margin: 0 }}>{forgotSuccess}</p>
              </div>
            )}

            {/* Step Indicator */}
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              marginBottom: '1.5rem'
            }}>
              {['email', 'otp', 'password'].map((step, idx) => (
                <div
                  key={step}
                  style={{
                    flex: 1,
                    height: '4px',
                    borderRadius: '2px',
                    background: forgotStep === step || (
                      (forgotStep === 'otp' && step === 'email') ||
                      (forgotStep === 'password' && (step === 'email' || step === 'otp'))
                    ) ? '#6366f1' : 'rgba(255, 255, 255, 0.1)',
                    transition: 'all 0.3s ease'
                  }}
                />
              ))}
            </div>

            {/* Email Step */}
            {forgotStep === 'email' && (
              <form onSubmit={handleForgotPasswordEmail}>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  Enter your email address and we'll send you an OTP to reset your password.
                </p>
                <div className="mb-4">
                  <label htmlFor="forgotEmail">Email Address</label>
                  <input
                    id="forgotEmail"
                    type="email"
                    placeholder="your@email.com"
                    className="input-field"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                    disabled={forgotLoading}
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                  disabled={forgotLoading}
                >
                  {forgotLoading ? 'Sending OTP...' : 'Send OTP'}
                </button>
              </form>
            )}

            {/* OTP Step */}
            {forgotStep === 'otp' && (
              <form onSubmit={handleVerifyOTP}>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  Enter the 6-digit OTP sent to your email. It's valid for 10 minutes.
                </p>
                <div className="mb-4">
                  <label htmlFor="otpInput">Enter OTP</label>
                  <input
                    id="otpInput"
                    type="text"
                    placeholder="000000"
                    maxLength="6"
                    className="input-field"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    required
                    disabled={forgotLoading}
                    style={{
                      fontSize: '1.5rem',
                      letterSpacing: '0.5rem',
                      textAlign: 'center',
                      fontWeight: 'bold'
                    }}
                  />
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.5rem 0 0 0' }}>
                    Check your spam folder if you don't see it
                  </p>
                </div>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                  disabled={forgotLoading || otp.length !== 6}
                >
                  {forgotLoading ? 'Verifying...' : 'Verify OTP'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setForgotStep('email');
                    setOtp('');
                    setForgotError('');
                    setForgotSuccess('');
                  }}
                  style={{
                    width: '100%',
                    marginTop: '0.75rem',
                    background: 'none',
                    border: '1px solid rgba(15,23,42,0.04)',
                    color: 'var(--text-dark)',
                    padding: '0.75rem',
                    borderRadius: '0.75rem',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  Back to Email
                </button>
              </form>
            )}

            {/* Password Reset Step */}
            {forgotStep === 'password' && (
              <form onSubmit={handleResetPassword}>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  Create a new strong password for your account.
                </p>
                <div className="mb-4">
                  <label htmlFor="newPassword">New Password</label>
                  <div className="input-wrapper">
                    <input
                      id="newPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      placeholder="At least 6 characters"
                      className="input-field"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      disabled={forgotLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(s => !s)}
                      aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                      className="password-toggle"
                    >
                      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div className="mb-4">
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <div className="input-wrapper">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Re-enter your password"
                      className="input-field"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={forgotLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(s => !s)}
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      className="password-toggle"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                  disabled={forgotLoading}
                >
                  {forgotLoading ? 'Resetting Password...' : 'Reset Password'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
