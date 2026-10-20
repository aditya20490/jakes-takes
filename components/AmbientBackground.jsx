'use client';

import { useEffect, useRef } from 'react';

// A living background behind the whole site: slow drifting blue light,
// floating dust, and a little film grain. It never blocks clicks.
export default function AmbientBackground() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w = 0;
    let h = 0;
    let raf = 0;
    let last = 0;
    let time = 0;
    let dots = [];

    function make(initial) {
      return {
        x: Math.random() * w,
        y: initial ? Math.random() * h : h + 10,
        r: 0.6 + Math.random() * 1.6,
        vy: 5 + Math.random() * 14, // pixels per second, drifting upward
        vx: (Math.random() - 0.5) * 6,
        a: 0.15 + Math.random() * 0.45,
        phase: Math.random() * Math.PI * 2,
        speed: 0.4 + Math.random() * 1.2,
      };
    }

    function draw(dt) {
      time += dt;
      ctx.clearRect(0, 0, w, h);
      for (const d of dots) {
        d.y -= d.vy * dt;
        d.x += d.vx * dt;
        if (d.y < -10) Object.assign(d, make(false), { x: Math.random() * w });
        if (d.x < -10) d.x = w + 10;
        if (d.x > w + 10) d.x = -10;
        const alpha = d.a * (0.6 + 0.4 * Math.sin(d.phase + time * d.speed));
        ctx.fillStyle = `rgba(190, 205, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fill();
        if (d.r > 1.5) {
          ctx.fillStyle = `rgba(150, 175, 255, ${alpha * 0.12})`;
          ctx.beginPath();
          ctx.arc(d.x, d.y, d.r * 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const target = Math.max(24, Math.min(70, Math.round((w * h) / 26000)));
      while (dots.length < target) dots.push(make(true));
      dots.length = Math.min(dots.length, target);
      if (reduce) draw(0);
    }

    function frame(now) {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      draw(dt);
      raf = requestAnimationFrame(frame);
    }

    function start() {
      if (reduce || raf) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }

    function stop() {
      cancelAnimationFrame(raf);
      raf = 0;
    }

    function onVisibility() {
      if (document.hidden) stop();
      else start();
    }

    resize();
    start();
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      stop();
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return (
    <div className="ambient" aria-hidden="true">
      <span className="orb a" />
      <span className="orb b" />
      <span className="orb c" />
      <canvas ref={ref} className="ambient-canvas" />
      <span className="grain" />
      <span className="vignette" />
    </div>
  );
}
