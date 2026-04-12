import { easeOutCubic, segment01 } from "../../engine/timeline";
import type { TemplateRenderProps } from "../../types";
import { fieldStr } from "../fields";

export function EndCardSimple({
  fields,
  theme,
  timeMs,
  reducedMotion: _r,
  motionTimeScale: ms,
  layoutDirection,
}: TemplateRenderProps) {
  const thanks = fieldStr(fields, "thanksLine", "Thanks");
  const tag = fieldStr(fields, "tagline", "");
  const l2 = fieldStr(fields, "line2", "");
  const l3 = fieldStr(fields, "line3", "");

  const p0 = easeOutCubic(segment01(timeMs, 0, 480 * ms));
  const p1 = easeOutCubic(segment01(timeMs, 140 * ms, 540 * ms));
  const p2 = easeOutCubic(segment01(timeMs, 280 * ms, 620 * ms));
  const p3 = easeOutCubic(segment01(timeMs, 400 * ms, 720 * ms));

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
        direction: layoutDirection,
        fontFamily: theme.fontFamilies.display,
        padding: "10%",
      }}
    >
      <div data-fx-stagger>
        <div
          style={{
            fontSize: `clamp(24px, 5vw, ${42 * theme.fontScale}px)`,
            fontWeight: 900,
            color: theme.colors.onSurface,
            opacity: p0,
            transform: `translateY(${(1 - p0) * 20}px)`,
          }}
        >
          {thanks}
        </div>
      </div>
      {tag ? (
        <div data-fx-stagger>
          <div
            style={{
              marginTop: 12 * theme.fontScale,
              fontFamily: theme.fontFamilies.accent,
              fontSize: 15 * theme.fontScale,
              color: theme.colors.accent,
              fontWeight: 700,
              opacity: p1,
            }}
          >
            {tag}
          </div>
        </div>
      ) : null}
      {l2 ? (
        <div data-fx-stagger>
          <div
            style={{
              marginTop: 18 * theme.fontScale,
              fontFamily: theme.fontFamilies.body,
              fontSize: 14 * theme.fontScale,
              color: theme.colors.muted,
              opacity: p2,
            }}
          >
            {l2}
          </div>
        </div>
      ) : null}
      {l3 ? (
        <div data-fx-stagger>
          <div
            style={{
              marginTop: 6 * theme.fontScale,
              fontFamily: theme.fontFamilies.body,
              fontSize: 13 * theme.fontScale,
              color: theme.colors.muted,
              opacity: p3,
            }}
          >
            {l3}
          </div>
        </div>
      ) : null}
    </div>
  );
}
