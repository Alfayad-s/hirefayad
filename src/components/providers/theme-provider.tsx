"use client";

import {
  createContext,
  useContext,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
export type Theme = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyTheme() {
  const root = document.documentElement;
  root.classList.remove("light");
  root.classList.add("dark");
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = "dark" as const;

  useEffect(() => {
    applyTheme();
  }, []);

  const setTheme = useCallback((_t: Theme) => {
    /* theme locked to dark */
  }, []);

  const toggleTheme = useCallback(() => {
    /* theme locked to dark */
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  return (
    ctx ?? {
      theme: "dark" as Theme,
      setTheme: () => {},
      toggleTheme: () => {},
    }
  );
}
