import * as repo from "./settings.repository";
import { UpdateSettingsInput, SettingGroup } from "./settings.validation";
import { BadRequestError } from "@/errors";

// ── In-memory cache ────────────────────────────────────────────────────────
// Map<"group:key", "value">
const cache = new Map<string, string>();
let cacheReady = false;

const warmCache = async () => {
  const all = await repo.findAll();
  cache.clear();
  for (const s of all) cache.set(`${s.group}:${s.key}`, s.value);
  cacheReady = true;
};

// Gọi khi app khởi động (trong main/app entry)
export const initSettingsCache = warmCache;

export const invalidateCache = (group?: string) => {
  if (!group) {
    cache.clear();
    cacheReady = false;
    return;
  }
  for (const key of cache.keys()) {
    if (key.startsWith(`${group}:`)) cache.delete(key);
  }
};

// ── Public helper — dùng cross-module ─────────────────────────────────────
export const getSettingValue = async (group: string, key: string): Promise<string | null> => {
  const cacheKey = `${group}:${key}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey)!;

  const row = await repo.findByGroup(group).then((rows) => rows.find((r) => r.key === key));
  if (!row) return null;
  cache.set(cacheKey, row.value);
  return row.value;
};

export const isSettingEnabled = async (group: string, key: string, defaultValue = true): Promise<boolean> => {
  const val = await getSettingValue(group, key);
  if (val === null) return defaultValue;
  return val === "true";
};

// ── Admin CRUD ─────────────────────────────────────────────────────────────
export const getGroup = async (group: SettingGroup) => {
  const rows = await repo.findByGroup(group);
  // Trả về object { key: typedValue }
  return rows.reduce(
    (acc, row) => {
      acc[row.key] = castValue(row.value, row.dataType);
      return acc;
    },
    {} as Record<string, unknown>,
  );
};

export const getAll = async () => {
  const rows = await repo.findAll();
  const grouped: Record<string, Record<string, unknown>> = {};
  for (const row of rows) {
    if (!grouped[row.group]) grouped[row.group] = {};
    grouped[row.group][row.key] = castValue(row.value, row.dataType);
  }
  return grouped;
};

export const updateGroup = async (group: SettingGroup, input: UpdateSettingsInput, updatedBy: string) => {
  const entries = Object.entries(input.settings).map(([key, value]) => ({
    key,
    value: String(value),
    dataType: inferDataType(value),
  }));

  await repo.upsertMany(group, entries, updatedBy);
  invalidateCache(group);
  return getGroup(group);
};

// ── Helpers ────────────────────────────────────────────────────────────────
const castValue = (value: string, dataType: string): unknown => {
  switch (dataType) {
    case "BOOLEAN":
      return value === "true";
    case "NUMBER":
      return Number(value);
    case "JSON":
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    default:
      return value;
  }
};

const inferDataType = (value: unknown): string => {
  if (typeof value === "boolean") return "BOOLEAN";
  if (typeof value === "number") return "NUMBER";
  if (typeof value === "object") return "JSON";
  return "STRING";
};
