import type { ReactNode } from "react";

/** Compact collapsible section for the right inspector column. */
export function InspectorCard({
  title,
  defaultOpen = false,
  variant = "accordion",
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  /** `static` = always expanded section (mobile drill-in). */
  variant?: "accordion" | "static";
  children: ReactNode;
}) {
  if (variant === "static") {
    return (
      <section className="inspector-card inspector-card--static">
        <div className="inspector-card-summary inspector-card-summary--static">
          <span className="inspector-card-title">{title}</span>
        </div>
        <div className="inspector-card-body">{children}</div>
      </section>
    );
  }

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
