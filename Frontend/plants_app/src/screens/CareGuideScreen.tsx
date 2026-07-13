import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { ScreenWrapper } from '../components/common/ScreenWrapper';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Motion, AnimatePresence } from '@legendapp/motion';
import { Droplet, Sun, Thermometer, Scissors, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react-native';
import { cn } from '../utils/cn';

const CareGuideScreen = () => {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const isEn = i18n.language === 'en';
  const isDark = theme === 'dark';
  const [expanded, setExpanded] = useState<string | null>('watering');

  const guides = [
    {
      id: 'watering',
      icon: <Droplet size={24} color="#3B82F6" />,
      title: isEn ? "Watering Guide" : "راهنمای آبیاری",
      color: "bg-blue-50 dark:bg-blue-900/20",
      content: isEn 
        ? "Check the top inch of soil. If dry, water thoroughly until it drains. Overwatering is the #1 killer!"
        : "سطح رویی خاک را لمس کنید. اگر خشک بود، کاملاً آبیاری کنید تا آب از زیر خارج شود. آبیاری بیش از حد دشمن اول گیاه است!"
    },
    {
      id: 'lighting',
      icon: <Sun size={24} color="#F59E0B" />,
      title: isEn ? "Light Requirements" : "نیازهای نوری",
      color: "bg-amber-50 dark:bg-amber-900/20",
      content: isEn
        ? "Most indoor plants love bright, indirect light. Direct sun can scorch leaves, while too little light slows growth."
        : "بیشتر گیاهان آپارتمانی نور غیرمستقیم زیاد را دوست دارند. آفتاب مستقیم برگ‌ها را می‌سوزاند و نور کم رشد را متوقف می‌کند."
    },
    {
      id: 'temp',
      icon: <Thermometer size={24} color="#EF4444" />,
      title: isEn ? "Temperature & Humidity" : "دما و رطوبت",
      color: "bg-red-50 dark:bg-red-900/20",
      content: isEn
        ? "Keep plants away from cold drafts or heaters. Most tropicals love 18-24°C and higher humidity."
        : "گیاهان را از باد سرد یا بخاری دور نگه دارید. اکثر گیاهان استوایی دمای ۱۸ تا ۲۴ درجه و رطوبت بالا را ترجیح می‌دهیم."
    },
    {
      id: 'pruning',
      icon: <Scissors size={24} color="#16A34A" />,
      title: isEn ? "Pruning & Cleaning" : "هرس و نظافت",
      color: "bg-green-50 dark:bg-green-900/20",
      content: isEn
        ? "Remove yellow or dead leaves to encourage new growth. Wipe leaves with a damp cloth to remove dust."
        : "برگ‌های زرد یا مرده را جدا کنید تا رشد جدید تحریک شود. برگ‌ها را با پارچه نمدار تمیز کنید تا گرد و غبار مانع تنفس نشود."
    }
  ];

  return (
    <ScreenWrapper>
      <View className="px-2 pt-2 mb-8">
        <View className="flex-row items-center justify-between mb-6">
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 items-center justify-center"
          >
            <ArrowLeft size={20} color={isDark ? "#e2e8f0" : "#1e293b"} style={{ transform: [{ scaleX: isEn ? 1 : -1 }] }} />
          </TouchableOpacity>
        </View>

        <Text className="text-3xl font-black text-slate-900 dark:text-white mb-2 text-start">
          {t('common.careGuide')}
        </Text>
        <Text className="text-slate-500 dark:text-slate-400 text-start">
          {isEn ? "Essential tips for a healthy indoor jungle" : "نکات ضروری برای داشتن یک جنگل خانگی سالم"}
        </Text>
      </View>

      <View className="gap-4 px-2">
        {guides.map((guide) => (
          <TouchableOpacity 
            key={guide.id}
            onPress={() => setExpanded(expanded === guide.id ? null : guide.id)}
            activeOpacity={0.7}
          >
            <View className={cn(
              "rounded-3xl p-5 border border-slate-100 dark:border-slate-800",
              expanded === guide.id ? guide.color : "bg-white dark:bg-slate-800/50"
            )}>
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-4">
                  <View className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 items-center justify-center shadow-sm">
                    {guide.icon}
                  </View>
                  <Text className="text-lg font-bold text-slate-900 dark:text-white text-start">
                    {guide.title}
                  </Text>
                </View>
                {expanded === guide.id ? <ChevronUp size={20} color="#94a3b8" /> : <ChevronDown size={20} color="#94a3b8" />}
              </View>

              <AnimatePresence>
                {expanded === guide.id && (
                  // @ts-ignore
                  <Motion.View
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 pt-4 border-t border-slate-200/50 dark:border-slate-700/50"
                  >
                    <Text className="text-slate-600 dark:text-slate-300 leading-6 text-start">
                      {guide.content}
                    </Text>
                  </Motion.View>
                )}
              </AnimatePresence>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View className="px-2 mt-10 mb-10">
        <Card className="bg-brand-500 border-none p-6">
           <Text className="text-white font-black text-xl mb-2">
              {isEn ? "Need more help?" : "نیاز به کمک بیشتر دارید؟"}
           </Text>
           <Text className="text-white/80 text-sm mb-6">
              {isEn ? "Our AI can provide custom advice for your specific plants." : "هوش مصنوعی ما می‌تواند برای گیاهان خاص شما مشاوره اختصاصی بدهد."}
           </Text>
           <Button variant="secondary" className="bg-white" onPress={() => navigation.navigate('MainTabs', { screen: 'AI' })}>
              <Text className="text-brand-600 font-bold">{isEn ? "Talk to AI Assistant" : "گفتگو با دستیار هوشمند"}</Text>
           </Button>
        </Card>
      </View>
    </ScreenWrapper>
  );
};

export default CareGuideScreen;
