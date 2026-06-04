import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  Image,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Plus,
  Droplet,
  Bell,
  Leaf,
  ChevronLeft,
  MessageCircle,
  TrendingUp,
  Sparkles,
  Heart,
  AlertTriangle,
} from 'lucide-react-native';

import { ScreenWrapper } from '../components/common/ScreenWrapper';
import { Button } from '../components/common/Button';
import { useUserPlants } from '../hooks/useUserPlants';
import { RootStackParamList } from '../types/navigation';
import { Loader } from '../components/common/Loader';
import { FilterSortBar } from '../components/common/FilterSortBar';
import { FilterSortModal } from '../components/common/FilterSortModal';
import { PlantManagePanel, PlantManageTab } from '../components/garden/PlantManagePanel';
import { GARDEN_SORT_OPTIONS } from '../constants/filters';
import { cn } from '../utils/cn';
import { UserPlant } from '../types';
import { formatDate } from '../utils/date';

type ViewMode = 'list' | 'detail';

const healthPill = (status: UserPlant['health_status']) => {
  if (status === 'healthy') return { bg: 'bg-green-100 dark:bg-green-900/40', text: 'text-green-700 dark:text-green-300' };
  if (status === 'needs_attention') return { bg: 'bg-amber-100 dark:bg-amber-900/40', text: 'text-amber-700 dark:text-amber-300' };
  return { bg: 'bg-red-100 dark:bg-red-900/40', text: 'text-red-700 dark:text-red-300' };
};

