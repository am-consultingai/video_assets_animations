import { easeOutCubic, segment01 } from "../../engine/timeline";
import type { TemplateRenderProps } from "../../types";
import { fieldStr } from "../fields";

export function FullHeadline({
  fields,
  theme,
  timeMs,
  reducedMotion: _reducedMotion,
  motionTimeScale,
  layoutDirection,
}: TemplateRenderProps) {
  const ms = motionTimeScale;
  const line1 = fieldStr(fields, "line1", "FULL SCREEN");
  const line2 = fieldStr(fields, "line2", "HEADLINE");
  const sub = fieldStr(fields, "subhead", "Supporting line for context");

  const p1 = easeOutCubic(segment01(timeMs, 0, 420 * ms));
  const p2 = easeOutCubic(segment01(timeMs, 220 * ms, 640 * ms));
  const p3 = easeOutCubic(segment01(timeMs, 480 * ms, 900 * ms));

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        gap: 10 * theme.fontScale,
        direction: layoutDirection,
        fontFamily: theme.fontFamilies.display,
        padding: "8%",
      }}
    >
      <div data-fx-stagger>
        <div
          style={{
            fontSize: `clamp(32px, 7vw, ${88 * theme.fontScale}px)`,
            fontWeight: 900,
            letterSpacing: "0.06em",
            color: theme.colors.onSurface,
            opacity: p1,
            transform: `translateY(${(1 - p1) * 30}px) scale(${0.9 + p1 * 0.1})`,
          }}
        >
          {line1}
        </div>
      </div>
      <div data-fx-stagger>
        <div
          style={{
            fontSize: `clamp(28px, 6vw, ${72 * theme.fontScale}px)`,
            fontWeight: 800,
            letterSpacing: "0.1em",
            color: theme.colors.accent,
            opacity: p2,
            transform: `translateY(${(1 - p2) * 24}px)`,
          }}
        >
          {line2}
        </div>
      </div>
      <div data-fx-stagger>
        <div
          style={{
            fontFamily: theme.fontFamilies.body,
            fontSize: `clamp(14px, 2.2vw, ${20 * theme.fontScale}px)`,
            color: theme.colors.muted,
            maxWidth: 720,
            opacity: p3,
          }}
        >
          {sub}
        </div>
      </div>
    </div>
  );
}
