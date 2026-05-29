import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, RefreshControl, Image, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ScreenWrapper } from '../components/common/ScreenWrapper';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { useUserPlants } from '../hooks/useUserPlants';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { Loader } from '../components/common/Loader';
import { Search, Plus, Droplet, TrendingUp } from 'lucide-react-native';
import { FilterSortBar } from '../components/common/FilterSortBar';
import { FilterSortModal } from '../components/common/FilterSortModal';
import { GARDEN_SORT_OPTIONS } from '../constants/filters';
import { cn } from '../utils/cn';
import { UserPlant } from '../types';

const MyGardenScreen = () => {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language === 'en';
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { userPlants, loading, refreshUserPlants } = useUserPlants();
  
  const [search, setSearch] = useState('');
  const [ordering, setOrdering] = useState('-created_at');
  const [modalType, setModalType] = useState<'filter' | 'sort' | null>(null);

  const processedPlants = useMemo(() => {
    let result = [...userPlants];

    // Search
    if (search.trim()) {
      const query = search.toLowerCase();
      result = result.filter((up: UserPlant) => 
        up.nickname?.toLowerCase().includes(query) || 
        up.plant_details?.farsi_name.toLowerCase().includes(query) ||
        up.plant_details?.english_name?.toLowerCase().includes(query)
      );
    }

    // Sort
    result.sort((a, b) => {
      if (ordering === 'plant__english_name') {
        const nameA = (a.plant_details?.english_name || a.plant_details?.farsi_name || '').toLowerCase();
        const nameB = (b.plant_details?.english_name || b.plant_details?.farsi_name || '').toLowerCase();
        return nameA.localeCompare(nameB);
      }
      if (ordering === '-created_at') {
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      }
      if (ordering === '-health_status') {
        return (b.health_status || '').localeCompare(a.health_status || '');
      }
      return 0;
    });

    return result;
  }, [userPlants, search, ordering]);

  if (loading && userPlants.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-surface-light dark:bg-surface-dark">
        <Loader size={20} />
      </View>
    );
  }

  return (
    <ScreenWrapper withScroll={false}>
      <View className="px-2 pt-2 mb-6">
        <View className="flex-row justify-between items-center mb-4">
          <View>
            <Text className="text-3xl font-black text-slate-900 dark:text-white">
              {t('common.mygarden')}
            </Text>
            <Text className="text-slate-500 dark:text-slate-400">
              {isEn ? "Manage your collection" : "مدیریت کلکسیون شما"}
            </Text>
          </View>
          <Button 
            variant="primary" 
            className="w-12 h-12 p-0 rounded-2xl"
            onPress={() => navigation.navigate('Library')}
          >
            <Plus size={24} color="white" />
          </Button>
        </View>

        <FilterSortBar 
          search={search}
          onSearchChange={setSearch}
          onFilterPress={() => setModalType('filter')}
          onSortPress={() => setModalType('sort')}
        />
      </View>

      <FlatList
        data={processedPlants}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingHorizontal: 8, paddingBottom: 120 }}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refreshUserPlants} tintColor="#16a34a" />
        }
        renderItem={({ item }: { item: UserPlant }) => {
          const plant = item.plant_details!;
          const name = item.nickname || (isEn ? plant.english_name || plant.farsi_name : plant.farsi_name);
          
          return (
            <TouchableOpacity 
              onPress={() => navigation.navigate('PlantDetails', { id: plant.id.toString() })}
              activeOpacity={0.9}
              className="mb-4"
            >
              <Card className="p-0 overflow-hidden">
                <View className="flex-row h-32">
                  <Image 
                    source={{ uri: plant.primary_image || 'https://via.placeholder.com/150' }} 
                    className="w-32 h-full"
                    resizeMode="cover"
                  />
                  <View className="flex-1 p-4 justify-between">
                    <View>
                      <View className="flex-row justify-between items-center mb-1">
                        <Text className="text-lg font-bold text-slate-900 dark:text-white" numberOfLines={1}>
                          {name}
                        </Text>
                        <View className={cn(
                          "w-2 h-2 rounded-full",
                          item.health_status === 'healthy' ? "bg-green-500" : "bg-yellow-500"
                        )} />
                      </View>
                      <Text className="text-xs text-slate-400" numberOfLines={1}>
                        {isEn ? plant.scientific_name : plant.farsi_name}
                      </Text>
                    </View>

                    <View className="flex-row gap-4 mt-2">
                      <View className="flex-row items-center gap-1">
                        <Droplet size={12} color="#3B82F6" />
                        <Text className="text-[10px] text-slate-500 font-bold">
                          {item.watering_interval_days}d
                        </Text>
                      </View>
                      <View className="flex-row items-center gap-1">
                        <TrendingUp size={12} color="#16A34A" />
                        <Text className="text-[10px] text-slate-500 font-bold uppercase">
                          {item.health_status}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View className="items-center justify-center py-20">
            <Text className="text-6xl mb-4">🪴</Text>
            <Text className="text-slate-500 dark:text-slate-400 text-center px-10 mb-6">
              {isEn ? "Your garden is empty. Start adding plants to track their growth!" : "باغچه شما خالی است. برای پیگیری رشد، گیاهان خود را اضافه کنید!"}
            </Text>
            <Button 
              variant="outline" 
              onPress={() => navigation.navigate('Library')}
            >
              {isEn ? "Browse Plants" : "مشاهده گیاهان"}
            </Button>
          </View>
        }
      />

      <FilterSortModal 
        isVisible={!!modalType}
        onClose={() => setModalType(null)}
        type={modalType || 'sort'}
        sortOptions={GARDEN_SORT_OPTIONS}
        currentSort={ordering}
        onSortChange={setOrdering}
      />
    </ScreenWrapper>
  );
};

export default MyGardenScreen;
