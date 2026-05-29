import React from 'react';
import { View, Animated, Easing } from 'react-native';
import Svg, { Defs, Filter, FeGaussianBlur, FeColorMatrix, G, Circle } from 'react-native-svg';

interface GooeyLoaderProps {
  size?: number;
  color?: string;
  duration?: number;
  className?: string;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const GooeyCircle = ({ index, center, size, color, duration }: { 
  index: number, 
  center: number, 
  size: number, 
  color: string, 
  duration: number 
}) => {
  const anim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(index * 200),
        Animated.timing(anim, {
          toValue: 1,
          duration: duration * 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false, // SVG props like cx don't support native driver
        })
      ])
    ).start();
  }, [anim, duration, index]);

  const cx = anim.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [center, center + size, center, center - size, center],
  });

  const scale = anim.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [1, 1.2, 1, 1.2, 1],
  });

  return (
    <AnimatedCircle
      cx={cx}
      cy={size}
      r={size / 2}
      fill={color}
      // @ts-ignore
      style={{
        transform: [{ scale }]
      }}
    />
  );
};

export const GooeyLoader: React.FC<GooeyLoaderProps> = ({
  size = 20,
  color = '#16a34a',
  duration = 1.5,
  className,
}) => {
  const containerSize = size * 4;

  return (
    <View className={className} style={{ width: containerSize, height: size * 2 }}>
      <Svg width={containerSize} height={size * 2} viewBox={`0 0 ${containerSize} ${size * 2}`}>
        <Defs>
          <Filter id="gooey">
            <FeGaussianBlur in="SourceGraphic" stdDeviation={size / 4} result="blur" />
            <FeColorMatrix
              in="blur"
              type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
              result="gooey"
            />
          </Filter>
        </Defs>
        <G filter="url(#gooey)">
          {[0, 1, 2].map((index) => (
            <GooeyCircle
              key={index}
              index={index}
              center={size * 2}
              size={size}
              color={color}
              duration={duration}
            />
          ))}
        </G>
      </Svg>
    </View>
  );
};
