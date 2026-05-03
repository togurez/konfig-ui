"use client";

import { useState, useEffect, useRef } from "react";
import { TYPE_ORDER, fromApi, type SettingType, type Setting } from "@/lib/data";
import { listSettings, createSetting, updateSetting } from "@/lib/api";
import { TypeBadge, KeyCell, ValueCell, Toggle, Check, Chip, Btn, Kbd } from "@/components/Atoms";
import { EditDrawer } from "@/components/EditDrawer";
import { useFilters } from "@/lib/filter-context";

const TYPES: SettingType[] = ["feature_flag", "limit", "appearance", "integration", "custom"];

export default function SettingsListPage() {
  const { typeFilter, activeFilter, page, setPage, applyType, applyActive } = useFilters();
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [focusSetting, setFocusSetting] = useState<Setting | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const perPage = 20;
  const [total, setTotal] = useState(0);

  const load = () => {
    setLoading(true);
    setError(null);
    listSettings({ type: typeFilter, active: activeFilter, page, per_page: perPage })
      .then(({ data, total }) => {
        setSettings(data.map(fromApi));
        setTotal(total);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [typeFilter, activeFilter, page]);

  const byType = {} as Record<SettingType, Setting[]>;
  settings.forEach((s) => {
    (byType[s.type] = byType[s.type] || []).push(s);
  });

  const toggleRow = (k: string) => {
    setSelected((prev) => {
      const n = new Set(prev);
      n.has(k) ? n.delete(k) : n.add(k);
      return n;
    });
  };

  const openEdit = (s: Setting) => {
    setFocusSetting(s);
    setDrawerOpen(true);
  };

  const openNew = () => {
    setFocusSetting(null);
    setDrawerOpen(true);
  };

  const activeCount = settings.filter((s) => s.active).length;
  const importRef = useRef<HTMLInputElement>(null);
  const [importReport, setImportReport] = useState<{ loaded: number; failed: number } | null>(null);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    let items: unknown[];
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      items = Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      setImportReport({ loaded: 0, failed: -1 }); // parse error
      return;
    }

    let loaded = 0, failed = 0;
    for (const item of items) {
      if (!item || typeof item !== "object") { failed++; continue; }
      const s = item as Record<string, unknown>;
      const key = typeof s.key === "string" ? s.key.trim() : "";
      const settingType = typeof (s.type ?? s.setting_type ?? s.settingType) === "string" ? String(s.type ?? s.setting_type ?? s.settingType) : "";
      if (!key || !settingType || s.value === undefined) { failed++; continue; }
      try {
        await updateSetting(key, { settingType, value: s.value, description: s.description as string | undefined, isActive: (s.active ?? s.isActive) as boolean | undefined });
        loaded++;
      } catch {
        try {
          await createSetting({ key, settingType, value: s.value, description: s.description as string | undefined, isActive: (s.active ?? s.isActive) as boolean | undefined });
          loaded++;
        } catch {
          failed++;
        }
      }
    }
    setImportReport({ loaded, failed });
    load();
  };

  const exportSelected = () => {
    const rows = settings.filter((s) => selected.has(s.key));
    const json = JSON.stringify(rows.map((s) => ({
      key: s.key,
      type: s.type,
      value: s.value,
      description: s.desc,
      active: s.active,
      updated: s.updated,
    })), null, 2);
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([json], { type: "application/json" }));
    a.download = "settings-export.json";
    a.click();
  };

  return (
    <div className="flex min-h-[calc(100vh-49px)]">
      <div className="flex-1 flex flex-col min-w-0">
        {/* Head */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-dashed border-line-2">
          <div className="font-sketch text-[22px] text-text">
            Settings{" "}
            <span className="text-text-dim text-[14px] font-mono ml-2.5">
              {loading ? "…" : `${total} keys · ${activeCount} active`}
            </span>
          </div>
          <div className="ml-auto flex gap-2">
            <Btn onClick={() => importRef.current?.click()}>Import</Btn>
            <input ref={importRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
            <Btn disabled={selected.size === 0} onClick={exportSelected}>
              Export{selected.size > 0 ? ` (${selected.size})` : ""}
            </Btn>
            <Btn variant="primary" onClick={openNew}>
              + New setting <span className="opacity-70 ml-1">N</span>
            </Btn>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap gap-2.5 items-center px-5 py-3 border-b border-dashed border-line-2">
          <div className="flex-1 min-w-[260px] flex items-center gap-2 border border-dashed border-line px-2.5 py-1.5 rounded-[3px] bg-bg font-mono text-[12px] text-text-faint">
            <span>/</span>
            <span className="text-text">filter</span>
            <span className="text-accent animate-pulse">▌</span>
            <span className="ml-auto"><Kbd>⌘K</Kbd></span>
          </div>
          {TYPES.map((t) => (
            <Chip key={t} on={typeFilter === t} onClick={() => applyType(typeFilter === t ? undefined : t)}>
              {t.replace("_", " ")}
            </Chip>
          ))}
          <span
            onClick={() => applyActive(activeFilter === true ? undefined : true)}
            className={`font-mono text-[11.5px] border border-dashed px-2.5 py-1 rounded-[3px] cursor-pointer ${
              activeFilter === true ? "border-accent text-accent" : "border-line text-text-dim"
            }`}
          >
            active only
          </span>
          <span className="font-mono text-[11.5px] text-text-dim border border-dashed border-line px-2.5 py-1 rounded-[3px]">sort: updated ↓</span>
        </div>

        {/* Import report */}
        {importReport && (
          <div className={`flex items-center gap-2.5 px-5 py-2.5 border-b border-dashed border-line-2 font-mono text-[12px] ${importReport.failed === -1 ? "text-red-400" : "text-text-dim"}`}>
            {importReport.failed === -1
              ? "Import failed — invalid JSON file."
              : <>
                  <span className="text-green-300">✓ {importReport.loaded} loaded</span>
                  {importReport.failed > 0 && <span className="text-red-400">· {importReport.failed} skipped (invalid)</span>}
                </>
            }
            <button className="ml-auto text-text-faint hover:text-text" onClick={() => setImportReport(null)}>×</button>
          </div>
        )}

        {/* Bulk */}
        {selected.size > 0 && (
          <div className="flex items-center gap-2.5 px-5 py-2.5 bg-bg-3 border-b border-dashed border-line-2 font-mono text-[12px] text-text-dim">
            <Check on />
            <span><span className="text-accent">{selected.size}</span> selected</span>
            <div className="ml-auto flex gap-2">
              <Btn>Activate</Btn>
              <Btn>Deactivate</Btn>
              <Btn>Delete</Btn>
              <Btn variant="ghost" onClick={() => setSelected(new Set())}>Clear</Btn>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="px-5 pb-5 flex-1">
          <div className="grid grid-cols-[24px_1.4fr_110px_1.6fr_90px_110px_80px] gap-3.5 px-2 py-2 border-b border-solid border-line font-mono text-[10.5px] text-text-faint tracking-wider uppercase">
            <span><Check /></span>
            <span>Key / description</span>
            <span>Type</span>
            <span>Value</span>
            <span>Active</span>
            <span>Updated</span>
            <span>Actions</span>
          </div>

          {loading && (
            <div className="px-2 py-8 text-center font-mono text-[12px] text-text-faint">Loading…</div>
          )}

          {error && (
            <div className="px-2 py-8 text-center font-mono text-[12px] text-red-400">
              Failed to load: {error} —{" "}
              <button className="underline" onClick={load}>retry</button>
            </div>
          )}

          {!loading && !error && settings.length === 0 && (
            <div className="px-2 py-8 text-center font-mono text-[12px] text-text-faint">
              No settings yet.{" "}
              <button className="underline text-accent" onClick={openNew}>Create one</button>
            </div>
          )}

          {TYPE_ORDER.map((t) => {
            const rows = byType[t];
            if (!rows?.length) return null;
            return (
              <div key={t} className="mt-3.5">
                <div className="flex items-center gap-2.5 px-2 pt-3 pb-2 font-sketch text-[17px] text-text border-b border-dashed border-line">
                  <span className="text-text-dim font-mono">▾</span>
                  <TypeBadge t={t} />
                  <span className="font-mono text-[12px] text-text-dim">{rows.length}</span>
                  <span className="flex-1 h-px bg-[linear-gradient(90deg,rgb(var(--line-2))_0_4px,transparent_4px_8px)]" />
                </div>

                {rows.map((s) => {
                  const sel = selected.has(s.key);
                  const focused = focusSetting?.key === s.key && drawerOpen;
                  return (
                    <div
                      key={s.key}
                      onClick={() => openEdit(s)}
                      className={`grid grid-cols-[24px_1.4fr_110px_1.6fr_90px_110px_80px] gap-3.5 px-2 py-2.5 border-b border-dashed border-line-2 items-center font-mono text-[12px] cursor-pointer transition-colors ${
                        sel || focused ? "accent-bg" : "hover:bg-bg-3"
                      }`}
                    >
                      <span onClick={(e) => { e.stopPropagation(); toggleRow(s.key); }}>
                        <Check on={sel} />
                      </span>
                      <span>
                        <KeyCell k={s.key} />
                        {s.desc && <div className="text-text-dim text-[11.5px] font-ui mt-0.5">{s.desc}</div>}
                      </span>
                      <span><TypeBadge t={s.type} /></span>
                      <span className="truncate"><ValueCell v={s.value} /></span>
                      <span><Toggle on={s.active} /></span>
                      <span className="text-text-dim">{s.updated}</span>
                      <span className="flex gap-2 text-text-faint">
                        <span className="font-mono text-[11px]">edit</span>
                        <span>⋯</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {(() => {
          const totalPages = Math.ceil(total / perPage);
          const from = total === 0 ? 0 : (page - 1) * perPage + 1;
          const to = Math.min(page * perPage, total);
          return (
            <div className="flex items-center gap-1.5 px-5 py-3.5 border-t border-dashed border-line-2 font-mono text-[11.5px] text-text-dim">
              <span>Showing {from}–{to} of {total}</span>
              <span className="flex-1" />
              <span
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className={`px-2 py-0.5 border border-dashed border-line rounded-[2px] ${page <= 1 ? "opacity-30 pointer-events-none" : "cursor-pointer hover:text-text"}`}
              >‹</span>
              <span className="px-2 py-0.5 border border-solid border-accent text-accent rounded-[2px]">{page}</span>
              <span
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className={`px-2 py-0.5 border border-dashed border-line rounded-[2px] ${page >= totalPages ? "opacity-30 pointer-events-none" : "cursor-pointer hover:text-text"}`}
              >›</span>
              <span className="ml-2.5">per page</span>
              <span className="px-2 py-0.5 border border-dashed border-line rounded-[2px]">{perPage}</span>
            </div>
          );
        })()}
      </div>

      {drawerOpen && (
        <EditDrawer
          setting={focusSetting}
          onClose={() => setDrawerOpen(false)}
          onSaved={load}
          onDeleted={() => { setDrawerOpen(false); load(); }}
        />
      )}
    </div>
  );
}
