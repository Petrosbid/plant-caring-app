import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ScreenWrapper } from '../components/common/ScreenWrapper';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { Motion } from '@legendapp/motion';

const HomeScreen = () => {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const isEn = i18n.language === 'en';

  const stats = [
    { value: '10K+', label: isEn ? 'Users' : 'کاربران' },
    { value: '500+', label: isEn ? 'Species' : 'گونه‌ها' },
    { value: '98%', label: isEn ? 'Accuracy' : 'دقت' },
  ];

  const features = [
    {
      icon: '🌿',
      title: t('common.identify'),
      desc: isEn ? 'Identify plants instantly using AI' : 'شناسایی آنی گیاهان با هوش مصنوعی',
      route: 'AI'
    },
    {
      icon: '🦠',
      title: t('common.disease'),
      desc: isEn ? 'Detect diseases and get solutions' : 'تشخیص بیماری و دریافت راهکار',
      route: 'AI'
    },
    {
      icon: '⏰',
      title: t('common.reminders'),
      desc: isEn ? 'Never miss a watering session' : 'هرگز زمان آبیاری را فراموش نکنید',
      route: 'Reminders'
    }
  ];

  return (
    <ScreenWrapper>
      {/* Hero Section */}
      <View className="py-8 items-center">
        {/* @ts-ignore */}
        <Motion.View
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-brand-100 dark:bg-brand-900/30 px-4 py-2 rounded-full mb-6"
        >
          <Text className="text-brand-700 dark:text-brand-400 font-bold text-xs uppercase tracking-widest">
            🌱 {isEn ? 'AI-Powered Plant Care' : 'مراقبت هوشمند از گیاه'}
          </Text>
        </Motion.View>
        
        <Text className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white text-center leading-tight">
          {isEn ? 'Verna' : 'ورنا'}
        </Text>
        
        <Text className="text-lg text-slate-500 dark:text-slate-400 text-center mt-4 px-6 leading-relaxed">
          {isEn 
            ? 'Identify plants, detect diseases, and get personalized care tips' 
            : 'شناسایی گیاهان، تشخیص بیماری‌ها و دریافت نکات مراقبتی اختصاصی'}
        </Text>

        <View className="flex-row gap-4 mt-10 px-4 w-full">
          <Button 
            variant="primary" 
            className="flex-1" 
            size="lg"
            onPress={() => navigation.navigate('MainTabs', { screen: 'AI' })}
          >
            {t('common.identify')}
          </Button>
          <Button 
            variant="secondary" 
            className="flex-1" 
            size="lg"
            onPress={() => navigation.navigate('MainTabs', { screen: 'Garden' })}
          >
            {t('common.library')}
          </Button>
        </View>
      </View>

      {/* Features Grid */}
      <View className="mt-10 px-2">
        <Text className="text-2xl font-bold text-slate-900 dark:text-white mb-6 ml-2">
          {isEn ? 'Our Features' : 'ویژگی‌های ما'}
        </Text>
        <View className="flex-row flex-wrap justify-between">
          {features.map((feature, i) => (
            <Card 
              key={i} 
              className="w-[48%] mb-4"
              title={feature.title}
              headerIcon={<Text className="text-3xl">{feature.icon}</Text>}
            >
              <Text className="text-xs text-slate-500 dark:text-slate-400 leading-4">
                {feature.desc}
              </Text>
            </Card>
          ))}
        </View>
      </View>

      {/* Stats Section */}
      <View className="mt-10 mb-6 flex-row justify-around bg-white dark:bg-slate-800/50 rounded-3xl py-8 border border-slate-100 dark:border-slate-700 shadow-sm">
        {stats.map((stat, i) => (
          <View key={i} className="items-center">
            <Text className="text-3xl font-black text-brand-600 dark:text-brand-400">
              {stat.value}
            </Text>
            <Text className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-tighter">
              {stat.label}
            </Text>
          </View>
        ))}
      </View>

      {/* Blog Teaser Card */}
      <Card
        title={isEn ? "Latest from Blog" : "آخرین مطالب وبلاگ"}
        subtitle={isEn ? "Expert tips for your indoor garden" : "نکات حرفه‌ای برای باغچه خانگی شما"}
        className="mt-6"
      >
        <Button 
          variant="outline" 
          size="sm" 
          onPress={() => navigation.navigate('BlogList')}
          className="mt-2"
        >
          {t('common.blog')}
        </Button>
      </Card>

    </ScreenWrapper>
  );
};

export default HomeScreen;
