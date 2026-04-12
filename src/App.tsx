import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ASPECT_RATIO_OPTIONS, FPS_OPTIONS, getCanvasPixels, RESOLUTION_OPTIONS } from "./canvas/presets";
import { runExport, waitForRenderReady } from "./export/pipelines";
import { buildObsHtml } from "./export/htmlObs";
import {
  COMPOSITION_ENTER_OPTIONS,
  COMPOSITION_EXIT_OPTIONS,
  DEFAULT_COMPOSITION,
  getCompositionLayerStyle,
  sanitizeComposition,
} from "./engine/compositionMotion";
import { buildCompositionFilter, buildLiftBoxShadow, sanitizeSceneEffects } from "./engine/sceneEffects";
import { motionScale, resolveTheme } from "./engine/resolveTheme";
import { FONT_CATALOG } from "./fonts/catalog";
import { hydrateProject } from "./project/hydrate";
import { validateFields } from "./project/validate";
import { loadProject, saveProject } from "./storage/projectDb";
import { ConfettiCanvas } from "./components/ConfettiCanvas";
import { FireCanvas } from "./components/FireCanvas";
import { GrainCanvas } from "./components/GrainCanvas";
import { LightSweepCanvas } from "./components/LightSweepCanvas";
import { VignetteOverlay } from "./components/VignetteOverlay";
import { InspectorCard } from "./components/InspectorCard";
import { SafeZonesOverlay } from "./components/SafeZonesOverlay";
import { StaggerShell } from "./components/StaggerShell";
import { isChromiumBased } from "./app/browserSupport";
import { allTemplateEntries, getTemplateEntry } from "./templates/registry";
import { DEFAULT_BRAND_KIT } from "./brand/defaultKit";
import { mergeFieldDefaults } from "./project/defaults";
import type {
  CompositionSettings,
  CompositionStylePreset,
  ExportFormatId,
  FieldValues,
  ProjectState,
  SceneEffectsSettings,
} from "./types";
import "./styles.css";

function downloadBlob(blob: Blob, filename: string) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

