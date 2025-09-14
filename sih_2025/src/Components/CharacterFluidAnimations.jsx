import React, { useRef, useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

// Character-style Blob Component inspired by nvg8.io
export const CharacterBlob = ({ className = "", size = 200, color = "cyan", delay = 0 }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const blobRef = useRef(null);

  const handleMouseMove = (e) => {
    if (blobRef.current) {
      const rect = blobRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      setMousePosition({
        x: (e.clientX - centerX) / rect.width,
        y: (e.clientY - centerY) / rect.height
      });
    }
  };

  // Character-like morphing paths
  const morphingPaths = [
    "M200,100 C200,44.77 155.23,0 100,0 C44.77,0 0,44.77 0,100 C0,155.23 44.77,200 100,200 C155.23,200 200,155.23 200,100 Z",
    "M180,120 C190,50 150,10 100,5 C50,10 10,50 20,120 C10,170 50,190 100,195 C150,190 190,170 180,120 Z",
    "M170,100 C170,45 135,15 100,20 C65,15 30,45 30,100 C30,155 65,185 100,180 C135,185 170,155 170,100 Z",
    "M190,110 C185,40 145,5 100,10 C55,5 15,40 10,110 C15,180 55,195 100,190 C145,195 185,180 190,110 Z"
  ];

  const [currentPath, setCurrentPath] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPath((prev) => (prev + 1) % morphingPaths.length);
    }, 3000 + delay * 1000);

    return () => clearInterval(interval);
  }, [delay, morphingPaths.length]);

  const colorMap = {
    cyan: { from: '#06b6d4', to: '#0891b2', shadow: '6, 182, 212' },
    purple: { from: '#8b5cf6', to: '#7c3aed', shadow: '139, 92, 246' },
    pink: { from: '#ec4899', to: '#db2777', shadow: '236, 72, 153' },
    emerald: { from: '#10b981', to: '#059669', shadow: '16, 185, 129' }
  };

  const colors = colorMap[color] || colorMap.cyan;

  return (
    <motion.div
      ref={blobRef}
      className={`absolute ${className}`}
      style={{ width: size, height: size }}
      onMouseMove={handleMouseMove}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 1, type: "spring" }}
    >
      <motion.svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        className="absolute inset-0"
        animate={{
          rotate: [0, 360],
          scale: [1, 1.1, 1],
        }}
        transition={{
          rotate: { duration: 20, repeat: Infinity, ease: "linear" },
          scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
        }}
      >
        <defs>
          <radialGradient id={`blob-gradient-${color}-${delay}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={colors.from} stopOpacity="0.8" />
            <stop offset="100%" stopColor={colors.to} stopOpacity="0.3" />
          </radialGradient>
          <filter id={`blob-glow-${color}-${delay}`}>
            <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        <motion.path
          d={morphingPaths[currentPath]}
          fill={`url(#blob-gradient-${color}-${delay})`}
          filter={`url(#blob-glow-${color}-${delay})`}
          animate={{
            d: morphingPaths[currentPath],
            scale: [1, 1.05, 1],
          }}
          transition={{
            d: { duration: 2, ease: "easeInOut" },
            scale: { duration: 3, repeat: Infinity, ease: "easeInOut" }
          }}
          style={{
            transformOrigin: "center",
            filter: `drop-shadow(0 0 20px rgba(${colors.shadow}, 0.4))`
          }}
        />
        
        {/* Character-like eyes/features */}
        <motion.circle
          cx={80 + mousePosition.x * 10}
          cy={80 + mousePosition.y * 5}
          r="8"
          fill="rgba(255, 255, 255, 0.9)"
          animate={{
            opacity: [0.7, 1, 0.7],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <motion.circle
          cx={120 + mousePosition.x * 10}
          cy={80 + mousePosition.y * 5}
          r="8"
          fill="rgba(255, 255, 255, 0.9)"
          animate={{
            opacity: [1, 0.7, 1],
          }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
        />
        
        {/* Character mouth */}
        <motion.path
          d={`M85,120 Q100,${130 + mousePosition.y * 5} 115,120`}
          stroke="rgba(255, 255, 255, 0.8)"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          animate={{
            d: [
              "M85,120 Q100,130 115,120",
              "M85,120 Q100,135 115,120",
              "M85,120 Q100,130 115,120"
            ]
          }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      </motion.svg>
    </motion.div>
  );
};

// Floating Character Elements
export const FloatingCharacterElements = () => {
  const elements = [
    { id: 1, emoji: "🚀", size: 40, color: "cyan" },
    { id: 2, emoji: "💡", size: 35, color: "purple" },
    { id: 3, emoji: "⚡", size: 45, color: "pink" },
    { id: 4, emoji: "🎯", size: 38, color: "emerald" },
    { id: 5, emoji: "✨", size: 32, color: "cyan" },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {elements.map((element, index) => (
        <motion.div
          key={element.id}
          className="absolute"
          style={{
            left: `${20 + (index * 15)}%`,
            top: `${30 + (index * 10)}%`,
          }}
          animate={{
            y: [-20, 20, -20],
            x: [-10, 10, -10],
            rotate: [0, 360],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 6 + index,
            repeat: Infinity,
            ease: "easeInOut",
            delay: index * 0.5
          }}
        >
          <motion.div
            className="relative"
            whileHover={{ scale: 1.3 }}
            style={{ fontSize: element.size }}
          >
            {element.emoji}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background: `radial-gradient(circle, rgba(${element.color === 'cyan' ? '6, 182, 212' : element.color === 'purple' ? '139, 92, 246' : element.color === 'pink' ? '236, 72, 153' : '16, 185, 129'}, 0.2) 0%, transparent 70%)`,
                filter: `blur(10px)`,
              }}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
};

// Interactive Character Morphing Container
export const InteractiveCharacterMorph = ({ children, className = "" }) => {
  const containerRef = useRef(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 150 };
  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);

  const rotateX = useTransform(y, [-0.5, 0.5], [5, -5]);
  const rotateY = useTransform(x, [-0.5, 0.5], [-5, 5]);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    mouseX.set((e.clientX - centerX) / rect.width);
    mouseY.set((e.clientY - centerY) / rect.height);
  };

  return (
    <motion.div
      ref={containerRef}
      className={`relative ${className}`}
      onMouseMove={handleMouseMove}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {children}
      
      {/* Morphing background effect */}
      <motion.div
        className="absolute inset-0 rounded-2xl"
        style={{
          background: `radial-gradient(circle at ${x.get() * 50 + 50}% ${y.get() * 50 + 50}%, rgba(6, 182, 212, 0.1) 0%, transparent 50%)`,
        }}
        animate={{
          background: [
            "radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.1) 0%, transparent 50%)",
            "radial-gradient(circle at 60% 40%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)",
            "radial-gradient(circle at 40% 60%, rgba(236, 72, 153, 0.1) 0%, transparent 50%)",
            "radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.1) 0%, transparent 50%)",
          ]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.div>
  );
};

// Character Trail Effect
export const CharacterTrail = () => {
  const [trails, setTrails] = useState([]);
  const trailRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const newTrail = {
        id: Date.now(),
        x: e.clientX,
        y: e.clientY,
        opacity: 1,
      };

      setTrails(prev => [...prev.slice(-20), newTrail]);

      setTimeout(() => {
        setTrails(prev => prev.filter(trail => trail.id !== newTrail.id));
      }, 1000);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      {trails.map((trail, index) => (
        <motion.div
          key={trail.id}
          className="absolute w-4 h-4 rounded-full"
          style={{
            left: trail.x - 8,
            top: trail.y - 8,
            background: `radial-gradient(circle, rgba(6, 182, 212, ${1 - index * 0.05}) 0%, transparent 70%)`,
          }}
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: [0, 1, 0], opacity: [1, 0.5, 0] }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      ))}
    </div>
  );
};

// Main Character Animation Scene
export const CharacterAnimationScene = ({ className = "" }) => {
  return (
    <div className={`relative ${className}`}>
      {/* Character Trail */}
      <CharacterTrail />
      
      {/* Main Character Blobs */}
      <CharacterBlob 
        className="top-10 left-10" 
        size={300} 
        color="cyan" 
        delay={0} 
      />
      <CharacterBlob 
        className="bottom-20 right-20" 
        size={250} 
        color="purple" 
        delay={2} 
      />
      <CharacterBlob 
        className="top-1/2 left-1/4" 
        size={200} 
        color="pink" 
        delay={4} 
      />
      <CharacterBlob 
        className="bottom-1/3 left-2/3" 
        size={180} 
        color="emerald" 
        delay={1} 
      />
      
      {/* Floating Character Elements */}
      <FloatingCharacterElements />
      
      {/* Interactive Morphing Overlay */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(circle at 20% 30%, rgba(6, 182, 212, 0.1) 0%, transparent 40%),
            radial-gradient(circle at 80% 70%, rgba(139, 92, 246, 0.1) 0%, transparent 40%),
            radial-gradient(circle at 60% 20%, rgba(236, 72, 153, 0.1) 0%, transparent 40%)
          `,
        }}
        animate={{
          background: [
            `radial-gradient(circle at 20% 30%, rgba(6, 182, 212, 0.1) 0%, transparent 40%),
             radial-gradient(circle at 80% 70%, rgba(139, 92, 246, 0.1) 0%, transparent 40%),
             radial-gradient(circle at 60% 20%, rgba(236, 72, 153, 0.1) 0%, transparent 40%)`,
            `radial-gradient(circle at 30% 70%, rgba(236, 72, 153, 0.1) 0%, transparent 40%),
             radial-gradient(circle at 70% 30%, rgba(6, 182, 212, 0.1) 0%, transparent 40%),
             radial-gradient(circle at 50% 80%, rgba(139, 92, 246, 0.1) 0%, transparent 40%)`,
            `radial-gradient(circle at 80% 40%, rgba(139, 92, 246, 0.1) 0%, transparent 40%),
             radial-gradient(circle at 20% 80%, rgba(236, 72, 153, 0.1) 0%, transparent 40%),
             radial-gradient(circle at 70% 10%, rgba(6, 182, 212, 0.1) 0%, transparent 40%)`,
          ]
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
};

export default CharacterAnimationScene;