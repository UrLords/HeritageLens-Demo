import { lazy, Suspense, useState } from "react";
import { Link } from "react-router-dom";
import { collection } from "../data/collection";
import { getOnlineModelUrl, onlineModelCredits } from "../data/onlineModels";

const ThreeDViewer = lazy(() => import("../components/ThreeDViewer"));

export default function Home() {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = collection[activeIndex];
  const hosted = import.meta.env.MODE === "hosted";
  const modelUrl = hosted ? getOnlineModelUrl(active.id) : active.local_url;
  const credit = hosted && modelUrl ? onlineModelCredits.find((object) => object.id === active.id)?.model : undefined;

  return (
    <main className="site-shell">
      <header className="site-nav">
        <Link to="/" className="brand" aria-label="HeritageLens home">
          <span className="brand-mark">H</span><span>HERITAGE<span className="brand-light">LENS</span></span>
        </Link>
        <nav aria-label="Main navigation" className="nav-links">
          <a href="#collection">The collection</a>
          <Link to="/scan" className="nav-cta">Open the lens <span aria-hidden="true">↗</span></Link>
        </nav>
      </header>

      <section className="hero-section">
        <div className="hero-copy reveal-up">
          <p className="eyebrow"><span className="eyebrow-dot" /> HERITAGE COLLECTION</p>
          <h1>Look closer.<br /><em>Remember more.</em></h1>
          <p className="hero-intro">Explore five heritage objects from Bali and Lombok. See their 3D models and learn about their history and location.</p>
          <div className="hero-actions">
            <Link to="/scan" className="button-primary">Begin with a photograph <span aria-hidden="true">↗</span></Link>
            <a href="#collection" className="text-link">Browse the collection <span aria-hidden="true">↓</span></a>
          </div>
        </div>

        <div className="hero-object reveal-up reveal-delay-1">
          <div className="viewer-heading"><span>ON VIEW · {active.kind.toUpperCase()}</span><span>{String(activeIndex + 1).padStart(2, "0")} / 05</span></div>
          <div className="home-viewer">
            {modelUrl ? (
              <Suspense fallback={<div className="viewer-frame viewer-suspense">Preparing the viewer…</div>}>
                <ThreeDViewer model={{ local_url: modelUrl }} />
              </Suspense>
            ) : (
              <div className="viewer-frame viewer-suspense"><p>The 3D model for this object is unavailable online.</p></div>
            )}
          </div>
          <div className="viewer-caption">
            <div>
              <p className="caption-place">{active.place}</p>
              <h2>{active.name}</h2>
              {credit && (
                <small>
                  Model by <a href={credit.url} target="_blank" rel="noreferrer">{credit.creator}</a>
                  {" · "}<a href={credit.license_url} target="_blank" rel="noreferrer">{credit.license}</a>
                </small>
              )}
            </div>
            {modelUrl && <span className="caption-note">Drag to turn<br />Scroll to come closer</span>}
          </div>
          <div className="collection-selector" role="group" aria-label="Choose an object to view">
            {collection.map((item, index) => (
              <button key={item.id} type="button" aria-pressed={activeIndex === index}
                onClick={() => setActiveIndex(index)} className={`collection-dot ${activeIndex === index ? "is-active" : ""}`}>
                <span>{String(index + 1).padStart(2, "0")}</span><span>{item.name}</span>
              </button>
            ))}
          </div>
        </div>
        <a href="#why" className="scroll-cue" aria-label="Scroll to learn more"><span /> SCROLL TO EXPLORE</a>
      </section>

      <section id="why" className="intro-band reveal-up">
        <div className="intro-grid">
          <h2>How photo matching works</h2>
          <p>HeritageLens compares your photo with reference images from the collection. A match opens the object’s record.</p>
        </div>
        <div className="experience-steps">
          <article><span className="step-number">01</span><div><h3>Upload a photo</h3><p>Choose a clear image of an object in the collection.</p></div></article>
          <article><span className="step-number">02</span><div><h3>Check the match</h3><p>The scanner checks whether the photo is a close match.</p></div></article>
          <article><span className="step-number">03</span><div><h3>View the object</h3><p>Read the object’s history and location, and open its 3D model when available.</p></div></article>
        </div>
      </section>

      <section id="collection" className="collection-section">
        <div className="section-heading reveal-up"><div><h2>The collection</h2></div><Link to="/scan" className="text-link">Scan a photo <span aria-hidden="true">↗</span></Link></div>
        <div className="collection-list">
          {collection.map((item, index) => (
            <button key={item.id} type="button" className={`collection-row ${activeIndex === index ? "is-selected" : ""}`} onClick={() => { setActiveIndex(index); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
              <span className="row-index">{String(index + 1).padStart(2, "0")}</span>
              <span className="row-name">{item.name}</span>
              <span className="row-kind">{item.kind}</span>
              <span className="row-arrow" aria-hidden="true">↗</span>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}
