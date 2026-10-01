import type { Unknown } from "../types/heritage";

export default function UnknownResult({ r, onTryAgain }: { r: Unknown; onTryAgain?: () => void }) {
  return (
    <article className="unknown-card reveal-up">
      <div className="unknown-symbol" aria-hidden="true">?</div>
      <div className="unknown-copy"><p className="eyebrow">A quiet mystery</p><h2>We didn’t find a close match.</h2><p>This image sits outside the five objects in the collection. Try another angle with the whole sculpture in view.</p><button type="button" onClick={onTryAgain} className="button-primary">Try another image <span aria-hidden="true">↗</span></button></div>
      <div className="unknown-score"><span>{Math.round(r.top_score * 100)}<small>%</small></span><small>CLOSEST<br />MATCH</small></div>
    </article>
  );
}
