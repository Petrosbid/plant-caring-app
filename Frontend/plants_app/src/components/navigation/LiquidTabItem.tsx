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

// Spring configuration for liquid effect
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
        ['transparent', '#3B82F6'] // Transition to primary blue
      ),
    };
  });

  const animatedTextStyle = useAnimatedStyle(() => {
    return {
      opacity: progress.value,
      width: progress.value * 60, 
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
          size={24}
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
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 9999, // fully rounded pill
    height: 48,
  },
  text: {
    color: '#FFFFFF',
    fontFamily: 'Vazirmatn-Bold',
    fontSize: 14,
    marginLeft: 8,
    overflow: 'hidden',
  },
});