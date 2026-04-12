export function isChromiumBased(): boolean {
  const ua = navigator.userAgent;
  const isChromium =
    /Chrome|Chromium|Edg|Brave/i.test(ua) &&
    !/OPR\//i.test(ua) &&
    !(window as unknown as { MSStream?: unknown }).MSStream;
  return isChromium;
}
