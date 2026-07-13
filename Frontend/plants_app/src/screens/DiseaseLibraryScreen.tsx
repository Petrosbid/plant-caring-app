import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, RefreshControl, TouchableOpacity, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ScreenWrapper } from '../components/common/ScreenWrapper';
import { diseaseService } from '../services/api';
import { Disease } from '../types';
import { Loader } from '../components/common/Loader';
import { FilterSortBar } from '../components/common/FilterSortBar';
import { FilterSortModal } from '../components/common/FilterSortModal';
import { DISEASE_FILTERS, DISEASE_SORT_OPTIONS } from '../constants/filters';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { AlertTriangle, Activity, Eye, MessageCircle } from 'lucide-react-native';

const DiseaseLibraryScreen = () => {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const isEn = i18n.language === 'en';

  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [filters, setFilters] = useState<Record<string, string>>({});
  const [ordering, setOrdering] = useState('-created_at');
  const [modalType, setModalType] = useState<'filter' | 'sort' | null>(null);

  const fetchDiseases = async (pageNum = 1, isRefreshing = false) => {
    try {
      if (!isRefreshing && pageNum === 1) setLoading(true);
      const res = await diseaseService.getDiseases({
        page: pageNum,
        search: search || undefined,
        ordering,
        ...filters
      });
      
      if (isRefreshing || pageNum === 1) {
        setDiseases(res.results);
      } else {
        setDiseases(prev => [...prev, ...res.results]);
      }
      setHasMore(!!res.next);
    } catch (err) {
      console.error('Failed to fetch diseases:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setPage(1);
      fetchDiseases(1);
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [search, filters, ordering]);

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    fetchDiseases(1, true);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchDiseases(nextPage);
    }
  };

  return (
    <ScreenWrapper withScroll={false}>
      <View className="px-2 pt-2 mb-6">
        <Text className="text-3xl font-black text-slate-900 dark:text-white mb-2">
          {isEn ? "Disease Library" : "کتابخانه بیماری‌ها"}
        </Text>
        <Text className="text-slate-500 dark:text-slate-400 mb-6">
          {isEn ? "Browse and learn about plant pests and diseases" : "درباره آفت‌ها و بیماری‌های گیاهی بیاموزید"}
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
          data={diseases}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 120 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#16a34a" />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          renderItem={({ item }) => {
            const name = isEn ? item.name : (item.name_fa || item.name);
            const severityColor = {
                low: 'success',
                medium: 'warning',
                high: 'error',
                critical: 'error'
            }[item.severity_level] || 'warning';

            return (
              <TouchableOpacity 
                onPress={() => navigation.navigate('DiseaseDetails', { id: item.id.toString() })}
                activeOpacity={0.9}
                className="mb-6"
              >
                <Card className="p-5">
                  {item.image && (
                    <View className="w-full h-40 rounded-2xl overflow-hidden mb-4">
                      <Image source={{ uri: item.image }} className="w-full h-full" resizeMode="cover" />
                    </View>
                  )}
                  <View className="flex-row justify-between items-start mb-3">
                    <Text className="text-xl font-black text-slate-900 dark:text-white flex-1 mr-2">
                      {name}
                    </Text>
                    <Badge variant={severityColor as any}>
                      {isEn ? item.severity_level : t(`disease.severity.${item.severity_level}`)}
                    </Badge>
                  </View>

                  <View className="flex-row flex-wrap gap-2 mb-4">
                    <View className="flex-row items-center gap-1 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-lg">
                      <Activity size={14} color="#64748b" />
                      <Text className="text-[10px] text-slate-500 font-bold uppercase">
                        {isEn ? item.spread_rate : t(`disease.spread.${item.spread_rate}`)}
                      </Text>
                    </View>
                    <View className="flex-row items-center gap-1 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-lg">
                      <AlertTriangle size={14} color="#ef4444" />
                      <Text className="text-[10px] text-slate-500 font-bold uppercase">
                        {isEn ? "Infectious" : "مسری"}: {item.is_infectious_en === 'yes' ? (isEn ? 'Yes' : 'بله') : (isEn ? 'No' : 'خیر')}
                      </Text>
                    </View>
                  </View>

                  <Text className="text-slate-500 dark:text-slate-400 text-sm leading-5 mb-4" numberOfLines={2}>
                    {isEn ? item.description : (item.description_fa || item.description)}
                  </Text>

                  <View className="flex-row items-center gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <View className="flex-row items-center gap-1">
                      <Eye size={14} color="#94a3b8" />
                      <Text className="text-[10px] text-slate-400 font-bold">{item.view_count}</Text>
                    </View>
                    <View className="flex-row items-center gap-1">
                      <MessageCircle size={14} color="#94a3b8" />
                      <Text className="text-[10px] text-slate-400 font-bold">{item.comment_count || 0}</Text>
                    </View>
                  </View>
                </Card>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            !loading ? (
              <View className="items-center justify-center py-20">
                <Text className="text-slate-400">
                  {isEn ? "No diseases found" : "بیماری‌ای یافت نشد"}
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
        sortOptions={DISEASE_SORT_OPTIONS}
        currentSort={ordering}
        onSortChange={setOrdering}
        filterCategories={DISEASE_FILTERS as any}
        currentFilters={filters}
        onFiltersApply={setFilters}
      />
    </ScreenWrapper>
  );
};

export default DiseaseLibraryScreen;
