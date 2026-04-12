import { easeOutCubic, segment01 } from "../../engine/timeline";
import type { TemplateRenderProps } from "../../types";
import { fieldStr } from "../fields";

export function BreakingLiveStrip({
  fields,
  theme,
  timeMs,
  reducedMotion: _r,
  motionTimeScale: ms,
  layoutDirection,
}: TemplateRenderProps) {
  const mode = fieldStr(fields, "stripMode", "live");
  const line1 = fieldStr(fields, "line1", "Headline");
  const line2 = fieldStr(fields, "line2", "");
  const pill = mode === "breaking" ? "BREAKING" : "LIVE";
  const pillBg = mode === "breaking" ? "#ca8a04" : "#dc2626";

  const p = easeOutCubic(segment01(timeMs, 0, 400 * ms));
  const p2 = easeOutCubic(segment01(timeMs, 160 * ms, 520 * ms));

  return (
    <div style={{ position: "absolute", inset: 0, direction: layoutDirection, fontFamily: theme.fontFamilies.body }}>
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: `${12 * theme.fontScale}px 5%`,
          background: `linear-gradient(0deg, color-mix(in srgb, ${theme.colors.primary} 92%, transparent), transparent)`,
        }}
      >
        <div data-fx-stagger>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12 * theme.fontScale,
              flexWrap: "wrap",
              opacity: p,
              transform: `translateY(${(1 - p) * 20}px)`,
            }}
          >
            <span
              style={{
                padding: "6px 14px",
                borderRadius: 4,
                background: pillBg,
                color: "#fff",
                fontWeight: 900,
                fontSize: 12 * theme.fontScale,
                letterSpacing: "0.12em",
              }}
            >
              {pill}
            </span>
            <div style={{ flex: 1, minWidth: 200, fontSize: 18 * theme.fontScale, fontWeight: 800, color: theme.colors.onSurface }}>{line1}</div>
          </div>
        </div>
        {line2 ? (
          <div data-fx-stagger>
            <div
              style={{
                marginTop: 8 * theme.fontScale,
                fontSize: 13 * theme.fontScale,
                color: theme.colors.muted,
                opacity: p2,
              }}
            >
              {line2}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
