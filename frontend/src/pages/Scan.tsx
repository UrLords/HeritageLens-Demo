import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { analyze, getJob } from "../services/api";
import type { Job } from "../types/heritage";
import UploadPanel from "../components/UploadPanel";
import ProcessingPipeline from "../components/ProcessingPipeline";
import ImageComparison from "../components/ImageComparison";
import RecognitionResult from "../components/RecognitionResult";
import CulturalInfo from "../components/CulturalInfo";
import Attribution from "../components/Attribution";
import UnknownResult from "../components/UnknownResult";

const ThreeDViewer = lazy(() => import("../components/ThreeDViewer"));

export default function Scan() {
  const [preview, setPreview] = useState("");
  const [job, setJob] = useState<Job | null>(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const timer = useRef<number>();
  const scrollTimer = useRef<number>();
  const previewUrl = useRef("");
  const resultRef = useRef<HTMLElement>(null);

  useEffect(() => () => {
    window.clearInterval(timer.current);
    window.clearTimeout(scrollTimer.current);
    if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
  }, []);

  const start = async (file: File) => {
    window.clearInterval(timer.current);
    if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
    const localPreview = URL.createObjectURL(file);
    previewUrl.current = localPreview;
    setErr("");
    setJob(null);
    setBusy(true);
    setPreview(localPreview);
    try {
      const id = await analyze(file);
      timer.current = window.setInterval(async () => {
        try {
          const next = await getJob(id);
          setJob(next);
          if (next.status !== "processing") {
            window.clearInterval(timer.current);
            setBusy(false);
          }
        } catch (error) {
          window.clearInterval(timer.current);
          setBusy(false);
          setErr((error as Error).message);
        }
      }, 900);
    } catch (error) {
      setBusy(false);
      setErr((error as Error).message);
    }
  };

  const result = job?.result;
  useEffect(() => {
    if (result?.status === "recognized") {
      scrollTimer.current = window.setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 180);
    }
  }, [result]);

  return (
    <main className="site-shell scan-shell">
      <header className="site-nav scan-nav">
        <Link to="/" className="brand" aria-label="Back to HeritageLens home"><span className="brand-mark">H</span><span>HERITAGE<span className="brand-light">LENS</span></span></Link>
        <Link to="/" className="nav-back"><span aria-hidden="true">←</span> Back to archive</Link>
      </header>

      <section className="scan-intro reveal-up">
        <p className="eyebrow">A photograph opens the door</p>
        <h1>Let’s meet<br /><em>the object.</em></h1>
        <p>Choose a clear image from this collection. We’ll find its closest match and bring its 3D form and story into view.</p>
      </section>

      <section className="scan-workspace" aria-label="Object image scan">
        <div className="upload-column">
          <div className="section-kicker"><span>01</span> YOUR PHOTOGRAPH</div>
          <UploadPanel onFile={start} disabled={busy} />
          {err && <p className="message-error" role="alert">{err}</p>}
          {job?.status === "error" && <div className="message-error" role="alert"><span className="message-label">A small snag</span>{job.error_type === "setup" ? "The archive needs one setup step: " : job.error_type === "model" ? "The recognition model needs attention: " : "We couldn’t read that image: "}{job.error}</div>}
          <div className="photo-preview" aria-live="polite">
            {preview ? <><div className="preview-meta"><span>IMAGE RECEIVED</span><span>LOCAL PREVIEW</span></div><img src={preview} alt="Your uploaded heritage object" /></> : <div className="preview-empty"><span className="preview-sun" aria-hidden="true">✳</span><span>Your image will appear here</span><small>Private preview · stays on this device</small></div>}
          </div>
          {busy && <ProcessingPipeline stage={job?.stage ?? "uploaded"} />}
        </div>
        <aside className="scan-aside">
          <div className="aside-index">FIELD NOTE <span>№ 01</span></div>
          <h2>Look for the whole shape.</h2>
          <p>A front-facing view with the complete object in frame usually gives the clearest match. A phone photo or a screenshot both work.</p>
          <p className="aside-small">This presentation archive recognizes five objects. If the image doesn’t match one closely enough, we’ll say so.</p>
          <div className="aside-rule" />
          <div className="aside-stamp"><span>H</span><small>LOCAL<br />ARCHIVE</small></div>
        </aside>
      </section>

      {result?.status === "unknown" && <section className="result-section" ref={resultRef}><UnknownResult r={result} onTryAgain={() => document.querySelector<HTMLInputElement>("#heritage-photo")?.click()} /></section>}

      {result?.status === "recognized" && (
        <section className="result-section" ref={resultRef} aria-live="polite">
          <RecognitionResult name={result.object.name} category={result.metadata.category} score={result.object.score} />
          <div className="result-viewer-layout">
            <div className="result-viewer-main">
              <div className="section-kicker"><span>02</span> INTERACTIVE 3D MODEL</div>
              <Suspense fallback={<div className="viewer-frame viewer-suspense">Preparing the 3D view…</div>}><ThreeDViewer model={result.model} /></Suspense>
            </div>
            <aside className="viewer-side-note">
              <p className="eyebrow">A closer view</p>
              <h3>Take your time<br />with the details.</h3>
              <p>Drag to turn the object. Scroll or pinch to move closer. The model stays here on your device.</p>
              <div className="side-note-mark" aria-hidden="true">✳</div>
            </aside>
          </div>
          {result.segmentation ? <div className="cutout-section"><div className="section-kicker"><span>03</span> TURN THE FORM</div><ImageComparison original={preview} segmented={result.segmentation.segmented_url} /></div> : <div className="quiet-note"><span className="quiet-note-mark">✳</span><span>The 3D form is ready to explore. Image cutout is an optional feature.</span></div>}
          <CulturalInfo m={result.metadata} />
          <Attribution model={result.model} />
          <div className="again-row"><p>There is always more to notice.</p><button type="button" onClick={() => document.querySelector<HTMLInputElement>("#heritage-photo")?.click()} className="text-link">Choose another image <span aria-hidden="true">↗</span></button></div>
        </section>
      )}
      <footer className="site-footer scan-footer"><Link to="/" className="brand"><span className="brand-mark">H</span><span>HERITAGE<span className="brand-light">LENS</span></span></Link><p>Made for looking a little longer.</p><span className="footer-edition">A SMALL DIGITAL ARCHIVE · 2026</span></footer>
    </main>
  );
}
