import React from 'react';
import { Text as RNText, TextProps } from 'react-native';
import { useTranslation } from 'react-i18next';
import { cn } from '../../utils/cn';

export const AppText: React.FC<TextProps & { className?: string }> = ({ 
  children, 
  className, 
  style, 
  ...props 
}) => {
  const { i18n } = useTranslation();
  const isEn = i18n.language === 'en';
  
  // Use Vazirmatn for Persian, Inter for English
  const fontClass = isEn ? 'font-inter' : 'font-vazir';
  
  // Handle RTL alignment
  const textAlign = isEn ? 'left' : 'right';
  
  return (
    <RNText 
      className={cn(fontClass, className)} 
      style={[{ textAlign }, style]} 
      {...props}
    >
      {children}
    </RNText>
  );
};
