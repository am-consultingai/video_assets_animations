import type { ReactNode } from "react";

/** Compact collapsible section for the right inspector column. */
export function InspectorCard({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  return (
    <details className="inspector-card" open={defaultOpen}>
      <summary className="inspector-card-summary">
        <span className="inspector-card-title">{title}</span>
        <span className="inspector-card-chevron" aria-hidden>
          ▾
        </span>
      </summary>
      <div className="inspector-card-body">{children}</div>
    </details>
  );
}
