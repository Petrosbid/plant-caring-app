// src/app/index.tsx (بعد از onboarding یا صفحه اصلی)
import { View, Text, StatusBar } from "react-native";
import { ThemeTransition } from "../components/common/ThemeTransition";
import { useTheme } from "../context/ThemeContext";

export default function HomeScreen() {
  const { theme, toggleTheme } = useTheme();

  return (
    <View className="flex-1 items-center justify-center bg-background-500">
      <StatusBar barStyle={theme === "dark" ? "light-content" : "dark-content"} />
      <ThemeTransition
        onToggle={toggleTheme}
        theme={theme}
        speed={0.6}
        blur={10}
        style={{ marginBottom: 30 }}
      >
        <View className="px-6 py-3 rounded-full bg-primary-500">
          <Text className="text-typography-500 font-bold">
            {theme === "dark" ? "تغییر به روشن" : "تغییر به تاریک"}
          </Text>
        </View>
      </ThemeTransition>
      <Text className="text-typography-500 text-lg">
        وضعیت فعلی: {theme === "dark" ? "تاریک" : "روشن"}
      </Text>
    </View>
  );
}