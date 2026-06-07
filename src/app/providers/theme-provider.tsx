/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export const APP_THEMES = [
  {
    id: "light",
    name: "Light",
    description: "Текущая базовая светлая тема с мягким банковским акцентом.",
    appearance: "light",
    preview: ["210 25% 97%", "214 27% 92%", "156 56% 30%"],
  },
  {
    id: "dark",
    name: "Dark",
    description: "Чистая тёмная тема для вечерней работы и долгих сессий.",
    appearance: "dark",
    preview: ["222 47% 11%", "222 32% 14%", "214 84% 64%"],
  },
  {
    id: "system",
    name: "System",
    description: "Автоматически повторяет светлую или тёмную тему устройства.",
    appearance: "system",
    preview: ["210 25% 97%", "222 32% 14%", "214 84% 64%"],
  },
] as const;

export type ThemeId = (typeof APP_THEMES)[number]["id"];

type ThemeContextValue = {
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
};

const THEME_STORAGE_KEY = "fintrack.theme";
const DEFAULT_THEME: ThemeId = "light";
const ThemeContext = createContext<ThemeContextValue | null>(null);

const isThemeId = (value: string): value is ThemeId =>
  APP_THEMES.some((theme) => theme.id === value);

const getSystemAppearance = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";

const getThemeAppearance = (themeId: ThemeId): "light" | "dark" => {
  const appearance =
    APP_THEMES.find((theme) => theme.id === themeId)?.appearance ?? "light";
  return appearance === "system" ? getSystemAppearance() : appearance;
};

const readStoredTheme = (): ThemeId => {
  if (typeof window === "undefined") return DEFAULT_THEME;

  try {
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    return storedTheme && isThemeId(storedTheme) ? storedTheme : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
};

const applyTheme = (themeId: ThemeId) => {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  const appearance = getThemeAppearance(themeId);

  root.dataset.theme = appearance;
  root.dataset.themeMode = themeId;
  root.style.colorScheme = appearance;
  root.classList.toggle("dark", appearance === "dark");
};

export const initializeTheme = () => {
  applyTheme(readStoredTheme());
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeId>(() => readStoredTheme());

  useEffect(() => {
    applyTheme(theme);

    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Ignore localStorage failures and keep theme in memory.
    }
  }, [theme]);

  useEffect(() => {
    if (theme !== "system" || typeof window === "undefined") return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme("system");

    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }

  return context;
};
