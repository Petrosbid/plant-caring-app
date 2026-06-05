import React, { useState, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { AppText as Text } from '../components/common/AppText';
import { useTranslation } from 'react-i18next';
import { ScreenWrapper } from '../components/common/ScreenWrapper';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { plantService, blogService } from '../services/api';
import { Plant } from '../types';
import { Loader } from '../components/common/Loader';
import { PlantCarousel } from '../components/home/PlantCarousel';
import { BlogCarousel } from '../components/home/BlogCarousel';
import { HomeHeader } from '../components/home/HomeHeader';
import { TrendingPlants } from '../components/home/TrendingPlants';
import { ExploreSection } from '../components/home/ExploreSection';
import { Leaf, RefreshCcw } from 'lucide-react-native';

const SectionDivider = () => (
  <View className="flex-row items-center px-10 my-8">
    <View className="flex-1 h-[1px] bg-slate-200/60 dark:bg-slate-800/60" />
    <View className="mx-4 opacity-30">
      <Leaf size={25} color="#73d095" />
    </View>
    <View className="flex-1 h-[1px] bg-slate-200/60 dark:bg-slate-800/60" />
  </View>
);

const HomeScreen = () => {
  const { i18n } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const isEn = i18n.language === 'en';

  const [recentPlants, setRecentPlants] = useState<Plant[]>([]);
  const [popularPlants, setPopularPlants] = useState<Plant[]>([]);
  const [latestBlogs, setLatestBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);

  const fetchData = async (isManualRefresh = false) => {
    if (!isManualRefresh) setLoading(true);
    setError(false);
    
    try {
      const [recent, popular, blogs] = await Promise.all([
        plantService.getPlants({ page_size: 6, ordering: '-created_at' }),
        plantService.getPlants({ page_size: 6, ordering: '-favourite_count' }),
        blogService.getPosts({ page_size: 5, ordering: '-publish' })
      ]);
      
      setRecentPlants(recent.results || []);
      setPopularPlants(popular.results || []);
      setLatestBlogs(blogs.results || []);
    } catch (err) {
      console.error('[HomeScreen] Fetch error:', err);
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      // Only show full-screen loader on first load
      const isFirstLoad = recentPlants.length === 0 && popularPlants.length === 0 && latestBlogs.length === 0;
      fetchData(!isFirstLoad);
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchData(true);
  };

  if (loading && !refreshing) {
    return (
      <View className="flex-1 items-center justify-center bg-surface-light dark:bg-surface-dark">
        <Loader size={30} />
      </View>
    );
  }

  return (
    <ScreenWrapper withScroll={false} padding={false}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10b981" />
        }
        contentContainerStyle={{ paddingBottom: 150 }}
        className="bg-slate-50 dark:bg-slate-950"
      >
        <HomeHeader />

        {error && recentPlants.length === 0 && (
          <View className="px-6 py-10 items-center">
            <Text className="text-slate-400 mb-4 text-center">
              {isEn ? "Failed to load data. Please check your connection." : "خطا در بارگذاری اطلاعات. لطفاً اتصال خود را بررسی کنید."}
            </Text>
            <TouchableOpacity 
              onPress={() => fetchData()}
              className="flex-row items-center gap-2 bg-brand-500 px-6 py-3 rounded-2xl"
            >
              <RefreshCcw size={18} color="white" />
              <Text className="text-white font-bold">{isEn ? "Retry" : "تلاش مجدد"}</Text>
            </TouchableOpacity>
          </View>
        )}

        <SectionDivider />

        {/* Trending Section */}
        <TrendingPlants plants={popularPlants} />

        <SectionDivider />

        {/* Explore Section */}
        <ExploreSection />

        <SectionDivider />

        {/* Recent Species Carousel */}
        <PlantCarousel 
          plants={recentPlants}
          title={isEn ? "Newly Added" : "تازه‌ها"}
          subtitle={isEn ? "Discover the latest additions" : "جدیدترین گیاهان اضافه شده"}
          onSeeAll={() => navigation.navigate('Library')}
        />

        <SectionDivider />

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
