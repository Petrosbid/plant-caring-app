import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, Pressable, Platform, Alert, Image } from 'react-native';
import { BlurView } from 'expo-blur';
import { X, Calendar, Leaf, Type, AlignLeft, Clock } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Motion } from '@legendapp/motion';
import { cn } from '../../utils/cn';
import { Button } from './Button';
import { Input } from './Input';
import { UserPlant } from '../../types';

interface AddReminderModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  userPlants: UserPlant[];
}

const CARE_TYPES = [
  { labelEn: 'Watering', labelFa: 'آبیاری', value: 'watering', icon: '💧', color: '#3b82f6' },
  { labelEn: 'Fertilizing', labelFa: 'کوددهی', value: 'fertilizing', icon: '🧪', color: '#16a34a' },
  { labelEn: 'Pruning', labelFa: 'هرس', value: 'pruning', icon: '✂️', color: '#f59e0b' },
  { labelEn: 'Repotting', labelFa: 'تعویض گلدان', value: 'repotting', icon: '🪴', color: '#8b4513' },
  { labelEn: 'Pest Control', labelFa: 'آفت‌کش', value: 'pest_control', icon: '🛡️', color: '#ef4444' },
];

export const AddReminderModal: React.FC<AddReminderModalProps> = ({
  isVisible,
  onClose,
  onSubmit,
  userPlants,
}) => {
  const { i18n } = useTranslation();
  const isEn = i18n.language === 'en';

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [careType, setCareType] = useState('watering');
  const [selectedPlantId, setSelectedPlantId] = useState<number | null>(null);
  const [dateStr, setDateStr] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  const handleClear = () => {
    setTitle('');
    setDescription('');
    setCareType('watering');
    setSelectedPlantId(null);
    setDateStr(new Date().toISOString().split('T')[0]);
  };

  const handleClose = () => {
    handleClear();
    onClose();
  };

  const handleSubmit = async () => {
    if (!title || !selectedPlantId || !dateStr) {
      Alert.alert(isEn ? "Missing Fields" : "فیلدها ناقص است", isEn ? "Please select a plant and set a title." : "لطفاً گیاه و عنوان را انتخاب کنید.");
      return;
    }

    try {
      setLoading(true);
      await onSubmit({
        title,
        description,
        care_type: careType,
        user_plant: selectedPlantId,
        scheduled_date: new Date(dateStr).toISOString(),
      });
      handleClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <View className="flex-1 justify-end">
        <Pressable className="absolute inset-0 bg-black/60" onPress={handleClose} />

        <Motion.View
          initial={{ y: 900 }}
          animate={{ y: 0 }}
          exit={{ y: 900 }}
          transition={{ type: 'spring', damping: 30, stiffness: 200 }}
          className="bg-white dark:bg-slate-900 rounded-t-[60px] shadow-2xl overflow-hidden"
          style={{ maxHeight: '94%' }}
        >
          {Platform.OS === 'ios' && (
            <BlurView intensity={100} tint="default" className="absolute inset-0" />
          )}

          <View className="p-8">
            {/* Header */}
            <View className="flex-row justify-between items-center mb-8">
              <View>
                <Text className="text-3xl font-black text-slate-900 dark:text-white">
                  {isEn ? "New Task" : "یادآوری جدید"}
                </Text>
                <Text className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
                  Schedule your care routine
                </Text>
              </View>
              <TouchableOpacity 
                onPress={handleClose}
                className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-[20px] items-center justify-center"
              >
                <X size={24} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 150 }}>
              
              {/* Plant Selection Horizontal */}
              <Text className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-4 ml-1">
                {isEn ? "Select Recipient" : "انتخاب گیاه"}
              </Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                className="flex-row gap-4 mb-8"
                contentContainerStyle={{ paddingRight: 20 }}
              >
                {userPlants.map((up) => (
                  <TouchableOpacity
                    key={up.id}
                    onPress={() => setSelectedPlantId(up.id)}
                    className={cn(
                      "w-24 items-center p-2 rounded-[32px] border-2 transition-all",
                      selectedPlantId === up.id
                        ? "bg-brand-500 border-brand-500 shadow-lg shadow-brand-500/40"
                        : "bg-white border-slate-100 dark:bg-slate-800 dark:border-slate-700"
                    )}
                  >
                    <View className="w-16 h-16 rounded-[24px] overflow-hidden mb-2">
                        <Image 
                            source={{ uri: up.plant_details?.primary_image || 'https://via.placeholder.com/150' }} 
                            className="w-full h-full"
                        />
                    </View>
                    <Text className={cn(
                      "text-[10px] font-black text-center uppercase tracking-tighter",
                      selectedPlantId === up.id ? "text-white" : "text-slate-500"
                    )} numberOfLines={1}>
                      {up.nickname || up.plant_details?.farsi_name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Title & Care Type */}
              <Input
                label={isEn ? "Task Title" : "عنوان کار"}
                placeholder={isEn ? "e.g. Weekly Hydration" : "مثلاً آبیاری هفتگی"}
                value={title}
                onChangeText={setTitle}
                leftIcon={<Type size={18} color="#94a3b8" />}
              />

              <Text className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-4 ml-1">
                {isEn ? "Care Category" : "نوع مراقبت"}
              </Text>
              <View className="flex-row flex-wrap gap-3 mb-8">
                {CARE_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    onPress={() => setCareType(type.value)}
                    style={{ 
                        backgroundColor: careType === type.value ? type.color : 'transparent',
                        borderColor: careType === type.value ? type.color : '#f1f5f9'
                    }}
                    className={cn(
                      "px-5 py-3 rounded-[24px] border-2 flex-row items-center gap-2",
                      careType !== type.value && "bg-slate-50 dark:bg-slate-800 dark:border-slate-700"
                    )}
                  >
                    <Text className="text-base">{type.icon}</Text>
                    <Text className={cn(
                      "text-xs font-black uppercase tracking-widest",
                      careType === type.value ? "text-white" : "text-slate-500"
                    )}>
                      {isEn ? type.labelEn : type.labelFa}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View className="flex-row gap-4 mb-4">
                <Input
                  label={isEn ? "Due Date" : "تاریخ"}
                  placeholder="YYYY-MM-DD"
                  value={dateStr}
                  onChangeText={setDateStr}
                  containerStyle={{ flex: 1 }}
                  leftIcon={<Calendar size={18} color="#94a3b8" />}
                />
                <View style={{ flex: 1 }}>
                    <Text className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 ml-1">
                        {isEn ? "Priority" : "اولویت"}
                    </Text>
                    <View className="h-12 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-[20px] items-center justify-center">
                        <Text className="text-xs font-black text-slate-400">NORMAL</Text>
                    </View>
                </View>
              </View>

              <Input
                label={isEn ? "Additional Notes" : "یادداشت‌های بیشتر"}
                placeholder={isEn ? "Add any instructions..." : "توضیحات لازم را بنویسید..."}
                value={description}
                onChangeText={setDescription}
                leftIcon={<AlignLeft size={18} color="#94a3b8" />}
                multiline
                numberOfLines={3}
                style={{ height: 80, textAlignVertical: 'top' }}
              />
            </ScrollView>

            {/* Footer Action */}
            <View className="absolute bottom-0 left-0 right-0 p-8 bg-white/95 dark:bg-slate-900/95 border-t border-slate-100 dark:border-slate-800">
              <Button 
                variant="success" 
                size="lg" 
                isLoading={loading}
                onPress={handleSubmit}
                className="rounded-[30px] h-16 shadow-2xl shadow-green-500/40"
              >
                <Clock size={20} color="white" />
                <Text className="ml-2 text-white font-black text-lg">{isEn ? "Create Reminder" : "ایجاد یادآوری"}</Text>
              </Button>
            </View>
          </View>
        </Motion.View>
      </View>
    </Modal>
  );
};
