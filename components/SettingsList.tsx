"use client";

import { SETTINGS, TYPE_ORDER } from "@/lib/data";
import { KeyCell, TypeBadge, ValueCell, Toggle, Check, Btn } from "@/components/Atoms";
import { EditDrawer } from "@/components/EditDrawer";

export function SettingsList({ showDrawer, showBulk }: { showDrawer: boolean; showBulk: boolean }) {
  const byType: Record<string, typeof SETTINGS> = {};
  SETTINGS.forEach((s) => {
    (byType[s.type] = byType[s.type] || []).push(s);
  });

  const selected = new Set(["feature.dark_mode", "feature.ai_suggestions"]);
  const focusKey = "feature.dark_mode";
  const focus = SETTINGS.find((s) => s.key === focusKey)!;

  return (
    <>
      {showBulk && (
        <div className="flex items-center gap-2.5 px-5 py-2.5 bg-bg-3 border-b border-dashed border-line-2 font-mono text-[12px] text-text-dim">
          <Check on />
          <span>
            <span className="text-accent">2</span> selected
          </span>
          <div className="flex-1" />
          <Btn>Activate</Btn>
          <Btn>Deactivate</Btn>
          <Btn>Delete</Btn>
          <Btn variant="ghost">Clear</Btn>
        </div>
      )}

      <div className="px-5 pb-5">
        <div className="grid grid-cols-[24px_1.4fr_110px_1.6fr_90px_110px_80px] gap-3.5 px-2 py-2 text-[10.5px] text-text-faint tracking-wider uppercase border-b border-solid border-line">
          <Check />
          <span>Key / description</span>
          <span>Type</span>
          <span>Value</span>
          <span>Active</span>
          <span>Updated</span>
          <span>Actions</span>
        </div>

        {TYPE_ORDER.map((t) => (
          <div key={t} className="mt-3.5">
            <div className="flex items-center gap-2.5 px-2 pt-3 pb-2 font-sketch text-[17px] border-b border-dashed border-line">
              <span className="text-text-dim font-mono">▾</span>
              <TypeBadge t={t} />
              <span className="font-mono text-[12px] text-text-dim">{byType[t]?.length || 0}</span>
              <span
                className="flex-1 h-px"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(90deg,rgb(var(--line-2)) 0 4px,transparent 4px 8px)",
                }}
              />
            </div>
            {(byType[t] || []).map((s) => (
              <div
                key={s.key}
                className={`grid grid-cols-[24px_1.4fr_110px_1.6fr_90px_110px_80px] gap-3.5 px-2 py-3 border-b border-dashed border-line-2 items-center font-mono text-[12px] ${
                  selected.has(s.key) || (s.key === focusKey && showDrawer) ? "accent-bg" : ""
                }`}
              >
                <Check on={selected.has(s.key)} />
                <div>
                  <KeyCell k={s.key} />
                  {s.desc && <div className="text-text-dim text-[11.5px] font-ui mt-0.5">{s.desc}</div>}
                </div>
                <TypeBadge t={s.type} />
                <ValueCell v={s.value} />
                <Toggle on={s.active} />
                <span className="text-text-dim">{s.updated}</span>
                <div className="flex gap-2 text-text-faint">
                  <span className="cursor-default px-1.5 py-0.5 rounded-[2px] hover:border hover:border-dashed hover:border-line hover:text-text-dim">edit</span>
                  <span className="cursor-default px-1.5 py-0.5 rounded-[2px]">⋯</span>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-1.5 px-5 py-3.5 border-t border-dashed border-line-2 font-mono text-[11.5px] text-text-dim mt-auto">
        <span>Showing 1–13 of 13</span>
        <div className="flex-1" />
        <span className="px-2 py-0.5 border border-dashed border-line rounded-[2px]">‹</span>
        <span className="px-2 py-0.5 border border-solid border-accent text-accent rounded-[2px]">1</span>
        <span className="px-2 py-0.5 border border-dashed border-line rounded-[2px]">›</span>
        <span className="ml-2.5">per page</span>
        <span className="px-2 py-0.5 border border-dashed border-line rounded-[2px]">20</span>
      </div>

      {showDrawer && (
        <div className="hidden">
          <EditDrawer setting={focus} />
        </div>
      )}
    </>
  );
}
