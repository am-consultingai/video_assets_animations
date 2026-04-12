import type { FieldValues } from "../types";

export function fieldStr(fields: FieldValues, key: string, fallback = ""): string {
  const v = fields[key];
  return typeof v === "string" ? v : fallback;
}

export function fieldNum(fields: FieldValues, key: string, fallback: number): number {
  const v = fields[key];
  return typeof v === "number" && !Number.isNaN(v) ? v : fallback;
}

export function fieldBool(fields: FieldValues, key: string, fallback: boolean): boolean {
  const v = fields[key];
  return typeof v === "boolean" ? v : fallback;
}
