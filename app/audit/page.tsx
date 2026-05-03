"use client";

import { useState, useEffect } from "react";
import { getAuditLog, type AuditEntry } from "@/lib/api";
import { Btn } from "@/components/Atoms";

const ACTION_COLORS: Record<string, string> = {
  created:          "text-teal-300 border-teal-800",
  updated:          "text-accent border-[rgb(161,117,65)]",
  activated:        "text-green-300 border-green-800",
  deactivated:      "text-slate-400 border-slate-600",
  deleted:          "text-red-400 border-red-900",
  bulk_activated:   "text-green-300 border-green-800",
  bulk_deactivated: "text-slate-400 border-slate-600",
  bulk_deleted:     "text-red-400 border-red-900",
};

/** Resolve display name: prefer full name from profile, fall back to raw auth_id. */
function displayName(entry: AuditEntry): string {
  return entry.changedByUser?.fullName || entry.changedBy;
}

export default function AuditLogPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const perPage = 20;

  const load = () => {
    setLoading(true);
    setError(null);
    getAuditLog({ page, per_page: perPage })
      .then((res) => { setEntries(res.data); setTotal(res.total); })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(load, [page]);

  const totalPages = Math.ceil(total / perPage);
  const from = total === 0 ? 0 : (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);

  return (
    <div className="flex flex-col min-h-[calc(100vh-49px)]">
      {/* Head */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-dashed border-line-2">
        <div className="font-sketch text-[22px] text-text">
          Audit log{" "}
          <span className="text-text-dim text-[14px] font-mono ml-2.5">
            {loading ? "…" : `${total} events`}
          </span>
        </div>
        <div className="ml-auto">
          <Btn>Export</Btn>
        </div>
      </div>

      {/* Table header */}
      <div className="grid grid-cols-[160px_120px_1fr_1fr_160px] gap-3.5 px-5 py-2 border-b border-solid border-line font-mono text-[10.5px] text-text-faint tracking-wider uppercase">
        <span>When</span>
        <span>Action</span>
        <span>Setting</span>
        <span>By</span>
        <span>Value</span>
      </div>

      {/* Rows */}
      <div className="flex-1 px-5">
        {loading && (
          <div className="py-10 text-center font-mono text-[12px] text-text-faint">Loading…</div>
        )}
        {error && (
          <div className="py-10 text-center font-mono text-[12px] text-red-400">
            Failed to load: {error} —{" "}
            <button className="underline" onClick={load}>retry</button>
          </div>
        )}
        {!loading && !error && entries.length === 0 && (
          <div className="py-10 text-center font-mono text-[12px] text-text-faint">No audit events yet.</div>
        )}
        {entries.map((e) => (
          <div
            key={e.id}
            className="grid grid-cols-[160px_120px_1fr_1fr_160px] gap-3.5 px-0 py-2.5 border-b border-dashed border-line-2 items-start font-mono text-[12px]"
          >
            <span className="text-text-dim text-[11px]">{formatDate(e.changedAt)}</span>
            <span>
              <span className={`inline-block px-2 py-[2px] rounded-[3px] border text-[10.5px] ${ACTION_COLORS[e.action] ?? "text-text-dim border-line"}`}>
                {e.action}
              </span>
            </span>
            <span className="text-text truncate">{e.settingKey}</span>
            {/* Show resolved full name; fall back to raw auth_id if profile not found */}
            <span className="text-text-dim truncate" title={e.changedBy}>
              {displayName(e)}
            </span>
            <span className="text-text-faint text-[11px] truncate">
              {e.newValue !== null && e.newValue !== undefined
                ? JSON.stringify(e.newValue).slice(0, 40)
                : "—"}
            </span>
          </div>
        ))}
      </div>

      {/* Pagination */}
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
    </div>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
    hour12: false,
  });
}
