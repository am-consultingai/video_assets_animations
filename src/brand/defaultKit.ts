import type { BrandKit } from "../types";

export const DEFAULT_BRAND_KIT: BrandKit = {
  colors: {
    primary: "#0f172a",
    secondary: "#334155",
    surface: "#020617",
    onSurface: "#f8fafc",
    accent: "#22d3ee",
    muted: "#94a3b8",
  },
  typography: {
    display: { fontId: "bebas", weight: 400 },
    body: { fontId: "inter", weight: 600 },
    accent: { fontId: "outfit", weight: 700 },
  },
  fontScale: 1,
  radii: { sm: 6, md: 10, lg: 16 },
  motionIntensity: "medium",
};
