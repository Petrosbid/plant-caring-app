import React from 'react';
import { View } from 'react-native';
import { AppText as Text } from './AppText';
import { BlurView } from 'expo-blur';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  headerIcon?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  title,
  subtitle,
  headerIcon,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <View className={cn(
      "rounded-3xl overflow-hidden border border-white/30 dark:border-slate-700/50 shadow-xl shadow-black/5",
      className
    )}>
      <BlurView
        intensity={isDark ? 30 : 60}
        tint={isDark ? "dark" : "light"}
        className="p-5"
        style={{ backgroundColor: isDark ? 'rgba(30, 41, 59, 0.5)' : 'rgba(255, 255, 255, 0.7)' }}
      >
        {(title || subtitle) && (
          <View className="mb-4 flex-row items-center gap-3">
            {headerIcon && <View>{headerIcon}</View>}
            <View className="flex-1">
              {title && (
                <Text className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                  {title}
                </Text>
              )}
              {subtitle && (
                <Text className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  {subtitle}
                </Text>
              )}
            </View>
          </View>
        )}
        <View>{children}</View>
      </BlurView>
    </View>
  );
};

