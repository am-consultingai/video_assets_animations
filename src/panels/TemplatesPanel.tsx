import type { ProjectState, TemplateEntry } from "../types";
import { mergeFieldDefaults } from "../project/defaults";

export function TemplatesPanel({
  project,
  updateProject,
  filtered,
  categories,
  filterCat,
  isMobileLayout,
  setTimeMs,
  setPlaying,
}: {
  project: ProjectState;
  updateProject: (patch: Partial<ProjectState> | ((prev: ProjectState) => ProjectState)) => void;
  filtered: TemplateEntry[];
  categories: string[];
  filterCat: string;
  isMobileLayout: boolean;
  setTimeMs: (n: number) => void;
  setPlaying: (v: boolean) => void;
}) {
  return (
    <aside className={`panel panel-left${isMobileLayout ? " panel-left--mobile" : ""}`} style={{ padding: 10 }}>
      <div className={isMobileLayout ? "templates-sticky-header" : undefined}>
        <h2>Templates</h2>
        {!isMobileLayout && (
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
        )}
        {isMobileLayout && (
          <div className="category-chips" role="group" aria-label="Category quick filter">
            <button
              type="button"
              className={`category-chip${filterCat === "" ? " category-chip--active" : ""}`}
              onClick={() => updateProject({ ui: { ...project.ui, categoryFilter: undefined } })}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                className={`category-chip${filterCat === c ? " category-chip--active" : ""}`}
                onClick={() => updateProject({ ui: { ...project.ui, categoryFilter: c } })}
              >
                {c}
              </button>
            ))}
          </div>
        )}
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
  );
}
