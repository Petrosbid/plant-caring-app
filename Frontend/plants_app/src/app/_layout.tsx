import { GluestackUIProvider } from "@gluestack-ui/nativewind";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "nativewind";
import React, { useCallback, useEffect } from "react";
import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from "react-native-reanimated";
import * as SplashScreen from "expo-splash-screen";
import {
  useFonts,
  Inter_400Regular,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { Vazirmatn_400Regular } from "@expo-google-fonts/vazirmatn/400Regular";
import { Vazirmatn_700Bold } from "@expo-google-fonts/vazirmatn/700Bold";
// وارد کردن کامپوننت SafeAreaView در کنار SafeAreaProvider
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import "../../global.css";
import { AuthProvider } from "../context/AuthContext";
import { ThemeProvider, useTheme } from "../context/ThemeContext";
import { initI18n } from "../i18n"; // Async i18n init

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Disable strict mode for shared value access during render
// This is often triggered by CSS Interop / NativeWind v4 internals in React 19
configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});

function AppContent() {
  const { theme } = useTheme();
  const { colorScheme, setColorScheme } = useColorScheme();
  const [i18nLoaded, setI18nLoaded] = React.useState(false);

  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_700Bold,
    Vazirmatn_400Regular,
    Vazirmatn_700Bold,
  });

  useEffect(() => {
    initI18n().then(() => setI18nLoaded(true));
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if ((fontsLoaded || fontError) && i18nLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, i18nLoaded]);

  useEffect(() => {
    if (colorScheme !== theme) {
      setColorScheme(theme);
    }
  }, [theme, colorScheme, setColorScheme]);

  if ((!fontsLoaded && !fontError) || !i18nLoaded) {
    return null;
  }

  return (
    <GluestackUIProvider>
      {/* قراردادن SafeAreaView برای جلوگیری از تداخل با هدر و ناوبری گوشی.
        رنگ پس‌زمینه (backgroundColor) بر اساس تم تغییر میکند تا حاشیه‌ها یکدست شوند.
      */}
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: theme === "dark" ? "#121212" : "#ffffff",
        }}
        onLayout={onLayoutRootView}
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
