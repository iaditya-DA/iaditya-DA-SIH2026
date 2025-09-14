import React, { useEffect, useRef, useState } from 'react';

// Interactive Particle Network Background
export const ParticleNetwork = () => {
    const canvasRef = useRef(null);
    const animationRef = useRef(null);
    const mouseRef = useRef({ x: 0, y: 0 });

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
                this.vx = (Math.random() - 0.5) * 0.8;
                this.vy = (Math.random() - 0.5) * 0.8;
                this.radius = Math.random() * 3 + 1;
                this.opacity = Math.random() * 0.6 + 0.4;
                this.originalRadius = this.radius;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
                if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

                // Mouse interaction - make particles larger when close to mouse
                const dx = this.x - mouseRef.current.x;
                const dy = this.y - mouseRef.current.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 100) {
                    this.radius = this.originalRadius * (1.5 + (100 - distance) / 100);
                } else {
                    this.radius = this.originalRadius;
                }
            }

            draw() {
                // Glow effect
                ctx.shadowColor = '#06b6d4';
                ctx.shadowBlur = 10;
                
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                
                const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
                gradient.addColorStop(0, `rgba(6, 182, 212, ${this.opacity})`);
                gradient.addColorStop(1, `rgba(6, 182, 212, 0)`);
                
                ctx.fillStyle = gradient;
                ctx.fill();
                
                ctx.shadowBlur = 0;
            }
        }

        // Initialize particles
        for (let i = 0; i < 120; i++) {
            particles.push(new Particle());
        }

        const handleMouseMove = (e) => {
            mouseRef.current = { x: e.clientX, y: e.clientY };
        };
        
        window.addEventListener('mousemove', handleMouseMove);

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach(particle => {
                particle.update();
                particle.draw();
            });

            // Draw connections
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 150) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        
                        const opacity = (150 - distance) / 150 * 0.5;
                        ctx.strokeStyle = `rgba(6, 182, 212, ${opacity})`;
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }
                }

                // Mouse connections
                const dx = particles[i].x - mouseRef.current.x;
                const dy = particles[i].y - mouseRef.current.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 200) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(mouseRef.current.x, mouseRef.current.y);
                    
                    const opacity = (200 - distance) / 200 * 0.8;
                    ctx.strokeStyle = `rgba(139, 92, 246, ${opacity})`;
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }
            }

            animationRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('mousemove', handleMouseMove);
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
            style={{ background: 'transparent' }}
        />
    );
};

// Matrix Rain Effect
export const MatrixRain = () => {
    const canvasRef = useRef(null);
    const animationRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        const columns = Math.floor(canvas.width / 20);
        const drops = Array(columns).fill(1);
        
        const chars = '01';
        
        const draw = () => {
            ctx.fillStyle = 'rgba(15, 23, 42, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.fillStyle = '#0f9';
            ctx.font = '15px monospace';
            
            for (let i = 0; i < drops.length; i++) {
                const text = chars[Math.floor(Math.random() * chars.length)];
                ctx.fillText(text, i * 20, drops[i] * 20);
                
                if (drops[i] * 20 > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
        };

        const animate = () => {
            draw();
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
            className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 opacity-30"
        />
    );
};

// Floating Geometric Shapes
export const GeometricShapes = () => {
    const containerRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const shapes = [];
        const shapeCount = 20;

        for (let i = 0; i < shapeCount; i++) {
            const shape = document.createElement('div');
            const isTriangle = Math.random() > 0.5;
            
            if (isTriangle) {
                shape.className = 'geometric-triangle';
            } else {
                shape.className = 'geometric-hexagon';
            }
            
            // Random positioning and animation
            shape.style.left = Math.random() * 100 + 'vw';
            shape.style.animationDelay = Math.random() * 20 + 's';
            shape.style.animationDuration = (Math.random() * 10 + 15) + 's';
            
            container.appendChild(shape);
            shapes.push(shape);
        }

        return () => {
            shapes.forEach(shape => shape.remove());
        };
    }, []);

    return (
        <>
            <div ref={containerRef} className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden" />
            <style jsx>{`
                .geometric-triangle {
                    position: absolute;
                    width: 0;
                    height: 0;
                    border-left: 15px solid transparent;
                    border-right: 15px solid transparent;
                    border-bottom: 25px solid rgba(6, 182, 212, 0.3);
                    animation: float-geometric infinite linear;
                    filter: blur(1px);
                }
                
                .geometric-hexagon {
                    position: absolute;
                    width: 20px;
                    height: 20px;
                    background: rgba(139, 92, 246, 0.3);
                    clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
                    animation: float-geometric infinite linear;
                    filter: blur(1px);
                }
                
                @keyframes float-geometric {
                    0% {
                        transform: translateY(100vh) rotate(0deg);
                        opacity: 0;
                    }
                    10% {
                        opacity: 1;
                    }
                    90% {
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(-100px) rotate(360deg);
                        opacity: 0;
                    }
                }
            `}</style>
        </>
    );
};

