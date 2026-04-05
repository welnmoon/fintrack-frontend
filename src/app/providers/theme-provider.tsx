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
    id: "midnight-blue",
    name: "Midnight Blue",
    description: "Глубокий синий с холодным контрастом для классического fintech.",
    appearance: "dark",
    preview: ["216 59% 10%", "214 42% 15%", "210 66% 57%"],
  },
  {
    id: "slate-sage",
    name: "Slate & Sage",
    description: "Серо-зелёная тема с ощущением спокойствия и private banking.",
    appearance: "dark",
    preview: ["180 21% 14%", "168 22% 17%", "153 40% 52%"],
  },
  {
    id: "warm-neutral",
    name: "Warm Neutral",
    description: "Тёплый кремовый интерфейс с премиальным, но спокойным характером.",
    appearance: "light",
    preview: ["38 38% 96%", "36 28% 88%", "37 35% 64%"],
  },
  {
    id: "deep-charcoal",
    name: "Deep Charcoal",
    description: "Графитовая тема с янтарным акцентом для активного dashboard UI.",
    appearance: "dark",
    preview: ["0 0% 10%", "0 0% 18%", "38 91% 55%"],
  },
  {
    id: "arctic",
    name: "Arctic / Ice Blue",
    description: "Светлая ледяная тема с технологичным настроением.",
    appearance: "light",
    preview: ["210 44% 96%", "206 54% 90%", "204 62% 45%"],
  },
  {
    id: "monochrome",
    name: "Monochrome",
    description: "Высокий контраст в серой гамме с живым зелёным акцентом.",
    appearance: "light",
    preview: ["0 0% 96%", "0 0% 53%", "142 71% 45%"],
  },
] as const;

export type ThemeId = (typeof APP_THEMES)[number]["id"];
type ThemeAppearance = (typeof APP_THEMES)[number]["appearance"];

type ThemeContextValue = {
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
};

const THEME_STORAGE_KEY = "fintrack.theme";
const DEFAULT_THEME: ThemeId = "light";
const ThemeContext = createContext<ThemeContextValue | null>(null);

const isThemeId = (value: string): value is ThemeId =>
  APP_THEMES.some((theme) => theme.id === value);

const getThemeAppearance = (themeId: ThemeId): ThemeAppearance =>
  APP_THEMES.find((theme) => theme.id === themeId)?.appearance ?? "light";

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

  root.dataset.theme = themeId;
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
