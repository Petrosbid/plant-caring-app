import React from 'react';
import {
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  type ViewProps,
} from 'react-native';
import { Motion as _Motion } from '@legendapp/motion';

const MotionL = _Motion as any;
import { ScreenWrapper } from '../common/ScreenWrapper';
import { AppText as Text } from '../common/AppText';
import { cn } from '../../utils/cn';

interface AuthScreenLayoutProps {
  children: React.ReactNode;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  footer?: React.ReactNode;
  accent?: 'brand' | 'green';
}

export const AuthScreenLayout: React.FC<AuthScreenLayoutProps> = ({
  children,
  icon,
  title,
  subtitle,
  footer,
  accent = 'brand',
}) => (
  <ScreenWrapper withScroll={false} padding={false}>
    <View className="absolute inset-0 overflow-hidden pointer-events-none">
      <View
        className={cn(
          'absolute -top-24 -right-16 w-72 h-72 rounded-full opacity-60',
          accent === 'brand' ? 'bg-brand-500/15' : 'bg-green-500/15',
        )}
      />
      <View className="absolute top-1/3 -left-20 w-56 h-56 rounded-full bg-slate-400/10 dark:bg-slate-600/10" />
    </View>

    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          paddingHorizontal: 20,
          paddingVertical: 32,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <MotionL.View
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <View className="items-center mb-8">
            <MotionL.View
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 14 }}
              className={cn(
                'w-20 h-20 rounded-3xl items-center justify-center mb-5 shadow-xl',
                accent === 'brand'
                  ? 'bg-brand-500 shadow-brand-500/35'
                  : 'bg-green-500 shadow-green-500/35',
              )}
            >
              {icon}
            </MotionL.View>
            <Text className="text-3xl font-black text-slate-900 dark:text-white text-center mb-2">
              {title}
            </Text>
            <Text className="text-slate-500 dark:text-slate-400 text-center text-sm px-4">
              {subtitle}
            </Text>
          </View>

          <View className="bg-white/90 dark:bg-slate-800/85 rounded-3xl border border-slate-200/70 dark:border-slate-700/50 p-6 shadow-lg shadow-slate-900/5">
            {children}
          </View>

          {footer ? <View className="mt-8">{footer}</View> : null}
        </MotionL.View>
      </ScrollView>
    </KeyboardAvoidingView>
  </ScreenWrapper>
);

export const AuthErrorBanner: React.FC<{ message: string } & ViewProps> = ({
  message,
}) =>
  message ? (
    <MotionL.View
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className="rounded-2xl bg-red-50 dark:bg-red-900/25 border border-red-200/80 dark:border-red-800/50 px-4 py-3 mb-5 flex-row gap-2 items-start"
    >
      <Text className="text-red-500 text-lg">⚠</Text>
      <Text className="flex-1 text-sm font-medium text-red-800 dark:text-red-200">
        {message}
      </Text>
    </MotionL.View>
  ) : null;

export const AuthDivider: React.FC<{ isEn: boolean }> = ({ isEn }) => (
  <View className="flex-row items-center my-6">
    <View className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
    <Text className="mx-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
      {isEn ? 'or' : 'یا'}
    </Text>
    <View className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
  </View>
);
