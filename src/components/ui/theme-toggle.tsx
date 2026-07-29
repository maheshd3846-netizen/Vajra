"use client";

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Monitor, Moon, Sun } from "lucide-react";
import { ThemeMode, useTheme } from "@/components/providers/ThemeProvider";
import { cn } from "@/lib/utils";

const OPTIONS: Array<{ value: ThemeMode; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

export function ThemeToggle({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const { theme, resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    window.addEventListener("mousedown", onPointerDown);
    return () => window.removeEventListener("mousedown", onPointerDown);
  }, []);

  const activeTheme = theme === "system" ? resolvedTheme : theme;
  const ActiveIcon = activeTheme === "dark" ? Moon : Sun;

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex items-center gap-2 rounded-xl border border-border/80 bg-background/80 px-3 py-2 text-xs font-medium text-foreground shadow-sm backdrop-blur-md transition-all hover:-translate-y-0.5 hover:shadow-lg"
        aria-label="Change theme"
        aria-expanded={open}
      >
        <ActiveIcon className="h-4 w-4" />
        <span className="hidden sm:inline">{theme === "system" ? `System (${resolvedTheme})` : `${theme[0].toUpperCase()}${theme.slice(1)}`}</span>
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-44 overflow-hidden rounded-2xl border border-border/80 bg-popover/95 p-2 shadow-2xl backdrop-blur-xl"
          >
            {OPTIONS.map((option) => {
              const Icon = option.icon;
              const isSelected = option.value === theme;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setTheme(option.value);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition-colors hover:bg-muted/70",
                    isSelected && "bg-muted/80 text-foreground"
                  )}
                >
                  <span className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-primary" />
                    {option.label}
                  </span>
                  {isSelected ? <Check className="h-4 w-4 text-primary" /> : null}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}