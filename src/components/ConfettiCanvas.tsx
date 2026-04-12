import { useEffect, useRef } from "react";

interface Bit {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vr: number;
  w: number;
  h: number;
  hue: number;
  life: number;
}

export function ConfettiCanvas({
  width,
  height,
  intensity,
  playing,
}: {
  width: number;
  height: number;
  intensity: number;
  playing: boolean;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const partsRef = useRef<Bit[]>([]);
  const rafRef = useRef(0);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !playing) {
      partsRef.current = [];
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const loop = () => {
      rafRef.current = requestAnimationFrame(loop);
      canvas.width = width;
      canvas.height = height;
      ctx.clearRect(0, 0, width, height);

      const n = Math.max(1, Math.round(intensity * 0.6));
      const parts = partsRef.current;
      if (parts.length > 500) parts.splice(0, parts.length - 500);

      for (let i = 0; i < n; i++) {
        parts.push({
          x: Math.random() * width,
          y: -8 - Math.random() * 40,
          vx: (Math.random() - 0.5) * 2.2,
          vy: 1.5 + Math.random() * 3.5,
          rot: Math.random() * Math.PI * 2,
          vr: (Math.random() - 0.5) * 0.25,
          w: 4 + Math.random() * 6,
          h: 3 + Math.random() * 5,
          hue: Math.random() * 360,
          life: 1,
        });
      }

      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.06;
        p.rot += p.vr;
        p.life -= 0.004;
        if (p.y > height + 20 || p.life <= 0) {
          parts.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = `hsla(${p.hue},85%,58%,${p.life * 0.9})`;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(rafRef.current);
      partsRef.current = [];
    };
  }, [width, height, intensity, playing]);

  return (
    <canvas
      ref={ref}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 4,
      }}
      aria-hidden
    />
  );
}
