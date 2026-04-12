import { easeOutCubic, segment01 } from "../../engine/timeline";
import type { TemplateRenderProps } from "../../types";
import { fieldStr } from "../fields";

export function QuoteCard({
  fields,
  theme,
  timeMs,
  reducedMotion: _reducedMotion,
  motionTimeScale,
  layoutDirection,
}: TemplateRenderProps) {
  const ms = motionTimeScale;
  const quote = fieldStr(fields, "quote", "Design is not just what it looks like — design is how it works.");
  const attribution = fieldStr(fields, "attribution", "— Steve Jobs");

  const p = easeOutCubic(segment01(timeMs, 0, 600 * ms));
  const p2 = easeOutCubic(segment01(timeMs, 350 * ms, 900 * ms));

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "10%",
        direction: layoutDirection,
      }}
    >
      <div
        style={{
          maxWidth: 880,
          width: "100%",
          borderRadius: theme.radii.lg,
          padding: `${28 * theme.fontScale}px`,
          background: `linear-gradient(135deg, color-mix(in srgb, ${theme.colors.surface} 92%, transparent), color-mix(in srgb, ${theme.colors.primary} 88%, transparent))`,
          border: `1px solid color-mix(in srgb, ${theme.colors.accent} 40%, transparent)`,
          boxShadow: `0 24px 80px rgba(0,0,0,0.35)`,
          transform: `scale(${0.94 + p * 0.06})`,
          opacity: p,
        }}
      >
        <div data-fx-stagger>
          <div
            style={{
              fontFamily: theme.fontFamilies.accent,
              fontSize: `clamp(18px, 3.2vw, ${28 * theme.fontScale}px)`,
              lineHeight: 1.45,
              color: theme.colors.onSurface,
              fontStyle: "italic",
            }}
          >
            “{quote}”
          </div>
        </div>
        <div data-fx-stagger>
          <div
            style={{
              marginTop: 18 * theme.fontScale,
              fontFamily: theme.fontFamilies.body,
              fontSize: 15 * theme.fontScale,
              color: theme.colors.accent,
              fontWeight: 700,
              opacity: p2,
              transform: `translateY(${(1 - p2) * 10}px)`,
            }}
          >
            {attribution}
          </div>
        </div>
      </div>
    </div>
  );
}
