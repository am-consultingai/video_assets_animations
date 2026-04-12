import { useEffect, useRef } from "react";

/** Low-res film grain, scaled up (cheap + export-friendly). */
export function GrainCanvas({
  width,
  height,
  opacity,
  playing,
  timeMs,
}: {
  width: number;
  height: number;
  opacity: number;
  playing: boolean;
  timeMs: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cw = Math.max(32, Math.ceil(width / 3));
    const ch = Math.max(24, Math.ceil(height / 3));

    const draw = () => {
      canvas.width = cw;
      canvas.height = ch;
      const img = ctx.createImageData(cw, ch);
      const d = img.data;
      let seed = (timeMs * 0.001) % 1000;
      for (let i = 0; i < d.length; i += 4) {
        seed = (seed * 1103515245 + 12345) & 0x7fffffff;
        const n = seed % 256;
        d[i] = n;
        d[i + 1] = n;
        d[i + 2] = n;
        d[i + 3] = 255;
      }
      ctx.putImageData(img, 0, 0);
    };

    if (playing) {
      const loop = () => {
        rafRef.current = requestAnimationFrame(loop);
        draw();
      };
      rafRef.current = requestAnimationFrame(loop);
      return () => cancelAnimationFrame(rafRef.current);
    }
    draw();
    return undefined;
  }, [width, height, playing, timeMs]);

  const a = Math.min(0.5, opacity / 100);
  return (
    <canvas
      ref={ref}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 2,
        opacity: a,
        mixBlendMode: "overlay",
        imageRendering: "pixelated",
      }}
      aria-hidden
    />
  );
}
