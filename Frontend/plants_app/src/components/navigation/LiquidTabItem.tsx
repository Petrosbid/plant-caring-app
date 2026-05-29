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
      backgroundColor: interpolateColor(
        progress.value,
        [0, 1],
        ['transparent', '#16a34a']
      ),
      paddingHorizontal: withSpring(isFocused ? 16 : 12),
    };
  });

  const animatedTextStyle = useAnimatedStyle(() => {
    return {
      opacity: progress.value,
      maxWidth: isFocused ? 100 : 0,
      transform: [
        { translateX: (1 - progress.value) * -10 },
        { scale: progress.value },
      ],
    };
  });

  return (
    <Pressable
      onPress={onPress}
      style={styles.pressable}
      accessibilityRole="button"
    >
      <Animated.View style={[styles.container, animatedContainerStyle]}>
        <Icon
          size={20}
          color={isFocused ? '#FFFFFF' : '#94a3b8'}
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
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 46,
    borderRadius: 23,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    marginLeft: 8,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
});

