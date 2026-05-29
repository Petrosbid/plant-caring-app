import React, { useRef, useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, Dimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Motion as _Motion } from '@legendapp/motion';
import { Plant } from '../../types';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { ChevronRight, Heart, Leaf } from 'lucide-react-native';

const MotionL = _Motion as any;

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width * 0.75;
const ITEM_SPACING = 16;

interface PlantCarouselProps {
  plants?: Plant[];
  title: string;
  subtitle?: string;
  onSeeAll?: () => void;
}

export const PlantCarousel: React.FC<PlantCarouselProps> = ({
  plants = [],
  title,
  subtitle,
  onSeeAll,
}) => {
  const { i18n } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const isEn = i18n.language === 'en';
  const flatListRef = useRef<FlatList>(null);

  // Auto-scroll logic for "infinite" feel (simple version)
  useEffect(() => {
    if (plants.length === 0) return;
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % plants.length;
      flatListRef.current?.scrollToIndex({
        index,
        animated: true,
        viewPosition: 0.5,
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [plants]);

  const renderItem = ({ item, index }: { item: Plant, index: number }) => (
    <MotionL.View
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 100, type: 'spring' }}
      className="mr-4"
      style={{ width: ITEM_WIDTH }}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => navigation.navigate('PlantDetails', { id: item.id.toString() })}
        className="bg-white dark:bg-slate-800 rounded-[40px] overflow-hidden border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none"
      >
        <Image
          source={{ uri: item.primary_image || 'https://via.placeholder.com/400' }}
          className="w-full h-64"
          resizeMode="cover"
        />
        <View className="absolute top-4 right-4 bg-white/90 dark:bg-slate-900/90 p-2 rounded-2xl">
          <Heart size={18} color="#ef4444" fill={item.is_favourited ? "#ef4444" : "transparent"} />
        </View>

        <View className="p-6">
          <View className="flex-row items-center gap-2 mb-2">
            <View className="px-3 py-1 bg-brand-50 dark:bg-brand-900/30 rounded-full">
              <Text className="text-[10px] font-black text-brand-700 dark:text-brand-400 uppercase tracking-widest">
                {item.care_difficulty_display?.[i18n.language as 'en'|'fa'] || item.care_difficulty}
              </Text>
            </View>
            <View className="flex-row items-center gap-1">
              <Leaf size={12} color="#16a34a" />
              <Text className="text-[10px] text-slate-400 font-bold uppercase">{item.garden_count} IN GARDEN</Text>
            </View>
          </View>

          <Text className="text-2xl font-black text-slate-900 dark:text-white mb-1" numberOfLines={1}>
            {isEn ? item.english_name || item.farsi_name : item.farsi_name}
          </Text>
          <Text className="text-slate-400 italic text-sm mb-4" numberOfLines={1}>
            {item.scientific_name}
          </Text>

          <View className="flex-row justify-between items-center">
            <View className="flex-row gap-4">
               <View className="items-center">
                 <Text className="text-xs font-black text-slate-900 dark:text-white">{item.view_count}</Text>
                 <Text className="text-[8px] text-slate-400 uppercase font-bold">Views</Text>
               </View>
               <View className="items-center">
                 <Text className="text-xs font-black text-slate-900 dark:text-white">{item.favourite_count}</Text>
                 <Text className="text-[8px] text-slate-400 uppercase font-bold">Likes</Text>
               </View>
            </View>
            <View className="w-10 h-10 bg-brand-500 rounded-2xl items-center justify-center">
              <ChevronRight size={20} color="white" className={isEn ? '' : 'rotate-180'} />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </MotionL.View>
  );

  return (
    <View className="mt-10">
      <View className="flex-row justify-between items-end px-6 mb-6">
        <View>
          <Text className="text-2xl font-black text-slate-900 dark:text-white leading-7">{title}</Text>
          {subtitle && <Text className="text-slate-500 text-sm mt-1">{subtitle}</Text>}
        </View>
        {onSeeAll && (
          <TouchableOpacity onPress={onSeeAll}>
            <Text className="text-brand-600 font-bold mb-1">{isEn ? "See All" : "همه"}</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        ref={flatListRef}
        data={plants}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 30 }}
        snapToInterval={ITEM_WIDTH + ITEM_SPACING}
        decelerationRate="fast"
      />
    </View>
  );
};
