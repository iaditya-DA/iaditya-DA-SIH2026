import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import FluidNavigation from '../Components/FluidNavigation.jsx';
import FluidHero from '../Components/FluidHero.jsx';
import FluidContentSections from '../Components/FluidContentSections.jsx';

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

// Liquid cursor component
const LiquidCursor = () => {
  const cursorRef = useRef(null);
  const cursorInnerRef = useRef(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const cursorInner = cursorInnerRef.current;
    
    if (!cursor || !cursorInner) return;

    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;
    let innerX = 0, innerY = 0;

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const animateCursor = () => {
      // Main cursor with spring effect
      cursorX += (mouseX - cursorX) * 0.1;
      cursorY += (mouseY - cursorY) * 0.1;
      
      // Inner cursor with more delay
      innerX += (mouseX - innerX) * 0.2;
      innerY += (mouseY - innerY) * 0.2;

      cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0)`;
      cursorInner.style.transform = `translate3d(${innerX}px, ${innerY}px, 0)`;
      
      requestAnimationFrame(animateCursor);
    };

    const handleMouseEnter = () => {
      cursor.style.opacity = '1';
      cursorInner.style.opacity = '1';
    };

    const handleMouseLeave = () => {
      cursor.style.opacity = '0';
      cursorInner.style.opacity = '0';
    };

    const handleMouseDown = () => {
      cursor.style.transform += ' scale(0.8)';
      cursorInner.style.transform += ' scale(1.5)';
    };

    const handleMouseUp = () => {
      cursor.style.transform = cursor.style.transform.replace(' scale(0.8)', '');
      cursorInner.style.transform = cursorInner.style.transform.replace(' scale(1.5)', '');
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);

    animateCursor();

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <>
      <div
        ref={cursorRef}
        className="fixed w-8 h-8 pointer-events-none z-50 mix-blend-difference opacity-0 transition-opacity duration-300"
        style={{
          background: 'radial-gradient(circle, rgba(6,182,212,0.8) 0%, rgba(139,92,246,0.4) 100%)',
          borderRadius: '50%',
          filter: 'blur(1px)',
        }}
      />
      <div
        ref={cursorInnerRef}
        className="fixed w-2 h-2 pointer-events-none z-50 opacity-0 transition-opacity duration-300"
        style={{
          background: '#ffffff',
          borderRadius: '50%',
          filter: 'blur(0.5px)',
        }}
      />
    </>
  );
};

// Main fluid website component
const FluidWebsite = () => {
  useSmoothScroll();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="min-h-screen bg-slate-900 text-white overflow-x-hidden"
    >
      {/* Custom Cursor */}
      <LiquidCursor />

      {/* Navigation */}
      <FluidNavigation />

      {/* Hero Section */}
      <section id="home">
        <FluidHero />
      </section>

      {/* Content Sections */}
      <section id="about">
        <FluidContentSections />
      </section>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="relative py-20 px-6 border-t border-white/10"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center space-x-3 mb-6">
                <motion.div
                  className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-xl flex items-center justify-center"
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <span className="text-white font-bold text-xl">N</span>
                </motion.div>
                <span className="text-white font-bold text-2xl">Navigate</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                Discover your digital journey through personalized navigation and intelligent data insights.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h4 className="text-white font-semibold text-lg mb-6">Quick Links</h4>
              <div className="space-y-3">
                {['Home', 'About', 'Journey', 'Data Quest', 'Contact'].map((link, index) => (
                  <motion.a
                    key={link}
                    href={`#${link.toLowerCase().replace(' ', '')}`}
                    className="block text-slate-300 hover:text-cyan-400 transition-colors"
                    whileHover={{ x: 5 }}
                  >
                    {link}
                  </motion.a>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h4 className="text-white font-semibold text-lg mb-6">Connect</h4>
              <div className="space-y-4">
                <motion.button
                  className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg text-white font-semibold"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Start Your Journey
                </motion.button>
                
                <div className="flex space-x-4">
                  {['Twitter', 'LinkedIn', 'GitHub'].map((social) => (
                    <motion.a
                      key={social}
                      href="#"
                      className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-cyan-500/20 transition-colors"
                      whileHover={{ scale: 1.1, y: -2 }}
                    >
                      {social[0]}
                    </motion.a>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            viewport={{ once: true }}
            className="border-t border-white/10 mt-12 pt-8 text-center"
          >
            <p className="text-slate-400">
              © 2025 Navigate. Crafted with ❤️ for digital explorers.
            </p>
          </motion.div>
        </div>

        {/* Background decoration */}
        <motion.div
          className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 2 }}
          viewport={{ once: true }}
        >
          <motion.div
            className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
        </motion.div>
      </motion.footer>
    </motion.div>
  );
};

export default FluidWebsite;