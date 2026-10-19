'use client';

import { useEffect, useRef, useState } from 'react';
import './community.css';

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '';
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
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(null);
  const [saving, setSaving] = useState(false);
  const [rateMsg, setRateMsg] = useState(null);

  const [comments, setComments] = useState(null);
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [website, setWebsite] = useState('');
  const [sending, setSending] = useState(false);
  const [formMsg, setFormMsg] = useState(null);
  const [reported, setReported] = useState({});
  const [token, setToken] = useState('');

  const rateRef = useRef(null);
  const tsRef = useRef(null);
  const tsId = useRef(null);

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

  // Close the number picker when tapping anywhere else, or pressing Esc.
  useEffect(() => {
    if (!open) return;
    function close() {
      setOpen(false);
      setPending(null);
    }
    function onPointer(e) {
      if (rateRef.current && !rateRef.current.contains(e.target)) close();
    }
    function onKey(e) {
      if (e.key === 'Escape') close();
    }
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  // Cloudflare Turnstile (only active when the site key is set)
  useEffect(() => {
    if (!SITE_KEY) return;
    let cancelled = false;

    function mount() {
      if (cancelled || !tsRef.current || !window.turnstile || tsId.current !== null) return;
      tsId.current = window.turnstile.render(tsRef.current, {
        sitekey: SITE_KEY,
        theme: 'dark',
        callback: (t) => setToken(t),
        'expired-callback': () => setToken(''),
        'error-callback': () => setToken(''),
      });
    }

    if (window.turnstile) {
      mount();
    } else {
      let s = document.getElementById('cf-turnstile-script');
      if (!s) {
        s = document.createElement('script');
        s.id = 'cf-turnstile-script';
        s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
        s.async = true;
        s.defer = true;
        document.head.appendChild(s);
      }
      s.addEventListener('load', mount);
    }

    return () => {
      cancelled = true;
      if (tsId.current !== null && window.turnstile) {
        try { window.turnstile.remove(tsId.current); } catch {}
      }
      tsId.current = null;
    };
  }, []);

  function resetTurnstile() {
    setToken('');
    try {
      if (window.turnstile && tsId.current !== null) window.turnstile.reset(tsId.current);
    } catch {}
  }

  function toggleRate() {
    if (open) {
      setOpen(false);
      setPending(null);
    } else {
      setPending(myScore);
      setRateMsg(null);
      setOpen(true);
    }
  }

  async function done() {
    if (!pending) return;
    if (pending === myScore) {
      setOpen(false);
      setPending(null);
      return;
    }
    setSaving(true);
    setRateMsg(null);
    try {
      const res = await fetch('/api/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId, score: pending, deviceId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setRateMsg({ type: 'error', text: data.error || 'Something went wrong.' });
      } else {
        setSummary({ average: data.average, total: data.total });
        setMyScore(pending);
        try { localStorage.setItem(`jt_rating_${videoId}`, String(pending)); } catch {}
        setOpen(false);
        setPending(null);
        setRateMsg({ type: 'ok', text: 'Thanks! Your rating was saved.' });
      }
    } catch {
      setRateMsg({ type: 'error', text: 'Network error. Please try again.' });
    }
    setSaving(false);
  }

  async function submit(e) {
    e.preventDefault();
    setFormMsg(null);
    setSending(true);
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId, name, body: text, deviceId, website, turnstileToken: token }),
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
    // A Turnstile token works only once, so always get a fresh one.
    resetTurnstile();
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

  const needsToken = Boolean(SITE_KEY) && !token;

  return (
    <section className="community">
      <h2>Rating</h2>
      <p className="avg">
        {summary && summary.total > 0
          ? `★ ${summary.average} / 10 · ${summary.total} ${summary.total === 1 ? 'rating' : 'ratings'}`
          : 'No ratings yet. Be the first.'}
      </p>

      <div className="rate" ref={rateRef}>
        <button
          type="button"
          className="btn ghost"
          aria-expanded={open}
          disabled={!deviceId}
          onClick={toggleRate}
        >
          {myScore ? `Your rating: ${myScore}/10 · Change` : 'Rate this'}
        </button>

        {open && (
          <div className="rate-panel" role="group" aria-label="Rate from 1 to 10">
            <div className="scores">
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  className={`score ${pending === n ? 'active' : ''}`}
                  aria-pressed={pending === n}
                  onClick={() => setPending(n)}
                >
                  {n}
                </button>
              ))}
            </div>
            <div className="rate-actions">
              <button type="button" className="btn" disabled={!pending || saving} onClick={done}>
                {saving ? 'Saving...' : 'Done'}
              </button>
            </div>
          </div>
        )}
      </div>
      {rateMsg && (
        <p className={`msg ${rateMsg.type}`} role={rateMsg.type === 'error' ? 'alert' : 'status'}>
          {rateMsg.text}
        </p>
      )}

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
        {SITE_KEY && <div ref={tsRef} />}
        <div className="cform-row">
          <span className="note">
            {needsToken ? 'Verifying you are human...' : `${text.length}/500`}
          </span>
          <button className="btn" type="submit" disabled={sending || !deviceId || needsToken}>
            {sending ? 'Sending...' : 'Post comment'}
          </button>
        </div>
        {formMsg && (
          <p className={`msg ${formMsg.type}`} role={formMsg.type === 'error' ? 'alert' : 'status'}>
            {formMsg.text}
          </p>
        )}
        <p className="note">No links, please keep it respectful. You can report any comment.</p>
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
