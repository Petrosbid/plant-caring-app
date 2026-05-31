import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { AppText as Text } from '../components/common/AppText';
import { useTranslation } from 'react-i18next';
import { ScreenWrapper } from '../components/common/ScreenWrapper';
import { useNavigation } from '@react-navigation/native';
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

const HomeScreen = () => {
  const { i18n } = useTranslation();
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
      setRecentPlants(recent.results || []);
      setPopularPlants(popular.results || []);
      setLatestBlogs(blogs.results || []);
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

        <View className="h-4 bg-slate-100 dark:bg-slate-800/50 my-2" />

        {/* Trending Section */}
        <TrendingPlants plants={popularPlants} />

        {/* Explore Section */}
        <ExploreSection />

        <View className="h-4 bg-slate-100 dark:bg-slate-800/50 my-6" />

        {/* Recent Species Carousel */}
        <PlantCarousel 
          plants={recentPlants}
          title={isEn ? "Newly Added" : "تازه‌ها"}
          subtitle={isEn ? "Discover the latest additions" : "جدیدترین گیاهان اضافه شده"}
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
