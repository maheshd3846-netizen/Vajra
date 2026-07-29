"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type ThemeMode = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

interface ThemeContextValue {
  theme: ThemeMode;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemeMode) => void;
}

const STORAGE_KEY = "vajra-theme";
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") {
    return "dark";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: ThemeMode) {
  const root = document.documentElement;
  const resolvedTheme = theme === "system" ? getSystemTheme() : theme;

  root.classList.remove("light", "dark", "theme-transition");
  root.classList.add(resolvedTheme === "dark" ? "dark" : "light");
  root.style.colorScheme = resolvedTheme;
  root.dataset.theme = theme;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>("system");
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("dark");
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const storedTheme = window.localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
    const initialTheme: ThemeMode = storedTheme === "light" || storedTheme === "dark" || storedTheme === "system" ? storedTheme : "system";
    setThemeState(initialTheme);
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    const themeValue = theme === "system" ? getSystemTheme() : theme;
    setResolvedTheme(themeValue);
    window.localStorage.setItem(STORAGE_KEY, theme);

    document.documentElement.classList.add("theme-transition");
    applyTheme(theme);

    const timeout = window.setTimeout(() => {
      document.documentElement.classList.remove("theme-transition");
    }, 400);

    return () => window.clearTimeout(timeout);
  }, [theme, isHydrated]);

  useEffect(() => {
    if (!isHydrated || theme !== "system") {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      setResolvedTheme(getSystemTheme());
      applyTheme("system");
    };

    mediaQuery.addEventListener("change", onChange);
    return () => mediaQuery.removeEventListener("change", onChange);
  }, [theme, isHydrated]);

  const setTheme = useCallback((nextTheme: ThemeMode) => {
    setThemeState(nextTheme);
  }, []);

  const value = useMemo(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme, setTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
}