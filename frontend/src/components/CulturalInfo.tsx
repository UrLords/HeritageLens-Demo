import { useId, useState } from "react";
import type { Metadata, StoryTranslation } from "../types/heritage";

export default function CulturalInfo({ m, translation }: { m: Metadata; translation?: StoryTranslation }) {
  const [language, setLanguage] = useState<"en" | "id">("en");
  const [topic, setTopic] = useState<"description" | "history" | "cultural_meaning">("description");
  const panelId = useId();
  const indonesian = language === "id" && translation !== undefined;
  const story = indonesian ? translation : m;
  const location = m.location?.trim();
  const mapLink = location && (
    <a className="story-map-link" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`}
      target="_blank" rel="noreferrer">
      {indonesian ? "Buka di Google Maps" : "Open in Google Maps"} <span aria-hidden="true">↗</span>
    </a>
  );
  const sources = (
      <details className="source-disclosure">
        <summary><span>{indonesian ? "Catatan sumber" : "Research notes"}</span><span>{m.sources.length} {indonesian ? "rujukan" : "references"} <b aria-hidden="true">＋</b></span></summary>
        <ul>{m.sources.map((source, index) => <li key={source.url}><span>{String(index + 1).padStart(2, "0")}</span><a href={source.url} target="_blank" rel="noreferrer">{source.title}<span aria-hidden="true">↗</span></a></li>)}</ul>
      </details>
  );

  if (translation) {
    const topics = {
      description: indonesian ? "Ringkasan" : "Overview",
      history: indonesian ? "Riwayat" : "History",
      cultural_meaning: indonesian ? "Makna budaya" : "Cultural role",
    };

    return (
      <section className="exhibit-story" lang={indonesian ? "id" : "en"} aria-label={indonesian ? "Panduan objek" : "Object guide"}>
        <div className="exhibit-language" role="group" aria-label={indonesian ? "Bahasa cerita" : "Story language"}>
          <button type="button" lang="en" aria-pressed={!indonesian} onClick={() => setLanguage("en")}>English</button>
          <button type="button" lang="id" aria-pressed={indonesian} onClick={() => setLanguage("id")}>Bahasa Indonesia</button>
        </div>
        <div aria-live="polite">
          <p className="eyebrow">{story.category || (indonesian ? "Benda warisan budaya" : "Heritage object")}</p>
          <h2>{m.name}</h2>
        </div>
        <dl className="exhibit-facts">
          {story.material && <div><dt>{indonesian ? "Bahan" : "Material"}</dt><dd>{story.material}</dd></div>}
          <div>
            <dt>{indonesian ? "Tempat" : "Place"}</dt>
            <dd>{location || (indonesian ? "Lokasi belum terverifikasi." : "Location not verified.")}{mapLink}</dd>
          </div>
        </dl>

        <div className="exhibit-topics" role="group" aria-label={indonesian ? "Topik objek" : "Object topics"}>
          {(Object.keys(topics) as Array<keyof typeof topics>).map((key) => (
            <button key={key} type="button" aria-pressed={topic === key} aria-controls={panelId}
              onClick={() => setTopic(key)}>{topics[key]}</button>
          ))}
        </div>
        <div id={panelId} className="exhibit-topic-copy" aria-live="polite">
          <p>{story[topic]}</p>
        </div>
        <p className="exhibit-review">{indonesian ? "Tinjauan komunitas belum tercatat." : "No community review recorded."}</p>
        {sources}
      </section>
    );
  }

  return (
    <section className="story-section reveal-up" lang="en">
      <div className="story-heading">
        <div><p className="eyebrow">The story within the form</p><h2>More than a silhouette.</h2></div>
        <span className="story-asterisk" aria-hidden="true">✳</span>
      </div>
      <div className="story-lede"><span className="story-lede-mark" aria-hidden="true">“</span><p>{m.description}</p></div>
      <div className="story-facts">
        <article className="story-card"><span className="story-card-index">01 · PLACE & TIME</span><h3>Rooted in place.</h3><p>{m.history}</p></article>
        <article className="story-card"><span className="story-card-index">02 · LIVING MEANING</span><h3>Held in meaning.</h3><p>{m.cultural_meaning}</p></article>
      </div>
      <div className="object-details">
        <div><span>FORM</span><strong>{m.category || "Heritage object"}</strong></div>
        {m.material && <div><span>MATERIAL</span><strong>{m.material}</strong></div>}
        <div><span>PLACE</span><strong>{location || "Location not verified."}</strong>{mapLink}</div>
      </div>
      {sources}
    </section>
  );
}
