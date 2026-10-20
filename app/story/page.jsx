import '../videos/videos.css';
import '../motion.css';
import '../motion2.css';
import './story.css';
import Link from 'next/link';
import Reveal from '../../components/Reveal';
import { channelUrl } from '../../data/site';

export const metadata = {
  title: "His Story | Jake's Takes (Unofficial Fan Site)",
  description: "What Jake stands for, in his own words. An unofficial fan page.",
};

// Every quote below is word for word from Jake's own videos. Summaries are written by a fan.
const themes = [
  {
    n: '01',
    title: 'Raw action',
    body: [
      "For Jake, better mental health starts with doing. In his Men's Mental Health Month video he says talking things through and checking in on friends is only one piece of the puzzle. Men also need what he calls raw action: the push-ups, the gym, the goal, the hard conversation, the thing you keep putting off.",
      "He doesn't dismiss talking, but he asks a blunt question: what raw action are you taking? From what he has seen, the men who feel good tend to have a purpose, and dwelling on a problem without looking for a solution rarely makes it better.",
    ],
    quote: "Raw action is one of the best things for men's mental health.",
  },
  {
    n: '02',
    title: 'Back to simple',
    body: [
      "After hours camping near Prescott, Arizona, Jake made a video about getting outside. His argument is that modern life, with its phones and endless optimizing, has pulled people away from something simpler, and that a campfire, a walk and a good view are free and always available.",
      "His challenge: pick a side quest, like camping for a couple of days, and ask what is actually stopping you.",
    ],
    quote: "…simple is genuinely the answer to all this.",
  },
  {
    n: '03',
    title: 'Daily discipline',
    body: [
      "His senior-year day-in-the-life vlog shows the routine behind the content: a workout he streams live, meat-heavy meals, time in the sun, and work sessions on campus, often with another stream on the side. He made one of these vlogs every year of college.",
      "He doesn't hide that making videos is hard work too. In the Men's Mental Health Month video he says it was his fifth attempt at filming it, and that doing hard things and trying until it works is part of the point.",
    ],
    quote: "Time to actually win at real life.",
  },
];

export default function StoryPage() {
  return (
    <>
      <noscript>
        <style>{'.reveal{opacity:1!important;transform:none!important}'}</style>
      </noscript>

      <header className="nav">
        <Link href="/" className="logo">JAKE&apos;S TAKES</Link>
        <nav className="nav-links" aria-label="Main">
          <Link href="/">Home</Link>
          <Link href="/videos">Videos</Link>
        </nav>
      </header>

      <main className="page story">
        <Reveal>
          <p className="eyebrow">The story</p>
          <h1 className="page-title">What he stands for</h1>
          <p className="story-lead">
            Jake is an online fitness coach and YouTuber. He graduated from Arizona State
            University, made a day-in-the-life vlog every year along the way, streams his
            workouts, and talks about fitness, mindset and having a purpose. Every video ends
            the same way: don&apos;t quit.
          </p>
          <p className="story-note">
            Written by a fan from Jake&apos;s public videos. The quotes are his own words.
          </p>
        </Reveal>

        {themes.map((t) => (
          <Reveal key={t.n}>
            <article className="theme">
              <div className="theme-num" aria-hidden="true">{t.n}</div>
              <div className="theme-body">
                <h2>{t.title}</h2>
                {t.body.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
                <figure className="quote">
                  <blockquote><p>&ldquo;{t.quote}&rdquo;</p></blockquote>
                  <figcaption>Jake, in his videos</figcaption>
                </figure>
              </div>
            </article>
          </Reveal>
        ))}

        <Reveal>
          <section className="signoff">
            <p className="signoff-word">Don&apos;t quit.</p>
            <p className="muted">How every one of his videos ends.</p>
            <p style={{ marginTop: 28 }}>
              <Link className="btn" href="/videos">Watch the videos</Link>{' '}
              <a className="btn ghost" href={channelUrl} target="_blank" rel="noopener noreferrer">
                Channel on YouTube
              </a>
            </p>
          </section>
        </Reveal>

        <p className="about-note">
          This is an unofficial fan page and Jake has not reviewed it. These are his personal
          views from his videos, not professional advice. If you are struggling, talking to a
          doctor, a counsellor or someone you trust is a good step too.
        </p>
      </main>

      <footer className="footer">
        <p>Unofficial fan-made project. Not affiliated with or endorsed by Jake&apos;s Takes.</p>
      </footer>
    </>
  );
}
