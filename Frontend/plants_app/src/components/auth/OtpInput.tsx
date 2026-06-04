import React, { useRef, useEffect, useCallback } from 'react';
import {
  View,
  TextInput,
  Pressable,
  Platform,
  type NativeSyntheticEvent,
  type TextInputKeyPressEventData,
} from 'react-native';
import { Motion as _Motion } from '@legendapp/motion';
import { AppText as Text } from '../common/AppText';

const MotionL = _Motion as any;
import { cn } from '../../utils/cn';

const OTP_LENGTH = 6;

interface OtpInputProps {
  value: string;
  onChange: (code: string) => void;
  isEn?: boolean;
  error?: string;
  autoFocus?: boolean;
}

export const OtpInput: React.FC<OtpInputProps> = ({
  value,
  onChange,
  isEn = true,
  error,
  autoFocus = true,
}) => {
  const hiddenRef = useRef<TextInput>(null);
  const digits = value.padEnd(OTP_LENGTH, ' ').split('').slice(0, OTP_LENGTH);
  const activeIndex = Math.min(value.length, OTP_LENGTH - 1);

  const applyCode = useCallback(
    (raw: string) => {
      const cleaned = raw.replace(/\D/g, '').slice(0, OTP_LENGTH);
      onChange(cleaned);
    },
    [onChange],
  );

  useEffect(() => {
    if (autoFocus) {
      const t = setTimeout(() => hiddenRef.current?.focus(), 300);
      return () => clearTimeout(t);
    }
  }, [autoFocus]);

  const handleKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
    if (e.nativeEvent.key === 'Backspace' && value.length > 0) {
      applyCode(value.slice(0, -1));
    }
  };

  return (
    <View className="w-full">
      <Text className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 ml-1">
        {isEn ? 'Verification Code' : 'کد تایید'}
      </Text>

      <Pressable
        onPress={() => hiddenRef.current?.focus()}
        className="relative"
        accessibilityRole="none"
        accessibilityLabel={isEn ? 'Enter verification code' : 'وارد کردن کد تایید'}
      >
        <View className="flex-row justify-between gap-2">
          {digits.map((digit, index) => {
            const isFilled = digit.trim().length > 0;
            const isActive = index === activeIndex && value.length < OTP_LENGTH;

            return (
              <MotionL.View
                key={index}
                animate={{
                  scale: isActive ? 1.06 : 1,
                  borderColor: error
                    ? '#f87171'
                    : isActive
                      ? '#22c55e'
                      : isFilled
                        ? '#86efac'
                        : '#e2e8f0',
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                className={cn(
                  'flex-1 aspect-square max-h-14 items-center justify-center rounded-2xl border-2 bg-white dark:bg-slate-800/80',
                  isActive && 'shadow-md shadow-brand-500/25',
                )}
              >
                {isFilled ? (
                  <MotionL.View
                    initial={{ scale: 0.3, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 500 }}
                  >
                    <Text className="text-2xl font-bold text-slate-900 dark:text-white">
                      {digit.trim()}
                    </Text>
                  </MotionL.View>
                ) : (
                  <View
                    className={cn(
                      'w-2 h-2 rounded-full',
                      isActive ? 'bg-brand-500' : 'bg-slate-200 dark:bg-slate-600',
                    )}
                  />
                )}
              </MotionL.View>
            );
          })}
        </View>

        <TextInput
          ref={hiddenRef}
          value={value}
          onChangeText={applyCode}
          onKeyPress={handleKeyPress}
          keyboardType="number-pad"
          maxLength={OTP_LENGTH}
          textContentType="oneTimeCode"
          autoComplete={
            Platform.OS === 'android' ? 'sms-otp' : 'one-time-code'
          }
          importantForAutofill="yes"
          autoFocus={autoFocus}
          caretHidden
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            opacity: 0.02,
            color: 'transparent',
          }}
          accessibilityLabel={isEn ? 'SMS verification code field' : 'فیلد کد پیامک'}
        />
      </Pressable>

      <Text className="text-xs text-slate-500 dark:text-slate-400 mt-2 text-center">
        {isEn
          ? 'Code will auto-fill from your SMS when available'
          : 'کد از پیامک به‌صورت خودکار پر می‌شود'}
      </Text>

      {error ? (
        <Text className="text-xs text-red-500 mt-2 text-center font-medium">{error}</Text>
      ) : null}
    </View>
  );
};
