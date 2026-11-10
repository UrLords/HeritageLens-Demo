import { lazy, Suspense, useState } from "react";
import { Link } from "react-router-dom";
import Attribution from "../components/Attribution";
import { collection } from "../data/collection";
import { workshopModels, workshopObjects } from "../data/workshop";

const ThreeDViewer = lazy(() => import("../components/ThreeDViewer"));

export default function Home() {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = collection[activeIndex];
  const hosted = import.meta.env.MODE === "workshop";
  const lensPath = hosted ? "/workshop" : "/scan";
  const modelUrl = hosted ? workshopModels[`../../workshop-models/${active.id}.glb`] : active.local_url;

  return (
    <main className="site-shell">
      <header className="site-nav">
        <Link to="/" className="brand" aria-label="HeritageLens home">
          <span className="brand-mark">H</span><span>HERITAGE<span className="brand-light">LENS</span></span>
        </Link>
        <nav aria-label="Main navigation" className="nav-links">
          <a href="#collection">The collection</a>
          <Link to={lensPath} className="nav-cta">Open the lens <span aria-hidden="true">↗</span></Link>
        </nav>
      </header>

      <section className="hero-section">
        <div className="hero-copy reveal-up">
          <p className="eyebrow"><span className="eyebrow-dot" /> A small digital heritage archive</p>
          <h1>Look closer.<br /><em>Remember more.</em></h1>
          <p className="hero-intro">A photograph is a beginning. Meet the forms, stories and living traditions held in five Balinese heritage objects.</p>
          <div className="hero-actions">
            <Link to={lensPath} className="button-primary">{hosted ? "Explore the demo" : "Begin with a photograph"} <span aria-hidden="true">↗</span></Link>
            <a href="#collection" className="text-link">Wander the collection <span aria-hidden="true">↓</span></a>
          </div>
          <div className="hero-footnote"><span>01—05</span><span>A pocket museum, made to explore</span></div>
        </div>

        <div className="hero-object reveal-up reveal-delay-1">
          <div className="viewer-heading"><span>ON VIEW · {active.kind.toUpperCase()}</span><span>{String(activeIndex + 1).padStart(2, "0")} / 05</span></div>
          <div className="home-viewer">
            {modelUrl ? (
              <Suspense fallback={<div className="viewer-frame viewer-suspense">Preparing the viewer…</div>}>
                <ThreeDViewer model={{ local_url: modelUrl }} />
              </Suspense>
            ) : (
              <div className="viewer-frame viewer-suspense"><p>3D view unavailable online. <Link to={lensPath}>Explore the catalog ↗</Link></p></div>
            )}
          </div>
          <div className="viewer-caption">
            <div><p className="caption-place">{active.place}</p><h2>{active.name}</h2></div>
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
        <p className="eyebrow">A different way to meet an object</p>
        <div className="intro-grid">
          <h2>From a single image<br />to a <em>closer connection.</em></h2>
          <p>HeritageLens brings recognition, a tactile 3D view and cultural context into one quiet place. Turn the object. Notice its silhouette. Follow the details at your own pace.</p>
        </div>
        <div className="experience-steps">
          <article><span className="step-number">01</span><div><h3>Bring a photograph</h3><p>{hosted ? "Open the workshop to explore a sample recognition result." : "Choose an image of one of the objects in this small collection."}</p></div></article>
          <article><span className="step-number">02</span><div><h3>Find its form</h3><p>{hosted ? "The workshop uses preset matches for the five objects." : "Visual matching finds the closest recorded object in the archive."}</p></div></article>
          <article><span className="step-number">03</span><div><h3>Explore the story</h3><p>Move around its 3D form and unfold the context behind it.</p></div></article>
        </div>
      </section>

      <section id="collection" className="collection-section">
        <div className="section-heading reveal-up"><div><p className="eyebrow">Five forms · one small archive</p><h2>Objects with <em>presence.</em></h2></div><Link to={lensPath} className="text-link">{hosted ? "Explore the workshop" : "Explore with your photo"} <span aria-hidden="true">↗</span></Link></div>
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
        {hosted && workshopObjects.filter((object) => workshopModels[`../../workshop-models/${object.id}.glb`]).map((object) => (
          <div key={object.id}>
            <p className="caption-place">{object.name}</p>
            <Attribution model={object.model} />
          </div>
        ))}
      </section>

      <footer className="site-footer"><Link to="/" className="brand"><span className="brand-mark">H</span><span>HERITAGE<span className="brand-light">LENS</span></span></Link><Link to="/workshop" className="footer-link">Track 5 workshop ↗</Link><Link to={lensPath} className="footer-link">Start exploring ↗</Link></footer>
    </main>
  );
}
