import './videos.css';
import Link from 'next/link';
import { topics } from '../../data/videos';
import { getVideos } from '../../lib/youtube';
import ArchiveClient from './ArchiveClient';

export const revalidate = 3600;

export const metadata = {
  title: "Video Archive | Jake's Takes (Unofficial Fan Site)",
};

export default async function VideosPage() {
  const { videos, error } = await getVideos();
  const shownTopics = topics.filter((t) => videos.some((v) => v.topic === t));

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
        {error ? (
          <p className="muted">The archive is being set up. Please check back soon.</p>
        ) : (
          <ArchiveClient videos={videos} topics={shownTopics} />
        )}
      </main>
      <footer className="footer">
        <p>Unofficial fan-made project. Not affiliated with or endorsed by Jake&apos;s Takes.</p>
      </footer>
    </>
  );
}
