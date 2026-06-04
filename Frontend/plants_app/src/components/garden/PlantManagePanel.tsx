import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Info,
  Edit3,
  TrendingUp,
  Bell,
  MessageCircle,
  Save,
  Trash2,
  Droplet,
  Thermometer,
  Sun,
  Shield,
  Plus,
  Leaf,
  Scissors,
  Calendar,
  Ruler,
} from 'lucide-react-native';
import { Motion as _Motion, AnimatePresence } from '@legendapp/motion';
import { cn } from '../../utils/cn';
import { Button } from '../common/Button';
import { PlantChat } from './PlantChat';
import { UserPlant, Reminder } from '../../types';
import { gardenService } from '../../services/api';
import { formatDate } from '../../utils/date';

const MotionL = _Motion as any;

export type PlantManageTab = 'info' | 'edit' | 'growth' | 'reminders' | 'chat';

interface PlantManagePanelProps {
  userPlant: UserPlant;
  isEn: boolean;
  onUpdate: (data: Partial<UserPlant>) => void;
  onRefresh?: () => void;
  onDelete?: () => void;
  initialTab?: PlantManageTab;
  showHero?: boolean;
}

const CARE_ICONS: Record<string, string> = {
  watering: '💧',
  fertilizing: '🌿',
  pruning: '✂️',
  pest_control: '🐛',
  repotting: '🪴',
  other: '📌',
};

const healthConfig = (status: UserPlant['health_status'], isEn: boolean) => {
  const map = {
    healthy: {
      label: isEn ? 'Healthy' : 'سالم',
      bg: 'bg-green-500',
      pill: 'bg-green-100 dark:bg-green-900/40',
      text: 'text-green-700 dark:text-green-300',
    },
    needs_attention: {
      label: isEn ? 'Needs Attention' : 'نیاز به توجه',
      bg: 'bg-amber-500',
      pill: 'bg-amber-100 dark:bg-amber-900/40',
      text: 'text-amber-700 dark:text-amber-300',
    },
    unhealthy: {
      label: isEn ? 'Unhealthy' : 'ناسالم',
      bg: 'bg-red-500',
      pill: 'bg-red-100 dark:bg-red-900/40',
      text: 'text-red-700 dark:text-red-300',
    },
  };
  return map[status] || map.healthy;
};

