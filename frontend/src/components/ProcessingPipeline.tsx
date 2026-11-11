import type { Stage } from "../types/heritage";

const STEPS: [Stage, string][] = [
  ["uploaded", "Image received"],
  ["matching", "Comparing reference images"],
  ["identified", "Match found"],
  ["segmenting", "Preparing the cutout"],
  ["metadata", "Loading object information"],
  ["model", "Loading model information"],
  ["complete", "Complete"],
];

export default function ProcessingPipeline({ stage }: { stage: Stage }) {
  const current = STEPS.findIndex(([step]) => step === stage);
  const progress = Math.max(10, ((current + 1) / STEPS.length) * 100);
  const label = STEPS[current]?.[1] ?? "Processing image";

  return (
    <div className="processing-card" role="status" aria-live="polite">
      <div className="processing-top"><span className="processing-spinner" aria-hidden="true" /><div><span className="processing-label">Scan status</span><p>{label}<span className="processing-ellipsis">…</span></p></div><span className="processing-percent">{Math.round(progress)}%</span></div>
      <div className="processing-track"><span style={{ width: `${progress}%` }} /></div>
    </div>
  );
}
