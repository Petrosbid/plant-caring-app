import React from 'react';
import { View, Pressable } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { Motion as _Motion } from '@legendapp/motion';

const MotionL = _Motion as any;
import { AppText as Text } from '../common/AppText';

interface GoogleSignInButtonProps {
  onPress: () => void;
  isEn: boolean;
  disabled?: boolean;
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  onPress,
  isEn,
  disabled,
}) => (
  <MotionL.View whileTap={{ scale: disabled ? 1 : 0.98 }}>
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className="flex-row items-center justify-center gap-3 h-14 rounded-2xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800/90 shadow-sm"
      accessibilityRole="button"
      accessibilityLabel={isEn ? 'Continue with Google' : 'ادامه با گوگل'}
    >
      <View className="w-8 h-8 rounded-full bg-white items-center justify-center shadow-sm">
        <AntDesign name="google" size={20} color="#4285F4" />
      </View>
      <Text className="text-sm font-bold text-slate-700 dark:text-slate-200">
        {isEn ? 'Continue with Google' : 'ادامه با گوگل'}
      </Text>
    </Pressable>
  </MotionL.View>
);
