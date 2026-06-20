import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, useWindowDimensions, Modal, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRoute, useNavigation } from '@react-navigation/native';
import { ScreenWrapper } from '../components/common/ScreenWrapper';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { plantService, gardenService } from '../services/api';
import { Plant } from '../types';
import { Loader } from '../components/common/Loader';
import RenderHtml from 'react-native-render-html';
import { Droplet, Sun, Thermometer, Shield, ArrowLeft, Heart, Bookmark, Share2, Eye, Plus, Minus, CheckCircle } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';

const PlantDetailsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = route.params as { id: string };
  const { i18n } = useTranslation();
  const { width } = useWindowDimensions();
  const { theme } = useTheme();
  const isEn = i18n.language === 'en';
  const isDark = theme === 'dark';

  const [plant, setPlant] = useState<Plant | null>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'care' | 'details'>('overview');
  const [descriptionFontSize, setDescriptionFontSize] = useState(16);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

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
      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
      }, 2000);
    } catch (err: any) {
      console.error('Error adding plant:', err);
    } finally {
      setAdding(false);
    }
  };

  const handleGoToGarden = () => {
    setShowSuccessModal(false);
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs', params: { screen: 'Garden' } }],
    });
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
  const description = isEn ? plant.description_en || plant.description : plant.description;

  const careItems = [
    { icon: <Droplet size={24} color="#3B82F6" />, label: isEn ? 'Water' : 'آبیاری', value: isEn ? plant.watering_frequency_en : plant.watering_frequency },
    { icon: <Sun size={24} color="#F59E0B" />, label: isEn ? 'Light' : 'نور', value: isEn ? plant.light_requirements_en : plant.light_requirements },
    { icon: <Thermometer size={24} color="#EF4444" />, label: isEn ? 'Temp' : 'دما', value: isEn ? plant.temperature_range_en : plant.temperature_range },
    { icon: <Shield size={24} color="#16A34A" />, label: isEn ? 'Difficulty' : 'سختی', value: difficulty },
  ].filter(i => i.value);

  const detailedCareItems = [
    { label: isEn ? 'Watering' : 'آبیاری', value: isEn ? plant.watering_frequency_en : plant.watering_frequency, icon: '💧' },
    { label: isEn ? 'Light' : 'نور', value: isEn ? plant.light_requirements_en : plant.light_requirements, icon: '☀️' },
    { label: isEn ? 'Temperature' : 'دما', value: isEn ? plant.temperature_range_en : plant.temperature_range, icon: '🌡️' },
    { label: isEn ? 'Humidity' : 'رطوبت', value: isEn ? plant.humidity_level_en : plant.humidity_level, icon: '💨' },
    { label: isEn ? 'Soil' : 'خاک', value: isEn ? plant.soil_type_en : plant.soil_type, icon: '🌱' },
    { label: isEn ? 'Fertilizer' : 'کود', value: isEn ? plant.fertilizer_schedule_en : plant.fertilizer_schedule, icon: '🧪' },
    { label: isEn ? 'Propagation' : 'تکثیر', value: isEn ? plant.propagation_methods_en : plant.propagation_methods, icon: '🔄' },
    { label: isEn ? 'Pruning' : 'هرس', value: plant.pruning_info, icon: '✂️' },
  ].filter(i => i.value);

  const htmlSource = {
    html: `<div style="color: ${isDark ? '#cbd5e1' : '#475569'}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.8; text-align: ${isEn ? 'left' : 'right'};">${description}</div>`
  };

  return (
    <ScreenWrapper padding={false}>
      {/* Success Modal */}
      <Modal visible={showSuccessModal} transparent animationType="fade">
        <View className="flex-1 items-center justify-center bg-black/50">
          <View className="bg-white dark:bg-slate-800 rounded-3xl p-8 w-4/5 items-center shadow-2xl">
            <CheckCircle size={60} color="#16A34A" />
            <Text className="text-2xl font-bold text-slate-900 dark:text-white mt-4 text-center">
              {isEn ? 'Perfect!' : 'عالیست!'}
            </Text>
            <Text className="text-base text-slate-600 dark:text-slate-300 mt-2 text-center mb-6">
              {isEn ? 'Plant added to your garden' : 'گیاه به باغچه شما اضافه شد'}
            </Text>
            <Button 
              variant="primary" 
              className="w-full"
              onPress={handleGoToGarden}
            >
              {isEn ? 'Go to My Garden' : 'رفتن به باغچه من'}
            </Button>
          </View>
        </View>
      </Modal>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 bg-white dark:bg-slate-900">
        {/* Header Image Section */}
        <View className="relative h-80 w-full">
          <Image
            source={{ uri: plant.primary_image || 'https://via.placeholder.com/400' }}
            className="w-full h-full"
            resizeMode="cover"
          />
          <View className="absolute inset-0 bg-black/40" />
          
          <View className="absolute top-4 left-4 z-20">
            <Button 
              variant="secondary" 
              size="sm" 
              className="rounded-full w-10 h-10 p-0 bg-white/90 dark:bg-slate-800/90"
              onPress={() => navigation.goBack()}
            >
              <ArrowLeft size={20} color="#1e293b" />
            </Button>
          </View>

          <View className="absolute bottom-6 left-6 right-6">
            <Badge variant="success" className="mb-2 self-start">
              {difficulty}
            </Badge>
            <Text className="text-4xl font-black text-white shadow-lg leading-tight mb-1">
              {name}
            </Text>
            <Text className="text-white/90 italic text-base">
              {plant.scientific_name}
            </Text>
            {((isEn ? (plant.other_names_en || plant.other_names) : (plant.other_names || plant.other_names_en))) ? (
              <Text className="text-white/80 text-sm mt-1">
                {isEn ? 'Also known as: ' : 'نام‌های دیگر: '}{isEn ? (plant.other_names_en || plant.other_names) : (plant.other_names || plant.other_names_en)}
              </Text>
            ) : null}
          </View>
        </View>

        {/* Stats Row */}
        <View className="flex-row justify-between px-6 py-5 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
          <View className="flex-row items-center gap-6">
            <View className="items-center">
              <Heart size={22} color="#EF4444" />
              <Text className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">{plant.favourite_count}</Text>
            </View>
            <View className="items-center">
              <Eye size={22} color="#64748B" />
              <Text className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">{plant.view_count}</Text>
            </View>
            <View className="items-center">
              <Bookmark size={22} color="#16A34A" />
              <Text className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">{plant.garden_count || 0}</Text>
            </View>
          </View>
          
          <Button variant="ghost" size="sm" className="w-10 h-10 p-0 rounded-full bg-slate-100 dark:bg-slate-700">
            <Share2 size={20} color="#64748B" />
          </Button>
        </View>

        {/* Tab Navigation */}
        <View className="flex-row bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 px-4">
          {['overview', 'care', 'details'].map((tab) => (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab as any)}
              className={`flex-1 py-4 border-b-2 ${
                activeTab === tab
                  ? 'border-brand-500 dark:border-brand-400'
                  : 'border-transparent'
              }`}
            >
              <Text
                className={`text-center font-bold text-base ${
                  activeTab === tab
                    ? 'text-brand-600 dark:text-brand-400'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {tab === 'overview' && (isEn ? 'Overview' : 'نمای کلی')}
                {tab === 'care' && (isEn ? 'Care' : 'مراقبت')}
                {tab === 'details' && (isEn ? 'Details' : 'جزئیات')}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Content Sections */}
        <View className="px-6 py-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <View>
              {/* Quick Care Grid */}
              <View className="mb-8">
                <View className="flex-row flex-wrap justify-between gap-3">
                  {careItems.map((item, i) => (
                    <View key={i} className="w-[48%] bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                      <View className="mb-3">
                        {item.icon}
                      </View>
                      <Text className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1">{item.label}</Text>
                      <Text className="text-base font-bold text-slate-800 dark:text-white leading-tight">{item.value}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Description with Font Size Controls */}
              <View className="bg-gradient-to-br from-brand-50 to-brand-50/50 dark:from-slate-800 dark:to-slate-800/50 rounded-2xl p-5 border border-brand-100 dark:border-slate-700 mb-6">
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="text-lg font-bold text-slate-900 dark:text-white">
                    {isEn ? 'About this Plant' : 'درباره این گیاه'}
                  </Text>
                  <View className="flex-row items-center gap-2 bg-white dark:bg-slate-700 rounded-lg p-1">
                    <Pressable
                      onPress={() => setDescriptionFontSize(Math.max(12, descriptionFontSize - 2))}
                      className="p-2 rounded"
                    >
                      <Minus size={18} color="#64748B" />
                    </Pressable>
                    <Text className="text-xs font-bold text-slate-600 dark:text-slate-300 w-6 text-center">
                      {Math.round((descriptionFontSize / 16) * 100)}%
                    </Text>
                    <Pressable
                      onPress={() => setDescriptionFontSize(Math.min(24, descriptionFontSize + 2))}
                      className="p-2 rounded"
                    >
                      <Plus size={18} color="#16A34A" />
                    </Pressable>
                  </View>
                </View>

                <RenderHtml
                  contentWidth={width - 48}
                  source={htmlSource}
                  baseStyle={{
                    color: isDark ? '#cbd5e1' : '#475569',
                    fontSize: descriptionFontSize,
                    lineHeight: descriptionFontSize * 1.8,
                  }}
                  tagsStyles={{
                    p: { marginBottom: 16, textAlign: isEn ? 'left' : 'right' },
                    h2: { marginTop: 20, marginBottom: 12, fontSize: descriptionFontSize + 4, fontWeight: 'bold', color: isDark ? '#fff' : '#1e293b' },
                    h3: { marginTop: 16, marginBottom: 10, fontSize: descriptionFontSize + 2, fontWeight: 'bold', color: isDark ? '#e2e8f0' : '#334155' },
                    li: { marginBottom: 8, marginLeft: 16 },
                    strong: { fontWeight: 'bold' },
                    em: { fontStyle: 'italic' },
                  }}
                />
              </View>
            </View>
          )}

          {/* Care Tab */}
          {activeTab === 'care' && (
            <View>
              <View className="space-y-4">
                {detailedCareItems.map((item, i) => (
                  <View key={i} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
                    <View className="flex-row items-center gap-3 mb-2">
                      <Text className="text-2xl">{item.icon}</Text>
                      <Text className="text-lg font-bold text-slate-900 dark:text-white flex-1">{item.label}</Text>
                    </View>
                    <Text className="text-base text-slate-700 dark:text-slate-300 leading-6 ml-10">
                      {item.value}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Details Tab */}
          {activeTab === 'details' && (
            <View>
              <View className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 mb-6">
                <Text className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                  {isEn ? 'Plant Information' : 'اطلاعات گیاه'}
                </Text>
                
                {plant.family && (
                  <View className="mb-4 pb-4 border-b border-slate-100 dark:border-slate-700">
                    <Text className="text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">
                      {isEn ? 'Family' : 'خانواده'}
                    </Text>
                    <Text className="text-base text-slate-800 dark:text-slate-200">{plant.family}</Text>
                  </View>
                )}

                {plant.origin && (
                  <View className="mb-4 pb-4 border-b border-slate-100 dark:border-slate-700">
                    <Text className="text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">
                      {isEn ? 'Origin' : 'منشأ'}
                    </Text>
                    <Text className="text-base text-slate-800 dark:text-slate-200">{plant.origin}</Text>
                  </View>
                )}

                <View className="mb-4">
                  <Text className="text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">
                    {isEn ? 'Toxicity' : 'سمیت'}
                  </Text>
                  <Badge variant={plant.is_toxic ? 'danger' : 'success'}>
                    {plant.is_toxic ? (isEn ? 'Toxic' : 'سمی') : (isEn ? 'Non-toxic' : 'غیرسمی')}
                  </Badge>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View className="px-6 pb-8 gap-3">
          <Button 
            variant="primary" 
            size="lg" 
            className="w-full"
            onPress={handleAddToGarden}
            isLoading={adding}
          >
            {isEn ? 'Add to My Garden' : 'افزودن به باغچه من'}
          </Button>
          <Button variant="outline" size="lg" className="w-full">
            {isEn ? 'Mark as Favorite' : 'افزودن به علاقه‌مندی‌ها'}
          </Button>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

export default PlantDetailsScreen;

