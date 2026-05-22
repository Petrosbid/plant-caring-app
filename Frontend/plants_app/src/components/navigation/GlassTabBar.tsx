// src/components/navigation/GlassTabBar.tsx
import React from 'react';
import { View, StyleSheet, useColorScheme } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { LiquidTabItem } from './LiquidTabItem';
import { Home, Phone, PlusCircle, Star, MoreHorizontal } from 'lucide-react-native';

const iconMap: Record<string, any> = {
  Home: Home,
  Calls: Phone,
  Activate: PlusCircle,
  Favorites: Star,
  More: MoreHorizontal,
};

export const GlassTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={styles.container}>
      <BlurView
        intensity={isDark ? 40 : 80}
        tint={isDark ? 'dark' : 'light'}
        style={[
          styles.blurView,
          {
            borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.3)',
            backgroundColor: isDark ? 'rgba(15, 23, 42, 0.6)' : 'rgba(255, 255, 255, 0.7)',
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
              label={label as string}
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
    bottom: 24,
    left: 20,
    right: 20,
    elevation: 8, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  blurView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 30,
    borderWidth: 1,
    overflow: 'hidden',
  },
});