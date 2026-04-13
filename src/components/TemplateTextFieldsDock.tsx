import type { FieldValues, ProjectState } from "../types";
import type { TemplateEntry } from "../types";

function templateTextFieldDefs(entry: TemplateEntry) {
  return entry.definition.fields.filter((f) => f.type === "text");
}

export function TemplateTextFieldsDock({
  entry,
  project,
  updateProject,
  validationIssues,
}: {
  entry: TemplateEntry;
  project: ProjectState;
  updateProject: (patch: Partial<ProjectState> | ((prev: ProjectState) => ProjectState)) => void;
  validationIssues: { key: string; message: string }[];
}) {
  const textFields = templateTextFieldDefs(entry);
  if (textFields.length === 0) return null;

  const textKeys = new Set(textFields.map((f) => f.key));
  const textIssues = validationIssues.filter((i) => textKeys.has(i.key));

  return (
    <header className="template-fields-dock">
      {textIssues.length > 0 && (
        <div className="template-fields-dock-errors error-banner">
          {textIssues.map((i) => (
            <div key={i.key}>
              {i.key}: {i.message}
            </div>
          ))}
        </div>
      )}
      <div className="template-fields-dock-scroll">
        {textFields.map((f) => (
          <div className="template-fields-dock-item" key={f.key}>
            <label htmlFor={`f-${f.key}`}>{f.label}</label>
            <input
              id={`f-${f.key}`}
              type="text"
              maxLength={f.maxLength}
              value={String(project.field_values[f.key] ?? "")}
              onChange={(e) =>
                updateProject({
                  field_values: { ...project.field_values, [f.key]: e.target.value } as FieldValues,
                })
              }
            />
          </div>
        ))}
      </div>
    </header>
  );
}
