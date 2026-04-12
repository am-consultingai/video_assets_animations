import { DEFAULT_BRAND_KIT } from "../brand/defaultKit";
import { sanitizeComposition } from "../engine/compositionMotion";
import { sanitizeSceneEffects } from "../engine/sceneEffects";
import { definitionById, TEMPLATE_DEFINITIONS } from "../templates/definitions";
import type { ProjectState } from "../types";
import { PROJECT_SCHEMA_VERSION } from "../types";
import { createDefaultProject, mergeFieldDefaults, newProjectId } from "./defaults";

function sanitizeMotionIntensity(v: unknown): "low" | "medium" | "high" {
  if (v === "low" || v === "medium" || v === "high") return v;
  return DEFAULT_BRAND_KIT.motionIntensity;
}

export function hydrateProject(raw: unknown): ProjectState {
  const fallbackDef = TEMPLATE_DEFINITIONS[0];
  const base = createDefaultProject(fallbackDef.id, fallbackDef.version);
  if (!raw || typeof raw !== "object") return base;
  const p = raw as Partial<ProjectState>;
  if (p.schema_version != null && p.schema_version !== PROJECT_SCHEMA_VERSION) return base;

  const def = definitionById(p.template_id ?? "") ?? fallbackDef;
  const bk = p.brand_kit;

  return {
    ...base,
    id: typeof p.id === "string" ? p.id : newProjectId(),
    schema_version: PROJECT_SCHEMA_VERSION,
    updated_at: typeof p.updated_at === "string" ? p.updated_at : base.updated_at,
    template_id: def.id,
    template_definition_version: def.version,
    canvas: { ...base.canvas, ...p.canvas },
    brand_kit: {
      ...DEFAULT_BRAND_KIT,
      ...(bk ?? {}),
      colors: { ...DEFAULT_BRAND_KIT.colors, ...(bk?.colors ?? {}) },
      typography: {
        display: { ...DEFAULT_BRAND_KIT.typography.display, ...(bk?.typography?.display ?? {}) },
        body: { ...DEFAULT_BRAND_KIT.typography.body, ...(bk?.typography?.body ?? {}) },
        accent: { ...DEFAULT_BRAND_KIT.typography.accent, ...(bk?.typography?.accent ?? {}) },
      },
      radii: { ...DEFAULT_BRAND_KIT.radii, ...(bk?.radii ?? {}) },
      motionIntensity: sanitizeMotionIntensity(bk?.motionIntensity),
    },
    field_values: mergeFieldDefaults(def, p.field_values ?? {}),
    template_overrides: {
      colors: { ...p.template_overrides?.colors },
      fontScale: p.template_overrides?.fontScale,
    },
    scene_duration_ms: p.scene_duration_ms,
    export_defaults: p.export_defaults,
    ui: {
      layoutDirection: p.ui?.layoutDirection ?? "ltr",
      showSafeZones: p.ui?.showSafeZones ?? false,
      categoryFilter: p.ui?.categoryFilter,
      search: p.ui?.search,
      composition: sanitizeComposition(p.ui?.composition),
      effects: sanitizeSceneEffects(p.ui?.effects),
    },
  };
}
