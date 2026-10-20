'use client';

import { useEffect, useRef, useState } from 'react';

const fmt = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });

// Counts up to its value when scrolled into view. Shows the final number without JavaScript.
export default function CountUp({ value, duration = 1600 }) {
  const ref = useRef(null);
  const [n, setN] = useState(value);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || typeof IntersectionObserver === 'undefined') return;

    setN(0);
    let raf = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const tick = (t) => {
          const p = Math.min((t - start) / duration, 1);
          setN(Math.round(value * (1 - Math.pow(1 - p, 3))));
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, duration]);

  return <span ref={ref}>{fmt.format(n)}</span>;
}
