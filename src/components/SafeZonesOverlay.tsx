/** Advisory safe zones for vertical video (platform UIs vary). */
export function SafeZonesOverlay({ width, height }: { width: number; height: number }) {
  const topH = height * 0.12;
  const bottomH = height * 0.18;
  const sideW = width * 0.06;
  return (
    <svg
      data-export-ignore="1"
      width={width}
      height={height}
      style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 50 }}
    >
      <rect x={0} y={0} width={width} height={topH} fill="rgba(255,80,80,0.12)" />
      <rect x={0} y={height - bottomH} width={width} height={bottomH} fill="rgba(255,80,80,0.12)" />
      <rect x={0} y={0} width={sideW} height={height} fill="rgba(255,200,80,0.08)" />
      <rect x={width - sideW} y={0} width={sideW} height={height} fill="rgba(255,200,80,0.08)" />
      <text
        x={8}
        y={18}
        fill="rgba(255,255,255,0.55)"
        style={{ fontSize: 11, fontFamily: "system-ui,sans-serif" }}
      >
        Safe zones (advisory)
      </text>
    </svg>
  );
}
