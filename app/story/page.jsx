import '../videos/videos.css';
import '../motion.css';
import '../motion2.css';
import './story.css';
import Link from 'next/link';
import Reveal from '../../components/Reveal';
import Fire from '../../components/Fire';
import { channelUrl } from '../../data/site';

export const metadata = {
  title: "My Story | Jake's Takes",
  description: 'Raw action, going back to simple, and never quitting.',
};

const themes = [
  {
    n: '01',
    title: 'Raw action',
    body: [
      "Everyone online says the answer is to talk about your problems and check up on your friends. I'm not against that. You should always check up on your people. But it's one small piece of a massive puzzle, and we're missing the biggest part: raw action.",
      "Do the push-ups in your room. Start the side business. Text your crush. Have the conversation you've been avoiding. Do the hard thing you know you need to do for your own growth. Then ask yourself honestly: what raw action have you taken? Have you been to the gym this month? Do you have a goal, a purpose?",
      "The men I see who feel good all have one thing in common, and that's purpose. A solution will always bring you more peace than dwelling in the problem.",
    ],
    pull: "Raw action is one of the best things for men's mental health.",
  },
  {
    n: '02',
    title: 'Back to simple',
    body: [
      "I made one of my videos at a campsite in Prescott, Arizona, with the sun going down. Every time I'm out in nature for three hours or more, I get the same realization: this is exactly what we're supposed to be doing as humans.",
      "We're addicted to our phones, to electronics, to modern-day life, and then we wonder why we're so stressed. Three hundred years ago this was just a typical day: burgers on the fire, the sun going down, zero electronics, maybe throwing around a frisbee. We've gone away from simple.",
      "So here's my challenge: pick a side quest. Go camping for two days. What is actually stopping you? All you need to do is seek it out, and it's free.",
    ],
    pull: 'The most valuable things on Earth are free.',
  },
  {
    n: '03',
    title: 'Daily discipline',
    body: [
      "I made a day-in-the-life vlog every year of college. In my senior one, the day starts at the gym, where I stream my workout. Then I chill in the sun by the pool while the pump settles, and eat a post-workout meal: four burgers, pickles and some raw honey.",
      "After that it's off to campus for notebook work and laptop work, usually with a live stream from the middle of campus.",
      "It isn't always smooth. One of my videos was my fifth attempt at filming it, and I was sweating and stressed. That's part of it. You do hard things, you try, you try again, and then it works.",
    ],
    pull: 'Time to actually win at real life. No excuses. Got to lock in.',
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
          <p className="eyebrow">My story</p>
          <h1 className="page-title">Yo, what is up.</h1>
          <p className="story-lead">
            I&apos;m Jake. I&apos;m an online fitness coach and YouTuber. I graduated from Arizona
            State University, I stream my workouts, and I make videos about fitness, mindset and
            having a purpose. My videos all end the same way: don&apos;t quit.
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
                <p className="pull">{t.pull}</p>
              </div>
            </article>
          </Reveal>
        ))}
      </main>

      <section className="fire" aria-labelledby="dont-quit">
        <Fire />
        <Reveal>
          <div className="fire-content">
            <p className="signoff-word" id="dont-quit">Don&apos;t quit.</p>
            <p className="fire-sub">Have a great rest of your day. Peace.</p>
            <p className="fire-actions">
              <Link className="btn" href="/videos">Watch my videos</Link>
              <a className="btn ghost" href={channelUrl} target="_blank" rel="noopener noreferrer">
                My channel on YouTube
              </a>
            </p>
          </div>
        </Reveal>
      </section>
    </>
  );
}
