import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Bell, User, Home, FileText, BarChart2, LifeBuoy, LogOut, Menu, X, Brain } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Toast from './Toast';

const navItems = [
  { to: '/home', label: 'Home', icon: <Home size={16} /> },
  { to: '/dashboard', label: 'Dashboard', icon: <Home size={16} /> },
  { to: '/journal', label: 'Journal', icon: <FileText size={16} /> },
  { to: '/insights', label: 'Insights', icon: <BarChart2 size={16} /> },
  { to: '/support', label: 'Support', icon: <LifeBuoy size={16} /> },
];

const Navbar = ({ userName = 'User' }) => {
  const [open, setOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [toast, setToast] = useState(null);
  const [notifPermission, setNotifPermission] = useState(typeof Notification !== 'undefined' ? Notification.permission : 'default');
  const [hasUnread, setHasUnread] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const timersRef = React.useRef([]);
  const navigate = useNavigate();
  const location = useLocation();

  // Inspiration samples
  const inspirationSamples = [
    { title: 'Motivation', body: 'You got this! Small steps every day lead to big change.' },
    { title: 'Healthy Habit', body: 'Drink a glass of water and take a 5-minute walk.' },
    { title: 'Skin Care Tip', body: 'Remember to apply SPF today to protect your skin.' },
    { title: 'Health Reminder', body: 'Take a deep breath — a short break helps your focus.' },
  ];

  const startPeriodicNotifications = () => {
    // Only start if not already running
    const saved = localStorage.getItem('mp_notif_interval');
    if (saved) return;

    const intervalId = setInterval(() => {
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        const sample = inspirationSamples[Math.floor(Math.random() * inspirationSamples.length)];
        try {
          new Notification(sample.title, {
            body: sample.body,
            tag: 'mindpulse-inspiration',
          });
          const item = { id: Date.now(), title: sample.title, body: sample.body, ts: Date.now(), read: false };
          setNotifications((s) => [item, ...s]);
        } catch (err) {
          console.error('Failed to send periodic notification', err);
        }
      }
    }, 5 * 60 * 1000); // 5 minutes

    timersRef.current.push(intervalId);
    localStorage.setItem('mp_notif_interval', String(intervalId));
  };

  // Animated greeting - simple typewriter + fade/slide entrance
  const AnimatedGreeting = ({ userName }) => {
    const [display, setDisplay] = useState('');
    useEffect(() => {
      let mounted = true;
      const full = `Good Evening, ${userName} 👋`;
      let idx = 0;
      let deleting = false;

      const tick = () => {
        if (!mounted) return;
        if (!deleting) {
          idx += 1;
          setDisplay(full.slice(0, idx));
          if (idx === full.length) {
            // pause at end, then start deleting
            setTimeout(() => { deleting = true; tick(); }, 1200);
            return;
          }
        } else {
          idx -= 1;
          setDisplay(full.slice(0, idx));
          if (idx === 0) {
            // pause briefly then start typing again
            deleting = false;
            setTimeout(() => tick(), 400);
            return;
          }
        }
        // typing is a bit slower than deleting for snappier feel
        const delay = deleting ? 28 : 40;
        setTimeout(tick, delay);
      };

      // kick off
      const starter = setTimeout(tick, 260);
      return () => { mounted = false; clearTimeout(starter); };
    }, [userName]);

    return (
      <motion.div
        className="greeting"
        style={{ color: '#fff' }}
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.36, ease: 'easeOut' }}
        aria-live="polite"
      >
        <strong>{display}</strong>
        <span className="greeting-caret" aria-hidden>▍</span>
      </motion.div>
    );
  };

  // Load saved notifications
  useEffect(() => {
    try {
      const saved = localStorage.getItem('mp_notifications');
      if (saved) setNotifications(JSON.parse(saved));
    } catch (e) {
      console.error('Failed to load notifications', e);
    }

    // Start periodic notifications if already granted
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      startPeriodicNotifications();
    }
  }, []);

  useEffect(() => {
    // mark unread indicator if there are unread notifications
    const unread = notifications.some(n => !n.read);
    setHasUnread(unread);
    try { localStorage.setItem('mp_notifications', JSON.stringify(notifications)); } catch (e) {}
  }, [notifications]);

  // cleanup scheduled timers on unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach(id => clearTimeout(id));
      timersRef.current = [];
    };
  }, []);

  const doLogout = () => {
    setToast({ message: 'Logged out — see you soon!', type: 'success' });
    setTimeout(() => {
      localStorage.clear();
      navigate('/login');
    }, 700);
  };

  const initials = (userName || 'U').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

  const showRandomInspiration = () => {
    if (typeof Notification === 'undefined') {
      alert('Browser notifications are not supported in this environment.');
      return;
    }

    const sample = inspirationSamples[Math.floor(Math.random() * inspirationSamples.length)];
    try {
      const notif = new Notification(sample.title, {
        body: sample.body,
        tag: 'mindpulse-inspiration',
      });
      // add to local list
      const item = { id: Date.now(), title: sample.title, body: sample.body, ts: Date.now(), read: false };
      setNotifications((s) => [item, ...s]);
      notif.onclick = () => {
        window.focus();
        notif.close();
        setNotifications((s) => s.map(n => n.id === item.id ? { ...n, read: true } : n));
      };
      // auto-clear unread after a short delay
      setTimeout(() => setNotifications((s) => s.map(n => ({ ...n, read: true }))), 8000);
    } catch (err) {
      console.error('Failed to show notification', err);
    }
  };

  const handleBellToggle = () => {
    setShowNotifications((s) => !s);
    // opening clears the red dot
    setHasUnread(false);
  };

  const handleNotificationsClick = () => {
    if (typeof Notification === 'undefined') {
      setToast({ message: 'Notifications not supported by your browser.', type: 'error' });
      return;
    }

    if (Notification.permission === 'default') {
      Notification.requestPermission().then((permission) => {
        setNotifPermission(permission);
        if (permission === 'granted') {
          showRandomInspiration();
          setToast({ message: 'Notifications enabled — enjoy your daily inspiration!', type: 'success' });
          // Start periodic notifications every 5 minutes
          startPeriodicNotifications();
        } else {
          setToast({ message: 'Notifications blocked. You can enable them in browser settings.', type: 'error' });
        }
      });
      return;
    }

    if (Notification.permission === 'granted') {
      showRandomInspiration();
      return;
    }

    // denied
    setToast({ message: 'Notifications are blocked. Please enable them in your browser settings.', type: 'error' });
  };

  // add immediately
  const addNotification = (title, body) => {
    const item = { id: Date.now(), title, body, ts: Date.now(), read: false };
    setNotifications((s) => [item, ...s]);
    setShowNotifications(true);
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const markRead = (id) => {
    setNotifications((s) => s.map(n => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <header className="site-nav">
      <div className="nav-inner container">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/dashboard" className="logo-container" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }}>
            {!imgError ? (
              <motion.img
                src="/Images/mindpulse-logo.svg"
                alt="MindPulse"
                style={{ height: 40, width: 'auto' }}
                whileHover={{ rotate: 8, scale: 1.06 }}
                transition={{ type: 'spring', stiffness: 360 }}
                onError={() => setImgError(true)}
              />
            ) : (
              <motion.div whileHover={{ rotate: 8, scale: 1.03 }} transition={{ type: 'spring', stiffness: 360 }} style={{ height: 36, width: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }} aria-hidden>
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
            {navItems.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <motion.span
                  key={item.to}
                  whileHover={{ y: -3 }}
                  style={{ display: 'inline-block' }}
                >
                  <Link
                    to={item.to}
                    className={`nav-link ${isActive ? 'active' : ''}`}
                  >
                    {item.icon}
                    <span style={{ marginLeft: 8 }}>{item.label}</span>
                  </Link>
                </motion.span>
              );
            })}
          </nav>
        </div>

        <div className="nav-right">
          <AnimatedGreeting userName={userName} />

          <motion.button className="icon-btn nav-icon" title="Notifications" whileHover={{ scale: 1.06 }} onClick={handleBellToggle} aria-pressed={notifPermission === 'granted'}>
            <Bell />
            <span className="notif-dot" style={{ display: hasUnread ? 'inline-block' : 'none' }} />
          </motion.button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                key="notif-menu"
                initial={{ opacity: 0, y: -12, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.95 }}
                transition={{ duration: 0.2, type: 'spring', stiffness: 300, damping: 20 }}
                style={{ position: 'absolute', right: 16, top: 64, width: 340, zIndex: 2000 }}
              >
                <div className="notif-panel" style={{ overflow: 'hidden' }}>
                  <div className="notif-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>🔔 Notifications</div>
                    <button className="notif-btn notif-btn-secondary" onClick={clearNotifications} style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }} title="Clear all notifications">Clear</button>
                  </div>
                  <div style={{ maxHeight: 360, overflowY: 'auto', scrollBehavior: 'smooth' }}>
                    {notifications.length === 0 ? (
                      <div className="notif-empty">✨ No notifications yet. Stay tuned!</div>
                    ) : (
                      notifications.map((n, idx) => (
                        <motion.div
                          key={n.id}
                          className="notif-item"
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}
                        >
                          <div style={{ flex: 1 }}>
                            <div className="notif-item-title">{n.title}</div>
                            <div className="notif-item-body">{n.body}</div>
                            <div className="notif-item-time">{new Date(n.ts).toLocaleString()}</div>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, justifyContent: 'flex-start' }}>
                            {!n.read && <button className="notif-btn notif-btn-primary" onClick={() => markRead(n.id)} title="Mark as read">✓</button>}
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Compact, theme-matching initial avatar */}
          <motion.button
            className="nav-avatar"
            whileHover={{ scale: 1.06, boxShadow: '0 6px 18px rgba(108,92,231,0.18)' }}
            onClick={() => navigate('/profile')}
            title="Profile"
            aria-label={`Open profile for ${userName}`}
          >
            <span className="nav-avatar-initial">{(userName || 'U').charAt(0).toUpperCase()}</span>
          </motion.button>

          <motion.button className="btn-logout btn-hover" whileHover={{ y: -3, boxShadow: '0 10px 24px rgba(0,0,0,0.08)' }} onClick={doLogout} title="Logout">
            <LogOut size={14} /> Logout
          </motion.button>

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
              {navItems.map((item) => {
                const isActive = location.pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`nav-link mobile ${isActive ? 'active' : ''}`}
                    onClick={() => setOpen(false)}
                  >
                    {item.icon} <span style={{ marginLeft: 10 }}>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </header>
  );
};

export default Navbar;
