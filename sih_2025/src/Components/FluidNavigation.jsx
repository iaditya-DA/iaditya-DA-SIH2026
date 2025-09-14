import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FluidNavigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeItem, setActiveItem] = useState('home');
  const cursorRef = useRef(null);

  const menuItems = [
    { id: 'home', label: 'Home', href: '#home' },
    { id: 'about', label: 'About', href: '#about' },
    { id: 'journey', label: 'Journey', href: '#journey' },
    { id: 'data', label: 'Data Quest', href: '#data' },
    { id: 'contact', label: 'Contact', href: '#contact' }
  ];

  const handleMouseMove = (e) => {
    if (cursorRef.current) {
      cursorRef.current.style.left = e.clientX + 'px';
      cursorRef.current.style.top = e.clientY + 'px';
    }
  };

  return (
    <>
      {/* Custom Cursor */}
      <motion.div
        ref={cursorRef}
        className="fixed w-6 h-6 bg-cyan-400/30 rounded-full pointer-events-none z-50 mix-blend-difference"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
      />

      {/* Navigation Bar */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-40 p-6"
        onMouseMove={handleMouseMove}
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4"
            whileHover={{ scale: 1.02, y: -2 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            {/* Animated background blob */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-2xl"
              animate={{
                scale: [1, 1.05, 1],
                rotate: [0, 1, 0],
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />

            <div className="relative flex items-center justify-between">
              {/* Logo */}
              <motion.div
                className="flex items-center space-x-3"
                whileHover={{ scale: 1.05 }}
              >
                <motion.div
                  className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-xl flex items-center justify-center"
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <span className="text-white font-bold text-lg">N</span>
                </motion.div>
                <span className="text-white font-bold text-xl hidden sm:block">Navigate</span>
              </motion.div>

              {/* Desktop Menu */}
              <div className="hidden md:flex items-center space-x-8">
                {menuItems.map((item) => (
                  <motion.a
                    key={item.id}
                    href={item.href}
                    className={`relative px-4 py-2 rounded-lg transition-colors ${
                      activeItem === item.id ? 'text-cyan-400' : 'text-white/80 hover:text-white'
                    }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onHoverStart={() => setActiveItem(item.id)}
                  >
                    <span className="relative z-10">{item.label}</span>
                    
                    {/* Active indicator */}
                    <AnimatePresence>
                      {activeItem === item.id && (
                        <motion.div
                          className="absolute inset-0 bg-cyan-500/20 rounded-lg"
                          layoutId="activeTab"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ type: "spring", stiffness: 400, damping: 20 }}
                        />
                      )}
                    </AnimatePresence>

                    {/* Hover effect */}
                    <motion.div
                      className="absolute inset-0 bg-white/5 rounded-lg opacity-0"
                      whileHover={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                  </motion.a>
                ))}
              </div>

              {/* CTA Button */}
              <motion.button
                className="hidden sm:block relative group px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full text-white font-semibold overflow-hidden"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500"
                  initial={{ x: "100%" }}
                  whileHover={{ x: "0%" }}
                  transition={{ duration: 0.3 }}
                />
                <span className="relative z-10">Start Quest</span>
              </motion.button>

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
          </motion.div>
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
              <motion.div
                className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <div className="space-y-4">
                  {menuItems.map((item, index) => (
                    <motion.a
                      key={item.id}
                      href={item.href}
                      className="block px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      onClick={() => setIsMenuOpen(false)}
                      whileHover={{ scale: 1.02, x: 5 }}
                    >
                      {item.label}
                    </motion.a>
                  ))}
                  
                  <motion.button
                    className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg text-white font-semibold mt-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Start Quest
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
};

export default FluidNavigation;