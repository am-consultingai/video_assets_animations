import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import { clampStaggerTiming, staggerItemAlpha } from "../engine/sceneEffects";
import { easeOutCubic, segment01 } from "../engine/timeline";

export function StaggerShell({
  enabled,
  timeMs,
  durationMs,
  stepMs,
  blendMs,
  motionTimeScale,
  templateId,
  children,
}: {
  enabled: boolean;
  timeMs: number;
  durationMs: number;
  stepMs: number;
  blendMs: number;
  motionTimeScale: number;
  templateId: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const nodes = [...root.querySelectorAll<HTMLElement>("[data-fx-stagger]")];
    if (!enabled || nodes.length === 0) {
      for (const el of nodes) {
        el.style.opacity = "";
        el.style.transform = "";
      }
      return;
    }

    const mt = Math.max(0.35, Math.min(1.85, motionTimeScale));
    const { step, blend } = clampStaggerTiming(nodes.length, durationMs, stepMs * mt, blendMs * mt);

    nodes.forEach((el, i) => {
      const a = staggerItemAlpha(i, nodes.length, timeMs, durationMs, step, blend);
      const pin = easeOutCubic(segment01(timeMs, i * step, i * step + blend));
      const ty = (1 - pin) * (16 / mt);
      el.style.opacity = String(a);
      el.style.transform = ty > 0.25 ? `translateY(${ty}px)` : "";
    });
  }, [enabled, timeMs, durationMs, stepMs, blendMs, motionTimeScale, templateId]);

  return (
    <div ref={ref} style={{ position: "absolute", inset: 0, zIndex: 5, pointerEvents: "none" }}>
      <div style={{ pointerEvents: "auto", position: "relative", width: "100%", height: "100%" }}>{children}</div>
    </div>
  );
}