// Wave Animation Background
export const WaveBackground = () => {
    return (
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
            <svg
                className="absolute bottom-0 left-0 w-full h-full"
                viewBox="0 0 1200 800"
                preserveAspectRatio="none"
            >
                <defs>
                    <linearGradient id="waveGradient1" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="rgba(6, 182, 212, 0.3)" />
                        <stop offset="100%" stopColor="rgba(6, 182, 212, 0.1)" />
                    </linearGradient>
                    <linearGradient id="waveGradient2" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="rgba(139, 92, 246, 0.2)" />
                        <stop offset="100%" stopColor="rgba(139, 92, 246, 0.05)" />
                    </linearGradient>
                </defs>
                
                <path
                    d="M0,800 Q300,700 600,750 T1200,700 L1200,800 Z"
                    fill="url(#waveGradient1)"
                    className="animate-wave-1"
                />
                <path
                    d="M0,800 Q400,650 800,700 T1200,650 L1200,800 Z"
                    fill="url(#waveGradient2)"
                    className="animate-wave-2"
                />
            </svg>
            
            <style jsx>{`
                @keyframes wave-1 {
                    0%, 100% { d: path("M0,800 Q300,700 600,750 T1200,700 L1200,800 Z"); }
                    50% { d: path("M0,800 Q300,750 600,700 T1200,750 L1200,800 Z"); }
                }
                
                @keyframes wave-2 {
                    0%, 100% { d: path("M0,800 Q400,650 800,700 T1200,650 L1200,800 Z"); }
                    50% { d: path("M0,800 Q400,700 800,650 T1200,700 L1200,800 Z"); }
                }
                
                .animate-wave-1 {
                    animation: wave-1 8s ease-in-out infinite;
                }
                
                .animate-wave-2 {
                    animation: wave-2 12s ease-in-out infinite reverse;
                }
            `}</style>
        </div>
    );
};

// Combined Epic Background Component
export const EpicBackground = () => {
    const [activeEffect, setActiveEffect] = useState('particles');

    // You can switch between different effects
    const effects = {
        particles: <ParticleNetwork />,
        matrix: <MatrixRain />,
        geometric: <GeometricShapes />,
        waves: <WaveBackground />
    };

    return (
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
            {/* Base gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>
            
            {/* Multiple effect layers */}
            <ParticleNetwork />
            <GeometricShapes />
            
            {/* Effect switcher (optional - for testing) */}
            {/* <div className="fixed top-20 right-4 z-50 pointer-events-auto">
                <select 
                    value={activeEffect} 
                    onChange={(e) => setActiveEffect(e.target.value)}
                    className="bg-slate-800 text-white p-2 rounded"
                >
                    <option value="particles">Particle Network</option>
                    <option value="matrix">Matrix Rain</option>
                    <option value="geometric">Geometric Shapes</option>
                    <option value="waves">Wave Animation</option>
                </select>
            </div> */}
        </div>
    );
};

export default EpicBackground;