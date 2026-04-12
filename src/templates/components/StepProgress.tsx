import { easeOutCubic, segment01 } from "../../engine/timeline";
import type { TemplateRenderProps } from "../../types";
import { fieldNum, fieldStr } from "../fields";

export function StepProgress({
  fields,
  theme,
  timeMs,
  reducedMotion: _r,
  motionTimeScale: ms,
  layoutDirection,
}: TemplateRenderProps) {
  const label = fieldStr(fields, "stepLabel", "Step");
  const cur = fieldNum(fields, "stepIndex", 1);
  const tot = Math.max(2, fieldNum(fields, "stepTotal", 5));
  const idx = Math.min(Math.max(1, cur), tot);
  const frac = idx / tot;

  const p = easeOutCubic(segment01(timeMs, 0, 500 * ms));
  const pBar = easeOutCubic(segment01(timeMs, 200 * ms, 700 * ms));

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
            fontSize: 11 * theme.fontScale,
            fontWeight: 800,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: theme.colors.muted,
            marginBottom: 8 * theme.fontScale,
            opacity: p,
          }}
        >
          Step {idx} of {tot}
        </div>
      </div>
      <div data-fx-stagger>
        <div
          style={{
            fontSize: 20 * theme.fontScale,
            fontWeight: 800,
            color: theme.colors.onSurface,
            marginBottom: 12 * theme.fontScale,
            opacity: p,
            transform: `translateY(${(1 - p) * 12}px)`,
          }}
        >
          {label}
        </div>
      </div>
      <div data-fx-stagger>
        <div
          style={{
            height: 6,
            borderRadius: 99,
            background: theme.colors.secondary,
            overflow: "hidden",
            maxWidth: 520,
            width: "100%",
            opacity: pBar,
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${pBar * frac * 100}%`,
              borderRadius: 99,
              background: theme.colors.accent,
              transition: "none",
            }}
          />
        </div>
      </div>
    </div>
  );
}