export const PlantManagePanel: React.FC<PlantManagePanelProps> = ({
  userPlant,
  isEn,
  onUpdate,
  onRefresh,
  onDelete,
  initialTab = 'info',
  showHero = true,
}) => {
  const [activeTab, setActiveTab] = useState<PlantManageTab>(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [userPlant.id, initialTab]);

  const tabs: { key: PlantManageTab; icon: typeof Info; label: string }[] = [
    { key: 'info', icon: Info, label: isEn ? 'Overview' : 'نما' },
    { key: 'edit', icon: Edit3, label: isEn ? 'Edit' : 'ویرایش' },
    { key: 'growth', icon: TrendingUp, label: isEn ? 'Growth' : 'رشد' },
    { key: 'reminders', icon: Bell, label: isEn ? 'Tasks' : 'کارها' },
    { key: 'chat', icon: MessageCircle, label: isEn ? 'AI' : 'چت' },
  ];

  const plant = userPlant.plant_details;
  const displayName =
    userPlant.nickname ||
    (isEn ? plant?.english_name || plant?.farsi_name : plant?.farsi_name) ||
    (isEn ? 'My Plant' : 'گیاه من');
  const chatPlantId = plant?.id ?? userPlant.plant;
  const health = healthConfig(userPlant.health_status, isEn);

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
    >
      {showHero && plant && (
        <View className="mx-4 mb-4 rounded-[32px] overflow-hidden h-44">
          <Image
            source={{ uri: plant.primary_image || 'https://via.placeholder.com/400' }}
            className="absolute inset-0 w-full h-full"
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.75)']}
            className="absolute inset-0"
          />
          <View className="absolute bottom-0 left-0 right-0 p-5">
            <View className={cn('self-start px-3 py-1 rounded-full mb-2', health.pill)}>
              <Text className={cn('text-[10px] font-black uppercase', health.text)}>
                {health.label}
              </Text>
            </View>
            <Text className="text-2xl font-black text-white" numberOfLines={1}>
              {displayName}
            </Text>
            <Text className="text-white/70 text-xs font-medium mt-0.5" numberOfLines={1}>
              {plant.scientific_name || plant.farsi_name}
            </Text>
          </View>
        </View>
      )}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="px-4 mb-4"
        contentContainerStyle={{ gap: 8, paddingRight: 16 }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          const Icon = tab.icon;
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              className={cn(
                'flex-row items-center gap-2 px-4 py-2.5 rounded-2xl border',
                isActive
                  ? 'bg-brand-500 border-brand-500 shadow-lg shadow-brand-500/25'
                  : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700'
              )}
            >
              <Icon size={16} color={isActive ? '#fff' : '#94a3b8'} />
              <Text
                className={cn(
                  'text-xs font-black',
                  isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'
                )}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View className={cn('flex-1 px-4', activeTab === 'chat' ? 'pb-2' : 'pb-6')}>
        <AnimatePresence>
          <MotionL.View
            key={`${userPlant.id}-${activeTab}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex-1"
          >
            {activeTab === 'info' && <InfoTab userPlant={userPlant} isEn={isEn} />}
            {activeTab === 'edit' && (
              <EditTab
                userPlant={userPlant}
                isEn={isEn}
                onUpdate={onUpdate}
                onRefresh={onRefresh}
                onDelete={onDelete}
              />
            )}
            {activeTab === 'growth' && (
              <GrowthTab userPlant={userPlant} isEn={isEn} onRefresh={onRefresh} />
            )}
            {activeTab === 'reminders' && <RemindersTab userPlant={userPlant} isEn={isEn} />}
            {activeTab === 'chat' && (
              <PlantChat plantId={chatPlantId} language={isEn ? 'en' : 'fa'} className="min-h-[420px]" />
            )}
          </MotionL.View>
        </AnimatePresence>
      </View>
    </KeyboardAvoidingView>
  );
};

const InfoTab = ({ userPlant, isEn }: { userPlant: UserPlant; isEn: boolean }) => {
  const lang = isEn ? 'en' : 'fa';
  const latestGrowth = userPlant.growth_records?.[0];
  const health = healthConfig(userPlant.health_status, isEn);
  const pendingTasks = userPlant.reminders?.filter((r) => !r.is_completed).length ?? 0;

  const cards = [
    {
      icon: <Droplet size={18} color="#3b82f6" />,
      label: isEn ? 'Next Watering' : 'آبیاری بعدی',
      value: formatDate(userPlant.next_watering_date, lang),
    },
    {
      icon: <Sun size={18} color="#f59e0b" />,
      label: isEn ? 'Next Fertilizing' : 'کوددهی بعدی',
      value: formatDate(userPlant.next_fertilizing_date, lang),
    },
    {
      icon: <Scissors size={18} color="#8b5cf6" />,
      label: isEn ? 'Next Pruning' : 'هرس بعدی',
      value: formatDate(userPlant.next_pruning_date, lang),
    },
    {
      icon: <Shield size={18} color="#16a34a" />,
      label: isEn ? 'Health' : 'سلامت',
      value: health.label,
    },
    {
      icon: <Droplet size={18} color="#06b6d4" />,
      label: isEn ? 'Water Interval' : 'فاصله آبیاری',
      value: `${userPlant.watering_interval_days} ${isEn ? 'days' : 'روز'}`,
    },
    {
      icon: <Leaf size={18} color="#22c55e" />,
      label: isEn ? 'Fertilizer Interval' : 'فاصله کوددهی',
      value: `${userPlant.fertilizing_interval_days} ${isEn ? 'days' : 'روز'}`,
    },
    {
      icon: <Thermometer size={18} color="#ef4444" />,
      label: isEn ? 'Pot Size' : 'گلدان',
      value: (userPlant.pot_size || 'medium').replace('_', ' '),
    },
    {
      icon: <Bell size={18} color="#6366f1" />,
      label: isEn ? 'Pending Tasks' : 'کارهای باز',
      value: String(pendingTasks),
    },
  ];

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
      <View className="flex-row flex-wrap justify-between gap-y-3">
        {cards.map((card, i) => (
          <View
            key={i}
            className="w-[48%] bg-white dark:bg-slate-800/80 p-4 rounded-[28px] border border-slate-100 dark:border-slate-700/80 shadow-sm"
          >
            <View className="flex-row items-center gap-2 mb-2">
              {card.icon}
              <Text className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex-1">
                {card.label}
              </Text>
            </View>
            <Text className="text-sm font-black text-slate-900 dark:text-white capitalize">
              {card.value}
            </Text>
          </View>
        ))}
      </View>

      {latestGrowth && (
        <View className="mt-4 p-5 bg-brand-50 dark:bg-brand-900/20 rounded-[32px] border border-brand-100 dark:border-brand-800/40">
          <View className="flex-row items-center gap-2 mb-2">
            <Ruler size={18} color="#16a34a" />
            <Text className="text-sm font-black text-brand-700 dark:text-brand-400">
              {isEn ? 'Latest Growth' : 'آخرین رشد'}
            </Text>
          </View>
          <Text className="text-slate-800 dark:text-slate-200 font-bold">
            {latestGrowth.height} {latestGrowth.unit}
            {latestGrowth.width ? ` · ${latestGrowth.width} ${latestGrowth.unit}` : ''}
          </Text>
          <Text className="text-xs text-slate-500 mt-1">
            {formatDate(latestGrowth.date, lang)}
          </Text>
        </View>
      )}

      <View className="mt-4 bg-white dark:bg-slate-800/80 p-6 rounded-[32px] border border-slate-100 dark:border-slate-700/80">
        <Text className="text-base font-black text-slate-900 dark:text-white mb-2">
          {isEn ? 'Care Notes' : 'یادداشت‌های مراقبت'}
        </Text>
        <Text className="text-slate-600 dark:text-slate-300 leading-6 text-sm">
          {userPlant.notes || (isEn ? 'No notes added yet.' : 'یادداشتی ثبت نشده است.')}
        </Text>
      </View>
    </ScrollView>
  );
};

const EditTab = ({
  userPlant,
  isEn,
  onUpdate,
  onRefresh,
  onDelete,
}: {
  userPlant: UserPlant;
  isEn: boolean;
  onUpdate: (data: Partial<UserPlant>) => void;
  onRefresh?: () => void;
  onDelete?: () => void;
}) => {
  const [form, setForm] = useState({
    nickname: userPlant.nickname || '',
    notes: userPlant.notes || '',
    health_status: userPlant.health_status,
    pot_size: userPlant.pot_size || 'medium',
    watering_interval_days: String(userPlant.watering_interval_days),
    fertilizing_interval_days: String(userPlant.fertilizing_interval_days),
    pruning_interval_days: String(userPlant.pruning_interval_days),
  });
  const [growth, setGrowth] = useState({ height: '', width: '', unit: 'cm', notes: '' });
  const [loading, setLoading] = useState(false);
  const [savingGrowth, setSavingGrowth] = useState(false);

  useEffect(() => {
    setForm({
      nickname: userPlant.nickname || '',
      notes: userPlant.notes || '',
      health_status: userPlant.health_status,
      pot_size: userPlant.pot_size || 'medium',
      watering_interval_days: String(userPlant.watering_interval_days),
      fertilizing_interval_days: String(userPlant.fertilizing_interval_days),
      pruning_interval_days: String(userPlant.pruning_interval_days),
    });
  }, [userPlant.id]);

  const inputClass =
    'w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white mb-3';

  const handleSave = async () => {
    try {
      setLoading(true);
      const payload = {
        nickname: form.nickname,
        notes: form.notes,
        health_status: form.health_status,
        pot_size: form.pot_size,
        watering_interval_days: parseInt(form.watering_interval_days, 10) || 7,
        fertilizing_interval_days: parseInt(form.fertilizing_interval_days, 10) || 30,
        pruning_interval_days: parseInt(form.pruning_interval_days, 10) || 90,
      };
      await gardenService.updateUserPlant(userPlant.id, payload);
      onUpdate(payload);
      if (onRefresh) onRefresh();
      Alert.alert(
        isEn ? 'Success' : 'موفقیت',
        isEn ? 'Changes saved successfully' : 'تغییرات با موفقیت ذخیره شد'
      );
    } catch (err: any) {
      Alert.alert(isEn ? 'Error' : 'خطا', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddGrowth = async () => {
    const h = parseFloat(growth.height);
    if (!h || h <= 0) {
      Alert.alert(isEn ? 'Error' : 'خطا', isEn ? 'Height is required' : 'ارتفاع الزامی است');
      return;
    }
    try {
      setSavingGrowth(true);
      const payload: Record<string, unknown> = {
        user_plant: userPlant.id,
        height: h,
        unit: growth.unit,
      };
      const w = parseFloat(growth.width);
      if (growth.width && w > 0) payload.width = w;
      if (growth.notes.trim()) payload.notes = growth.notes.trim();
      await gardenService.addGrowthRecord(payload);
      setGrowth({ height: '', width: '', unit: 'cm', notes: '' });
      if (onRefresh) onRefresh();
      Alert.alert(isEn ? 'Success' : 'موفقیت', isEn ? 'Growth record added' : 'رکورد رشد ثبت شد');
    } catch (err: any) {
      Alert.alert(isEn ? 'Error' : 'خطا', err.message);
    } finally {
      setSavingGrowth(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      isEn ? 'Remove Plant' : 'حذف گیاه',
      isEn
        ? 'This plant will be removed from your garden. Continue?'
        : 'این گیاه از باغچه شما حذف می‌شود. ادامه می‌دهید؟',
      [
        { text: isEn ? 'Cancel' : 'انصراف', style: 'cancel' },
        {
          text: isEn ? 'Delete' : 'حذف',
          style: 'destructive',
          onPress: async () => {
            try {
              await gardenService.removeUserPlant(userPlant.id);
              onDelete?.();
            } catch (err: any) {
              Alert.alert(isEn ? 'Error' : 'خطا', err.message);
            }
          },
        },
      ]
    );
  };

  const healthOptions: { value: UserPlant['health_status']; label: string }[] = [
    { value: 'healthy', label: isEn ? 'Healthy' : 'سالم' },
    { value: 'needs_attention', label: isEn ? 'Attention' : 'توجه' },
    { value: 'unhealthy', label: isEn ? 'Unhealthy' : 'ناسالم' },
  ];

  const potOptions = [
    { value: 'no_pot', label: isEn ? 'No Pot' : 'بدون گلدان' },
    { value: 'small', label: isEn ? 'Small' : 'کوچک' },
    { value: 'medium', label: isEn ? 'Medium' : 'متوسط' },
    { value: 'large', label: isEn ? 'Large' : 'بزرگ' },
    { value: 'extra_large', label: isEn ? 'XL' : 'خیلی بزرگ' },
  ];

  const SectionTitle = ({ children }: { children: string }) => (
    <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 mt-2">
      {children}
    </Text>
  );

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
      <SectionTitle>{isEn ? 'Personalization' : 'شخصی‌سازی'}</SectionTitle>
      <TextInput
        value={form.nickname}
        onChangeText={(t) => setForm({ ...form, nickname: t })}
        className={inputClass}
        placeholder={isEn ? 'e.g. My Little Cactus' : 'نام مستعار گیاه'}
        placeholderTextColor="#94a3b8"
      />
      <TextInput
        value={form.notes}
        onChangeText={(t) => setForm({ ...form, notes: t })}
        className={cn(inputClass, 'h-28')}
        multiline
        textAlignVertical="top"
        placeholder={isEn ? 'Care notes...' : 'یادداشت مراقبتی...'}
        placeholderTextColor="#94a3b8"
      />

      <SectionTitle>{isEn ? 'Health Status' : 'وضعیت سلامت'}</SectionTitle>
      <View className="flex-row flex-wrap gap-2 mb-4">
        {healthOptions.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            onPress={() => setForm({ ...form, health_status: opt.value })}
            className={cn(
              'px-4 py-2.5 rounded-2xl border',
              form.health_status === opt.value
                ? 'bg-brand-500 border-brand-500'
                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
            )}
          >
            <Text
              className={cn(
                'text-xs font-black',
                form.health_status === opt.value ? 'text-white' : 'text-slate-600 dark:text-slate-300'
              )}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <SectionTitle>{isEn ? 'Pot Size' : 'سایز گلدان'}</SectionTitle>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
        <View className="flex-row gap-2">
          {potOptions.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              onPress={() => setForm({ ...form, pot_size: opt.value })}
              className={cn(
                'px-4 py-2.5 rounded-2xl border',
                form.pot_size === opt.value
                  ? 'bg-slate-800 dark:bg-white border-slate-800 dark:border-white'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
              )}
            >
              <Text
                className={cn(
                  'text-xs font-bold',
                  form.pot_size === opt.value
                    ? 'text-white dark:text-slate-900'
                    : 'text-slate-600 dark:text-slate-300'
                )}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <SectionTitle>{isEn ? 'Care Intervals (days)' : 'فواصل مراقبت (روز)'}</SectionTitle>
      <View className="flex-row gap-2 mb-2">
        {[
          { key: 'watering_interval_days' as const, label: isEn ? 'Water' : 'آب' },
          { key: 'fertilizing_interval_days' as const, label: isEn ? 'Feed' : 'کود' },
          { key: 'pruning_interval_days' as const, label: isEn ? 'Prune' : 'هرس' },
        ].map((field) => (
          <View key={field.key} className="flex-1">
            <Text className="text-[9px] font-bold text-slate-400 mb-1 text-center">{field.label}</Text>
            <TextInput
              value={form[field.key]}
              onChangeText={(t) => setForm({ ...form, [field.key]: t })}
              keyboardType="numeric"
              className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white text-center font-black"
            />
          </View>
        ))}
      </View>

      <SectionTitle>{isEn ? 'Record Growth' : 'ثبت رشد'}</SectionTitle>
      <View className="flex-row gap-2 mb-2">
        <TextInput
          value={growth.height}
          onChangeText={(t) => setGrowth({ ...growth, height: t })}
          placeholder={isEn ? 'Height *' : 'ارتفاع *'}
          keyboardType="decimal-pad"
          className={cn(inputClass, 'flex-1 mb-0')}
          placeholderTextColor="#94a3b8"
        />
        <TextInput
          value={growth.width}
          onChangeText={(t) => setGrowth({ ...growth, width: t })}
          placeholder={isEn ? 'Width' : 'عرض'}
          keyboardType="decimal-pad"
          className={cn(inputClass, 'flex-1 mb-0')}
          placeholderTextColor="#94a3b8"
        />
      </View>
      <TextInput
        value={growth.notes}
        onChangeText={(t) => setGrowth({ ...growth, notes: t })}
        placeholder={isEn ? 'Growth notes (optional)' : 'یادداشت (اختیاری)'}
        className={inputClass}
        placeholderTextColor="#94a3b8"
      />
      <Button
        variant="secondary"
        className="rounded-2xl mb-6"
        onPress={handleAddGrowth}
        isLoading={savingGrowth}
      >
        <Plus size={18} color="#16a34a" />
        <Text className="ml-2 font-black text-brand-600 dark:text-brand-400">
          {isEn ? 'Add Growth Record' : 'ثبت رکورد رشد'}
        </Text>
      </Button>

      <Button variant="primary" size="lg" className="rounded-[28px] mb-3" onPress={handleSave} isLoading={loading}>
        <Save size={20} color="white" />
        <Text className="ml-2 text-white font-black">{isEn ? 'Save Changes' : 'ذخیره تغییرات'}</Text>
      </Button>

      <TouchableOpacity
        onPress={handleDelete}
        className="flex-row items-center justify-center gap-2 py-4 rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20"
      >
        <Trash2 size={18} color="#ef4444" />
        <Text className="text-red-600 dark:text-red-400 font-black">
          {isEn ? 'Remove from Garden' : 'حذف از باغچه'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const GrowthTab = ({
  userPlant,
  isEn,
  onRefresh,
}: {
  userPlant: UserPlant;
  isEn: boolean;
  onRefresh?: () => void;
}) => {
  const [height, setHeight] = useState('');
  const [width, setWidth] = useState('');
  const [notes, setNotes] = useState('');
  const [adding, setAdding] = useState(false);
  const lang = isEn ? 'en' : 'fa';

  const handleAdd = async () => {
    const h = parseFloat(height);
    if (!h || h <= 0) return;
    try {
      setAdding(true);
      const payload: Record<string, unknown> = {
        user_plant: userPlant.id,
        height: h,
        unit: 'cm',
      };
      const w = parseFloat(width);
      if (width && w > 0) payload.width = w;
      if (notes.trim()) payload.notes = notes.trim();
      await gardenService.addGrowthRecord(payload);
      setHeight('');
      setWidth('');
      setNotes('');
      if (onRefresh) onRefresh();
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setAdding(false);
    }
  };

  const records = userPlant.growth_records ?? [];

  return (
    <View className="flex-1">
      <View className="flex-row gap-2 mb-3">
        <TextInput
          value={height}
          onChangeText={setHeight}
          placeholder={isEn ? 'Height (cm)' : 'ارتفاع'}
          keyboardType="decimal-pad"
          className="flex-1 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white"
          placeholderTextColor="#94a3b8"
        />
        <TextInput
          value={width}
          onChangeText={setWidth}
          placeholder={isEn ? 'Width' : 'عرض'}
          keyboardType="decimal-pad"
          className="w-20 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white"
          placeholderTextColor="#94a3b8"
        />
        <TouchableOpacity
          onPress={handleAdd}
          disabled={adding}
          className="w-14 h-14 bg-brand-500 rounded-2xl items-center justify-center shadow-lg shadow-brand-500/30"
        >
          <Plus size={24} color="white" />
        </TouchableOpacity>
      </View>
      <TextInput
        value={notes}
        onChangeText={setNotes}
        placeholder={isEn ? 'Optional note...' : 'یادداشت...'}
        className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white mb-4"
        placeholderTextColor="#94a3b8"
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        {records.map((rec, i) => (
          <MotionL.View
            key={rec.id ?? i}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            className="flex-row items-center gap-4 mb-3 p-4 bg-white dark:bg-slate-800/60 rounded-[28px] border border-slate-100 dark:border-slate-700/80"
          >
            <View className="w-12 h-12 bg-brand-50 dark:bg-brand-900/30 rounded-2xl items-center justify-center">
              <TrendingUp size={20} color="#16a34a" />
            </View>
            <View className="flex-1">
              <Text className="text-slate-900 dark:text-white font-black">
                {rec.height} {rec.unit}
                {rec.width ? ` · ${rec.width} ${rec.unit}` : ''}
              </Text>
              <Text className="text-slate-400 text-xs mt-0.5">{formatDate(rec.date, lang)}</Text>
              {rec.notes ? (
                <Text className="text-slate-500 dark:text-slate-400 text-xs mt-1">{rec.notes}</Text>
              ) : null}
            </View>
          </MotionL.View>
        ))}
        {records.length === 0 && (
          <EmptyState
            icon={<TrendingUp size={48} color="#94a3b8" />}
            message={isEn ? 'No growth records yet. Add your first measurement!' : 'هنوز رکورد رشدی ثبت نشده.'}
          />
        )}
      </ScrollView>
    </View>
  );
};

const RemindersTab = ({ userPlant, isEn }: { userPlant: UserPlant; isEn: boolean }) => {
  const lang = isEn ? 'en' : 'fa';
  const reminders = userPlant.reminders ?? [];

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
      {reminders.map((rem: Reminder) => (
        <View
          key={rem.id}
          className="mb-3 p-5 bg-white dark:bg-slate-800/60 rounded-[28px] border border-slate-100 dark:border-slate-700/80 flex-row items-center gap-4"
        >
          <Text className="text-2xl">{CARE_ICONS[rem.care_type] || '📌'}</Text>
          <View className="flex-1">
            <Text className="text-slate-900 dark:text-white font-black">{rem.title}</Text>
            <View className="flex-row items-center gap-1.5 mt-1">
              <Calendar size={12} color="#94a3b8" />
              <Text className="text-xs text-slate-400 font-bold">
                {formatDate(rem.scheduled_date, lang)}
                {rem.is_recurring ? ` · ${isEn ? 'Recurring' : 'دوره‌ای'}` : ''}
              </Text>
            </View>
            {rem.description ? (
              <Text className="text-xs text-slate-500 mt-1" numberOfLines={2}>
                {rem.description}
              </Text>
            ) : null}
          </View>
          <StatusBadge completed={rem.is_completed} isEn={isEn} />
        </View>
      ))}
      {reminders.length === 0 && (
        <EmptyState
          icon={<Bell size={48} color="#94a3b8" />}
          message={isEn ? 'No tasks scheduled for this plant.' : 'کاری برای این گیاه تنظیم نشده.'}
        />
      )}
    </ScrollView>
  );
};

const StatusBadge = ({ completed, isEn }: { completed: boolean; isEn: boolean }) => (
  <View
    className={cn(
      'px-2.5 py-1 rounded-full',
      completed ? 'bg-green-100 dark:bg-green-900/40' : 'bg-blue-100 dark:bg-blue-900/40'
    )}
  >
    <Text
      className={cn(
        'text-[8px] font-black',
        completed ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'
      )}
    >
      {completed ? (isEn ? 'DONE' : 'انجام') : (isEn ? 'OPEN' : 'باز')}
    </Text>
  </View>
);

const EmptyState = ({ icon, message }: { icon: React.ReactNode; message: string }) => (
  <View className="py-16 items-center opacity-50">
    {icon}
    <Text className="mt-4 text-slate-500 dark:text-slate-400 text-sm font-medium text-center px-8">
      {message}
    </Text>
  </View>
);
