import type { ReactNode } from "react";
import {
  ADJUST_HUB_ORDER,
  adjustSectionHint,
  adjustSectionTitle,
  type MobileAdjustSectionId,
} from "./adjustSections";

export function MobileShell({
  templatesOpen,
  adjustOpen,
  onToggleTemplates,
  onToggleAdjust,
  onCloseMenus,
  adjustSection,
  onAdjustSectionChange,
  fieldsTemplateName,
  preview,
  templates,
  renderAdjustSection,
}: {
  templatesOpen: boolean;
  adjustOpen: boolean;
  onToggleTemplates: () => void;
  onToggleAdjust: () => void;
  onCloseMenus: () => void;
  adjustSection: MobileAdjustSectionId | null;
  onAdjustSectionChange: (id: MobileAdjustSectionId | null) => void;
  fieldsTemplateName: string;
  preview: ReactNode;
  templates: ReactNode;
  renderAdjustSection: (id: MobileAdjustSectionId) => ReactNode;
}) {
  const menuOpen = templatesOpen || adjustOpen;

  const adjustContent =
    adjustSection === null ? (
      <div className="mobile-adjust-hub">
        <ul className="mobile-adjust-hub-list">
          {ADJUST_HUB_ORDER.map((id) => {
            const title = adjustSectionTitle(id, fieldsTemplateName);
            const hint = adjustSectionHint(id);
            return (
              <li key={id}>
                <button
                  type="button"
                  className="mobile-adjust-row"
                  onClick={() => onAdjustSectionChange(id)}
                >
                  <span className="mobile-adjust-row-title">{title}</span>
                  {hint && <span className="mobile-adjust-row-hint">{hint}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    ) : (
      <div className="mobile-adjust-drill">
        <header className="mobile-adjust-drill-header">
          <button type="button" className="btn mobile-adjust-back" onClick={() => onAdjustSectionChange(null)}>
            Back
          </button>
          <h2 className="mobile-adjust-drill-title">{adjustSectionTitle(adjustSection, fieldsTemplateName)}</h2>
        </header>
        <div className="mobile-adjust-drill-body">{renderAdjustSection(adjustSection)}</div>
      </div>
    );

  return (
    <div className="app-shell app-shell--mobile">
      <div className={`mobile-split-stack${menuOpen ? " mobile-split-stack--split" : ""}`}>
        <div className={`mobile-preview-pane${menuOpen ? " mobile-preview-pane--split" : ""}`}>{preview}</div>
        {menuOpen && (
          <div
            className="mobile-menu-pane mobile-menu-pane--sheet"
            role="region"
            aria-label={templatesOpen ? "Templates" : "Adjust"}
          >
            {templatesOpen && templates}
            {adjustOpen && <div className="panel panel-adjust panel-adjust--split">{adjustContent}</div>}
          </div>
        )}
      </div>

      <nav className="mobile-tab-bar" aria-label="Main">
        <button
          type="button"
          className={`mobile-tab${!menuOpen ? " mobile-tab--active" : ""}`}
          onClick={onCloseMenus}
          aria-pressed={!menuOpen}
        >
          <span className="mobile-tab-icon" aria-hidden>
            ▶
          </span>
          <span className="mobile-tab-label">Preview</span>
        </button>
        <button
          type="button"
          className={`mobile-tab${templatesOpen ? " mobile-tab--active" : ""}`}
          onClick={onToggleTemplates}
          aria-pressed={templatesOpen}
        >
          <span className="mobile-tab-icon" aria-hidden>
            ≡
          </span>
          <span className="mobile-tab-label">Templates</span>
        </button>
        <button
          type="button"
          className={`mobile-tab${adjustOpen ? " mobile-tab--active" : ""}`}
          onClick={onToggleAdjust}
          aria-pressed={adjustOpen}
        >
          <span className="mobile-tab-icon" aria-hidden>
            ◎
          </span>
          <span className="mobile-tab-label">Adjust</span>
        </button>
      </nav>
    </div>
  );
}
