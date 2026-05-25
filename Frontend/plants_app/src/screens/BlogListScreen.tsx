import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ScreenWrapper } from '../components/common/ScreenWrapper';
import { blogService } from '../services/api';
import { Loader } from '../components/common/Loader';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { formatDate } from '../utils/date';
import { ChevronRight, ChevronLeft } from 'lucide-react-native';
import { cn } from '../utils/cn';

const BlogListScreen = () => {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const isEn = i18n.language === 'en';

  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPosts = async () => {
    try {
      const data = await blogService.getPosts();
      setPosts(data.results);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <ScreenWrapper withScroll={false}>
      <View className="px-2 pt-2 mb-6">
        <Text className="text-3xl font-black text-slate-900 dark:text-white">
          {t('common.blog')}
        </Text>
        <Text className="text-slate-500 dark:text-slate-400">
          {isEn ? "Learn how to care for your plants like a pro" : "یاد بگیرید چطور حرفه‌ای از گیاهانتان مراقبت کنید"}
        </Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <Loader size={16} />
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 120 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchPosts(); }} tintColor="#16a34a" />
          }
          renderItem={({ item }) => (
            <TouchableOpacity 
              onPress={() => navigation.navigate('BlogDetail', { slug: item.slug })}
              className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden mb-6 shadow-sm border border-slate-100 dark:border-slate-700"
            >
              <Image 
                source={{ uri: item.cover_image }} 
                className="w-full h-48"
                resizeMode="cover"
              />
              <View className="p-5">
                <Text className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-widest mb-2">
                  {formatDate(item.publish, i18n.language)}
                </Text>
                <Text className="text-xl font-black text-slate-900 dark:text-white mb-2 leading-7">
                  {isEn && item.title_en ? item.title_en : item.title}
                </Text>
                <Text className="text-slate-500 dark:text-slate-400 text-sm leading-5 mb-4" numberOfLines={2}>
                  {isEn && item.excerpt_en ? item.excerpt_en : item.excerpt}
                </Text>
                <View className="flex-row items-center justify-between">
                  <Text className="text-brand-600 dark:text-brand-400 font-bold text-sm">
                    {isEn ? "Read Article" : "ادامه مطلب"}
                  </Text>
                  {isEn ? <ChevronRight size={18} color="#16a34a" /> : <ChevronLeft size={18} color="#16a34a" />}
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </ScreenWrapper>
  );
};

export default BlogListScreen;
