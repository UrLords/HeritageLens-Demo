import type { Job } from "../types/heritage";

async function json(r: Response) {
  let body: any = null;
  try { body = await r.json(); } catch { body = null; }
  if (!r.ok) throw new Error(body?.error || `Server error (${r.status})`);
  return body;
}
export async function analyze(file: File): Promise<string> {
  const fd = new FormData(); fd.append("image", file);
  const b = await json(await fetch("/api/analyze", { method: "POST", body: fd }));
  return b.job_id;
}
export async function getJob(id: string): Promise<Job> { return json(await fetch(`/api/results/${id}`)); }
