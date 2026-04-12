import { DEFAULT_BRAND_KIT } from "../brand/defaultKit";
import { DEFAULT_COMPOSITION } from "../engine/compositionMotion";
import { sanitizeSceneEffects } from "../engine/sceneEffects";
import type { CanvasPreset, FieldValues, ProjectState, TemplateDefinition } from "../types";
import { PROJECT_SCHEMA_VERSION } from "../types";

export const DEFAULT_CANVAS: CanvasPreset = {
  aspectRatioId: "16:9",
  resolutionId: "1080p",
  fps: 30,
};

export function mergeFieldDefaults(def: TemplateDefinition, stored?: FieldValues): FieldValues {
  const out: FieldValues = {};
  for (const f of def.fields) {
    out[f.key] = stored?.[f.key] ?? f.default;
  }
  return out;
}

export function newProjectId(): string {
  return crypto.randomUUID();
}

export function createDefaultProject(templateId: string, templateVersion: string): ProjectState {
  return {
    id: newProjectId(),
    schema_version: PROJECT_SCHEMA_VERSION,
    updated_at: new Date().toISOString(),
    canvas: { ...DEFAULT_CANVAS },
    brand_kit: structuredClone(DEFAULT_BRAND_KIT),
    template_id: templateId,
    template_definition_version: templateVersion,
    field_values: {},
    template_overrides: {},
    ui: {
      layoutDirection: "ltr",
      showSafeZones: false,
      composition: { ...DEFAULT_COMPOSITION },
      effects: sanitizeSceneEffects(undefined),
    },
  };
}
