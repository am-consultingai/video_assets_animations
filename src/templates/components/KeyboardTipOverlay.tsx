import type { CSSProperties } from "react";
import { easeOutCubic, segment01 } from "../../engine/timeline";
import type { TemplateRenderProps } from "../../types";
import { fieldStr } from "../fields";

const kbdStyle = (theme: TemplateRenderProps["theme"]): CSSProperties => ({
  display: "inline-block",
  padding: "6px 12px",
  borderRadius: 6,
  fontSize: 14 * theme.fontScale,
  fontWeight: 700,
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  color: theme.colors.onSurface,
  background: `color-mix(in srgb, ${theme.colors.primary} 22%, transparent)`,
  borderBottom: `3px solid color-mix(in srgb, ${theme.colors.primary} 55%, transparent)`,
  boxShadow: `0 1px 0 color-mix(in srgb, ${theme.colors.secondary} 80%, transparent)`,
});

export function KeyboardTipOverlay({
  fields,
  theme,
  timeMs,
  reducedMotion: _r,
  motionTimeScale: ms,
  layoutDirection,
}: TemplateRenderProps) {
  const keys = fieldStr(fields, "keys", "⌘ + K");
  const description = fieldStr(fields, "description", "");

  const p0 = easeOutCubic(segment01(timeMs, 0, 400 * ms));
  const p1 = easeOutCubic(segment01(timeMs, 160 * ms, 520 * ms));

  const parts = keys
    .split(/\s*\+\s*/)
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "flex-start",
        padding: "8% 10%",
        direction: layoutDirection,
        fontFamily: theme.fontFamilies.body,
      }}
    >
      <div
        style={{
          display: "inline-flex",
          flexDirection: "column",
          gap: 10 * theme.fontScale,
          padding: `${14 * theme.fontScale}px ${18 * theme.fontScale}px`,
          borderRadius: theme.radii.md,
          background: `color-mix(in srgb, ${theme.colors.surface} 92%, transparent)`,
          border: `1px solid ${theme.colors.secondary}`,
          maxWidth: 420,
        }}
      >
        <div data-fx-stagger>
          <div
            style={{
              display: "inline-flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 8 * theme.fontScale,
              opacity: p0,
              transform: `translateY(${(1 - p0) * 12}px)`,
            }}
          >
            {parts.map((t, i) => (
              <span key={`${i}-${t}`} style={{ display: "inline-flex", alignItems: "center", gap: 8 * theme.fontScale }}>
                {i > 0 ? (
                  <span style={{ fontSize: 12 * theme.fontScale, fontWeight: 800, color: theme.colors.muted }}>+</span>
                ) : null}
                <kbd style={kbdStyle(theme)}>{t}</kbd>
              </span>
            ))}
          </div>
        </div>
        {description ? (
          <div data-fx-stagger>
            <div
              style={{
                fontSize: 13 * theme.fontScale,
                color: theme.colors.muted,
                lineHeight: 1.45,
                opacity: p1,
              }}
            >
              {description}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
