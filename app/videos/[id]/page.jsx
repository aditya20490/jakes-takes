import '../videos.css';
import './watch.css';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getVideos } from '../../../lib/youtube';
import Community from './Community';

export const revalidate = 3600;

function formatDate(iso) {
  return new Date(iso + 'T00:00:00Z').toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC',
  });
}

export default async function VideoPage({ params }) {
  const { id } = await params;
  const { videos } = await getVideos();
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

        <div className="watch">
          <div className="watch-main">
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
              {formatDate(video.date)}
              {video.views ? ` · ${video.views.toLocaleString('en-US')} views` : ''}
            </p>
            <p style={{ marginTop: 16 }}>
              <a className="btn ghost" href={`https://www.youtube.com/watch?v=${video.id}`} target="_blank" rel="noopener noreferrer">
                Watch on YouTube
              </a>
            </p>
          </div>

          <aside className="watch-side" aria-label="Rating and comments">
            <Community videoId={video.id} />
          </aside>
        </div>
      </main>
      <footer className="footer">
        <p>Unofficial fan-made project. Not affiliated with or endorsed by Jake&apos;s Takes.</p>
      </footer>
    </>
  );
}
