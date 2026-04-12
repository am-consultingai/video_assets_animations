import type { SceneEffectsSettings } from "../types";
import { easeOutCubic, segment01 } from "./timeline";

export const DEFAULT_SCENE_EFFECTS: SceneEffectsSettings = {
  staggerEnabled: false,
  staggerStepMs: 100,
  staggerBlendMs: 380,
  glowEnabled: false,
  glowBlurPx: 14,
  glowSpread: 2,
  glowColor: "#22d3ee",
  fireEnabled: false,
  fireIntensity: 5,
  fireHeight: 5,
  vignetteEnabled: false,
  vignetteStrength: 55,
  grainEnabled: false,
  grainOpacity: 22,
  liftShadowEnabled: false,
  liftShadowBlur: 28,
  liftShadowOpacity: 48,
  lightSweepEnabled: false,
  lightSweepOpacity: 38,
  confettiEnabled: false,
  confettiIntensity: 7,
  chromaticEnabled: false,
  chromaticAmount: 2.5,
  gradeSaturation: 100,
  gradeContrast: 100,
};

export function sanitizeSceneEffects(p: Partial<SceneEffectsSettings> | undefined): SceneEffectsSettings {
  const m = { ...DEFAULT_SCENE_EFFECTS, ...p };
  return {
    ...m,
    staggerStepMs: Math.min(800, Math.max(20, Math.round(m.staggerStepMs))),
    staggerBlendMs: Math.min(2000, Math.max(40, Math.round(m.staggerBlendMs))),
    glowBlurPx: Math.min(80, Math.max(2, Math.round(m.glowBlurPx))),
    glowSpread: Math.min(8, Math.max(1, Math.round(m.glowSpread))),
    fireIntensity: Math.min(20, Math.max(1, Math.round(m.fireIntensity))),
    fireHeight: Math.min(10, Math.max(1, Math.round(m.fireHeight))),
    vignetteStrength: Math.min(95, Math.max(8, Math.round(m.vignetteStrength))),
    grainOpacity: Math.min(55, Math.max(4, Math.round(m.grainOpacity))),
    liftShadowBlur: Math.min(80, Math.max(6, Math.round(m.liftShadowBlur))),
    liftShadowOpacity: Math.min(90, Math.max(8, Math.round(m.liftShadowOpacity))),
    lightSweepOpacity: Math.min(70, Math.max(5, Math.round(m.lightSweepOpacity))),
    confettiIntensity: Math.min(18, Math.max(1, Math.round(m.confettiIntensity))),
    chromaticAmount: Math.min(6, Math.max(0.5, Math.round(m.chromaticAmount * 10) / 10)),
    gradeSaturation: Math.min(160, Math.max(60, Math.round(m.gradeSaturation))),
    gradeContrast: Math.min(140, Math.max(70, Math.round(m.gradeContrast))),
  };
}

/** Per-item opacity 0–1 with staggered enter and mirrored stagger exit (last in → first out). */
export function staggerItemAlpha(
  index: number,
  count: number,
  timeMs: number,
  durationMs: number,
  stepMs: number,
  blendMs: number,
): number {
  if (count <= 0) return 1;
  const d = Math.max(1, durationMs);
  const t = timeMs;
  const ain = easeOutCubic(segment01(t, index * stepMs, index * stepMs + blendMs));
  const exitOrder = count - 1 - index;
  const exitStart = d - blendMs - (exitOrder + 1) * stepMs;
  const exitEnd = d - exitOrder * stepMs;
  if (exitEnd <= exitStart + 1) return ain;
  const aout = 1 - easeOutCubic(segment01(t, exitStart, exitEnd));
  return Math.max(0, Math.min(1, ain * aout));
}

/** Clamp step/blend so enter + exit stagger fits in the scene. */
export function clampStaggerTiming(
  count: number,
  durationMs: number,
  stepMs: number,
  blendMs: number,
): { step: number; blend: number } {
  const n = Math.max(1, count);
  const d = Math.max(1, durationMs);
  const maxEach = d * 0.3;
  let step = stepMs;
  let blend = blendMs;
  const need = (n - 1) * step + blend;
  if (need > maxEach) {
    const s = maxEach / Math.max(need, 1);
    step *= s;
    blend *= s;
  }
  return { step: Math.max(16, step), blend: Math.max(80, blend) };
}

export function buildGlowFilter(effects: SceneEffectsSettings): string | undefined {
  if (!effects.glowEnabled) return undefined;
  const b = Math.max(2, effects.glowBlurPx);
  const c = effects.glowColor;
  const layers = effects.glowSpread;
  const parts: string[] = [];
  for (let i = 1; i <= layers; i++) {
    const blur = b * (0.45 + i * 0.35);
    const a = 0.55 / i;
    parts.push(`drop-shadow(0 0 ${blur}px color-mix(in srgb, ${c} ${Math.round(a * 100)}%, transparent))`);
  }
  return parts.join(" ");
}

/** Glow + color grade + chromatic aberration on the composition inner wrapper. */
export function buildCompositionFilter(effects: SceneEffectsSettings): string | undefined {
  const parts: string[] = [];
  const glow = buildGlowFilter(effects);
  if (glow) parts.push(glow);
  const sat = effects.gradeSaturation / 100;
  const con = effects.gradeContrast / 100;
  if (Math.abs(sat - 1) > 0.02) parts.push(`saturate(${sat})`);
  if (Math.abs(con - 1) > 0.02) parts.push(`contrast(${con})`);
  if (effects.chromaticEnabled && effects.chromaticAmount >= 0.5) {
    const x = effects.chromaticAmount;
    parts.push(`drop-shadow(${x}px 0 1px rgba(255,60,100,0.4))`);
    parts.push(`drop-shadow(${-x}px 0 1px rgba(60,220,255,0.4))`);
  }
  return parts.length ? parts.join(" ") : undefined;
}

export function buildLiftBoxShadow(effects: SceneEffectsSettings): string | undefined {
  if (!effects.liftShadowEnabled) return undefined;
  const blur = effects.liftShadowBlur;
  const y = Math.max(4, Math.round(blur * 0.45));
  const a = Math.min(0.65, effects.liftShadowOpacity / 100);
  return `0 ${y}px ${blur}px rgba(0,0,0,${a})`;
}
