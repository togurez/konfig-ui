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

async function getToken(): Promise<string> {
  const res = await fetch("/auth/access-token");
  if (!res.ok) throw new Error("Failed to get access token");
  const { token } = await res.json();
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

export async function listSettings(params?: {
  type?: string;
  active?: boolean;
  page?: number;
  per_page?: number;
}): Promise<ApiSetting[]> {
  const url = new URL(BASE + "/settings", window.location.origin);
  if (params?.type) url.searchParams.set("type", params.type);
  if (params?.active !== undefined) url.searchParams.set("active", String(params.active));
  if (params?.page) url.searchParams.set("page", String(params.page));
  if (params?.per_page) url.searchParams.set("per_page", String(params.per_page));
  const res = await apiFetch(url.toString());
  if (!res.ok) throw new Error(`listSettings: ${res.status}`);
  return res.json();
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
