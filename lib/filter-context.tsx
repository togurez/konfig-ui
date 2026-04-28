"use client";

import { createContext, useContext, useState } from "react";
import type { SettingType } from "@/lib/data";

interface FilterState {
  typeFilter: SettingType | undefined;
  activeFilter: boolean | undefined;
  page: number;
  setTypeFilter: (t: SettingType | undefined) => void;
  setActiveFilter: (a: boolean | undefined) => void;
  setPage: (p: number) => void;
  applyType: (t: SettingType | undefined) => void;
  applyActive: (a: boolean | undefined) => void;
}

const FilterContext = createContext<FilterState | null>(null);

export function FilterProvider({ children }: { children: React.ReactNode }) {
  const [typeFilter, setTypeFilter] = useState<SettingType | undefined>(undefined);
  const [activeFilter, setActiveFilter] = useState<boolean | undefined>(undefined);
  const [page, setPage] = useState(1);

  const applyType = (t: SettingType | undefined) => { setTypeFilter(t); setPage(1); };
  const applyActive = (a: boolean | undefined) => { setActiveFilter(a); setPage(1); };

  return (
    <FilterContext.Provider value={{ typeFilter, activeFilter, page, setTypeFilter, setActiveFilter, setPage, applyType, applyActive }}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters() {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error("useFilters must be used inside FilterProvider");
  return ctx;
}
