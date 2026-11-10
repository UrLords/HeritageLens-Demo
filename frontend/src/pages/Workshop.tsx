import { lazy, Suspense, useState } from "react";
import { Link } from "react-router-dom";
import Attribution from "../components/Attribution";
import CulturalInfo from "../components/CulturalInfo";
import { workshopModels, workshopObjects } from "../data/workshop";
import { indonesianStories } from "../data/indonesianStories";

const ThreeDViewer = lazy(() => import("../components/ThreeDViewer"));

export default function Workshop() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const artifact = workshopObjects[selectedIndex];
  const modelUrl = workshopModels[`../../workshop-models/${artifact.id}.glb`];
  const exhibitNumber = String(selectedIndex + 1).padStart(2, "0");

  return (
    <main className="site-shell exhibit">
      <header className="site-nav">
        <Link to="/" className="brand"><span className="brand-mark">H</span> HERITAGELENS</Link>
        <a className="text-link" href="#exhibit-collection">Browse collection ↓</a>
      </header>
      <section className="exhibit-intro">
        <div>
          <p className="eyebrow">Track 5 · Virtual exhibition</p>
          <h1>Objects & their stories</h1>
        </div>
        <small>Sample recognition result · simulated</small>
      </section>

      <div id="current-exhibit" className="exhibit-grid" tabIndex={-1}>
        <CulturalInfo m={artifact} translation={indonesianStories[artifact.id]} />
        <section className="exhibit-display" aria-label="Exhibit display">
          <div className="exhibit-display-label">
            <span>ON VIEW / {exhibitNumber}</span>
            <span>{modelUrl ? "EXISTING 3D MODEL" : "CATALOG RECORD"}</span>
          </div>
          {modelUrl ? (
            <Suspense fallback={<div className="viewer-frame viewer-suspense">Preparing the 3D view…</div>}>
              <ThreeDViewer model={{ local_url: modelUrl }} />
            </Suspense>
          ) : (
            <div className="exhibit-no-model">
              <span aria-hidden="true">{exhibitNumber}</span>
              <p>3D view unavailable for this exhibit.</p>
              <a className="text-link" href={artifact.model.url} target="_blank" rel="noreferrer">View original model listing ↗</a>
            </div>
          )}
          <Attribution model={artifact.model} expanded />
        </section>
      </div>

      <section id="exhibit-collection" className="exhibit-collection" aria-labelledby="exhibit-collection-heading">
        <div className="exhibit-collection-heading">
          <h2 id="exhibit-collection-heading">The collection</h2>
          <span>{workshopObjects.length} objects</span>
        </div>
        <div className="exhibit-choices" role="group" aria-label="Choose an exhibit">
          {workshopObjects.map((object, index) => (
            <button key={object.id} type="button" aria-pressed={selectedIndex === index} aria-controls="current-exhibit"
              onClick={() => {
                setSelectedIndex(index);
                const exhibit = document.getElementById("current-exhibit");
                exhibit?.focus({ preventScroll: true });
                exhibit?.scrollIntoView({ block: "start", behavior: "instant" });
              }}>
              <span className="exhibit-choice-number">{String(index + 1).padStart(2, "0")}</span>
              <span>{object.name}</span>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}
