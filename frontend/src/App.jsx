import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Journal from './pages/Journal';
import Insights from './pages/Insights';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Support from './pages/Support';
import Profile from './pages/Profile';
import Home from './pages/Home';
import Chatbot from './components/Chatbot';
import About from './pages/About';
import Careers from './pages/Careers';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Terms from './pages/Terms';
import FloatingSupport from './components/FloatingSupport';
import { ThemeProvider } from './context/ThemeContext';
import PageWrapper from './components/PageWrapper';

function AppContent() {
  const location = useLocation();
  const hideNavbar = ['/login', '/register'].includes(location.pathname);

  return (
    <>
      {!hideNavbar && <Navbar userName={localStorage.getItem('username') || 'Prachi'} />}

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<PageWrapper title="Dashboard" description="Your wellness dashboard"><Dashboard /></PageWrapper>} />
        <Route path="/journal" element={<PageWrapper title="Journal" description="Daily mood journal"><Journal /></PageWrapper>} />
        <Route path="/insights" element={<PageWrapper title="Insights" description="Wellness analytics"><Insights /></PageWrapper>} />
        <Route path="/support" element={<PageWrapper title="Support" description="Get help and resources"><Support /></PageWrapper>} />
        <Route path="/profile" element={<PageWrapper title="Profile" description="User settings"><Profile /></PageWrapper>} />
        <Route path="/home" element={<PageWrapper title="Home" description="Welcome"><Home /></PageWrapper>} />
        <Route path="/about" element={<About />} />
        <Route path="/careers" element={<Careers />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      
      {!hideNavbar && <FloatingSupport />}
      <Footer />
      {!hideNavbar && <Chatbot />}
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}

export default App;
