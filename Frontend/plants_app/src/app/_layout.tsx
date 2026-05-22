// src/app/_layout.tsx
import { Stack } from "expo-router";
import { ThemeProvider, useTheme } from "../context/ThemeContext";
import { useColorScheme } from "nativewind";
import React from "react";
import { StatusBar } from "expo-status-bar";


function AppContent() {
  const { theme } = useTheme();
  const { setColorScheme } = useColorScheme();
  
  // هر بار تم عوض شد به NativeWind بگو
  React.useEffect(() => {
    setColorScheme(theme);
  }, [theme, setColorScheme]);

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <StatusBar style={theme === "dark" ? "light" : "dark"} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}