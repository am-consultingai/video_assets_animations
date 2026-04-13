import type { CSSProperties, Dispatch, RefObject, SetStateAction } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { ConfettiCanvas } from "../components/ConfettiCanvas";
import { FireCanvas } from "../components/FireCanvas";
import { GrainCanvas } from "../components/GrainCanvas";
import { LightSweepCanvas } from "../components/LightSweepCanvas";
import { SafeZonesOverlay } from "../components/SafeZonesOverlay";
import { StaggerShell } from "../components/StaggerShell";
import { VignetteOverlay } from "../components/VignetteOverlay";
import type { ResolvedTheme, TemplateRenderProps } from "../types";
import type { SceneEffectsSettings } from "../types";
import type { ComponentType } from "react";

const MOBILE_STAGE_PAD_H = 24;
const MOBILE_STAGE_PAD_V = 24;

export function PreviewPanel({
  previewRef,
  pixels,
  isMobileLayout,
  chipText,
  playing,
  setPlaying,
  setTimeMs,
  onExportClick,
  projectRtl,
  theme,
  compositionLayerStyle,
  compositionFilterCss,
  liftShadowCss,
  sceneEffects,
  fireAccent,
  timeMs,
  durationMs,
  motionTimeScale,
  reducedMotion,
  TemplateComponent,
  entryDefinition,
  fieldValues,
  showSafeZones,
  effectiveAspectRatioId,
}: {
  previewRef: RefObject<HTMLDivElement | null>;
  pixels: { width: number; height: number };
  isMobileLayout: boolean;
  chipText: string;
  playing: boolean;
  setPlaying: Dispatch<SetStateAction<boolean>>;
  setTimeMs: (n: number) => void;
  onExportClick: () => void;
  projectRtl: boolean;
  theme: ResolvedTheme;
  compositionLayerStyle: CSSProperties;
  compositionFilterCss: string | undefined;
  liftShadowCss: string | undefined;
  sceneEffects: SceneEffectsSettings;
  fireAccent: string;
  timeMs: number;
  durationMs: number;
  motionTimeScale: number;
  reducedMotion: boolean;
  TemplateComponent: ComponentType<TemplateRenderProps>;
  entryDefinition: TemplateRenderProps["definition"];
  fieldValues: TemplateRenderProps["fields"];
  showSafeZones: boolean;
  effectiveAspectRatioId: string;
}) {
  const stageWrapRef = useRef<HTMLDivElement>(null);
  const [stageSize, setStageSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    if (!isMobileLayout) return;
    const el = stageWrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect();
      setStageSize({ w: r.width, h: r.height });
    });
    ro.observe(el);
    const r = el.getBoundingClientRect();
    setStageSize({ w: r.width, h: r.height });
    return () => ro.disconnect();
  }, [isMobileLayout]);

  const scale = useMemo(() => {
    if (isMobileLayout && stageSize.w > 0 && stageSize.h > 0) {
      const hw = (stageSize.w - MOBILE_STAGE_PAD_H) / pixels.width;
      const hh = (stageSize.h - MOBILE_STAGE_PAD_V) / pixels.height;
      return Math.min(1, hw, hh);
    }
    return Math.min(1, Math.min(920 / pixels.width, 620 / pixels.height));
  }, [isMobileLayout, stageSize.w, stageSize.h, pixels.width, pixels.height]);

  return (
    <main className="preview-column">
      <div className="preview-toolbar">
        <span className="chip">{chipText}</span>
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
        <button type="button" className="btn" onClick={onExportClick}>
          Export…
        </button>
      </div>
      <div className="preview-stage-wrap" ref={stageWrapRef}>
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
              dir={projectRtl ? "rtl" : "ltr"}
              style={{
                width: pixels.width,
                height: pixels.height,
                position: "relative",
                background: "transparent",
                overflow: "hidden",
                color: theme.colors.onSurface,
              }}
            >
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
                    templateId={entryDefinition.id}
                  >
                    <TemplateComponent
                      definition={entryDefinition}
                      fields={fieldValues}
                      theme={theme}
                      timeMs={timeMs}
                      durationMs={durationMs}
                      reducedMotion={reducedMotion}
                      motionTimeScale={motionTimeScale}
                      layoutDirection={projectRtl ? "rtl" : "ltr"}
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
              {showSafeZones && effectiveAspectRatioId === "9:16" && (
                <SafeZonesOverlay width={pixels.width} height={pixels.height} />
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
