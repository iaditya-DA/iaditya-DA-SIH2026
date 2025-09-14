import React, { useEffect, useRef } from 'react';

// Cyberpunk Grid with Electrical Effects
export const CyberpunkGrid = () => {
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

        const gridSize = 50;
        let time = 0;

        const drawGrid = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            const rows = Math.ceil(canvas.height / gridSize);
            const cols = Math.ceil(canvas.width / gridSize);

            // Draw grid lines with glow effect
            ctx.shadowColor = '#00ffff';
            ctx.shadowBlur = 3;
            ctx.strokeStyle = 'rgba(0, 255, 255, 0.3)';
            ctx.lineWidth = 1;

            // Vertical lines
            for (let i = 0; i <= cols; i++) {
                const x = i * gridSize;
                const intensity = 0.3 + 0.7 * Math.sin(time * 0.01 + i * 0.5);
                
                ctx.globalAlpha = intensity * 0.5;
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvas.height);
                ctx.stroke();
            }

            // Horizontal lines
            for (let i = 0; i <= rows; i++) {
                const y = i * gridSize;
                const intensity = 0.3 + 0.7 * Math.sin(time * 0.015 + i * 0.3);
                
                ctx.globalAlpha = intensity * 0.5;
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width, y);
                ctx.stroke();
            }

            // Draw electrical sparks at random intersections
            ctx.shadowBlur = 10;
            for (let i = 0; i < 5; i++) {
                if (Math.random() > 0.95) {
                    const x = Math.floor(Math.random() * cols) * gridSize;
                    const y = Math.floor(Math.random() * rows) * gridSize;
                    
                    ctx.globalAlpha = 1;
                    ctx.fillStyle = '#00ffff';
                    ctx.beginPath();
                    ctx.arc(x, y, 3, 0, Math.PI * 2);
                    ctx.fill();
                    
                    // Lightning effect
                    ctx.strokeStyle = '#ffffff';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(x, y);
                    ctx.lineTo(x + (Math.random() - 0.5) * 30, y + (Math.random() - 0.5) * 30);
                    ctx.stroke();
                }
            }

            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1;
            time++;
        };

        const animate = () => {
            drawGrid();
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
            className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
        />
    );
};

// Neural Network Animation
export const NeuralNetwork = () => {
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

        class Node {
            constructor(x, y) {
                this.x = x;
                this.y = y;
                this.connections = [];
                this.pulse = Math.random() * Math.PI * 2;
                this.pulseSpeed = 0.02 + Math.random() * 0.03;
            }

            update() {
                this.pulse += this.pulseSpeed;
            }

            draw() {
                const intensity = 0.5 + 0.5 * Math.sin(this.pulse);
                
                ctx.shadowColor = '#8b5cf6';
                ctx.shadowBlur = 15;
                ctx.fillStyle = `rgba(139, 92, 246, ${intensity})`;
                ctx.beginPath();
                ctx.arc(this.x, this.y, 4 + intensity * 3, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            }

            drawConnections() {
                this.connections.forEach(connection => {
                    const signal = 0.3 + 0.7 * Math.sin(this.pulse + connection.phase);
                    
                    ctx.strokeStyle = `rgba(139, 92, 246, ${signal * 0.6})`;
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(this.x, this.y);
                    ctx.lineTo(connection.node.x, connection.node.y);
                    ctx.stroke();

                    // Draw signal pulse
                    const progress = (Math.sin(this.pulse * 2 + connection.phase) + 1) / 2;
                    const signalX = this.x + (connection.node.x - this.x) * progress;
                    const signalY = this.y + (connection.node.y - this.y) * progress;
                    
                    ctx.shadowColor = '#06b6d4';
                    ctx.shadowBlur = 10;
                    ctx.fillStyle = '#06b6d4';
                    ctx.beginPath();
                    ctx.arc(signalX, signalY, 2, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.shadowBlur = 0;
                });
            }
        }

        const nodes = [];
        const nodeCount = 30;

        // Create nodes
        for (let i = 0; i < nodeCount; i++) {
            nodes.push(new Node(
                Math.random() * canvas.width,
                Math.random() * canvas.height
            ));
        }

        // Create connections
        nodes.forEach(node => {
            const connectionCount = Math.floor(Math.random() * 4) + 1;
            for (let i = 0; i < connectionCount; i++) {
                const targetNode = nodes[Math.floor(Math.random() * nodes.length)];
                if (targetNode !== node) {
                    node.connections.push({
                        node: targetNode,
                        phase: Math.random() * Math.PI * 2
                    });
                }
            }
        });

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            nodes.forEach(node => {
                node.update();
                node.drawConnections();
            });

            nodes.forEach(node => {
                node.draw();
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
            className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 opacity-70"
        />
    );
};

// DNA Helix Animation
export const DNAHelix = () => {
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

        let time = 0;

        const drawHelix = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const centerX = canvas.width / 2;
            const amplitude = 100;
            const frequency = 0.01;

            for (let y = 0; y < canvas.height; y += 10) {
                const t = y * frequency + time;
                
                // First strand
                const x1 = centerX + Math.sin(t) * amplitude;
                // Second strand (180 degrees out of phase)
                const x2 = centerX + Math.sin(t + Math.PI) * amplitude;

                // Draw strand points
                ctx.shadowColor = '#06b6d4';
                ctx.shadowBlur = 8;
                ctx.fillStyle = '#06b6d4';
                ctx.beginPath();
                ctx.arc(x1, y, 3, 0, Math.PI * 2);
                ctx.fill();

                ctx.shadowColor = '#8b5cf6';
                ctx.fillStyle = '#8b5cf6';
                ctx.beginPath();
                ctx.arc(x2, y, 3, 0, Math.PI * 2);
                ctx.fill();

                // Draw connections every 40px
                if (y % 40 === 0) {
                    ctx.shadowBlur = 3;
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(x1, y);
                    ctx.lineTo(x2, y);
                    ctx.stroke();
                }
            }

            ctx.shadowBlur = 0;
            time += 0.02;
        };

        const animate = () => {
            drawHelix();
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

// Ultimate Cyberpunk Background
export const CyberpunkBackground = () => {
    return (
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
            {/* Base dark gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900/20 to-cyan-900/20"></div>
            
            {/* Multiple effect layers */}
            <CyberpunkGrid />
            <NeuralNetwork />
            
            {/* Additional glowing elements */}
            <div className="absolute inset-0">
                <div className="absolute top-10 left-10 w-2 h-2 bg-cyan-400 rounded-full animate-ping"></div>
                <div className="absolute top-1/4 right-20 w-1 h-1 bg-purple-400 rounded-full animate-pulse"></div>
                <div className="absolute bottom-1/3 left-1/4 w-1.5 h-1.5 bg-pink-400 rounded-full animate-ping animation-delay-1000"></div>
                <div className="absolute top-1/2 right-1/3 w-1 h-1 bg-cyan-300 rounded-full animate-pulse animation-delay-2000"></div>
            </div>
        </div>
    );
};

export default CyberpunkBackground;