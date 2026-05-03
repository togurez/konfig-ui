"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useFilters } from "@/lib/filter-context";
import type { SettingType } from "@/lib/data";

const items = [
  { href: "/", label: "Settings", count: "13", section: "Workspace" },
  { href: "/palette", label: "Palette", count: "⌘K", section: "Workspace" },
  { href: "/health", label: "Health", count: "ok", section: "Workspace" },
  { href: "/audit", label: "Audit log", count: "", section: "Workspace" },
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
  const { typeFilter, activeFilter, applyType, applyActive } = useFilters();
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const update = () => {
      setTheme((document.documentElement.getAttribute("data-theme") as "dark" | "light") || "dark");
    };
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  const statusFilters = [
    { l: "All", value: undefined as boolean | undefined },
    { l: "Active", value: true as boolean | undefined },
    { l: "Inactive", value: false as boolean | undefined },
  ];

  const currentActive = activeFilter === true ? true : activeFilter === false ? false : undefined;

  return (
    <aside className="bg-bg border-r border-dashed border-line-2 p-3 w-[200px] shrink-0">
      <div className="px-2 pb-3.5">
        <Link href="/">
          <img
            src={theme === "dark" ? "/konfig-logo-horizontal.svg" : "/konfig-logo-horizontal-light.svg"}
            alt="konfig"
            className="w-full h-auto"
          />
        </Link>
      </div>

      <div className="font-sketch text-[13px] text-text-faint px-2 pt-2.5 pb-1 tracking-wide">Workspace</div>
      {items.map((it, i) => {
        const on = pathname === it.href;
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
      {statusFilters.map((f) => {
        const on = currentActive === f.value;
        return (
          <div
            key={f.l}
            onClick={() => applyActive(f.value)}
            className={`flex items-center gap-2.5 px-2 py-[7px] rounded-[3px] text-[12.5px] font-mono cursor-pointer ${
              on ? "accent-bg text-accent" : "text-text-dim hover:text-text"
            }`}
          >
            <span className={`w-2.5 h-2.5 ${on ? "bg-accent" : "border border-dashed border-line"}`} />
            {f.l}
          </div>
        );
      })}

      <div className="font-sketch text-[13px] text-text-faint px-2 pt-2.5 pb-1">Types</div>
      {typeItems.map((t) => {
        const on = typeFilter === t.label;
        return (
          <div
            key={t.label}
            onClick={() => applyType(on ? undefined : t.label as SettingType)}
            className={`flex items-center gap-2.5 px-2 py-[7px] rounded-[3px] text-[12.5px] font-mono cursor-pointer ${
              on ? "accent-bg text-accent" : "text-text-dim hover:text-text"
            }`}
          >
            <span className={`w-2.5 h-2.5 ${on ? "bg-accent" : "border border-dashed border-line"}`} />
            {t.label}
            <span className="ml-auto text-text-faint text-[11px]">{t.count}</span>
          </div>
        );
      })}
    </aside>
  );
}
