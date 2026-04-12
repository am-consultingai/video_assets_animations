import type { CSSProperties } from "react";
import { easeOutCubic, segment01 } from "../../engine/timeline";
import type { TemplateRenderProps } from "../../types";
import { fieldStr } from "../fields";

export function SocialHandleStrip({
  fields,
  theme,
  timeMs,
  reducedMotion: _reducedMotion,
  motionTimeScale,
  layoutDirection,
}: TemplateRenderProps) {
  const ms = motionTimeScale;
  const platform = fieldStr(fields, "platform", "Social");
  const handle = fieldStr(fields, "handle", "@yourchannel");
  const p = easeOutCubic(segment01(timeMs, 0, 480 * ms));
  const isRtl = layoutDirection === "rtl";
  const justify: CSSProperties["justifyContent"] = isRtl ? "flex-end" : "flex-start";
  const marginSide = isRtl ? { marginInlineEnd: "8%" } : { marginInlineStart: "8%" };

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: justify,
        paddingBottom: "10%",
        ...marginSide,
        direction: layoutDirection,
      }}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 10 * theme.fontScale,
          padding: `${10 * theme.fontScale}px ${18 * theme.fontScale}px`,
          borderRadius: theme.radii.lg,
          background: `color-mix(in srgb, ${theme.colors.surface} 88%, transparent)`,
          border: `1px solid color-mix(in srgb, ${theme.colors.accent} 55%, transparent)`,
          boxShadow: `0 8px 32px color-mix(in srgb, ${theme.colors.primary} 65%, transparent)`,
          fontFamily: theme.fontFamilies.accent,
        }}
      >
        <div data-fx-stagger>
          <span
            style={{
              fontSize: 12 * theme.fontScale,
              fontWeight: 700,
              color: theme.colors.accent,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              opacity: p,
              transform: `translateY(${(1 - p) * 16}px)`,
            }}
          >
            {platform}
          </span>
        </div>
        <div data-fx-stagger>
          <span
            style={{
              fontSize: 17 * theme.fontScale,
              fontWeight: theme.typography.accent.weight,
              color: theme.colors.onSurface,
              opacity: p,
              transform: `translateY(${(1 - p) * 20}px) scale(${0.96 + p * 0.04})`,
            }}
          >
            {handle}
          </span>
        </div>
      </div>
    </div>
  );
}
