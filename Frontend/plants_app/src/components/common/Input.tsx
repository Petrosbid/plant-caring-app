import React from 'react';
import { View, TextInput, TextInputProps } from 'react-native';
import { AppText as Text } from './AppText';
import { useTranslation } from 'react-i18next';
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
  const { i18n } = useTranslation();
  const isEn = i18n.language === 'en';
  const fontClass = isEn ? 'font-inter' : 'font-vazir';

  return (
    <View className={cn("w-full mb-4", containerClassName)}>
      {label && (
        <Text className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 ms-1">
          {label}
        </Text>
      )}
      <View className={cn(
        "flex-row items-center bg-slate-50 dark:bg-slate-800/50 border-2 rounded-2xl px-4",
        error ? "border-red-400" : "border-slate-100 dark:border-slate-700 focus:border-brand-500",
        className
      )}>
        {leftIcon && <View className="me-2">{leftIcon}</View>}
        <TextInput
          className={cn(
            "flex-1 h-12 text-slate-900 dark:text-white text-sm",
            fontClass,
            "text-start"
          )}
          placeholderTextColor="#94a3b8"
          {...props}
        />
        {rightIcon && <View className="ms-2">{rightIcon}</View>}
      </View>
      {error && (
        <Text className="text-xs text-red-500 mt-1 ms-1 font-medium">
          {error}
        </Text>
      )}
    </View>
  );
};

