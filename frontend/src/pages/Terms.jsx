import React from 'react';
import PageWrapper from '../components/PageWrapper';
import { Shield, Lock, FileText, Scale, AlertCircle, CheckCircle, GraduationCap, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';

const Section = ({ title, icon: Icon, children, delay, ariaLabel }) => (
  <motion.section 
    initial={{ opacity: 0, x: -20 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ delay }}
    className="mb-10 last:mb-0"
    aria-label={ariaLabel}
  >
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2 rounded-lg bg-primary/10 text-primary">
        <Icon size={24} color="var(--primary)" />
      </div>
      <h2 className="text-2xl font-bold m-0">{title}</h2>
    </div>
    <div className="pl-0 md:pl-14 text-muted space-y-3 leading-relaxed">
      {children}
    </div>
  </motion.section>
);

const Terms = () => {
  return (
    <PageWrapper title="Terms & Conditions" description="User agreements and policies for maintaining a safe and supportive community.">
      <Helmet>
        <title>Terms & Conditions | MindPulse</title>
      </Helmet>
      
      <div className="container py-12 max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold mb-4"
          >
            Terms of Service
          </motion.h1>
          <p className="text-xl text-muted">Last updated: February 2026</p>
        </div>

        <div className="glass-card p-8 md:p-12 mb-12">
          <Section title="Introduction" icon={FileText} delay={0.2} ariaLabel="Introduction">
            <p>Welcome to MindPulse. By accessing or using our website and services, you agree to be bound by these Terms and Conditions. Our platform is designed to support student mental wellness through journaling, insights, and AI support.</p>
          </Section>

          <hr className="border-gray-200 dark:border-gray-700 my-8 opacity-50" />

          <Section title="User Responsibilities" icon={Users} delay={0.3} ariaLabel="User Responsibilities">
            <p>As a user of MindPulse, you agree to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Provide accurate information during registration.</li>
              <li>Maintain the confidentiality of your account credentials.</li>
              <li>Use the platform for its intended purpose of personal mental wellness.</li>
              <li>Respect the privacy and rights of other community members.</li>
              <li>Not use the services for any illegal or unauthorized purpose.</li>
            </ul>
          </Section>

          <hr className="border-gray-200 dark:border-gray-700 my-8 opacity-50" />

          <Section title="Intellectual Property" icon={BadgeCheck} delay={0.4} ariaLabel="Intellectual Property">
            <p>The MindPulse platform, including its design, code, and content (excluding user-generated journal entries), is owned by MindPulse and is protected by copyright and intellectual property laws.</p>
          </Section>

          <hr className="border-gray-200 dark:border-gray-700 my-8 opacity-50" />

          <Section title="Limitation of Liability" icon={AlertCircle} delay={0.5} ariaLabel="Limitation of Liability">
            <p>MindPulse is a wellness tool and not a replacement for professional medical advice, diagnosis, or treatment. We are not liable for any actions taken based on the information provided by our AI or platform. In case of emergency, please contact professional services immediately.</p>
          </Section>

          <hr className="border-gray-200 dark:border-gray-700 my-8 opacity-50" />

          <Section title="Contact Information" icon={Scale} delay={0.6} ariaLabel="Contact Information">
            <p>If you have any questions about these Terms, please contact us at:</p>
            <p className="font-medium mt-2">mindpulse1801@gmail.com</p>
          </Section>
        </div>

        {/* Trust Badges */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center"
        >
          <div className="p-6 glass-card flex flex-col items-center">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full text-green-600 dark:text-green-400 mb-4">
              <GraduationCap size={32} />
            </div>
            <h3 className="font-bold text-lg mb-1">Trusted by Students</h3>
            <p className="text-sm text-muted">Designed for academic life</p>
          </div>

          <div className="p-6 glass-card flex flex-col items-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400 mb-4">
              <Lock size={32} />
            </div>
            <h3 className="font-bold text-lg mb-1">Secure Platform</h3>
            <p className="text-sm text-muted">Bank-grade encryption</p>
          </div>

          <div className="p-6 glass-card flex flex-col items-center">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full text-purple-600 dark:text-purple-400 mb-4">
              <Shield size={32} />
            </div>
            <h3 className="font-bold text-lg mb-1">Privacy Protected</h3>
            <p className="text-sm text-muted">Your data stays yours</p>
          </div>
        </motion.div>
      </div>
    </PageWrapper>
  );
};

// Helper component for the BadgeCheck icon as it was not imported
const BadgeCheck = ({ size, color }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke={color || "currentColor"} 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.78 4.78 4 4 0 0 1-6.74 0 4 4 0 0 1-4.78-4.78 4 4 0 0 1 0-6.74Z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

export default Terms;
