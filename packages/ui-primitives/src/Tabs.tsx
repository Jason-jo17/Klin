"use client";

import { createContext, useContext, useId, useRef } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import { cn } from "./cn";

interface TabsContextValue {
  value: string;
  setValue: (v: string) => void;
  baseId: string;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext(component: string) {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error(`<${component}> must be used inside <Tabs>`);
  return ctx;
}

export interface TabsProps {
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
  className?: string;
}

export function Tabs({ value, onChange, children, className }: TabsProps) {
  const baseId = useId();
  return (
    <TabsContext.Provider value={{ value, setValue: onChange, baseId }}>
      <div className={cn("kiln-tabs", className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabList({ children, className }: { children: ReactNode; className?: string }) {
  const listRef = useRef<HTMLDivElement>(null);

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const tabs = Array.from(listRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]') ?? []);
    const currentIndex = tabs.findIndex((t) => t === document.activeElement);
    if (currentIndex === -1) return;
    e.preventDefault();
    const delta = e.key === "ArrowRight" ? 1 : -1;
    const next = tabs[(currentIndex + delta + tabs.length) % tabs.length];
    next?.focus();
    next?.click();
  }

  return (
    <div ref={listRef} role="tablist" className={cn("kiln-tabs__list", className)} onKeyDown={onKeyDown}>
      {children}
    </div>
  );
}

export function Tab({ value, children }: { value: string; children: ReactNode }) {
  const { value: active, setValue, baseId } = useTabsContext("Tab");
  const selected = active === value;
  return (
    <button
      type="button"
      role="tab"
      id={`${baseId}-tab-${value}`}
      aria-controls={`${baseId}-panel-${value}`}
      aria-selected={selected ? "true" : "false"}
      tabIndex={selected ? 0 : -1}
      className={cn("kiln-tabs__tab", "kiln-focus-ring", selected && "kiln-tabs__tab--active")}
      onClick={() => setValue(value)}
    >
      {children}
    </button>
  );
}

export function TabPanel({ value, children }: { value: string; children: ReactNode }) {
  const { value: active, baseId } = useTabsContext("TabPanel");
  if (active !== value) return null;
  return (
    <div role="tabpanel" id={`${baseId}-panel-${value}`} aria-labelledby={`${baseId}-tab-${value}`} className="kiln-tabs__panel">
      {children}
    </div>
  );
}
