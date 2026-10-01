import type { Stage } from "../types/heritage";

const STEPS: [Stage, string][] = [
  ["uploaded", "Image received"],
  ["matching", "Looking for a familiar form"],
  ["identified", "Match found"],
  ["segmenting", "Preparing the object view"],
  ["metadata", "Gathering its story"],
  ["model", "Opening the 3D form"],
  ["complete", "Complete"],
];

export default function ProcessingPipeline({ stage }: { stage: Stage }) {
  const current = STEPS.findIndex(([step]) => step === stage);
  const progress = Math.max(10, ((current + 1) / STEPS.length) * 100);
  const label = STEPS[current]?.[1] ?? "Looking at the image";

  return (
    <div className="processing-card" role="status" aria-live="polite">
      <div className="processing-top"><span className="processing-spinner" aria-hidden="true" /><div><span className="processing-label">A little patience</span><p>{label}<span className="processing-ellipsis">…</span></p></div><span className="processing-percent">{Math.round(progress)}%</span></div>
      <div className="processing-track"><span style={{ width: `${progress}%` }} /></div>
    </div>
  );
}
