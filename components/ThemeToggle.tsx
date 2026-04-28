"use client";

import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const stored = (localStorage.getItem("kf_theme") as "dark" | "light") || "dark";
    setTheme(stored);
    document.documentElement.setAttribute("data-theme", stored);
  }, []);

  const flip = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("kf_theme", next);
  };

  return (
    <button
      onClick={flip}
      className="inline-flex items-center gap-1.5 border border-dashed border-line text-text-dim font-mono text-[11px] px-2.5 py-1.5 rounded-[3px] hover:text-text hover:border-text-dim"
      title="Toggle theme"
    >
      <span
        className={`w-2.5 h-2.5 rounded-full ${
          theme === "dark" ? "bg-accent" : "border-[1.5px] border-accent"
        }`}
      />
      {theme}
      <span className="text-text-faint ml-1">⇄</span>
    </button>
  );
}
