import React from 'react';
import { View, Text } from "react-native";
import { ThemeTransition } from "../common/ThemeTransition";
import { useTheme } from "../../context/ThemeContext";

export function HomeContent() {
  const { theme, toggleTheme } = useTheme();

  return (
    <View className="flex-1 items-center justify-center bg-background-500">
      <ThemeTransition
        onToggle={toggleTheme}
        theme={theme}
        speed={0.55}
        blur={8}
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

