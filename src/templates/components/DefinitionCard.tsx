import { easeOutCubic, segment01 } from "../../engine/timeline";
import type { TemplateRenderProps } from "../../types";
import { fieldStr } from "../fields";

export function DefinitionCard({
  fields,
  theme,
  timeMs,
  reducedMotion: _reducedMotion,
  motionTimeScale,
  layoutDirection,
}: TemplateRenderProps) {
  const ms = motionTimeScale;
  const term = fieldStr(fields, "term", "Bitrate");
  const definition = fieldStr(fields, "definition", "How much data is processed per second of video — higher usually means better quality.");

  const p1 = easeOutCubic(segment01(timeMs, 0, 500 * ms));
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
          width: "100%",
          maxWidth: 800,
          borderRadius: theme.radii.lg,
          overflow: "hidden",
          border: `1px solid ${theme.colors.secondary}`,
          background: theme.colors.surface,
        }}
      >
        <div data-fx-stagger>
          <div
            style={{
              padding: `${10 * theme.fontScale}px ${18 * theme.fontScale}px`,
              background: `linear-gradient(90deg, ${theme.colors.accent}, ${theme.colors.secondary})`,
              fontFamily: theme.fontFamilies.accent,
              fontSize: 12 * theme.fontScale,
              fontWeight: 800,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: theme.colors.primary,
            }}
          >
            Did you know?
          </div>
        </div>
        <div style={{ padding: `${22 * theme.fontScale}px` }}>
          <div data-fx-stagger>
            <div
              style={{
                fontFamily: theme.fontFamilies.display,
                fontSize: `clamp(22px, 4vw, ${36 * theme.fontScale}px)`,
                color: theme.colors.accent,
                fontWeight: 800,
                letterSpacing: "0.04em",
                opacity: p1,
                transform: `translateY(${(1 - p1) * 12}px)`,
              }}
            >
              {term}
            </div>
          </div>
          <div data-fx-stagger>
            <div
              style={{
                marginTop: 12 * theme.fontScale,
                fontFamily: theme.fontFamilies.body,
                fontSize: 16 * theme.fontScale,
                lineHeight: 1.55,
                color: theme.colors.onSurface,
                opacity: p2,
              }}
            >
              {definition}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
