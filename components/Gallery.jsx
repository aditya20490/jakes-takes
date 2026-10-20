'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Reveal from './Reveal';

// Photo grid. Tap a photo to open it full screen. Swipe or use the arrows to move on.
export default function Gallery({ photos }) {
  const [open, setOpen] = useState(null);
  const closeBtn = useRef(null);
  const opener = useRef(null);
  const touchX = useRef(null);
  const count = photos.length;

  const close = useCallback(() => {
    setOpen(null);
    if (opener.current) opener.current.focus();
  }, []);

  const step = useCallback(
    (d) => setOpen((i) => (i === null ? i : (i + d + count) % count)),
    [count]
  );

  const isOpen = open !== null;

  useEffect(() => {
    if (!isOpen) return;
    function onKey(e) {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') step(1);
      else if (e.key === 'ArrowLeft') step(-1);
    }
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    if (closeBtn.current) closeBtn.current.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [isOpen, close, step]);

  function onTouchEnd(e) {
    if (touchX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    touchX.current = null;
    if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
  }

  return (
    <>
      <div className="photo-grid">
        {photos.map((p, i) => (
          <Reveal key={p.src} delay={(i % 4) * 90}>
            <button
              type="button"
              className="photo-tile"
              aria-label={`Open photo ${i + 1} of ${count}`}
              onClick={(e) => {
                opener.current = e.currentTarget;
                setOpen(i);
              }}
            >
              <img src={p.src} alt="" loading="lazy" decoding="async" />
            </button>
          </Reveal>
        ))}
      </div>

      {open !== null && (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Photo viewer"
          onClick={close}
          onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
          onTouchEnd={onTouchEnd}
        >
          <button ref={closeBtn} type="button" className="lb-btn lb-close" aria-label="Close" onClick={close}>
            ✕
          </button>
          {count > 1 && (
            <button
              type="button"
              className="lb-btn lb-nav prev"
              aria-label="Previous photo"
              onClick={(e) => {
                e.stopPropagation();
                step(-1);
              }}
            >
              ‹
            </button>
          )}
          <img
            key={open}
            className="lb-img"
            src={photos[open].src}
            alt={`Photo ${open + 1} of ${count}`}
            onClick={(e) => e.stopPropagation()}
          />
          {count > 1 && (
            <button
              type="button"
              className="lb-btn lb-nav next"
              aria-label="Next photo"
              onClick={(e) => {
                e.stopPropagation();
                step(1);
              }}
            >
              ›
            </button>
          )}
          <p className="lb-count">{open + 1} / {count}</p>
        </div>
      )}
    </>
  );
}
