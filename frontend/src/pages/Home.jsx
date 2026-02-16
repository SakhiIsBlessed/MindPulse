import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, BookOpen, Brain, TrendingUp, Sparkles, ArrowRight, Zap, Shield, Users, CheckCircle, Music, MessageSquare, Lightbulb, Award, Smile, Lock } from "lucide-react";

// Counter animation component
const AnimatedCounter = ({ value, suffix = "" }) => {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        let current = 0;
        const increment = value / 50;
        const timer = setInterval(() => {
            current += increment;
            if (current >= value) {
                setDisplayValue(value);
                clearInterval(timer);
            } else {
                setDisplayValue(Math.floor(current));
            }
        }, 20);
        return () => clearInterval(timer);
    }, [value]);

    return <span>{displayValue}{suffix}</span>;
};

const Home = () => {
    const navigate = useNavigate();

    // Stagger animation for feature cards
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
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: "easeOut" },
        },
    };

    // Floating animation
    const floatingVariants = {
        animate: {
            y: [0, -12, 0],
            transition: {
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
            },
        },
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                background: "linear-gradient(135deg, #eef2ff 0%, #f8fafc 50%, #f0f4ff 100%)",
                padding: "2rem",
                overflow: "hidden",
                position: "relative",
            }}
        >
            {/* Animated background elements */}
            <motion.div
                animate={{
                    opacity: [0.1, 0.2, 0.1],
                }}
                transition={{ duration: 4, repeat: Infinity }}
                style={{
                    position: "absolute",
                    top: "10%",
                    right: "5%",
                    width: "300px",
                    height: "300px",
                    background: "radial-gradient(circle, #8b5cf6 0%, transparent 70%)",
                    borderRadius: "50%",
                    filter: "blur(60px)",
                    zIndex: 0,
                }}
            />
            <motion.div
                animate={{
                    opacity: [0.15, 0.25, 0.15],
                }}
                transition={{ duration: 5, repeat: Infinity, delay: 1 }}
                style={{
                    position: "absolute",
                    bottom: "10%",
                    left: "5%",
                    width: "250px",
                    height: "250px",
                    background: "radial-gradient(circle, #06b6d4 0%, transparent 70%)",
                    borderRadius: "50%",
                    filter: "blur(50px)",
                    zIndex: 0,
                }}
            />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                style={{ maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 1 }}
            >
                {/* HERO SECTION */}
                <motion.div
                    className="glass-card"
                    style={{
                        textAlign: "center",
                        padding: "4rem 2rem",
                        marginBottom: "3rem",
                        background: "radial-gradient(ellipse at center, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)",
                        backdropFilter: "blur(10px)",
                        border: "1px solid rgba(255,255,255,0.5)",
                    }}
                    whileHover={{ scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                    <motion.div
                        animate={{ opacity: [1, 0.8, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        style={{ display: "inline-block", marginBottom: "1rem" }}
                    >
                        <Sparkles size={40} color="var(--primary)" />
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1, duration: 0.6 }}
                        style={{
                            fontSize: "3.5rem",
                            marginBottom: "0.5rem",
                            fontWeight: 800,
                            background: "linear-gradient(135deg, #6c5ce7 0%, #8b5cf6 100%)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text",
                        }}
                    >
                        MindPulse
                    </motion.h1>

                    <motion.h2
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15, duration: 0.6 }}
                        style={{
                            fontSize: "1.3rem",
                            marginBottom: "1.5rem",
                            color: "var(--text-dark)",
                            fontWeight: 600,
                        }}
                    >
                        Your AI-Powered Mental Wellness Companion
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                        style={{
                            color: "var(--text-muted)",
                            maxWidth: "700px",
                            margin: "0 auto 2.5rem",
                            lineHeight: 1.8,
                            fontSize: "1.05rem",
                        }}
                    >
                        Track your emotional journey with intelligent insights. Journal privately, understand patterns, and grow with personalized AI guidance. Built for emotional clarity and mental wellness.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25, duration: 0.6 }}
                        style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}
                    >
                        <motion.button
                            className="btn btn-primary"
                            onClick={() => navigate("/dashboard")}
                            whileHover={{ scale: 1.05, boxShadow: "0 12px 40px rgba(108, 92, 231, 0.3)" }}
                            whileTap={{ scale: 0.98 }}
                            style={{
                                padding: "0.9rem 2rem",
                                fontSize: "1rem",
                                fontWeight: 600,
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                            }}
                        >
                            Go to Dashboard <ArrowRight size={18} />
                        </motion.button>

                        <motion.button
                            className="btn btn-secondary"
                            onClick={() => navigate("/journal")}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.98 }}
                            style={{
                                padding: "0.9rem 2rem",
                                fontSize: "1rem",
                                fontWeight: 600,
                            }}
                        >
                            Start Journaling
                        </motion.button>
                    </motion.div>
                </motion.div>

                {/* STATS SECTION */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                        gap: "1.5rem",
                        marginBottom: "3rem",
                    }}
                >
                    {[
                        { label: "Users Supported", value: 5000, suffix: "+" },
                        { label: "Entries Created", value: 50000, suffix: "+" },
                        { label: "Insights Generated", value: 100000, suffix: "+" },
                        { label: "Mental Health Improvements", value: 92, suffix: "%" },
                    ].map((stat, index) => (
                        <motion.div
                            key={index}
                            variants={itemVariants}
                            className="glass-card"
                            whileHover={{ y: -8, boxShadow: "0 20px 50px rgba(108, 92, 231, 0.2)" }}
                            style={{
                                padding: "2rem",
                                textAlign: "center",
                                background: "rgba(255, 255, 255, 0.9)",
                                backdropFilter: "blur(10px)",
                                border: "1px solid rgba(108, 92, 231, 0.1)",
                            }}
                        >
                            <div
                                style={{
                                    fontSize: "2.5rem",
                                    fontWeight: 800,
                                    background: "linear-gradient(135deg, #6c5ce7 0%, #8b5cf6 100%)",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                    backgroundClip: "text",
                                    marginBottom: "0.5rem",
                                }}
                            >
                                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                            </div>
                            <p style={{ color: "var(--text-muted)", fontWeight: 500 }}>
                                {stat.label}
                            </p>
                        </motion.div>
                    ))}
                </motion.div>

                {/* FEATURES SECTION */}
                <motion.div
                    style={{
                        marginBottom: "3rem",
                    }}
                >
                    <motion.h2
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.6 }}
                        style={{
                            textAlign: "center",
                            fontSize: "2rem",
                            marginBottom: "2.5rem",
                            fontWeight: 700,
                        }}
                    >
                        Powerful Features for Your Wellness
                    </motion.h2>

                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                            gap: "2rem",
                        }}
                    >
                        {[
                            {
                                icon: <Heart size={32} />,
                                title: "Mood Tracking",
                                text: "Record daily emotions with beautiful visualizations and discover patterns in your emotional state.",
                                color: "#ff6b6b",
                            },
                            {
                                icon: <BookOpen size={32} />,
                                title: "Private Journaling",
                                text: "Safe, encrypted space to express thoughts and feelings freely with rich text formatting.",
                                color: "#4ecdc4",
                            },
                            {
                                icon: <Brain size={32} />,
                                title: "AI-Powered Insights",
                                text: "Get intelligent analysis of your emotional patterns, triggers, and trends with personalized recommendations.",
                                color: "#8b5cf6",
                            },
                            {
                                icon: <TrendingUp size={32} />,
                                title: "Progress Tracking",
                                text: "Visualize your mental health journey with interactive charts and meaningful statistics.",
                                color: "#06b6d4",
                            },
                            {
                                icon: <Music size={32} />,
                                title: "Music Therapy",
                                text: "Share and discover healing music tailored to your emotional wellness journey.",
                                color: "#ec4899",
                            },
                            {
                                icon: <MessageSquare size={32} />,
                                title: "AI Chatbot Support",
                                text: "24/7 intelligent companion offering emotional support, coping strategies, and wellness guidance.",
                                color: "#f59e0b",
                            },
                            {
                                icon: <Zap size={32} />,
                                title: "Quick Check-ins",
                                text: "Fast mood logging with just a few seconds of your time - perfect for busy days.",
                                color: "#fbbf24",
                            },
                            {
                                icon: <Shield size={32} />,
                                title: "Privacy First",
                                text: "Your data is encrypted, secured with industry standards, and completely private.",
                                color: "#34d399",
                            },
                            {
                                icon: <Lightbulb size={32} />,
                                title: "Personalized Insights",
                                text: "Receive actionable tips and wellness suggestions based on your unique emotional profile.",
                                color: "#a78bfa",
                            },
                        ].map((feature, index) => (
                            <motion.div
                                key={index}
                                variants={itemVariants}
                                whileHover={{
                                    y: -12,
                                    boxShadow: "0 25px 60px rgba(108, 92, 231, 0.15)",
                                }}
                                className="glass-card"
                                style={{
                                    padding: "2rem",
                                    textAlign: "center",
                                    borderRadius: "1.5rem",
                                    background: "rgba(255, 255, 255, 0.95)",
                                    backdropFilter: "blur(10px)",
                                    border: "1px solid rgba(255, 255, 255, 0.7)",
                                    position: "relative",
                                    overflow: "hidden",
                                }}
                            >
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                    style={{
                                        position: "absolute",
                                        top: 0,
                                        right: 0,
                                        width: "100px",
                                        height: "100px",
                                        background: `linear-gradient(135deg, ${feature.color}20 0%, transparent 70%)`,
                                        borderRadius: "50%",
                                        filter: "blur(20px)",
                                    }}
                                />

                                <motion.div
                                    animate={{ y: [0, -8, 0] }}
                                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                                    style={{
                                        width: "65px",
                                        height: "65px",
                                        margin: "0 auto 1.5rem",
                                        borderRadius: "14px",
                                        background: `linear-gradient(135deg, ${feature.color}30 0%, ${feature.color}10 100%)`,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        color: feature.color,
                                        position: "relative",
                                        zIndex: 1,
                                    }}
                                >
                                    {feature.icon}
                                </motion.div>

                                <h3
                                    style={{
                                        marginBottom: "0.8rem",
                                        fontWeight: 700,
                                        fontSize: "1.1rem",
                                        position: "relative",
                                        zIndex: 1,
                                    }}
                                >
                                    {feature.title}
                                </h3>
                                <p
                                    style={{
                                        color: "var(--text-muted)",
                                        fontSize: "0.95rem",
                                        lineHeight: 1.6,
                                        position: "relative",
                                        zIndex: 1,
                                    }}
                                >
                                    {feature.text}
                                </p>
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.div>

                {/* WHY CHOOSE US SECTION */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="glass-card"
                    style={{
                        padding: "3rem 2rem",
                        marginBottom: "3rem",
                        background: "linear-gradient(135deg, rgba(108, 92, 231, 0.95) 0%, rgba(139, 92, 246, 0.95) 100%)",
                        color: "white",
                        textAlign: "center",
                        borderRadius: "2rem",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                    }}
                >
                    <h2 style={{ fontSize: "2rem", marginBottom: "2rem", fontWeight: 700 }}>
                        Why Choose MindPulse?
                    </h2>

                    <motion.div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                            gap: "2rem",
                            marginBottom: "2rem",
                        }}
                    >
                        {[
                            {
                                title: "AI-Powered Analysis",
                                desc: "Advanced algorithms understand your emotional patterns",
                            },
                            {
                                title: "100% Private & Secure",
                                desc: "End-to-end encryption for all your personal data",
                            },
                            {
                                title: "Beautiful Interface",
                                desc: "Intuitive design that makes wellness tracking enjoyable",
                            },
                            {
                                title: "24/7 Support",
                                desc: "Always here to help with your mental wellness journey",
                            },
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ scale: 1.05 }}
                                style={{
                                    padding: "1.5rem",
                                    background: "rgba(255, 255, 255, 0.1)",
                                    backdropFilter: "blur(10px)",
                                    borderRadius: "1rem",
                                    border: "1px solid rgba(255, 255, 255, 0.2)",
                                }}
                            >
                                <CheckCircle
                                    size={28}
                                    style={{ margin: "0 auto 1rem", display: "block" }}
                                />
                                <h4 style={{ marginBottom: "0.5rem", fontWeight: 700 }}>
                                    {item.title}
                                </h4>
                                <p style={{ opacity: 0.9, fontSize: "0.95rem" }}>{item.desc}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.div>

                {/* CTA SECTION */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="glass-card"
                    style={{
                        padding: "3rem 2rem",
                        textAlign: "center",
                        background: "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)",
                        borderRadius: "2rem",
                        border: "2px solid rgba(108, 92, 231, 0.2)",
                        marginBottom: "3rem",
                    }}
                >
                    <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        style={{ marginBottom: "1.5rem" }}
                    >
                        <Heart size={48} color="var(--primary)" />
                    </motion.div>

                    <h2 style={{ marginBottom: "1rem", fontSize: "2rem", fontWeight: 700 }}>
                        Start Your Wellness Journey Today
                    </h2>

                    <p
                        style={{
                            color: "var(--text-muted)",
                            maxWidth: "650px",
                            margin: "0 auto 2rem",
                            fontSize: "1.05rem",
                            lineHeight: 1.7,
                        }}
                    >
                        Join thousands of users who are taking control of their mental health with MindPulse. Small daily reflections create meaningful, lasting change.
                    </p>

                    <motion.button
                        className="btn btn-primary"
                        onClick={() => navigate("/dashboard")}
                        whileHover={{ scale: 1.08, boxShadow: "0 15px 50px rgba(108, 92, 231, 0.4)" }}
                        whileTap={{ scale: 0.96 }}
                        style={{
                            padding: "1rem 2.5rem",
                            fontSize: "1.1rem",
                            fontWeight: 700,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.7rem",
                        }}
                    >
                        <Sparkles size={20} />
                        Begin Your Journey Now
                    </motion.button>
                </motion.div>

                {/* HOW IT WORKS SECTION */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    style={{ marginBottom: "3rem" }}
                >
                    <motion.h2
                        style={{
                            textAlign: "center",
                            fontSize: "2rem",
                            marginBottom: "3rem",
                            fontWeight: 700,
                        }}
                    >
                        How MindPulse Works
                    </motion.h2>

                    <motion.div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                            gap: "2rem",
                        }}
                    >
                        {[
                            {
                                step: "1",
                                title: "Create Your Account",
                                desc: "Sign up securely in seconds with your email or social account",
                            },
                            {
                                step: "2",
                                title: "Start Journaling",
                                desc: "Express your thoughts and feelings in a safe, private space",
                            },
                            {
                                step: "3",
                                title: "Track Your Mood",
                                desc: "Log your emotions daily with beautiful mood tracking",
                            },
                            {
                                step: "4",
                                title: "Get Insights",
                                desc: "Receive AI-powered analysis and personalized recommendations",
                            },
                        ].map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="glass-card"
                                style={{
                                    padding: "2rem",
                                    background: "rgba(255, 255, 255, 0.95)",
                                    backdropFilter: "blur(10px)",
                                    border: "1px solid rgba(108, 92, 231, 0.1)",
                                    borderRadius: "1.5rem",
                                    position: "relative",
                                }}
                                whileHover={{
                                    y: -8,
                                    boxShadow: "0 20px 50px rgba(108, 92, 231, 0.15)",
                                }}
                            >
                                <div
                                    style={{
                                        width: "50px",
                                        height: "50px",
                                        borderRadius: "50%",
                                        background: "linear-gradient(135deg, #6c5ce7 0%, #8b5cf6 100%)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        color: "white",
                                        fontWeight: 800,
                                        fontSize: "1.5rem",
                                        marginBottom: "1rem",
                                    }}
                                >
                                    {item.step}
                                </div>
                                <h4 style={{ marginBottom: "0.5rem", fontWeight: 700, fontSize: "1.1rem" }}>
                                    {item.title}
                                </h4>
                                <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", lineHeight: 1.6 }}>
                                    {item.desc}
                                </p>
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.div>

                {/* UNIQUE FEATURES HIGHLIGHT */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="glass-card"
                    style={{
                        padding: "3rem 2rem",
                        background: "linear-gradient(135deg, rgba(139, 92, 246, 0.95) 0%, rgba(108, 92, 231, 0.95) 100%)",
                        color: "white",
                        borderRadius: "2rem",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        marginBottom: "3rem",
                    }}
                >
                    <motion.h2
                        style={{
                            textAlign: "center",
                            fontSize: "2rem",
                            marginBottom: "2.5rem",
                            fontWeight: 700,
                        }}
                    >
                        What Makes MindPulse Different
                    </motion.h2>

                    <motion.div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                            gap: "2rem",
                        }}
                    >
                        {[
                            {
                                icon: <Smile size={28} />,
                                title: "Emotional Intelligence",
                                desc: "Advanced AI learns your unique emotional patterns and responds with personalized support.",
                            },
                            {
                                icon: <Lock size={28} />,
                                title: "Bank-Level Security",
                                desc: "Military-grade encryption ensures your personal data and journals remain completely private.",
                            },
                            {
                                icon: <Users size={28} />,
                                title: "Supportive Community",
                                desc: "Connect with a compassionate community focused on mental wellness and growth.",
                            },
                            {
                                icon: <Award size={28} />,
                                title: "Evidence-Based",
                                desc: "Built on proven psychological principles and mental health practices.",
                            },
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ scale: 1.05 }}
                                style={{
                                    padding: "2rem",
                                    background: "rgba(255, 255, 255, 0.1)",
                                    backdropFilter: "blur(10px)",
                                    borderRadius: "1.5rem",
                                    border: "1px solid rgba(255, 255, 255, 0.2)",
                                }}
                            >
                                <motion.div
                                    animate={{ y: [0, -5, 0] }}
                                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                                    style={{ marginBottom: "1rem", display: "flex", gap: "0.5rem" }}
                                >
                                    {item.icon}
                                </motion.div>
                                <h4 style={{ marginBottom: "0.5rem", fontWeight: 700, fontSize: "1.1rem" }}>
                                    {item.title}
                                </h4>
                                <p style={{ opacity: 0.95, fontSize: "0.95rem", lineHeight: 1.6 }}>
                                    {item.desc}
                                </p>
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.div>

                {/* SUCCESS STORIES SECTION */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    style={{ marginBottom: "3rem" }}
                >
                    <motion.h2
                        style={{
                            textAlign: "center",
                            fontSize: "2rem",
                            marginBottom: "3rem",
                            fontWeight: 700,
                        }}
                    >
                        What Our Users Are Saying
                    </motion.h2>

                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                            gap: "2rem",
                        }}
                    >
                        {[
                            {
                                name: "Sarah M.",
                                role: "Student",
                                quote: "MindPulse helped me understand my anxiety patterns. The insights are incredibly accurate and the AI chatbot is like having a friend available 24/7.",
                                avatar: "SM",
                            },
                            {
                                name: "James K.",
                                role: "Professional",
                                quote: "Finally found a tool that respects my privacy while providing real value. The mood tracking feature has transformed how I manage stress.",
                                avatar: "JK",
                            },
                            {
                                name: "Emma L.",
                                role: "Creative",
                                quote: "The journaling feature combined with music therapy is perfect. It's become my daily ritual for emotional wellness.",
                                avatar: "EL",
                            },
                        ].map((testimonial, index) => (
                            <motion.div
                                key={index}
                                variants={itemVariants}
                                className="glass-card"
                                whileHover={{
                                    y: -8,
                                    boxShadow: "0 20px 50px rgba(108, 92, 231, 0.15)",
                                }}
                                style={{
                                    padding: "2.5rem",
                                    background: "rgba(255, 255, 255, 0.95)",
                                    backdropFilter: "blur(10px)",
                                    border: "1px solid rgba(108, 92, 231, 0.1)",
                                    borderRadius: "1.5rem",
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center", marginBottom: "1.5rem" }}>
                                    <div
                                        style={{
                                            width: "50px",
                                            height: "50px",
                                            borderRadius: "50%",
                                            background: "linear-gradient(135deg, #6c5ce7 0%, #8b5cf6 100%)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            color: "white",
                                            fontWeight: 700,
                                            marginRight: "1rem",
                                        }}
                                    >
                                        {testimonial.avatar}
                                    </div>
                                    <div>
                                        <h4 style={{ fontWeight: 700, marginBottom: "0.2rem" }}>
                                            {testimonial.name}
                                        </h4>
                                        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                                            {testimonial.role}
                                        </p>
                                    </div>
                                </div>
                                <p
                                    style={{
                                        color: "var(--text-dark)",
                                        fontSize: "0.95rem",
                                        lineHeight: 1.7,
                                        fontStyle: "italic",
                                    }}
                                >
                                    "{testimonial.quote}"
                                </p>
                                <div style={{ display: "flex", color: "#fbbf24", marginTop: "1rem" }}>
                                    {[...Array(5)].map((_, i) => (
                                        <span key={i} style={{ fontSize: "1.2rem" }}>★</span>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.div>

                {/* NEW FEATURES HIGHLIGHT */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="glass-card"
                    style={{
                        padding: "3rem 2rem",
                        background: "linear-gradient(135deg, rgba(236, 72, 153, 0.95) 0%, rgba(244, 114, 182, 0.95) 100%)",
                        color: "white",
                        borderRadius: "2rem",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        marginBottom: "3rem",
                        textAlign: "center",
                    }}
                >
                    <motion.div
                        animate={{ scale: [1, 1.15, 1] }}
                        transition={{ duration: 2.5, repeat: Infinity }}
                        style={{ marginBottom: "1.5rem", display: "inline-block" }}
                    >
                        <Sparkles size={40} color="white" />
                    </motion.div>

                    <h2 style={{ marginBottom: "1.5rem", fontSize: "2rem", fontWeight: 700 }}>
                        🎵 New: Music Therapy Integration
                    </h2>

                    <p
                        style={{
                            maxWidth: "700px",
                            margin: "0 auto 2rem",
                            fontSize: "1.05rem",
                            lineHeight: 1.7,
                            opacity: 0.95,
                        }}
                    >
                        Discover the healing power of music tailored to your emotional state. Share therapeutic songs, build playlists for different moods, and enhance your wellness journey with sound.
                    </p>

                    <motion.button
                        className="btn btn-primary"
                        onClick={() => navigate("/songs")}
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.96 }}
                        style={{
                            padding: "0.9rem 2rem",
                            fontSize: "1rem",
                            fontWeight: 600,
                            backgroundColor: "rgba(255, 255, 255, 0.2)",
                            border: "2px solid white",
                            color: "white",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.5rem",
                        }}
                    >
                        <Music size={18} />
                        Explore Music Therapy
                    </motion.button>
                </motion.div>

                {/* AI CHATBOT HIGHLIGHT */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="glass-card"
                    style={{
                        padding: "3rem 2rem",
                        background: "linear-gradient(135deg, rgba(59, 130, 246, 0.95) 0%, rgba(96, 165, 250, 0.95) 100%)",
                        color: "white",
                        borderRadius: "2rem",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        marginBottom: "3rem",
                        textAlign: "center",
                    }}
                >
                    <motion.div
                        animate={{ rotate: [0, 5, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        style={{ marginBottom: "1.5rem", display: "inline-block" }}
                    >
                        <MessageSquare size={40} color="white" />
                    </motion.div>

                    <h2 style={{ marginBottom: "1.5rem", fontSize: "2rem", fontWeight: 700 }}>
                        💬 AI-Powered Emotional Support
                    </h2>

                    <p
                        style={{
                            maxWidth: "700px",
                            margin: "0 auto 2rem",
                            fontSize: "1.05rem",
                            lineHeight: 1.7,
                            opacity: 0.95,
                        }}
                    >
                        Meet your 24/7 AI companion. Get instant emotional support, coping strategies, and wellness guidance anytime you need it. Always available, always supportive.
                    </p>

                    <motion.button
                        className="btn btn-primary"
                        onClick={() => navigate("/dashboard")}
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.96 }}
                        style={{
                            padding: "0.9rem 2rem",
                            fontSize: "1rem",
                            fontWeight: 600,
                            backgroundColor: "rgba(255, 255, 255, 0.2)",
                            border: "2px solid white",
                            color: "white",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.5rem",
                        }}
                    >
                        <MessageSquare size={18} />
                        Chat Now
                    </motion.button>
                </motion.div>

                {/* STATISTICS WITH BENEFITS */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    style={{
                        background: "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)",
                        borderRadius: "2rem",
                        border: "1px solid rgba(108, 92, 231, 0.1)",
                        padding: "3rem 2rem",
                        marginBottom: "3rem",
                    }}
                >
                    <motion.h2
                        style={{
                            textAlign: "center",
                            fontSize: "2rem",
                            marginBottom: "3rem",
                            fontWeight: 700,
                        }}
                    >
                        Real Results, Real Impact
                    </motion.h2>

                    <motion.div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                            gap: "2rem",
                        }}
                    >
                        {[
                            { value: "92%", label: "Report Improved Mood", icon: "😊" },
                            { value: "87%", label: "Better Emotional Control", icon: "🎯" },
                            { value: "95%", label: "Increased Self-Awareness", icon: "🧠" },
                            { value: "89%", label: "More Mindful Daily", icon: "🌟" },
                        ].map((stat, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="glass-card"
                                whileHover={{ y: -8, boxShadow: "0 20px 50px rgba(108, 92, 231, 0.15)" }}
                                style={{
                                    padding: "2rem",
                                    textAlign: "center",
                                    background: "rgba(255, 255, 255, 0.9)",
                                    backdropFilter: "blur(10px)",
                                    border: "1px solid rgba(108, 92, 231, 0.1)",
                                    borderRadius: "1.5rem",
                                }}
                            >
                                <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>
                                    {stat.icon}
                                </div>
                                <div
                                    style={{
                                        fontSize: "2.5rem",
                                        fontWeight: 800,
                                        background: "linear-gradient(135deg, #6c5ce7 0%, #8b5cf6 100%)",
                                        WebkitBackgroundClip: "text",
                                        WebkitTextFillColor: "transparent",
                                        backgroundClip: "text",
                                        marginBottom: "0.5rem",
                                    }}
                                >
                                    {stat.value}
                                </div>
                                <p style={{ color: "var(--text-muted)", fontWeight: 500 }}>
                                    {stat.label}
                                </p>
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.div>

                {/* FINAL CTA */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="glass-card"
                    style={{
                        padding: "3rem 2rem",
                        textAlign: "center",
                        background: "linear-gradient(135deg, #6c5ce7 0%, #8b5cf6 100%)",
                        color: "white",
                        borderRadius: "2rem",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                    }}
                >
                    <h2 style={{ marginBottom: "1.5rem", fontSize: "2rem", fontWeight: 700 }}>
                        Ready to Transform Your Mental Wellness?
                    </h2>

                    <p
                        style={{
                            maxWidth: "650px",
                            margin: "0 auto 2rem",
                            fontSize: "1.05rem",
                            lineHeight: 1.7,
                            opacity: 0.95,
                        }}
                    >
                        Join thousands of people who have already started their journey to better mental health. Your first journal entry could be the beginning of meaningful change.
                    </p>

                    <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
                        <motion.button
                            className="btn btn-primary"
                            onClick={() => navigate("/register")}
                            whileHover={{ scale: 1.08 }}
                            whileTap={{ scale: 0.96 }}
                            style={{
                                padding: "1rem 2.5rem",
                                fontSize: "1rem",
                                fontWeight: 700,
                                backgroundColor: "white",
                                color: "#6c5ce7",
                                border: "none",
                            }}
                        >
                            Sign Up Free
                        </motion.button>

                        <motion.button
                            className="btn btn-primary"
                            onClick={() => navigate("/dashboard")}
                            whileHover={{ scale: 1.08 }}
                            whileTap={{ scale: 0.96 }}
                            style={{
                                padding: "1rem 2.5rem",
                                fontSize: "1rem",
                                fontWeight: 700,
                                backgroundColor: "rgba(255, 255, 255, 0.2)",
                                border: "2px solid white",
                                color: "white",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "0.7rem",
                            }}
                        >
                            Explore Dashboard <ArrowRight size={18} />
                        </motion.button>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default Home;
