import { easeInOutCubic, easeOutCubic, segment01 } from "../../engine/timeline";
import type { TemplateRenderProps } from "../../types";
import { fieldNum, fieldStr } from "../fields";

export function HeroTitleStack({
  fields,
  theme,
  timeMs,
  reducedMotion: _reducedMotion,
  motionTimeScale,
  layoutDirection,
}: TemplateRenderProps) {
  const ms = motionTimeScale;
  const title = fieldStr(fields, "title", "YOUR HEADLINE");
  const subtitle = fieldStr(fields, "subtitle", "Kinetic title stack");
  const tagline = fieldStr(fields, "tagline", "Clean motion · creator ready");
  const typeSpeed = fieldNum(fields, "typingSpeed", 6);

  const tTitle = 0;
  const tTitleEnd = 900 * ms;
  const tSub = 700 * ms;
  const tTag = 1200 * ms;

  const orb = easeOutCubic(segment01(timeMs, tTitle, tTitle + 600 * ms));
  const titleProgress = segment01(timeMs, tTitle, tTitleEnd);
  const chars = Math.max(1, title.length);
  const typed = Math.min(chars, Math.floor(titleProgress * chars * (typeSpeed / 6)));
  const shownTitle = title.slice(0, Math.max(1, typed));
  const cursorBlink = Math.sin(timeMs / 160) > 0 ? 1 : 0.35;

  const pSub = easeInOutCubic(segment01(timeMs, tSub, tSub + 500 * ms));
  const pTag = easeOutCubic(segment01(timeMs, tTag, tTag + 500 * ms));

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        direction: layoutDirection,
        fontFamily: theme.fontFamilies.display,
      }}
    >
      <div
        data-fx-stagger
        style={{
          position: "absolute",
          width: "min(28%, 180px)",
          aspectRatio: "1",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${theme.colors.accent}55, transparent 70%)`,
            filter: "blur(4px)",
            transform: `scale(${0.3 + orb * 0.7})`,
            opacity: 0.5 + orb * 0.35,
          }}
        />
      </div>
      <div style={{ position: "relative", zIndex: 2, width: "88%", maxWidth: 960 }}>
        <div data-fx-stagger>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontSize: `clamp(28px, 6vw, ${72 * theme.fontScale}px)`,
              fontWeight: 900,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: theme.colors.accent,
              textShadow: `0 0 40px color-mix(in srgb, ${theme.colors.accent} 45%, transparent)`,
            }}
          >
            {shownTitle}
          </span>
          <span
            style={{
              width: 3,
              height: `clamp(28px, 6vw, ${72 * theme.fontScale}px)`,
              background: theme.colors.accent,
              opacity: cursorBlink * (typed < chars ? 1 : 0.25),
            }}
          />
        </div>
        </div>
        <div style={{ marginTop: 18, display: "flex", justifyContent: "center" }}>
          <div data-fx-stagger>
          <div
            style={{
              borderRadius: 999,
              padding: "8px 22px",
              background: theme.colors.accent,
              color: theme.colors.primary,
              fontFamily: theme.fontFamilies.accent,
              fontWeight: 800,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              fontSize: `clamp(12px, 2.4vw, ${22 * theme.fontScale}px)`,
              transform: `scaleX(${0.2 + pSub * 0.8})`,
              opacity: pSub,
            }}
          >
            <span style={{ opacity: pSub }}>{subtitle}</span>
          </div>
          </div>
        </div>
        <div data-fx-stagger>
        <div
          style={{
            marginTop: 14,
            fontFamily: theme.fontFamilies.body,
            fontSize: `clamp(10px, 1.4vw, ${14 * theme.fontScale}px)`,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: theme.colors.muted,
            transform: `translateY(${(1 - pTag) * 12}px)`,
            opacity: pTag,
          }}
        >
          {tagline}
        </div>
        </div>
      </div>
    </div>
  );
}
