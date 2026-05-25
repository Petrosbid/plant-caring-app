import React from 'react';
import { View, Text } from 'react-native';
import { cn } from '../../utils/cn';

interface BadgeProps {
  children: string;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  className,
}) => {
  const variantClasses = {
    success: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    warning: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
    error: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
    info: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    neutral: 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300',
  };

  return (
    <View className={cn(
      "px-3 py-1 rounded-full self-start",
      variantClasses[variant],
      className
    )}>
      <Text className="text-xs font-bold uppercase tracking-wider">
        {children}
      </Text>
    </View>
  );
};

