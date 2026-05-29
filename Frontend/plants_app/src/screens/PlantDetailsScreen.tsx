import React, { useState, useEffect } from 'react';
import { View, Text, Image, Dimensions, ScrollView, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRoute, useNavigation } from '@react-navigation/native';
import { ScreenWrapper } from '../components/common/ScreenWrapper';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { plantService, gardenService } from '../services/api';
import { Plant } from '../types';
import { Loader } from '../components/common/Loader';
import { Droplet, Sun, Thermometer, Shield, ArrowLeft, Heart, Bookmark, Share2, Eye } from 'lucide-react-native';

const PlantDetailsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = route.params as { id: string };
  const { t, i18n } = useTranslation();
  const isEn = i18n.language === 'en';

  const [plant, setPlant] = useState<Plant | null>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const data = await plantService.getPlantById(parseInt(id));
        setPlant(data);
      } catch (err) {
        console.error('Failed to fetch details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  const handleAddToGarden = async () => {
    try {
      setAdding(true);
      await gardenService.addUserPlant({ plant: parseInt(id) });
      Alert.alert(
        isEn ? "Success" : "موفقیت",
        isEn ? "Plant added to your garden!" : "گیاه با موفقیت به باغچه شما اضافه شد!"
      );
    } catch (err: any) {
      Alert.alert(
        isEn ? "Error" : "خطا",
        err.message || (isEn ? "Failed to add plant" : "خطا در افزودن گیاه")
      );
    } finally {
      setAdding(false);
    }
  };

  if (loading || !plant) {
    return (
      <View className="flex-1 items-center justify-center bg-surface-light dark:bg-surface-dark">
        <Loader size={20} />
      </View>
    );
  }

  const name = isEn ? (plant.english_name || plant.farsi_name) : plant.farsi_name;
  const difficulty = plant.care_difficulty_display?.[i18n.language as 'en' | 'fa'] || plant.care_difficulty;

  const careItems = [
    { icon: <Droplet size={20} color="#3B82F6" />, label: isEn ? 'Water' : 'آبیاری', value: isEn ? plant.watering_frequency_en : plant.watering_frequency },
    { icon: <Sun size={20} color="#F59E0B" />, label: isEn ? 'Light' : 'نور', value: isEn ? plant.light_requirements_en : plant.light_requirements },
    { icon: <Thermometer size={20} color="#EF4444" />, label: isEn ? 'Temp' : 'دما', value: isEn ? plant.temperature_range_en : plant.temperature_range },
    { icon: <Shield size={20} color="#16A34A" />, label: isEn ? 'Difficulty' : 'سختی', value: difficulty },
  ].filter(i => i.value);

  return (
    <ScreenWrapper padding={false}>
      {/* Header Image Section */}
      <View className="relative h-96 w-full">
        <Image
          source={{ uri: plant.primary_image || 'https://via.placeholder.com/400' }}
          className="w-full h-full"
          resizeMode="cover"
        />
        <View className="absolute inset-0 bg-black/30" />
        
        <View className="absolute top-12 left-4 z-20">
          <Button 
            variant="secondary" 
            size="sm" 
            className="rounded-full w-10 h-10 p-0"
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft size={20} color={i18n.language === 'fa' ? '#000' : '#000'} className={isEn ? '' : 'rotate-180'} />
          </Button>
        </View>

        <View className="absolute bottom-6 left-6 right-6">
          <Badge variant="success" className="mb-2">
            {difficulty}
          </Badge>
          <Text className="text-3xl font-black text-white shadow-sm">
            {name}
          </Text>
          <Text className="text-white/80 italic text-sm">
            {plant.scientific_name}
          </Text>
        </View>
      </View>

      {/* Stats Row */}
      <View className="flex-row justify-between px-6 py-4 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
        <View className="flex-row items-center gap-4">
          <View className="items-center">
            <Heart size={20} color="#EF4444" />
            <Text className="text-[10px] font-bold text-slate-400 mt-1">{plant.favourite_count}</Text>
          </View>
          <View className="items-center">
            <Eye size={20} color="#64748B" />
            <Text className="text-[10px] font-bold text-slate-400 mt-1">{plant.view_count}</Text>
          </View>
          <View className="items-center">
            <Bookmark size={20} color="#16A34A" />
            <Text className="text-[10px] font-bold text-slate-400 mt-1">{plant.garden_count}</Text>
          </View>
        </View>
        
        <Button variant="ghost" size="sm" className="w-10 h-10 p-0 rounded-full bg-slate-50 dark:bg-slate-700">
          <Share2 size={18} color="#64748B" />
        </Button>
      </View>

      {/* Content */}
      <View className="p-6">
        {/* Care Grid */}
        <View className="flex-row flex-wrap justify-between gap-y-4 mb-8">
          {careItems.map((item, i) => (
            <View key={i} className="w-[48%] bg-slate-50 dark:bg-slate-800/50 p-4 rounded-3xl border border-slate-100 dark:border-slate-700">
              <View className="flex-row items-center gap-2 mb-2">
                {item.icon}
                <Text className="text-xs font-bold text-slate-400 uppercase">{item.label}</Text>
              </View>
              <Text className="text-sm font-bold text-slate-800 dark:text-white" numberOfLines={2}>
                {item.value}
              </Text>
            </View>
          ))}
        </View>

        {/* Description */}
        <Card title={isEn ? "About this plant" : "درباره این گیاه"}>
          <Text className="text-slate-600 dark:text-slate-300 leading-6 text-sm text-justify">
            {isEn ? plant.description_en || plant.description : plant.description}
          </Text>
        </Card>

        {/* Action Buttons */}
        <View className="mt-10 gap-4">
          <Button 
            variant="primary" 
            size="lg" 
            className="w-full shadow-brand-500/20"
            onPress={handleAddToGarden}
            isLoading={adding}
          >
            {isEn ? 'Add to My Garden' : 'افزودن به باغچه من'}
          </Button>
          <Button variant="outline" size="lg" className="w-full">
            {isEn ? 'Mark as Favorite' : 'افزودن به علاقه‌مندی‌ها'}
          </Button>
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default PlantDetailsScreen;

