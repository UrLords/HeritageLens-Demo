export default function RecognitionResult({ name, category, score }: { name: string; category?: string; score: number }) {
  return (
    <header className="recognized-heading reveal-up">
      <div><p className="eyebrow"><span className="eyebrow-dot" /> A close visual match · {category ?? "Heritage object"}</p><h2>This is <em>{name}.</em></h2><p className="recognized-subtitle">Take a moment with its form, then open the story below.</p></div>
      <div className="match-seal"><span>{Math.round(score * 100)}<small>%</small></span><small>VISUAL<br />MATCH</small></div>
    </header>
  );
}
