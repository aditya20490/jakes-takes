import './videos/videos.css';
import Link from 'next/link';
import { channelUrl, pillars, galleryItems } from '../data/site';
import { getVideos } from '../lib/youtube';

export const revalidate = 3600;

function formatDate(iso) {
  return new Date(iso + 'T00:00:00Z').toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC',
  });
}

export default async function Home() {
  const { videos } = await getVideos();
  // Latest 3 regular videos (livestreams live in their own archive tab)
  const featured = videos.filter((v) => v.topic !== 'Livestreams').slice(0, 3);

  return (
    <>
      <a href="#top" className="skip">Skip to content</a>
      <header className="nav">
        <a href="#top" className="logo">JAKE&apos;S TAKES</a>
        <nav className="nav-links" aria-label="Main">
          <a href="#philosophy">Story</a>
          <Link href="/videos">Videos</Link>
          <a href="#gallery">Gallery</a>
          <a href="#community">Community</a>
        </nav>
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero-inner">
            <p className="eyebrow">Fitness · Mindset · Discipline</p>
            <h1>Jake&apos;s Takes</h1>
            <p className="lead">
              Videos, livestreams and a community, all in one place.
            </p>
            <div className="hero-actions">
              <a className="btn" href={channelUrl} target="_blank" rel="noopener noreferrer">
                Watch on YouTube
              </a>
              <Link className="btn ghost" href="/videos">Browse videos</Link>
            </div>
          </div>
        </section>

        <section id="philosophy" className="section">
          <p className="eyebrow">The story</p>
          <h2>What he stands for</h2>
          <p className="muted wide">
            Placeholder. This section will be written with Jake&apos;s verified
            story and his own words. Nothing here is final.
          </p>
          <div className="grid3">
            {pillars.map((p) => (
              <article key={p.title} className="card pillar">
                <h3>{p.title}</h3>
                <p className="muted">{p.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="videos" className="section alt">
          <p className="eyebrow">Archive</p>
          <h2>Latest videos</h2>
          <p className="muted wide">
            Fresh from the channel. Open the archive to search by topic or
            find livestream replays.
          </p>

          {featured.length > 0 ? (
            <div className="vgrid home-vgrid">
              {featured.map((v) => (
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
                    <h3 className="vtitle">{v.title}</h3>
                    <p className="meta">
                      {formatDate(v.date)}
                      {v.views ? ` · ${v.views.toLocaleString('en-US')} views` : ''}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="muted">Videos will appear here soon.</p>
          )}

          <div className="hero-actions" style={{ marginTop: 32 }}>
            <Link className="btn" href="/videos">Open full archive</Link>
            <a className="btn ghost" href={channelUrl} target="_blank" rel="noopener noreferrer">
              Channel on YouTube
            </a>
          </div>
        </section>

        <section id="gallery" className="section">
          <p className="eyebrow">Gallery</p>
          <h2>The visuals</h2>
          <p className="muted wide">
            Approved photos will appear here. Placeholders for now.
          </p>
          <div className="gallery">
            {galleryItems.map((n) => (
              <div key={n} className="tile" aria-hidden="true" />
            ))}
          </div>
        </section>

        <section id="community" className="section alt">
          <p className="eyebrow">Community</p>
          <h2>Rate and discuss</h2>
          <p className="muted wide">
            Every video and livestream replay has a 1 to 10 rating and its own
            comment section. Pick one, share what you thought, and keep it
            respectful.
          </p>
          <div className="hero-actions">
            <Link className="btn" href="/videos">Pick a video</Link>
            <a className="btn ghost" href={channelUrl} target="_blank" rel="noopener noreferrer">
              Join on YouTube
            </a>
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>Unofficial fan-made project. Not affiliated with or endorsed by Jake&apos;s Takes.</p>
        <p>
          <a href={channelUrl} target="_blank" rel="noopener noreferrer">YouTube</a>
        </p>
      </footer>
    </>
  );
}
