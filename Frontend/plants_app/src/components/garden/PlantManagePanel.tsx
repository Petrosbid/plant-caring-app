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
        <View className="mx-4 mb-3 rounded-[28px] overflow-hidden h-32">
          <Image
            source={{ uri: plant.primary_image || 'https://via.placeholder.com/400' }}
            className="absolute inset-0 w-full h-full"
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            className="absolute inset-0"
          />
          <View className="absolute bottom-0 left-0 right-0 p-4">
            <View className={cn('self-start px-2.5 py-0.5 rounded-full mb-1.5', health.pill)}>
              <Text className={cn('text-[9px] font-black uppercase', health.text)}>
                {health.label}
              </Text>
            </View>
            <Text className="text-lg font-black text-white" numberOfLines={1}>
              {displayName}
            </Text>
            <Text className="text-white/70 text-[10px] font-medium" numberOfLines={1}>
              {plant.scientific_name || plant.farsi_name}
            </Text>
          </View>
        </View>
      )}

      <View className="px-4 mb-4">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="bg-slate-100 dark:bg-slate-800/50 rounded-2xl p-1"
          contentContainerStyle={{ gap: 4 }}
        >
          <TouchableOpacity
            onPress={() => setActiveTab('info')}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 12,
              backgroundColor: activeTab === 'info' ? (Platform.OS === 'ios' ? '#fff' : '#16a34a') : 'transparent',
              shadowColor: activeTab === 'info' ? '#000' : 'transparent',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: activeTab === 'info' ? 2 : 0,
            }}
          >
            <Info size={14} color={activeTab === 'info' ? (Platform.OS === 'ios' ? '#16a34a' : '#fff') : '#94a3b8'} />
            <Text style={{ 
              fontSize: 11, 
              fontWeight: '900', 
              color: activeTab === 'info' ? (Platform.OS === 'ios' ? '#16a34a' : '#fff') : '#64748b' 
            }}>
              {isEn ? 'Overview' : 'نما'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('edit')}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 12,
              backgroundColor: activeTab === 'edit' ? (Platform.OS === 'ios' ? '#fff' : '#16a34a') : 'transparent',
              shadowColor: activeTab === 'edit' ? '#000' : 'transparent',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: activeTab === 'edit' ? 2 : 0,
            }}
          >
            <Edit3 size={14} color={activeTab === 'edit' ? (Platform.OS === 'ios' ? '#16a34a' : '#fff') : '#94a3b8'} />
            <Text style={{ 
              fontSize: 11, 
              fontWeight: '900', 
              color: activeTab === 'edit' ? (Platform.OS === 'ios' ? '#16a34a' : '#fff') : '#64748b' 
            }}>
              {isEn ? 'Edit' : 'ویرایش'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('growth')}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 12,
              backgroundColor: activeTab === 'growth' ? (Platform.OS === 'ios' ? '#fff' : '#16a34a') : 'transparent',
              shadowColor: activeTab === 'growth' ? '#000' : 'transparent',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: activeTab === 'growth' ? 2 : 0,
            }}
          >
            <TrendingUp size={14} color={activeTab === 'growth' ? (Platform.OS === 'ios' ? '#16a34a' : '#fff') : '#94a3b8'} />
            <Text style={{ 
              fontSize: 11, 
              fontWeight: '900', 
              color: activeTab === 'growth' ? (Platform.OS === 'ios' ? '#16a34a' : '#fff') : '#64748b' 
            }}>
              {isEn ? 'Growth' : 'رشد'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('reminders')}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 12,
              backgroundColor: activeTab === 'reminders' ? (Platform.OS === 'ios' ? '#fff' : '#16a34a') : 'transparent',
              shadowColor: activeTab === 'reminders' ? '#000' : 'transparent',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: activeTab === 'reminders' ? 2 : 0,
            }}
          >
            <Bell size={14} color={activeTab === 'reminders' ? (Platform.OS === 'ios' ? '#16a34a' : '#fff') : '#94a3b8'} />
            <Text style={{ 
              fontSize: 11, 
              fontWeight: '900', 
              color: activeTab === 'reminders' ? (Platform.OS === 'ios' ? '#16a34a' : '#fff') : '#64748b' 
            }}>
              {isEn ? 'Tasks' : 'کارها'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('chat')}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 12,
              backgroundColor: activeTab === 'chat' ? (Platform.OS === 'ios' ? '#fff' : '#16a34a') : 'transparent',
              shadowColor: activeTab === 'chat' ? '#000' : 'transparent',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: activeTab === 'chat' ? 2 : 0,
            }}
          >
            <MessageCircle size={14} color={activeTab === 'chat' ? (Platform.OS === 'ios' ? '#16a34a' : '#fff') : '#94a3b8'} />
            <Text style={{ 
              fontSize: 11, 
              fontWeight: '900', 
              color: activeTab === 'chat' ? (Platform.OS === 'ios' ? '#16a34a' : '#fff') : '#64748b' 
            }}>
              {isEn ? 'AI' : 'چت'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <View className={cn('flex-1 px-4', activeTab === 'chat' ? 'pb-2' : 'pb-6')}>
        <View className="flex-1">
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
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const InfoTab = ({ userPlant, isEn }: { userPlant: UserPlant; isEn: boolean }) => {
  const lang = isEn ? 'en' : 'fa';
  const latestGrowth = userPlant.growth_records?.[0];
  const health = healthConfig(userPlant.health_status, isEn);
  const pendingTasks = userPlant.reminders?.filter((r) => !r.is_completed).length ?? 0;

  const cardStyle = {
    width: '48%',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    marginBottom: 12,
  } as const;

  const labelStyle = { fontSize: 9, fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 } as const;
  const valueStyle = { fontSize: 13, fontWeight: '900', color: '#0f172a', marginTop: 4 } as const;

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        <View style={cardStyle}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Droplet size={16} color="#3b82f6" />
            <Text style={labelStyle}>{isEn ? 'Next Watering' : 'آبیاری بعدی'}</Text>
          </View>
          <Text style={valueStyle}>{formatDate(userPlant.next_watering_date, lang)}</Text>
        </View>

        <View style={cardStyle}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Sun size={16} color="#f59e0b" />
            <Text style={labelStyle}>{isEn ? 'Next Fertilizing' : 'کوددهی بعدی'}</Text>
          </View>
          <Text style={valueStyle}>{formatDate(userPlant.next_fertilizing_date, lang)}</Text>
        </View>

        <View style={cardStyle}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Scissors size={16} color="#8b5cf6" />
            <Text style={labelStyle}>{isEn ? 'Next Pruning' : 'هرس بعدی'}</Text>
          </View>
          <Text style={valueStyle}>{formatDate(userPlant.next_pruning_date, lang)}</Text>
        </View>

        <View style={cardStyle}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Shield size={16} color="#16a34a" />
            <Text style={labelStyle}>{isEn ? 'Health' : 'سلامت'}</Text>
          </View>
          <Text style={valueStyle}>{health.label}</Text>
        </View>

        <View style={cardStyle}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Droplet size={16} color="#06b6d4" />
            <Text style={labelStyle}>{isEn ? 'Water Interval' : 'فاصله آبیاری'}</Text>
          </View>
          <Text style={valueStyle}>{userPlant.watering_interval_days} {isEn ? 'days' : 'روز'}</Text>
        </View>

        <View style={cardStyle}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Bell size={16} color="#6366f1" />
            <Text style={labelStyle}>{isEn ? 'Pending Tasks' : 'کارهای باز'}</Text>
          </View>
          <Text style={valueStyle}>{pendingTasks}</Text>
        </View>
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
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
        <TouchableOpacity
          onPress={() => setForm({ ...form, health_status: 'healthy' })}
          style={{
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderRadius: 16,
            borderWidth: 1,
            backgroundColor: form.health_status === 'healthy' ? '#16a34a' : '#f8fafc',
            borderColor: form.health_status === 'healthy' ? '#16a34a' : '#e2e8f0',
          }}
        >
          <Text style={{ fontSize: 12, fontWeight: '900', color: form.health_status === 'healthy' ? '#fff' : '#475569' }}>
            {isEn ? 'Healthy' : 'سالم'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setForm({ ...form, health_status: 'needs_attention' })}
          style={{
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderRadius: 16,
            borderWidth: 1,
            backgroundColor: form.health_status === 'needs_attention' ? '#16a34a' : '#f8fafc',
            borderColor: form.health_status === 'needs_attention' ? '#16a34a' : '#e2e8f0',
          }}
        >
          <Text style={{ fontSize: 12, fontWeight: '900', color: form.health_status === 'needs_attention' ? '#fff' : '#475569' }}>
            {isEn ? 'Attention' : 'توجه'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setForm({ ...form, health_status: 'unhealthy' })}
          style={{
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderRadius: 16,
            borderWidth: 1,
            backgroundColor: form.health_status === 'unhealthy' ? '#16a34a' : '#f8fafc',
            borderColor: form.health_status === 'unhealthy' ? '#16a34a' : '#e2e8f0',
          }}
        >
          <Text style={{ fontSize: 12, fontWeight: '900', color: form.health_status === 'unhealthy' ? '#fff' : '#475569' }}>
            {isEn ? 'Unhealthy' : 'ناسالم'}
          </Text>
        </TouchableOpacity>
      </View>

      <SectionTitle>{isEn ? 'Pot Size' : 'سایز گلدان'}</SectionTitle>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {(['no_pot', 'small', 'medium', 'large', 'extra_large'] as const).map((size) => {
            const labels = {
              no_pot: isEn ? 'No Pot' : 'بدون گلدان',
              small: isEn ? 'Small' : 'کوچک',
              medium: isEn ? 'Medium' : 'متوسط',
              large: isEn ? 'Large' : 'بزرگ',
              extra_large: isEn ? 'XL' : 'خیلی بزرگ',
            };
            return (
              <TouchableOpacity
                key={size}
                onPress={() => setForm({ ...form, pot_size: size })}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 16,
                  borderWidth: 1,
                  backgroundColor: form.pot_size === size ? '#1e293b' : '#f8fafc',
                  borderColor: form.pot_size === size ? '#1e293b' : '#e2e8f0',
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: '700', color: form.pot_size === size ? '#fff' : '#475569' }}>
                  {labels[size]}
                </Text>
              </TouchableOpacity>
            );
          })}
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
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
        <TextInput
          value={height}
          onChangeText={setHeight}
          placeholder={isEn ? 'Height (cm)' : 'ارتفاع'}
          keyboardType="decimal-pad"
          style={{
            flex: 1,
            padding: 16,
            borderRadius: 16,
            backgroundColor: '#f8fafc',
            borderWidth: 1,
            borderColor: '#f1f5f9',
            color: '#0f172a',
          }}
          placeholderTextColor="#94a3b8"
        />
        <TextInput
          value={width}
          onChangeText={setWidth}
          placeholder={isEn ? 'Width' : 'عرض'}
          keyboardType="decimal-pad"
          style={{
            width: 80,
            padding: 16,
            borderRadius: 16,
            backgroundColor: '#f8fafc',
            borderWidth: 1,
            borderColor: '#f1f5f9',
            color: '#0f172a',
          }}
          placeholderTextColor="#94a3b8"
        />
        <TouchableOpacity
          onPress={handleAdd}
          disabled={adding}
          style={{
            width: 56,
            height: 56,
            backgroundColor: '#16a34a',
            borderRadius: 16,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Plus size={24} color="white" />
        </TouchableOpacity>
      </View>
      <TextInput
        value={notes}
        onChangeText={setNotes}
        placeholder={isEn ? 'Optional note...' : 'یادداشت...'}
        style={{
          padding: 12,
          borderRadius: 16,
          backgroundColor: '#f8fafc',
          borderWidth: 1,
          borderColor: '#f1f5f9',
          color: '#0f172a',
          marginBottom: 16,
        }}
        placeholderTextColor="#94a3b8"
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        {records.map((rec, i) => (
          <View
            key={rec.id ?? i}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 16,
              marginBottom: 12,
              padding: 16,
              backgroundColor: 'white',
              borderRadius: 24,
              borderWidth: 1,
              borderColor: '#f1f5f9',
            }}
          >
            <View style={{
              width: 48,
              height: 48,
              backgroundColor: '#f0fdf4',
              borderRadius: 16,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <TrendingUp size={20} color="#16a34a" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '900', color: '#0f172a' }}>
                {rec.height} {rec.unit}
                {rec.width ? ` · ${rec.width} ${rec.unit}` : ''}
              </Text>
              <Text style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{formatDate(rec.date, lang)}</Text>
              {rec.notes ? (
                <Text style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{rec.notes}</Text>
              ) : null}
            </View>
          </View>
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
          style={{
            marginBottom: 12,
            padding: 20,
            backgroundColor: 'white',
            borderRadius: 24,
            borderWidth: 1,
            borderColor: '#f1f5f9',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <Text style={{ fontSize: 24 }}>{CARE_ICONS[rem.care_type] || '📌'}</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: '900', color: '#0f172a' }}>{rem.title}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
              <Calendar size={12} color="#94a3b8" />
              <Text style={{ fontSize: 12, color: '#94a3b8', fontWeight: '700' }}>
                {formatDate(rem.scheduled_date, lang)}
                {rem.is_recurring ? ` · ${isEn ? 'Recurring' : 'دوره‌ای'}` : ''}
              </Text>
            </View>
            {rem.description ? (
              <Text style={{ fontSize: 12, color: '#64748b', marginTop: 4 }} numberOfLines={2}>
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
    style={{
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 99,
      backgroundColor: completed ? '#f0fdf4' : '#eff6ff',
    }}
  >
    <Text
      style={{
        fontSize: 8,
        fontWeight: '900',
        color: completed ? '#16a34a' : '#3b82f6',
      }}
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
