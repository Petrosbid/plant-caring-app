import React from 'react';
import { View, Text, Image } from 'react-native';
import { Motion as _Motion } from '@legendapp/motion';
import { Heart, Eye, Bookmark } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { Plant } from '../../types';
import { Badge } from '../common/Badge';
import { cn } from '../../utils/cn';

const MotionL = _Motion as any;

interface PlantCardProps {
  plant: Plant;
  isInGarden?: boolean;
  className?: string;
}

export const PlantCard: React.FC<PlantCardProps> = ({
  plant,
  isInGarden,
  className,
}) => {
  const { i18n } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const isEn = i18n.language === 'en';

  const name = isEn ? (plant.english_name || plant.farsi_name) : plant.farsi_name;
  const difficulty = plant.care_difficulty_display?.[i18n.language as 'en' | 'fa'] || plant.care_difficulty;

  return (
    // @ts-ignore
    <MotionL.Pressable
      onPress={() => navigation.navigate('PlantDetails', { id: plant.id.toString() })}
      className={cn(
        "bg-white dark:bg-slate-800/80 rounded-3xl border border-slate-200/60 dark:border-slate-700/50 shadow-md overflow-hidden mb-4",
        className
      )}
      // @ts-ignore
      whileTap={{ scale: 0.98 }}
    >
      {isInGarden && (
        <View className="absolute top-3 right-3 z-10 bg-green-500 rounded-full px-2 py-1 flex-row items-center shadow-lg">
          <Text className="text-[10px] text-white font-bold">🌱 {isEn ? 'IN GARDEN' : 'در باغچه'}</Text>
        </View>
      )}

      <View className="h-44 bg-slate-100 dark:bg-slate-700 items-center justify-center">
        {plant.primary_image ? (
          <Image
            source={{ uri: plant.primary_image }}
            className="w-full h-full"
            resizeMode="cover"
          />
        ) : (
          <Text className="text-5xl">🌿</Text>
        )}
      </View>

      <View className="p-4">
        <View className="flex-row justify-between items-start mb-1">
          <Text className="text-lg font-bold text-slate-900 dark:text-white flex-1" numberOfLines={1}>
            {name}
          </Text>
          <Badge variant="success" className="ml-2">
            {difficulty}
          </Badge>
        </View>
        
        <Text className="text-xs italic text-slate-500 dark:text-slate-400 mb-2" numberOfLines={1}>
          {plant.scientific_name}
        </Text>

        <Text className="text-slate-600 dark:text-slate-300 text-xs mb-3" numberOfLines={2}>
          {isEn ? plant.description_en || plant.description : plant.description}
        </Text>

        <View className="flex-row justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-700">
          <View className="flex-row items-center gap-3">
            <View className="flex-row items-center gap-1">
              <Eye size={16} color="#94a3b8" />
              <Text className="text-[10px] text-slate-400">{plant.view_count}</Text>
            </View>
            <View className="flex-row items-center gap-1">
              <Heart size={16} color="#ef4444" />
              <Text className="text-[10px] text-slate-400">{plant.favourite_count}</Text>
            </View>
          </View>
          <View className="flex-row items-center gap-1">
            <Bookmark size={16} color="#16a34a" />
            <Text className="text-[10px] text-slate-400">{plant.garden_count}</Text>
          </View>
        </View>
      </View>
    </MotionL.Pressable>
  );
};
