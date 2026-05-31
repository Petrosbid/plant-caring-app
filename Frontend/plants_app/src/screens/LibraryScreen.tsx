import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRoute } from '@react-navigation/native';
import { ScreenWrapper } from '../components/common/ScreenWrapper';
import { PlantCard } from '../components/plants/PlantCard';
import { plantService } from '../services/api';
import { Plant } from '../types';
import { Loader } from '../components/common/Loader';
import { FilterSortBar } from '../components/common/FilterSortBar';
import { FilterSortModal } from '../components/common/FilterSortModal';
import { PLANT_FILTERS, PLANT_SORT_OPTIONS } from '../constants/filters';

const LibraryScreen = () => {
  const { t, i18n } = useTranslation();
  const route = useRoute();
  const initialFilters = (route.params as any)?.filters || {};

  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Filter & Sort State
  const [filters, setFilters] = useState<Record<string, string>>(initialFilters);
  const [ordering, setOrdering] = useState('-created_at');
  const [modalType, setModalType] = useState<'filter' | 'sort' | null>(null);

  // Update filters if route params change
  useEffect(() => {
    if ((route.params as any)?.filters) {
      setFilters((route.params as any).filters);
    }
  }, [(route.params as any)?.filters]);

  const fetchPlants = async (pageNum = 1, isRefreshing = false) => {
    try {
      if (!isRefreshing && pageNum === 1) setLoading(true);
      const res = await plantService.getPlants({ 
        page: pageNum, 
        search: search || undefined,
        ordering,
        ...filters
      });
      
      if (isRefreshing || pageNum === 1) {
        setPlants(res.results);
      } else {
        setPlants(prev => [...prev, ...res.results]);
      }
      setHasMore(!!res.next);
    } catch (err) {
      console.error('Failed to fetch plants:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setPage(1);
      fetchPlants(1);
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [search, filters, ordering]);

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    fetchPlants(1, true);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPlants(nextPage);
    }
  };

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

  return (
    <ScreenWrapper withScroll={false}>
      <View className="px-2 pt-2">
        <Text className="text-3xl font-black text-slate-900 dark:text-white mb-6">
          {t('common.library')}
        </Text>
        
        <FilterSortBar 
          search={search}
          onSearchChange={setSearch}
          onFilterPress={() => setModalType('filter')}
          onSortPress={() => setModalType('sort')}
          activeFiltersCount={Object.keys(filters).length}
        />
      </View>

      {loading && page === 1 ? (
        <View className="flex-1 items-center justify-center">
          <Loader size={16} />
        </View>
      ) : (
        <FlatList
          data={plants}
          renderItem={({ item }) => <PlantCard plant={item} className="mx-2" />}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 120, paddingTop: 10 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#16a34a" />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            hasMore ? <Loader className="py-6" /> : null
          }
          ListEmptyComponent={
            !loading ? (
              <View className="items-center justify-center py-20">
                <Text className="text-slate-400">
                  {i18n.language === 'en' ? "No plants found" : "گیاهی یافت نشد"}
                </Text>
              </View>
            ) : null
          }
        />
      )}

      <FilterSortModal 
        isVisible={!!modalType}
        onClose={() => setModalType(null)}
        type={modalType || 'filter'}
        sortOptions={PLANT_SORT_OPTIONS}
        currentSort={ordering}
        onSortChange={setOrdering}
        filterCategories={PLANT_FILTERS as any}
        currentFilters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={() => setFilters({})}
      />
    </ScreenWrapper>
  );
};

export default LibraryScreen;
