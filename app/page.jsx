import { channelUrl, featuredVideos, pillars, galleryItems } from '../data/site';

export default function Home() {
  return (
    <>
      <header className="nav">
        <a href="#top" className="logo">JAKE&apos;S TAKES</a>
        <nav className="nav-links" aria-label="Main">
          <a href="#philosophy">Story</a>
          <a href="#videos">Videos</a>
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
              <a className="btn ghost" href="#videos">Browse videos</a>
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
          <h2>Featured videos</h2>
          <p className="muted wide">
            Placeholder cards. The full searchable archive with real
            thumbnails comes next.
          </p>
          <div className="grid3">
            {featuredVideos.map((v) => (
              <article key={v.id} className="card video">
                <div className="thumb" aria-hidden="true">
                  <span>▶</span>
                </div>
                <div className="video-body">
                  <span className="tag">{v.topic}</span>
                  <h3>{v.title}</h3>
                </div>
              </article>
            ))}
          </div>
          <a className="btn ghost" href={channelUrl} target="_blank" rel="noopener noreferrer">
            All videos on YouTube
          </a>
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
            Ratings (1 to 10) and comments on each video are coming in a later
            phase. Nothing is live yet.
          </p>
          <a className="btn" href={channelUrl} target="_blank" rel="noopener noreferrer">
            Join on YouTube
          </a>
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
