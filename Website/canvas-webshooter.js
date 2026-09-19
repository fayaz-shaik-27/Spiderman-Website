/**
 * Spider-Man Web Experience - Interactive Web Shooter Canvas Engine
 * Real-time canvas physics with web strands, target practice & particle effects
 */

class WebShooterEngine {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        
        this.webStrands = [];
        this.targets = [];
        this.particles = [];
        this.score = 0;
        this.shotsFired = 0;
        this.hits = 0;
        this.fluidType = 'classic'; // classic, taser, impact, grenade

        this.shooterLeft = { x: 0, y: 0 };
        this.shooterRight = { x: 0, y: 0 };

        this.initCanvas();
        this.bindEvents();
        this.spawnTargetLoop();
        this.animate();
    }

    initCanvas() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.width = this.canvas.width = rect.width;
        this.height = this.canvas.height = rect.height;
        
        // Wrist shooter starting anchors at bottom corners
        this.shooterLeft = { x: this.width * 0.25, y: this.height };
        this.shooterRight = { x: this.width * 0.75, y: this.height };
    }

    bindEvents() {
        this.canvas.addEventListener('mousedown', (e) => this.shootWeb(e));
        this.canvas.addEventListener('touchstart', (e) => {
            if (e.touches.length > 0) {
                const rect = this.canvas.getBoundingClientRect();
                const touch = e.touches[0];
                this.shootWeb({
                    clientX: touch.clientX,
                    clientY: touch.clientY
                });
            }
        });
    }

    setFluidType(type) {
        this.fluidType = type;
    }

    shootWeb(e) {
        const rect = this.canvas.getBoundingClientRect();
        const targetX = e.clientX - rect.left;
        const targetY = e.clientY - rect.top;

        this.shotsFired++;

        // Select alternate wrist
        const origin = (this.shotsFired % 2 === 1) ? this.shooterLeft : this.shooterRight;

        // Play audio
        if (window.soundFX) {
            window.soundFX.playThwip(this.fluidType);
        }

        // Create Web Strand object
        const strand = {
            startX: origin.x,
            startY: origin.y,
            targetX: targetX,
            targetY: targetY,
            currentX: origin.x,
            currentY: origin.y,
            progress: 0, // 0 to 1
            life: 1.0,
            fluidType: this.fluidType,
            nodes: this.generateWebNodes(origin.x, origin.y, targetX, targetY)
        };

        this.webStrands.push(strand);

        // Check Target Hit
        this.checkTargetHits(targetX, targetY);

        // Flash target point indicator
        this.createHitParticle(targetX, targetY, this.fluidType);
    }

    generateWebNodes(x1, y1, x2, y2) {
        const nodes = [];
        const steps = 12;
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            nodes.push({
                x: x1 + (x2 - x1) * t,
                y: y1 + (y2 - y1) * t,
                offsetX: (Math.random() - 0.5) * 15,
                offsetY: (Math.random() - 0.5) * 15
            });
        }
        return nodes;
    }

    checkTargetHits(x, y) {
        for (let i = this.targets.length - 1; i >= 0; i--) {
            const t = this.targets[i];
            const dist = Math.hypot(x - t.x, y - t.y);
            if (dist <= t.radius + 15) {
                // Hit target!
                this.hits++;
                this.score += t.points;
                
                // Explode target
                this.createExplosion(t.x, t.y, t.color);
                this.targets.splice(i, 1);

                // Sound
                if (window.soundFX) {
                    window.soundFX.playSpiderSense();
                }

                this.updateScoreUI();
                break;
            }
        }
    }

    createHitParticle(x, y, fluidType) {
        let color = '#00F0FF';
        if (fluidType === 'classic') color = '#FFFFFF';
        if (fluidType === 'taser') color = '#FFE600';
        if (fluidType === 'impact') color = '#FF2E4D';
        if (fluidType === 'grenade') color = '#8A2BE2';

        for (let i = 0; i < 15; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 6 + 2;
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                radius: Math.random() * 3 + 1,
                color: color,
                alpha: 1.0,
                decay: Math.random() * 0.05 + 0.02
            });
        }
    }

    createExplosion(x, y, color) {
        for (let i = 0; i < 25; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 8 + 3;
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                radius: Math.random() * 5 + 2,
                color: color,
                alpha: 1.0,
                decay: Math.random() * 0.03 + 0.015
            });
        }
    }

    spawnTargetLoop() {
        setInterval(() => {
            if (this.targets.length < 5) {
                const isBonus = Math.random() > 0.7;
                this.targets.push({
                    x: Math.random() * (this.width - 100) + 50,
                    y: Math.random() * (this.height * 0.5) + 50,
                    vx: (Math.random() - 0.5) * 3,
                    vy: (Math.random() - 0.5) * 2,
                    radius: isBonus ? 18 : 28,
                    points: isBonus ? 250 : 100,
                    color: isBonus ? '#FFE600' : '#FF2E4D',
                    symbol: isBonus ? '⚡' : '🕷️'
                });
            }
        }, 1800);
    }

    updateScoreUI() {
        const scoreEl = document.getElementById('webshooter-score');
        const accuracyEl = document.getElementById('webshooter-accuracy');
        if (scoreEl) scoreEl.textContent = this.score;
        if (accuracyEl) {
            const acc = this.shotsFired > 0 ? Math.round((this.hits / this.shotsFired) * 100) : 100;
            accuracyEl.textContent = `${acc}%`;
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        // Draw Web Shooters at bottom
        this.drawShooterAnchors();

        // Update and draw targets
        this.updateTargets();

        // Update and draw web strands
        this.updateWebStrands();

        // Update and draw particles
        this.updateParticles();

        requestAnimationFrame(() => this.animate());
    }

    drawShooterAnchors() {
        const ctx = this.ctx;
        [this.shooterLeft, this.shooterRight].forEach(anchor => {
            ctx.save();
            ctx.beginPath();
            ctx.arc(anchor.x, anchor.y, 25, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(229, 9, 20, 0.2)';
            ctx.fill();
            ctx.strokeStyle = 'rgba(0, 240, 255, 0.6)';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.restore();
        });
    }

    updateTargets() {
        const ctx = this.ctx;
        this.targets.forEach((t) => {
            t.x += t.vx;
            t.y += t.vy;

            // Bounce off walls
            if (t.x < t.radius || t.x > this.width - t.radius) t.vx *= -1;
            if (t.y < t.radius || t.y > this.height * 0.6 - t.radius) t.vy *= -1;

            // Draw Target outer ring
            ctx.save();
            ctx.beginPath();
            ctx.arc(t.x, t.y, t.radius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(15, 20, 35, 0.7)';
            ctx.fill();
            ctx.strokeStyle = t.color;
            ctx.lineWidth = 3;
            ctx.stroke();

            // Inner glowing core
            ctx.beginPath();
            ctx.arc(t.x, t.y, t.radius * 0.4, 0, Math.PI * 2);
            ctx.fillStyle = t.color;
            ctx.shadowColor = t.color;
            ctx.shadowBlur = 15;
            ctx.fill();

            // Target icon
            ctx.font = `${t.radius * 0.8}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(t.symbol, t.x, t.y);

            ctx.restore();
        });
    }

    updateWebStrands() {
        const ctx = this.ctx;
        for (let i = this.webStrands.length - 1; i >= 0; i--) {
            const s = this.webStrands[i];
            
            if (s.progress < 1) {
                s.progress += 0.2;
                if (s.progress > 1) s.progress = 1;
            } else {
                s.life -= 0.03;
            }

            if (s.life <= 0) {
                this.webStrands.splice(i, 1);
                continue;
            }

            const currX = s.startX + (s.targetX - s.startX) * s.progress;
            const currY = s.startY + (s.targetY - s.startY) * s.progress;

            ctx.save();
            ctx.globalAlpha = s.life;

            // Draw main web fiber line
            ctx.beginPath();
            ctx.moveTo(s.startX, s.startY);
            
            // Curved spring web string
            const midX = (s.startX + currX) / 2 + (Math.sin(s.life * 10) * 10);
            const midY = (s.startY + currY) / 2;

            ctx.quadraticCurveTo(midX, midY, currX, currY);

            let webColor = '#FFFFFF';
            if (s.fluidType === 'taser') webColor = '#00F0FF';
            if (s.fluidType === 'impact') webColor = '#FF2E4D';
            if (s.fluidType === 'grenade') webColor = '#C084FC';

            ctx.strokeStyle = webColor;
            ctx.shadowColor = webColor;
            ctx.shadowBlur = 12;
            ctx.lineWidth = s.fluidType === 'impact' ? 5 : 3;
            ctx.stroke();

            // Draw Splatter Web Webbing at target contact point
            if (s.progress >= 1) {
                this.drawWebImpactSplat(ctx, s.targetX, s.targetY, webColor, s.life);
            }

            ctx.restore();
        }
    }

    drawWebImpactSplat(ctx, x, y, color, alpha) {
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;

        // Radial web spokes
        const spokes = 8;
        const radius = 25;
        for (let i = 0; i < spokes; i++) {
            const angle = (i / spokes) * Math.PI * 2;
            const endX = x + Math.cos(angle) * radius;
            const endY = y + Math.sin(angle) * radius;

            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(endX, endY);
            ctx.stroke();
        }

        // Concentric web rings
        [0.4, 0.8].forEach(rRatio => {
            ctx.beginPath();
            ctx.arc(x, y, radius * rRatio, 0, Math.PI * 2);
            ctx.stroke();
        });

        ctx.restore();
    }

    updateParticles() {
        const ctx = this.ctx;
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.alpha -= p.decay;

            if (p.alpha <= 0) {
                this.particles.splice(i, 1);
                continue;
            }

            ctx.save();
            ctx.globalAlpha = p.alpha;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 8;
            ctx.fill();
            ctx.restore();
        }
    }
}

window.WebShooterEngine = WebShooterEngine;
