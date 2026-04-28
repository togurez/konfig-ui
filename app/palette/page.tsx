"use client";

import { SETTINGS } from "@/lib/data";
import { TypeBadge, KeyCell, ValueCell, Toggle, Chip, Kbd } from "@/components/Atoms";

export default function PalettePage() {
  const rows = SETTINGS.filter((s) => s.type === "feature_flag");
  const actions = [
    { hint: "new feature_flag", icon: "+" },
    { hint: "toggle all matching — active", icon: "~" },
    { hint: "export matching as JSON", icon: "↓" },
  ];

  return (
    <div className="bg-bg-2 min-h-[calc(100vh-49px)] py-14 px-6 flex flex-col items-center gap-5">
      <div className="font-sketch text-[15px] text-text-dim text-center leading-snug max-w-[760px]">
        <span className="text-accent">⌘K</span> is home. Type to filter, <span className="text-accent">↑↓</span> to navigate,{" "}
        <span className="text-accent">↵</span> to edit, <span className="text-accent">space</span> to toggle.
      </div>

      <div className="w-full max-w-[760px] bg-bg border border-solid border-line rounded-md shadow-[0_18px_60px_rgb(0_0_0/0.5)] overflow-hidden">
        {/* Head */}
        <div className="flex items-center gap-2.5 px-3.5 py-3 border-b border-dashed border-line-2 font-mono text-[13px] text-text">
          <span className="text-accent">&gt;</span>
          <span className="text-text">type:feature_flag active:true </span>
          <span>rollout</span>
          <span className="text-accent animate-pulse">▌</span>
          <span className="ml-auto text-[10.5px] text-text-faint border border-dashed border-line px-2 py-0.5 rounded-full">
            4 results · 11 hidden
          </span>
        </div>

        {/* Filter chips */}
        <div className="flex flex-wrap gap-1.5 px-3.5 py-2.5 border-b border-dashed border-line-2">
          <Chip on closable>type: feature_flag</Chip>
          <Chip on closable>active: true</Chip>
          <Chip>+ updated &lt; 7d</Chip>
          <Chip>+ key ~ …</Chip>
        </div>

        {/* Results */}
        <div className="p-2">
          <h5 className="font-sketch text-[13px] text-text-faint mx-2.5 my-1">Settings · {rows.length} matching</h5>
          {rows.map((r, i) => (
            <div
              key={r.key}
              className={`grid grid-cols-[18px_1.3fr_100px_1.2fr_60px_56px] gap-3 items-center px-2.5 py-2 rounded-[3px] font-mono text-[12px] ${
                i === 0 ? "accent-bg outline outline-1 outline-accent" : ""
              }`}
            >
              <span className={i === 0 ? "text-accent" : "text-text-faint"}>{i === 0 ? "▸" : ""}</span>
              <span><KeyCell k={r.key} /></span>
              <span><TypeBadge t={r.type} /></span>
              <span><ValueCell v={r.value} /></span>
              <span><Toggle on={r.active} /></span>
              <span className={`text-[10.5px] ${i === 0 ? "text-accent" : "text-transparent"}`}>↵ edit</span>
            </div>
          ))}

          <h5 className="font-sketch text-[13px] text-text-faint mx-2.5 mt-3 mb-1">Actions on filter</h5>
          {actions.map((a) => (
            <div
              key={a.hint}
              className="grid grid-cols-[18px_1fr_80px] gap-3 items-center px-2.5 py-2 rounded-[3px] font-mono text-[12px]"
            >
              <span className="text-accent-dim">{a.icon}</span>
              <span className="text-text-dim">{a.hint}</span>
              <span className="text-[10.5px] text-text-faint opacity-70">⌘↵</span>
            </div>
          ))}
        </div>

        {/* Foot */}
        <div className="flex items-center gap-3.5 px-3.5 py-2.5 border-t border-dashed border-line-2 font-mono text-[11px] text-text-faint">
          <span className="flex items-center gap-1.5"><Kbd>↑↓</Kbd> navigate</span>
          <span className="flex items-center gap-1.5"><Kbd>↵</Kbd> edit</span>
          <span className="flex items-center gap-1.5"><Kbd>space</Kbd> toggle</span>
          <span className="flex items-center gap-1.5"><Kbd>⌘N</Kbd> new</span>
          <span className="flex-1" />
          <span>konfig v0.3 · 13 keys</span>
        </div>
      </div>

      {/* Preview card */}
      <div className="w-full max-w-[760px] border border-dashed border-line rounded bg-bg p-4 font-mono text-[12px] text-text-dim">
        <div className="text-accent text-[13px] mb-1.5">feature.dark_mode</div>
        <div className="text-text-dim mb-2">Enable the new dark-mode UI for a % of users</div>
        <div className="bg-bg-2 border border-dashed border-line rounded-[3px] px-2.5 py-2 font-mono text-[12px]">
          <div><span className="text-text-faint">{"{"}</span></div>
          <div>{"  "}<span className="text-accent">&quot;enabled&quot;</span><span className="text-text-faint">:</span> <span className="text-fuchsia-300">true</span><span className="text-text-faint">,</span></div>
          <div>{"  "}<span className="text-accent">&quot;rollout_percentage&quot;</span><span className="text-text-faint">:</span> <span className="text-amber-300">50</span></div>
          <div><span className="text-text-faint">{"}"}</span></div>
        </div>
        <div className="flex gap-4 text-text-faint text-[11px] mt-2">
          <span>type: <span className="text-accent">feature_flag</span></span>
          <span>active: <span className="text-accent">true</span></span>
          <span>updated 2h ago</span>
          <span className="ml-auto">↵ edit · ⌫ delete</span>
        </div>
      </div>
    </div>
  );
}
