import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Heart, AlertCircle, CheckCircle, Key, X } from 'lucide-react';

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
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [resetToken, setResetToken] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);
    try {
      const { data } = await axios.post('/api/auth/login', { email, password });
      setSuccessMessage('Login successful! Redirecting...');
      setTimeout(() => {
        localStorage.setItem('token', data.token);
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
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
      setForgotError(err.response?.data?.message || 'Error requesting OTP');
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
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      width: '100vw',
      margin: 0,
      padding: 0
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
        {/* Header with icon */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '60px',
            height: '60px',
            borderRadius: '1rem',
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            marginBottom: '1rem',
            boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)'
          }}>
            <Heart size={32} color="white" fill="white" />
          </div>
          <h2 style={{ margin: '0 0 0.5rem 0', color: 'white' }}>Welcome Back</h2>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.95rem' }}>
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
                    style={{ 
                      color: '#fca5a5', 
                      background: 'none',
                      border: 'none',
                      textDecoration: 'underline',
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}
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
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="mb-4">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <label htmlFor="password">Password</label>
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#6366f1',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  textDecoration: 'underline',
                  fontWeight: '500',
                  padding: 0
                }}
              >
                Forgot?
              </button>
            </div>
            <input
              id="password"
              type="password"
              placeholder="Your secure password"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '1.5rem' }}
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
          <button type="button" className="btn btn-secondary" style={{ width: '100%' }}>
            Create an Account
          </button>
        </Link>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          backdropFilter: 'blur(5px)'
        }}>
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
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'white' }}>Reset Password</h3>
              </div>
              <button
                onClick={closeForgotPassword}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
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
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: 'white',
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
                  <input
                    id="newPassword"
                    type="password"
                    placeholder="At least 6 characters"
                    className="input-field"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    disabled={forgotLoading}
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <input
                    id="confirmPassword"
                    type="password"
                    placeholder="Re-enter your password"
                    className="input-field"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
