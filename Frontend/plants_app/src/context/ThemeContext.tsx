// src/context/ThemeContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from "nativewind";

type ThemeMode = "light" | "dark";

interface ThemeContextType {
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  toggleTheme: () => {},
  setTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

const THEME_KEY = "@theme_mode";

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setThemeState] = useState<ThemeMode>("light");
  const [loaded, setLoaded] = useState(false);

  // بارگذاری تنظیمات ذخیره‌شده هنگام mount
  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((stored) => {
      if (stored === "dark" || stored === "light") {
        setThemeState(stored);
      } else {
        // اگر ذخیره نشده بود از تم سیستم استفاده کن (اختیاری: می‌توانی اینجا تشخیص دهی)
        setThemeState("light");
      }
      setLoaded(true);
    });
  }, []);

  // همگام‌سازی ذخیره‌سازی با تغییر تم
  useEffect(() => {
    if (loaded) {
      AsyncStorage.setItem(THEME_KEY, theme);
    }
  }, [theme, loaded]);

  const setTheme = useCallback((mode: ThemeMode) => {
    setThemeState(mode);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  if (!loaded) {
    // می‌توانی یک splash ساده بگذاری تا بارگذاری اولیه تمام شود
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
