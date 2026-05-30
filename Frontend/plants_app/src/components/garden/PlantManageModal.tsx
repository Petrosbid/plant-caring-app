import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, Pressable, Platform, Image, Alert, TextInput } from 'react-native';
import { BlurView } from 'expo-blur';
import { 
  X, 
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
  Plus
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Motion as _Motion, AnimatePresence } from '@legendapp/motion';
import { cn } from '../../utils/cn';
import { Button } from '../common/Button';
import { PlantChat } from './PlantChat';
import { UserPlant } from '../../types';
import { gardenService } from '../../services/api';
import { formatDate } from '../../utils/date';

const MotionL = _Motion as any;

interface PlantManageModalProps {
  isVisible: boolean;
  onClose: () => void;
  userPlant: UserPlant;
  onUpdate: (data: Partial<UserPlant>) => void;
  onRefresh?: () => void;
}

type Tab = 'info' | 'edit' | 'growth' | 'reminders' | 'chat';

export const PlantManageModal: React.FC<PlantManageModalProps> = ({
  isVisible,
  onClose,
  userPlant,
  onUpdate,
  onRefresh,
}) => {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language === 'en';
  const [activeTab, setActiveTab] = useState<Tab>('info');

  const tabs: { key: Tab; icon: any; label: string }[] = [
    { key: 'info', icon: Info, label: isEn ? 'Overview' : 'نما' },
    { key: 'edit', icon: Edit3, label: isEn ? 'Edit' : 'ویرایش' },
    { key: 'growth', icon: TrendingUp, label: isEn ? 'Growth' : 'رشد' },
    { key: 'reminders', icon: Bell, label: isEn ? 'Tasks' : 'کارها' },
    { key: 'chat', icon: MessageCircle, label: isEn ? 'AI' : 'چت' },
  ];

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end">
        <Pressable className="absolute inset-0 bg-black/50" onPress={onClose} />

        <MotionL.View
          initial={{ y: 800 }}
          animate={{ y: 0 }}
          exit={{ y: 800 }}
          transition={{ type: 'spring', damping: 25, stiffness: 250 }}
          className="bg-white dark:bg-slate-900 rounded-t-[50px] shadow-2xl overflow-hidden"
          style={{ height: '92%' }}
        >
          {Platform.OS === 'ios' && (
            <BlurView intensity={90} tint="default" className="absolute inset-0" />
          )}

          {/* Header */}
          <View className="p-6 border-b border-slate-100 dark:border-slate-800">
            <View className="flex-row justify-between items-center">
              <View className="flex-1">
                <Text className="text-2xl font-black text-slate-900 dark:text-white" numberOfLines={1}>
                  {userPlant.nickname || userPlant.plant_details?.farsi_name}
                </Text>
                <Text className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
                  {userPlant.plant_details?.scientific_name}
                </Text>
              </View>
              <TouchableOpacity 
                onPress={onClose}
                className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-2xl items-center justify-center"
              >
                <X size={20} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            {/* Tabs */}
            <View className="flex-row mt-6 bg-slate-100 dark:bg-slate-800/50 p-1.5 rounded-[24px]">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.key;
                const Icon = tab.icon;
                return (
                  <TouchableOpacity
                    key={tab.key}
                    onPress={() => setActiveTab(tab.key)}
                    className={cn(
                      "flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-[20px] transition-all",
                      isActive ? "bg-white dark:bg-slate-800 shadow-sm" : ""
                    )}
                  >
                    <Icon size={14} color={isActive ? "#16a34a" : "#94a3b8"} />
                    {isActive && (
                        <Text className="text-[10px] font-black text-brand-600 dark:text-brand-400 uppercase tracking-tighter">
                            {tab.label}
                        </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Content */}
          <View className="flex-1 p-6">
            <AnimatePresence>
              <MotionL.View
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1"
              >
                {activeTab === 'info' && <InfoTab userPlant={userPlant} isEn={isEn} />}
                {activeTab === 'edit' && (
                  <EditTab 
                    userPlant={userPlant} 
                    isEn={isEn} 
                    onUpdate={onUpdate} 
                    onRefresh={onRefresh}
                    onClose={onClose} 
                  />
                )}
                {activeTab === 'growth' && <GrowthTab userPlant={userPlant} isEn={isEn} onRefresh={onRefresh} />}
                {activeTab === 'reminders' && <RemindersTab userPlant={userPlant} isEn={isEn} />}
                {activeTab === 'chat' && <PlantChat plantId={userPlant.id} language={isEn ? 'en' : 'fa'} />}
              </MotionL.View>
            </AnimatePresence>
          </View>
        </MotionL.View>
      </View>
    </Modal>
  );
};

// ==============================
// Sub-Tabs
// ==============================

const InfoTab = ({ userPlant, isEn }: { userPlant: UserPlant, isEn: boolean }) => {
  const stats = [
    { icon: <Droplet size={18} color="#3b82f6" />, label: isEn ? 'Water' : 'آبیاری', value: `${userPlant.watering_interval_days}d` },
    { icon: <Shield size={18} color="#16a34a" />, label: isEn ? 'Health' : 'سلامت', value: userPlant.health_status.toUpperCase() },
    { icon: <Sun size={18} color="#f59e0b" />, label: isEn ? 'Fertilize' : 'کوددهی', value: `${userPlant.fertilizing_interval_days}d` },
    { icon: <Thermometer size={18} color="#ef4444" />, label: isEn ? 'Pot' : 'گلدان', value: (userPlant.pot_size || 'M').toUpperCase() },
  ];

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View className="flex-row flex-wrap justify-between gap-y-4">
        {stats.map((stat, i) => (
          <View key={i} className="w-[48%] bg-slate-50 dark:bg-slate-800/50 p-4 rounded-[32px] border border-slate-100 dark:border-slate-800">
            <View className="flex-row items-center gap-2 mb-2">
              {stat.icon}
              <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</Text>
            </View>
            <Text className="text-base font-black text-slate-900 dark:text-white">{stat.value}</Text>
          </View>
        ))}
      </View>

      <View className="mt-8 bg-brand-500/5 dark:bg-brand-500/10 p-6 rounded-[40px] border border-brand-500/10">
        <Text className="text-lg font-black text-brand-700 dark:text-brand-400 mb-2">{isEn ? 'Notes' : 'یادداشت‌ها'}</Text>
        <Text className="text-slate-600 dark:text-slate-300 leading-6">
          {userPlant.notes || (isEn ? 'No notes added yet.' : 'یادداشتی ثبت نشده است.')}
        </Text>
      </View>
    </ScrollView>
  );
};

