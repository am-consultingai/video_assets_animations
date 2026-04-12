import { useEffect, useRef } from "react";

/** Diagonal shine pass across the frame. */
export function LightSweepCanvas({
  width,
  height,
  opacity,
  timeMs,
  durationMs,
  playing,
}: {
  width: number;
  height: number;
  opacity: number;
  playing: boolean;
  timeMs: number;
  durationMs: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = width;
    canvas.height = height;
    ctx.clearRect(0, 0, width, height);
    if (!playing && timeMs === 0) return;

    const d = Math.max(1, durationMs);
    const cycle = (timeMs % Math.min(d, 4000)) / Math.min(d, 4000);
    const diag = Math.hypot(width, height);
    const band = diag * 0.22;
    const cx = width * 0.2 + cycle * (width * 1.4);
    const cy = height * 0.15 + cycle * (height * 0.7);

    const g = ctx.createLinearGradient(cx - band, cy - band, cx + band, cy + band);
    const a = Math.min(0.55, opacity / 100);
    g.addColorStop(0, "rgba(255,255,255,0)");
    g.addColorStop(0.45, `rgba(255,255,255,${a * 0.15})`);
    g.addColorStop(0.5, `rgba(255,255,255,${a * 0.5})`);
    g.addColorStop(0.55, `rgba(255,255,255,${a * 0.15})`);
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, width, height);
  }, [width, height, opacity, timeMs, durationMs, playing]);

  return (
    <canvas
      ref={ref}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 3,
        mixBlendMode: "screen",
      }}
      aria-hidden
    />
  );
}
