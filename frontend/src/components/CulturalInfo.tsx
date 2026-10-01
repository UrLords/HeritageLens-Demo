import type { Metadata } from "../types/heritage";

export default function CulturalInfo({ m }: { m: Metadata }) {
  return (
    <section className="story-section reveal-up">
      <div className="story-heading"><div><p className="eyebrow">The story within the form</p><h2>More than a silhouette.</h2></div><span className="story-asterisk" aria-hidden="true">✳</span></div>
      <div className="story-lede"><span className="story-lede-mark" aria-hidden="true">“</span><p>{m.description}</p></div>
      <div className="story-facts">
        <article className="story-card"><span className="story-card-index">01 · PLACE & TIME</span><h3>Rooted in place.</h3><p>{m.history}</p></article>
        <article className="story-card"><span className="story-card-index">02 · LIVING MEANING</span><h3>Held in meaning.</h3><p>{m.cultural_meaning}</p></article>
      </div>
      <div className="object-details">
        <div><span>FORM</span><strong>{m.category || "Heritage object"}</strong></div>
        {m.material && <div><span>MATERIAL</span><strong>{m.material}</strong></div>}
        {m.location && <div><span>PLACE</span><strong>{m.location}</strong></div>}
      </div>
      <details className="source-disclosure">
        <summary><span>Research notes</span><span>{m.sources.length} references <b aria-hidden="true">＋</b></span></summary>
        <ul>{m.sources.map((source, index) => <li key={source.url}><span>{String(index + 1).padStart(2, "0")}</span><a href={source.url} target="_blank" rel="noreferrer">{source.title}<span aria-hidden="true">↗</span></a></li>)}</ul>
      </details>
    </section>
  );
}
