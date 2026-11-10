import { useId, useState } from "react";
import type { Metadata, StoryTranslation } from "../types/heritage";

export default function CulturalInfo({ m, translation }: { m: Metadata; translation?: StoryTranslation }) {
  const [language, setLanguage] = useState<"en" | "id">("en");
  const [topic, setTopic] = useState<"description" | "history" | "cultural_meaning">("description");
  const panelId = useId();
  const indonesian = language === "id" && translation !== undefined;
  const story = indonesian ? translation : m;
  const location = m.location?.trim();
  const locationCard = (
    <div className="story-location">
      <div>
        <h3>{indonesian ? "Lokasi" : "Location"}</h3>
        <p>{location || (indonesian ? "Lokasi belum terverifikasi." : "Location not verified.")}</p>
      </div>
      {location && (
        <a className="button-primary" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`}
          target="_blank" rel="noreferrer">
          {indonesian ? "Buka di Google Maps" : "Open in Google Maps"} <span aria-hidden="true">↗</span>
        </a>
      )}
    </div>
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
        {story.material && (
          <dl className="exhibit-facts">
            <div><dt>{indonesian ? "Bahan" : "Material"}</dt><dd>{story.material}</dd></div>
          </dl>
        )}
        {locationCard}

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
      <header className="story-heading">
        <p className="eyebrow">Object details</p>
        <h2>{m.name}</h2>
      </header>
      <div className="story-lede"><p>{m.description}</p></div>
      <dl className="object-details">
        <div><dt>Object type</dt><dd>{m.category || "Heritage object"}</dd></div>
        {m.material && <div><dt>Material</dt><dd>{m.material}</dd></div>}
      </dl>
      {locationCard}
      <div className="story-facts">
        <article className="story-card"><h3>History</h3><p>{m.history}</p></article>
        <article className="story-card"><h3>Cultural significance</h3><p>{m.cultural_meaning}</p></article>
      </div>
      {sources}
    </section>
  );
}
