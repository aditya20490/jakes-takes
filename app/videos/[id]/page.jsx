import '../videos.css';
import './watch.css';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getVideo, LIVESTREAM_DAYS } from '../../../lib/youtube';
import Community from './Community';

export const revalidate = 3600;

function formatDate(iso) {
  return new Date(iso + 'T00:00:00Z').toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC',
  });
}

export default async function VideoPage({ params }) {
  const { id } = await params;
  const { video, error } = await getVideo(id);
  // On a YouTube error, throw so a broken page is never cached.
  if (error) throw new Error('Could not load this video.');
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
            {video.topic === 'Livestreams' && (
              <p className="meta" style={{ marginTop: 8 }}>
                Livestreams stay on this site for {LIVESTREAM_DAYS} days, then they and their ratings and comments are removed.
              </p>
            )}
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
    </>
  );
}
