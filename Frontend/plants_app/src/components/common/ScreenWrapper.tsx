import React from 'react';
import { View, Text, ScrollView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';

interface ScreenWrapperProps {
  children: React.ReactNode;
  className?: string;
  withScroll?: boolean;
  padding?: boolean;
}

export const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
  children,
  className,
  withScroll = true,
  padding = true,
}) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  
  const content = (
    <View className={cn(
      "flex-1",
      padding && "px-4 pt-4",
      className
    )}>
      {children}
    </View>
  );

  return (
    <View 
      style={{ 
        flex: 1, 
        paddingTop: Platform.OS === 'ios' ? insets.top : 0 
      }} 
      className="bg-surface-light dark:bg-surface-dark"
    >
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      {withScroll ? (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 100 }} // Leave space for the glass tab bar
          showsVerticalScrollIndicator={false}
        >
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </View>
  );
};

