import type { AspectRatioId, ResolutionId } from "../types";

/** Short edge reference height in px for resolution tiers */
const SHORT_EDGE: Record<ResolutionId, number> = {
  "720p": 720,
  "1080p": 1080,
  "4k": 2160,
};

const RATIO_WH: Record<AspectRatioId, number> = {
  "16:9": 16 / 9,
  "9:16": 9 / 16,
  "1:1": 1,
  "4:5": 4 / 5,
  "21:9": 21 / 9,
};

export interface PixelSize {
  width: number;
  height: number;
}

export function getCanvasPixels(
  aspect: AspectRatioId,
  resolutionId: ResolutionId,
): PixelSize {
  const short = SHORT_EDGE[resolutionId];
  const r = RATIO_WH[aspect];
  if (r >= 1) {
    const h = short;
    const w = Math.round(h * r);
    return { width: w, height: h };
  }
  const w = short;
  const h = Math.round(w / r);
  return { width: w, height: h };
}

export const ASPECT_RATIO_OPTIONS: { id: AspectRatioId; label: string }[] = [
  { id: "16:9", label: "16:9 (YouTube)" },
  { id: "9:16", label: "9:16 (Shorts / Reels)" },
  { id: "1:1", label: "1:1" },
  { id: "4:5", label: "4:5" },
  { id: "21:9", label: "21:9" },
];

export const RESOLUTION_OPTIONS: { id: ResolutionId; label: string }[] = [
  { id: "720p", label: "720p class" },
  { id: "1080p", label: "1080p class" },
  { id: "4k", label: "4K class" },
];

export const FPS_OPTIONS = [24, 25, 30, 60] as const;
