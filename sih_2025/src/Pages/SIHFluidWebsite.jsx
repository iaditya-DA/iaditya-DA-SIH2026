import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SIHHomePage from '../Components/SIHHomePage.jsx';
import SIHRegisteredPage from '../Components/SIHRegisteredPage.jsx';
import TeamRegistration from './TeamRegistration.jsx';
import { IndividualRegistration } from './Home.jsx';
import RegistrationChoice from "./Registrationchoice.jsx";
import { AuthProvider, useAuth } from '../AuthContext.jsx';
import AuthPage from '../AuthPage.jsx';
import FindTeammatesPage from '../FindTeammatesPage.jsx';
import MyRequestsPage from '../MyRequestsPage.jsx';
import ProfilePage from './ProfilePage.jsx';
import { collection, getDocs, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../firebaseClient.js';
import Lenis from 'lenis'
const ResultsPage = () => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-xl w-full text-center"
      >
        <h1 className="text-5xl md:text-6xl font-black text-orange-500 tracking-wide mb-4">
          RESULTS
        </h1>

        <div className="bg-orange-50 border-2 border-orange-400 rounded-2xl px-8 py-14">
          <div className="w-24 h-24 mx-auto rounded-full border-4 border-orange-400 bg-white flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-blue-900 mb-3 uppercase">
            Results Coming Soon
          </h2>

          <p className="text-slate-600 text-lg">
            Results for SIH 2026 will be announced here shortly. Stay tuned!
          </p>
        </div>
      </motion.div>
    </div>
  );
};

const useSmoothScroll = () => {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      smoothWheel: true,
      touchMultiplier: 2,
    });

    let rafId;

    const raf = (time) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };

    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);
};

