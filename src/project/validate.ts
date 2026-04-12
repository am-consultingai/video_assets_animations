import type { FieldDef, FieldValues } from "../types";

export interface ValidationIssue {
  key: string;
  message: string;
}

export function validateFields(fields: FieldDef[], values: FieldValues): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const f of fields) {
    const v = values[f.key];
    if (f.required) {
      if (v === undefined || v === null || (typeof v === "string" && v.trim() === "")) {
        issues.push({ key: f.key, message: `${f.label} is required` });
        continue;
      }
    }
    if (f.type === "text" && typeof v === "string" && f.maxLength != null && v.length > f.maxLength) {
      issues.push({ key: f.key, message: `${f.label} exceeds ${f.maxLength} characters` });
    }
    if (f.type === "number" && typeof v === "number") {
      if (f.min != null && v < f.min) issues.push({ key: f.key, message: `${f.label} must be ≥ ${f.min}` });
      if (f.max != null && v > f.max) issues.push({ key: f.key, message: `${f.label} must be ≤ ${f.max}` });
    }
  }
  return issues;
}
