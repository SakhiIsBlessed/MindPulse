import React from 'react';
import PageWrapper from '../components/PageWrapper';
import { Users, Target, Heart, Shield, Award, Smile } from 'lucide-react';
import { motion } from 'framer-motion';

const About = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <PageWrapper title="About Us" description="Learn about MindPulse, our mission to support student mental wellness, and the team behind it.">
      <div className="container py-12">
        {/* Hero Section */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <motion.h1 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary"
            style={{ background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
          >
            Empowering Student Minds
          </motion.h1>
          <p className="text-xl text-muted">
            MindPulse is a smart mental wellness platform designed especially for students and youth. We help you understand your emotions, reduce stress, and build healthy habits using AI-powered support.
          </p>
        </div>

        {/* Trust Metrics - "Proof" */}
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {[
            { label: 'Students Helped', value: '10,000+', icon: Users },
            { label: 'Moods Tracked', value: '500K+', icon: Smile },
            { label: 'User Rating', value: '4.9/5', icon: Award },
            { label: 'Privacy Secure', value: '100%', icon: Shield },
          ].map((stat, idx) => (
            <motion.div key={idx} variants={itemVariants} className="glass-card text-center p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-center mb-3 text-primary">
                <stat.icon size={32} color="var(--primary)" />
              </div>
              <h3 className="text-3xl font-bold mb-1" style={{color: 'var(--text-dark)'}}>{stat.value}</h3>
              <p className="text-muted font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-12 mb-20">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass-card p-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <Target size={28} className="text-secondary" color="var(--secondary)" />
              <h2 className="mb-0">Our Mission</h2>
            </div>
            <p className="text-lg leading-relaxed">
              To make mental health support accessible, friendly, and stigma-free for every student. We believe that everyone deserves a safe space to express themselves without judgment.
            </p>
          </motion.div>

          <motion.div 
             initial={{ opacity: 0, x: 50 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
             className="glass-card p-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <Heart size={28} className="text-tertiary" color="var(--tertiary)" />
              <h2 className="mb-0">Our Vision</h2>
            </div>
            <p className="text-lg leading-relaxed">
              We aim to create a future where mental wellness tools are as common as fitness apps. A world where students are emotionally resilient and empowered to handle life's challenges.
            </p>
          </motion.div>
        </div>

        {/* Who It's For & Features */}
        <div className="mb-20">
          <h2 className="text-center mb-10">Why MindPulse Exists</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass-card p-6">
              <h3 className="text-lg font-bold mb-3">For Students</h3>
              <p className="text-muted">Facing academic pressure, exam stress, or loneliness? We're here to listen and help you decompress.</p>
            </div>
            <div className="glass-card p-6">
              <h3 className="text-lg font-bold mb-3">AI Support</h3>
              <p className="text-muted">Our AI emotional assistant provides immediate, stigma-free guidance whenever you need someone to talk to.</p>
            </div>
            <div className="glass-card p-6">
              <h3 className="text-lg font-bold mb-3">Safe Space</h3>
              <p className="text-muted">A completely private digital journal where you can express feelings, track moods, and reflect safely.</p>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="text-center mb-20">
          <h2 className="text-4xl font-bold mb-4">Meet the Minds Behind MindPulse</h2>
          <p className="text-lg text-muted max-w-2xl mx-auto mb-12">
            Our project is developed by a passionate and innovative team dedicated to building impactful technology solutions that enhance user experience and well‑being.
          </p>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {/* Prachi */}
            <motion.div 
              whileHover={{ y: -10 }}
              className="glass-card p-8 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-24 h-24 bg-gradient-to-br from-primary to-violet-600 rounded-full mx-auto mb-6 flex items-center justify-center text-white text-3xl font-bold shadow-xl shadow-primary/20 group-hover:scale-110 transition-transform duration-300">
                PP
              </div>
              <h3 className="text-2xl font-bold mb-1">Prachi Pawar</h3>
              <p className="text-primary font-semibold mb-4 uppercase tracking-wider text-xs">Frontend & UI Specialist</p>
              <p className="text-muted leading-relaxed">
                Responsible for designing intuitive interfaces, premium visual components, and ensuring a smooth, responsive user experience across the platform.
              </p>
            </motion.div>

            {/* Sakhi */}
            <motion.div 
              whileHover={{ y: -10 }}
              className="glass-card p-8 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-24 h-24 bg-gradient-to-br from-secondary to-pink-500 rounded-full mx-auto mb-6 flex items-center justify-center text-white text-3xl font-bold shadow-xl shadow-secondary/20 group-hover:scale-110 transition-transform duration-300">
                ST
              </div>
              <h3 className="text-2xl font-bold mb-1">Sakhi Tapre</h3>
              <p className="text-secondary font-semibold mb-4 uppercase tracking-wider text-xs">Backend & AI Developer</p>
              <p className="text-muted leading-relaxed">
                Handles server logic, API integrations, and AI functionality to ensure the system is intelligent, scalable, and efficient.
              </p>
            </motion.div>

            {/* Aaryan */}
            <motion.div 
              whileHover={{ y: -10 }}
              className="glass-card p-8 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-full mx-auto mb-6 flex items-center justify-center text-white text-3xl font-bold shadow-xl shadow-indigo-500/20 group-hover:scale-110 transition-transform duration-300">
                AP
              </div>
              <h3 className="text-2xl font-bold mb-1">Aaryan Patole</h3>
              <p className="text-indigo-500 font-semibold mb-4 uppercase tracking-wider text-xs">System Architect</p>
              <p className="text-muted leading-relaxed">
                Focuses on application architecture, performance optimization, and implementation of advanced features to make the product reliable and powerful.
              </p>
            </motion.div>
          </div>

          <div className="glass-card p-10 max-w-4xl mx-auto bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/10">
            <h3 className="text-2xl font-bold mb-4">Team Strength</h3>
            <p className="text-lg text-muted leading-relaxed">
              Together, we combine creativity, technical expertise, and problem‑solving skills to deliver a high‑quality solution aimed at improving student wellness through smart technology.
            </p>
          </div>
        </div>

      </div>
    </PageWrapper>
  );
};

export default About;
