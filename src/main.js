import './style.css';

// Fireworks Animation Logic
const canvas = document.getElementById('fireworks-canvas');
const ctx = canvas.getContext('2d');

let width, height;

function resize() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

const particles = [];
const fireworks = [];

class Particle {
  constructor(x, y, color, isCore = false) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.isCore = isCore;
    
    const angle = Math.random() * Math.PI * 2;
    const speed = isCore ? Math.random() * 2 + 0.5 : Math.random() * 5 + 1;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    
    this.life = 1.0;
    this.decay = Math.random() * 0.015 + 0.015;
    this.size = isCore ? Math.random() * 2 + 2 : Math.random() * 2 + 1;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.05; // gravity
    this.life -= this.decay;
  }

  draw() {
    ctx.globalAlpha = this.life;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

class Firework {
  constructor() {
    this.x = Math.random() * width;
    this.y = height;
    this.targetY = Math.random() * (height / 2) + 50;
    this.vx = (Math.random() - 0.5) * 2;
    this.vy = -(Math.random() * 4 + 8);
    this.color = `hsl(${Math.random() * 360}, 100%, 60%)`;
    this.exploded = false;
    this.trail = [];
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.03; // less gravity on way up
    
    this.trail.push({x: this.x, y: this.y});
    if (this.trail.length > 5) this.trail.shift();

    if (this.vy >= 0 || this.y <= this.targetY) {
      this.exploded = true;
      this.explode();
    }
  }

  draw() {
    ctx.globalAlpha = 1;
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    if (this.trail.length > 0) {
      ctx.moveTo(this.trail[0].x, this.trail[0].y);
      for (let i = 1; i < this.trail.length; i++) {
        ctx.lineTo(this.trail[i].x, this.trail[i].y);
      }
    }
    ctx.stroke();
  }

  explode() {
    for (let i = 0; i < 60; i++) {
      particles.push(new Particle(this.x, this.y, this.color));
    }
    // Add some white/gold core particles
    for (let i = 0; i < 20; i++) {
      particles.push(new Particle(this.x, this.y, '#fff', true));
      particles.push(new Particle(this.x, this.y, '#ffd700', true));
    }
  }
}

function animate() {
  requestAnimationFrame(animate);
  // Clear canvas with a slight trail effect (transparent black won't work perfectly on white background)
  // Since background is clear, we clear entirely to avoid awkward smearing over a transparent canvas.
  ctx.clearRect(0, 0, width, height);

  if (Math.random() < 0.03) { // 3% chance per frame to launch new firework
    fireworks.push(new Firework());
  }

  for (let i = fireworks.length - 1; i >= 0; i--) {
    fireworks[i].update();
    fireworks[i].draw();
    if (fireworks[i].exploded) {
      fireworks.splice(i, 1);
    }
  }

  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].draw();
    if (particles[i].life <= 0) {
      particles.splice(i, 1);
    }
  }
  ctx.globalAlpha = 1; // reset alpha
}

// Start animation loop
animate();

// Add some interaction
document.addEventListener('click', (e) => {
  const fw = new Firework();
  fw.x = e.clientX;
  fw.y = height;
  fw.targetY = e.clientY;
  // Calculate velocities to hit target approximately
  const dy = fw.y - fw.targetY;
  fw.vy = -Math.sqrt(2 * 0.03 * dy) - 2; // initial guess to reach height
  // Make it mostly vertical but aim at mouse x
  fw.vx = (e.clientX - fw.x) / (Math.abs(fw.vy) / 0.03) || 0;
  fireworks.push(fw);
});
