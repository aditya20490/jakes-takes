'use client';

import { useEffect, useRef } from 'react';

// Glowing dots that go from bright orange (new) to deep red (old).
function makeSprites() {
  const colors = ['255,214,120', '255,168,60', '255,110,30', '235,60,20', '190,28,16', '120,12,10'];
  return colors.map((c) => {
    const s = document.createElement('canvas');
    s.width = 64;
    s.height = 64;
    const g = s.getContext('2d');
    const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, `rgba(${c},1)`);
    grad.addColorStop(0.25, `rgba(${c},0.7)`);
    grad.addColorStop(1, `rgba(${c},0)`);
    g.fillStyle = grad;
    g.fillRect(0, 0, 64, 64);
    return s;
  });
}

// Red fire embers rising forever. Fills its parent, which must be position: relative.
export default function Fire() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const sprites = makeSprites();
    let w = 0;
    let h = 0;
    let raf = 0;
    let last = 0;
    let onScreen = false;
    let parts = [];

    function spawn(initial) {
      const spark = Math.random() < 0.3; // small, fast, bright sparks
      const life = spark ? 1.6 + Math.random() * 1.8 : 2.8 + Math.random() * 3.2;
      return {
        // most embers start near the middle, a few from the sides
        x: w * (0.5 + (Math.random() - 0.5) * (0.4 + Math.random() * 0.7)),
        y: initial ? h * (0.3 + Math.random() * 0.8) : h + 20 * Math.random(),
        vx: (Math.random() - 0.5) * 18,
        vy: -(h / life) * (spark ? 1.4 + Math.random() * 0.6 : 0.7 + Math.random() * 0.55),
        size: spark ? 5 + Math.random() * 9 : 14 + Math.random() * 34,
        spark,
        sway: Math.random() * Math.PI * 2,
        swaySpeed: 1 + Math.random() * 2,
        swayAmp: 6 + Math.random() * 18,
        age: initial ? Math.random() * life : 0,
        life,
      };
    }

    function resize() {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const target = Math.round(Math.min(160, Math.max(60, w / 6)));
      while (parts.length < target) parts.push(spawn(true));
      parts.length = Math.min(parts.length, target);
    }

    function frame(now) {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < parts.length; i++) {
        let p = parts[i];
        p.age += dt;
        if (p.age >= p.life) {
          p = parts[i] = spawn(false);
        }
        p.y += p.vy * dt;
        p.x += p.vx * dt + Math.cos(p.sway + p.age * p.swaySpeed) * p.swayAmp * dt;
        const t = p.age / p.life;
        const fade = t < 0.12 ? t / 0.12 : 1 - (t - 0.12) / 0.88;
        ctx.globalAlpha = Math.max(0, fade) * (p.spark ? 0.95 : 0.55);
        const s = p.size * (1 - 0.55 * t);
        const img = sprites[Math.min(5, Math.floor(t * 6))];
        ctx.drawImage(img, p.x - s / 2, p.y - s / 2, s, s);
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
      raf = requestAnimationFrame(frame);
    }

    function start() {
      if (raf || !onScreen || document.hidden) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }

    function stop() {
      cancelAnimationFrame(raf);
      raf = 0;
    }

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // Only animate while it is on screen, so it never wastes battery.
    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      if (onScreen) start();
      else stop();
    });
    io.observe(canvas);

    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return <canvas ref={ref} className="fire-canvas" aria-hidden="true" />;
}
