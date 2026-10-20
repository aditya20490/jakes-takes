import Link from 'next/link';
import { socials } from '../data/site';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="sf-inner">
        <div className="sf-brand">
          <Link href="/" className="logo">JAKE&apos;S TAKES</Link>
          <p>Fitness, mindset and purpose. Don&apos;t quit.</p>
        </div>

        <nav className="sf-col" aria-label="Explore">
          <h2>Explore</h2>
          <Link href="/story">Story</Link>
          <Link href="/videos">Videos</Link>
          <Link href="/#gallery">Gallery</Link>
          <Link href="/#community">Community</Link>
        </nav>

        <nav className="sf-col" aria-label="Connect">
          <h2>Connect</h2>
          {socials.map((s) => (
            <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer">
              {s.name} <span aria-hidden="true">↗</span>
            </a>
          ))}
        </nav>
      </div>

      <div className="sf-bottom">
        <span>&copy; {year} Jake&apos;s Takes</span>
        <a href="#">Back to top ↑</a>
      </div>
    </footer>
  );
}
