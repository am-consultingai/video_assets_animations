import { easeOutCubic, segment01 } from "../../engine/timeline";
import type { TemplateRenderProps } from "../../types";
import { fieldStr } from "../fields";

export function ProductPriceCallout({
  fields,
  theme,
  timeMs,
  reducedMotion: _r,
  motionTimeScale: ms,
  layoutDirection,
}: TemplateRenderProps) {
  const name = fieldStr(fields, "productName", "Product");
  const price = fieldStr(fields, "price", "$0");
  const badge = fieldStr(fields, "badge", "");
  const sub = fieldStr(fields, "subline", "");

  const p = easeOutCubic(segment01(timeMs, 0, 480 * ms));
  const p2 = easeOutCubic(segment01(timeMs, 180 * ms, 560 * ms));

  return (
    <div style={{ position: "absolute", inset: 0, direction: layoutDirection, fontFamily: theme.fontFamilies.body }}>
      <div
        style={{
          position: "absolute",
          bottom: "10%",
          insetInlineStart: "6%",
          maxWidth: "88%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: 10 * theme.fontScale,
        }}
      >
        <div data-fx-stagger>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10 * theme.fontScale,
              flexWrap: "wrap",
              padding: `${14 * theme.fontScale}px ${18 * theme.fontScale}px`,
              borderRadius: theme.radii.lg,
              background: `linear-gradient(135deg, color-mix(in srgb, ${theme.colors.surface} 94%, transparent), color-mix(in srgb, ${theme.colors.primary} 80%, transparent))`,
              border: `1px solid color-mix(in srgb, ${theme.colors.accent} 40%, transparent)`,
              opacity: p,
              transform: `translateY(${(1 - p) * 24}px)`,
            }}
          >
            {badge ? (
              <span
                style={{
                  fontSize: 10 * theme.fontScale,
                  fontWeight: 800,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  padding: "4px 10px",
                  borderRadius: 6,
                  background: theme.colors.accent,
                  color: theme.colors.primary,
                }}
              >
                {badge}
              </span>
            ) : null}
            <span style={{ fontSize: 20 * theme.fontScale, fontWeight: 800, color: theme.colors.onSurface }}>{name}</span>
          </div>
        </div>
        <div data-fx-stagger>
          <div
            style={{
              paddingInlineStart: 4,
              fontSize: 28 * theme.fontScale,
              fontWeight: 900,
              color: theme.colors.accent,
              opacity: p2,
              transform: `translateX(${(layoutDirection === "rtl" ? 1 : -1) * (1 - p2) * 12}px)`,
            }}
          >
            {price}
          </div>
        </div>
        {sub ? <div style={{ fontSize: 12 * theme.fontScale, color: theme.colors.muted, paddingInlineStart: 4 }}>{sub}</div> : null}
      </div>
    </div>
  );
}
