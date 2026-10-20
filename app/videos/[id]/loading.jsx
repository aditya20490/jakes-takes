import '../videos.css';
import '../archive.css';
import './watch.css';
import Link from 'next/link';

// Shown instantly when a video card is tapped, while the real page loads.
export default function Loading() {
  return (
    <>
      <header className="nav">
        <Link href="/" className="logo">JAKE&apos;S TAKES</Link>
        <nav className="nav-links" aria-label="Main">
          <Link href="/videos">All videos</Link>
        </nav>
      </header>
      <main className="page" aria-busy="true">
        <div className="skeleton sk-line" />
        <div className="skeleton sk-title" />
        <div className="watch">
          <div className="watch-main">
            <div className="skeleton player-skel" />
          </div>
          <div className="watch-side">
            <div className="skeleton side-skel" />
          </div>
        </div>
      </main>
    </>
  );
}
