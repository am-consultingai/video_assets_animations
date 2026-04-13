import { ASPECT_RATIO_OPTIONS, FPS_OPTIONS, RESOLUTION_OPTIONS } from "../canvas/presets";
import {
  COMPOSITION_ENTER_OPTIONS,
  COMPOSITION_EXIT_OPTIONS,
  DEFAULT_COMPOSITION,
  type CompositionSettings,
  type CompositionStylePreset,
} from "../engine/compositionMotion";
import { FONT_CATALOG } from "../fonts/catalog";
import type { FieldValues, ProjectState, SceneEffectsSettings, TemplateEntry } from "../types";

export function CanvasInspectorBody({
  project,
  updateProject,
  durationMs,
  entry,
  isMobileLayout,
  effectiveAspectRatioId,
  storedAspectLabel,
  onDesktopOnlyAspectToast,
}: {
  project: ProjectState;
  updateProject: (patch: Partial<ProjectState> | ((prev: ProjectState) => ProjectState)) => void;
  durationMs: number;
  entry: TemplateEntry;
  isMobileLayout: boolean;
  effectiveAspectRatioId: ProjectState["canvas"]["aspectRatioId"];
  storedAspectLabel: string;
  onDesktopOnlyAspectToast: () => void;
}) {
  return (
    <>
      <div className="field field-compact">
        <label>Aspect</label>
        <select
          value={isMobileLayout ? "1:1" : project.canvas.aspectRatioId}
          onChange={(e) => {
            const v = e.target.value as ProjectState["canvas"]["aspectRatioId"];
            if (isMobileLayout) {
              if (v !== "1:1") onDesktopOnlyAspectToast();
              return;
            }
            updateProject({
              canvas: {
                ...project.canvas,
                aspectRatioId: v,
              },
            });
          }}
        >
          {ASPECT_RATIO_OPTIONS.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      {isMobileLayout && (
        <p className="inspector-card-hint" style={{ marginTop: -2 }}>
          Saved for desktop: {storedAspectLabel}.
        </p>
      )}
      <div className="field field-compact">
        <label>Resolution</label>
        <select
          value={project.canvas.resolutionId}
          onChange={(e) =>
            updateProject({
              canvas: {
                ...project.canvas,
                resolutionId: e.target.value as ProjectState["canvas"]["resolutionId"],
              },
            })
          }
        >
          {RESOLUTION_OPTIONS.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      <div className="field field-compact">
        <label>FPS</label>
        <select
          value={project.canvas.fps}
          onChange={(e) =>
            updateProject({
              canvas: { ...project.canvas, fps: Number(e.target.value) as ProjectState["canvas"]["fps"] },
            })
          }
        >
          {FPS_OPTIONS.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </div>
      <div className="field field-compact">
        <label>Duration (ms)</label>
        <input
          type="number"
          min={500}
          max={120000}
          step={100}
          value={durationMs}
          onChange={(e) =>
            updateProject({ scene_duration_ms: Number(e.target.value) || entry.definition.defaultDurationMs })
          }
        />
      </div>
      <label className="check-row">
        <input
          type="checkbox"
          checked={project.ui?.showSafeZones ?? false}
          onChange={(e) => updateProject({ ui: { ...project.ui, showSafeZones: e.target.checked } })}
          disabled={effectiveAspectRatioId !== "9:16"}
        />
        Safe zones (9:16)
      </label>
      {isMobileLayout && effectiveAspectRatioId !== "9:16" && (
        <p className="inspector-card-hint">Only available for 9:16 on desktop.</p>
      )}
      <label className="check-row">
        <input
          type="checkbox"
          checked={project.ui?.layoutDirection === "rtl"}
          onChange={(e) =>
            updateProject({ ui: { ...project.ui, layoutDirection: e.target.checked ? "rtl" : "ltr" } })
          }
        />
        RTL layout
      </label>
    </>
  );
}

export function CompositionInspectorBody({
  project,
  updateProject,
  composition,
  patchComposition,
  motionTimeScale,
  reducedMotion,
}: {
  project: ProjectState;
  updateProject: (patch: Partial<ProjectState> | ((prev: ProjectState) => ProjectState)) => void;
  composition: CompositionSettings;
  patchComposition: (patch: Partial<CompositionSettings>) => void;
  motionTimeScale: number;
  reducedMotion: boolean;
}) {
  return (
    <>
      <p className="inspector-card-hint">
        <strong>Intensity</strong> scales how long moves and fades take (whole scene + template layers) and how strong
        zoom-in / zoom-out is. Use <strong>Slide</strong> or <strong>Zoom</strong> enter/exit to see it clearly; pure{" "}
        <strong>Fade</strong> only changes fade speed. The chip is the live multiplier (Low ≈ 0.4×, High ≈ 1.75×; OS
        “reduce motion” compresses the range).
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center", marginBottom: 8 }}>
        <span className="chip">
          Motion ×{motionTimeScale.toFixed(2)}
          {reducedMotion ? " · OS reduced" : ""}
        </span>
      </div>
      <div className="field field-compact">
        <label htmlFor="motion-int">Motion intensity</label>
        <select
          id="motion-int"
          value={project.brand_kit.motionIntensity}
          onChange={(e) =>
            updateProject({
              brand_kit: {
                ...project.brand_kit,
                motionIntensity: e.target.value as ProjectState["brand_kit"]["motionIntensity"],
              },
            })
          }
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>
      <div className="field field-compact">
        <label htmlFor="comp-enter">Enter</label>
        <select
          id="comp-enter"
          value={composition.enterStyle}
          onChange={(e) => patchComposition({ enterStyle: e.target.value as CompositionStylePreset })}
        >
          {COMPOSITION_ENTER_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      <div className="field field-compact">
        <label htmlFor="comp-exit">Exit</label>
        <select
          id="comp-exit"
          value={composition.exitStyle}
          onChange={(e) => patchComposition({ exitStyle: e.target.value as CompositionStylePreset })}
        >
          {COMPOSITION_EXIT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      <div className="field field-compact">
        <label htmlFor="comp-x">Position X {composition.offsetXPercent}%</label>
        <input
          id="comp-x"
          type="range"
          min={-50}
          max={50}
          step={1}
          value={composition.offsetXPercent}
          onChange={(e) => patchComposition({ offsetXPercent: Number(e.target.value) })}
        />
      </div>
      <div className="field field-compact">
        <label htmlFor="comp-y">Position Y {composition.offsetYPercent}%</label>
        <input
          id="comp-y"
          type="range"
          min={-50}
          max={50}
          step={1}
          value={composition.offsetYPercent}
          onChange={(e) => patchComposition({ offsetYPercent: Number(e.target.value) })}
        />
      </div>
      <div className="field field-compact">
        <label htmlFor="comp-scale">Scale {composition.uniformScale.toFixed(2)}×</label>
        <input
          id="comp-scale"
          type="range"
          min={35}
          max={200}
          step={1}
          value={Math.round(composition.uniformScale * 100)}
          onChange={(e) => patchComposition({ uniformScale: Number(e.target.value) / 100 })}
        />
      </div>
      <button type="button" className="btn btn-compact" onClick={() => patchComposition({ ...DEFAULT_COMPOSITION })}>
        Reset composition
      </button>
    </>
  );
}

export function SceneEffectsInspectorBody({
  sceneEffects,
  patchEffects,
}: {
  sceneEffects: SceneEffectsSettings;
  patchEffects: (patch: Partial<SceneEffectsSettings>) => void;
}) {
  return (
    <>
      <p className="inspector-card-hint">Stagger targets layers in each template; glow and fire export with the preview.</p>
      <label className="check-row">
        <input
          type="checkbox"
          checked={sceneEffects.staggerEnabled}
          onChange={(e) => patchEffects({ staggerEnabled: e.target.checked })}
        />
        Stagger layers
      </label>
      <div className="field field-compact">
        <label htmlFor="fx-stagger-step">Stagger step (ms)</label>
        <input
          id="fx-stagger-step"
          type="number"
          min={20}
          max={800}
          step={10}
          value={sceneEffects.staggerStepMs}
          onChange={(e) => patchEffects({ staggerStepMs: Number(e.target.value) || 100 })}
          disabled={!sceneEffects.staggerEnabled}
        />
      </div>
      <div className="field field-compact">
        <label htmlFor="fx-stagger-blend">Stagger blend (ms)</label>
        <input
          id="fx-stagger-blend"
          type="number"
          min={40}
          max={2000}
          step={20}
          value={sceneEffects.staggerBlendMs}
          onChange={(e) => patchEffects({ staggerBlendMs: Number(e.target.value) || 380 })}
          disabled={!sceneEffects.staggerEnabled}
        />
      </div>
      <label className="check-row">
        <input
          type="checkbox"
          checked={sceneEffects.glowEnabled}
          onChange={(e) => patchEffects({ glowEnabled: e.target.checked })}
        />
        Glow
      </label>
      <div className="field field-compact">
        <label htmlFor="fx-glow-blur">Glow blur (px)</label>
        <input
          id="fx-glow-blur"
          type="number"
          min={2}
          max={80}
          step={1}
          value={sceneEffects.glowBlurPx}
          onChange={(e) => patchEffects({ glowBlurPx: Number(e.target.value) || 14 })}
          disabled={!sceneEffects.glowEnabled}
        />
      </div>
      <div className="field field-compact">
        <label htmlFor="fx-glow-spread">Glow layers</label>
        <input
          id="fx-glow-spread"
          type="number"
          min={1}
          max={8}
          step={1}
          value={sceneEffects.glowSpread}
          onChange={(e) => patchEffects({ glowSpread: Number(e.target.value) || 2 })}
          disabled={!sceneEffects.glowEnabled}
        />
      </div>
      <div className="field field-compact">
        <label htmlFor="fx-glow-color">Glow color</label>
        <input
          id="fx-glow-color"
          type="color"
          value={sceneEffects.glowColor}
          onChange={(e) => patchEffects({ glowColor: e.target.value })}
          disabled={!sceneEffects.glowEnabled}
        />
      </div>
      <label className="check-row">
        <input
          type="checkbox"
          checked={sceneEffects.fireEnabled}
          onChange={(e) => patchEffects({ fireEnabled: e.target.checked })}
        />
        Fire (particles)
      </label>
      <div className="field field-compact">
        <label htmlFor="fx-fire-int">Density</label>
        <input
          id="fx-fire-int"
          type="range"
          min={1}
          max={20}
          step={1}
          value={sceneEffects.fireIntensity}
          onChange={(e) => patchEffects({ fireIntensity: Number(e.target.value) })}
          disabled={!sceneEffects.fireEnabled}
        />
      </div>
      <div className="field field-compact">
        <label htmlFor="fx-fire-h">Height</label>
        <input
          id="fx-fire-h"
          type="range"
          min={1}
          max={10}
          step={1}
          value={sceneEffects.fireHeight}
          onChange={(e) => patchEffects({ fireHeight: Number(e.target.value) })}
          disabled={!sceneEffects.fireEnabled}
        />
      </div>
    </>
  );
}

export function LookAtmosphereInspectorBody({
  sceneEffects,
  patchEffects,
}: {
  sceneEffects: SceneEffectsSettings;
  patchEffects: (patch: Partial<SceneEffectsSettings>) => void;
}) {
  return (
    <>
      <p className="inspector-card-hint">
        Vignette, grain, sweep, and confetti sit over the full frame. Lift shadow and filters apply to the graphic layer
        (exports with preview).
      </p>
      <label className="check-row">
        <input
          type="checkbox"
          checked={sceneEffects.vignetteEnabled}
          onChange={(e) => patchEffects({ vignetteEnabled: e.target.checked })}
        />
        Vignette
      </label>
      <div className="field field-compact">
        <label htmlFor="fx-vig">Vignette strength</label>
        <input
          id="fx-vig"
          type="range"
          min={8}
          max={95}
          value={sceneEffects.vignetteStrength}
          onChange={(e) => patchEffects({ vignetteStrength: Number(e.target.value) })}
          disabled={!sceneEffects.vignetteEnabled}
        />
      </div>
      <label className="check-row">
        <input
          type="checkbox"
          checked={sceneEffects.grainEnabled}
          onChange={(e) => patchEffects({ grainEnabled: e.target.checked })}
        />
        Film grain
      </label>
      <div className="field field-compact">
        <label htmlFor="fx-grain">Grain opacity</label>
        <input
          id="fx-grain"
          type="range"
          min={4}
          max={55}
          value={sceneEffects.grainOpacity}
          onChange={(e) => patchEffects({ grainOpacity: Number(e.target.value) })}
          disabled={!sceneEffects.grainEnabled}
        />
      </div>
      <label className="check-row">
        <input
          type="checkbox"
          checked={sceneEffects.liftShadowEnabled}
          onChange={(e) => patchEffects({ liftShadowEnabled: e.target.checked })}
        />
        Lift shadow
      </label>
      <div className="field field-compact">
        <label htmlFor="fx-lift-blur">Shadow blur</label>
        <input
          id="fx-lift-blur"
          type="range"
          min={6}
          max={80}
          value={sceneEffects.liftShadowBlur}
          onChange={(e) => patchEffects({ liftShadowBlur: Number(e.target.value) })}
          disabled={!sceneEffects.liftShadowEnabled}
        />
      </div>
      <div className="field field-compact">
        <label htmlFor="fx-lift-op">Shadow opacity</label>
        <input
          id="fx-lift-op"
          type="range"
          min={8}
          max={90}
          value={sceneEffects.liftShadowOpacity}
          onChange={(e) => patchEffects({ liftShadowOpacity: Number(e.target.value) })}
          disabled={!sceneEffects.liftShadowEnabled}
        />
      </div>
      <label className="check-row">
        <input
          type="checkbox"
          checked={sceneEffects.lightSweepEnabled}
          onChange={(e) => patchEffects({ lightSweepEnabled: e.target.checked })}
        />
        Light sweep
      </label>
      <div className="field field-compact">
        <label htmlFor="fx-sweep-op">Sweep opacity</label>
        <input
          id="fx-sweep-op"
          type="range"
          min={5}
          max={70}
          value={sceneEffects.lightSweepOpacity}
          onChange={(e) => patchEffects({ lightSweepOpacity: Number(e.target.value) })}
          disabled={!sceneEffects.lightSweepEnabled}
        />
      </div>
      <label className="check-row">
        <input
          type="checkbox"
          checked={sceneEffects.confettiEnabled}
          onChange={(e) => patchEffects({ confettiEnabled: e.target.checked })}
        />
        Confetti
      </label>
      <div className="field field-compact">
        <label htmlFor="fx-conf">Confetti amount</label>
        <input
          id="fx-conf"
          type="range"
          min={1}
          max={18}
          value={sceneEffects.confettiIntensity}
          onChange={(e) => patchEffects({ confettiIntensity: Number(e.target.value) })}
          disabled={!sceneEffects.confettiEnabled}
        />
      </div>
      <label className="check-row">
        <input
          type="checkbox"
          checked={sceneEffects.chromaticEnabled}
          onChange={(e) => patchEffects({ chromaticEnabled: e.target.checked })}
        />
        Chromatic aberration
      </label>
      <div className="field field-compact">
        <label htmlFor="fx-chrome">Fringe (px)</label>
        <input
          id="fx-chrome"
          type="range"
          min={1}
          max={60}
          step={1}
          value={Math.round(sceneEffects.chromaticAmount * 10)}
          onChange={(e) => patchEffects({ chromaticAmount: Number(e.target.value) / 10 })}
          disabled={!sceneEffects.chromaticEnabled}
        />
      </div>
      <div className="field field-compact">
        <label htmlFor="fx-sat">Saturation {sceneEffects.gradeSaturation}%</label>
        <input
          id="fx-sat"
          type="range"
          min={60}
          max={160}
          value={sceneEffects.gradeSaturation}
          onChange={(e) => patchEffects({ gradeSaturation: Number(e.target.value) })}
        />
      </div>
      <div className="field field-compact">
        <label htmlFor="fx-con">Contrast {sceneEffects.gradeContrast}%</label>
        <input
          id="fx-con"
          type="range"
          min={70}
          max={140}
          value={sceneEffects.gradeContrast}
          onChange={(e) => patchEffects({ gradeContrast: Number(e.target.value) })}
        />
      </div>
    </>
  );
}

export function BrandInspectorBody({
  project,
  updateProject,
}: {
  project: ProjectState;
  updateProject: (patch: Partial<ProjectState> | ((prev: ProjectState) => ProjectState)) => void;
}) {
  return (
    <>
      {(
        [
          ["primary", "Primary"],
          ["secondary", "Secondary"],
          ["surface", "Surface"],
          ["onSurface", "On surface"],
          ["accent", "Accent"],
          ["muted", "Muted"],
        ] as const
      ).map(([key, label]) => (
        <div className="field field-compact" key={key}>
          <label>{label}</label>
          <input
            type="color"
            value={project.brand_kit.colors[key]}
            onChange={(e) =>
              updateProject({
                brand_kit: { ...project.brand_kit, colors: { ...project.brand_kit.colors, [key]: e.target.value } },
              })
            }
          />
        </div>
      ))}
      <div className="field field-compact">
        <label>Display font</label>
        <select
          value={project.brand_kit.typography.display.fontId}
          onChange={(e) =>
            updateProject({
              brand_kit: {
                ...project.brand_kit,
                typography: {
                  ...project.brand_kit.typography,
                  display: { ...project.brand_kit.typography.display, fontId: e.target.value },
                },
              },
            })
          }
        >
          {FONT_CATALOG.map((f) => (
            <option key={f.id} value={f.id}>
              {f.label}
            </option>
          ))}
        </select>
      </div>
      <div className="field field-compact">
        <label>Body font</label>
        <select
          value={project.brand_kit.typography.body.fontId}
          onChange={(e) =>
            updateProject({
              brand_kit: {
                ...project.brand_kit,
                typography: {
                  ...project.brand_kit.typography,
                  body: { ...project.brand_kit.typography.body, fontId: e.target.value },
                },
              },
            })
          }
        >
          {FONT_CATALOG.map((f) => (
            <option key={f.id} value={f.id}>
              {f.label}
            </option>
          ))}
        </select>
      </div>
      <div className="field field-compact">
        <label>Accent font</label>
        <select
          value={project.brand_kit.typography.accent.fontId}
          onChange={(e) =>
            updateProject({
              brand_kit: {
                ...project.brand_kit,
                typography: {
                  ...project.brand_kit.typography,
                  accent: { ...project.brand_kit.typography.accent, fontId: e.target.value },
                },
              },
            })
          }
        >
          {FONT_CATALOG.map((f) => (
            <option key={f.id} value={f.id}>
              {f.label}
            </option>
          ))}
        </select>
      </div>
      <div className="field field-compact">
        <label>Font scale</label>
        <input
          type="number"
          step={0.05}
          min={0.5}
          max={2}
          value={project.brand_kit.fontScale}
          onChange={(e) =>
            updateProject({ brand_kit: { ...project.brand_kit, fontScale: Number(e.target.value) || 1 } })
          }
        />
      </div>
    </>
  );
}

export function OverridesInspectorBody({
  project,
  updateProject,
}: {
  project: ProjectState;
  updateProject: (patch: Partial<ProjectState> | ((prev: ProjectState) => ProjectState)) => void;
}) {
  return (
    <>
      <p className="inspector-card-hint">Per-template accent (does not change the global kit).</p>
      <div className="field field-compact">
        <label>Accent override</label>
        <input
          type="color"
          value={project.template_overrides?.colors?.accent ?? project.brand_kit.colors.accent}
          onChange={(e) =>
            updateProject({
              template_overrides: {
                ...project.template_overrides,
                colors: { ...project.template_overrides?.colors, accent: e.target.value },
              },
            })
          }
        />
      </div>
      <button type="button" className="btn btn-compact" onClick={() => updateProject({ template_overrides: {} })}>
        Clear overrides
      </button>
    </>
  );
}

export function FieldsInspectorBody({
  project,
  updateProject,
  entry,
  validationIssues,
}: {
  project: ProjectState;
  updateProject: (patch: Partial<ProjectState> | ((prev: ProjectState) => ProjectState)) => void;
  entry: TemplateEntry;
  validationIssues: { key: string; message: string }[];
}) {
  const textKeys = new Set(entry.definition.fields.filter((f) => f.type === "text").map((f) => f.key));
  const inspectorIssues = validationIssues.filter((i) => !textKeys.has(i.key));
  const nonTextFields = entry.definition.fields.filter((f) => f.type !== "text");

  return (
    <>
      {inspectorIssues.length > 0 && (
        <div className="error-banner">
          {inspectorIssues.map((i) => (
            <div key={i.key}>
              {i.key}: {i.message}
            </div>
          ))}
        </div>
      )}
      {nonTextFields.map((f) => (
        <div className="field field-compact" key={f.key}>
          <label htmlFor={`f-${f.key}`}>{f.label}</label>
          {f.type === "color" && (
            <input
              id={`f-${f.key}`}
              type="color"
              value={String(project.field_values[f.key] ?? "#000000")}
              onChange={(e) =>
                updateProject({
                  field_values: { ...project.field_values, [f.key]: e.target.value } as FieldValues,
                })
              }
            />
          )}
          {f.type === "number" && (
            <input
              id={`f-${f.key}`}
              type="number"
              min={f.min}
              max={f.max}
              value={Number(project.field_values[f.key] ?? f.default)}
              onChange={(e) =>
                updateProject({
                  field_values: { ...project.field_values, [f.key]: Number(e.target.value) } as FieldValues,
                })
              }
            />
          )}
          {f.type === "boolean" && (
            <label className="check-row" style={{ marginBottom: 0 }}>
              <input
                id={`f-${f.key}`}
                type="checkbox"
                checked={Boolean(project.field_values[f.key])}
                onChange={(e) =>
                  updateProject({
                    field_values: { ...project.field_values, [f.key]: e.target.checked } as FieldValues,
                  })
                }
              />
              On
            </label>
          )}
          {f.type === "enum" && f.options && (
            <select
              id={`f-${f.key}`}
              value={String(project.field_values[f.key] ?? f.default)}
              onChange={(e) =>
                updateProject({
                  field_values: { ...project.field_values, [f.key]: e.target.value } as FieldValues,
                })
              }
            >
              {f.options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          )}
        </div>
      ))}
    </>
  );
}

export function ProjectFilesInspectorBody({
  exportJson,
  importJson,
  saveError,
  onLicenses,
}: {
  exportJson: () => void;
  importJson: () => void;
  saveError: string | null;
  onLicenses: () => void;
}) {
  return (
    <>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
        <button type="button" className="btn" onClick={exportJson}>
          Export project JSON
        </button>
        <button type="button" className="btn" onClick={importJson}>
          Import project JSON
        </button>
        <span className="chip">Autosave: IndexedDB</span>
        {saveError && <span className="save-warn">{saveError}</span>}
      </div>
      <button type="button" className="btn btn-compact" onClick={onLicenses}>
        Licenses / notices
      </button>
    </>
  );
}
