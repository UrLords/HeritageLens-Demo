import type { Unknown } from "../types/heritage";

export default function UnknownResult({ r, onTryAgain }: { r: Unknown; onTryAgain?: () => void }) {
  return (
    <article className="unknown-card reveal-up">
      <div className="unknown-symbol" aria-hidden="true">?</div>
      <div className="unknown-copy"><h2>No close match</h2><p>Try a clear photo with the whole object in frame.</p><button type="button" onClick={onTryAgain} className="button-primary">Try another image <span aria-hidden="true">↗</span></button></div>
      <div className="unknown-score"><span>{Math.round(r.top_score * 100)}<small>%</small></span><small>CLOSEST<br />MATCH</small></div>
    </article>
  );
}
