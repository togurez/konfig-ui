import { Sidebar } from "@/components/Sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Btn, Chip, Kbd } from "@/components/Atoms";

export function AppShell({
  title,
  subtitle,
  children,
  drawer,
  toolbar,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  drawer?: React.ReactNode;
  toolbar?: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-bg text-text">
      <header className="flex items-center gap-4 px-6 py-3 border-b border-dashed border-line-2 bg-bg sticky top-0 z-10">
        <div className="font-sketch text-[24px]">
          <span className="text-accent">Konfig</span>
        </div>
        <nav className="flex gap-1 font-sketch text-[16px] ml-4">
          <a href="/" className="px-3 py-1 text-accent border-b-2 border-dashed border-accent">Settings</a>
          <a href="/palette" className="px-3 py-1 text-text-dim hover:text-text">Palette</a>
          <a href="/detail" className="px-3 py-1 text-text-dim hover:text-text">Detail</a>
        </nav>
        <div className="ml-auto"><ThemeToggle /></div>
      </header>

      <div className="flex flex-1 min-w-[1180px]">
        <Sidebar />
        <main className="flex-1 flex flex-col min-w-0">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-dashed border-line-2">
            <div className="font-sketch text-[22px]">
              {title}
              {subtitle && <span className="text-text-dim text-[14px] font-mono ml-3">{subtitle}</span>}
            </div>
            <div className="ml-auto flex gap-2">
              <Btn>Import</Btn>
              <Btn>Export</Btn>
              <Btn variant="primary">+ New setting</Btn>
            </div>
          </div>
          {toolbar && <div className="flex gap-2.5 px-5 py-3 border-b border-dashed border-line-2 items-center flex-wrap">{toolbar}</div>}
          <div className="flex-1 flex min-w-0">
            <div className="flex-1 flex flex-col min-w-0">{children}</div>
            {drawer}
          </div>
        </main>
      </div>
    </div>
  );
}

export function DefaultToolbar() {
  return (
    <>
      <div className="flex-1 min-w-[260px] flex items-center gap-2 border border-dashed border-line px-2.5 py-1.5 rounded-[3px] bg-bg font-mono text-[12px] text-text-faint">
        <span>/</span>
        <span className="text-text">feature</span>
        <span className="text-accent animate-pulse">▌</span>
        <span className="ml-auto"><Kbd>⌘K</Kbd></span>
      </div>
      <Chip on closable>type: feature_flag</Chip>
      <Chip on closable>active</Chip>
      <Chip>+ filter</Chip>
      <span className="font-mono text-[11.5px] text-text-dim border border-dashed border-line px-2.5 py-1.5 rounded-[3px]">sort: updated ↓</span>
      <span className="font-mono text-[11.5px] text-text-dim border border-dashed border-line px-2.5 py-1.5 rounded-[3px]">group: type</span>
    </>
  );
}
