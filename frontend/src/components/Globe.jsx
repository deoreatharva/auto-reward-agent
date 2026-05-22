import React, { useEffect, useRef } from 'react';

export default function Globe({ isInteracting }) {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const ctx = canvas.getContext('2d');
        let width, height;
        let particles = [];
        let connections = [];
        let rotation = 0;
        let currentRotationSpeed = 0.005;
        let animationFrameId;

        function resize() {
            width = container.offsetWidth;
            height = container.offsetHeight;
            canvas.width = width;
            canvas.height = height;
        }

        window.addEventListener('resize', resize);
        resize();

        class Particle {
            constructor(theta, phi) {
                this.theta = theta;
                this.phi = phi;
                this.radius = 160;
            }

            project() {
                const rotatedPhi = this.phi + rotation;
                const x = this.radius * Math.sin(this.theta) * Math.cos(rotatedPhi);
                const y = this.radius * Math.cos(this.theta);
                const z = this.radius * Math.sin(this.theta) * Math.sin(rotatedPhi);
                
                const scale = 500 / (500 + z);
                return {
                    x: width / 2 + x * scale,
                    y: height / 2 + y * scale,
                    z: z,
                    visible: z < 0
                };
            }
        }

        class Connection {
            constructor() {
                this.reset();
            }

            reset() {
                this.theta1 = Math.random() * Math.PI;
                this.phi1 = Math.random() * Math.PI * 2;
                this.theta2 = Math.random() * Math.PI;
                this.phi2 = Math.random() * Math.PI * 2;
                this.progress = 0;
                this.speed = 0.002 + Math.random() * 0.005;
                this.life = 0;
                this.maxLife = 100 + Math.random() * 200;
            }

            update() {
                const boost = isInteracting ? 4 : 1;
                this.progress += this.speed * boost;
                if (this.progress > 1) this.reset();
            }

            draw() {
                const rotatedPhi1 = this.phi1 + rotation;
                const rotatedPhi2 = this.phi2 + rotation;
                
                const p1 = this.getPoint(this.theta1, rotatedPhi1, 190);
                const p2 = this.getPoint(this.theta2, rotatedPhi2, 190);

                const midTheta = (this.theta1 + this.theta2) / 2;
                const midPhi = (rotatedPhi1 + rotatedPhi2) / 2;
                const cp = this.getPoint(midTheta, midPhi, 280);

                if (p1.z > 50 && p2.z > 50) return;

                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.quadraticCurveTo(cp.x, cp.y, p2.x, p2.y);
                
                const alpha = isInteracting ? 0.9 : 0.5;
                const gradient = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
                gradient.addColorStop(0, `rgba(121, 209, 255, 0)`);
                gradient.addColorStop(Math.max(0, this.progress - 0.2), `rgba(121, 209, 255, ${alpha})`);
                gradient.addColorStop(this.progress, `rgba(121, 209, 255, 0)`);
                
                ctx.strokeStyle = gradient;
                ctx.lineWidth = isInteracting ? 2 : 1.5;
                ctx.stroke();

                const t = this.progress;
                const hx = Math.pow(1 - t, 2) * p1.x + 2 * (1 - t) * t * cp.x + Math.pow(t, 2) * p2.x;
                const hy = Math.pow(1 - t, 2) * p1.y + 2 * (1 - t) * t * cp.y + Math.pow(t, 2) * p2.y;
                
                ctx.beginPath();
                ctx.arc(hx, hy, isInteracting ? 2.5 : 2, 0, Math.PI * 2);
                ctx.fillStyle = '#79d1ff';
                ctx.shadowBlur = isInteracting ? 15 : 5;
                ctx.shadowColor = '#79d1ff';
                ctx.fill();
                ctx.shadowBlur = 0;
            }

            getPoint(theta, phi, r = 160) {
                const x = r * Math.sin(theta) * Math.cos(phi);
                const y = r * Math.cos(theta);
                const z = r * Math.sin(theta) * Math.sin(phi);
                const scale = 500 / (500 + z);
                return { x: width / 2 + x * scale, y: height / 2 + y * scale, z: z };
            }
        }

        function init() {
            particles = [];
            connections = [];
            const rows = 45;
            const cols = 90;
            for (let i = 0; i < rows; i++) {
                const theta = (i / rows) * Math.PI;
                for (let j = 0; j < cols; j++) {
                    const phi = (j / cols) * Math.PI * 2;
                    particles.push(new Particle(theta, phi));
                }
            }
            for (let i = 0; i < 25; i++) {
                connections.push(new Connection());
            }
        }
        init();

        function animate() {
            ctx.clearRect(0, 0, width, height);
            
            const targetSpeed = isInteracting ? 0.025 : 0.005;
            currentRotationSpeed += (targetSpeed - currentRotationSpeed) * 0.05;
            rotation += currentRotationSpeed;

            particles.forEach(p => {
                const proj = p.project();
                if (proj.z > 0) return;
                const alpha = Math.abs(proj.z) / 160;
                ctx.beginPath();
                ctx.arc(proj.x, proj.y, isInteracting ? 1.2 : 1.0, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(121, 209, 255, ${alpha * 0.9})`;
                ctx.fill();
            });

            connections.forEach(c => {
                c.update();
                c.draw();
            });

            animationFrameId = requestAnimationFrame(animate);
        }
        animate();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, [isInteracting]);

    return (
        <div 
            ref={containerRef} 
            className={`globe-container group cursor-pointer ${isInteracting ? 'active-interaction' : ''}`}
        >
            <div className="globe-atmosphere"></div>
            <div className="globe-rim-glow"></div>
            <div className="globe-logo">
                <div className="flex flex-col items-center gap-1">
                    <span className="material-symbols-outlined text-tertiary text-[48px]" style={{ fontVariationSettings: '"FILL" 1' }}>toll</span>
                    <span className="font-headline-md text-tertiary text-2xl tracking-[0.2em] font-bold">AUTOREWARD</span>
                </div>
            </div>
            <div className="globe-canvas-wrapper">
                <canvas ref={canvasRef} id="globe-canvas"></canvas>
            </div>
        </div>
    );
}
