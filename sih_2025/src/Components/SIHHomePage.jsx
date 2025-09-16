import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { ModernHeroBackground } from './ModernHeroBackground.jsx';

// SIH Hero Section with Character Animations
const SIHFluidHero = ({ setPage }) => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.5, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.8]);

  return (
    <motion.section
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-32"
      style={{ y, opacity, scale }}
    >
      {/* Modern Hero Background */}
      <ModernHeroBackground />

      {/* Main Content */}
      <div className="relative z-10 text-center px-6 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <h1 className="text-6xl md:text-8xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 leading-tight mb-6">
            SIH 2025
          </h1>
          <p className="text-2xl md:text-4xl text-white/90 font-light mb-4">
            LNCT University Bhopal
          </p>
        </motion.div>

        {/* SIH Status Cards */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="my-10 max-w-4xl mx-auto"
        >
          <div className="bg-slate-800/40 p-8 rounded-3xl backdrop-blur-sm border border-slate-700/50">
            <h2 className="text-3xl font-bold text-cyan-300 mb-6">SIH 2025 - Registration Complete! 🎉</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div 
                className="bg-green-500/20 border border-green-500/50 rounded-xl p-4"
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <p className="text-green-300 font-semibold">✅ All Registrations CLOSED</p>
                <p className="text-green-200 text-sm mt-1">Thank you for participation!</p>
              </motion.div>
              
              <motion.div 
                className="bg-green-500/20 border border-green-500/50 rounded-xl p-4"
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <p className="text-green-300 font-semibold">🎉 Round 1 Results ANNOUNCED!</p>
                <p className="text-green-200 text-sm mt-1">PPT Round results are now available!</p>
              </motion.div>
              
              <motion.div 
                className="bg-purple-500/20 border border-purple-500/50 rounded-xl p-4"
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <p className="text-purple-300 font-semibold">📱 WhatsApp Group</p>
                <p className="text-purple-200 text-sm mt-1">Team Leaders: Check WhatsApp!</p>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="space-y-4 md:space-y-0 md:space-x-6 flex flex-col md:flex-row justify-center items-center"
        >
          <motion.button
            disabled
            className="px-10 py-4 text-xl bg-gradient-to-br from-gray-600 to-gray-700 rounded-2xl font-bold cursor-not-allowed opacity-60 relative"
            whileHover={{ scale: 1.02 }}
          >
            <span className="line-through">Register Team</span>
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">CLOSED</span>
          </motion.button>
          
          <motion.button
            disabled
            className="px-10 py-4 text-xl bg-gradient-to-br from-gray-600 to-gray-700 rounded-2xl font-bold cursor-not-allowed opacity-60 relative"
            whileHover={{ scale: 1.02 }}
          >
            <span className="line-through">Register Individual</span>
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">CLOSED</span>
          </motion.button>
          
          <motion.button
            onClick={() => setPage('results')}
            className="px-10 py-4 text-xl bg-gradient-to-br from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 rounded-2xl font-bold transition-all duration-300"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            🎉 View Round 1 Results
          </motion.button>
          
          <motion.button
            onClick={() => setPage('registered')}
            className="px-10 py-4 text-xl bg-gradient-to-br from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-2xl font-bold transition-all duration-300"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            View Registered Participants
          </motion.button>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center text-white/60"
        >
          <span className="text-sm mb-2">Scroll to explore</span>
          <motion.div
            className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center"
            whileHover={{ scale: 1.1 }}
          >
            <motion.div
              className="w-1 h-3 bg-cyan-400 rounded-full mt-2"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.section>
  );
};

// SIH Content Sections
const SIHContentSections = () => {
  const [openFaq, setOpenFaq] = useState(null);
  
  const FAQ_DATA = [
    { q: "Where can I find the Round 1 results?", a: "Round 1 PPT presentation results are now available! Click on 'View Round 1 Results' button on the home page or navigate to the Results section." },
    { q: "Are registrations still open?", a: "No, all registrations (both individual and team) are now permanently closed. Thank you for your overwhelming response!" },
    { q: "How can team leaders join the WhatsApp group?", a: "Team leaders should check their WhatsApp for the group invitation link. The invitation has been sent to the contact number provided during registration." },
    { q: "What was the team size limit?", a: "Teams consisted of a minimum of 2 members and a maximum of 6 members, including the team leader." },
    { q: "What if I have questions about my registration?", a: "Please reach out to the contacts listed at the bottom of this page for any registration-related queries." }
  ];

  return (
    <>
      {/* Next Steps Section */}
      <motion.section
        initial={{ opacity: 0, y: 100 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="py-32 px-6"
      >
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-bold text-center mb-16 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400">
            Next Steps & Updates
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { emoji: "🎉", title: "Round 1 Results", subtitle: "PPT Round Results", date: "NOW AVAILABLE!", color: "emerald" },
              { emoji: "📱", title: "WhatsApp Group", subtitle: "Team Leaders Only", date: "Check your WhatsApp!", color: "purple" },
              { emoji: "✅", title: "Registration Status", subtitle: "All Registrations", date: "Closed Successfully", color: "cyan" }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                viewport={{ once: true }}
              >
                <div className="text-center bg-slate-800/40 p-8 rounded-3xl border border-slate-700 h-full">
                  <div className="text-5xl mb-4">{item.emoji}</div>
                  <h3 className={`text-2xl font-bold text-${item.color}-400 mb-2`}>{item.title}</h3>
                  <p className="text-slate-300 mb-2">{item.subtitle}</p>
                  <p className={`text-${item.color}-300 font-semibold`}>{item.date}</p>
                </div>

              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* FAQ Section */}
      <motion.section
        initial={{ opacity: 0, y: 100 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="py-32 px-6 bg-slate-900/50"
      >
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-bold text-center mb-16 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-6">
            {FAQ_DATA.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <div className="bg-slate-800/40 rounded-2xl overflow-hidden border border-slate-700">
                  <motion.button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full text-left p-6 font-semibold text-lg flex justify-between items-center"
                    whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}
                  >
                    <span>{faq.q}</span>
                    <motion.span
                      animate={{ rotate: openFaq === index ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="text-cyan-400"
                    >
                      ▼
                    </motion.span>
                  </motion.button>
                  
                  <AnimatePresence>
                    {openFaq === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="p-6 border-t border-slate-700 text-slate-300 bg-slate-800/30">
                          {faq.a}
                        </div>
                      </motion.div>

                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Contact Section */}
      <motion.section
        initial={{ opacity: 0, y: 100 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="py-32 px-6"
      >
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-bold text-center mb-16 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400">
            Need Help?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {[
              { name: "Vikas Singh", phone: "+91 9039389755", instagram: "xvikasingh17" },
              { name: "Gautam Jaiswani", phone: "+91 9131510118", instagram: "gautamjaiswani_" }
            ].map((contact, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                viewport={{ once: true }}
              >
                <div className="text-center bg-slate-800/40 p-8 rounded-3xl border border-slate-700">
                  <p className="text-xl text-slate-300 mb-2">{contact.name}</p>
                  <p className="font-mono text-cyan-400 text-lg mb-4">{contact.phone}</p>
                  <motion.a
                    href={`https://www.instagram.com/${contact.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-300 transition-colors"
                    whileHover={{ scale: 1.05 }}
                  >
                    <span>📷</span>
                    <span>@{contact.instagram}</span>
                  </motion.a>
                </div>

              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>
    </>
  );
};

// Main SIH Home Page Component
const SIHHomePage = ({ setPage }) => {
  return (
    <>
      <SIHFluidHero setPage={setPage} />
      <SIHContentSections />
    </>
  );
};

export default SIHHomePage;