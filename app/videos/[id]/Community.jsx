'use client';

import { useEffect, useState } from 'react';
import './community.css';

let memoryId = null;

function makeId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function getDeviceId() {
  try {
    let id = localStorage.getItem('jt_device');
    if (!id) {
      id = makeId();
      localStorage.setItem('jt_device', id);
    }
    return id;
  } catch {
    if (!memoryId) memoryId = makeId();
    return memoryId;
  }
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC',
  });
}

export default function Community({ videoId }) {
  const [deviceId, setDeviceId] = useState(null);
  const [summary, setSummary] = useState(null);
  const [myScore, setMyScore] = useState(null);
  const [rateMsg, setRateMsg] = useState('');
  const [comments, setComments] = useState(null);
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [website, setWebsite] = useState('');
  const [sending, setSending] = useState(false);
  const [formMsg, setFormMsg] = useState(null);
  const [reported, setReported] = useState({});

  useEffect(() => {
    setDeviceId(getDeviceId());
    try {
      const saved = Number(localStorage.getItem(`jt_rating_${videoId}`));
      if (saved >= 1 && saved <= 10) setMyScore(saved);
      const savedName = localStorage.getItem('jt_name');
      if (savedName) setName(savedName);
    } catch {}

    fetch(`/api/ratings?videoId=${videoId}`)
      .then((r) => r.json())
      .then((d) => d.total !== undefined && setSummary({ average: d.average, total: d.total }))
      .catch(() => {});

    fetch(`/api/comments?videoId=${videoId}`)
      .then((r) => r.json())
      .then((d) => setComments(d.comments || []))
      .catch(() => setComments([]));
  }, [videoId]);

  async function rate(score) {
    setRateMsg('');
    try {
      const res = await fetch('/api/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId, score, deviceId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setRateMsg(data.error || 'Something went wrong.');
        return;
      }
      setSummary({ average: data.average, total: data.total });
      setMyScore(score);
      try { localStorage.setItem(`jt_rating_${videoId}`, String(score)); } catch {}
    } catch {
      setRateMsg('Network error. Please try again.');
    }
  }

  async function submit(e) {
    e.preventDefault();
    setFormMsg(null);
    setSending(true);
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId, name, body: text, deviceId, website }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFormMsg({ type: 'error', text: data.error || 'Something went wrong.' });
      } else {
        try { localStorage.setItem('jt_name', name); } catch {}
        setText('');
        if (data.status === 'approved') {
          setFormMsg({ type: 'ok', text: 'Posted. Thanks for commenting!' });
          const r = await fetch(`/api/comments?videoId=${videoId}`);
          const d = await r.json();
          setComments(d.comments || []);
        } else {
          setFormMsg({ type: 'ok', text: 'Thanks! Your comment will appear once it has been approved.' });
        }
      }
    } catch {
      setFormMsg({ type: 'error', text: 'Network error. Please try again.' });
    }
    setSending(false);
  }

  async function report(id) {
    setReported((r) => ({ ...r, [id]: true }));
    try {
      await fetch('/api/comments/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentId: id, deviceId }),
      });
    } catch {}
  }

  return (
    <section className="community">
      <h2>Rate this</h2>
      <p className="avg">
        {summary && summary.total > 0
          ? `★ ${summary.average} / 10 · ${summary.total} ${summary.total === 1 ? 'rating' : 'ratings'}`
          : 'No ratings yet. Be the first.'}
      </p>
      <div className="scores" role="group" aria-label="Rate from 1 to 10">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            type="button"
            className={`score ${myScore === n ? 'active' : ''}`}
            aria-pressed={myScore === n}
            disabled={!deviceId}
            onClick={() => rate(n)}
          >
            {n}
          </button>
        ))}
      </div>
      {myScore && <p className="note">You rated this {myScore}/10. Tap another number to change it.</p>}
      {rateMsg && <p className="msg error" role="alert">{rateMsg}</p>}

      <h2 className="comments-title">Comments</h2>
      <form className="cform" onSubmit={submit}>
        <label className="sr-only" htmlFor="c-name">Your name</label>
        <input
          id="c-name"
          className="field"
          placeholder="Your name"
          maxLength={40}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <label className="sr-only" htmlFor="c-body">Your comment</label>
        <textarea
          id="c-body"
          className="field"
          placeholder="Write a comment..."
          rows={4}
          maxLength={500}
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
        />
        {/* Honeypot: hidden from people, bots fill it in. */}
        <div className="hp" aria-hidden="true">
          <label>
            Website
            <input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
          </label>
        </div>
        <div className="cform-row">
          <span className="note">{text.length}/500</span>
          <button className="btn" type="submit" disabled={sending || !deviceId}>
            {sending ? 'Sending...' : 'Post comment'}
          </button>
        </div>
        {formMsg && (
          <p className={`msg ${formMsg.type}`} role={formMsg.type === 'error' ? 'alert' : 'status'}>
            {formMsg.text}
          </p>
        )}
        <p className="note">Comments are reviewed before they appear. No links, please keep it respectful.</p>
      </form>

      {comments === null ? (
        <p className="muted">Loading comments...</p>
      ) : comments.length === 0 ? (
        <p className="muted">No comments yet.</p>
      ) : (
        <ul className="clist">
          {comments.map((c) => (
            <li key={c.id} className="comment">
              <div className="comment-head">
                <strong>{c.author_name}</strong>
                <span className="meta">{formatDate(c.created_at)}</span>
              </div>
              <p>{c.body}</p>
              <button
                type="button"
                className="link"
                disabled={reported[c.id]}
                onClick={() => report(c.id)}
              >
                {reported[c.id] ? 'Reported' : 'Report'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
