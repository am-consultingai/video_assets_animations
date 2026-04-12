import { easeOutCubic, segment01 } from "../../engine/timeline";
import type { TemplateRenderProps } from "../../types";
import { fieldNum, fieldStr } from "../fields";

function fmt(n: number): string {
  return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

export function GoalBarGeneric({
  fields,
  theme,
  timeMs,
  reducedMotion: _r,
  motionTimeScale: ms,
  layoutDirection,
}: TemplateRenderProps) {
  const goalLabel = fieldStr(fields, "goalLabel", "Goal");
  const current = Math.max(0, fieldNum(fields, "currentVal", 0));
  const target = Math.max(1, fieldNum(fields, "targetVal", 1));
  const frac = Math.min(1, current / target);

  const p = easeOutCubic(segment01(timeMs, 0, 480 * ms));
  const pBar = easeOutCubic(segment01(timeMs, 220 * ms, 720 * ms));

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        padding: "10% 8%",
        direction: layoutDirection,
        fontFamily: theme.fontFamilies.body,
      }}
    >
      <div data-fx-stagger>
        <div
          style={{
            fontSize: 13 * theme.fontScale,
            fontWeight: 800,
            color: theme.colors.onSurface,
            marginBottom: 8 * theme.fontScale,
            opacity: p,
            transform: `translateY(${(1 - p) * 10}px)`,
          }}
        >
          {goalLabel}
        </div>
      </div>
      <div data-fx-stagger>
        <div
          style={{
            fontSize: 22 * theme.fontScale,
            fontWeight: 900,
            fontVariantNumeric: "tabular-nums",
            color: theme.colors.accent,
            marginBottom: 12 * theme.fontScale,
            opacity: p,
            transform: `translateY(${(1 - p) * 12}px)`,
          }}
        >
          {fmt(current)}
          <span style={{ color: theme.colors.muted, fontWeight: 700, fontSize: 16 * theme.fontScale }}> / {fmt(target)}</span>
        </div>
      </div>
      <div data-fx-stagger>
        <div
          style={{
            height: 8,
            borderRadius: 99,
            background: theme.colors.secondary,
            overflow: "hidden",
            maxWidth: 560,
            width: "100%",
            opacity: pBar,
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${pBar * frac * 100}%`,
              borderRadius: 99,
              background: `linear-gradient(90deg, ${theme.colors.accent}, color-mix(in srgb, ${theme.colors.accent} 70%, ${theme.colors.primary}))`,
              transition: "none",
            }}
          />
        </div>
      </div>
    </div>
  );
}
