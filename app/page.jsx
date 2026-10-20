import './videos/videos.css';
import './videos/archive.css';
import './motion.css';
import './motion2.css';
import './story/story.css';
import Link from 'next/link';
import { channelUrl, instagramUrl, galleryItems } from '../data/site';
import { getAllVideos } from '../lib/youtube';
import { getSubscribers } from '../lib/channel';
import Reveal from '../components/Reveal';
import CountUp from '../components/CountUp';
import ScrollProgress from '../components/ScrollProgress';
import { CardRating } from '../components/ratings';

export const revalidate = 3600;

const ticker = ['Fitness', 'Looksmaxing', 'Mindset', 'Life Advice', 'Livestreams'];
const coverTopics = ['Fitness', 'Looksmaxing', 'Mindset', 'Life Advice'];

function formatDate(iso) {
  return new Date(iso + 'T00:00:00Z').toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC',
  });
}

export default async function Home() {
  const [{ videos: all }, subs] = await Promise.all([getAllVideos(), getSubscribers()]);

  const regular = all.filter((v) => v.topic !== 'Livestreams');
  const lives = all.filter((v) => v.topic === 'Livestreams');
  const featured = regular.slice(0, 3);
  const totalViews = all.reduce((sum, v) => sum + (v.views || 0), 0);

  const stats = [
    subs ? { label: 'Subscribers', value: subs } : null,
    { label: 'Videos', value: regular.length },
    { label: 'Livestreams', value: lives.length },
    { label: 'Total views', value: totalViews },
  ].filter((s) => s && s.value > 0);

  // For each topic: how many videos, and the most-watched one
  const topicCards = coverTopics
    .map((topic) => {
      const vs = regular.filter((v) => v.topic === topic);
      if (!vs.length) return null;
      const top = vs.reduce((a, b) => ((b.views || 0) > (a.views || 0) ? b : a));
      return { topic, count: vs.length, top };
    })
    .filter(Boolean);

  return (
    <>
      <noscript>
        <style>{'.reveal{opacity:1!important;transform:none!important}'}</style>
      </noscript>

      <ScrollProgress />
      <a href="#top" className="skip">Skip to content</a>
      <header className="nav">
        <a href="#top" className="logo">JAKE&apos;S TAKES</a>
        <nav className="nav-links" aria-label="Main">
          <Link href="/story">Story</Link>
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
          <span className="scroll-cue" aria-hidden="true" />
        </section>

        <div className="marquee" aria-hidden="true">
          <div className="marquee-track">
            {[0, 1].map((n) => (
              <div className="marquee-group" key={n}>
                {ticker.concat(ticker).map((t, i) => (
                  <span key={i}>{t}</span>
                ))}
              </div>
            ))}
          </div>
        </div>

        {stats.length > 0 && (
          <section className="stats-section" aria-label="Channel numbers">
            <div className="stats">
              {stats.map((s, i) => (
                <Reveal key={s.label} delay={i * 100}>
                  <div className="stat">
                    <div className="stat-num"><CountUp value={s.value} /></div>
                    <div className="stat-label">{s.label}</div>
                  </div>
                </Reveal>
              ))}
            </div>
          </section>
        )}

        <section id="story" className="section alt">
          <Reveal>
            <p className="eyebrow">In his own words</p>
            <figure className="quote big">
              <blockquote><p>&ldquo;You have full control over your life.&rdquo;</p></blockquote>
              <figcaption>Jake, in his videos</figcaption>
            </figure>
            <p className="muted wide">
              Raw action, going back to simple, and never quitting. Read what he stands for.
            </p>
            <Link className="btn" href="/story">Read his story</Link>
          </Reveal>
        </section>

        <section id="covers" className="section">
          <Reveal>
            <p className="eyebrow">Topics</p>
            <h2>What he covers</h2>
            <p className="muted wide">
              Start with the most-watched video in each topic.
            </p>
          </Reveal>
          {topicCards.length > 0 ? (
            <div className="tgrid">
              {topicCards.map((c, i) => (
                <Reveal key={c.topic} delay={i * 110}>
                  <Link href={`/videos/${c.top.id}`} className="tcard">
                    <div className="vthumb">
                      <img
                        src={`https://i.ytimg.com/vi/${c.top.id}/hqdefault.jpg`}
                        alt=""
                        loading="lazy"
                      />
                    </div>
                    <div className="tcard-body">
                      <div className="tcard-top">
                        <h3>{c.topic}</h3>
                        <span className="tcount">{c.count} {c.count === 1 ? 'video' : 'videos'}</span>
                      </div>
                      <p className="tbest">Most watched <span className="tarrow" aria-hidden="true">↗</span></p>
                      <p className="ttitle">{c.top.title}</p>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          ) : (
            <p className="muted">Topics will appear here soon.</p>
          )}
        </section>

        <section id="videos" className="section alt">
          <Reveal>
            <p className="eyebrow">Archive</p>
            <h2>Latest videos</h2>
            <p className="muted wide">
              Fresh from the channel. Open the archive to search by topic or
              find recent livestream replays.
            </p>
          </Reveal>

          {featured.length > 0 ? (
            <div className="vgrid home-vgrid">
              {featured.map((v, i) => (
                <Reveal key={v.id} delay={i * 120}>
                  <Link href={`/videos/${v.id}`} className="vcard">
                    <div className="vthumb">
                      <img
                        src={`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`}
                        alt=""
                        loading="lazy"
                      />
                    </div>
                    <div className="vbody">
                      <div className="vtags">
                        <span className="tag">{v.topic}</span>
                      </div>
                      <h3 className="vtitle">{v.title}</h3>
                      <div className="vfoot">
                        <p className="meta">
                          {formatDate(v.date)}
                          {v.views ? ` · ${v.views.toLocaleString('en-US')} views` : ''}
                        </p>
                        <CardRating id={v.id} />
                      </div>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          ) : (
            <p className="muted">Videos will appear here soon.</p>
          )}

          <Reveal delay={200}>
            <div className="hero-actions" style={{ marginTop: 32 }}>
              <Link className="btn" href="/videos">Open full archive</Link>
              <a className="btn ghost" href={channelUrl} target="_blank" rel="noopener noreferrer">
                Channel on YouTube
              </a>
            </div>
          </Reveal>
        </section>

        <section id="gallery" className="section">
          <Reveal>
            <p className="eyebrow">Gallery</p>
            <h2>The visuals</h2>
            <p className="muted wide">
              Approved photos will appear here. Until then, follow along on Instagram.
            </p>
            <a className="btn ghost" href={instagramUrl} target="_blank" rel="noopener noreferrer" style={{ marginBottom: 36 }}>
              Instagram
            </a>
          </Reveal>
          <div className="gallery">
            {galleryItems.map((n, i) => (
              <Reveal key={n} delay={(i % 3) * 100}>
                <div className="tile" aria-hidden="true" />
              </Reveal>
            ))}
          </div>
        </section>

        <section id="community" className="section alt">
          <Reveal>
            <p className="eyebrow">Community</p>
            <h2>Rate and discuss</h2>
            <p className="muted wide">
              Every video and recent livestream replay has a 1 to 10 rating and its own
              comment section. Pick one, share what you thought, and keep it
              respectful.
            </p>
            <div className="hero-actions">
              <Link className="btn" href="/videos">Pick a video</Link>
              <a className="btn ghost" href={channelUrl} target="_blank" rel="noopener noreferrer">
                Join on YouTube
              </a>
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="footer">
        <p>Unofficial fan-made project. Not affiliated with or endorsed by Jake&apos;s Takes.</p>
        <p className="social-links">
          <Link href="/story">Story</Link>
          <a href={channelUrl} target="_blank" rel="noopener noreferrer">YouTube</a>
          <a href={instagramUrl} target="_blank" rel="noopener noreferrer">Instagram</a>
        </p>
      </footer>
    </>
  );
}
