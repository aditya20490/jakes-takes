'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import './archive.css';
import { useRatings, RatingPill } from '../../components/ratings';

function formatDate(iso) {
  return new Date(iso + 'T00:00:00Z').toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC',
  });
}

// Today / Yesterday / N days ago, in the visitor's own time zone.
function dayTag(iso, now) {
  if (!now) return null;
  const d = new Date(iso);
  const a = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const b = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diff = Math.round((a - b) / 86400000);
  if (diff === 0) return { text: 'Today', cls: 'today' };
  if (diff === 1) return { text: 'Yesterday', cls: 'yesterday' };
  if (diff > 1) return { text: `${diff} days ago`, cls: 'ago' };
  return null;
}

export default function ArchiveClient({ videos, topics, liveDays }) {
  const [query, setQuery] = useState('');
  const [topic, setTopic] = useState('All');
  const [searchOpen, setSearchOpen] = useState(false);
  const [now, setNow] = useState(null);
  const inputRef = useRef(null);
  const ratings = useRatings();

  useEffect(() => {
    setNow(new Date());
  }, []);

  useEffect(() => {
    if (searchOpen && inputRef.current) inputRef.current.focus();
  }, [searchOpen]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return videos
      // "All" shows regular videos only. Livestreams appear under their own tab.
      .filter((v) => (topic === 'All' ? v.topic !== 'Livestreams' : v.topic === topic))
      .filter((v) => !q || v.title.toLowerCase().includes(q) || v.topic.toLowerCase().includes(q))
      .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  }, [videos, query, topic]);

  function closeSearch() {
    setQuery('');
    setSearchOpen(false);
  }

  if (videos.length === 0) {
    return <p className="muted">The archive is being set up. Videos will appear here soon.</p>;
  }

  const isLiveTab = topic === 'Livestreams';
  const noun = isLiveTab ? 'livestream' : 'video';

  return (
    <>
      <div className={`archive-bar ${searchOpen ? 'searching' : ''}`}>
        <div className="chips" role="group" aria-label="Filter by topic">
          {['All', ...topics].map((t) => (
            <button
              key={t}
              type="button"
              className={`chip ${topic === t ? 'active' : ''}`}
              aria-pressed={topic === t}
              onClick={() => setTopic(t)}
            >
              {t}
            </button>
          ))}
        </div>

        <div className={`searchbox ${searchOpen ? 'open' : ''}`}>
          <input
            ref={inputRef}
            type="search"
            className="search-input"
            placeholder="Search..."
            aria-label="Search videos"
            tabIndex={searchOpen ? 0 : -1}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Escape' && closeSearch()}
          />
          <button
            type="button"
            className="search-btn"
            aria-label={searchOpen ? 'Close search' : 'Search videos'}
            aria-expanded={searchOpen}
            onClick={() => (searchOpen ? closeSearch() : setSearchOpen(true))}
          >
            {searchOpen ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-3.5-3.5" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <p className="muted count">
        {results.length} {results.length === 1 ? noun : `${noun}s`}
        {isLiveTab ? ` · last ${liveDays} days only` : ''}
      </p>

      {isLiveTab && (
        <p className="muted live-note">
          Livestreams stay here for {liveDays} days. After that they, and their ratings and comments, are removed automatically.
        </p>
      )}

      {results.length === 0 ? (
        <p className="muted">
          {isLiveTab && !query.trim()
            ? `No livestreams in the last ${liveDays} days.`
            : 'No videos match. Try a different search or topic.'}
        </p>
      ) : (
        <div className="vgrid archive-grid">
          {results.map((v, i) => {
            const tag = v.topic === 'Livestreams' ? dayTag(v.publishedAt, now) : null;
            return (
              <Link
                key={v.id}
                href={`/videos/${v.id}`}
                className={`vcard ${tag && tag.cls === 'today' ? 'is-today' : ''}`}
                style={{ '--i': Math.min(i, 12) }}
              >
                <div className="vthumb">
                  <img
                    src={`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`}
                    alt=""
                    loading="lazy"
                  />
                </div>
                <div className="vbody">
                  <div className="vtags">
                    <span className="tag">{v.topic}</span>
                    {tag && <span className={`daytag ${tag.cls}`}>{tag.text}</span>}
                  </div>
                  <h2>{v.title}</h2>
                  <div className="vfoot">
                    <p className="meta">
                      {formatDate(v.date)}
                      {v.views ? ` · ${v.views.toLocaleString('en-US')} views` : ''}
                    </p>
                    <RatingPill summary={ratings[v.id]} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
