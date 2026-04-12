import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  decay: number;
  size: number;
  hue: number;
}

function hexToHue(hex: string): number {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return 18;
  const n = parseInt(m[1], 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max === min) return 18;
  let h = 0;
  if (max === r) h = ((g - b) / (max - min)) % 6;
  else if (max === g) h = (b - r) / (max - min) + 2;
  else h = (r - g) / (max - min) + 4;
  h *= 60;
  if (h < 0) h += 360;
  return h;
}

function fireColor(life: number, hue: number): string {
  if (life > 0.75) return `rgba(255,248,200,${life.toFixed(3)})`;
  if (life > 0.5) return `hsla(${hue},100%,58%,${life.toFixed(3)})`;
  if (life > 0.25) return `hsla(${hue - 5},100%,36%,${(life * 0.88).toFixed(3)})`;
  return `rgba(50,4,0,${(life * 0.45).toFixed(3)})`;
}

export function FireCanvas({
  width,
  height,
  intensity,
  heightFactor,
  accentColor,
  playing,
}: {
  width: number;
  height: number;
  intensity: number;
  heightFactor: number;
  accentColor: string;
  playing: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !playing) {
      particlesRef.current = [];
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const baseHue = hexToHue(accentColor);

    const loop = () => {
      rafRef.current = requestAnimationFrame(loop);
      canvas.width = width;
      canvas.height = height;
      ctx.clearRect(0, 0, width, height);

      const count = Math.max(2, Math.round(intensity * 1.8));
      const maxSpeed = 1.2 + (heightFactor / 10) * 3.2;
      const bandH = Math.min(height * 0.22, 180);
      const parts = particlesRef.current;
      if (parts.length > 700) parts.splice(0, parts.length - 700);

      for (let i = 0; i < count; i++) {
        const x = Math.random() * width;
        const y = height - Math.random() * bandH;
        parts.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 0.75,
          vy: -(0.75 + Math.random() * maxSpeed),
          life: 1,
          decay: 0.012 + Math.random() * 0.016,
          size: 5 + Math.random() * (6 + (heightFactor / 10) * 16),
          hue: baseHue + (Math.random() - 0.5) * 22,
        });
      }

      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.x += p.vx + Math.sin(p.life * 9 + i * 0.3) * 0.42;
        p.y += p.vy;
        p.vy *= 0.982;
        p.size *= 0.968;
        p.life -= p.decay;
        if (p.life <= 0 || p.size < 0.45) {
          parts.splice(i, 1);
          continue;
        }
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
        g.addColorStop(0, fireColor(p.life, p.hue));
        g.addColorStop(0.42, fireColor(p.life * 0.52, p.hue));
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
      }
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(rafRef.current);
      particlesRef.current = [];
    };
  }, [width, height, intensity, heightFactor, accentColor, playing]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 4,
        mixBlendMode: "screen",
      }}
      aria-hidden
    />
  );
}
