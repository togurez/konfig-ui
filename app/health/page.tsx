"use client";

import { useState, useEffect } from "react";

interface HealthCheck {
  name: string;
  status: "ok" | "degraded" | "down";
  latency_ms?: number;
  message?: string;
}

export default function HealthPage() {
  const [checks, setChecks] = useState<HealthCheck[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkedAt, setCheckedAt] = useState<Date | null>(null);

  const load = () => {
    setLoading(true);
    fetch("/api/konfig/health")
      .then((r) => r.json())
      .then((data) => {
        setChecks(Array.isArray(data) ? data : data.checks ?? []);
        setCheckedAt(new Date());
      })
      .catch(() => {
        setChecks([{ name: "api", status: "down", message: "Could not reach API" }]);
        setCheckedAt(new Date());
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const overall = checks.every((c) => c.status === "ok")
    ? "ok"
    : checks.some((c) => c.status === "down")
    ? "down"
    : "degraded";

  const statusColor = {
    ok:       "text-green-300 border-green-800 bg-green-950/40",
    degraded: "text-amber-300 border-amber-800 bg-amber-950/40",
    down:     "text-red-400 border-red-900 bg-red-950/40",
  };

  const dot = {
    ok:       "bg-green-400",
    degraded: "bg-amber-400",
    down:     "bg-red-500",
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-49px)]">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-dashed border-line-2">
        <div className="font-sketch text-[22px] text-text">
          Health
          {!loading && (
            <span className={`ml-3 inline-flex items-center gap-1.5 font-mono text-[12px] px-2.5 py-[3px] rounded-[3px] border ${statusColor[overall]}`}>
              <span className={`w-2 h-2 rounded-full ${dot[overall]} ${overall === "ok" ? "animate-pulse" : ""}`} />
              {overall}
            </span>
          )}
        </div>
        <div className="ml-auto flex items-center gap-3">
          {checkedAt && (
            <span className="font-mono text-[11.5px] text-text-faint">
              checked {checkedAt.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })}
            </span>
          )}
          <button
            onClick={load}
            className="font-mono text-[12px] px-3 py-1.5 rounded-[3px] border border-dashed border-line text-text-dim hover:text-text transition-colors"
          >
            {loading ? "…" : "↺ refresh"}
          </button>
        </div>
      </div>

      <div className="px-5 py-5 flex flex-col gap-3 max-w-[640px]">
        {loading && (
          <div className="py-10 text-center font-mono text-[12px] text-text-faint">Checking…</div>
        )}
        {!loading && checks.map((c) => (
          <div
            key={c.name}
            className="flex items-center gap-4 px-4 py-3 border border-dashed border-line-2 rounded-[3px] bg-bg font-mono text-[12px]"
          >
            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${dot[c.status]} ${c.status === "ok" ? "animate-pulse" : ""}`} />
            <span className="text-text flex-1">{c.name}</span>
            {c.latency_ms !== undefined && (
              <span className="text-text-faint">{c.latency_ms} ms</span>
            )}
            <span className={`px-2 py-[2px] rounded-[3px] border text-[10.5px] ${statusColor[c.status]}`}>
              {c.status}
            </span>
            {c.message && (
              <span className="text-text-dim text-[11.5px] ml-1">{c.message}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
