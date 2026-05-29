import React from 'react';
import { Text, Pressable } from 'react-native';
import { Motion as _Motion } from '@legendapp/motion';
import { cn } from '../../utils/cn';
import { GooeyLoader } from './GooeyLoader';

const MotionL = _Motion as any;

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onPress?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className,
  onPress,
  isLoading,
  disabled,
}) => {
  const baseClasses = 'flex-row items-center justify-center rounded-2xl';
  
  const variantClasses = {
    primary: 'bg-brand-500 text-white shadow-lg shadow-brand-500/30',
    secondary: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200',
    danger: 'bg-red-500 text-white shadow-lg shadow-red-500/30',
    success: 'bg-green-500 text-white shadow-lg shadow-green-500/30',
    outline: 'bg-transparent border-2 border-brand-500 text-brand-500',
    ghost: 'bg-transparent text-slate-600 dark:text-slate-400',
  };

  const sizeClasses = {
    sm: 'px-4 py-2 h-10',
    md: 'px-6 py-3 h-12',
    lg: 'px-8 py-4 h-14',
  };

  const textSizes = {
    sm: 'text-xs font-semibold',
    md: 'text-sm font-bold',
    lg: 'text-base font-bold',
  };

  return (
    // @ts-ignore
    <MotionL.Pressable
      onPress={onPress}
      disabled={disabled || isLoading}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        (disabled || isLoading) && 'opacity-50',
        className
      )}
      // @ts-ignore
      whileTap={{ scale: 0.98 }}
    >
      {isLoading ? (
        <GooeyLoader 
          size={8} 
          color={variant === 'outline' || variant === 'ghost' ? '#16a34a' : 'white'} 
        />
      ) : (
        <Text className={cn(
          textSizes[size],
          variant === 'primary' || variant === 'danger' || variant === 'success' ? 'text-white' : '',
          variant === 'outline' && 'text-brand-500',
          variant === 'secondary' && 'text-slate-800 dark:text-slate-200',
          variant === 'ghost' && 'text-slate-600 dark:text-slate-400'
        )}>
          {children}
        </Text>
        )}
        </MotionL.Pressable>
        );
        };

