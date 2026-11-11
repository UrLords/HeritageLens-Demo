export default function RecognitionResult({ name, category, score }: { name: string; category?: string; score: number }) {
  return (
    <header className="recognized-heading reveal-up">
      <div><p className="eyebrow"><span className="eyebrow-dot" /> {category ?? "Heritage object"}</p><h2>{name}</h2></div>
      <div className="match-seal"><span>{Math.round(score * 100)}<small>%</small></span><small>VISUAL<br />MATCH</small></div>
    </header>
  );
}
