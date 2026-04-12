import { GIFEncoder, applyPalette, quantize } from "gifenc";
import { toBlob } from "html-to-image";
import JSZip from "jszip";
import type { ExportFormatId } from "../types";

export interface ExportProgress {
  phase: string;
  current: number;
  total: number;
}

export function waitFrames(count = 2): Promise<void> {
  return new Promise((resolve) => {
    let n = count;
    const step = () => {
      if (n <= 0) resolve();
      else {
        n -= 1;
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
  });
}

export async function waitForRenderReady(): Promise<void> {
  await document.fonts.ready;
  await waitFrames(2);
}

function pickRecorderMime(kind: "webm" | "mp4"): { mime: string } | null {
  const candidates =
    kind === "mp4"
      ? ["video/mp4", "video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"]
      : ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"];
  for (const mime of candidates) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(mime)) {
      return { mime };
    }
  }
  return null;
}

function loadImageFromBlob(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Image decode failed"));
    };
    img.src = url;
  });
}

async function capturePngBlob(
  node: HTMLElement,
  width: number,
  height: number,
  backgroundColor: string | undefined,
): Promise<Blob> {
  const blob = await toBlob(node, {
    width,
    height,
    pixelRatio: 1,
    cacheBust: true,
    ...(backgroundColor !== undefined ? { backgroundColor } : {}),
    filter: (el) => (el as HTMLElement).dataset?.exportIgnore !== "1",
  });
  if (!blob) throw new Error("Frame capture failed");
  return blob;
}

export interface RunExportParams {
  node: HTMLElement;
  width: number;
  height: number;
  fps: number;
  durationMs: number;
  format: ExportFormatId;
  flatBackground: { mode: "transparent" | "solid" | "gradient"; color?: string; color2?: string };
  seekTimeMs: (timeMs: number) => Promise<void>;
  onProgress?: (p: ExportProgress) => void;
  signal?: AbortSignal;
}

function drawBackground(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  flat: RunExportParams["flatBackground"],
) {
  if (flat.mode === "solid" && flat.color) {
    ctx.fillStyle = flat.color;
    ctx.fillRect(0, 0, w, h);
  } else if (flat.mode === "gradient" && flat.color && flat.color2) {
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, flat.color);
    g.addColorStop(1, flat.color2);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }
}

function pngBackgroundColor(flat: RunExportParams["flatBackground"]): string | undefined {
  if (flat.mode === "transparent") return undefined;
  if (flat.mode === "solid") return flat.color ?? "#000000";
  return flat.color ?? "#0f172a";
}

export async function runExport(params: RunExportParams): Promise<{ blob: Blob; filename: string; readme: string }> {
  const { node, width, height, fps, durationMs, format, flatBackground, onProgress, signal, seekTimeMs } = params;
  const frameDuration = 1000 / fps;
  const totalFrames = Math.max(1, Math.round(durationMs / frameDuration));

  if (format === "png_zip") {
    const zip = new JSZip();
    const folder = zip.folder("frames");
    if (!folder) throw new Error("ZIP folder failed");
    const bg = pngBackgroundColor(flatBackground);
    for (let i = 0; i < totalFrames; i++) {
      signal?.throwIfAborted();
      onProgress?.({ phase: "PNG frames", current: i + 1, total: totalFrames });
      const t = i * frameDuration;
      await seekTimeMs(t);
      await waitForRenderReady();
      const blob = await capturePngBlob(node, width, height, bg);
      const name = `frame_${String(i).padStart(5, "0")}.png`;
      folder.file(name, blob);
    }
    const zipBlob = await zip.generateAsync({ type: "blob" });
    const readme = `PNG sequence\nResolution: ${width}x${height}\nFPS: ${fps}\nFrames: ${totalFrames}\nDuration: ${durationMs}ms\n`;
    return { blob: zipBlob, filename: `export_${width}x${height}_png.zip`, readme };
  }

  if (format === "gif") {
    const gif = GIFEncoder();
    const bg = pngBackgroundColor(flatBackground);
    for (let i = 0; i < totalFrames; i++) {
      signal?.throwIfAborted();
      onProgress?.({ phase: "GIF frames", current: i + 1, total: totalFrames });
      const t = i * frameDuration;
      await seekTimeMs(t);
      await waitForRenderReady();
      const pngBlob = await capturePngBlob(node, width, height, bg);
      const bmp = await createImageBitmap(pngBlob);
      const c = document.createElement("canvas");
      c.width = width;
      c.height = height;
      const ctx = c.getContext("2d");
      if (!ctx) throw new Error("2D context");
      ctx.drawImage(bmp, 0, 0);
      bmp.close();
      const { data } = ctx.getImageData(0, 0, width, height);
      const palette = quantize(data, 256);
      const index = applyPalette(data, palette);
      gif.writeFrame(index, width, height, {
        palette,
        delay: Math.max(2, Math.round(frameDuration / 10)),
      });
    }
    gif.finish();
    const out = gif.bytes();
    const readme = `GIF\n${width}x${height}\nFrames: ${totalFrames}\nNote: 256-color palette; banding may occur.\n`;
    return { blob: new Blob([out], { type: "image/gif" }), filename: `export_${width}x${height}.gif`, readme };
  }

  if (format === "webm" || format === "mp4") {
    const wantAlpha = format === "webm" && flatBackground.mode === "transparent";
    const picked = pickRecorderMime(format === "mp4" ? "mp4" : "webm");
    if (!picked) throw new Error("No MediaRecorder codec supported. Try PNG sequence.");

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d", { alpha: wantAlpha });
    if (!ctx) throw new Error("Canvas unsupported");

    const stream = canvas.captureStream(fps);
    const rec = new MediaRecorder(stream, { mimeType: picked.mime, videoBitsPerSecond: 8_000_000 });
    const chunks: Blob[] = [];
    rec.ondataavailable = (e) => {
      if (e.data.size) chunks.push(e.data);
    };
    const done = new Promise<Blob>((resolve, reject) => {
      rec.onstop = () => resolve(new Blob(chunks, { type: picked.mime }));
      rec.onerror = () => reject(new Error("Recording failed"));
    });
    rec.start();

    for (let i = 0; i < totalFrames; i++) {
      signal?.throwIfAborted();
      onProgress?.({ phase: "Video frames", current: i + 1, total: totalFrames });
      const t = i * frameDuration;
      await seekTimeMs(t);
      await waitForRenderReady();
      if (wantAlpha) {
        ctx.clearRect(0, 0, width, height);
      } else {
        drawBackground(ctx, width, height, flatBackground);
      }
      const capBg = wantAlpha ? undefined : pngBackgroundColor(flatBackground);
      const pngBlob = await capturePngBlob(node, width, height, capBg);
      const img = await loadImageFromBlob(pngBlob);
      ctx.drawImage(img, 0, 0, width, height);
      await new Promise((r) => setTimeout(r, frameDuration));
    }
    rec.stop();
    const videoBlob = await done;
    const ext = picked.mime.includes("mp4") ? "mp4" : "webm";
    const readme = `Video (${picked.mime})\n${width}x${height} @ ${fps}fps\nTransparent WebM: verify in your NLE; use PNG ZIP for guaranteed alpha.\n`;
    return { blob: videoBlob, filename: `export_${width}x${height}.${ext}`, readme };
  }

  throw new Error(`Format ${format} is not supported by this exporter`);
}
