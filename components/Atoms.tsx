import type { SettingType } from "@/lib/data";

export function TypeBadge({ t }: { t: SettingType }) {
  const map: Record<SettingType, string> = {
    feature_flag: "border-[rgb(161,117,65)] text-accent",
    limit: "border-[rgb(90,100,120)] text-slate-300",
    appearance: "border-[rgb(130,90,140)] text-fuchsia-200",
    integration: "border-[rgb(80,130,130)] text-teal-200",
    custom: "border-line text-text-dim",
  };
  const dotMap: Record<SettingType, string> = {
    feature_flag: "bg-accent",
    limit: "bg-slate-300",
    appearance: "bg-fuchsia-300",
    integration: "bg-teal-300",
    custom: "bg-text-dim",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 font-mono text-[10.5px] px-2 py-[2px] rounded-[3px] border ${map[t]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotMap[t]}`} />
      {t}
    </span>
  );
}

export function KeyCell({ k }: { k: string }) {
  const i = k.lastIndexOf(".");
  if (i < 0) return <span className="text-text">{k}</span>;
  return (
    <span className="text-text">
      <span className="text-text-faint">{k.slice(0, i + 1)}</span>
      {k.slice(i + 1)}
    </span>
  );
}

export function Toggle({ on }: { on: boolean }) {
  return (
    <span
      className={`relative inline-block w-7 h-4 rounded-full border ${
        on ? "border-solid border-accent accent-bg" : "border-dashed border-line"
      }`}
    >
      <span
        className={`absolute top-[1.5px] w-2.5 h-2.5 rounded-full ${
          on ? "right-[2px] bg-accent" : "left-[2px] bg-text-faint"
        }`}
      />
    </span>
  );
}

export function Check({ on }: { on?: boolean }) {
  return (
    <span
      className={`inline-block w-3.5 h-3.5 rounded-[2px] border ${
        on ? "bg-accent border-accent border-solid relative" : "border-dashed border-line"
      }`}
    >
      {on && (
        <span className="absolute inset-0 grid place-items-center text-bg text-[10px] leading-none">
          ✓
        </span>
      )}
    </span>
  );
}

export function ValueCell({ v }: { v: unknown }) {
  if (typeof v === "boolean")
    return <span className={`font-mono text-[12px] ${v ? "text-accent" : "text-text-faint"}`}>{String(v)}</span>;
  if (typeof v === "number") return <span className="font-mono text-[12px] text-accent-dim">{v.toLocaleString()}</span>;
  if (typeof v === "string")
    return <span className="font-mono text-[12px] text-accent-dim">&quot;{v.length > 28 ? v.slice(0, 28) + "…" : v}&quot;</span>;
  if (v && typeof v === "object") {
    const keys = Object.keys(v).slice(0, 2).join(", ");
    return (
      <span className="font-mono text-[12px] text-text-dim">
        {"{ "}
        {keys}
        {Object.keys(v as object).length > 2 ? ", …" : ""}
        {" }"}
      </span>
    );
  }
  return <span className="text-text-faint">—</span>;
}

export function Chip({
  on,
  children,
  closable,
  onClick,
}: {
  on?: boolean;
  children: React.ReactNode;
  closable?: boolean;
  onClick?: () => void;
}) {
  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-2.5 py-[5px] rounded-full font-mono text-[11px] border ${
        on ? "border-solid border-accent text-accent accent-bg" : "border-dashed border-line text-text-dim"
      } ${onClick ? "cursor-pointer" : ""}`}
    >
      {children}
      {closable && <span className="text-text-faint">×</span>}
    </span>
  );
}

export function Btn({
  variant = "default",
  children,
  onClick,
}: {
  variant?: "default" | "primary" | "ghost" | "danger";
  children: React.ReactNode;
  onClick?: () => void;
}) {
  const v =
    variant === "primary"
      ? "bg-accent text-bg border-solid border-accent"
      : variant === "danger"
      ? "text-[rgb(210,130,110)] border-dashed border-[rgb(150,90,80)]"
      : variant === "ghost"
      ? "border-transparent text-text-dim"
      : "border-dashed border-line text-text-dim hover:text-text hover:border-text-dim";
  return (
    <button
      onClick={onClick}
      className={`font-mono text-[12px] px-3 py-1.5 rounded-[3px] border ${v} transition-colors`}
    >
      {children}
    </button>
  );
}

export function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono text-[10.5px] px-1.5 py-[2px] border border-solid border-line rounded-[2px] text-text-faint bg-bg">
      {children}
    </span>
  );
}
