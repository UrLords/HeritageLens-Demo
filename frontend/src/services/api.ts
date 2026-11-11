import type { Job } from "../types/heritage";

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? "").trim().replace(/\/+$/, "");
export const scanAvailable = import.meta.env.MODE !== "hosted" || Boolean(apiBaseUrl);

export function backendUrl(path: string) {
  return `${apiBaseUrl}${path}`;
}

async function json(r: Response) {
  let body: any = null;
  try { body = await r.json(); } catch { body = null; }
  if (!r.ok) throw new Error(body?.error || `Server error (${r.status})`);
  if (body === null) throw new Error("The scan server returned an invalid response.");
  return body;
}
export async function analyze(file: File): Promise<string> {
  const fd = new FormData(); fd.append("image", file);
  const b = await json(await fetch(backendUrl("/api/analyze"), { method: "POST", body: fd }));
  return b.job_id;
}
export async function getJob(id: string): Promise<Job> { return json(await fetch(backendUrl(`/api/results/${id}`))); }
