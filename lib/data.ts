import type { ApiSetting } from "@/lib/api";

export type SettingType = "feature_flag" | "limit" | "appearance" | "integration" | "custom";

export interface Setting {
  key: string;
  type: SettingType;
  value: boolean | number | string | Record<string, unknown>;
  desc: string | null;
  active: boolean;
  updated: string;
  createdAt: string;
}

export const TYPE_ORDER: SettingType[] = ["feature_flag", "limit", "appearance", "integration", "custom"];

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function fromApi(s: ApiSetting): Setting {
  return {
    key: s.key,
    type: s.setting_type as SettingType,
    value: s.value as Setting["value"],
    desc: s.description,
    active: s.is_active,
    updated: relativeTime(s.updated_at),
    createdAt: s.created_at,
  };
}
