"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { gql } from "@apollo/client";
import { apolloClient } from "@/lib/apollo";
import { bulkAction, type ApiSetting } from "@/lib/api";
import { TypeBadge, ValueCell, Toggle, Kbd } from "@/components/Atoms";

const SEARCH_SETTINGS = gql`
  query SearchSettings($q: String, $per_page: Int) {
    searchSettings(q: $q, per_page: $per_page) {
      total
      hidden
      data {
        id
        key
        settingType
        value
        description
        isActive
        updatedAt
      }
    }
  }
`;

const BULK_ACTIONS = [
  { hint: "activate all matching", icon: "~", action: "activate" as const },
  { hint: "deactivate all matching", icon: "~", action: "deactivate" as const },
  { hint: "export matching as JSON", icon: "↓", action: null },
];

export default function PalettePage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ApiSetting[]>([]);
  const [total, setTotal] = useState(0);
  const [hidden, setHidden] = useState(0);
  const [loading, setLoading] = useState(false);
  const [cursor, setCursor] = useState(0);
  const [bulkMsg, setBulkMsg] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback((q: string) => {
    setLoading(true);
    apolloClient
      .query({
        query: SEARCH_SETTINGS,
        variables: { q: q || undefined, per_page: 10 },
      })
      .then(({ data }) => {
        const page = data.searchSettings;
        // Map GQL camelCase back to the shape TypeBadge/ValueCell/Toggle expect
        setResults(page.data);
        setTotal(page.total);
        setHidden(page.hidden);
        setCursor(0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    search("");
    inputRef.current?.focus();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(query), 120);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, search]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setCursor((c) => Math.min(c + 1, results.length - 1)); }
    if (e.key === "ArrowUp")   { e.preventDefault(); setCursor((c) => Math.max(c - 1, 0)); }
    if (e.key === "Escape")    setQuery("");
  };

  const runBulk = async (action: "activate" | "deactivate") => {
    setBulkMsg(null);
    try {
      const res = await bulkAction({ q: query || undefined }, action);
      setBulkMsg(`${action}: ${res.affected} affected of ${res.matched} matched`);
      search(query);
    } catch (e: unknown) {
      setBulkMsg(`Error: ${e instanceof Error ? e.message : String(e)}`);
    }
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(results, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "settings.json";
    a.click();
  };

  return (
    <div className="bg-bg-2 min-h-[calc(100vh-49px)] py-14 px-6 flex flex-col items-center gap-5">
      <div className="font-sketch text-[15px] text-text-dim text-center leading-snug max-w-[760px]">
        <span className="text-accent">⌘K</span> is home. Type to filter,{" "}
        <span className="text-accent">↑↓</span> to navigate,{" "}
        <span className="text-accent">↵</span> to edit,{" "}
        <span className="text-accent">space</span> to toggle.
      </div>

      <div className="w-full max-w-[760px] bg-bg border border-solid border-line rounded-md shadow-[0_18px_60px_rgb(0_0_0/0.5)] overflow-hidden">
        {/* Input */}
        <div className="flex items-center gap-2.5 px-3.5 py-3 border-b border-dashed border-line-2 font-mono text-[13px] text-text">
          <span className="text-accent">&gt;</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="search settings…"
            className="flex-1 bg-transparent outline-none text-text placeholder:text-text-faint"
          />
          {loading && <span className="text-text-faint text-[11px]">…</span>}
          <span className="text-[10.5px] text-text-faint border border-dashed border-line px-2 py-0.5 rounded-full">
            {total} results{hidden > 0 ? ` · ${hidden} hidden` : ""}
          </span>
        </div>

        {/* Results */}
        <div className="p-2">
          {results.length > 0 && (
            <>
              <h5 className="font-sketch text-[13px] text-text-faint mx-2.5 my-1">
                Settings · {total} matching
              </h5>
              {results.map((r, i) => (
                <div
                  key={r.key}
                  onClick={() => setCursor(i)}
                  className={`grid grid-cols-[18px_1.3fr_100px_1.2fr_60px_56px] gap-3 items-center px-2.5 py-2 rounded-[3px] font-mono text-[12px] cursor-pointer ${
                    i === cursor ? "accent-bg outline outline-1 outline-accent" : "hover:bg-bg-3"
                  }`}
                >
                  <span className={i === cursor ? "text-accent" : "text-text-faint"}>
                    {i === cursor ? "▸" : ""}
                  </span>
                  <span className="text-text truncate">{r.key}</span>
                  <TypeBadge t={r.settingType} />
                  <ValueCell v={r.value} />
                  <Toggle on={r.isActive} />
                  <span className={`text-[10.5px] ${i === cursor ? "text-accent" : "text-transparent"}`}>
                    ↵ edit
                  </span>
                </div>
              ))}
            </>
          )}

          {!loading && results.length === 0 && (
            <div className="px-2.5 py-4 text-center font-mono text-[12px] text-text-faint">
              No results{query ? ` for "${query}"` : ""}.
            </div>
          )}

          {/* Bulk actions */}
          <h5 className="font-sketch text-[13px] text-text-faint mx-2.5 mt-3 mb-1">Actions on filter</h5>
          {BULK_ACTIONS.map((a) => (
            <div
              key={a.hint}
              onClick={() => {
                if (a.action) runBulk(a.action);
                else exportJSON();
              }}
              className="grid grid-cols-[18px_1fr_80px] gap-3 items-center px-2.5 py-2 rounded-[3px] font-mono text-[12px] cursor-pointer hover:bg-bg-3"
            >
              <span className="text-accent-dim">{a.icon}</span>
              <span className="text-text-dim">{a.hint}</span>
              <span className="text-[10.5px] text-text-faint opacity-70">⌘↵</span>
            </div>
          ))}

          {bulkMsg && (
            <div className="mx-2.5 mt-2 px-3 py-2 bg-bg-3 border border-dashed border-line rounded-[3px] font-mono text-[11.5px] text-text-dim">
              {bulkMsg}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3.5 px-3.5 py-2.5 border-t border-dashed border-line-2 font-mono text-[11px] text-text-faint">
          <span className="flex items-center gap-1.5"><Kbd>↑↓</Kbd> navigate</span>
          <span className="flex items-center gap-1.5"><Kbd>↵</Kbd> edit</span>
          <span className="flex items-center gap-1.5"><Kbd>esc</Kbd> clear</span>
          <span className="flex items-center gap-1.5"><Kbd>⌘N</Kbd> new</span>
          <span className="flex-1" />
          <span>konfig · {total} keys</span>
        </div>
      </div>
    </div>
  );
}