// SIH Fluid Navigation
const SIHFluidNavigation = ({ page, setPage, isMenuOpen, setIsMenuOpen }) => {
  const { user } = useAuth();

  const NAV_ITEMS = [
    { label: 'HOME', pageKey: 'home', action: () => setPage('home') },
    { label: 'REGISTRATION', pageKey: 'registration-choice', action: () => setPage('registration-choice') },
    { label: 'FIND TEAMMATES', pageKey: 'find-teammates', action: () => setPage('find-teammates') },
    { label: 'MY REQUESTS', pageKey: 'my-requests', action: () => setPage('my-requests') },
    { label: 'RESULTS', pageKey: 'results', action: () => setPage('results') },
    { label: 'TEAMS', pageKey: 'registered', action: () => setPage('registered') },
    {
      label: 'PROFILE',
      pageKey: user ? 'profile' : 'auth',
      action: () => setPage(user ? 'profile' : 'auth'),
    },
  ];

  const isActive = (pageKey) => {
    if (pageKey === 'registration-choice') return page === 'registration-choice' || page === 'team-register' || page === 'individual-register';
    if (pageKey === 'profile') return page === 'profile' || page === 'auth';
    return page === pageKey;
  };

  return (
    <motion.nav
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 w-full bg-white/70 backdrop-blur-xl"
    >
      <div className="w-full px-6 md:px-10">
        <div className="flex items-center justify-between h-20">

          {/* Left: Official Logos — pinned to the left edge of the navbar */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <img
              src="/sih-logo.png"
              alt="Smart India Hackathon 2026"
              className="h-12 w-auto object-contain"
            />
            <div className="h-14 w-14 rounded-full overflow-hidden border border-gray-200 bg-white flex items-center justify-center flex-shrink-0">
              <img
                src="/lnct-hackathon-logo.png"
                alt="LNCT Hackathon Club MCA"
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          {/* Right: Desktop Menu — pinned to the right edge of the navbar */}
          <div className="hidden md:flex items-center space-x-8 flex-shrink-0">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.label}
                onClick={item.action}
                className={`px-2 py-2 text-[14px] font-semibold tracking-wide uppercase transition-colors duration-200 ${isActive(item.pageKey)
                  ? 'text-orange-500 border-b-2 border-orange-500'
                  : 'text-blue-900 hover:text-orange-500'
                  }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Right: Mobile Hamburger */}
          <motion.button
            className="md:hidden p-2 rounded-lg bg-gray-100 text-blue-900"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <motion.div
              animate={{ rotate: isMenuOpen ? 45 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </motion.div>
          </motion.button>

        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="md:hidden border-t border-gray-200 bg-white"
          >
            <div className="max-w-[1180px] mx-auto px-2">
              {NAV_ITEMS.map((item, index) => (
                <motion.button
                  key={item.label}
                  onClick={() => { item.action(); setIsMenuOpen(false); }}
                  className={`block w-full text-left px-4 py-3 rounded-lg font-semibold text-sm tracking-wide uppercase transition-colors ${isActive(item.pageKey)
                    ? 'text-orange-500 bg-orange-50'
                    : 'text-blue-900 hover:text-orange-500 hover:bg-orange-50'
                    }`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * index }}
                >
                  {item.label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

// Inner component: everything that needs useAuth() must be inside AuthProvider
const PROTECTED_PAGES = ['profile', 'registration-choice', 'team-register', 'individual-register'];// Pages that let a user *start* a fresh registration — once registered, these are off-limits;
// editing an existing registration should happen from the profile page instead.
const REGISTRATION_ENTRY_PAGES = ['registration-choice', 'team-register', 'individual-register'];
const REGISTERED_ONLY_PAGES = ['find-teammates', 'my-requests'];

const SIHFluidWebsiteInner = () => {
  useSmoothScroll();
  const { user, isRegistered, loading: authLoading } = useAuth();

  const [page, setPage] = useState('home');
  const [teams, setTeams] = useState([]);
  const [individuals, setIndividuals] = useState([]);
  const [toast, setToast] = useState({ show: false, message: '' });
  const [alert, setAlert] = useState({ show: false, message: '' });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);

    const unsubTeams = onSnapshot(
      collection(db, 'teams'),
      (snap) => {
        setTeams(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setIsLoading(false);
      },
      (error) => {
        console.error("Failed to load teams:", error);
        showAlert("Could not load participant data.");
        setIsLoading(false);
      }
    );

    const unsubIndividuals = onSnapshot(
      query(collection(db, 'users'), where('registered', '==', true)),
      (snap) => {
        setIndividuals(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      },
      (error) => {
        console.error("Failed to load participants:", error);
      }
    );

    return () => {
      unsubTeams();
      unsubIndividuals();
    };
  }, []);

  useEffect(() => {
    if (authLoading) return;

    // Rule 1: registration and profile pages require login.
    if (PROTECTED_PAGES.includes(page) && !user) {
      showAlert('Please login first');
      setPage('auth');
      return;
    }

    // Rule 2: once a user has completed a registration (team or individual),
    // they cannot start a fresh one again — from the navbar, from the
    // Registration Choice page, or from any extra buttons on Home. They can
    // only edit their existing registration from their profile.
    if (REGISTRATION_ENTRY_PAGES.includes(page) && user && isRegistered) {
      showAlert('You have already registered. You can edit your details from your profile.');
      setPage('profile');
      return;
    }

    if (REGISTERED_ONLY_PAGES.includes(page)) {
      if (!user) {
        showAlert('Please login first');
        setPage('auth');
      } else if (!isRegistered) {
        showAlert('Please complete your individual or team registration first');
        setPage('registration-choice');
      }
    }
  }, [page, user, isRegistered, authLoading]);

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
      className="min-h-screen bg-gray-50 text-slate-800 overflow-x-hidden"
    >
      {/* Navigation */}
      <SIHFluidNavigation page={page} setPage={setPage} isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

      {/* Content based on page — pt-24 compensates for fixed navbar height */}
      <div className="pt-24">
        {page === 'home' ? (
          <SIHHomePage setPage={setPage} />
        ) : page === 'registration-choice' ? (
          <RegistrationChoice setPage={setPage} />
        ) : page === 'registered' ? (
          <SIHRegisteredPage teams={teams} individuals={individuals} isLoading={isLoading} />
        ) : page === 'results' ? (
          <ResultsPage />
        ) : page === 'team-register' ? (
          <TeamRegistration setPage={setPage} setTeams={setTeams} showToast={showToast} showAlert={showAlert} />
        ) : page === 'individual-register' ? (
          <IndividualRegistration setPage={setPage} setIndividuals={setIndividuals} showToast={showToast} showAlert={showAlert} />
        ) : page === 'auth' ? (
          <AuthPage setPage={setPage} showToast={showToast} showAlert={showAlert} />
        ) : page === 'find-teammates' ? (
          <FindTeammatesPage setPage={setPage} showToast={showToast} showAlert={showAlert} />
        ) : page === 'my-requests' ? (
          <MyRequestsPage setPage={setPage} showToast={showToast} showAlert={showAlert} />
        ) : page === 'profile' ? (
          <ProfilePage setPage={setPage} showToast={showToast} showAlert={showAlert} />
        ) : null}
      </div>

      {/* Toast and Alert Components */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-6 right-6 bg-green-600 text-white py-3 px-6 rounded-2xl shadow-lg z-50 font-semibold"
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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={closeAlert}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white border border-red-200 p-8 rounded-3xl shadow-2xl w-full max-w-sm text-center"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold text-red-600 mb-4">Alert</h3>
              <p className="text-lg text-slate-700 mb-6">{alert.message}</p>
              <motion.button
                onClick={closeAlert}
                className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-2xl font-bold transition-colors"
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
        className="relative py-20 px-6 border-t border-gray-200 mt-20"
      >
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-slate-500 font-medium text-lg">
            © 2026 SIH LNCT University Bhopal. Developed by Aditya Kumar Jha with ❤️
          </p>

          <div className="flex items-center justify-center gap-4 mt-6">
            <motion.a
              href="https://www.instagram.com/adityakrjhaa?igsh=YWZsY3lhb3hzZ21u"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="w-11 h-11 rounded-full border border-gray-200 bg-white flex items-center justify-center text-slate-500 hover:text-orange-500 hover:border-orange-300 transition-colors shadow-sm"
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.98-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.198-4.354-2.618-6.78-6.98-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.163 6.163 0 100 12.326 6.163 6.163 0 000-12.326zm0 10.162a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
            </motion.a>

            <motion.a
              href="https://www.linkedin.com/in/adityakr-jha/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="w-11 h-11 rounded-full border border-gray-200 bg-white flex items-center justify-center text-slate-500 hover:text-blue-700 hover:border-blue-300 transition-colors shadow-sm"
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </motion.a>

            <motion.a
              href="https://github.com/iaditya-DA"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="w-11 h-11 rounded-full border border-gray-200 bg-white flex items-center justify-center text-slate-500 hover:text-blue-900 hover:border-blue-300 transition-colors shadow-sm"
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.333-1.755-1.333-1.755-1.089-.744.083-.729.083-.729 1.205.084 1.84 1.236 1.84 1.236 1.07 1.835 2.807 1.305 3.492.998.108-.775.42-1.305.762-1.605-2.665-.303-5.467-1.332-5.467-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
              </svg>
            </motion.a>
          </div>
        </div>
      </motion.footer>
    </motion.div>
  );
};

// Outer component: wraps everything in AuthProvider so useAuth() works throughout
const SIHFluidWebsite = () => (
  <AuthProvider>
    <SIHFluidWebsiteInner />
  </AuthProvider>
);

export default SIHFluidWebsite;