const EditTab = ({ userPlant, isEn, onUpdate, onRefresh, onClose }: any) => {
  const [form, setForm] = useState({
    nickname: userPlant.nickname || '',
    notes: userPlant.notes || '',
    health_status: userPlant.health_status,
    watering_interval_days: String(userPlant.watering_interval_days),
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    try {
      setLoading(true);
      await gardenService.updateUserPlant(userPlant.id, {
        ...form,
        watering_interval_days: parseInt(form.watering_interval_days) || 7,
      });
      onUpdate(form);
      if (onRefresh) onRefresh();
      Alert.alert(isEn ? 'Success' : 'موفقیت', isEn ? 'Updated successfully' : 'با موفقیت بروزرسانی شد');
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white mb-4";

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Nickname</Text>
      <TextInput 
        value={form.nickname} 
        onChangeText={(t) => setForm({...form, nickname: t})}
        className={inputClass}
        placeholder="My Green Friend"
      />

      <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Watering Interval (Days)</Text>
      <TextInput 
        value={form.watering_interval_days} 
        onChangeText={(t) => setForm({...form, watering_interval_days: t})}
        className={inputClass}
        keyboardType="numeric"
      />

      <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Notes</Text>
      <TextInput 
        value={form.notes} 
        onChangeText={(t) => setForm({...form, notes: t})}
        className={cn(inputClass, "h-32 text-top")}
        multiline
        placeholder="Special requirements..."
      />

      <Button 
        variant="primary" 
        size="lg" 
        className="mt-4 rounded-[28px]" 
        onPress={handleSave}
        isLoading={loading}
      >
        <Save size={20} color="white" />
        <Text className="ml-2 text-white font-black">{isEn ? 'Save Changes' : 'ذخیره تغییرات'}</Text>
      </Button>
    </ScrollView>
  );
};

const GrowthTab = ({ userPlant, isEn, onRefresh }: any) => {
    const [adding, setAdding] = useState(false);
    const [height, setHeight] = useState('');

    const handleAdd = async () => {
        if (!height) return;
        try {
            setAdding(true);
            await gardenService.addGrowthRecord({
                user_plant: userPlant.id,
                height: parseFloat(height),
                unit: 'cm'
            });
            setHeight('');
            if (onRefresh) onRefresh();
        } catch (err: any) {
            Alert.alert('Error', err.message);
        } finally {
            setAdding(false);
        }
    };

    return (
        <View className="flex-1">
            <View className="flex-row gap-2 mb-6">
                <TextInput 
                    value={height}
                    onChangeText={setHeight}
                    placeholder="Height (cm)"
                    keyboardType="numeric"
                    className="flex-1 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white"
                />
                <TouchableOpacity 
                    onPress={handleAdd}
                    disabled={adding}
                    className="w-14 h-14 bg-brand-500 rounded-2xl items-center justify-center shadow-lg shadow-brand-500/30"
                >
                    <Plus size={24} color="white" />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {userPlant.growth_records?.map((rec: any, i: number) => (
                    <View key={i} className="flex-row items-center gap-4 mb-4 p-4 bg-slate-50 dark:bg-slate-800/30 rounded-3xl border border-slate-100 dark:border-slate-800">
                        <View className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl items-center justify-center shadow-sm">
                            <TrendingUp size={20} color="#16a34a" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-slate-900 dark:text-white font-bold">{rec.height} cm</Text>
                            <Text className="text-slate-400 text-xs">{new Date(rec.date).toLocaleDateString()}</Text>
                        </View>
                    </View>
                ))}
                {(!userPlant.growth_records || userPlant.growth_records.length === 0) && (
                    <View className="py-10 items-center opacity-30">
                        <TrendingUp size={48} color="#94a3b8" />
                        <Text className="mt-4 text-slate-500 font-medium">No history yet</Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

const RemindersTab = ({ userPlant, isEn }: any) => {
    return (
        <ScrollView showsVerticalScrollIndicator={false}>
            {userPlant.reminders?.map((rem: any, i: number) => (
                <View key={i} className="mb-4 p-5 bg-slate-50 dark:bg-slate-800/30 rounded-[32px] border border-slate-100 dark:border-slate-800">
                    <View className="flex-row justify-between items-center mb-2">
                        <Text className="text-slate-900 dark:text-white font-black">{rem.title}</Text>
                        <Badge variant={rem.is_completed ? 'success' : 'info'}>
                            {rem.is_completed ? 'DONE' : 'PENDING'}
                        </Badge>
                    </View>
                    <View className="flex-row items-center gap-2">
                        <Bell size={12} color="#94a3b8" />
                        <Text className="text-xs text-slate-400 font-bold">{formatDate(rem.scheduled_date, isEn ? 'en' : 'fa')}</Text>
                    </View>
                </View>
                
            ))}
            {(!userPlant.reminders || userPlant.reminders.length === 0) && (
                <View className="py-10 items-center opacity-30">
                    <Bell size={48} color="#94a3b8" />
                    <Text className="mt-4 text-slate-500 font-medium">No tasks scheduled</Text>
                </View>
            )}
        </ScrollView>
    );
};

const Badge = ({ children, variant }: any) => (
    <View className={cn(
        "px-2.5 py-1 rounded-full",
        variant === 'success' ? "bg-green-100 dark:bg-green-900/30" : "bg-blue-100 dark:bg-blue-900/30"
    )}>
        <Text className={cn(
            "text-[8px] font-black",
            variant === 'success' ? "text-green-600 dark:text-green-400" : "text-blue-600 dark:text-blue-400"
        )}>{children}</Text>
    </View>
);
