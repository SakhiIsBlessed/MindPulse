import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, User, Home, FileText, BarChart2, LifeBuoy, LogOut, Menu, X, Brain } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Toast from './Toast';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: <Home size={16} /> },
  { to: '/journal', label: 'Journal', icon: <FileText size={16} /> },
  { to: '/insights', label: 'Insights', icon: <BarChart2 size={16} /> },
  { to: '/support', label: 'Support', icon: <LifeBuoy size={16} /> },
];

const Navbar = ({ userName = 'Prachi' }) => {
  const [open, setOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const doLogout = () => {
    setToast({ message: 'Logged out — see you soon!', type: 'success' });
    setTimeout(() => {
      localStorage.clear();
      navigate('/login');
    }, 700);
  };

  const initials = (userName || 'U').split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase();

  return (
    <header className="site-nav">
      <div className="nav-inner container">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/dashboard" className="logo-container" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }}>
            {!imgError ? (
              <motion.img
                src="/mindpulse-logo.png"
                alt="MindPulse"
                style={{ height: 36, width: 'auto' }}
                whileHover={{ rotate: 8, scale: 1.08 }}
                transition={{ type: 'spring', stiffness: 400 }}
                onError={() => setImgError(true)}
              />
            ) : (
              <motion.div whileHover={{ rotate: 8, scale: 1.03 }} transition={{ type: 'spring', stiffness: 400 }} style={{ height: 36, width: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }} aria-hidden>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="MindPulse logo">
                  <defs>
                    <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#6c5ce7" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                  <path d="M12 2C8.134 2 5 5.134 5 9c0 3.866 3.134 7 7 7s7-3.134 7-7c0-3.866-3.134-7-7-7z" fill="url(#g1)" opacity="0.95" />
                  <path d="M8.5 12.5c.7.7 2.5.7 3.2 0 .7-.7.7-2.5 0-3.2-.7-.7-2.5-.7-3.2 0-.7.7-.7 2.5 0 3.2z" fill="#fff" opacity="0.95" />
                </svg>
              </motion.div>
            )}
            <div className="logo" style={{ fontWeight: 800, fontSize: '1.15rem', background: 'linear-gradient(135deg, #6c5ce7, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', margin: 0, letterSpacing: '-0.5px' }}>MindPulse</div>
          </Link>

          <nav className="nav-links" aria-label="Primary navigation">
            {navItems.map((item) => (
              <motion.span key={item.to} whileHover={{ y: -3 }} style={{ display: 'inline-block' }}>
                <Link to={item.to} className="nav-link">{item.icon} <span style={{ marginLeft: 8 }}>{item.label}</span></Link>
              </motion.span>
            ))}
          </nav>
        </div>

        <div className="nav-right">
          <motion.div className="welcome" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
            Good Evening, <strong>{userName}</strong> <span className="wave">👋</span>
          </motion.div>

          <motion.button className="icon-btn" title="Notifications" whileHover={{ scale: 1.06 }} onClick={() => alert('No notifications yet')}>
            <Bell />
            <span className="notif-dot" />
          </motion.button>

          <motion.div className="avatar" whileHover={{ scale: 1.05 }} onClick={() => navigate('/profile')} title="Profile">
            <div className="avatar-initials">{initials}</div>
          </motion.div>

          <button className="btn-logout" onClick={doLogout} title="Logout">
            <LogOut size={14} /> Logout
          </button>

          {/* Mobile menu toggle */}
          <button className="icon-btn nav-toggle" onClick={() => setOpen(s => !s)} aria-label="Toggle menu">
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile menu drawer */}
      <AnimatePresence>
        {open && (
          <motion.div className="mobile-drawer" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }}>
            <div className="container" style={{ padding: '0.75rem 1rem' }}>
              {navItems.map((item) => (
                <Link key={item.to} to={item.to} className="nav-link mobile" onClick={() => setOpen(false)}>
                  {item.icon} <span style={{ marginLeft: 10 }}>{item.label}</span>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </header>
  );
};

export default Navbar;
