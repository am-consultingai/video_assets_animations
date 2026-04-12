import { fontFamilyById } from "../fonts/catalog";
import type { BrandKit, ResolvedTheme } from "../types";

export function resolveTheme(
  kit: BrandKit,
  overrides?: Partial<{ colors: Partial<BrandKit["colors"]>; fontScale?: number }>,
): ResolvedTheme {
  const colors = { ...kit.colors, ...overrides?.colors };
  const fontScale = overrides?.fontScale ?? kit.fontScale;
  return {
    ...kit,
    colors,
    fontScale,
    fontFamilies: {
      display: fontFamilyById(kit.typography.display.fontId),
      body: fontFamilyById(kit.typography.body.fontId),
      accent: fontFamilyById(kit.typography.accent.fontId),
    },
  };
}

/** Brand-kit motion intensity as a speed/duration multiplier (before OS reduced-motion). */
function intensityMultiplier(motionIntensity: ResolvedTheme["motionIntensity"]): number {
  switch (motionIntensity) {
    case "low":
      return 0.4;
    case "high":
      return 1.75;
    default:
      return 1;
  }
}

/**
 * Multiplier for composition + template timelines + stagger.
 * OS reduced motion narrows the range; Low / Medium / High still differ.
 */
export function motionScale(theme: ResolvedTheme, reducedMotion: boolean): number {
  const base = intensityMultiplier(theme.motionIntensity);
  if (reducedMotion) {
    return Math.max(0.38, Math.min(0.96, base * 0.58));
  }
  return base;
}
