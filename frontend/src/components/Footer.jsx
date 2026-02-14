import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Twitter, Github, Phone } from 'lucide-react';
import './Footer.css';

const Footer = () => (
  <footer className="site-footer site-footer--dark">
    <div className="footer-inner container">
      <div className="footer-brand">
        <Link to="/dashboard" className="logo-container">
          <div className="footer-logo" aria-hidden />
          <div className="footer-title">MindPulse</div>
        </Link>
        <p className="footer-desc">Mindful journaling & insights to help you track mood, build healthy habits, and improve wellbeing.</p>
        <div className="footer-contact">
          <a href="mindpulse1801@gmail.com" className="footer-contact-item"><Mail /> mindpulse1801@gmail.com</a>
          <a href="tel:+91 8530932462" className="footer-contact-item"><Phone /> +91 8530932462</a>
        </div>
        <div className="footer-social">
          <a href="https://twitter.com" target="_blank" rel="noreferrer" className="icon-btn"><Twitter /></a>
          <a href="https://github.com" target="_blank" rel="noreferrer" className="icon-btn"><Github /></a>
        </div>
      </div>

      <div className="footer-links">
        <div>
          <h4>Product</h4>
          <nav>
            <Link to="/dashboard" className="nav-link">Dashboard</Link>
            <Link to="/journal" className="nav-link">Journal</Link>
            <Link to="/insights" className="nav-link">Insights</Link>
            <Link to="/support" className="nav-link">Support</Link>
          </nav>
        </div>

        <div>
          <h4>Company</h4>
          <nav>
            <a href="/#about" className="nav-link">About</a>
            <a href="/#careers" className="nav-link">Careers</a>
            <a href="/#privacy" className="nav-link">Privacy</a>
          </nav>
        </div>

        <div className="footer-newsletter">
          <h4>Stay in touch</h4>
          <p className="text-muted" style={{ marginTop: 6 }}>Get quick tips and product updates — no spam.</p>
          <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
            <input aria-label="Email" placeholder="Your email" className="input-field footer-input" />
            <button className="btn btn-primary footer-cta" type="submit">Subscribe</button>
          </form>
        </div>
      </div>
    </div>

    <div className="footer-bottom">
      <div className="container footer-bottom-inner">
        <small>© {new Date().getFullYear()} MindPulse — All rights reserved.</small>
        <div className="footer-bottom-links">Built with <span style={{ color: '#ff6b6b' }}>♥</span> • <a href="/#privacy" className="nav-link">Privacy</a> • <a href="/#terms" className="nav-link">Terms</a></div>
      </div>
    </div>
  </footer>
);

export default Footer;
