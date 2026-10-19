export default function Home() {
  return (
    <>
      <nav className="nav">
        <a href="#" className="logo">JAKE'S TAKES</a>
        <div className="nav-links">
          <a href="#">Videos</a>
          <a href="#">Gallery</a>
        </div>
      </nav>

      <main>
        <section className="hero">
          <div className="hero-inner">
            <p className="eyebrow">Fitness · Mindset · Discipline</p>
            <h1>Jake's Takes</h1>
            <p>Videos, livestreams and a community, all in one place.</p>
            <a
              className="btn"
              href="https://youtube.com/@jakestakes3228"
              target="_blank"
              rel="noopener noreferrer"
            >
              Watch on YouTube
            </a>
          </div>
        </section>
      </main>

      <footer className="footer">
        Unofficial fan-made project. Not affiliated with or endorsed by Jake's Takes.
      </footer>
    </>
  );
}
