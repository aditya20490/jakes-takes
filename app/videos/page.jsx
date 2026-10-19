import './videos.css';
import Link from 'next/link';
import { videos, topics } from '../../data/videos';
import ArchiveClient from './ArchiveClient';

export const metadata = {
  title: "Video Archive | Jake's Takes (Unofficial Fan Site)",
};

export default function VideosPage() {
  return (
    <>
      <header className="nav">
        <Link href="/" className="logo">JAKE&apos;S TAKES</Link>
        <nav className="nav-links" aria-label="Main">
          <Link href="/">Home</Link>
        </nav>
      </header>
      <main className="page">
        <p className="eyebrow">Archive</p>
        <h1 className="page-title">Videos &amp; Livestreams</h1>
        <ArchiveClient videos={videos} topics={topics} />
      </main>
      <footer className="footer">
        <p>Unofficial fan-made project. Not affiliated with or endorsed by Jake&apos;s Takes.</p>
      </footer>
    </>
  );
}