export default function App() {
  const supported = isChromiumBased();
  const [project, setProject] = useState<ProjectState | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [timeMs, setTimeMs] = useState(0);
  /** Loops while true; only Stop (or Pause) halts playback */
  const [playing, setPlaying] = useState(true);
  const [validationIssues, setValidationIssues] = useState<{ key: string; message: string }[]>([]);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormatId>("png_zip");
  const [flatMode, setFlatMode] = useState<"transparent" | "solid" | "gradient">("transparent");
  const [flatColor, setFlatColor] = useState("#0f172a");
  const [flatColor2, setFlatColor2] = useState("#1e293b");
  const [exportProgress, setExportProgress] = useState<{ phase: string; current: number; total: number } | null>(null);
  const exportAbortRef = useRef<AbortController | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number>(0);
  const lastTsRef = useRef<number>(0);

  const reducedMotion = useMemo(
    () => typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );

  useEffect(() => {
    void (async () => {
      const stored = await loadProject();
      setProject(hydrateProject(stored ?? undefined));
      setLoaded(true);
    })();
  }, []);

  const persist = useCallback((p: ProjectState) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      void (async () => {
        try {
          setSaveError(null);
          await saveProject({ ...p, updated_at: new Date().toISOString() });
        } catch (e) {
          const msg = e instanceof Error ? e.message : "Save failed";
          setSaveError(
            `${msg}. Export project JSON as backup, or clear site data for this origin if quota is full.`,
          );
        }
      })();
    }, 450);
  }, []);

  const updateProject = useCallback(
    (patch: Partial<ProjectState> | ((prev: ProjectState) => ProjectState)) => {
      setProject((prev) => {
        if (!prev) return prev;
        const next = typeof patch === "function" ? patch(prev) : { ...prev, ...patch, updated_at: new Date().toISOString() };
        persist(next);
        return next;
      });
    },
    [persist],
  );

  useEffect(() => {
    if (!project || !loaded) return;
    const entry = getTemplateEntry(project.template_id);
    if (!entry) return;
    setValidationIssues(validateFields(entry.definition.fields, project.field_values));
  }, [project, loaded]);

  const entry = project ? getTemplateEntry(project.template_id) : undefined;
  const pixels = project
    ? getCanvasPixels(project.canvas.aspectRatioId, project.canvas.resolutionId)
    : { width: 1920, height: 1080 };

  const durationMs =
    project?.scene_duration_ms ?? entry?.definition.defaultDurationMs ?? 5000;

  const theme = useMemo(() => {
    if (!project) return resolveTheme(DEFAULT_BRAND_KIT);
    return resolveTheme(project.brand_kit, project.template_overrides);
  }, [project]);

  const composition: CompositionSettings = useMemo(
    () => sanitizeComposition(project?.ui?.composition),
    [project?.ui?.composition],
  );

  const motionTimeScale = useMemo(
    () => (project ? motionScale(theme, reducedMotion) : 1),
    [project, theme, reducedMotion],
  );

  const compositionLayerStyle = useMemo(
    () =>
      getCompositionLayerStyle(
        timeMs,
        durationMs,
        pixels.width,
        pixels.height,
        composition,
        motionTimeScale,
        reducedMotion,
      ),
    [timeMs, durationMs, pixels.width, pixels.height, composition, motionTimeScale, reducedMotion],
  );

  const patchComposition = useCallback(
    (patch: Partial<CompositionSettings>) => {
      if (!project) return;
      updateProject({
        ui: {
          ...project.ui,
          composition: sanitizeComposition({ ...project.ui?.composition, ...patch }),
        },
      });
    },
    [project, updateProject],
  );

  const sceneEffects: SceneEffectsSettings = useMemo(
    () => sanitizeSceneEffects(project?.ui?.effects),
    [project?.ui?.effects],
  );

  const patchEffects = useCallback(
    (patch: Partial<SceneEffectsSettings>) => {
      if (!project) return;
      updateProject({
        ui: {
          ...project.ui,
          effects: sanitizeSceneEffects({ ...project.ui?.effects, ...patch }),
        },
      });
    },
    [project, updateProject],
  );

  const fireAccent =
    project?.template_overrides?.colors?.accent ?? project?.brand_kit.colors.accent ?? "#22d3ee";

  const compositionFilterCss = useMemo(() => buildCompositionFilter(sceneEffects), [sceneEffects]);
  const liftShadowCss = useMemo(() => buildLiftBoxShadow(sceneEffects), [sceneEffects]);

  useEffect(() => {
    if (!playing || !project) {
      lastTsRef.current = 0;
      return;
    }
    const tick = (ts: number) => {
      if (!lastTsRef.current) lastTsRef.current = ts;
      const dt = ts - lastTsRef.current;
      lastTsRef.current = ts;
      setTimeMs((t) => {
        const n = t + dt;
        const d = Math.max(1, durationMs);
        return n % d;
      });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [playing, project, durationMs]);

  const seekTimeMs = useCallback(
    async (t: number) => {
      setTimeMs(Math.min(durationMs, Math.max(0, t)));
      await waitForRenderReady();
    },
    [durationMs],
  );

  const handleExport = useCallback(async () => {
    if (!project || !entry || !previewRef.current) return;
    const issues = validateFields(entry.definition.fields, project.field_values);
    if (issues.length) {
      setValidationIssues(issues);
      return;
    }
    const node = previewRef.current;
    const flatBackground =
      flatMode === "transparent"
        ? { mode: "transparent" as const }
        : flatMode === "solid"
          ? { mode: "solid" as const, color: flatColor }
          : { mode: "gradient" as const, color: flatColor, color2: flatColor2 };

    if (exportFormat === "html_obs") {
      const html = buildObsHtml(
        entry.definition.id,
        project.field_values,
        theme,
        pixels.width,
        pixels.height,
        durationMs,
      );
      if (!html) {
        alert("HTML (OBS) export is available for Minimal lower third and Subscribe CTA templates.");
        return;
      }
      const blob = new Blob([html], { type: "text/html" });
      downloadBlob(blob, `obs_${entry.definition.id}.html`);
      updateProject({
        export_defaults: { ...project.export_defaults, lastFormat: exportFormat },
      });
      setExportOpen(false);
      return;
    }

    if (exportFormat === "ffmpeg_wasm_stub") {
      alert(
        "Advanced ffmpeg.wasm pipelines are not bundled in v1. Use PNG sequence and stitch locally, or extend the app with a lazy-loaded WASM build.",
      );
      return;
    }

    exportAbortRef.current = new AbortController();
    setExportProgress({ phase: "Starting", current: 0, total: 1 });
    try {
      const { blob, filename, readme } = await runExport({
        node,
        width: pixels.width,
        height: pixels.height,
        fps: project.canvas.fps,
        durationMs,
        format: exportFormat,
        flatBackground,
        seekTimeMs,
        signal: exportAbortRef.current.signal,
        onProgress: setExportProgress,
      });
      downloadBlob(blob, filename);
      const readmeBlob = new Blob([readme], { type: "text/plain" });
      downloadBlob(readmeBlob, filename.replace(/\.[^.]+$/, "_readme.txt"));
      updateProject({
        export_defaults: { ...project.export_defaults, lastFormat: exportFormat, flatBackground: flatMode },
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      alert(`Export failed: ${msg}`);
    } finally {
      setExportProgress(null);
      exportAbortRef.current = null;
    }
    setExportOpen(false);
  }, [
    project,
    entry,
    flatMode,
    flatColor,
    flatColor2,
    exportFormat,
    pixels.width,
    pixels.height,
    durationMs,
    theme,
    seekTimeMs,
    updateProject,
  ]);

  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      if (ev.target instanceof HTMLInputElement || ev.target instanceof HTMLTextAreaElement) return;
      if (ev.code === "Space") {
        ev.preventDefault();
        setPlaying((p) => !p);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const importJson = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.onchange = () => {
      const f = input.files?.[0];
      if (!f) return;
      void f.text().then((txt) => {
        try {
          const data = JSON.parse(txt) as unknown;
          setProject(hydrateProject(data));
          setTimeMs(0);
          setPlaying(true);
        } catch {
          alert("Invalid JSON project file.");
        }
      });
    };
    input.click();
  }, []);

  const exportJson = useCallback(() => {
    if (!project) return;
    const blob = new Blob([JSON.stringify(project, null, 2)], { type: "application/json" });
    downloadBlob(blob, `motion-project-${project.id.slice(0, 8)}.json`);
  }, [project]);

  if (!supported) {
    return (
      <div style={{ padding: 32, maxWidth: 560, margin: "10vh auto", fontFamily: "system-ui,sans-serif" }}>
        <h1 style={{ fontSize: 22 }}>Chromium-based browser required</h1>
        <p style={{ color: "#555", lineHeight: 1.6 }}>
          This motion graphics generator targets the latest Chrome, Edge, or Brave (Chromium). Safari and Firefox are
          not supported in v1. Open this page in a supported browser to continue.
        </p>
      </div>
    );
  }

  if (!loaded || !project || !entry) {
    return <div style={{ padding: 24 }}>Loading…</div>;
  }

  const categories = Array.from(new Set(allTemplateEntries().map((e) => e.definition.category))).sort();
  const filterCat = project.ui?.categoryFilter ?? "";
  const search = (project.ui?.search ?? "").toLowerCase();
  const filtered = allTemplateEntries().filter((e) => {
    const d = e.definition;
    if (filterCat && d.category !== filterCat) return false;
    if (!search) return true;
    const hay = `${d.name} ${d.description} ${d.tags.join(" ")}`.toLowerCase();
    return hay.includes(search);
  });

  const scale = Math.min(1, Math.min(920 / pixels.width, 620 / pixels.height));

  const TemplateComponent = entry.Component;

  return (
    <div className="app-shell">
      <aside className="panel panel-left" style={{ padding: 10 }}>
        <h2>Templates</h2>
        <div className="filters-row">
          <div className="field field-compact">
            <label htmlFor="cat">Category</label>
            <select
              id="cat"
              value={filterCat}
              onChange={(e) => updateProject({ ui: { ...project.ui, categoryFilter: e.target.value || undefined } })}
            >
              <option value="">All</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="field field-compact">
            <label htmlFor="q">Search</label>
            <input
              id="q"
              type="text"
              placeholder="Tags…"
              value={project.ui?.search ?? ""}
              onChange={(e) => updateProject({ ui: { ...project.ui, search: e.target.value } })}
            />
          </div>
        </div>

        <div style={{ marginTop: 10 }}>
          {filtered.map((e) => (
            <button
              key={e.definition.id}
              type="button"
              className={`gallery-item${e.definition.id === project.template_id ? " active" : ""}`}
              onClick={() => {
                const d = e.definition;
                updateProject((prev) => ({
                  ...prev,
                  template_id: d.id,
                  template_definition_version: d.version,
                  field_values: mergeFieldDefaults(d, prev.field_values),
                  scene_duration_ms: undefined,
                }));
                setTimeMs(0);
                setPlaying(true);
              }}
            >
              <div className="g-name">{e.definition.name}</div>
              <div className="g-meta">
                {e.definition.category} · {e.definition.defaultDurationMs / 1000}s
              </div>
            </button>
          ))}
        </div>
      </aside>

      <main className="preview-column">
        <div className="preview-toolbar">
          <span className="chip">
            {pixels.width}×{pixels.height} · {project.canvas.aspectRatioId} · {project.canvas.fps}fps
          </span>
          <button type="button" className="btn btn-primary" onClick={() => setPlaying((p) => !p)}>
            {playing ? "Pause" : "Play"}
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => {
              setTimeMs(0);
              setPlaying(false);
            }}
          >
            Stop
          </button>
          <button type="button" className="btn" onClick={() => setExportOpen(true)}>
            Export…
          </button>
        </div>
        <div className="preview-stage-wrap">
          <div
            style={{
              width: pixels.width * scale,
              height: pixels.height * scale,
              position: "relative",
              borderRadius: 12,
              boxShadow: "0 24px 80px rgba(0,0,0,0.45)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: pixels.width,
                height: pixels.height,
                transform: `scale(${scale})`,
                transformOrigin: "top left",
                background: "transparent",
              }}
            >
              <div
                ref={previewRef}
                data-export-root="1"
                dir={project.ui?.layoutDirection === "rtl" ? "rtl" : "ltr"}
                style={{
                  width: pixels.width,
                  height: pixels.height,
                  position: "relative",
                  background: "transparent",
                  overflow: "hidden",
                  color: theme.colors.onSurface,
                }}
              >
                {/* Editor-only: shows alpha; omitted from PNG/WebM/GIF capture via html-to-image filter */}
                <div
                  data-export-ignore="1"
                  aria-hidden
                  style={{
                    position: "absolute",
                    inset: 0,
                    zIndex: 0,
                    backgroundColor: "#1e1e1e",
                    backgroundImage: `
                      linear-gradient(45deg, #333 25%, transparent 25%),
                      linear-gradient(-45deg, #333 25%, transparent 25%),
                      linear-gradient(45deg, transparent 75%, #333 75%),
                      linear-gradient(-45deg, transparent 75%, #333 75%)`,
                    backgroundSize: "12px 12px",
                    backgroundPosition: "0 0, 0 6px, 6px -6px, -6px 0",
                  }}
                />
                <div style={compositionLayerStyle}>
                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                      height: "100%",
                      ...(compositionFilterCss ? { filter: compositionFilterCss } : {}),
                      ...(liftShadowCss ? { boxShadow: liftShadowCss } : {}),
                    }}
                  >
                    {sceneEffects.fireEnabled && (
                      <FireCanvas
                        width={pixels.width}
                        height={pixels.height}
                        intensity={sceneEffects.fireIntensity}
                        heightFactor={sceneEffects.fireHeight}
                        accentColor={fireAccent}
                        playing={playing}
                      />
                    )}
                    <StaggerShell
                      enabled={sceneEffects.staggerEnabled}
                      timeMs={timeMs}
                      durationMs={durationMs}
                      stepMs={sceneEffects.staggerStepMs}
                      blendMs={sceneEffects.staggerBlendMs}
                      motionTimeScale={motionTimeScale}
                      templateId={project.template_id}
                    >
                      <TemplateComponent
                        definition={entry.definition}
                        fields={project.field_values}
                        theme={theme}
                        timeMs={timeMs}
                        durationMs={durationMs}
                        reducedMotion={reducedMotion}
                        motionTimeScale={motionTimeScale}
                        layoutDirection={project.ui?.layoutDirection === "rtl" ? "rtl" : "ltr"}
                      />
                    </StaggerShell>
                  </div>
                </div>
                {(sceneEffects.vignetteEnabled ||
                  sceneEffects.grainEnabled ||
                  sceneEffects.lightSweepEnabled ||
                  sceneEffects.confettiEnabled) && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      pointerEvents: "none",
                      zIndex: 4,
                    }}
                  >
                    {sceneEffects.vignetteEnabled && (
                      <VignetteOverlay strength={sceneEffects.vignetteStrength} />
                    )}
                    {sceneEffects.grainEnabled && (
                      <GrainCanvas
                        width={pixels.width}
                        height={pixels.height}
                        opacity={sceneEffects.grainOpacity}
                        playing={playing}
                        timeMs={timeMs}
                      />
                    )}
                    {sceneEffects.lightSweepEnabled && (
                      <LightSweepCanvas
                        width={pixels.width}
                        height={pixels.height}
                        opacity={sceneEffects.lightSweepOpacity}
                        timeMs={timeMs}
                        durationMs={durationMs}
                        playing={playing}
                      />
                    )}
                    {sceneEffects.confettiEnabled && (
                      <ConfettiCanvas
                        width={pixels.width}
                        height={pixels.height}
                        intensity={sceneEffects.confettiIntensity}
                        playing={playing}
                      />
                    )}
                  </div>
                )}
                {project.ui?.showSafeZones && project.canvas.aspectRatioId === "9:16" && (
                  <SafeZonesOverlay width={pixels.width} height={pixels.height} />
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <aside className="panel panel-right">
        <div className="panel-right-inner">
          <InspectorCard title="Canvas" defaultOpen>
            <div className="field field-compact">
              <label>Aspect</label>
              <select
                value={project.canvas.aspectRatioId}
                onChange={(e) =>
                  updateProject({
                    canvas: {
                      ...project.canvas,
                      aspectRatioId: e.target.value as ProjectState["canvas"]["aspectRatioId"],
                    },
                  })
                }
              >
                {ASPECT_RATIO_OPTIONS.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
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
                disabled={project.canvas.aspectRatioId !== "9:16"}
              />
              Safe zones (9:16)
            </label>
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
          </InspectorCard>

          <InspectorCard title="Composition & motion" defaultOpen>
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
          </InspectorCard>

          <InspectorCard title="Scene effects">
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
          </InspectorCard>

          <InspectorCard title="Look & atmosphere">
            <p className="inspector-card-hint">
              Vignette, grain, sweep, and confetti sit over the full frame. Lift shadow and filters apply to the graphic
              layer (exports with preview).
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
          </InspectorCard>

          <InspectorCard title="Brand & colors">
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
          </InspectorCard>

          <InspectorCard title="Overrides">
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
          </InspectorCard>

          <InspectorCard title={`Fields · ${entry.definition.name}`} defaultOpen>
            {validationIssues.length > 0 && (
              <div className="error-banner">
                {validationIssues.map((i) => (
                  <div key={i.key}>
                    {i.key}: {i.message}
                  </div>
                ))}
              </div>
            )}
            {entry.definition.fields.map((f) => (
              <div className="field field-compact" key={f.key}>
                <label htmlFor={`f-${f.key}`}>{f.label}</label>
                {f.type === "text" && (
                  <input
                    id={`f-${f.key}`}
                    type="text"
                    maxLength={f.maxLength}
                    value={String(project.field_values[f.key] ?? "")}
                    onChange={(e) =>
                      updateProject({
                        field_values: { ...project.field_values, [f.key]: e.target.value } as FieldValues,
                      })
                    }
                  />
                )}
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
          </InspectorCard>
        </div>
      </aside>

      <footer className="bottom-bar">
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
        <button type="button" className="btn" onClick={() => alert("See THIRD_PARTY_NOTICES.md in the repository for font and icon attribution.")}>
          Licenses / notices
        </button>
      </footer>

      {exportOpen && (
        <div
          role="dialog"
          aria-modal
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: 16,
          }}
        >
          <div
            style={{
              width: "min(440px, 100%)",
              background: "#0f141f",
              border: "1px solid var(--border)",
              borderRadius: 14,
              padding: 18,
              boxShadow: "0 30px 100px rgba(0,0,0,0.5)",
            }}
          >
            <h2 style={{ marginTop: 0 }}>Export</h2>
            <div className="field">
              <label>Format</label>
              <select value={exportFormat} onChange={(e) => setExportFormat(e.target.value as ExportFormatId)}>
                <option value="png_zip">PNG sequence (ZIP)</option>
                <option value="webm">WebM (alpha attempted if transparent)</option>
                <option value="mp4">MP4 / flat (uses recorder codec)</option>
                <option value="gif">GIF (256 colors)</option>
                <option value="html_obs">HTML for OBS (subset of templates)</option>
                <option value="ffmpeg_wasm_stub">Advanced: ffmpeg.wasm (stub)</option>
              </select>
            </div>
            {(exportFormat === "mp4" || exportFormat === "gif" || exportFormat === "png_zip") && (
              <>
                <div className="field">
                  <label>Background</label>
                  <select value={flatMode} onChange={(e) => setFlatMode(e.target.value as typeof flatMode)}>
                    <option value="transparent">Transparent (PNG/WebM only where supported)</option>
                    <option value="solid">Solid</option>
                    <option value="gradient">Gradient (first color dominant in PNG/GIF)</option>
                  </select>
                </div>
                {(flatMode === "solid" || flatMode === "gradient") && (
                  <div className="field">
                    <label>Color A</label>
                    <input type="color" value={flatColor} onChange={(e) => setFlatColor(e.target.value)} />
                  </div>
                )}
                {flatMode === "gradient" && (
                  <div className="field">
                    <label>Color B</label>
                    <input type="color" value={flatColor2} onChange={(e) => setFlatColor2(e.target.value)} />
                  </div>
                )}
              </>
            )}
            {exportFormat === "webm" && (
              <div className="field">
                <label>Background</label>
                <select value={flatMode} onChange={(e) => setFlatMode(e.target.value as typeof flatMode)}>
                  <option value="transparent">Transparent (verify in NLE)</option>
                  <option value="solid">Solid backing</option>
                  <option value="gradient">Gradient backing</option>
                </select>
              </div>
            )}
            <p style={{ fontSize: 12, color: "var(--muted)" }}>
              Export captures the preview at {pixels.width}×{pixels.height}. Large 4K GIF/PNG runs can use significant
              memory; prefer PNG ZIP for compositing when in doubt.
            </p>
            {exportProgress && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 12, marginBottom: 6 }}>
                  {exportProgress.phase} · {exportProgress.current}/{exportProgress.total}
                </div>
                <div style={{ height: 6, background: "#1e293b", borderRadius: 99 }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${Math.round((exportProgress.current / Math.max(1, exportProgress.total)) * 100)}%`,
                      background: "var(--accent)",
                      borderRadius: 99,
                    }}
                  />
                </div>
              </div>
            )}
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
              <button type="button" className="btn" onClick={() => setExportOpen(false)}>
                Close
              </button>
              {exportProgress ? (
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    exportAbortRef.current?.abort();
                  }}
                >
                  Cancel
                </button>
              ) : (
                <button type="button" className="btn btn-primary" onClick={() => void handleExport()}>
                  Start export
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
