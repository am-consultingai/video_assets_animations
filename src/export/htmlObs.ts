import type { ResolvedTheme } from "../types";
import { fieldStr } from "../templates/fields";
import type { FieldValues } from "../types";

/** Self-contained HTML for OBS Browser Source (transparent page). */
export function buildObsHtml(
  templateId: string,
  fields: FieldValues,
  theme: ResolvedTheme,
  width: number,
  height: number,
  durationMs: number,
): string | null {
  if (templateId === "minimal-lower-third") {
    const name = escapeHtml(fieldStr(fields, "name", "Alex Rivera"));
    const title = escapeHtml(fieldStr(fields, "title", "Creative Director"));
    const accent = escapeHtml(fieldStr(fields, "accentColor", theme.colors.accent));
    const barW = escapeHtml(fieldStr(fields, "barWidth", "72"));
    return `<!DOCTYPE html><html><head><meta charset="utf-8"/><style>
      *{box-sizing:border-box;margin:0;padding:0}
      html,body{width:${width}px;height:${height}px;background:transparent;overflow:hidden;font-family:${escapeHtml(theme.fontFamilies.body)}}
      .root{position:relative;width:100%;height:100%}
      .row{position:absolute;left:6%;bottom:8%;display:flex;align-items:stretch;gap:12px;animation:fadein ${durationMs}ms ease-out forwards}
      .bar{width:${barW}px;border-radius:${theme.radii.sm}px;background:${accent};animation:bar ${Math.min(800, durationMs)}ms ease-out forwards;transform-origin:center}
      .t1{font-size:${22 * theme.fontScale}px;font-weight:${theme.typography.body.weight};color:${escapeHtml(theme.colors.onSurface)}}
      .t2{margin-top:4px;font-size:${14 * theme.fontScale}px;color:${escapeHtml(theme.colors.muted)}}
      @keyframes fadein{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
      @keyframes bar{from{transform:scaleY(0.2)}to{transform:scaleY(1)}}
    </style></head><body><div class="root"><div class="row"><div class="bar"></div><div><div class="t1">${name}</div><div class="t2">${title}</div></div></div></div></body></html>`;
  }
  if (templateId === "subscribe-cta-card") {
    const channel = escapeHtml(fieldStr(fields, "channelName", "Your Channel"));
    const subs = escapeHtml(fieldStr(fields, "subscriberLine", "Join the community"));
    const initial = escapeHtml((fieldStr(fields, "channelName", "Y").trim().charAt(0) || "•").toUpperCase());
    const acc = escapeHtml(theme.colors.accent);
    const on = escapeHtml(theme.colors.onSurface);
    const mut = escapeHtml(theme.colors.muted);
    return `<!DOCTYPE html><html><head><meta charset="utf-8"/><style>
      *{box-sizing:border-box;margin:0;padding:0}
      html,body{width:${width}px;height:${height}px;background:transparent;overflow:hidden;font-family:${escapeHtml(theme.fontFamilies.body)}}
      .card{position:absolute;left:5%;bottom:9%;padding:14px 20px;min-width:260px;border-radius:${theme.radii.md}px;
        background:color-mix(in srgb, ${escapeHtml(theme.colors.primary)} 92%, transparent);
        border:1px solid color-mix(in srgb, ${acc} 35%, transparent);
        animation:slide ${Math.min(900, durationMs)}ms ease-out forwards;opacity:0;transform:translateX(-40px)}
      .row{display:flex;align-items:center;gap:12px;margin-bottom:10px}
      .av{width:40px;height:40px;border-radius:50%;background:${acc};display:flex;align-items:center;justify-content:center;color:#0f172a;font-weight:800}
      .nm{color:${on};font-weight:800;font-size:15px}
      .su{color:${mut};font-size:12px;margin-top:2px}
      .btn{display:inline-flex;align-items:center;gap:8px;padding:8px 16px;border-radius:999px;background:#dc2626;color:#fff;font-weight:700;font-size:13px;margin-top:2px;animation:pop 0.4s ease ${Math.min(400, durationMs)}ms forwards;opacity:0;transform:scale(0.85)}
      @keyframes slide{to{opacity:1;transform:translateX(0)}}
      @keyframes pop{to{opacity:1;transform:scale(1)}}
    </style></head><body>
      <div class="card"><div class="row"><div class="av">${initial}</div><div><div class="nm">${channel}</div><div class="su">${subs}</div></div></div>
      <div class="btn">Subscribe</div>
    </div></body></html>`;
  }
  return null;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
