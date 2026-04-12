export interface FontCatalogEntry {
  id: string;
  label: string;
  /** CSS font-family stack */
  family: string;
  license: "OFL" | "Apache-2.0";
  source: "Google Fonts";
}

/** Curated open fonts loaded via index.html Google Fonts link */
export const FONT_CATALOG: FontCatalogEntry[] = [
  {
    id: "inter",
    label: "Inter",
    family: '"Inter", system-ui, sans-serif',
    license: "OFL",
    source: "Google Fonts",
  },
  {
    id: "outfit",
    label: "Outfit",
    family: '"Outfit", system-ui, sans-serif',
    license: "OFL",
    source: "Google Fonts",
  },
  {
    id: "bebas",
    label: "Bebas Neue",
    family: '"Bebas Neue", Impact, sans-serif',
    license: "OFL",
    source: "Google Fonts",
  },
  {
    id: "jetbrains",
    label: "JetBrains Mono",
    family: '"JetBrains Mono", ui-monospace, monospace',
    license: "OFL",
    source: "Google Fonts",
  },
];

export function fontFamilyById(id: string): string {
  return FONT_CATALOG.find((f) => f.id === id)?.family ?? '"Inter", sans-serif';
}