const MyGardenScreen = () => {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language === 'en';
  const lang = isEn ? 'en' : 'fa';
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { userPlants, loading, refreshUserPlants, removeUserPlant } = useUserPlants();

  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [ordering, setOrdering] = useState('-created_at');
  const [modalType, setModalType] = useState<'filter' | 'sort' | null>(null);
  const [selectedPlant, setSelectedPlant] = useState<UserPlant | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [detailTab, setDetailTab] = useState<PlantManageTab>('info');

  const stats = useMemo(() => {
    const healthy = userPlants.filter((p) => p.health_status === 'healthy').length;
    const attention = userPlants.filter((p) => p.health_status === 'needs_attention').length;
    const pendingTasks = userPlants.reduce(
      (acc, p) => acc + (p.reminders?.filter((r) => !r.is_completed).length ?? 0),
      0
    );
    return { total: userPlants.length, healthy, attention, pendingTasks };
  }, [userPlants]);

  const processedPlants = useMemo(() => {
    let result = [...userPlants];

    if (search.trim()) {
      const query = search.toLowerCase();
      result = result.filter(
        (up: UserPlant) =>
          up.nickname?.toLowerCase().includes(query) ||
          up.plant_details?.farsi_name.toLowerCase().includes(query) ||
          up.plant_details?.english_name?.toLowerCase().includes(query)
      );
    }

    if (filters.health_status) {
      result = result.filter((up) => up.health_status === filters.health_status);
    }

    result.sort((a, b) => {
      if (ordering === 'plant__english_name') {
        const nameA = (a.plant_details?.english_name || a.plant_details?.farsi_name || '').toLowerCase();
        const nameB = (b.plant_details?.english_name || b.plant_details?.farsi_name || '').toLowerCase();
        return nameA.localeCompare(nameB);
      }
      if (ordering === '-created_at') {
        return new Date(b.added_date || 0).getTime() - new Date(a.added_date || 0).getTime();
      }
      if (ordering === '-health_status') {
        return (b.health_status || '').localeCompare(a.health_status || '');
      }
      return 0;
    });

    return result;
  }, [userPlants, search, ordering, filters]);

  const openPlant = useCallback((plant: UserPlant, tab: PlantManageTab = 'info') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const fresh = userPlants.find((p) => p.id === plant.id) ?? plant;
    setSelectedPlant(fresh);
    setDetailTab(tab);
    setViewMode('detail');
  }, [userPlants]);

  const closeDetail = useCallback(() => {
    setViewMode('list');
    setSelectedPlant(null);
  }, []);

  const liveSelectedPlant = useMemo(() => {
    if (!selectedPlant) return null;
    return userPlants.find((p) => p.id === selectedPlant.id) ?? selectedPlant;
  }, [selectedPlant, userPlants]);

  if (loading && userPlants.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-surface-light dark:bg-surface-dark">
        <Loader size={20} />
      </View>
    );
  }

  if (viewMode === 'detail' && liveSelectedPlant) {
    return (
      <View className="flex-1 bg-slate-50 dark:bg-slate-950" style={{ paddingTop: insets.top }}>
        <View className="flex-row items-center px-4 py-3 gap-3">
          <TouchableOpacity
            onPress={closeDetail}
            className="w-11 h-11 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 items-center justify-center"
          >
            <ChevronLeft size={22} color="#64748b" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-lg font-black text-slate-900 dark:text-white" numberOfLines={1}>
              {liveSelectedPlant.nickname || liveSelectedPlant.plant_details?.farsi_name}
            </Text>
            <Text className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
              {isEn ? 'Plant Manager' : 'مدیریت گیاه'}
            </Text>
          </View>
        </View>

        <PlantManagePanel
          userPlant={liveSelectedPlant}
          isEn={isEn}
          initialTab={detailTab}
          showHero
          onUpdate={() => refreshUserPlants()}
          onRefresh={refreshUserPlants}
          onDelete={async () => {
            await removeUserPlant(liveSelectedPlant.id);
            closeDetail();
          }}
        />
      </View>
    );
  }

  const renderPlantCard = ({ item }: { item: UserPlant }) => {
    const plant = item.plant_details!;
    const name =
      item.nickname || (isEn ? plant.english_name || plant.farsi_name : plant.farsi_name);
    const pill = healthPill(item.health_status);
    const pending = item.reminders?.filter((r) => !r.is_completed).length ?? 0;
    const nextWater = formatDate(item.next_watering_date, lang);

    return (
      <Pressable onPress={() => openPlant(item)} className="mb-4 active:opacity-95">
        <View className="rounded-[32px] overflow-hidden bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
          <View className="h-40">
            <Image
              source={{ uri: plant.primary_image || 'https://via.placeholder.com/400' }}
              className="w-full h-full"
              resizeMode="cover"
            />
            <LinearGradient
              colors={['transparent', 'rgba(15,23,42,0.85)']}
              className="absolute inset-0"
            />
            <View className="absolute top-3 right-3">
              <View className={cn('px-2.5 py-1 rounded-full', pill.bg)}>
                <Text className={cn('text-[9px] font-black uppercase', pill.text)}>
                  {item.health_status.replace('_', ' ')}
                </Text>
              </View>
            </View>
            <View className="absolute bottom-0 left-0 right-0 p-4">
              <Text className="text-xl font-black text-white" numberOfLines={1}>
                {name}
              </Text>
              <Text className="text-white/60 text-xs font-medium mt-0.5" numberOfLines={1}>
                {plant.scientific_name || plant.farsi_name}
              </Text>
            </View>
          </View>

          <View className="p-4 flex-row gap-2">
            <View className="flex-1 flex-row items-center gap-2 bg-blue-50 dark:bg-blue-900/20 rounded-2xl px-3 py-2.5 border border-blue-100/80 dark:border-blue-800/30">
              <Droplet size={14} color="#3B82F6" />
              <View>
                <Text className="text-[9px] font-bold text-blue-500 uppercase">
                  {isEn ? 'Water' : 'آب'}
                </Text>
                <Text className="text-[11px] font-black text-blue-700 dark:text-blue-300">
                  {nextWater}
                </Text>
              </View>
            </View>
            <View className="flex-1 flex-row items-center gap-2 bg-brand-50 dark:bg-brand-900/20 rounded-2xl px-3 py-2.5 border border-brand-100/80 dark:border-brand-800/30">
              <Bell size={14} color="#16A34A" />
              <View>
                <Text className="text-[9px] font-bold text-brand-500 uppercase">
                  {isEn ? 'Tasks' : 'کارها'}
                </Text>
                <Text className="text-[11px] font-black text-brand-700 dark:text-brand-300">
                  {pending}
                </Text>
              </View>
            </View>
          </View>

          <View className="px-4 pb-4 flex-row gap-2">
            {(
              [
                { tab: 'chat' as PlantManageTab, icon: MessageCircle, label: isEn ? 'AI' : 'چت' },
                { tab: 'growth' as PlantManageTab, icon: TrendingUp, label: isEn ? 'Growth' : 'رشد' },
                { tab: 'edit' as PlantManageTab, icon: Sparkles, label: isEn ? 'Edit' : 'ویرایش' },
              ] as const
            ).map((action) => {
              const Icon = action.icon;
              return (
                <TouchableOpacity
                  key={action.tab}
                  onPress={() => openPlant(item, action.tab)}
                  className="flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700"
                >
                  <Icon size={14} color="#64748b" />
                  <Text className="text-[10px] font-black text-slate-600 dark:text-slate-300">
                    {action.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <ScreenWrapper withScroll={false} padding={false}>
      <FlatList
        data={processedPlants}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refreshUserPlants} tintColor="#16a34a" />
        }
        ListHeaderComponent={
          <View className="pt-2 pb-4">
            <View className="flex-row justify-between items-start mb-5">
              <View className="flex-1 mr-3">
                <Text className="text-3xl font-black text-slate-900 dark:text-white">
                  {t('common.mygarden')}
                </Text>
                <Text className="text-slate-500 dark:text-slate-400 mt-1">
                  {isEn ? 'Track care, growth & health' : 'پیگیری مراقبت، رشد و سلامت'}
                </Text>
              </View>
              <Button
                variant="primary"
                className="w-12 h-12 p-0 rounded-2xl shadow-lg shadow-brand-500/30"
                onPress={() => navigation.navigate('Library')}
              >
                <Plus size={24} color="white" />
              </Button>
            </View>

            <LinearGradient
              colors={['#16a34a', '#059669', '#047857']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="rounded-[32px] p-5 mb-5 overflow-hidden"
            >
              <View className="flex-row items-center gap-2 mb-4">
                <Leaf size={18} color="rgba(255,255,255,0.9)" />
                <Text className="text-white/90 text-xs font-black uppercase tracking-widest">
                  {isEn ? 'Garden Overview' : 'خلاصه باغچه'}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <StatBlock value={stats.total} label={isEn ? 'Plants' : 'گیاه'} />
                <StatBlock value={stats.healthy} label={isEn ? 'Healthy' : 'سالم'} icon={<Heart size={14} color="#bbf7d0" />} />
                <StatBlock
                  value={stats.attention}
                  label={isEn ? 'Alert' : 'هشدار'}
                  icon={<AlertTriangle size={14} color="#fde68a" />}
                />
                <StatBlock value={stats.pendingTasks} label={isEn ? 'Tasks' : 'کار'} icon={<Bell size={14} color="#bfdbfe" />} />
              </View>
            </LinearGradient>

            <FilterSortBar
              search={search}
              onSearchChange={setSearch}
              onFilterPress={() => setModalType('filter')}
              onSortPress={() => setModalType('sort')}
              activeFiltersCount={Object.keys(filters).length}
            />
          </View>
        }
        renderItem={renderPlantCard}
        ListEmptyComponent={
          <View className="items-center justify-center py-16 px-6">
            <View className="w-24 h-24 rounded-full bg-brand-50 dark:bg-brand-900/30 items-center justify-center mb-6">
              <Text className="text-5xl">🪴</Text>
            </View>
            <Text className="text-xl font-black text-slate-800 dark:text-white text-center mb-2">
              {isEn ? 'Your garden awaits' : 'باغچه شما منتظر است'}
            </Text>
            <Text className="text-slate-500 dark:text-slate-400 text-center mb-8 leading-6">
              {isEn
                ? 'Add plants from the library to track watering, growth records, reminders, and chat with AI.'
                : 'از کتابخانه گیاه اضافه کنید تا آبیاری، رشد، یادآوری و چت هوشمند را مدیریت کنید.'}
            </Text>
            <Button variant="primary" className="rounded-2xl px-10" onPress={() => navigation.navigate('Library')}>
              <Text className="text-white font-black">{isEn ? 'Browse Plants' : 'مشاهده گیاهان'}</Text>
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
            ],
          },
        }}
        currentFilters={filters}
        onFiltersApply={setFilters}
      />
    </ScreenWrapper>
  );
};

const StatBlock = ({
  value,
  label,
  icon,
}: {
  value: number;
  label: string;
  icon?: React.ReactNode;
}) => (
  <View className="items-center flex-1">
    <View className="flex-row items-center gap-1">
      {icon}
      <Text className="text-2xl font-black text-white">{value}</Text>
    </View>
    <Text className="text-[10px] text-white/70 font-bold mt-0.5">{label}</Text>
  </View>
);

export default MyGardenScreen;
