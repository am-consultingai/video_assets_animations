import { easeOutCubic, segment01 } from "../../engine/timeline";
import type { TemplateRenderProps } from "../../types";
import { fieldStr } from "../fields";

export function CalendarEventCard({
  fields,
  theme,
  timeMs,
  reducedMotion: _r,
  motionTimeScale: ms,
  layoutDirection,
}: TemplateRenderProps) {
  const dateBlock = fieldStr(fields, "dateBlock", "APR 12");
  const eventTitle = fieldStr(fields, "eventTitle", "Event");
  const timeLine = fieldStr(fields, "timeLine", "");

  const p0 = easeOutCubic(segment01(timeMs, 0, 420 * ms));
  const p1 = easeOutCubic(segment01(timeMs, 140 * ms, 540 * ms));
  const p2 = easeOutCubic(segment01(timeMs, 280 * ms, 620 * ms));

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
        fontFamily: theme.fontFamilies.body,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "stretch",
          gap: 0,
          maxWidth: 640,
          width: "100%",
          borderRadius: theme.radii.lg,
          overflow: "hidden",
          border: `1px solid ${theme.colors.secondary}`,
          background: `color-mix(in srgb, ${theme.colors.surface} 94%, transparent)`,
          boxShadow: `0 18px 48px color-mix(in srgb, ${theme.colors.primary} 35%, transparent)`,
        }}
      >
        <div data-fx-stagger>
          <div
            style={{
              minWidth: 96,
              padding: `${20 * theme.fontScale}px ${16 * theme.fontScale}px`,
              background: `linear-gradient(160deg, ${theme.colors.accent}, color-mix(in srgb, ${theme.colors.accent} 55%, ${theme.colors.primary}))`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              opacity: p0,
              transform: `scale(${0.92 + p0 * 0.08})`,
            }}
          >
            <div
              style={{
                fontSize: 13 * theme.fontScale,
                fontWeight: 900,
                letterSpacing: "0.08em",
                lineHeight: 1.25,
                color: "#f8fafc",
                textShadow: "0 1px 2px color-mix(in srgb, #000 45%, transparent)",
                whiteSpace: "pre-line",
              }}
            >
              {dateBlock}
            </div>
          </div>
        </div>
        <div style={{ flex: 1, padding: `${20 * theme.fontScale}px ${22 * theme.fontScale}px` }}>
          <div data-fx-stagger>
            <div
              style={{
                fontSize: `clamp(18px, 4.2vw, ${26 * theme.fontScale}px)`,
                fontWeight: 800,
                color: theme.colors.onSurface,
                lineHeight: 1.25,
                opacity: p1,
                transform: `translateY(${(1 - p1) * 14}px)`,
              }}
            >
              {eventTitle}
            </div>
          </div>
          {timeLine ? (
            <div data-fx-stagger>
              <div
                style={{
                  marginTop: 10 * theme.fontScale,
                  fontSize: 14 * theme.fontScale,
                  color: theme.colors.muted,
                  opacity: p2,
                }}
              >
                {timeLine}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
