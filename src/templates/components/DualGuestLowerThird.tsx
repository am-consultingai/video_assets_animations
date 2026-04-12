import { easeOutCubic, segment01 } from "../../engine/timeline";
import type { TemplateRenderProps } from "../../types";
import { fieldStr } from "../fields";

export function DualGuestLowerThird({
  fields,
  theme,
  timeMs,
  reducedMotion: _r,
  motionTimeScale: ms,
  layoutDirection,
}: TemplateRenderProps) {
  const n1 = fieldStr(fields, "name1", "Guest 1");
  const r1 = fieldStr(fields, "role1", "");
  const n2 = fieldStr(fields, "name2", "Guest 2");
  const r2 = fieldStr(fields, "role2", "");
  const isRtl = layoutDirection === "rtl";

  const p1 = easeOutCubic(segment01(timeMs, 0, 480 * ms));
  const p2 = easeOutCubic(segment01(timeMs, 160 * ms, 560 * ms));

  return (
    <div style={{ position: "absolute", inset: 0, direction: layoutDirection, fontFamily: theme.fontFamilies.body }}>
      <div
        style={{
          position: "absolute",
          bottom: "10%",
          ...(isRtl ? { right: "5%", left: "auto" } : { left: "5%", right: "auto" }),
          display: "flex",
          flexDirection: isRtl ? "row-reverse" : "row",
          gap: 20 * theme.fontScale,
          maxWidth: "92%",
        }}
      >
        <div data-fx-stagger>
          <div
            style={{
              padding: `${12 * theme.fontScale}px ${16 * theme.fontScale}px`,
              borderRadius: theme.radii.md,
              borderInlineStart: `4px solid ${theme.colors.accent}`,
              background: `color-mix(in srgb, ${theme.colors.surface} 88%, transparent)`,
              minWidth: 140,
              opacity: p1,
              transform: `translateX(${(isRtl ? 1 : -1) * (1 - p1) * 28}px)`,
            }}
          >
            <div style={{ fontWeight: 800, fontSize: 17 * theme.fontScale, color: theme.colors.onSurface }}>{n1}</div>
            {r1 ? <div style={{ marginTop: 4, fontSize: 12 * theme.fontScale, color: theme.colors.muted }}>{r1}</div> : null}
          </div>
        </div>
        <div data-fx-stagger>
          <div
            style={{
              padding: `${12 * theme.fontScale}px ${16 * theme.fontScale}px`,
              borderRadius: theme.radii.md,
              borderInlineStart: `4px solid ${theme.colors.secondary}`,
              background: `color-mix(in srgb, ${theme.colors.surface} 88%, transparent)`,
              minWidth: 140,
              opacity: p2,
              transform: `translateX(${(isRtl ? 1 : -1) * (1 - p2) * 28}px)`,
            }}
          >
            <div style={{ fontWeight: 800, fontSize: 17 * theme.fontScale, color: theme.colors.onSurface }}>{n2}</div>
            {r2 ? <div style={{ marginTop: 4, fontSize: 12 * theme.fontScale, color: theme.colors.muted }}>{r2}</div> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
