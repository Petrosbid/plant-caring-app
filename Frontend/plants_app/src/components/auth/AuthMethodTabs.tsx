import React from 'react';
import { View, Pressable } from 'react-native';
import { Motion as _Motion } from '@legendapp/motion';

const MotionL = _Motion as any;
import { AppText as Text } from '../common/AppText';
import { cn } from '../../utils/cn';

interface TabOption<T extends string> {
  id: T;
  labelEn: string;
  labelFa: string;
}

interface AuthMethodTabsProps<T extends string> {
  options: TabOption<T>[];
  active: T;
  onChange: (id: T) => void;
  isEn: boolean;
  className?: string;
}

export function AuthMethodTabs<T extends string>({
  options,
  active,
  onChange,
  isEn,
  className,
}: AuthMethodTabsProps<T>) {
  return (
    <View
      className={cn(
        'flex-row p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/50',
        className,
      )}
    >
      {options.map((option) => {
        const isActive = option.id === active;
        return (
          <Pressable
            key={option.id}
            onPress={() => onChange(option.id)}
            className="flex-1 py-2.5 rounded-xl overflow-hidden"
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
          >
            {isActive ? (
              <MotionL.View
                initial={{ opacity: 0.6, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 bg-brand-500 rounded-xl shadow-md shadow-brand-500/30"
                transition={{ type: 'spring', stiffness: 380, damping: 28 }}
              />
            ) : null}
            <Text
              className={cn(
                'text-center text-sm font-bold z-10',
                isActive ? 'text-white' : 'text-slate-600 dark:text-slate-400',
              )}
            >
              {isEn ? option.labelEn : option.labelFa}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
