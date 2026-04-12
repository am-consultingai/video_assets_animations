/** Full-frame edge darkening (exports with preview). */
export function VignetteOverlay({ strength }: { strength: number }) {
  const a = Math.min(0.92, strength / 100);
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 1,
        background: `radial-gradient(ellipse 85% 75% at 50% 45%, transparent 25%, rgba(0,0,0,${a}) 100%)`,
      }}
      aria-hidden
    />
  );
}
