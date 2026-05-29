import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ImageBackground } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ScreenWrapper } from '../components/common/ScreenWrapper';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { Motion as _Motion } from '@legendapp/motion';
import { plantService, blogService } from '../services/api';

const MotionL = _Motion as any;
import { Plant } from '../types';
import { Loader } from '../components/common/Loader';
import { PlantCarousel } from '../components/home/PlantCarousel';
import { BlogCarousel } from '../components/home/BlogCarousel';
import { Zap, Sparkles, TrendingUp, Users, ShieldCheck } from 'lucide-react-native';

const HomeScreen = () => {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const isEn = i18n.language === 'en';

  const [recentPlants, setRecentPlants] = useState<Plant[]>([]);
  const [popularPlants, setPopularPlants] = useState<Plant[]>([]);
  const [latestBlogs, setLatestBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [recent, popular, blogs] = await Promise.all([
        plantService.getPlants({ page_size: 6, ordering: '-created_at' }),
        plantService.getPlants({ page_size: 6, ordering: '-favourite_count' }),
        blogService.getPosts({ page_size: 5, ordering: '-publish' })
      ]);
      setRecentPlants(recent.results);
      setPopularPlants(popular.results);
      setLatestBlogs(blogs.results);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const stats = [
    { value: '10K+', label: isEn ? 'Users' : 'کاربران', icon: <Users size={20} color="#16a34a" /> },
    { value: '500+', label: isEn ? 'Species' : 'گونه‌ها', icon: <TrendingUp size={20} color="#16a34a" /> },
    { value: '98%', label: isEn ? 'Accuracy' : 'دقت', icon: <ShieldCheck size={20} color="#16a34a" /> },
  ];

  if (loading && !refreshing) {
    return (
      <View className="flex-1 items-center justify-center bg-surface-light dark:bg-surface-dark">
        <Loader size={30} />
      </View>
    );
  }

  return (
    <ScreenWrapper withScroll={false}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#16a34a" />
        }
        contentContainerStyle={{ paddingBottom: 150 }}
      >
        {/* Hero Section */}
        <View className="pt-10 pb-6 px-6">
          <MotionL.View
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring' }}
          >
            <View className="inline-flex flex-row items-center gap-2 px-4 py-2 rounded-full bg-brand-500/10 dark:bg-brand-500/20 mb-6 self-start">
              <Sparkles size={14} color="#16a34a" />
              <Text className="text-brand-700 dark:text-brand-400 font-black text-[10px] uppercase tracking-widest">
                {isEn ? 'AI-Powered Plant Care' : 'مراقبت هوشمند با هوش مصنوعی'}
              </Text>
            </View>

            <Text className="text-5xl font-black text-slate-900 dark:text-white leading-[60px]">
              {isEn ? 'Verna' : 'ورنا'}
            </Text>
            <Text className="text-lg text-slate-500 dark:text-slate-400 mt-4 leading-relaxed">
              {isEn 
                ? 'Identify plants, detect diseases, and get personalized care tips.' 
                : 'شناسایی گیاهان، تشخیص بیماری‌ها و دریافت نکات مراقبتی اختصاصی.'}
            </Text>

            <View className="flex-row gap-4 mt-10 w-full">
              <Button 
                variant="primary" 
                className="flex-1 rounded-[24px]" 
                size="lg"
                onPress={() => navigation.navigate('MainTabs', { screen: 'AI' })}
              >
                <Zap size={20} color="white" fill="white" />
                <Text className="ml-2 text-white font-black">{isEn ? 'AI Tools' : 'ابزارهای هوشمند'}</Text>
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 rounded-[24px]" 
                size="lg"
                onPress={() => navigation.navigate('Library')}
              >
                <Text className="text-brand-600 font-black">{t('common.library')}</Text>
              </Button>
            </View>
          </MotionL.View>
        </View>

        {/* Stats Row */}
        <View className="flex-row justify-around mx-6 mt-6 p-6 bg-white dark:bg-slate-800 rounded-[40px] border border-slate-50 dark:border-slate-700 shadow-xl shadow-slate-100 dark:shadow-none">
          {stats.map((stat, i) => (
            <View key={i} className="items-center">
              <View className="w-10 h-10 rounded-2xl bg-brand-50 dark:bg-brand-900/30 items-center justify-center mb-2">
                {stat.icon}
              </View>
              <Text className="text-xl font-black text-slate-900 dark:text-white">{stat.value}</Text>
              <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Popular Plants Carousel */}
        <PlantCarousel 
          plants={popularPlants}
          title={isEn ? "Most Popular" : "محبوب‌ترین‌ها"}
          subtitle={isEn ? "Community favorites" : "گیاهان محبوب جامعه"}
          onSeeAll={() => navigation.navigate('Library')}
        />

        {/* Features Quick Access */}
        <View className="px-6 mt-12">
          <Text className="text-2xl font-black text-slate-900 dark:text-white mb-6">
            {isEn ? 'Pro Features' : 'امکانات حرفه‌ای'}
          </Text>
          <View className="flex-row gap-4">
            <TouchableOpacity 
              onPress={() => navigation.navigate('Identify')}
              className="flex-1 bg-green-500 rounded-[32px] p-6 shadow-lg shadow-green-500/30"
            >
              <View className="w-12 h-12 bg-white/20 rounded-2xl items-center justify-center mb-4">
                <Zap size={24} color="white" />
              </View>
              <Text className="text-white font-black text-lg">{isEn ? 'Identify' : 'شناسایی'}</Text>
              <Text className="text-white/80 text-xs mt-1">{isEn ? 'Instant species detection' : 'شناسایی آنی گونه‌ها'}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => navigation.navigate('DiseaseCheck')}
              className="flex-1 bg-red-500 rounded-[32px] p-6 shadow-lg shadow-red-500/30"
            >
              <View className="w-12 h-12 bg-white/20 rounded-2xl items-center justify-center mb-4">
                <ShieldCheck size={24} color="white" />
              </View>
              <Text className="text-white font-black text-lg">{isEn ? 'Diagnosis' : 'تشخیص'}</Text>
              <Text className="text-white/80 text-xs mt-1">{isEn ? 'Check plant health' : 'بررسی سلامت گیاه'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Species Carousel */}
        <PlantCarousel 
          plants={recentPlants}
          title={isEn ? "Newly Added" : "تازه‌ها"}
          onSeeAll={() => navigation.navigate('Library')}
        />

        {/* Blog Carousel */}
        <BlogCarousel 
          posts={latestBlogs}
          title={isEn ? "Expert Tips" : "دانستنی‌های گیاهان"}
          onSeeAll={() => navigation.navigate('BlogList')}
        />

      </ScrollView>
    </ScreenWrapper>
  );
};

export default HomeScreen;
