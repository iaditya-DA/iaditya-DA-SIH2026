import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';

// Liquid Blob Component
const LiquidBlob = ({ className, delay = 0 }) => {
  return (
    <motion.div
      className={`absolute rounded-full filter blur-xl opacity-70 ${className}`}
      animate={{
        scale: [1, 1.2, 1],
        rotate: [0, 180, 360],
        x: [0, 50, 0],
        y: [0, -30, 0],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        delay,
        ease: "easeInOut"
      }}
    />
  );
};

// Floating Particles
const FloatingParticles = () => {
  const particles = Array.from({ length: 20 }, (_, i) => i);
  
  return (
    <div className="absolute inset-0 overflow-hidden">
      {particles.map(i => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-cyan-400 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [-20, -100],
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: "easeOut"
          }}
        />
      ))}
    </div>
  );
};

// Morphing Text Component
const MorphingText = ({ children, className = "" }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const ref = useRef(null);

  const handleMouseMove = (e) => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  return (
    <motion.div
      ref={ref}
      className={`relative cursor-pointer ${className}`}
      onMouseMove={handleMouseMove}
      whileHover={{ scale: 1.05 }}
    >
      <motion.div
        className="relative z-10"
        animate={{
          rotateX: (mousePosition.y - 50) * 0.1,
          rotateY: (mousePosition.x - 50) * 0.1,
        }}
        transition={{ type: "spring", stiffness: 150, damping: 20 }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

// Main Fluid Hero Component
const FluidHero = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.5, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.8]);

  const smoothY = useSpring(y, { stiffness: 400, damping: 40 });

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <motion.section
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"
      style={{ y: smoothY, opacity, scale }}
    >
      {/* Floating Particles */}
      <FloatingParticles />

      {/* Liquid Background Blobs */}
      <LiquidBlob 
        className="w-96 h-96 bg-gradient-to-br from-cyan-500/30 to-blue-500/30 top-10 left-10" 
        delay={0}
      />
      <LiquidBlob 
        className="w-80 h-80 bg-gradient-to-br from-purple-500/25 to-pink-500/25 bottom-20 right-20" 
        delay={2}
      />
      <LiquidBlob 
        className="w-64 h-64 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 top-1/2 left-1/4" 
        delay={4}
      />

      {/* Mouse-following gradient */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(600px circle at ${(mousePosition.x + 1) * 50}% ${(mousePosition.y + 1) * 50}%, rgba(6, 182, 212, 0.1), transparent 40%)`,
        }}
      />

      {/* Main Content */}
      <div className="relative z-10 text-center px-6 max-w-6xl mx-auto">
        {/* Animated Title */}
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <MorphingText className="mb-8">
            <h1 className="text-6xl md:text-8xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 leading-tight">
              SIH 2025
            </h1>
          </MorphingText>
        </motion.div>

        {/* Subtitle with typewriter effect */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="mb-12"
        >
          <h2 className="text-2xl md:text-4xl text-white/90 font-light">
            Navigate Your Digital Journey
          </h2>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ delay: 1, duration: 2, ease: "easeInOut" }}
            className="h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent mt-4 mx-auto max-w-md"
          />
        </motion.div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto mb-12 leading-relaxed"
        >
          The more data you contribute to Navigate, the more your Navigator learns from your 
          data habits and interests, creating a one-of-a-kind reflection of your digital journey.
        </motion.p>

        {/* Interactive Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 0.8 }}
          className="flex flex-col sm:flex-row gap-6 justify-center items-center"
        >
          <motion.button
            className="group relative px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full text-white font-semibold text-lg overflow-hidden"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100"
              transition={{ duration: 0.3 }}
            />
            <span className="relative z-10">Explore Journey</span>
            <motion.div
              className="absolute inset-0 bg-white/20 rounded-full"
              initial={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
          </motion.button>

          <motion.button
            className="group relative px-8 py-4 border-2 border-white/30 rounded-full text-white font-semibold text-lg backdrop-blur-sm hover:border-cyan-400 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="relative z-10">Learn More</span>
            <motion.div
              className="absolute inset-0 bg-cyan-400/10 rounded-full"
              initial={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
          </motion.button>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3, duration: 1 }}
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

export default FluidHero;