import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const THEME_STORAGE_KEY = "kitchenknot_theme_mode";

const sharedTheme = {
  spacing: {
    xs: 6,
    sm: 10,
    md: 16,
    lg: 20,
    xl: 28
  },
  radius: {
    sm: 12,
    md: 18,
    lg: 26,
    xl: 34
  }
};

const lightColors = {
  background: "#f5f3ec",
  surface: "#fffdf8",
  surfaceStrong: "#f0ecdf",
  card: "#fffaf2",
  text: "#18322c",
  textSoft: "#5f756d",
  textMuted: "#7f948d",
  primary: "#285c4d",
  primaryStrong: "#1c483b",
  primarySoft: "#dce8e1",
  accent: "#8fbf8f",
  accentStrong: "#5e8f69",
  cream: "#efe5d0",
  creamStrong: "#ddcfb0",
  white: "#ffffff",
  border: "#dfe6da",
  overlay: "rgba(12, 32, 26, 0.28)",
  danger: "#9d4c40",
  control: "#f7ebe7"
};

const darkColors = {
  background: "#111917",
  surface: "#182421",
  surfaceStrong: "#22302c",
  card: "#1b2825",
  text: "#f4efe3",
  textSoft: "#b8c8c0",
  textMuted: "#8da39b",
  primary: "#3f7d66",
  primaryStrong: "#a9d4bc",
  primarySoft: "#27453b",
  accent: "#93b983",
  accentStrong: "#b9ddaa",
  cream: "#3a3227",
  creamStrong: "#5b4f3d",
  white: "#ffffff",
  border: "#31423c",
  overlay: "rgba(2, 8, 6, 0.56)",
  danger: "#d18a7c",
  control: "#2d2520"
};

function buildTheme(mode) {
  const isDark = mode === "dark";
  const colors = isDark ? darkColors : lightColors;

  return {
    ...sharedTheme,
    mode,
    isDark,
    colors,
    shadow: {
      shadowColor: isDark ? "#000000" : "#20342e",
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: isDark ? 0.22 : 0.08,
      shadowRadius: 24,
      elevation: 5
    }
  };
}

const ThemeContext = createContext({
  theme: buildTheme("light"),
  mode: "light",
  setMode: () => {},
  toggleMode: () => {}
});

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState("light");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function loadStoredTheme() {
      try {
        const storedMode = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (storedMode === "light" || storedMode === "dark") {
          setMode(storedMode);
        }
      } finally {
        setReady(true);
      }
    }

    loadStoredTheme();
  }, []);

  async function persistMode(nextMode) {
    setMode(nextMode);
    await AsyncStorage.setItem(THEME_STORAGE_KEY, nextMode);
  }

  const value = useMemo(
    () => ({
      theme: buildTheme(mode),
      mode,
      setMode: persistMode,
      toggleMode: () => persistMode(mode === "dark" ? "light" : "dark"),
      ready
    }),
    [mode, ready]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  return useContext(ThemeContext);
}

export const theme = buildTheme("light");
