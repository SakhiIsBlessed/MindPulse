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

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setTimeout(() => {
      setEmail('');
      setSubscribed(false);
    }, 1600);
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
              <a href="mailto:mindpulse1801@gmail.com" className="contact-link"><Mail size={18} /><span>mindpulse1801@gmail.com</span></a>
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
                {['Dashboard','Journal','Insights','Support'].map((item, idx) => (
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
                {[{ name: 'About', href: '/#about' }, { name: 'Careers', href: '/#careers' }, { name: 'Privacy', href: '/#privacy' }].map((it, i) => (
                  <a key={i} href={it.href} className="footer-link">
                    <span>{it.name}</span>
                    <span className="underline" />
                  </a>
                ))}
              </nav>
            </div>
          </motion.div>

          <motion.div className="col footer-newsletter" initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h4 className="footer-section-title">Stay in touch</h4>
            <p className="newsletter-desc">Get tips, product updates, and helpful reminders — no spam.</p>

            <form className="newsletter-form" onSubmit={handleSubscribe} aria-label="Subscribe form">
              <label className="visually-hidden" htmlFor="mp-email">Email address</label>
              <input id="mp-email" aria-label="Email" placeholder="Your email" className="footer-input" value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
              <button className="btn subscribe-btn" type="submit" aria-pressed={subscribed}>
                {subscribed ? '✓ Subscribed' : (<span className="btn-inner"><Send size={14} /> Subscribe</span>)}
              </button>
            </form>

            <div className="footer-note">We respect your privacy. Unsubscribe anytime.</div>
          </motion.div>
        </div>

        <div className="footer-divider" aria-hidden />

        <div className="footer-bottom container">
          <small>© {new Date().getFullYear()} MindPulse — All rights reserved.</small>
          <div className="footer-links-inline">
            <a href="/#privacy">Privacy</a>
            <span className="sep">•</span>
            <a href="/#terms">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

