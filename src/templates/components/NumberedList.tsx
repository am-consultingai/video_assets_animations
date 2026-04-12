import { easeOutCubic, segment01 } from "../../engine/timeline";
import type { TemplateRenderProps } from "../../types";
import { fieldStr } from "../fields";

export function NumberedList({
  fields,
  theme,
  timeMs,
  reducedMotion: _reducedMotion,
  motionTimeScale,
  layoutDirection,
}: TemplateRenderProps) {
  const ms = motionTimeScale;
  const headline = fieldStr(fields, "headline", "Key takeaways");
  const i1 = fieldStr(fields, "item1", "Hook viewers in the first seconds");
  const i2 = fieldStr(fields, "item2", "Keep pacing tight and purposeful");
  const i3 = fieldStr(fields, "item3", "End with a clear next step");
  const items = [i1, i2, i3];

  const t0 = 200 * ms;
  const step = 380 * ms;
  const pHead = easeOutCubic(segment01(timeMs, 0, 450 * ms));

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        padding: "8% 10%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 18 * theme.fontScale,
        direction: layoutDirection,
        fontFamily: theme.fontFamilies.body,
      }}
    >
      <div data-fx-stagger>
        <div
          style={{
            fontSize: 28 * theme.fontScale,
            fontWeight: 800,
            color: theme.colors.onSurface,
            opacity: pHead,
            transform: `translateY(${(1 - pHead) * 16}px)`,
          }}
        >
          {headline}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 * theme.fontScale }}>
        {items.map((text, idx) => {
          const start = t0 + idx * step;
          const p = easeOutCubic(segment01(timeMs, start, start + 420 * ms));
          return (
            <div key={idx} data-fx-stagger>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14 * theme.fontScale,
                opacity: p,
                transform: `translateX(${(layoutDirection === "rtl" ? 1 : -1) * (1 - p) * 24}px)`,
              }}
            >
              <div
                style={{
                  minWidth: 36 * theme.fontScale,
                  height: 36 * theme.fontScale,
                  borderRadius: theme.radii.sm,
                  background: theme.colors.accent,
                  color: theme.colors.primary,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 900,
                  fontSize: 16 * theme.fontScale,
                }}
              >
                {idx + 1}
              </div>
              <div style={{ fontSize: 18 * theme.fontScale, color: theme.colors.onSurface, fontWeight: 600 }}>{text}</div>
            </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
