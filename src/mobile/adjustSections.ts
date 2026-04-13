export type MobileAdjustSectionId =
  | "canvas"
  | "composition"
  | "scene"
  | "look"
  | "brand"
  | "overrides"
  | "fields"
  | "project-files";

export const ADJUST_HUB_ORDER: MobileAdjustSectionId[] = [
  "canvas",
  "composition",
  "scene",
  "look",
  "brand",
  "overrides",
  "fields",
  "project-files",
];

export function adjustSectionTitle(id: MobileAdjustSectionId, fieldsTemplateName: string): string {
  switch (id) {
    case "canvas":
      return "Canvas";
    case "composition":
      return "Composition & motion";
    case "scene":
      return "Scene effects";
    case "look":
      return "Look & atmosphere";
    case "brand":
      return "Brand & colors";
    case "overrides":
      return "Overrides";
    case "fields":
      return `Fields · ${fieldsTemplateName}`;
    case "project-files":
      return "Project files";
    default: {
      const _x: never = id;
      return _x;
    }
  }
}

export function adjustSectionHint(id: MobileAdjustSectionId): string | undefined {
  switch (id) {
    case "composition":
      return "Intensity scales motion duration and zoom strength across the scene.";
    case "scene":
      return "Stagger targets layers in each template; glow and fire export with the preview.";
    case "look":
      return "Vignette, grain, sweep, and confetti sit over the full frame.";
    case "overrides":
      return "Per-template accent (does not change the global kit).";
    default:
      return undefined;
  }
}
