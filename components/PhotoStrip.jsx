// Two rows of photos that slowly slide past in opposite directions.
// Shows nothing until there are photos in public/photos.
function fill(list) {
  let out = list.slice();
  while (out.length < 8) out = out.concat(list);
  return out;
}

function Row({ items, reverse }) {
  return (
    <div className={`strip-row ${reverse ? 'rev' : ''}`}>
      <div className="strip-track">
        {[0, 1].map((n) => (
          <div className="strip-group" key={n}>
            {items.map((p, i) => (
              <img key={i} src={p.src} alt="" loading="lazy" decoding="async" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PhotoStrip({ photos }) {
  if (!photos || photos.length === 0) return null;
  return (
    <div className="strip" aria-hidden="true">
      <Row items={fill(photos)} />
      <Row items={fill(photos.slice().reverse())} reverse />
    </div>
  );
}
