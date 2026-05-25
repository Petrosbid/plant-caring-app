import React from 'react';
import { View } from 'react-native';
import { Motion } from '@legendapp/motion';
import { cn } from '../../utils/cn';

interface LoaderProps {
  size?: number;
  color?: string;
  className?: string;
}

export const Loader: React.FC<LoaderProps> = ({
  size = 12,
  color = '#16a34a', // Brand 600
  className,
}) => {
  return (
    <View className={cn("flex-row items-center justify-center gap-1", className)}>
      {[0, 1, 2].map((i) => (
        // @ts-ignore
        <Motion.View
          key={i}
          initial={{ scale: 0.8, opacity: 0.5 }}
          animate={{
            scale: [0.8, 1.2, 0.8],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            type: 'timing',
            duration: 1000,
            repeat: Infinity,
            delay: i * 200,
          }}
          className="rounded-full"
          style={{
            width: size,
            height: size,
            backgroundColor: color,
          }}
        />
      ))}
    </View>
  );
};

