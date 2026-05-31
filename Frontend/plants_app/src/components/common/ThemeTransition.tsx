import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  Pressable,
  Animated,
  Dimensions,
  StyleProp,
  ViewStyle,
  Modal,
  StyleSheet,
  GestureResponderEvent,
} from 'react-native';
import { BlurView } from 'expo-blur';

export interface ThemeTransitionProps {
  children: React.ReactNode;
  onToggle?: () => void;
  theme?: 'light' | 'dark';
  style?: StyleProp<ViewStyle>;
  speed?: number;
  blur?: number;
}

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

function getMaxRadius(x: number, y: number) {
  const dx = Math.max(x, SCREEN_W - x);
  const dy = Math.max(y, SCREEN_H - y);
  return Math.sqrt(dx * dx + dy * dy) + 16;
}

/**
 * Circular reveal theme toggle (mirrors plants_site View Transition API on native).
 * Tap anywhere on the wrapped control to animate from the touch point.
 */
export function ThemeTransition({
  children,
  onToggle,
  theme = 'light',
  style,
  speed = 0.55,
  blur = 8,
}: ThemeTransitionProps) {
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const originRef = useRef({ x: SCREEN_W / 2, y: SCREEN_H / 2, radius: SCREEN_W });
  const toggleCalledRef = useRef(false);

  const nextTheme = theme === 'dark' ? 'light' : 'dark';
  const overlayColor = nextTheme === 'dark' ? '#0f172a' : '#f8fafc';

  const finishTransition = useCallback(() => {
    setOverlayVisible(false);
    setIsTransitioning(false);
    toggleCalledRef.current = false;
    scaleAnim.setValue(0);
  }, [scaleAnim]);

  const handlePress = useCallback(
    (event: GestureResponderEvent) => {
      if (isTransitioning) return;

      const { pageX, pageY } = event.nativeEvent;
      const radius = getMaxRadius(pageX, pageY);
      originRef.current = { x: pageX, y: pageY, radius };
      toggleCalledRef.current = false;
      setIsTransitioning(true);
      setOverlayVisible(true);
      scaleAnim.setValue(0);

      const duration = speed * 1000;

      Animated.timing(scaleAnim, {
        toValue: 1,
        duration,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) finishTransition();
        else finishTransition();
      });

      // Toggle theme mid-animation (like startViewTransition callback timing)
      setTimeout(() => {
        if (!toggleCalledRef.current) {
          toggleCalledRef.current = true;
          onToggle?.();
        }
      }, duration * 0.35);
    },
    [isTransitioning, onToggle, speed, scaleAnim, finishTransition],
  );

  const { x, y, radius } = originRef.current;
  const size = radius * 2;

  return (
    <>
      <Pressable
        onPress={handlePress}
        style={style}
        disabled={isTransitioning}
        accessibilityRole="button"
      >
        {children}
      </Pressable>

      <Modal
        visible={overlayVisible}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={finishTransition}
      >
        <View style={styles.modalRoot} pointerEvents="none">
          <Animated.View
            style={[
              styles.circle,
              {
                width: size,
                height: size,
                left: x - radius,
                top: y - radius,
                borderRadius: radius,
                backgroundColor: overlayColor,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            {blur > 0 ? (
              <BlurView
                intensity={Math.min(blur * 8, 100)}
                tint={nextTheme === 'dark' ? 'dark' : 'light'}
                style={StyleSheet.absoluteFill}
              />
            ) : null}
          </Animated.View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  circle: {
    position: 'absolute',
    overflow: 'hidden',
  },
});
