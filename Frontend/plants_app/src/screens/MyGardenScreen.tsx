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
import { Plus, Droplet, TrendingUp, Calendar } from 'lucide-react-native';
import { FilterSortBar } from '../components/common/FilterSortBar';
import { FilterSortModal } from '../components/common/FilterSortModal';
import { PlantManageModal } from '../components/garden/PlantManageModal';
import { GARDEN_SORT_OPTIONS } from '../constants/filters';
import { cn } from '../utils/cn';
import { UserPlant } from '../types';

const MyGardenScreen = () => {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language === 'en';
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { userPlants, loading, refreshUserPlants } = useUserPlants();
  
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [ordering, setOrdering] = useState('-created_at');
  const [modalType, setModalType] = useState<'filter' | 'sort' | null>(null);
  const [selectedPlant, setSelectedPlant] = useState<UserPlant | null>(null);

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

    // Filter by health status
    if (filters.health_status) {
        result = result.filter(up => up.health_status === filters.health_status);
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
  }, [userPlants, search, ordering, filters]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => {
      if (prev[key] === value) {
        const newFilters = { ...prev };
        delete newFilters[key];
        return newFilters;
      }
      return { ...prev, [key]: value };
    });
  };

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
          activeFiltersCount={Object.keys(filters).length}
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
              onPress={() => setSelectedPlant(item)}
              activeOpacity={0.9}
              className="mb-4"
            >
              <Card className="p-0 overflow-hidden rounded-[32px] border-slate-50 dark:border-slate-800">
                <View className="flex-row h-36">
                  <Image 
                    source={{ uri: plant.primary_image || 'https://via.placeholder.com/150' }} 
                    className="w-36 h-full"
                    resizeMode="cover"
                  />
                  <View className="flex-1 p-5 justify-between">
                    <View>
                      <View className="flex-row justify-between items-start mb-1">
                        <Text className="flex-1 text-lg font-black text-slate-900 dark:text-white mr-2" numberOfLines={1}>
                          {name}
                        </Text>
                        <View className={cn(
                          "px-2 py-0.5 rounded-full",
                          item.health_status === 'healthy' ? "bg-green-100 dark:bg-green-900/30" : "bg-yellow-100 dark:bg-yellow-900/30"
                        )}>
                            <Text className={cn(
                                "text-[8px] font-black",
                                item.health_status === 'healthy' ? "text-green-600 dark:text-green-400" : "text-yellow-600 dark:text-yellow-400"
                            )}>{item.health_status.toUpperCase()}</Text>
                        </View>
                      </View>
                      <Text className="text-xs text-slate-400 font-bold italic" numberOfLines={1}>
                        {plant.scientific_name || plant.farsi_name}
                      </Text>
                    </View>

                    <View className="flex-row gap-3">
                      <View className="flex-1 bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-2 items-center justify-center border border-blue-100 dark:border-blue-800/30">
                        <Droplet size={14} color="#3B82F6" />
                        <Text className="text-[10px] text-blue-600 dark:text-blue-400 font-black mt-1">
                          {item.watering_interval_days}d
                        </Text>
                      </View>
                      <View className="flex-1 bg-brand-50 dark:bg-brand-900/20 rounded-2xl p-2 items-center justify-center border border-brand-100 dark:border-brand-800/30">
                        <Calendar size={14} color="#16A34A" />
                        <Text className="text-[10px] text-brand-600 dark:text-brand-400 font-black mt-1">
                          Tasks
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
            <Text className="text-slate-500 dark:text-slate-400 text-center px-10 mb-6 font-bold">
              {isEn ? "Your garden is empty. Start adding plants to track their growth!" : "باغچه شما خالی است. برای پیگیری رشد، گیاهان خود را اضافه کنید!"}
            </Text>
            <Button 
              variant="primary" 
              className="rounded-2xl px-8"
              onPress={() => navigation.navigate('Library')}
            >
              <Text className="text-white font-black">{isEn ? "Browse Plants" : "مشاهده گیاهان"}</Text>
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
        filterCategories={{
            health_status: {
                labelEn: 'Health',
                labelFa: 'وضعیت سلامت',
                values: [
                    { en: 'Healthy', fa: 'سالم', query: 'healthy' },
                    { en: 'Needs Attention', fa: 'نیاز به توجه', query: 'needs_attention' },
                    { en: 'Unhealthy', fa: 'ناسالم', query: 'unhealthy' },
                ]
            }
        }}
        currentFilters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={() => setFilters({})}
      />

      {selectedPlant && (
          <PlantManageModal 
            isVisible={!!selectedPlant}
            onClose={() => setSelectedPlant(null)}
            userPlant={selectedPlant}
            onUpdate={(data) => {
                refreshUserPlants();
            }}
            onRefresh={refreshUserPlants}
          />
      )}
    </ScreenWrapper>
  );
};

export default MyGardenScreen;
