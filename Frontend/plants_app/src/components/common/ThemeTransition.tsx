import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  Pressable,
  Animated,
  Dimensions,
  StyleProp,
  ViewStyle,
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

export function ThemeTransition({
  children,
  onToggle,
  style,
  speed = 0.5,
  blur = 0,
}: ThemeTransitionProps) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const overlayStyleRef = useRef<{
    width: number;
    height: number;
    left: number;
    top: number;
    borderRadius: number;
  }>({
    width: 0,
    height: 0,
    left: 0,
    top: 0,
    borderRadius: 0,
  });

  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

  const getMaxRadius = (x: number, y: number) => {
    const dx = Math.max(x, screenWidth - x);
    const dy = Math.max(y, screenHeight - y);
    return Math.sqrt(dx * dx + dy * dy) + 10;
  };

  const runAnimation = useCallback(
    (touchX: number, touchY: number) => {
      const radius = getMaxRadius(touchX, touchY);
      const size = radius * 2;

      overlayStyleRef.current = {
        width: size,
        height: size,
        left: touchX - radius,
        top: touchY - radius,
        borderRadius: radius,
      };

      scaleAnim.setValue(0);
      setShowOverlay(true);

      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: speed * 1000,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          setTimeout(() => {
            setShowOverlay(false);
            setIsTransitioning(false);
          }, 50);
        } else {
          setShowOverlay(false);
          setIsTransitioning(false);
        }
      });
    },
    [screenWidth, screenHeight, speed, scaleAnim]
  );

  const handlePress = useCallback(
    (event: any) => {
      if (isTransitioning) return;

      const { pageX, pageY } = event.nativeEvent;
      setIsTransitioning(true);

      // Trigger theme toggle immediately (simulates startViewTransition behavior)
      onToggle?.();

      runAnimation(pageX, pageY);
    },
    [isTransitioning, onToggle, runAnimation]
  );

  return (
    <>
      <Pressable
        onPress={handlePress}
        style={style}
        disabled={isTransitioning}
        pointerEvents={isTransitioning ? 'none' : 'auto'}
      >
        {children}
      </Pressable>

      {showOverlay && (
         <Animated.View
            style={{
            position: 'absolute',
            width: overlayStyleRef.current.width,
            height: overlayStyleRef.current.height,
            left: overlayStyleRef.current.left,
            top: overlayStyleRef.current.top,
            borderRadius: overlayStyleRef.current.borderRadius,
            overflow: 'hidden',
            transform: [{ scale: scaleAnim }],
            }}
            pointerEvents="none"
        >
            <BlurView
            intensity={blur * 5}   // تبدیل عدد blur به شدت (0 تا 100)
            style={{ flex: 1 }}
            tint="dark"
            />
        </Animated.View>
      )}
    </>
  );
}