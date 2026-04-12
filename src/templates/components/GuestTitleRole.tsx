import { easeOutCubic, segment01 } from "../../engine/timeline";
import type { TemplateRenderProps } from "../../types";
import { fieldStr } from "../fields";

export function GuestTitleRole({
  fields,
  theme,
  timeMs,
  reducedMotion: _reducedMotion,
  motionTimeScale,
  layoutDirection,
}: TemplateRenderProps) {
  const ms = motionTimeScale;
  const guest = fieldStr(fields, "guestName", "Jamie Chen");
  const role = fieldStr(fields, "role", "Product Designer · Acme");

  const p1 = easeOutCubic(segment01(timeMs, 0, 500 * ms));
  const p2 = easeOutCubic(segment01(timeMs, 280 * ms, 720 * ms));
  const isRtl = layoutDirection === "rtl";
  const anchor = isRtl ? { right: "7%", left: "auto" } : { left: "7%", right: "auto" };

  return (
    <div style={{ position: "absolute", inset: 0, direction: layoutDirection }}>
      <div
        style={{
          position: "absolute",
          bottom: "11%",
          ...anchor,
          padding: `${12 * theme.fontScale}px ${18 * theme.fontScale}px`,
          borderRadius: theme.radii.md,
          background: `color-mix(in srgb, ${theme.colors.surface} 90%, transparent)`,
          borderInlineStart: `4px solid ${theme.colors.accent}`,
          fontFamily: theme.fontFamilies.body,
          minWidth: 200,
          maxWidth: "72%",
        }}
      >
        <div data-fx-stagger>
          <div
            style={{
              fontSize: 20 * theme.fontScale,
              fontWeight: 800,
              color: theme.colors.onSurface,
              opacity: p1,
              transform: `translateY(${(1 - p1) * 14}px)`,
            }}
          >
            {guest}
          </div>
        </div>
        <div data-fx-stagger>
          <div
            style={{
              marginTop: 4 * theme.fontScale,
              fontSize: 13 * theme.fontScale,
              color: theme.colors.muted,
              opacity: p2,
            }}
          >
            {role}
          </div>
        </div>
      </div>
    </div>
  );
}
