import { easeOutCubic, segment01 } from "../../engine/timeline";
import type { TemplateRenderProps } from "../../types";
import { fieldStr } from "../fields";

export function PollVs({
  fields,
  theme,
  timeMs,
  reducedMotion: _r,
  motionTimeScale: ms,
  layoutDirection,
}: TemplateRenderProps) {
  const a = fieldStr(fields, "optionA", "A");
  const b = fieldStr(fields, "optionB", "B");
  const la = fieldStr(fields, "labelA", "");
  const lb = fieldStr(fields, "labelB", "");

  const p = easeOutCubic(segment01(timeMs, 0, 500 * ms));
  const pA = easeOutCubic(segment01(timeMs, 80 * ms, 520 * ms));
  const pB = easeOutCubic(segment01(timeMs, 200 * ms, 620 * ms));

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        direction: layoutDirection,
        fontFamily: theme.fontFamilies.accent,
        padding: "10%",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "stretch",
          gap: 0,
          borderRadius: theme.radii.lg,
          overflow: "hidden",
          border: `1px solid ${theme.colors.secondary}`,
          opacity: p,
          transform: `scale(${0.94 + p * 0.06})`,
          maxWidth: 640,
          width: "100%",
        }}
      >
        <div
          data-fx-stagger
          style={{
            flex: 1,
            padding: `${18 * theme.fontScale}px`,
            background: `color-mix(in srgb, ${theme.colors.accent} 22%, ${theme.colors.surface})`,
            opacity: pA,
            transform: `translateX(${(layoutDirection === "rtl" ? 1 : -1) * (1 - pA) * 16}px)`,
          }}
        >
          {la ? (
            <div style={{ fontSize: 22 * theme.fontScale, fontWeight: 900, color: theme.colors.accent }}>{la}</div>
          ) : null}
          <div style={{ marginTop: 6, fontSize: 15 * theme.fontScale, fontWeight: 700, color: theme.colors.onSurface }}>{a}</div>
        </div>
        <div
          style={{
            width: 2,
            background: theme.colors.secondary,
            alignSelf: "stretch",
            opacity: p,
          }}
        />
        <div
          data-fx-stagger
          style={{
            flex: 1,
            padding: `${18 * theme.fontScale}px`,
            background: `color-mix(in srgb, ${theme.colors.primary} 55%, transparent)`,
            opacity: pB,
            transform: `translateX(${(layoutDirection === "rtl" ? -1 : 1) * (1 - pB) * 16}px)`,
          }}
        >
          {lb ? (
            <div style={{ fontSize: 22 * theme.fontScale, fontWeight: 900, color: theme.colors.muted }}>{lb}</div>
          ) : null}
          <div style={{ marginTop: 6, fontSize: 15 * theme.fontScale, fontWeight: 700, color: theme.colors.onSurface }}>{b}</div>
        </div>
      </div>
    </div>
  );
}
