import { easeOutCubic, segment01 } from "../../engine/timeline";
import type { TemplateRenderProps } from "../../types";
import { fieldNum, fieldStr } from "../fields";

function formatMmSs(totalSec: number): string {
  const s = Math.max(0, Math.ceil(totalSec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}

export function TimerCountdown({
  fields,
  theme,
  timeMs,
  durationMs: _durationMs,
  reducedMotion: _reducedMotion,
  motionTimeScale,
  layoutDirection,
}: TemplateRenderProps) {
  const ms = motionTimeScale;
  const label = fieldStr(fields, "label", "Starting in");
  const startSec = fieldNum(fields, "startSeconds", 30);
  const intro = 500 * ms;

  const p = easeOutCubic(segment01(timeMs, 0, intro));
  const elapsed = Math.max(0, (timeMs - intro) / 1000);
  const remaining = Math.max(0, startSec - elapsed);
  const display = formatMmSs(remaining);

  const pulse = 0.92 + 0.08 * Math.sin(timeMs / 250);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        direction: layoutDirection,
        fontFamily: theme.fontFamilies.accent,
      }}
    >
      <div data-fx-stagger>
        <div
          style={{
            fontSize: 14 * theme.fontScale,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: theme.colors.muted,
            opacity: p,
            marginBottom: 12 * theme.fontScale,
          }}
        >
          {label}
        </div>
      </div>
      <div data-fx-stagger>
        <div
          style={{
            fontFamily: theme.fontFamilies.body,
            fontSize: `clamp(40px, 12vw, ${120 * theme.fontScale}px)`,
            fontWeight: 900,
            color: theme.colors.onSurface,
            fontVariantNumeric: "tabular-nums",
            transform: `scale(${pulse})`,
            opacity: p,
            textShadow: `0 0 60px color-mix(in srgb, ${theme.colors.accent} 50%, transparent)`,
          }}
        >
          {timeMs < intro ? formatMmSs(startSec) : display}
        </div>
      </div>
      <div data-fx-stagger>
        <div
          style={{
            marginTop: 16 * theme.fontScale,
            height: 4,
            width: "min(60%, 420px)",
            borderRadius: 99,
            background: theme.colors.secondary,
            overflow: "hidden",
            opacity: p,
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${Math.min(100, (elapsed / Math.max(0.001, startSec)) * 100)}%`,
              background: theme.colors.accent,
              transition: "none",
            }}
          />
        </div>
      </div>
    </div>
  );
}
