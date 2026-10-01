export interface ModelInfo { provider: string; creator: string; url: string; local_url: string; license: string; license_url: string }
export interface Metadata {
  id: string; name: string; category?: string; description: string; history: string; cultural_meaning: string;
  location?: string; material?: string; model: ModelInfo; sources: { title: string; url: string }[];
}
export interface Recognized {
  status: "recognized"; object: { id: string; name: string; score: number };
  segmentation: { mask_url: string; segmented_url: string } | null; segmentation_warning?: string; metadata: Metadata; model: ModelInfo;
}
export interface Unknown { status: "unknown"; top_score: number; second_score: number; threshold: number; margin: number }
export type Result = Recognized | Unknown;
export type Stage = "uploaded" | "matching" | "identified" | "segmenting" | "metadata" | "model" | "complete";
export interface Job { job_id: string; status: "processing" | "done" | "error"; stage: Stage; result?: Result; error?: string; error_type?: string }
