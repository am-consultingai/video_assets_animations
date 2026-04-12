import { easeOutCubic, segment01 } from "../../engine/timeline";
import { IconBell, IconPlay } from "../../icons/HeroiconsSubset";
import type { TemplateRenderProps } from "../../types";
import { fieldStr } from "../fields";

export function SubscribeCtaCard({
  fields,
  theme,
  timeMs,
  durationMs,
  reducedMotion: _reducedMotion,
  motionTimeScale,
  layoutDirection,
}: TemplateRenderProps) {
  const ms = motionTimeScale;
  const channel = fieldStr(fields, "channelName", "Your Channel");
  const subs = fieldStr(fields, "subscriberLine", "Join the community");
  const toast = fieldStr(fields, "toastText", "New video · tap the bell");

  const t0 = 0;
  const tCard = 500 * ms;
  const tBtn = 900 * ms;
  const tBell = 1200 * ms;
  const tToast = 1700 * ms;
  const tToastOut = Math.min(durationMs - 400 * ms, tToast + 1400 * ms);

  const pCard = easeOutCubic(segment01(timeMs, t0, tCard));
  const pBtn = easeOutCubic(segment01(timeMs, tBtn, tBtn + 350 * ms));
  const pBell = easeOutCubic(segment01(timeMs, tBell, tBell + 320 * ms));
  const pToastIn = easeOutCubic(segment01(timeMs, tToast, tToast + 400 * ms));
  const pToastHold = segment01(timeMs, tToast + 400 * ms, tToastOut);
  const pToastOut = easeOutCubic(segment01(timeMs, tToastOut, tToastOut + 350 * ms));

  const toastOpacity = pToastIn * (1 - pToastOut) * (0.35 + 0.65 * pToastHold);
  const initial = channel.trim().charAt(0).toUpperCase() || "•";
  const isRtl = layoutDirection === "rtl";
  const side = isRtl ? { right: "5%", left: "auto" } : { left: "5%", right: "auto" };

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        direction: layoutDirection,
        fontFamily: theme.fontFamilies.body,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "10%",
          insetInlineStart: "50%",
          transform: `translateX(${isRtl ? "50%" : "-50%"})`,
          zIndex: 5,
        }}
      >
        <div data-fx-stagger>
          <div
            style={{
              transform: `translateY(${(1 - pToastIn) * -16}px)`,
              opacity: toastOpacity,
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 14px",
              borderRadius: theme.radii.md,
              background: theme.colors.surface,
              border: `1px solid ${theme.colors.secondary}`,
              boxShadow: "0 12px 40px rgba(0,0,0,0.45)",
            }}
          >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: theme.colors.accent,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: theme.colors.primary,
              fontWeight: 800,
              fontSize: 13,
            }}
          >
            {initial}
          </div>
          <div>
            <div style={{ color: theme.colors.onSurface, fontWeight: 700, fontSize: 12 }}>{toast}</div>
            <div style={{ color: theme.colors.muted, fontSize: 10, marginTop: 2 }}>Just now</div>
          </div>
          </div>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: "9%",
          ...side,
          zIndex: 3,
        }}
      >
        <div data-fx-stagger>
          <div
            style={{
              opacity: pCard,
              transform: `translateX(${(isRtl ? 1 : -1) * (1 - pCard) * 48}px)`,
            }}
          >
        <div
          style={{
            position: "relative",
            borderRadius: theme.radii.md,
            padding: `${14 * theme.fontScale}px ${20 * theme.fontScale}px`,
            minWidth: 260,
            background: `color-mix(in srgb, ${theme.colors.primary} 92%, transparent)`,
            border: `1px solid color-mix(in srgb, ${theme.colors.accent} 35%, transparent)`,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              insetInlineStart: 0,
              bottom: 0,
              height: 3,
              width: `${pCard * 100}%`,
              background: theme.colors.accent,
              transition: "none",
            }}
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 10,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: theme.colors.accent,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: theme.colors.primary,
                fontWeight: 800,
              }}
            >
              {initial}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ color: theme.colors.onSurface, fontWeight: 800, fontSize: 15 }}>{channel}</div>
              <div style={{ color: theme.colors.muted, fontSize: 12, marginTop: 2 }}>{subs}</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 16px",
                borderRadius: 999,
                background: "#dc2626",
                color: "#fff",
                fontWeight: 700,
                fontSize: 13,
                opacity: pBtn,
                transform: `scale(${0.85 + pBtn * 0.15})`,
              }}
            >
              <IconPlay size={14} />
              Subscribe
            </div>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                border: "1px solid rgba(255,255,255,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(255,255,255,0.06)",
                opacity: pBell,
                transform: `scale(${0.7 + pBell * 0.3})`,
              }}
            >
              <IconBell size={18} color={theme.colors.muted} />
            </div>
          </div>
        </div>
          </div>
        </div>
      </div>
    </div>
  );
}
