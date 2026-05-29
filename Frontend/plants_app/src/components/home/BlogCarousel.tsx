import React, { useRef, useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, Dimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Motion as _Motion } from '@legendapp/motion';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { ChevronRight, Calendar } from 'lucide-react-native';
import { formatDate } from '../../utils/date';

const MotionL = _Motion as any;

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width * 0.85;
const ITEM_SPACING = 16;

interface BlogCarouselProps {
  posts?: any[];
  title: string;
  onSeeAll?: () => void;
}

export const BlogCarousel: React.FC<BlogCarouselProps> = ({
  posts = [],
  title,
  onSeeAll,
}) => {
  const { i18n } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const isEn = i18n.language === 'en';
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (posts.length === 0) return;
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % posts.length;
      flatListRef.current?.scrollToIndex({
        index,
        animated: true,
        viewPosition: 0.5,
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [posts]);

  const renderItem = ({ item, index }: { item: any, index: number }) => (
    <MotionL.View
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 150 }}
      className="mr-4"
      style={{ width: ITEM_WIDTH }}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => navigation.navigate('BlogDetail', { slug: item.slug })}
        className="bg-white dark:bg-slate-800 rounded-[32px] overflow-hidden border border-slate-100 dark:border-slate-700 shadow-lg"
      >
        <Image
          source={{ uri: item.cover_image || 'https://via.placeholder.com/600x300' }}
          className="w-full h-40"
          resizeMode="cover"
        />
        <View className="p-5">
          <View className="flex-row items-center gap-2 mb-2">
            <Calendar size={12} color="#16a34a" />
            <Text className="text-[10px] font-bold text-brand-600 uppercase tracking-widest">
              {formatDate(item.publish, i18n.language)}
            </Text>
          </View>

          <Text className="text-xl font-black text-slate-900 dark:text-white mb-2" numberOfLines={1}>
            {isEn && item.title_en ? item.title_en : item.title}
          </Text>
          
          <Text className="text-slate-500 text-xs leading-4 mb-4" numberOfLines={2}>
            {isEn && item.excerpt_en ? item.excerpt_en : item.excerpt}
          </Text>

          <View className="flex-row justify-between items-center">
            <Text className="text-brand-600 font-bold text-xs">{isEn ? "Read Article" : "ادامه مطلب"}</Text>
            <ChevronRight size={16} color="#16a34a" className={isEn ? '' : 'rotate-180'} />
          </View>
        </View>
      </TouchableOpacity>
    </MotionL.View>
  );

  return (
    <View className="mt-12">
      <View className="flex-row justify-between items-center px-6 mb-6">
        <Text className="text-2xl font-black text-slate-900 dark:text-white">{title}</Text>
        {onSeeAll && (
          <TouchableOpacity onPress={onSeeAll}>
            <Text className="text-brand-600 font-bold">{isEn ? "See All" : "همه"}</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        ref={flatListRef}
        data={posts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
        snapToInterval={ITEM_WIDTH + ITEM_SPACING}
        decelerationRate="fast"
      />
    </View>
  );
};
