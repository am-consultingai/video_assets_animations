import { easeOutCubic, segment01 } from "../../engine/timeline";
import type { TemplateRenderProps } from "../../types";
import { fieldStr } from "../fields";

const CHIP: Record<string, string> = {
  up_next: "UP NEXT",
  previously: "PREVIOUSLY",
  chapter: "CHAPTER",
};

export function SectionBumper({
  fields,
  theme,
  timeMs,
  reducedMotion: _r,
  motionTimeScale: ms,
  layoutDirection,
}: TemplateRenderProps) {
  const kind = fieldStr(fields, "bumpKind", "up_next");
  const title = fieldStr(fields, "title", "Title");
  const subtitle = fieldStr(fields, "subtitle", "");
  const chip = CHIP[kind] ?? "UP NEXT";

  const p0 = easeOutCubic(segment01(timeMs, 0, 420 * ms));
  const p1 = easeOutCubic(segment01(timeMs, 120 * ms, 520 * ms));
  const p2 = easeOutCubic(segment01(timeMs, 260 * ms, 620 * ms));

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: theme.fontFamilies.display,
        direction: layoutDirection,
        padding: "8%",
      }}
    >
      <div data-fx-stagger>
        <div
          style={{
            fontSize: 11 * theme.fontScale,
            fontWeight: 800,
            letterSpacing: "0.2em",
            color: theme.colors.accent,
            opacity: p0,
            transform: `translateY(${(1 - p0) * 12}px)`,
          }}
        >
          {chip}
        </div>
      </div>
      <div data-fx-stagger>
        <div
          style={{
            marginTop: 14 * theme.fontScale,
            fontSize: `clamp(22px, 5vw, ${44 * theme.fontScale}px)`,
            fontWeight: 900,
            textAlign: "center",
            color: theme.colors.onSurface,
            opacity: p1,
            transform: `translateY(${(1 - p1) * 18}px)`,
            maxWidth: "90%",
          }}
        >
          {title}
        </div>
      </div>
      {subtitle ? (
        <div data-fx-stagger>
          <div
            style={{
              marginTop: 10 * theme.fontScale,
              fontFamily: theme.fontFamilies.body,
              fontSize: 15 * theme.fontScale,
              color: theme.colors.muted,
              opacity: p2,
              transform: `translateY(${(1 - p2) * 10}px)`,
            }}
          >
            {subtitle}
          </div>
        </div>
      ) : null}
    </div>
  );
}
