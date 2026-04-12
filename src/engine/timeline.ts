/** Easing: 0..1 -> 0..1 (cubic out) */
export function easeOutCubic(t: number): number {
  const x = clamp01(t);
  return 1 - (1 - x) ** 3;
}

export function easeInOutCubic(t: number): number {
  const x = clamp01(t);
  return x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2;
}

export function clamp01(t: number): number {
  return Math.min(1, Math.max(0, t));
}

/** Linear remap from [a,b] to [0,1] with clamp */
export function segment01(tMs: number, startMs: number, endMs: number): number {
  if (endMs <= startMs) return tMs >= endMs ? 1 : 0;
  return clamp01((tMs - startMs) / (endMs - startMs));
}
