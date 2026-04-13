import { useEffect } from "react";

const DISMISS_MS = 3500;

export function Toast({
  message,
  onDismiss,
}: {
  message: string | null;
  onDismiss: () => void;
}) {
  useEffect(() => {
    if (!message) return;
    const t = window.setTimeout(onDismiss, DISMISS_MS);
    return () => window.clearTimeout(t);
  }, [message, onDismiss]);

  if (!message) return null;

  return (
    <div
      className="app-toast"
      role="status"
      aria-live="polite"
    >
      {message}
    </div>
  );
}
