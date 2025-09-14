import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

// Modern Floating Geometric Shapes
export const FloatingGeometry = () => {
  const shapes = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    size: Math.random() * 80 + 40,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 5,
    duration: Math.random() * 10 + 15,
    shape: ['circle', 'square', 'triangle'][Math.floor(Math.random() * 3)]
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {shapes.map((shape) => (
        <motion.div
          key={shape.id}
          className="absolute"
          style={{
            left: `${shape.x}%`,
            top: `${shape.y}%`,
            width: shape.size,
            height: shape.size,
          }}
          animate={{
            y: [-20, 20, -20],
            x: [-10, 10, -10],
            rotate: [0, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: shape.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: shape.delay
          }}
        >
          {shape.shape === 'circle' && (
            <div 
              className="w-full h-full rounded-full opacity-10 bg-gradient-to-br from-cyan-400 to-blue-500"
              style={{ filter: 'blur(2px)' }}
            />
          )}
          {shape.shape === 'square' && (
            <div 
              className="w-full h-full rounded-lg opacity-10 bg-gradient-to-br from-purple-400 to-pink-500 rotate-45"
              style={{ filter: 'blur(2px)' }}
            />
          )}
          {shape.shape === 'triangle' && (
            <div 
              className="w-full h-full opacity-10"
              style={{
                background: 'linear-gradient(45deg, rgba(16, 185, 129, 0.3), rgba(6, 182, 212, 0.3))',
                clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
                filter: 'blur(2px)'
              }}
            />
          )}
        </motion.div>
      ))}
    </div>
  );
};

// Subtle Particle System
export const SubtleParticles = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.3;
        this.vy = (Math.random() - 0.5) * 0.3;
        this.radius = Math.random() * 2 + 0.5;
        this.opacity = Math.random() * 0.3 + 0.1;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(6, 182, 212, ${this.opacity})`;
        ctx.fill();
      }
    }

    // Create fewer particles for subtlety
    for (let i = 0; i < 30; i++) {
      particles.push(new Particle());
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });

      // Very subtle connections
      particles.forEach((particle, i) => {
        particles.slice(i + 1).forEach(otherParticle => {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.strokeStyle = `rgba(6, 182, 212, ${0.1 - distance / 1000})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.4 }}
    />
  );
};

// Modern Gradient Orbs
export const GradientOrbs = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Large background orbs */}
      <motion.div
        className="absolute -top-40 -left-40 w-80 h-80 rounded-full opacity-20"
        style={{
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.4) 0%, rgba(59, 130, 246, 0.2) 50%, transparent 100%)',
          filter: 'blur(40px)'
        }}
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 30, 0],
          y: [0, -20, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <motion.div
        className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full opacity-15"
        style={{
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, rgba(236, 72, 153, 0.2) 50%, transparent 100%)',
          filter: 'blur(50px)'
        }}
        animate={{
          scale: [1, 1.1, 1],
          x: [0, -40, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 5
        }}
      />

      <motion.div
        className="absolute top-1/3 right-1/4 w-64 h-64 rounded-full opacity-10"
        style={{
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.3) 0%, rgba(6, 182, 212, 0.1) 70%, transparent 100%)',
          filter: 'blur(30px)'
        }}
        animate={{
          scale: [1, 1.3, 1],
          x: [0, 20, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 10
        }}
      />
    </div>
  );
};

// Grid Pattern Background
export const ModernGrid = () => {
  return (
    <div 
      className="absolute inset-0 opacity-5"
      style={{
        backgroundImage: `
          linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
      }}
    />
  );
};

// Main Modern Hero Background
export const ModernHeroBackground = ({ className = "" }) => {
  return (
    <div className={`absolute inset-0 ${className}`}>
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
      
      {/* Modern grid */}
      <ModernGrid />
      
      {/* Gradient orbs */}
      <GradientOrbs />
      
      {/* Subtle particles */}
      <SubtleParticles />
      
      {/* Floating geometry */}
      <FloatingGeometry />
      
      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/30 via-transparent to-slate-900/50" />
    </div>
  );
};

export default ModernHeroBackground;