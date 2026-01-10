// ====== PARTICLE ANIMATION ======
class ParticleAnimation {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.particleCount = 50; // Reduced for subtlety
        
        this.init();
        this.animate();
        
        window.addEventListener('resize', () => this.init());
    }
    
    init() {
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
        
        this.particles = [];
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 2 + 1,
                speedX: Math.random() * 0.3 - 0.15,
                speedY: Math.random() * 0.3 - 0.15,
                opacity: Math.random() * 0.3 + 0.1 // Reduced opacity
            });
        }
    }
    
    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.particles.forEach(particle => {
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            
            if (particle.x > this.canvas.width) particle.x = 0;
            if (particle.x < 0) particle.x = this.canvas.width;
            if (particle.y > this.canvas.height) particle.y = 0;
            if (particle.y < 0) particle.y = this.canvas.height;
            
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(79, 70, 229, ${particle.opacity})`; // Subtle color
            this.ctx.fill();
        });
        
        // Connect nearby particles
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 100) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.strokeStyle = `rgba(79, 70, 229, ${0.05 * (1 - distance / 100)})`; // Very subtle
                    this.ctx.stroke();
                }
            }
        }
        
        requestAnimationFrame(() => this.animate());
    }
}

// ====== TYPING EFFECT ======
class TypingEffect {
    constructor(elementId, texts, options = {}) {
        this.element = document.getElementById(elementId);
        this.texts = texts;
        this.textIndex = 0;
        this.charIndex = 0;
        this.isDeleting = false;
        this.typeSpeed = options.typeSpeed || 100;
        this.deleteSpeed = options.deleteSpeed || 50;
        this.pauseTime = options.pauseTime || 2000;
        
        this.type();
    }
    
    type() {
        const currentText = this.texts[this.textIndex];
        
        if (!this.isDeleting) {
            this.element.textContent = currentText.substring(0, this.charIndex + 1);
            this.charIndex++;
            
            if (this.charIndex === currentText.length) {
                this.isDeleting = true;
                setTimeout(() => this.type(), this.pauseTime);
                return;
            }
        } else {
            this.element.textContent = currentText.substring(0, this.charIndex - 1);
            this.charIndex--;
            
            if (this.charIndex === 0) {
                this.isDeleting = false;
                this.textIndex = (this.textIndex + 1) % this.texts.length;
            }
        }
        
        setTimeout(() => this.type(), this.isDeleting ? this.deleteSpeed : this.typeSpeed);
    }
}

// ====== SMOOTH SCROLL ======
class SmoothScroll {
    constructor() {
        this.init();
    }
    
    init() {
        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
        
        // Scroll indicator
        const scrollIndicator = document.querySelector('.scroll-indicator');
        if (scrollIndicator) {
            scrollIndicator.addEventListener('click', () => {
                window.scrollTo({
                    top: window.innerHeight,
                    behavior: 'smooth'
                });
            });
        }
    }
}

// ====== SCROLL EFFECTS ======
class ScrollEffects {
    constructor() {
        this.init();
    }
    
    init() {
        // Navbar scroll effect
        window.addEventListener('scroll', () => {
            const nav = document.querySelector('nav');
            if (nav) {
                if (window.scrollY > 50) {
                    nav.classList.add('scrolled');
                } else {
                    nav.classList.remove('scrolled');
                }
            }
        });
        
        // Reveal elements on scroll
        this.setupRevealOnScroll();
    }
    
    setupRevealOnScroll() {
        const revealElements = document.querySelectorAll('.feature-card, .tech-card, .step');
        
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                }
            });
        }, observerOptions);
        
        revealElements.forEach(element => {
            observer.observe(element);
        });
    }
}

// ====== INTERACTIVE DEMO ======
class InteractiveDemo {
    constructor() {
        this.init();
    }
    
    init() {
        // Simulate face detection points
        this.animateDetectionPoints();
        
        // Simulate confidence level changes
        this.simulateConfidenceLevel();
        
        // Watch demo button
        const watchDemoBtn = document.querySelector('.demo-section .btn-primary');
        if (watchDemoBtn) {
            watchDemoBtn.addEventListener('click', () => {
                this.playDemo();
            });
        }
    }
    
    animateDetectionPoints() {
        const points = document.querySelectorAll('.detection-point');
        points.forEach((point, index) => {
            setInterval(() => {
                const randomX = Math.random() * 80 + 10; // 10% to 90%
                const randomY = Math.random() * 80 + 10; // 10% to 90%
                
                point.style.left = `${randomX}%`;
                point.style.top = `${randomY}%`;
            }, 3000 + (index * 500)); // Slower animations
        });
    }
    
    simulateConfidenceLevel() {
        const confidenceValue = document.querySelector('.stat-item:first-child .stat-value');
        if (confidenceValue) {
            setInterval(() => {
                const newConfidence = Math.floor(Math.random() * 3) + 96; // 96% to 98%
                confidenceValue.textContent = `${newConfidence}%`;
            }, 4000); // Slower updates
        }
    }
    
    playDemo() {
        // Create a modal or navigate to demo page
        // For now, just show an alert
        alert('Demo video akan ditampilkan di sini');
    }
}

// ====== INITIALIZATION ======
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all components
    new ParticleAnimation('particles-canvas');
    
    new TypingEffect('typing-text', [
        'Platform Ujian Online Modern',
        'Sistem Pengawasan Terintegrasi',
        'Hasil Ujian yang Akurat',
        'Keamanan dan Integritas Terjamin'
    ]);
    
    new SmoothScroll();
    new ScrollEffects();
    new InteractiveDemo();
    
    // Add page load animation
    document.body.classList.add('loaded');
});