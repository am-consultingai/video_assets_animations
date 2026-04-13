import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { ASPECT_RATIO_OPTIONS, getCanvasPixels } from "./canvas/presets";
import { runExport, waitForRenderReady } from "./export/pipelines";
import { buildObsHtml } from "./export/htmlObs";
import { getCompositionLayerStyle, sanitizeComposition } from "./engine/compositionMotion";
import { buildCompositionFilter, buildLiftBoxShadow, sanitizeSceneEffects } from "./engine/sceneEffects";
import { motionScale, resolveTheme } from "./engine/resolveTheme";
import { hydrateProject } from "./project/hydrate";
import { validateFields } from "./project/validate";
import { loadProject, saveProject } from "./storage/projectDb";
import { InspectorCard } from "./components/InspectorCard";
import { TemplateTextFieldsDock } from "./components/TemplateTextFieldsDock";
import { Toast } from "./components/Toast";
import { isChromiumBased } from "./app/browserSupport";
import { useMobileLayout } from "./hooks/useMobileLayout";
import {
  BrandInspectorBody,
  CanvasInspectorBody,
  CompositionInspectorBody,
  FieldsInspectorBody,
  LookAtmosphereInspectorBody,
  OverridesInspectorBody,
  ProjectFilesInspectorBody,
  SceneEffectsInspectorBody,
} from "./inspector/InspectorBodies";
import { MobileShell } from "./mobile/MobileShell";
import type { MobileAdjustSectionId } from "./mobile/adjustSections";
import { PreviewPanel } from "./panels/PreviewPanel";
import { TemplatesPanel } from "./panels/TemplatesPanel";
import { allTemplateEntries, getTemplateEntry } from "./templates/registry";
import { DEFAULT_BRAND_KIT } from "./brand/defaultKit";
import type { CompositionSettings, ExportFormatId, ProjectState, SceneEffectsSettings } from "./types";
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

  const isMobileLayout = useMobileLayout();
  const [mobileTemplatesOpen, setMobileTemplatesOpen] = useState(false);
  const [mobileAdjustOpen, setMobileAdjustOpen] = useState(false);
  const [mobileAdjustSection, setMobileAdjustSection] = useState<MobileAdjustSectionId | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [textDockAttentionKey, setTextDockAttentionKey] = useState(0);

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
  const effectiveAspectRatioId = project
    ? isMobileLayout
      ? ("1:1" as const)
      : project.canvas.aspectRatioId
    : ("16:9" as const);
  const pixels = project
    ? getCanvasPixels(isMobileLayout ? "1:1" : project.canvas.aspectRatioId, project.canvas.resolutionId)
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

  const dismissToast = useCallback(() => setToastMessage(null), []);
  const nudgeTextDockAttention = useCallback(() => {
    setTextDockAttentionKey((k) => k + 1);
  }, []);
  const onDesktopOnlyAspectToast = useCallback(() => {
    setToastMessage("Aspect ratio changes are available on desktop.");
  }, []);

  const handleExport = useCallback(async () => {
    if (!project || !entry || !previewRef.current) return;
    const issues = validateFields(entry.definition.fields, project.field_values);
    if (issues.length) {
      setValidationIssues(issues);
      return;
    }
    if (isMobileLayout) {
      flushSync(() => {
        setMobileTemplatesOpen(false);
        setMobileAdjustOpen(false);
      });
    }
    await waitForRenderReady();
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
    isMobileLayout,
  ]);

  const openExportModal = useCallback(() => {
    if (isMobileLayout) {
      setToastMessage("Export is only available on desktop.");
      return;
    }
    setExportOpen(true);
  }, [isMobileLayout]);

  const closeMobileMenus = useCallback(() => {
    setMobileTemplatesOpen(false);
    setMobileAdjustOpen(false);
    setMobileAdjustSection(null);
  }, []);

  const toggleMobileTemplates = useCallback(() => {
    setMobileTemplatesOpen((was) => {
      if (was) return false;
      setMobileAdjustOpen(false);
      return true;
    });
  }, []);

  const toggleMobileAdjust = useCallback(() => {
    setMobileAdjustOpen((was) => {
      if (was) {
        setMobileAdjustSection(null);
        return false;
      }
      setMobileTemplatesOpen(false);
      return true;
    });
  }, []);

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

  const storedAspectLabel =
    ASPECT_RATIO_OPTIONS.find((o) => o.id === project.canvas.aspectRatioId)?.label ?? project.canvas.aspectRatioId;
  const chipText = isMobileLayout
    ? `${pixels.width}×${pixels.height} · 1:1 · ${project.canvas.fps}fps${
        project.canvas.aspectRatioId !== "1:1" ? ` · desktop ${storedAspectLabel}` : ""
      }`
    : `${pixels.width}×${pixels.height} · ${project.canvas.aspectRatioId} · ${project.canvas.fps}fps`;

  const TemplateComponent = entry.Component;

  const templatesPanelEl = (
    <TemplatesPanel
      project={project}
      updateProject={updateProject}
      filtered={filtered}
      categories={categories}
      filterCat={filterCat}
      isMobileLayout={isMobileLayout}
      setTimeMs={setTimeMs}
      setPlaying={setPlaying}
    />
  );


  const previewPanelEl = (
    <PreviewPanel
      previewRef={previewRef}
      pixels={pixels}
      isMobileLayout={isMobileLayout}
      chipText={chipText}
      playing={playing}
      setPlaying={setPlaying}
      setTimeMs={setTimeMs}
      onExportClick={openExportModal}
      projectRtl={project.ui?.layoutDirection === "rtl"}
      theme={theme}
      compositionLayerStyle={compositionLayerStyle}
      compositionFilterCss={compositionFilterCss}
      liftShadowCss={liftShadowCss}
      sceneEffects={sceneEffects}
      fireAccent={fireAccent}
      timeMs={timeMs}
      durationMs={durationMs}
      motionTimeScale={motionTimeScale}
      reducedMotion={reducedMotion}
      TemplateComponent={TemplateComponent}
      entryDefinition={entry.definition}
      fieldValues={project.field_values}
      showSafeZones={project.ui?.showSafeZones ?? false}
      effectiveAspectRatioId={effectiveAspectRatioId}
      onCanvasPointerDown={nudgeTextDockAttention}
    />
  );

  const onLicenses = () => alert("See THIRD_PARTY_NOTICES.md in the repository for font and icon attribution.");

  const renderAdjustSection = (id: MobileAdjustSectionId) => {
    const inner = (() => {
      switch (id) {
        case "canvas":
          return (
            <CanvasInspectorBody
              project={project}
              updateProject={updateProject}
              durationMs={durationMs}
              entry={entry}
              isMobileLayout={isMobileLayout}
              effectiveAspectRatioId={effectiveAspectRatioId}
              storedAspectLabel={storedAspectLabel}
              onDesktopOnlyAspectToast={onDesktopOnlyAspectToast}
            />
          );
        case "composition":
          return (
            <CompositionInspectorBody
              project={project}
              updateProject={updateProject}
              composition={composition}
              patchComposition={patchComposition}
              motionTimeScale={motionTimeScale}
              reducedMotion={reducedMotion}
            />
          );
        case "scene":
          return <SceneEffectsInspectorBody sceneEffects={sceneEffects} patchEffects={patchEffects} />;
        case "look":
          return <LookAtmosphereInspectorBody sceneEffects={sceneEffects} patchEffects={patchEffects} />;
        case "brand":
          return <BrandInspectorBody project={project} updateProject={updateProject} />;
        case "overrides":
          return <OverridesInspectorBody project={project} updateProject={updateProject} />;
        case "fields":
          return (
            <FieldsInspectorBody
              project={project}
              updateProject={updateProject}
              entry={entry}
              validationIssues={validationIssues}
            />
          );
        case "project-files":
          return (
            <ProjectFilesInspectorBody
              exportJson={exportJson}
              importJson={importJson}
              saveError={saveError}
              onLicenses={onLicenses}
            />
          );
        default: {
          const _never: never = id;
          return _never;
        }
      }
    })();
    return <div className="inspector-card-body inspector-drill-body">{inner}</div>;
  };

  const desktopInspector = (
    <aside className="panel panel-right">
      <div className="panel-right-inner">
        <InspectorCard title="Canvas" defaultOpen>
          <CanvasInspectorBody
            project={project}
            updateProject={updateProject}
            durationMs={durationMs}
            entry={entry}
            isMobileLayout={false}
            effectiveAspectRatioId={effectiveAspectRatioId}
            storedAspectLabel={storedAspectLabel}
            onDesktopOnlyAspectToast={onDesktopOnlyAspectToast}
          />
        </InspectorCard>

        <InspectorCard title="Composition & motion" defaultOpen>
          <CompositionInspectorBody
            project={project}
            updateProject={updateProject}
            composition={composition}
            patchComposition={patchComposition}
            motionTimeScale={motionTimeScale}
            reducedMotion={reducedMotion}
          />
        </InspectorCard>

        <InspectorCard title="Scene effects">
          <SceneEffectsInspectorBody sceneEffects={sceneEffects} patchEffects={patchEffects} />
        </InspectorCard>

        <InspectorCard title="Look & atmosphere">
          <LookAtmosphereInspectorBody sceneEffects={sceneEffects} patchEffects={patchEffects} />
        </InspectorCard>

        <InspectorCard title="Brand & colors">
          <BrandInspectorBody project={project} updateProject={updateProject} />
        </InspectorCard>

        <InspectorCard title="Overrides">
          <OverridesInspectorBody project={project} updateProject={updateProject} />
        </InspectorCard>

        <InspectorCard title={`Fields · ${entry.definition.name}`} defaultOpen>
          <FieldsInspectorBody
            project={project}
            updateProject={updateProject}
            entry={entry}
            validationIssues={validationIssues}
          />
        </InspectorCard>
      </div>
    </aside>
  );

  return (
    <>
      <div className="app-layout">
        <TemplateTextFieldsDock
          entry={entry}
          project={project}
          updateProject={updateProject}
          validationIssues={validationIssues}
          attentionKey={textDockAttentionKey}
        />
        <div className="app-layout-main">
          {isMobileLayout ? (
            <MobileShell
              templatesOpen={mobileTemplatesOpen}
              adjustOpen={mobileAdjustOpen}
              onToggleTemplates={toggleMobileTemplates}
              onToggleAdjust={toggleMobileAdjust}
              onCloseMenus={closeMobileMenus}
              adjustSection={mobileAdjustSection}
              onAdjustSectionChange={setMobileAdjustSection}
              fieldsTemplateName={entry.definition.name}
              preview={previewPanelEl}
              templates={templatesPanelEl}
              renderAdjustSection={renderAdjustSection}
            />
          ) : (
            <div className="app-shell">
              {templatesPanelEl}
              {previewPanelEl}
              {desktopInspector}
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
                <button type="button" className="btn" onClick={onLicenses}>
                  Licenses / notices
                </button>
              </footer>
            </div>
          )}
        </div>
      </div>


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
      <Toast message={toastMessage} onDismiss={dismissToast} />
    </>
  );
}
