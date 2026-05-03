"use client";

import { useState, useEffect, useCallback } from "react";
import { listSettings, getSetting, deleteSetting, getSettingHistory } from "@/lib/api";
import { fromApi, type Setting } from "@/lib/data";
import type { ApiSetting, AuditEntry } from "@/lib/api";
import { TypeBadge, KeyCell, ValueCell, Toggle, Check, Btn } from "@/components/Atoms";
import { EditDrawer } from "@/components/EditDrawer";

function relTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).catch(() => undefined);
}

export default function DetailPage() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [focusKey, setFocusKey] = useState<string | null>(null);
  const [detail, setDetail] = useState<ApiSetting | null>(null);
  const [history, setHistory] = useState<AuditEntry[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    listSettings({ per_page: 50 })
      .then(({ data, total }) => {
        const rows = data.map(fromApi);
        setSettings(rows);
        setTotal(total);
        if (!focusKey && rows.length > 0) setFocusKey(rows[0].key);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [focusKey]);

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Load detail + history whenever focusKey changes
  useEffect(() => {
    if (!focusKey) { setDetail(null); setHistory([]); return; }
    setDetailLoading(true);
    Promise.all([
      getSetting(focusKey),
      getSettingHistory(focusKey, { per_page: 20 }),
    ])
      .then(([s, h]) => {
        setDetail(s);
        setHistory(h);
      })
      .catch(() => { setDetail(null); setHistory([]); })
      .finally(() => setDetailLoading(false));
  }, [focusKey]);

  const handleDelete = async () => {
    if (!focusKey) return;
    if (!confirm(`Delete "${focusKey}"? This cannot be undone.`)) return;
    try {
      await deleteSetting(focusKey);
      setFocusKey(null);
      setDetail(null);
      load();
    } catch (e: unknown) {
      alert(`Delete failed: ${e instanceof Error ? e.message : String(e)}`);
    }
  };

  const handleCopyJSON = () => {
    if (!detail) return;
    copyToClipboard(JSON.stringify(detail, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const valueStr = detail ? JSON.stringify(detail.value, null, 2) : "";
  const valueLines = valueStr.split("\n");

  return (
    <div className="flex min-h-[calc(100vh-49px)]">
      {/* ── Left: settings list ─────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-dashed border-line-2">
          <div className="font-sketch text-[22px] text-text">
            Settings{" "}
            <span className="text-text-dim text-[14px] font-mono ml-2.5">
              {loading ? "…" : `${total} keys`}
            </span>
          </div>
        </div>

        <div className="px-5 pb-5 flex-1 overflow-y-auto">
          <div className="grid grid-cols-[24px_1.4fr_110px_1.6fr_90px_110px] gap-3.5 px-2 py-2 border-b border-solid border-line font-mono text-[10.5px] text-text-faint tracking-wider uppercase sticky top-0 bg-bg-2 z-10">
            <span><Check /></span>
            <span>Key</span>
            <span>Type</span>
            <span>Value</span>
            <span>Active</span>
            <span>Updated</span>
          </div>

          {loading && (
            <div className="py-10 text-center font-mono text-[12px] text-text-faint">Loading…</div>
          )}

          {error && (
            <div className="py-10 text-center font-mono text-[12px] text-red-400">
              {error} — <button className="underline" onClick={load}>retry</button>
            </div>
          )}

          {!loading && !error && settings.length === 0 && (
            <div className="py-10 text-center font-mono text-[12px] text-text-faint">No settings.</div>
          )}

          {settings.map((s) => (
            <div
              key={s.key}
              onClick={() => setFocusKey(s.key)}
              className={`grid grid-cols-[24px_1.4fr_110px_1.6fr_90px_110px] gap-3.5 px-2 py-2.5 border-b border-dashed border-line-2 items-center font-mono text-[12px] cursor-pointer transition-colors ${
                s.key === focusKey ? "accent-bg" : "hover:bg-bg-3"
              }`}
            >
              <Check on={s.key === focusKey} />
              <span>
                <KeyCell k={s.key} />
                {s.desc && (
                  <div className="text-text-dim text-[11.5px] font-ui mt-0.5 truncate">{s.desc}</div>
                )}
              </span>
              <span><TypeBadge t={s.type} /></span>
              <span className="truncate"><ValueCell v={s.value} /></span>
              <span><Toggle on={s.active} /></span>
              <span className="text-text-dim">{s.updated}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right: detail panel ──────────────────────────────────────────── */}
      <aside className="w-[420px] shrink-0 bg-bg border-l border-dashed border-line-2 flex flex-col font-mono">
        <div className="flex items-center gap-2.5 px-4 py-3.5 border-b border-dashed border-line-2">
          <div className="font-sketch text-[20px] text-text">Detail</div>
          <span className="ml-auto text-text-faint text-[11px]">↑↓ navigate · e edit · ⌫ delete</span>
        </div>

        {!focusKey && (
          <div className="flex-1 flex items-center justify-center font-mono text-[12px] text-text-faint">
            Select a setting to view details.
          </div>
        )}

        {focusKey && detailLoading && (
          <div className="flex-1 flex items-center justify-center font-mono text-[12px] text-text-faint">
            Loading…
          </div>
        )}

        {focusKey && !detailLoading && detail && (
          <>
            <div className="flex-1 p-4 flex flex-col gap-3.5 overflow-y-auto">
              {/* Key */}
              <Field label="Key">
                <div className="flex items-center gap-2 bg-bg-2 border border-dashed border-line rounded-[3px] px-2.5 py-2 text-[12px]">
                  <KeyCell k={detail.key} />
                  <button
                    onClick={() => copyToClipboard(detail.key)}
                    className="ml-auto text-text-faint text-[11px] hover:text-text transition-colors"
                  >
                    copy ⎘
                  </button>
                </div>
              </Field>

              {/* Type + Status */}
              <div className="flex gap-2.5">
                <Field label="Type">
                  <div className="py-1.5"><TypeBadge t={detail.settingType} /></div>
                </Field>
                <Field label="Status">
                  <div className="py-1.5 flex items-center gap-2">
                    <Toggle on={detail.isActive} />
                    <span className={`text-[11px] ${detail.isActive ? "text-accent" : "text-text-faint"}`}>
                      {detail.isActive ? "active" : "inactive"}
                    </span>
                  </div>
                </Field>
              </div>

              {/* Value */}
              <Field label={<>Value <span className="normal-case tracking-normal text-text-faint">· JSON</span></>}>
                <div className="bg-bg-2 border border-dashed border-line rounded-[3px] px-2.5 py-2 font-mono text-[12px] min-h-[80px] max-h-[200px] overflow-y-auto leading-[1.55]">
                  {valueLines.map((line, i) => (
                    <div key={i}>
                      <span className="text-text-faint inline-block w-[18px] text-right mr-2.5 select-none">
                        {i + 1}
                      </span>
                      <span className="text-text">{line}</span>
                    </div>
                  ))}
                </div>
              </Field>

              {/* Description */}
              {detail.description && (
                <Field label="Description">
                  <div className="bg-bg-2 border border-dashed border-line rounded-[3px] px-2.5 py-2 text-[12px] font-ui text-text">
                    {detail.description}
                  </div>
                </Field>
              )}

              {/* Audit metadata */}
              <Field label="Audit">
                <div className="grid grid-cols-[80px_1fr] gap-x-3 gap-y-1.5 text-[11.5px] text-text-dim">
                  <span className="text-text-faint">created</span>
                  <span>
                    {new Date(detail.createdAt).toISOString().replace("T", " ").slice(0, 16)} UTC
                    {detail.createdByUser && (
                      <span className="text-text-faint ml-1.5">by {detail.createdByUser.fullName}</span>
                    )}
                  </span>
                  <span className="text-text-faint">updated</span>
                  <span>
                    {relTime(detail.updatedAt)}
                    {history.length > 0 && (
                      <span className="text-text-faint ml-1.5">({history.length} revision{history.length !== 1 ? "s" : ""})</span>
                    )}
                    {detail.updatedByUser && (
                      <span className="text-text-faint ml-1.5">by {detail.updatedByUser.fullName}</span>
                    )}
                  </span>
                  <span className="text-text-faint">curl</span>
                  <span className="text-accent-dim truncate">GET /settings/{detail.key}</span>
                </div>
              </Field>

              {/* History */}
              {history.length > 0 && (
                <Field label="Recent changes">
                  <div className="flex flex-col gap-1">
                    {history.slice(0, 5).map((h) => (
                      <div
                        key={h.id}
                        className="flex items-center gap-2 px-2.5 py-1.5 bg-bg-2 border border-dashed border-line-2 rounded-[3px] text-[11px]"
                      >
                        <span className={`px-1.5 py-0.5 rounded-[2px] text-[10px] font-mono ${
                          h.action === "created" ? "bg-green-950/60 text-green-300 border border-green-900" :
                          h.action === "deleted" ? "bg-red-950/60 text-red-300 border border-red-900" :
                          "bg-bg-3 text-text-dim border border-line"
                        }`}>
                          {h.action}
                        </span>
                        <span className="text-text-faint flex-1 truncate">
                          {h.changedByUser?.fullName ?? h.changedBy}
                        </span>
                        <span className="text-text-faint">{relTime(h.changedAt)}</span>
                      </div>
                    ))}
                  </div>
                </Field>
              )}
            </div>

            {/* Footer actions */}
            <div className="flex gap-2 px-4 py-3.5 border-t border-dashed border-line-2">
              <Btn variant="danger" onClick={handleDelete}>Delete</Btn>
              <span className="flex-1" />
              <Btn onClick={handleCopyJSON}>{copied ? "Copied ✓" : "Copy JSON"}</Btn>
              <Btn variant="primary" onClick={() => setDrawerOpen(true)}>Edit ✎</Btn>
            </div>
          </>
        )}
      </aside>

      {drawerOpen && detail && (
        <EditDrawer
          setting={fromApi(detail)}
          onClose={() => setDrawerOpen(false)}
          onSaved={() => {
            setDrawerOpen(false);
            // Reload the detail panel
            setDetailLoading(true);
            Promise.all([
              getSetting(detail.key),
              getSettingHistory(detail.key, { per_page: 20 }),
            ])
              .then(([s, h]) => { setDetail(s); setHistory(h); })
              .catch(() => {})
              .finally(() => setDetailLoading(false));
            load();
          }}
          onDeleted={() => {
            setDrawerOpen(false);
            setFocusKey(null);
            setDetail(null);
            load();
          }}
        />
      )}
    </div>
  );
}

function Field({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5 flex-1">
      <label className="text-[10.5px] tracking-wider uppercase text-text-faint">{label}</label>
      {children}
    </div>
  );
}
