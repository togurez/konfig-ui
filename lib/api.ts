const BASE = "/api/konfig";

export interface ApiSetting {
  id: string;
  key: string;
  setting_type: string;
  value: unknown;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

let cachedToken: { value: string; expiresAt: number } | null = null;

async function getToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt - 30_000) {
    return cachedToken.value;
  }
  const res = await fetch("/auth/access-token");
  if (!res.ok) throw new Error("Failed to get access token");
  const { token } = await res.json();
  const exp = JSON.parse(atob(token.split(".")[1])).exp * 1000;
  cachedToken = { value: token, expiresAt: exp };
  return token;
}

async function apiFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const token = await getToken();
  return fetch(input, {
    ...init,
    headers: {
      ...init.headers,
      Authorization: `Bearer ${token}`,
    },
  });
}

export interface SettingsPage {
  data: ApiSetting[];
  total: number;
}

export async function listSettings(params?: {
  type?: string;
  active?: boolean;
  page?: number;
  per_page?: number;
}): Promise<SettingsPage> {
  const url = new URL(BASE + "/settings", window.location.origin);
  if (params?.type) url.searchParams.set("type", params.type);
  if (params?.active !== undefined) url.searchParams.set("active", String(params.active));
  if (params?.page) url.searchParams.set("page", String(params.page));
  if (params?.per_page) url.searchParams.set("per_page", String(params.per_page));
  const res = await apiFetch(url.toString());
  if (!res.ok) throw new Error(`listSettings: ${res.status}`);
  const data: ApiSetting[] = await res.json();
  const total = parseInt(res.headers.get("X-Total-Count") ?? "0", 10);
  return { data, total };
}

export async function createSetting(data: {
  key: string;
  setting_type: string;
  value: unknown;
  description?: string;
  is_active?: boolean;
}): Promise<ApiSetting> {
  const res = await apiFetch(`${BASE}/settings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`createSetting: ${res.status}`);
  return res.json();
}

export async function updateSetting(
  key: string,
  data: {
    setting_type?: string;
    value?: unknown;
    description?: string;
    is_active?: boolean;
  }
): Promise<ApiSetting> {
  const res = await apiFetch(`${BASE}/settings/${encodeURIComponent(key)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`updateSetting: ${res.status}`);
  return res.json();
}

export async function deleteSetting(key: string): Promise<void> {
  const res = await apiFetch(`${BASE}/settings/${encodeURIComponent(key)}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(`deleteSetting: ${res.status}`);
}

export interface SearchPage {
  data: ApiSetting[];
  total: number;
  hidden: number;
}

export async function searchSettings(params: {
  q?: string;
  type?: string;
  active?: boolean;
  updated_within?: string;
  key?: string;
  page?: number;
  per_page?: number;
}): Promise<SearchPage> {
  const url = new URL(BASE + "/settings/search", window.location.origin);
  if (params.q) url.searchParams.set("q", params.q);
  if (params.type) url.searchParams.set("type", params.type);
  if (params.active !== undefined) url.searchParams.set("active", String(params.active));
  if (params.updated_within) url.searchParams.set("updated_within", params.updated_within);
  if (params.key) url.searchParams.set("key", params.key);
  if (params.page) url.searchParams.set("page", String(params.page));
  if (params.per_page) url.searchParams.set("per_page", String(params.per_page));
  const res = await apiFetch(url.toString());
  if (!res.ok) throw new Error(`searchSettings: ${res.status}`);
  return res.json();
}

export interface BulkResult {
  action: string;
  matched: number;
  affected: number;
}

export async function bulkAction(
  filter: { q?: string; type?: string; active?: boolean },
  action: "activate" | "deactivate" | "delete"
): Promise<BulkResult> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (action === "delete") headers["X-Confirm-Bulk-Delete"] = "true";
  const res = await apiFetch(`${BASE}/settings/bulk`, {
    method: "POST",
    headers,
    body: JSON.stringify({ filter, action }),
  });
  if (!res.ok) throw new Error(`bulkAction: ${res.status}`);
  return res.json();
}

export interface AuditEntry {
  id: string;
  setting_key: string;
  action: "created" | "updated" | "activated" | "deactivated" | "deleted" | "bulk_activated" | "bulk_deactivated" | "bulk_deleted";
  previous_value: unknown;
  new_value: unknown;
  changed_by: string;
  changed_at: string;
}

export interface AuditPage {
  data: AuditEntry[];
  total: number;
  page: number;
  per_page: number;
}

export async function getAuditLog(params?: {
  setting_key?: string;
  action?: string;
  changed_by?: string;
  from?: string;
  to?: string;
  page?: number;
  per_page?: number;
}): Promise<AuditPage> {
  const url = new URL(BASE + "/audit", window.location.origin);
  if (params?.setting_key) url.searchParams.set("setting_key", params.setting_key);
  if (params?.action) url.searchParams.set("action", params.action);
  if (params?.changed_by) url.searchParams.set("changed_by", params.changed_by);
  if (params?.from) url.searchParams.set("from", params.from);
  if (params?.to) url.searchParams.set("to", params.to);
  if (params?.page) url.searchParams.set("page", String(params.page));
  if (params?.per_page) url.searchParams.set("per_page", String(params.per_page));
  const res = await apiFetch(url.toString());
  if (!res.ok) throw new Error(`getAuditLog: ${res.status}`);
  return res.json();
}

export async function getSettingHistory(key: string, params?: {
  page?: number;
  per_page?: number;
}): Promise<AuditEntry[]> {
  const url = new URL(`${BASE}/settings/${encodeURIComponent(key)}/history`, window.location.origin);
  if (params?.page) url.searchParams.set("page", String(params.page));
  if (params?.per_page) url.searchParams.set("per_page", String(params.per_page));
  const res = await apiFetch(url.toString());
  if (!res.ok) throw new Error(`getSettingHistory: ${res.status}`);
  return res.json();
}
