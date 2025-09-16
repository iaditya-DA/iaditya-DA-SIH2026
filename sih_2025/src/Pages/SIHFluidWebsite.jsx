import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SIHHomePage from '../Components/SIHHomePage.jsx';
import SIHRegisteredPage from '../Components/SIHRegisteredPage.jsx';

// Results Page Component
const ResultsPage = () => {
  const [selectedRound, setSelectedRound] = useState('round1');

  // Round 1 results - BCA/MCA teams (removed Pathfinders, renumbered from 1)
  const round1Results = [
    { teamNumber: 1, teamName: "Travel Sentinel", leaderName: "Shashikant Kumar", mobile: "9155393090", branch: "MCA/BCA", category: "Software Edition" },
    { teamNumber: 2, teamName: "Pixel Pioneers", leaderName: "Vikas Kumar Singh", mobile: "9039389755", branch: "BCA", category: "Software Edition" },
    { teamNumber: 3, teamName: "TravelSync", leaderName: "Shivani Soni", mobile: "9302627128", branch: "BCA(AIDA)", category: "Software Edition" },
    { teamNumber: 4, teamName: "Velo tech", leaderName: "Vishakha Soni", mobile: "8305075094", branch: "BCA", category: "Software Edition" },
    { teamNumber: 5, teamName: "Rock Bottom", leaderName: "Yash Pandey", mobile: "7999914983", branch: "BCA(AIDA)", category: "Software Edition" },
    { teamNumber: 6, teamName: "BugSquashers", leaderName: "ARYAN DUBEY", mobile: "7024940679", branch: "BCA", category: "Software Edition" },
    { teamNumber: 7, teamName: "Aarogya", leaderName: "Mohit Kushwaha", mobile: "9691550352", branch: "MCA", category: "Software Edition" },
    { teamNumber: 8, teamName: "LitSquad", leaderName: "Aman Kahar", mobile: "8839628882", branch: "BCA", category: "Software Edition" },
    { teamNumber: 9, teamName: "ANTI ERRORISTS", leaderName: "SAHIL KUMAR TIWARI", mobile: "9161053545", branch: "BCA", category: "Software Edition" },
    { teamNumber: 10, teamName: "Hack Hustlers", leaderName: "Ayush Malviya", mobile: "7024849399", branch: "BCA-AIDA", category: "Software Edition" },
    { teamNumber: 11, teamName: "TechTantra", leaderName: "Rajnandni Choudhary", mobile: "7000530771", branch: "BCA", category: "Software Edition" },
    { teamNumber: 12, teamName: "MindMend", leaderName: "Madhu jain", mobile: "8641033851", branch: "BCA", category: "Software Edition" },
    { teamNumber: 13, teamName: "Tragic bytes", leaderName: "Ravin kumar baiga", mobile: "7999165905", branch: "BCA", category: "Software Edition" },
    { teamNumber: 14, teamName: "INNOWAVE", leaderName: "Akanksha Tiwari", mobile: "9238859507", branch: "BCA", category: "Software Edition" },
    { teamNumber: 15, teamName: "Team rockerzz", leaderName: "Tarun singh rajput", mobile: "9171417682", branch: "BCA", category: "Software Edition" },
    { teamNumber: 16, teamName: "Career Catalyst", leaderName: "Abdul Hadi Ahmed Khan", mobile: "7389110335", branch: "BCA-AIDA", category: "Software Edition" },
    { teamNumber: 17, teamName: "InnoVision", leaderName: "Vishakha Tiwari", mobile: "9201070030", branch: "BCA", category: "Software Edition" },
    { teamNumber: 18, teamName: "JARVOC", leaderName: "Janmejay Kumar Singh", mobile: "9424093346", branch: "BCA", category: "Software Edition" },
    { teamNumber: 19, teamName: "Syntax sages", leaderName: "Nishika Kukreja", mobile: "8349898888", branch: "BCA", category: "Software Edition" },
    { teamNumber: 20, teamName: "Neural ninjas", leaderName: "Divyansh Goswami", mobile: "9993610852", branch: "BCA", category: "Software Edition" },
    { teamNumber: 21, teamName: "code 4 civics", leaderName: "KANIAK GOUHAR", mobile: "7869084418", branch: "BCA", category: "Software Edition" },
    { teamNumber: 22, teamName: "Byte Me", leaderName: "Jayprakash Gupta", mobile: "9109626300", branch: "BCA", category: "Software Edition" }
  ];

  const round2Results = []; // Placeholder for Round 2
  
  const currentResults = selectedRound === 'round1' ? round1Results : round2Results;

  // Separate MCA and BCA teams
  const mcaTeams = currentResults.filter(team => team.branch.toUpperCase().includes('MCA'));
  const bcaTeams = currentResults.filter(team => team.branch.toUpperCase().includes('BCA') && !team.branch.toUpperCase().includes('MCA'));

  const TeamCard = ({ team, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 hover:border-cyan-500/50 transition-all duration-300 group hover:shadow-lg hover:shadow-cyan-500/10"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm">
            {team.teamNumber}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">{team.teamName}</h3>
            <span className="text-sm text-slate-400">{team.category}</span>
          </div>
        </div>
        <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
          ✓ SELECTED
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <span className="text-slate-400 text-sm">👤 Leader:</span>
          <span className="text-white font-medium">{team.leaderName}</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-slate-400 text-sm">📱 Mobile:</span>
          <span className="text-slate-300">{team.mobile}</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-slate-400 text-sm">🎓 Branch:</span>
          <span className="text-cyan-400 font-semibold">{team.branch}</span>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 pt-32">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="relative container mx-auto px-6 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent mb-6">
            SIH 2025 Results
          </h1>
          
          {/* Round Selector Dropdown */}
          <div className="mb-8">
            <select
              value={selectedRound}
              onChange={(e) => setSelectedRound(e.target.value)}
              className="bg-gradient-to-r from-slate-800/80 to-slate-900/80 backdrop-blur-sm border border-cyan-500/50 rounded-2xl px-6 py-3 text-white text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500/50 cursor-pointer hover:border-cyan-400/70 transition-all duration-300"
            >
              <option value="round1" className="bg-slate-900 text-white">📋 Round 1 - PPT Results</option>
              <option value="round2" className="bg-slate-900 text-white">🚀 Round 2 - Coming Soon</option>
            </select>
          </div>
          {selectedRound === 'round1' ? (
            <div className="bg-gradient-to-r from-emerald-500/20 to-green-600/20 border border-emerald-500/30 rounded-2xl p-6 inline-block">
              <div className="flex items-center justify-center space-x-4">
                <span className="text-4xl">🎉</span>
                <div className="text-left">
                  <h3 className="text-2xl font-bold text-emerald-400">Congratulations!</h3>
                  <p className="text-slate-300">Selected teams advance to Round 2</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-blue-500/20 to-cyan-600/20 border border-blue-500/30 rounded-2xl p-6 inline-block">
              <div className="flex items-center justify-center space-x-4">
                <span className="text-4xl">⏳</span>
                <div className="text-left">
                  <h3 className="text-2xl font-bold text-blue-400">Round 2 Results</h3>
                  <p className="text-slate-300">Will be announced soon</p>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Statistics */}
        {currentResults.length > 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
          >
            <div className="bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 rounded-2xl p-6 text-center hover:scale-105 transition-transform duration-300">
              <div className="text-4xl font-bold text-cyan-400">{currentResults.length}</div>
              <div className="text-slate-300 mt-2">Total Selected Teams</div>
            </div>
            <div className="bg-gradient-to-br from-purple-500/20 to-pink-600/20 border border-purple-500/30 rounded-2xl p-6 text-center hover:scale-105 transition-transform duration-300">
              <div className="text-4xl font-bold text-purple-400">{mcaTeams.length}</div>
              <div className="text-slate-300 mt-2">MCA Teams</div>
            </div>
            <div className="bg-gradient-to-br from-emerald-500/20 to-green-600/20 border border-emerald-500/30 rounded-2xl p-6 text-center hover:scale-105 transition-transform duration-300">
              <div className="text-4xl font-bold text-emerald-400">{bcaTeams.length}</div>
              <div className="text-slate-300 mt-2">BCA Teams</div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-12 text-center"
          >
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-2xl p-12">
              <div className="text-6xl mb-4">⏳</div>
              <h3 className="text-2xl font-bold text-slate-300 mb-2">Round 2 Results</h3>
              <p className="text-slate-400">Results will be announced after the next round is completed</p>
            </div>
          </motion.div>
        )}

        {/* MCA Teams Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-12"
        >
          <div className="flex items-center space-x-3 mb-8">
            <div className="bg-gradient-to-r from-purple-500 to-pink-600 w-8 h-8 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <h2 className="text-3xl font-bold text-white">MCA Teams</h2>
            <span className="bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full text-sm font-semibold">
              {mcaTeams.length} teams
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mcaTeams.map((team, index) => (
              <TeamCard key={team.teamNumber} team={team} index={index} />
            ))}
          </div>
        </motion.div>

        {/* BCA Teams Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className="flex items-center space-x-3 mb-8">
            <div className="bg-gradient-to-r from-emerald-500 to-green-600 w-8 h-8 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">B</span>
            </div>
            <h2 className="text-3xl font-bold text-white">BCA Teams</h2>
            <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-sm font-semibold">
              {bcaTeams.length} teams
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bcaTeams.map((team, index) => (
              <TeamCard key={team.teamNumber} team={team} index={index} />
            ))}
          </div>
        </motion.div>

        {/* Next Round Info */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-16 text-center"
        >
          <div className="bg-gradient-to-r from-blue-500/20 to-cyan-600/20 border border-blue-500/30 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-white mb-4">📅 Next Round Information</h3>
            <p className="text-lg text-slate-300 mb-4">
              <span className="text-cyan-400 font-semibold">Round 2:</span> September 20, 2025 at 10:00 AM
            </p>
            <p className="text-slate-400">
              Venue will be announced soon. Stay tuned for updates!
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

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
              🎉 Round 1 Results ANNOUNCED!
            </span>
            <span className="text-white font-semibold">
              PPT Round: 22 BCA/MCA teams selected 📊
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
              {['home', 'registered', 'results'].map((item) => (
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
                    {item === 'registered' ? 'Registered Participants' : item === 'results' ? 'Results' : 'Home'}
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
                  {['home', 'registered', 'results'].map((item, index) => (
                    <motion.button
                      key={item}
                      onClick={() => { setPage(item); setIsMenuOpen(false); }}
                      className="block w-full text-left px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      whileHover={{ scale: 1.02, x: 5 }}
                    >
                      {item === 'registered' ? 'Registered Participants' : item === 'results' ? 'Results' : 'Home'}
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
      ) : page === 'results' ? (
        <ResultsPage />
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