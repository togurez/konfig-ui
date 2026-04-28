"use client";

import { useUser } from "@auth0/nextjs-auth0";
import { useState, useRef, useEffect } from "react";

export function UserMenu() {
  const { user, isLoading } = useUser();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (isLoading || !user) return null;

  const label = user.name || user.email || "Account";

  return (
    <div ref={ref} className="relative font-mono text-[12px]">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-2.5 py-1.5 border border-dashed border-line rounded-[3px] text-text-dim hover:text-text hover:border-line-2 transition-colors"
      >
        {user.picture && (
          <img src={user.picture} alt="" className="w-4 h-4 rounded-full" />
        )}
        <span>{label}</span>
        <span className="text-text-faint text-[10px]">▾</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-40 border border-dashed border-line-2 bg-bg-2 rounded-[3px] shadow-lg z-50">
          <a
            href="/auth/logout"
            className="block px-3 py-2 text-text-dim hover:text-text hover:bg-bg-3 transition-colors"
          >
            Logout
          </a>
        </div>
      )}
    </div>
  );
}
