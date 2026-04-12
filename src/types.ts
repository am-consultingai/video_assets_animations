import type { ComponentType } from "react";
import type { CompositionSettings } from "./engine/compositionMotion";

export type { CompositionSettings, CompositionStylePreset } from "./engine/compositionMotion";

export const PROJECT_SCHEMA_VERSION = 1 as const;

export type AspectRatioId = "16:9" | "9:16" | "1:1" | "4:5" | "21:9";

export type ResolutionId = "720p" | "1080p" | "4k";

export type FieldType = "text" | "color" | "number" | "enum" | "boolean";

export interface FieldOption {
  value: string;
  label: string;
}

export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  default: string | number | boolean;
  min?: number;
  max?: number;
  maxLength?: number;
  required?: boolean;
  options?: FieldOption[];
  /** Maps to brand kit token for default suggestion (optional) */
  kitToken?: string;
}

export type TemplateDirection = "ltr-optimized" | "rtl-capable" | "universal";

export interface TemplateDefinition {
  id: string;
  version: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  aspectRatioHints: AspectRatioId[];
  fields: FieldDef[];
  /** Semantic element id → brand kit path e.g. colors.accent */
  themeBindings: Record<string, string>;
  defaultDurationMs: number;
  direction: TemplateDirection;
  exportHints: {
    prefersAlpha: boolean;
    minDurationMs?: number;
    supportsObsHtml?: boolean;
  };
}

export interface TypographyRole {
  fontId: string;
  weight: number;
}

export interface BrandKit {
  colors: {
    primary: string;
    secondary: string;
    surface: string;
    onSurface: string;
    accent: string;
    muted: string;
  };
  typography: {
    display: TypographyRole;
    body: TypographyRole;
    accent: TypographyRole;
  };
  fontScale: number;
  radii: { sm: number; md: number; lg: number };
  motionIntensity: "low" | "medium" | "high";
}

export interface CanvasPreset {
  aspectRatioId: AspectRatioId;
  resolutionId: ResolutionId;
  fps: 24 | 25 | 30 | 60;
}

export type FieldValues = Record<string, string | number | boolean>;

/** Optional scene-wide VFX (inspector). */
export interface SceneEffectsSettings {
  staggerEnabled: boolean;
  staggerStepMs: number;
  staggerBlendMs: number;
  glowEnabled: boolean;
  glowBlurPx: number;
  glowSpread: number;
  glowColor: string;
  fireEnabled: boolean;
  fireIntensity: number;
  fireHeight: number;
  vignetteEnabled: boolean;
  vignetteStrength: number;
  grainEnabled: boolean;
  grainOpacity: number;
  liftShadowEnabled: boolean;
  liftShadowBlur: number;
  liftShadowOpacity: number;
  lightSweepEnabled: boolean;
  lightSweepOpacity: number;
  confettiEnabled: boolean;
  confettiIntensity: number;
  chromaticEnabled: boolean;
  chromaticAmount: number;
  gradeSaturation: number;
  gradeContrast: number;
}

export interface ProjectState {
  id: string;
  schema_version: typeof PROJECT_SCHEMA_VERSION;
  updated_at: string;
  canvas: CanvasPreset;
  brand_kit: BrandKit;
  template_id: string;
  template_definition_version: string;
  field_values: FieldValues;
  template_overrides: Partial<{
    colors: Partial<BrandKit["colors"]>;
    fontScale?: number;
  }>;
  /** Overrides template default for preview + export length */
  scene_duration_ms?: number;
  export_defaults?: {
    lastFormat?: ExportFormatId;
    flatBackground?: "solid" | "gradient" | "transparent";
  };
  ui?: {
    categoryFilter?: string;
    search?: string;
    showSafeZones?: boolean;
    layoutDirection?: "ltr" | "rtl";
    /** Whole-scene position, scale, and enter/exit presets */
    composition?: CompositionSettings;
    effects?: SceneEffectsSettings;
  };
}

export type ExportFormatId =
  | "webm"
  | "mp4"
  | "png_zip"
  | "gif"
  | "html_obs"
  | "ffmpeg_wasm_stub";

export interface ResolvedTheme extends BrandKit {
  fontFamilies: {
    display: string;
    body: string;
    accent: string;
  };
}

export interface TemplateRenderProps {
  definition: TemplateDefinition;
  fields: FieldValues;
  theme: ResolvedTheme;
  timeMs: number;
  durationMs: number;
  reducedMotion: boolean;
  /** Same multiplier as whole-scene composition (brand motion intensity ± OS reduced motion). */
  motionTimeScale: number;
  layoutDirection: "ltr" | "rtl";
}

export interface TemplateEntry {
  definition: TemplateDefinition;
  Component: ComponentType<TemplateRenderProps>;
}
