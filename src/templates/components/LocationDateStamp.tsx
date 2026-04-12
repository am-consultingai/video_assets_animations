import { easeOutCubic, segment01 } from "../../engine/timeline";
import type { TemplateRenderProps } from "../../types";
import { fieldStr } from "../fields";

export function LocationDateStamp({
  fields,
  theme,
  timeMs,
  reducedMotion: _r,
  motionTimeScale: ms,
  layoutDirection,
}: TemplateRenderProps) {
  const loc = fieldStr(fields, "location", "");
  const date = fieldStr(fields, "dateLine", "");
  const tim = fieldStr(fields, "timeLine", "");

  const p0 = easeOutCubic(segment01(timeMs, 0, 420 * ms));
  const p1 = easeOutCubic(segment01(timeMs, 100 * ms, 480 * ms));
  const p2 = easeOutCubic(segment01(timeMs, 220 * ms, 540 * ms));
  const isRtl = layoutDirection === "rtl";

  return (
    <div style={{ position: "absolute", inset: 0, direction: layoutDirection, fontFamily: theme.fontFamilies.body }}>
      <div
        style={{
          position: "absolute",
          top: "10%",
          ...(isRtl ? { right: "6%", left: "auto", textAlign: "right" as const } : { left: "6%", textAlign: "left" as const }),
        }}
      >
        <div data-fx-stagger>
          <div
            style={{
              fontSize: 13 * theme.fontScale,
              fontWeight: 800,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: theme.colors.accent,
              opacity: p0,
              transform: `translateY(${(1 - p0) * 10}px)`,
            }}
          >
            {loc}
          </div>
        </div>
        {date ? (
          <div data-fx-stagger>
            <div
              style={{
                marginTop: 6 * theme.fontScale,
                fontSize: 22 * theme.fontScale,
                fontWeight: 700,
                color: theme.colors.onSurface,
                opacity: p1,
              }}
            >
              {date}
            </div>
          </div>
        ) : null}
        {tim ? (
          <div data-fx-stagger>
            <div
              style={{
                marginTop: 4 * theme.fontScale,
                fontSize: 13 * theme.fontScale,
                color: theme.colors.muted,
                opacity: p2,
              }}
            >
              {tim}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
