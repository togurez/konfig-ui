"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "Settings", count: "13", section: "Workspace" },
  { href: "/palette", label: "Palette", count: "⌘K", section: "Workspace" },
  { href: "/detail", label: "Health", count: "ok", section: "Workspace" },
  { href: "/detail", label: "Audit log", count: "soon", section: "Workspace" },
];

const typeItems = [
  { label: "feature_flag", count: "4" },
  { label: "limit", count: "3" },
  { label: "appearance", count: "2" },
  { label: "integration", count: "2" },
  { label: "custom", count: "1" },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="bg-bg border-r border-dashed border-line-2 p-3 w-[200px] shrink-0">
      <div className="flex items-center gap-2 px-2 pb-3.5 font-mono text-[13px]">
        <span className="w-2.5 h-2.5 rounded-[2px] bg-accent" />
        konfig
      </div>

      <div className="font-sketch text-[13px] text-text-faint px-2 pt-2.5 pb-1 tracking-wide">Workspace</div>
      {items.map((it, i) => {
        const on = pathname === it.href && i === 0;
        return (
          <Link
            key={i}
            href={it.href}
            className={`flex items-center gap-2.5 px-2 py-[7px] rounded-[3px] text-[12.5px] font-mono ${
              on
                ? "accent-bg text-accent border-l-2 border-accent pl-[6px]"
                : "text-text-dim hover:text-text"
            }`}
          >
            <span className={`w-2.5 h-2.5 ${on ? "bg-accent" : "border border-dashed border-line"}`} />
            {it.label}
            <span className="ml-auto text-text-faint text-[11px]">{it.count}</span>
          </Link>
        );
      })}

      <div className="font-sketch text-[13px] text-text-faint px-2 pt-2.5 pb-1">Filters</div>
      {[
        { l: "All", c: "" },
        { l: "Active", c: "10" },
        { l: "Inactive", c: "3" },
      ].map((f) => (
        <div key={f.l} className="flex items-center gap-2.5 px-2 py-[7px] text-[12.5px] font-mono text-text-dim">
          <span className="w-2.5 h-2.5 border border-dashed border-line" />
          {f.l}
          <span className="ml-auto text-text-faint text-[11px]">{f.c}</span>
        </div>
      ))}

      <div className="font-sketch text-[13px] text-text-faint px-2 pt-2.5 pb-1">Types</div>
      {typeItems.map((t) => (
        <div key={t.label} className="flex items-center gap-2.5 px-2 py-[7px] text-[12.5px] font-mono text-text-dim">
          <span className="w-2.5 h-2.5 border border-dashed border-line" />
          {t.label}
          <span className="ml-auto text-text-faint text-[11px]">{t.count}</span>
        </div>
      ))}
    </aside>
  );
}
