import { easeOutCubic, segment01 } from "../../engine/timeline";
import type { TemplateRenderProps } from "../../types";
import { fieldStr } from "../fields";

export function CommentPrompt({
  fields,
  theme,
  timeMs,
  reducedMotion: _reducedMotion,
  motionTimeScale,
  layoutDirection,
}: TemplateRenderProps) {
  const ms = motionTimeScale;
  const prompt = fieldStr(fields, "prompt", "What would you try first?");
  const cta = fieldStr(fields, "cta", "Tell us in the comments");

  const p = easeOutCubic(segment01(timeMs, 0, 550 * ms));

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
          borderRadius: theme.radii.lg,
          padding: `${22 * theme.fontScale}px ${26 * theme.fontScale}px`,
          background: `linear-gradient(120deg, ${theme.colors.accent}22, ${theme.colors.secondary}66)`,
          border: `1px solid color-mix(in srgb, ${theme.colors.accent} 50%, transparent)`,
          maxWidth: 720,
          width: "100%",
          textAlign: "center",
          fontFamily: theme.fontFamilies.accent,
        }}
      >
        <div data-fx-stagger>
          <div
            style={{
              fontSize: 22 * theme.fontScale,
              fontWeight: 800,
              color: theme.colors.onSurface,
              opacity: p,
              transform: `translateY(${(1 - p) * 20}px) scale(${0.96 + p * 0.04})`,
            }}
          >
            {prompt}
          </div>
        </div>
        <div data-fx-stagger>
          <div
            style={{
              marginTop: 10 * theme.fontScale,
              fontSize: 14 * theme.fontScale,
              color: theme.colors.accent,
              fontWeight: 700,
              opacity: p,
              transform: `translateY(${(1 - p) * 12}px)`,
            }}
          >
            {cta}
          </div>
        </div>
      </div>
    </div>
  );
}
