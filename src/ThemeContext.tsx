import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";

// ─── Typy ────────────────────────────────────────────────────────────────────

interface ThemeContextValue {
  isLight: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

// ─── Hooki ───────────────────────────────────────────────────────────────────

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}

/** Zwraca kolory tekstu scroll-reveal dopasowane do aktywnego motywu */
export function useThemeColors() {
  const { isLight } = useTheme();
  return {
    hiddenColor: isLight ? "rgba(0,0,0,0.25)" : "rgba(255,255,255,0.15)",
    scrollColor: isLight ? "rgba(0,0,0,0.9)" : "rgba(255,255,255,0.9)",
  };
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isLight, setIsLight] = useState(
    () => window.matchMedia("(prefers-color-scheme: light)").matches
  );

  const toggleTheme = useCallback(() => {
    setIsLight((prev) => !prev);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", isLight ? "light" : "dark");
  }, [isLight]);

  return (
    <ThemeContext.Provider value={{ isLight, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
