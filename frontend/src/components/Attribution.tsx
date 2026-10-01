import type { ModelInfo } from "../types/heritage";

export default function Attribution({ model }: { model: ModelInfo }) {
  const unverifiedLicense = model.license.startsWith("Check current");

  return (
    <details className="credit-disclosure">
      <summary><span>Model credit & license</span><span>Open details <b aria-hidden="true">＋</b></span></summary>
      <div className="credit-details"><p>3D model by <strong>{model.creator}</strong> · provided via {model.provider}.</p><p>License: {model.license}</p><div>{unverifiedLicense ? <a href={model.url} target="_blank" rel="noreferrer">Open model page to verify terms ↗</a> : <><a href={model.url} target="_blank" rel="noreferrer">Original model ↗</a><a href={model.license_url} target="_blank" rel="noreferrer">License terms ↗</a></>}</div></div>
    </details>
  );
}
