import '../videos.css';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { videos } from '../../../data/videos';

export const dynamicParams = false;

export function generateStaticParams() {
  return videos.map((v) => ({ id: v.id }));
}

export default async function VideoPage({ params }) {
  const { id } = await params;
  const video = videos.find((v) => v.id === id);
  if (!video) notFound();

  return (
    <>
      <header className="nav">
        <Link href="/" className="logo">JAKE&apos;S TAKES</Link>
        <nav className="nav-links" aria-label="Main">
          <Link href="/videos">All videos</Link>
        </nav>
      </header>
      <main className="page">
        <p className="eyebrow">{video.topic}</p>
        <h1 className="page-title small">{video.title}</h1>
        <div className="player">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${video.id}`}
            title={video.title}
            loading="lazy"
            allow="accelerometer; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
          />
        </div>
        <p className="meta">
          <a className="btn ghost" href={`https://www.youtube.com/watch?v=${video.id}`} target="_blank" rel="noopener noreferrer">
            Watch on YouTube
          </a>
        </p>
        <section className="soon">
          <h2>Ratings and comments</h2>
          <p className="muted">Coming in a later phase. Nothing is live yet.</p>
        </section>
      </main>
      <footer className="footer">
        <p>Unofficial fan-made project. Not affiliated with or endorsed by Jake&apos;s Takes.</p>
      </footer>
    </>
  );
}
