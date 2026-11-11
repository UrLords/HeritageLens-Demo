import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { analyze, backendUrl, getJob, scanAvailable } from "../services/api";
import { getOnlineModelUrl } from "../data/onlineModels";
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
  const modelUrl = result?.status === "recognized"
    ? import.meta.env.MODE === "hosted" ? getOnlineModelUrl(result.object.id) : result.model.local_url
    : undefined;
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
        <h1>Scan a heritage object</h1>
        <p>Upload a photo to compare it with the five objects in the collection.</p>
        {!scanAvailable && <p className="message-error" role="status">Photo scanning is currently available in the local app. This site is not connected to the scan server.</p>}
      </section>

      <section className="scan-workspace" aria-label="Object image scan">
        <div className="upload-column">
          <div className="section-kicker"><span>01</span> YOUR PHOTOGRAPH</div>
          <UploadPanel onFile={start} disabled={busy || !scanAvailable} />
          {err && <p className="message-error" role="alert">{err}</p>}
          {job?.status === "error" && <div className="message-error" role="alert"><span className="message-label">Scan failed</span>{job.error_type === "setup" ? "Scanner setup required: " : job.error_type === "model" ? "Recognition model error: " : "We couldn’t read that image: "}{job.error}</div>}
          <div className="photo-preview" aria-live="polite">
            {preview ? <><div className="preview-meta"><span>IMAGE RECEIVED</span><span>LOCAL PREVIEW</span></div><img src={preview} alt="Your uploaded heritage object" /></> : <div className="preview-empty"><span className="preview-sun" aria-hidden="true">✳</span><span>Your image will appear here</span></div>}
          </div>
          {busy && <ProcessingPipeline stage={job?.stage ?? "uploaded"} />}
        </div>
        <aside className="scan-aside">
          <div className="aside-index">PHOTO TIPS</div>
          <h2>Keep the whole object in frame.</h2>
          <p>Use a clear front view with good lighting. You can also try a screenshot of the model.</p>
          <p className="aside-small">The scanner can match only the five objects in the collection.</p>
        </aside>
      </section>

      {result?.status === "unknown" && <section className="result-section" ref={resultRef}><UnknownResult r={result} onTryAgain={() => document.querySelector<HTMLInputElement>("#heritage-photo")?.click()} /></section>}

      {result?.status === "recognized" && (
        <section className="result-section" ref={resultRef} aria-live="polite">
          <RecognitionResult name={result.object.name} category={result.metadata.category} score={result.object.score} />
          <div className="result-viewer-layout">
            <div className="result-viewer-main">
              <div className="section-kicker"><span>02</span> INTERACTIVE 3D MODEL</div>
              {modelUrl ? (
                <Suspense fallback={<div className="viewer-frame viewer-suspense">Loading 3D viewer...</div>}>
                  <ThreeDViewer model={{ local_url: modelUrl }} />
                </Suspense>
              ) : <p>The 3D model for this object is unavailable online.</p>}
            </div>
            {modelUrl && <aside className="viewer-side-note"><h3>3D controls</h3><p>Drag to rotate. Scroll or pinch to zoom.</p></aside>}
          </div>
          {result.segmentation ? <div className="cutout-section"><div className="section-kicker"><span>03</span> PHOTO CUTOUT</div><ImageComparison original={preview} segmented={backendUrl(result.segmentation.segmented_url)} /></div> : null}
          <CulturalInfo m={result.metadata} />
          <Attribution model={result.model} />
          <div className="again-row"><button type="button" onClick={() => document.querySelector<HTMLInputElement>("#heritage-photo")?.click()} className="text-link">Choose another image <span aria-hidden="true">↗</span></button></div>
        </section>
      )}
      <footer className="site-footer scan-footer"><Link to="/" className="brand"><span className="brand-mark">H</span><span>HERITAGE<span className="brand-light">LENS</span></span></Link></footer>
    </main>
  );
}
