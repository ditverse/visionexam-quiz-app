// wwwroot/js/result.js

document.addEventListener('DOMContentLoaded', function() {
    // Simple confetti animation
    const canvas = document.getElementById('confetti-canvas');
    const ctx = canvas.getContext('2d');
    const confettiCount = 150;
    const confetti = [];
    const colors = ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];
    
    // Set canvas size
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Create confetti pieces
    for (let i = 0; i < confettiCount; i++) {
        confetti.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            w: Math.random() * 10 + 5,
            h: Math.random() * 5 + 3,
            color: colors[Math.floor(Math.random() * colors.length)],
            speed: Math.random() * 3 + 2,
            velX: Math.random() * 2 - 1,
            velY: Math.random() * 2 + 1,
            angle: Math.random() * 360,
            angleSpeed: Math.random() * 0.2 - 0.1
        });
    }
    
    // Animation loop
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        for (let i = 0; i < confetti.length; i++) {
            const c = confetti[i];
            
            ctx.save();
            ctx.translate(c.x + c.w / 2, c.y + c.h / 2);
            ctx.rotate(c.angle * Math.PI / 180);
            ctx.fillStyle = c.color;
            ctx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h);
            ctx.restore();
            
            c.y += c.speed;
            c.x += c.velX;
            c.angle += c.angleSpeed;
            
            // Reset confetti when it goes off screen
            if (c.y > canvas.height) {
                c.y = -c.h;
                c.x = Math.random() * canvas.width;
            }
            
            if (c.x > canvas.width) {
                c.x = 0;
            } else if (c.x < -c.w) {
                c.x = canvas.width;
            }
        }
        
        requestAnimationFrame(animate);
    }
    
    // Start animation
    animate();
    
    // Stop animation after 5 seconds
    setTimeout(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }, 5000);
});