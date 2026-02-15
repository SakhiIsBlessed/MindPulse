import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, BookOpen, Brain, TrendingUp, Sparkles, ArrowRight, Zap, Shield, Users, CheckCircle } from "lucide-react";

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
                                text: "Record daily emotions and discover patterns in your emotional state.",
                                color: "#ff6b6b",
                            },
                            {
                                icon: <BookOpen size={32} />,
                                title: "Private Journaling",
                                text: "Safe, encrypted space to express thoughts and feelings freely.",
                                color: "#4ecdc4",
                            },
                            {
                                icon: <Brain size={32} />,
                                title: "AI-Powered Insights",
                                text: "Get intelligent analysis of your emotional patterns and trends.",
                                color: "#8b5cf6",
                            },
                            {
                                icon: <TrendingUp size={32} />,
                                title: "Progress Tracking",
                                text: "Visualize your mental health journey with beautiful charts.",
                                color: "#06b6d4",
                            },
                            {
                                icon: <Zap size={32} />,
                                title: "Quick Check-ins",
                                text: "Fast mood logging with just a few seconds of your time.",
                                color: "#fbbf24",
                            },
                            {
                                icon: <Shield size={32} />,
                                title: "Privacy First",
                                text: "Your data is encrypted, secure, and completely private.",
                                color: "#34d399",
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
            </motion.div>
        </div>
    );
};

export default Home;
