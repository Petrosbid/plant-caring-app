import React from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';
import { cn } from '../../utils/cn';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerClassName?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  containerClassName,
  leftIcon,
  rightIcon,
  className,
  ...props
}) => {
  return (
    <View className={cn("w-full mb-4", containerClassName)}>
      {label && (
        <Text className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 ml-1">
          {label}
        </Text>
      )}
      <View className={cn(
        "flex-row items-center bg-slate-50 dark:bg-slate-800/50 border-2 rounded-2xl px-4",
        error ? "border-red-400" : "border-slate-100 dark:border-slate-700 focus:border-brand-500",
        className
      )}>
        {leftIcon && <View className="mr-2">{leftIcon}</View>}
        <TextInput
          className="flex-1 h-12 text-slate-900 dark:text-white text-sm"
          placeholderTextColor="#94a3b8"
          {...props}
        />
        {rightIcon && <View className="ml-2">{rightIcon}</View>}
      </View>
      {error && (
        <Text className="text-xs text-red-500 mt-1 ml-1 font-medium">
          {error}
        </Text>
      )}
    </View>
  );
};

