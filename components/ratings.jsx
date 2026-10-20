'use client';

import { useEffect, useState } from 'react';

let cached = null;
let cachedAt = 0;

// One request shared by every card on the page. Refreshed if older than 5 seconds.
function load() {
  const now = Date.now();
  if (!cached || now - cachedAt > 5000) {
    cachedAt = now;
    cached = fetch('/api/ratings/summary')
      .then((r) => (r.ok ? r.json() : { ratings: {} }))
      .then((d) => d.ratings || {})
      .catch(() => ({}));
  }
  return cached;
}

export function useRatings() {
  const [ratings, setRatings] = useState({});
  useEffect(() => {
    let live = true;
    load().then((m) => {
      if (live) setRatings(m);
    });
    return () => {
      live = false;
    };
  }, []);
  return ratings;
}

export function RatingPill({ summary }) {
  if (!summary || !summary.total) return null;
  return (
    <span className="rating-pill" title={`${summary.average} out of 10 from ${summary.total} ratings`}>
      ★ {summary.average}
      <span> ({summary.total})</span>
    </span>
  );
}

export function CardRating({ id }) {
  const ratings = useRatings();
  return <RatingPill summary={ratings[id]} />;
}
