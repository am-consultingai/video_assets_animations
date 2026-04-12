import type { CSSProperties } from "react";
import { easeOutCubic, segment01 } from "../../engine/timeline";
import type { TemplateRenderProps } from "../../types";
import { fieldStr } from "../fields";

export function MinimalLowerThird({
  fields,
  theme,
  timeMs,
  durationMs: _durationMs,
  reducedMotion: _reducedMotion,
  motionTimeScale,
  layoutDirection,
}: TemplateRenderProps) {
  const ms = motionTimeScale;
  const name = fieldStr(fields, "name", "Alex Rivera");
  const title = fieldStr(fields, "title", "Creative Director");
  const accent = fieldStr(fields, "accentColor", theme.colors.accent);
  const barW = fieldStr(fields, "barWidth", "72");

  const tIn = 0;
  const tInEnd = 520 * ms;
  const pBar = easeOutCubic(segment01(timeMs, tIn, tInEnd));
  const pText = easeOutCubic(segment01(timeMs, tIn + 80 * ms, tInEnd + 200 * ms));

  const isRtl = layoutDirection === "rtl";
  const anchor = isRtl ? { right: "6%", left: "auto" } : { left: "6%", right: "auto" };
  const textAlign: CSSProperties["textAlign"] = isRtl ? "right" : "left";

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "transparent",
        fontFamily: theme.fontFamilies.body,
        direction: layoutDirection,
      }}
    >
      <div
        style={{
          position: "absolute",
          bottom: "8%",
          ...anchor,
          display: "flex",
          flexDirection: isRtl ? "row-reverse" : "row",
          alignItems: "stretch",
          gap: 12 * theme.fontScale,
        }}
      >
        <div data-fx-stagger style={{ alignSelf: "stretch", display: "flex" }}>
          <div
            style={{
              width: `${Math.max(4, Math.min(120, Number(barW) || 72))}px`,
              borderRadius: theme.radii.sm,
              background: accent,
              transform: `scaleY(${0.2 + pBar * 0.8})`,
              transformOrigin: "center",
              opacity: 0.85 + 0.15 * pBar,
            }}
          />
        </div>
        <div data-fx-stagger style={{ textAlign, minWidth: 0 }}>
          <div
            style={{
              fontSize: 22 * theme.fontScale,
              fontWeight: theme.typography.body.weight,
              color: theme.colors.onSurface,
              letterSpacing: "0.02em",
              lineHeight: 1.15,
              opacity: pText,
              transform: `translateY(${(1 - pText) * 18}px)`,
            }}
          >
            {name}
          </div>
          <div
            style={{
              marginTop: 4 * theme.fontScale,
              fontSize: 14 * theme.fontScale,
              fontWeight: 500,
              color: theme.colors.muted,
              opacity: pText,
              transform: `translateY(${(1 - pText) * 10}px)`,
            }}
          >
            {title}
          </div>
        </div>
      </div>
    </div>
  );
}
