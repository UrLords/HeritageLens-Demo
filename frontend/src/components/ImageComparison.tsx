export default function ImageComparison({ original, segmented }: { original: string; segmented: string }) {
  return (
    <div className="comparison-grid">
      <figure className="comparison-card"><figcaption><span>THE PHOTOGRAPH</span><span>01</span></figcaption><div><img src={original} alt="Original photograph" /></div></figure>
      <figure className="comparison-card comparison-cutout"><figcaption><span>THE SILHOUETTE</span><span>02</span></figcaption><div><img src={segmented} alt="Isolated heritage object" /></div></figure>
    </div>
  );
}
