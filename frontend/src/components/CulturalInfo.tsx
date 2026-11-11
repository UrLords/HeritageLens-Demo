import type { Metadata } from "../types/heritage";

export default function CulturalInfo({ m }: { m: Metadata }) {
  const location = m.location?.trim();
  const mapLink = location && (
    <a className="story-map-link" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`}
      target="_blank" rel="noreferrer">
      Open in Google Maps <span aria-hidden="true">↗</span>
    </a>
  );

  return (
    <section className="story-section reveal-up" lang="en">
      <div className="story-heading">
        <h2>About this object</h2>
      </div>
      <div className="story-lede"><p>{m.description}</p></div>
      <div className="story-facts">
        <article className="story-card"><h3>History</h3><p>{m.history}</p></article>
        <article className="story-card"><h3>Cultural role</h3><p>{m.cultural_meaning}</p></article>
      </div>
      <div className="object-details">
        <div><span>FORM</span><strong>{m.category || "Heritage object"}</strong></div>
        {m.material && <div><span>MATERIAL</span><strong>{m.material}</strong></div>}
        <div><span>PLACE</span><strong>{location || "Location not verified."}</strong>{mapLink}</div>
      </div>
      <details className="source-disclosure">
        <summary><span>Sources</span><span>{m.sources.length} references <b aria-hidden="true">＋</b></span></summary>
        <ul>{m.sources.map((source, index) => <li key={source.url}><span>{String(index + 1).padStart(2, "0")}</span><a href={source.url} target="_blank" rel="noreferrer">{source.title}<span aria-hidden="true">↗</span></a></li>)}</ul>
      </details>
    </section>
  );
}
