import React from 'react';
import PageWrapper from '../components/PageWrapper';
import { Shield, Lock, Eye, Database, FileText, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const Section = ({ title, icon: Icon, children, delay }) => (
  <motion.div 
    initial={{ opacity: 0, x: -20 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ delay }}
    className="mb-10 last:mb-0"
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
  </motion.div>
);

const PrivacyPolicy = () => {
  return (
    <PageWrapper title="Privacy Policy" description="How MindPulse collects, uses, and protects your personal data.">
      <div className="container py-12 max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold mb-4"
          >
            Your Privacy Matters
          </motion.h1>
          <p className="text-xl text-muted">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        {/* Trust Summary Block */}
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-card bg-gradient-to-br from-green-500/5 to-emerald-500/5 border-green-500/20 p-8 mb-12"
        >
          <h3 className="flex items-center gap-2 text-green-600 dark:text-green-400 font-bold text-xl mb-4">
            <CheckCircle size={24} /> The MindPulse Promise
          </h3>
          <p className="text-lg font-medium mb-0">
            We never sell your data. Ever. Your emotional wellbeing is personal, and your data belongs to you. We use industry-standard encryption to keep it safe.
          </p>
        </motion.div>

        <div className="glass-card p-8 md:p-12">
          <Section title="Information We Collect" icon={Database} delay={0.3}>
            <p>We collect only what is necessary to provide you with a personalized experience:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Account details:</strong> Username and email address for authentication.</li>
              <li><strong>Journal entries:</strong> Your personal thoughts (encrypted).</li>
              <li><strong>Mood scores:</strong> To generating insights and tracking progress.</li>
              <li><strong>Emergency contacts:</strong> Only if you choose to add them.</li>
            </ul>
          </Section>

          <hr className="border-gray-200 dark:border-gray-700 my-8 opacity-50" />

          <Section title="How We Use Your Data" icon={Eye} delay={0.4}>
            <p>Your data is used exclusively to improve your mental wellness journey:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Providing personalized emotional support via our AI.</li>
              <li>Generating mood trends and insights for your dashboard.</li>
              <li>Improving app performance and features.</li>
            </ul>
          </Section>

          <hr className="border-gray-200 dark:border-gray-700 my-8 opacity-50" />

          <Section title="Data Protection" icon={Lock} delay={0.5}>
            <p>
              Security is our top priority. We implement robust security measures including SSL encryption and secure database storage to protect your personal information from unauthorized access, alteration, or disclosure.
            </p>
          </Section>

          <hr className="border-gray-200 dark:border-gray-700 my-8 opacity-50" />

          <Section title="Your Rights" icon={FileText} delay={0.6}>
            <p>You have full control over your data:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>You can request a copy of your data at any time.</li>
              <li>You can edit or delete your journal entries.</li>
              <li>You can delete your account permanently, wiping all data from our servers.</li>
            </ul>
          </Section>
        </div>

        <div className="mt-12 text-center text-muted text-sm">
          <p>
            MindPulse is a support tool, not a medical replacement. <br/>
            If you are in crisis, please contact professional services immediately.
          </p>
        </div>
      </div>
    </PageWrapper>
  );
};

export default PrivacyPolicy;
