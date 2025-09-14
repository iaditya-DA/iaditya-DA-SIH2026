import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SIHHomePage from '../Components/SIHHomePage.jsx';
import SIHRegisteredPage from '../Components/SIHRegisteredPage.jsx';

// Smooth scroll setup
const useSmoothScroll = () => {
  useEffect(() => {
    let lenis;
    
    const initLenis = async () => {
      const { Lenis } = await import('lenis');
      
      lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 2,
      });

      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }

      requestAnimationFrame(raf);
    };

    initLenis();

    return () => {
      if (lenis) {
        lenis.destroy();
      }
    };
  }, []);
};

// SIH Announcement Banner with fluid animations
const SIHAnnouncementBanner = () => {
  return (
    <motion.div 
      className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 py-3 overflow-hidden border-b border-purple-500/30"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 1, ease: "easeOut" }}
    >
      <div className="absolute inset-0 bg-black/20"></div>
      <motion.div
        className="absolute inset-0"
        animate={{
          background: [
            "linear-gradient(90deg, rgba(139, 92, 246, 0.3) 0%, rgba(59, 130, 246, 0.3) 50%, rgba(6, 182, 212, 0.3) 100%)",
            "linear-gradient(90deg, rgba(6, 182, 212, 0.3) 0%, rgba(139, 92, 246, 0.3) 50%, rgba(59, 130, 246, 0.3) 100%)",
            "linear-gradient(90deg, rgba(59, 130, 246, 0.3) 0%, rgba(6, 182, 212, 0.3) 50%, rgba(139, 92, 246, 0.3) 100%)",
          ]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="relative">
        <motion.div 
          className="flex animate-marquee whitespace-nowrap"
          animate={{ x: ["100%", "-100%"] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          <div className="mx-4 flex items-center space-x-8">
            <span className="text-white font-bold text-lg flex items-center">
              🎉 REGISTRATION CLOSED:
            </span>
            <span className="text-white font-semibold">
              All registrations are now CLOSED ✅
            </span>
            <span className="text-white font-semibold">
              PPT Presentation Results: Monday, 15th September 2025 📊
            </span>
            <span className="text-white font-bold">
              Team Leaders: Join WhatsApp group (check your WhatsApp!) 📱
            </span>
            <span className="text-white font-semibold">
              Stay tuned for exciting updates! 🚀
            </span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

// SIH Fluid Navigation
const SIHFluidNavigation = ({ page, setPage, isMenuOpen, setIsMenuOpen }) => {
  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1, ease: "easeOut" }}
      className="fixed top-16 left-0 right-0 z-40 p-6"
    >
      <div className="max-w-7xl mx-auto">
        <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4">
          <div className="relative flex items-center justify-between">
            {/* SIH Logo */}
            <motion.div
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.05 }}
            >
              <motion.div
                className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-xl flex items-center justify-center"
                animate={{ 
                  background: [
                    "linear-gradient(45deg, #06b6d4, #8b5cf6)",
                    "linear-gradient(45deg, #8b5cf6, #ec4899)",
                    "linear-gradient(45deg, #ec4899, #06b6d4)"
                  ]
                }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <span className="text-white font-bold text-lg">S</span>
              </motion.div>
              <span className="text-white font-bold text-xl hidden sm:block">SIH 2025</span>
            </motion.div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              {['home', 'registered'].map((item) => (
                <motion.button
                  key={item}
                  onClick={() => setPage(item)}
                  className={`relative px-4 py-2 rounded-lg transition-colors ${
                    page === item ? 'text-cyan-400' : 'text-white/80 hover:text-white'
                  }`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="relative z-10 capitalize">
                    {item === 'registered' ? 'Registered Participants' : 'Home'}
                  </span>
                  
                  {page === item && (
                    <motion.div
                      className="absolute inset-0 bg-cyan-500/20 rounded-lg"
                      layoutId="activeTab"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    />
                  )}
                </motion.button>
              ))}
              
              {/* Closed buttons */}
              <motion.button
                disabled
                className="relative px-4 py-2 rounded-lg text-slate-500 opacity-50 cursor-not-allowed"
                whileHover={{ scale: 1.02 }}
              >
                Teams
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 rounded-full text-[10px]">✕</span>
              </motion.button>
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              className="md:hidden p-2 rounded-lg bg-white/10"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <motion.div
                animate={{ rotate: isMenuOpen ? 45 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </motion.div>
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="md:hidden mt-4"
            >
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="space-y-4">
                  {['home', 'registered'].map((item, index) => (
                    <motion.button
                      key={item}
                      onClick={() => { setPage(item); setIsMenuOpen(false); }}
                      className="block w-full text-left px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      whileHover={{ scale: 1.02, x: 5 }}
                    >
                      {item === 'registered' ? 'Registered Participants' : 'Home'}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

// Main SIH Fluid Website Component
const SIHFluidWebsite = () => {
  useSmoothScroll();
  
  const [page, setPage] = useState('home');
  const [teams, setTeams] = useState([]);
  const [individuals, setIndividuals] = useState([]);
  const [toast, setToast] = useState({ show: false, message: '' });
  const [alert, setAlert] = useState({ show: false, message: '' });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        const [teamsRes, individualsRes] = await Promise.all([
          fetch('/api/teams'),
          fetch('/api/individuals')
        ]);
        if (!teamsRes.ok || !individualsRes.ok) throw new Error('Network response was not ok');
        const teamsData = await teamsRes.json();
        const individualsData = await individualsRes.json();
        setTeams(teamsData);
        setIndividuals(individualsData);
      } catch (error) {
        console.error("Failed to fetch registered participants:", error);
        showAlert("Could not load participant data.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllData();
  }, []);

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 3000);
  };

  const showAlert = (message) => setAlert({ show: true, message });
  const closeAlert = () => setAlert({ show: false, message: '' });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="min-h-screen bg-slate-900 text-white overflow-x-hidden"
    >
      {/* SIH Announcement Banner */}
      <SIHAnnouncementBanner />

      {/* Navigation */}
      <SIHFluidNavigation page={page} setPage={setPage} isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

      {/* Content based on page */}
      {page === 'home' ? (
        <SIHHomePage setPage={setPage} />
      ) : page === 'registered' ? (
        <SIHRegisteredPage teams={teams} individuals={individuals} isLoading={isLoading} />
      ) : null}

      {/* Toast and Alert Components */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-6 right-6 bg-green-600 text-white py-3 px-6 rounded-2xl shadow-lg z-50"
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {alert.show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={closeAlert}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-800 border border-red-500/50 p-8 rounded-3xl shadow-2xl w-full max-w-sm text-center"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold text-red-400 mb-4">Alert</h3>
              <p className="text-lg text-slate-300 mb-6">{alert.message}</p>
              <motion.button
                onClick={closeAlert}
                className="bg-red-600 hover:bg-red-500 px-8 py-3 rounded-2xl font-semibold transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Close
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="relative py-20 px-6 border-t border-white/10 mt-20"
      >
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-slate-400 text-lg">
            © 2025 SIH LNCT University Bhopal. Developed by Gautam Jaiswani & Vikas Singh.
          </p>
        </div>
      </motion.footer>
    </motion.div>
  );
};

export default SIHFluidWebsite;