import type { CSSProperties } from "react";
import { easeOutCubic, segment01 } from "./timeline";

/** Global enter/exit treatments applied around the whole template (preview + export). */
export type CompositionStylePreset =
  | "none"
  | "fade"
  | "slide-up"
  | "slide-down"
  | "slide-left"
  | "slide-right"
  | "zoom-in"
  | "zoom-out";

export interface CompositionSettings {
  enterStyle: CompositionStylePreset;
  exitStyle: CompositionStylePreset;
  /** Horizontal shift from center as % of canvas width (-50 … 50). */
  offsetXPercent: number;
  /** Vertical shift from center as % of canvas height (-50 … 50). */
  offsetYPercent: number;
  /** Uniform scale for the whole graphic (relative sizes preserved). */
  uniformScale: number;
}

export const DEFAULT_COMPOSITION: CompositionSettings = {
  enterStyle: "fade",
  exitStyle: "fade",
  offsetXPercent: 0,
  offsetYPercent: 0,
  uniformScale: 1,
};

/** Normalize invalid pairings (e.g. zoom-out only applies on exit). */
export function sanitizeComposition(p: Partial<CompositionSettings> | undefined): CompositionSettings {
  const out: CompositionSettings = { ...DEFAULT_COMPOSITION, ...p };
  if (out.enterStyle === "zoom-out") out.enterStyle = "none";
  if (out.exitStyle === "zoom-in") out.exitStyle = "none";
  return out;
}

export const COMPOSITION_STYLE_OPTIONS: { value: CompositionStylePreset; label: string }[] = [
  { value: "none", label: "None" },
  { value: "fade", label: "Fade" },
  { value: "slide-up", label: "Slide up" },
  { value: "slide-down", label: "Slide down" },
  { value: "slide-left", label: "Slide left" },
  { value: "slide-right", label: "Slide right" },
  { value: "zoom-in", label: "Zoom in" },
  { value: "zoom-out", label: "Zoom out" },
];

/** Enter dropdown: zoom-out only affects the exit phase in this engine */
export const COMPOSITION_ENTER_OPTIONS = COMPOSITION_STYLE_OPTIONS.filter((o) => o.value !== "zoom-out");
/** Exit dropdown: zoom-in only affects the enter phase */
export const COMPOSITION_EXIT_OPTIONS = COMPOSITION_STYLE_OPTIONS.filter((o) => o.value !== "zoom-in");

/**
 * Pixel offset so the scaled composition (W×H, scale s, user shift ox/oy) sits fully outside the frame.
 * Enter: resting position is (0,0) extra slide; at t=0 we apply full offset so nothing is visible.
 * Exit: at t=1 full offset clears the frame in the exit direction.
 */
function fullFrameSlideOffset(
  preset: CompositionStylePreset,
  kind: "enter" | "exit",
  W: number,
  H: number,
  ox: number,
  oy: number,
  s: number,
): { x: number; y: number } {
  const margin = Math.max(W, H) * 0.03;
  const hw = (W * s) / 2;
  const hh = (H * s) / 2;

  switch (preset) {
    case "slide-up":
      if (kind === "enter") {
        const v = H - H / 2 - oy + hh + margin;
        return { x: 0, y: Math.max(v, hh + margin * 2) };
      }
      return { x: 0, y: -(H / 2 + oy + hh + margin) };
    case "slide-down":
      if (kind === "enter") {
        return { x: 0, y: -(H / 2 + oy + hh + margin) };
      }
      return { x: 0, y: H - H / 2 - oy + hh + margin };
    case "slide-left":
      if (kind === "enter") {
        const v = W - W / 2 - ox + hw + margin;
        return { x: Math.max(v, hw + margin * 2), y: 0 };
      }
      return { x: -(W / 2 + ox + hw + margin), y: 0 };
    case "slide-right":
      if (kind === "enter") {
        return { x: -(W / 2 + ox + hw + margin), y: 0 };
      }
      return { x: W - W / 2 - ox + hw + margin, y: 0 };
    default:
      return { x: 0, y: 0 };
  }
}

/** Style for the inner box (centered, full canvas size) that holds background + template. */
export function getCompositionLayerStyle(
  timeMs: number,
  durationMs: number,
  canvasW: number,
  canvasH: number,
  composition: CompositionSettings,
  motionTimeScale: number,
  /** `prefers-reduced-motion` — short transitions, independent of brand intensity */
  prefersReducedMotion: boolean,
): CSSProperties {
  const d = Math.max(1, durationMs);
  const maxWindow = d * 0.38;
  const baseMs = prefersReducedMotion
    ? Math.min(Math.round(150 + 240 * motionTimeScale), maxWindow)
    : Math.min(Math.round(220 + 600 * motionTimeScale), maxWindow);
  const enterMs = Math.min(baseMs, maxWindow);
  const exitMs = Math.min(baseMs, maxWindow);

  const pEnter = easeOutCubic(segment01(timeMs, 0, enterMs));
  const exitProg = easeOutCubic(segment01(timeMs, d - exitMs, d));

  const { enterStyle, exitStyle, offsetXPercent, offsetYPercent, uniformScale } = composition;

  const ox = (offsetXPercent / 100) * canvasW;
  const oy = (offsetYPercent / 100) * canvasH;

  /** Scales zoom depth; tied to brand intensity. */
  const mt = Math.max(0.35, Math.min(1.85, motionTimeScale));
  const zoomInDelta = 0.2 * mt;
  const zoomOutDelta = 0.26 * mt;

  let zoomMul = 1;
  if (enterStyle === "zoom-in") zoomMul *= 1 - zoomInDelta + zoomInDelta * pEnter;
  if (exitStyle === "zoom-out") zoomMul *= 1 - zoomOutDelta * exitProg;

  const scale = uniformScale * zoomMul;

  /** Upper bound on scale for bbox math so slides always clear the frame (covers zoom-in peak). */
  const sForSlide = uniformScale * 1.02;

  let opacity = 1;
  if (enterStyle === "fade") opacity *= pEnter;
  if (exitStyle === "fade") opacity *= 1 - exitProg;

  let sx = 0;
  let sy = 0;
  if (
    enterStyle === "slide-up" ||
    enterStyle === "slide-down" ||
    enterStyle === "slide-left" ||
    enterStyle === "slide-right"
  ) {
    const v = fullFrameSlideOffset(enterStyle, "enter", canvasW, canvasH, ox, oy, sForSlide);
    sx += v.x * (1 - pEnter);
    sy += v.y * (1 - pEnter);
  }
  if (
    exitStyle === "slide-up" ||
    exitStyle === "slide-down" ||
    exitStyle === "slide-left" ||
    exitStyle === "slide-right"
  ) {
    const v = fullFrameSlideOffset(exitStyle, "exit", canvasW, canvasH, ox, oy, sForSlide);
    sx += v.x * exitProg;
    sy += v.y * exitProg;
  }

  return {
    position: "absolute",
    left: "50%",
    top: "50%",
    width: canvasW,
    height: canvasH,
    zIndex: 1,
    transform: `translate(calc(-50% + ${ox + sx}px), calc(-50% + ${oy + sy}px)) scale(${scale})`,
    transformOrigin: "center center",
    opacity,
    willChange: "transform, opacity",
  };
}
