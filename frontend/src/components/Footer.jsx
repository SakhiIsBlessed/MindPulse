import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Github, Phone, Linkedin, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import './Footer.css';

const socialIcons = [
  { icon: Linkedin, href: 'https://www.linkedin.com', label: 'LinkedIn' },
  { icon: Github, href: 'https://github.com', label: 'GitHub' }
];

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email.trim() || loading) return;

    setLoading(true);
    setError('');
    setStatusMessage('');

    // use explicit backend host in development so absolute URL works
    const baseUrl = import.meta.env.DEV ? 'http://localhost:5000' : '';
    const url = `${baseUrl}/api/subscribe`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      let data = null;
      // parse JSON if available
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        try {
          data = await response.json();
        } catch (parseErr) {
          console.warn('Failed to parse JSON response from subscribe endpoint', parseErr);
        }
      }

      if (response.ok) {
        setSubscribed(true);
        setEmail('');

        const delivery = data?.emailDelivery;
        // Prioritize "already subscribed" message if it exists
        if (data?.message && (data.message.toLowerCase().includes('already') || data.message.toLowerCase().includes('welcome back'))) {
          setStatusMessage(data.message);
        } else if (delivery?.delivered && Array.isArray(delivery.accepted) && delivery.accepted.length > 0) {
          setStatusMessage(`Confirmation email sent to ${delivery.accepted[0]}. Please check inbox/spam.`);
        } else {
          setStatusMessage(data?.message || 'Subscribed successfully.');
        }

        setTimeout(() => setSubscribed(false), 3000);
      } else {
        if (data) {
          const delivery = data.emailDelivery;
          if (delivery && Array.isArray(delivery.rejected) && delivery.rejected.length > 0) {
            setError(`Subscription saved, but email was rejected for: ${delivery.rejected.join(', ')}`);
          } else {
            setError(data.message || 'Something went wrong');
          }
        } else {
          setError(`Server responded with status ${response.status}`);
        }
      }
    } catch (err) {
      // network error or other failure
      setError('Unable to contact subscription service. Please try again later.');
      console.error('subscribe fetch error', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="site-footer site-footer--premium" role="contentinfo">
      <div className="footer-panel">
        <div className="footer-grid container">
          <motion.div className="col footer-brand" initial={{ opacity: 0, y: 6 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="brand-top">
              <Link to="/home" className="brand-link" aria-label="MindPulse home">
                <img src="/Images/mindpulse-logo.svg" alt="MindPulse" className="footer-logo" />
                <div className="footer-title">MindPulse</div>
              </Link>
            </div>

            <p className="footer-desc">Mindful journaling & insights to track mood, build healthy habits, and improve wellbeing.</p>

            <div className="footer-contact">
              <a href="https://mail.google.com/mail/?view=cm&fs=1&to=mindpulse1801@gmail.com" target="_blank" rel="noopener noreferrer" className="contact-link"><Mail size={18} /><span>mindpulse1801@gmail.com</span></a>
              <a href="tel:+918530932462" className="contact-link"><Phone size={18} /><span>+91 85309 32462</span></a>
            </div>

            <div className="footer-social" aria-label="Social links">
              {socialIcons.map((s, i) => {
                const Icon = s.icon;
                return (
                  <a key={i} href={s.href} target="_blank" rel="noreferrer" className="social-btn" aria-label={s.label}>
                    <Icon size={18} />
                  </a>
                );
              })}
            </div>
          </motion.div>

          <motion.div className="col footer-nav-columns" initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="nav-column">
              <h4 className="footer-section-title">Product</h4>
              <nav className="footer-nav" aria-label="product">
                {['Home','Dashboard','Journal','Insights','Habits','Wellness','Support'].map((item, idx) => (
                  <Link key={idx} to={`/${item.toLowerCase()}`} className="footer-link">
                    <span>{item}</span>
                    <span className="underline" />
                  </Link>
                ))}
              </nav>
            </div>

            <div className="nav-column">
              <h4 className="footer-section-title">Company</h4>
              <nav className="footer-nav" aria-label="company">
                {[{ name: 'About', href: '/about' }, { name: 'Careers', href: '/careers' }, { name: 'Privacy', href: '/privacy' }].map((it, i) => (
                  <Link key={i} to={it.href} className="footer-link">
                    <span>{it.name}</span>
                    <span className="underline" />
                  </Link>
                ))}
              </nav>
            </div>
          </motion.div>

          <motion.div className="col footer-newsletter" initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h4 className="footer-section-title">Stay in touch</h4>
            <p className="newsletter-desc">Get tips, product updates, and helpful reminders — no spam.</p>

            <form className="newsletter-form" onSubmit={handleSubscribe} aria-label="Subscribe form">
              <label className="visually-hidden" htmlFor="mp-email">Email address</label>
              <input id="mp-email" aria-label="Email" placeholder="Your email" className="footer-input" value={email} onChange={(e) => setEmail(e.target.value)} type="email" disabled={loading} />
              <button className="btn subscribe-btn" type="submit" aria-pressed={subscribed} disabled={loading}>
                {loading ? 'Subscribing...' : (subscribed ? '✓ Subscribed' : (<span className="btn-inner"><Send size={14} /> Subscribe</span>))}
              </button>
            </form>
            {error && <p className="subscribe-error" style={{ color: '#f87171', fontSize: '12px', marginTop: '8px' }}>{error}</p>}
            {statusMessage && <p className="subscribe-status" style={{ color: '#86efac', fontSize: '12px', marginTop: '8px' }}>{statusMessage}</p>}

            <div className="footer-note">We respect your privacy. Unsubscribe anytime.</div>
          </motion.div>
        </div>

        <div className="footer-divider" aria-hidden />

        <div className="footer-bottom container">
          <small>© {new Date().getFullYear()} MindPulse • Built with ❤️ to support student mental wellness.</small>
          <div className="footer-links-inline">
            <Link to="/privacy">Privacy</Link>
            <span className="sep">•</span>
            <Link to="/terms">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

