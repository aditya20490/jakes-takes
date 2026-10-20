import './videos.css';
import './archive.css';
import Link from 'next/link';

export default function Loading() {
  return (
    <>
      <header className="nav">
        <Link href="/" className="logo">JAKE&apos;S TAKES</Link>
        <nav className="nav-links" aria-label="Main">
          <Link href="/">Home</Link>
        </nav>
      </header>
      <main className="page" aria-busy="true">
        <p className="eyebrow">Archive</p>
        <h1 className="page-title">Videos &amp; Livestreams</h1>
        <div className="vgrid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton card-skel" />
          ))}
        </div>
      </main>
    </>
  );
}
