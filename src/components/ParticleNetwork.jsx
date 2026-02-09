import { useEffect, useRef } from 'react';

const PARTICLE_COUNT = 42;
const CONNECT_RADIUS = 140;
const LINE_OPACITY_MAX = 0.28;
const LINE_OPACITY_MIN = 0.06;
const PARTICLE_RADIUS = 1.2;
const DRIFT = 0.22;
const MOUSE_RADIUS = 120;
const MOUSE_STRENGTH = 0.018;
const GLOW_RADIUS = 8;
const STABILIZE_MS = 500; // ignore touch/mouse for this long after load/reload
const RESIZE_DEBOUNCE_MS = 280; // wait for viewport to settle on load/reload before applying resize

function getAccentColor() {
  if (typeof document === 'undefined') return '147, 93, 249'; // dracula default
  const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
  if (!accent) return '147, 93, 249';
  const hex = accent.replace('#', '');
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return `${r}, ${g}, ${b}`;
}

export default function ParticleNetwork() {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const particlesRef = useRef([]);
  const mouseRef = useRef({ x: null, y: null });
  const mountedAtRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = window.innerWidth;
    let height = window.innerHeight;

    const setSize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    };

    const initParticles = () => {
      const particles = [];
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * DRIFT,
          vy: (Math.random() - 0.5) * DRIFT,
        });
      }
      particlesRef.current = particles;
    };

    setSize();
    initParticles();
    mountedAtRef.current = performance.now();

    let resizeTimeoutId = null;
    const handleResize = () => {
      if (resizeTimeoutId) clearTimeout(resizeTimeoutId);
      resizeTimeoutId = setTimeout(() => {
        resizeTimeoutId = null;
        const prevW = width;
        const prevH = height;
        setSize();
        const particles = particlesRef.current;
        if (prevW > 0 && prevH > 0 && particles.length > 0) {
          for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            p.x = Math.max(0, Math.min(width, (width / prevW) * p.x));
            p.y = Math.max(0, Math.min(height, (height / prevH) * p.y));
          }
        }
      }, RESIZE_DEBOUNCE_MS);
    };

    const handleMouseMove = (e) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouseRef.current.x = null;
      mouseRef.current.y = null;
    };

    const handleTouchStart = (e) => {
      if (e.touches.length > 0) {
        mouseRef.current.x = e.touches[0].clientX;
        mouseRef.current.y = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e) => {
      if (e.touches.length > 0) {
        mouseRef.current.x = e.touches[0].clientX;
        mouseRef.current.y = e.touches[0].clientY;
      }
    };

    const handleTouchEnd = () => {
      mouseRef.current.x = null;
      mouseRef.current.y = null;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    let cancelled = false;

    const tick = () => {
      if (cancelled || !ctx) return;

      const rgb = getAccentColor();
      const particles = particlesRef.current;
      const now = performance.now();
      const stable = mountedAtRef.current != null && now - mountedAtRef.current >= STABILIZE_MS;
      const mx = stable ? mouseRef.current.x : null;
      const my = stable ? mouseRef.current.y : null;

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (mx != null && my != null) {
          const dx = p.x - mx;
          const dy = p.y - my;
          const dist = Math.hypot(dx, dy);
          if (dist < MOUSE_RADIUS && dist > 0) {
            const force = (1 - dist / MOUSE_RADIUS) * MOUSE_STRENGTH;
            p.vx += (dx / dist) * force;
            p.vy += (dy / dist) * force;
          }
        }
        p.vx *= 0.98;
        p.vy *= 0.98;
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
        p.x = Math.max(0, Math.min(width, p.x));
        p.y = Math.max(0, Math.min(height, p.y));
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.hypot(dx, dy);
          if (dist < CONNECT_RADIUS) {
            const t = 1 - dist / CONNECT_RADIUS;
            const opacity = LINE_OPACITY_MIN + t * (LINE_OPACITY_MAX - LINE_OPACITY_MIN);
            ctx.strokeStyle = `rgba(${rgb}, ${opacity})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const r = PARTICLE_RADIUS;
        ctx.fillStyle = `rgba(${rgb}, 0.85)`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowColor = `rgba(${rgb}, 0.5)`;
        ctx.shadowBlur = GLOW_RADIUS;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      if (resizeTimeoutId) clearTimeout(resizeTimeoutId);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, []);

  return (
    <div className="particle-network" aria-hidden>
      <canvas ref={canvasRef} className="particle-network__canvas" />
    </div>
  );
}
