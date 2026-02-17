import React from 'react';
import PageWrapper from '../components/PageWrapper';
import { Briefcase, Code, Brain, Palette, ArrowRight, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

const JobCard = ({ title, type, icon: Icon, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay }}
    whileHover={{ y: -8, boxShadow: '0 10px 40px rgba(108, 92, 231, 0.15)' }}
    className="glass-card p-6 flex flex-col h-full border border-transparent hover:border-primary/20 relative overflow-hidden group"
  >
    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
      <Icon size={64} />
    </div>
    
    <div className="mb-4 p-3 bg-primary/10 rounded-xl w-fit text-primary">
      <Icon size={24} color="var(--primary)" />
    </div>
    
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <span className="text-sm font-semibold text-secondary uppercase tracking-wider mb-4 block">{type}</span>
    
    <div className="mt-auto pt-4">
      <a 
        href={`mailto:careers@mindpulse.com?subject=Application for ${title}`}
        className="btn btn-secondary w-full group-hover:bg-primary group-hover:text-white transition-colors flex items-center justify-center gap-2"
      >
        Apply Now <ArrowRight size={16} />
      </a>
    </div>
  </motion.div>
);

const Careers = () => {
  return (
    <PageWrapper title="Careers" description="Join the MindPulse team and help build the future of student mental wellness.">
      <div className="container py-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold mb-6"
          >
            Work on What Matters
          </motion.h1>
          <p className="text-xl text-muted">
            At MindPulse, we believe technology should heal, not harm. We are building tools that improve emotional wellbeing for young people across the world.
          </p>
        </div>

        {/* Why Join Us */}
        <div className="grid md:grid-cols-3 gap-6 mb-20">
          {[
            { title: "Meaningful Work", desc: "Build real-world AI solutions that directly impact student lives." },
            { title: "Growth Culture", desc: "Learn fast, fail fast, and grow fast in a supportive environment." },
            { title: "Flexibility", desc: "Remote-friendly culture that values output over hours." }
          ].map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center p-6"
            >
              <h3 className="text-lg font-bold mb-2">{item.title}</h3>
              <p className="text-muted">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Open Roles */}
        <h2 className="text-center mb-10">Open Opportunities</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <JobCard title="Frontend Intern" type="Internship" icon={Code} delay={0} />
          <JobCard title="ML Engineer" type="Full Time" icon={Brain} delay={0.1} />
          <JobCard title="UI/UX Designer" type="Volunteer" icon={Palette} delay={0.2} />
          <JobCard title="Psychology Advisor" type="Part Time" icon={Briefcase} delay={0.3} />
        </div>

        {/* CTA */}
        <div className="glass-card p-10 text-center max-w-3xl mx-auto bg-gradient-to-r from-primary/5 to-secondary/5">
          <h2 className="mb-4">Don't see a perfect fit?</h2>
          <p className="text-muted mb-8">
            We are always looking for passionate individuals. If you want to contribute to our mission, we'd love to hear from you.
          </p>
          <a href="mailto:careers@mindpulse.com" className="btn btn-primary inline-flex items-center gap-2">
            <Mail size={18} /> Send Open Application
          </a>
        </div>
      </div>
    </PageWrapper>
  );
};

export default Careers;
