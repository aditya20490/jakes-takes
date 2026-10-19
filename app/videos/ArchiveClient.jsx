'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';

function formatDate(iso) {
  return new Date(iso + 'T00:00:00Z').toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC',
  });
}

export default function ArchiveClient({ videos, topics }) {
  const [query, setQuery] = useState('');
  const [topic, setTopic] = useState('All');

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return videos
      .filter((v) => topic === 'All' || v.topic === topic)
      .filter((v) => !q || v.title.toLowerCase().includes(q) || v.topic.toLowerCase().includes(q))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [videos, query, topic]);

  if (videos.length === 0) {
    return <p className="muted">The archive is being set up. Videos will appear here soon.</p>;
  }

  return (
    <>
      <div className="controls">
        <input
          type="search"
          className="search"
          placeholder="Search videos..."
          aria-label="Search videos"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
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
      </div>

      <p className="muted count">{results.length} {results.length === 1 ? 'video' : 'videos'}</p>

      {results.length === 0 ? (
        <p className="muted">No videos match. Try a different search or topic.</p>
      ) : (
        <div className="vgrid">
          {results.map((v) => (
            <Link key={v.id} href={`/videos/${v.id}`} className="vcard">
              <div className="vthumb">
                <img
                  src={`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`}
                  alt=""
                  loading="lazy"
                />
              </div>
              <div className="vbody">
                <span className="tag">{v.topic}</span>
                <h2>{v.title}</h2>
                <p className="meta">
                  {formatDate(v.date)}
                  {v.views ? ` · ${v.views.toLocaleString('en-US')} views` : ''}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
