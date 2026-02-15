import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Github, Phone, Linkedin, Heart, Send, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import './Footer.css';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setTimeout(() => {
        setEmail('');
        setSubscribed(false);
      }, 2000);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  };

  const socialIcons = [
    { icon: Linkedin, href: 'https://www.linkedin.com/in/prachi-pawar-34156930a/', label: 'LinkedIn' },
    { icon: Github, href: 'https://github.com/PrachiPawar018', label: 'GitHub' },
  ];

  return (
    <footer className="site-footer site-footer--dark">
      {/* Animated background gradient */}
      <motion.div
        animate={{
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 4, repeat: Infinity }}
        className="footer-bg-glow"
      />

      <div className="footer-inner container">
        {/* BRAND SECTION */}
        <motion.div
          className="footer-brand"
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link to="/home" className="logo-container brand-link">
              <motion.div
                className="footer-logo"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                aria-hidden
              />
              <div className="footer-title">MindPulse</div>
            </Link>
          </motion.div>

          <motion.p
            className="footer-desc"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            viewport={{ once: true }}
          >
            Mindful journaling & insights to help you track mood, build healthy habits, and improve wellbeing.
          </motion.p>

          {/* Contact Info */}
          <motion.div
            className="footer-contact"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.a
              href="mailto:mindpulse1801@gmail.com"
              className="footer-contact-item contact-link"
              variants={itemVariants}
              whileHover={{ x: 4 }}
            >
              <Mail size={18} />
              <span>mindpulse1801@gmail.com</span>
            </motion.a>
            <motion.a
              href="tel:+918530932462"
              className="footer-contact-item contact-link"
              variants={itemVariants}
              whileHover={{ x: 4 }}
            >
              <Phone size={18} />
              <span>+91 8530932462</span>
            </motion.a>
          </motion.div>

          {/* Social Links */}
          <motion.div
            className="footer-social"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {socialIcons.map((social, idx) => {
              const IconComponent = social.icon;
              return (
                <motion.a
                  key={idx}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  className="icon-btn social-icon"
                  variants={itemVariants}
                  whileHover={{
                    scale: 1.15,
                    y: -4,
                  }}
                  whileTap={{ scale: 0.9 }}
                  title={social.label}
                >
                  <IconComponent size={20} />
                </motion.a>
              );
            })}
          </motion.div>
        </motion.div>

        {/* LINKS SECTION */}
        <motion.div
          className="footer-links"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {/* Product Links */}
          <motion.div variants={itemVariants}>
            <h4 className="footer-section-title">Product</h4>
            <nav className="footer-nav">
              {['Dashboard', 'Journal', 'Insights', 'Support'].map((item, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ x: 6 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                >
                  <Link
                    to={`/${item.toLowerCase()}`}
                    className="nav-link footer-nav-link"
                  >
                    <span>{item}</span>
                    <span className="link-underline" />
                  </Link>
                </motion.div>
              ))}
            </nav>
          </motion.div>

          {/* Company Links */}
          <motion.div variants={itemVariants}>
            <h4 className="footer-section-title">Company</h4>
            <nav className="footer-nav">
              {[
                { name: 'About', href: '/#about' },
                { name: 'Careers', href: '/#careers' },
                { name: 'Privacy', href: '/#privacy' },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ x: 6 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                >
                  <a href={item.href} className="nav-link footer-nav-link">
                    <span>{item.name}</span>
                    <span className="link-underline" />
                  </a>
                </motion.div>
              ))}
            </nav>
          </motion.div>

          {/* Newsletter */}
          <motion.div className="footer-newsletter" variants={itemVariants}>
            <h4 className="footer-section-title">Stay In Touch</h4>
            <p className="newsletter-desc">Get quick tips and product updates — no spam.</p>

            <motion.form
              className="newsletter-form"
              onSubmit={handleSubscribe}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              viewport={{ once: true }}
            >
              <motion.div
                className="newsletter-input-wrapper"
                whileFocus={{ scale: 1.02 }}
              >
                <input
                  aria-label="Email"
                  placeholder="Your email"
                  className="input-field footer-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                />
              </motion.div>

              <motion.button
                className="btn btn-primary footer-cta subscribe-btn"
                type="submit"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
              >
                {subscribed ? (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    ✓ Done!
                  </motion.span>
                ) : (
                  <motion.div
                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                    whileHover={{ gap: '0.6rem' }}
                  >
                    <Send size={16} />
                    <span>Subscribe</span>
                  </motion.div>
                )}
              </motion.button>
            </motion.form>
          </motion.div>
        </motion.div>
      </div>

      {/* FOOTER BOTTOM */}
      <motion.div
        className="footer-bottom"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
      >
        <div className="container footer-bottom-inner">
          <motion.small whileHover={{ scale: 1.05 }}>
            © {new Date().getFullYear()} MindPulse — All rights reserved.
          </motion.small>

          <motion.div className="footer-bottom-links">
            Built with{' '}
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{
                display: 'inline-block',
                color: '#ff6b6b',
                margin: '0 0.3rem',
              }}
            >
              ♥
            </motion.span>{' '}
            •{' '}
            <motion.a
              href="/#privacy"
              className="nav-link"
              whileHover={{ x: 2 }}
            >
              Privacy
            </motion.a>{' '}
            •{' '}
            <motion.a
              href="/#terms"
              className="nav-link"
              whileHover={{ x: 2 }}
            >
              Terms
            </motion.a>
          </motion.div>
        </div>
      </motion.div>
    </footer>
  );
};

export default Footer;
