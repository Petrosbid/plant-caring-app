import { GluestackUIProvider } from "@gluestack-ui/nativewind";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "nativewind";
import React from "react";
import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from "react-native-reanimated";
// وارد کردن کامپوننت SafeAreaView در کنار SafeAreaProvider
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import "../../global.css";
import { AuthProvider } from "../context/AuthContext";
import { ThemeProvider, useTheme } from "../context/ThemeContext";
import "../i18n"; // Initialize i18n

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
      {/* قراردادن SafeAreaView برای جلوگیری از تداخل با هدر و ناوبری گوشی.
        رنگ پس‌زمینه (backgroundColor) بر اساس تم تغییر میکند تا حاشیه‌ها یکدست شوند.
      */}
      <SafeAreaView 
        style={{ 
          flex: 1, 
          backgroundColor: theme === "dark" ? "#121212" : "#ffffff" 
        }}
      >
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style={theme === "dark" ? "light" : "dark"} />
      </SafeAreaView>
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