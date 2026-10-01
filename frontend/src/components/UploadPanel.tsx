import { useRef, useState } from "react";

const OK = ["image/jpeg", "image/png", "image/webp"];

export default function UploadPanel({ onFile, disabled }: { onFile: (file: File) => void; disabled?: boolean }) {
  const ref = useRef<HTMLInputElement>(null);
  const [err, setErr] = useState("");
  const [dragging, setDragging] = useState(false);

  const pick = (file?: File) => {
    if (!file) return;
    if (!OK.includes(file.type)) return setErr("Please choose a JPG, PNG or WEBP image.");
    if (file.size > 10 * 1024 * 1024) return setErr("This image is larger than 10 MB.");
    setErr("");
    onFile(file);
  };

  return (
    <div className="upload-wrap">
      <label className={`upload-drop ${dragging ? "is-dragging" : ""} ${disabled ? "is-disabled" : ""}`} onDragEnter={(event) => { event.preventDefault(); setDragging(true); }} onDragOver={(event) => event.preventDefault()} onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setDragging(false); }} onDrop={(event) => { event.preventDefault(); setDragging(false); if (!disabled) pick(event.dataTransfer.files[0]); }}>
        <input ref={ref} id="heritage-photo" className="upload-input" type="file" accept=".jpg,.jpeg,.png,.webp" disabled={disabled} onChange={(event) => { pick(event.target.files?.[0]); event.currentTarget.value = ""; }} />
        <span className="upload-icon" aria-hidden="true"><svg viewBox="0 0 40 40" fill="none"><path d="M20 27V9m0 0-7 7m7-7 7 7M9 25v7h22v-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
        <span className="upload-title">{dragging ? "Drop it here" : "Drop a photograph here"}</span>
        <span className="upload-or">or</span>
        <span className="upload-button">Choose an image <span aria-hidden="true">↗</span></span>
        <span className="upload-meta">JPG, PNG or WEBP <i /> Up to 10 MB</span>
      </label>
      <div className="upload-foot"><span>ONE OBJECT AT A TIME</span><span>YOUR PHOTO STAYS LOCAL</span></div>
      {err && <p className="message-error" role="alert">{err}</p>}
    </div>
  );
}
