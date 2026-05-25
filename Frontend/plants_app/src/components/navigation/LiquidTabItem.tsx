// src/components/navigation/LiquidTabItem.tsx
import React, { useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolateColor,
} from 'react-native-reanimated';
import { LucideIcon } from 'lucide-react-native';

interface LiquidTabItemProps {
  label: string;
  Icon: LucideIcon;
  isFocused: boolean;
  onPress: () => void;
}

const springConfig = {
  damping: 15,
  stiffness: 120,
  mass: 0.8,
};

export const LiquidTabItem: React.FC<LiquidTabItemProps> = ({
  label,
  Icon,
  isFocused,
  onPress,
}) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withSpring(isFocused ? 1 : 0, springConfig);
  }, [isFocused]);

  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      flex: isFocused ? 2 : 1,
      backgroundColor: interpolateColor(
        progress.value,
        [0, 1],
        ['transparent', '#16a34a'] // Brand 600
      ),
    };
  });

  const animatedTextStyle = useAnimatedStyle(() => {
    return {
      opacity: progress.value,
      width: progress.value * 70, 
      transform: [{ scale: progress.value }],
    };
  });

  return (
    <Pressable
      onPress={onPress}
      style={styles.pressable}
      accessibilityRole="button"
      accessibilityState={{ selected: isFocused }}
    >
      <Animated.View style={[styles.container, animatedContainerStyle]}>
        <Icon
          size={22}
          color={isFocused ? '#FFFFFF' : '#64748b'}
          strokeWidth={isFocused ? 2.5 : 2}
        />
        {isFocused && (
          <Animated.Text
            style={[styles.text, animatedTextStyle]}
            numberOfLines={1}
          >
            {label}
          </Animated.Text>
        )}
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  pressable: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 9999,
    height: 44,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 6,
    overflow: 'hidden',
  },
});

