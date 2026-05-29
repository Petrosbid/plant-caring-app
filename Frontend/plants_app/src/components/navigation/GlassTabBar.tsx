// src/components/navigation/GlassTabBar.tsx
import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { LiquidTabItem } from './LiquidTabItem';
import { Home, Flower2, Cpu, Bell, User } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';

const iconMap: Record<string, any> = {
  Home: Home,
  Garden: Flower2,
  AI: Cpu,
  Reminders: Bell,
  Profile: User,
};

export const GlassTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <View style={styles.container}>
      <BlurView
        intensity={Platform.OS === 'ios' ? (isDark ? 40 : 80) : 100}
        tint={isDark ? 'dark' : 'light'}
        style={[
          styles.blurView,
          {
            borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
            backgroundColor: isDark ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.8)',
          },
        ]}
      >
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

          const isFocused = state.index === index;
          const Icon = iconMap[route.name];

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <LiquidTabItem
              key={route.key}
              label={t(`common.${label.toString().toLowerCase()}`)}
              Icon={Icon}
              isFocused={isFocused}
              onPress={onPress}
            />
          );
        })}
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 45 : 35,
    left: 20,
    right: 20,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
  },
  blurView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 35,
    borderWidth: 1,
    overflow: 'hidden',
  },
});

