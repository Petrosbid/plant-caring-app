import { Stack } from "expo-router";
import { ThemeProvider, useTheme } from "../context/ThemeContext";
import { AuthProvider } from "../context/AuthContext";
import { useColorScheme } from "nativewind";
import React from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GluestackUIProvider } from "@gluestack-ui/nativewind";
import "../../global.css";
import "../i18n"; // Initialize i18n
import { configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated';

// Disable strict mode for shared value access during render
// This is often triggered by CSS Interop / NativeWind v4 internals in React 19
configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});

function AppContent() {
  const { theme } = useTheme();
  const { colorScheme, setColorScheme } = useColorScheme();
  
  React.useEffect(() => {
    if (colorScheme !== theme) {
      setColorScheme(theme);
    }
  }, [theme, colorScheme, setColorScheme]);

  return (
    <GluestackUIProvider>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style={theme === "dark" ? "light" : "dark"} />
    </GluestackUIProvider>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
