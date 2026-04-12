import { easeOutCubic, segment01 } from "../../engine/timeline";
import type { TemplateRenderProps } from "../../types";
import { fieldStr } from "../fields";

export function SponsorDisclosure({
  fields,
  theme,
  timeMs,
  reducedMotion: _r,
  motionTimeScale: ms,
  layoutDirection,
}: TemplateRenderProps) {
  const brand = fieldStr(fields, "brandLine", "Presented by");
  const disc = fieldStr(fields, "disclosureLine", "");

  const p = easeOutCubic(segment01(timeMs, 0, 520 * ms));
  const p2 = easeOutCubic(segment01(timeMs, 220 * ms, 640 * ms));

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        paddingBottom: "12%",
        paddingInline: "8%",
        direction: layoutDirection,
        fontFamily: theme.fontFamilies.body,
      }}
    >
      <div
        style={{
          maxWidth: 720,
          width: "100%",
          padding: `${16 * theme.fontScale}px ${20 * theme.fontScale}px`,
          borderRadius: theme.radii.md,
          background: `color-mix(in srgb, ${theme.colors.surface} 92%, transparent)`,
          border: `1px solid ${theme.colors.secondary}`,
          textAlign: "center",
        }}
      >
        <div data-fx-stagger>
          <div
            style={{
              fontSize: 16 * theme.fontScale,
              fontWeight: 700,
              color: theme.colors.onSurface,
              opacity: p,
              transform: `translateY(${(1 - p) * 16}px)`,
            }}
          >
            {brand}
          </div>
        </div>
        {disc ? (
          <div data-fx-stagger>
            <div
              style={{
                marginTop: 8 * theme.fontScale,
                fontSize: 11 * theme.fontScale,
                color: theme.colors.muted,
                lineHeight: 1.45,
                opacity: p2,
              }}
            >
              {disc}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
