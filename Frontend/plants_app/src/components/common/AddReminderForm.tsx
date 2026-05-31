import React, { useState } from 'react';
import { View, Pressable, Alert, Switch } from 'react-native';
import { Calendar, Leaf, Type, AlignLeft, Clock } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { cn } from '../../utils/cn';
import { Button } from './Button';
import { Input } from './Input';
import { Card } from './Card';
import { AppText as Text } from './AppText';
import { UserPlant, Reminder } from '../../types';

const CARE_TYPES = [
  { labelEn: 'Watering', labelFa: 'آبیاری', value: 'watering' as const },
  { labelEn: 'Fertilizing', labelFa: 'کوددهی', value: 'fertilizing' as const },
  { labelEn: 'Pruning', labelFa: 'هرس', value: 'pruning' as const },
  { labelEn: 'Pest Control', labelFa: 'کنترل آفات', value: 'pest_control' as const },
  { labelEn: 'Repotting', labelFa: 'تعویض گلدان', value: 'repotting' as const },
  { labelEn: 'Other', labelFa: 'سایر', value: 'other' as const },
];

interface AddReminderFormProps {
  userPlants: UserPlant[];
  onSubmit: (data: Partial<Reminder>) => Promise<void>;
  onCancel?: () => void;
}

export const AddReminderForm: React.FC<AddReminderFormProps> = ({
  userPlants = [],
  onSubmit,
  onCancel,
}) => {
  const { i18n } = useTranslation();
  const isEn = i18n.language === 'en';

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [careType, setCareType] = useState<Reminder['care_type']>('watering');
  const [selectedPlantId, setSelectedPlantId] = useState<number | null>(null);
  const [dateStr, setDateStr] = useState(new Date().toISOString().split('T')[0]);
  const [timeStr, setTimeStr] = useState('09:00');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceInterval, setRecurrenceInterval] = useState('7');
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCareType('watering');
    setSelectedPlantId(null);
    setDateStr(new Date().toISOString().split('T')[0]);
    setTimeStr('09:00');
    setIsRecurring(false);
    setRecurrenceInterval('7');
  };

  const handleSubmit = async () => {
    if (!selectedPlantId || !dateStr) {
      Alert.alert(
        isEn ? 'Missing Fields' : 'فیلدها ناقص است',
        isEn ? 'Please select a plant and set a date.' : 'لطفاً گیاه و تاریخ را انتخاب کنید.'
      );
      return;
    }

    const plant = userPlants.find((p) => p.id === selectedPlantId);
    const plantName =
      plant?.nickname || plant?.plant_details?.farsi_name || (isEn ? 'your plant' : 'گیاه شما');

    try {
      setLoading(true);
      const scheduledDateTime = new Date(`${dateStr}T${timeStr}:00`);
      await onSubmit({
        title:
          title.trim() ||
          `${careType.charAt(0).toUpperCase() + careType.slice(1)} for ${plantName}`,
        description:
          description.trim() ||
          (isEn
            ? `Reminder to ${careType} ${plantName}`
            : `یادآوری برای ${careType} ${plantName}`),
        care_type: careType,
        user_plant: selectedPlantId,
        scheduled_date: scheduledDateTime.toISOString(),
        is_completed: false,
        is_recurring: isRecurring,
        recurrence_interval: isRecurring ? parseInt(recurrenceInterval, 10) || 7 : undefined,
      });
      resetForm();
      onCancel?.();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mb-6 border-2 border-green-100 dark:border-green-900/40">
      <View className="flex-row items-center gap-3 mb-6">
        <View className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/40 items-center justify-center">
          <Text className="text-lg">➕</Text>
        </View>
        <Text className="text-xl font-bold text-slate-900 dark:text-white">
          {isEn ? 'Add New Reminder' : 'افزودن یادآوری جدید'}
        </Text>
      </View>

      <Text className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 ml-1">
        {isEn ? 'Select Plant' : 'انتخاب گیاه'}
      </Text>
      {userPlants.length === 0 ? (
        <Text className="text-sm text-slate-500 mb-4">
          {isEn ? 'Add plants to your garden first.' : 'ابتدا گیاه به باغچه اضافه کنید.'}
        </Text>
      ) : (
        <View className="flex-row flex-wrap gap-2 mb-6">
          {userPlants.map((plant) => {
            const isSelected = selectedPlantId === plant.id;
            const label =
              plant.nickname || plant.plant_details?.farsi_name || `Plant ${plant.id}`;
            return (
              <Pressable
                key={plant.id}
                onPress={() => setSelectedPlantId(plant.id)}
                className={cn(
                  'px-4 py-2.5 rounded-xl border-2 flex-row items-center gap-2',
                  isSelected
                    ? 'bg-brand-500 border-brand-500'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700'
                )}
              >
                <Leaf size={14} color={isSelected ? 'white' : '#94a3b8'} />
                <Text
                  className={cn(
                    'text-sm font-semibold',
                    isSelected ? 'text-white' : 'text-slate-600 dark:text-slate-300'
                  )}
                  numberOfLines={1}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}

      <Text className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 ml-1">
        {isEn ? 'Care Type' : 'نوع مراقبت'}
      </Text>
      <View className="flex-row flex-wrap gap-2 mb-6">
        {CARE_TYPES.map((type) => {
          const isSelected = careType === type.value;
          return (
            <Pressable
              key={type.value}
              onPress={() => setCareType(type.value)}
              className={cn(
                'px-3 py-2 rounded-xl border-2',
                isSelected
                  ? 'bg-green-500 border-green-500'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700'
              )}
            >
              <Text
                className={cn(
                  'text-xs font-bold',
                  isSelected ? 'text-white' : 'text-slate-600 dark:text-slate-300'
                )}
              >
                {isEn ? type.labelEn : type.labelFa}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Input
        label={isEn ? 'Title' : 'عنوان'}
        placeholder={isEn ? 'Enter reminder title...' : 'عنوان یادآوری را وارد کنید...'}
        value={title}
        onChangeText={setTitle}
        leftIcon={<Type size={18} color="#94a3b8" />}
      />

      <Input
        label={isEn ? 'Description' : 'توضیحات'}
        placeholder={isEn ? 'Enter reminder details...' : 'جزئیات یادآوری را وارد کنید...'}
        value={description}
        onChangeText={setDescription}
        leftIcon={<AlignLeft size={18} color="#94a3b8" />}
        multiline
        numberOfLines={3}
        style={{ height: 80, textAlignVertical: 'top' }}
      />

      <View className="flex-row gap-4 mb-4">
        <Input
          label={isEn ? 'Date' : 'تاریخ'}
          placeholder="YYYY-MM-DD"
          value={dateStr}
          onChangeText={setDateStr}
          containerClassName="flex-1"
          leftIcon={<Calendar size={18} color="#94a3b8" />}
        />
        <Input
          label={isEn ? 'Time' : 'زمان'}
          placeholder="09:00"
          value={timeStr}
          onChangeText={setTimeStr}
          containerClassName="flex-1"
          leftIcon={<Clock size={18} color="#94a3b8" />}
        />
      </View>

      <View className="flex-row items-center justify-between mb-4 px-1">
        <Text className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          {isEn ? 'Recurring reminder' : 'یادآوری تکرارشونده'}
        </Text>
        <Switch
          value={isRecurring}
          onValueChange={setIsRecurring}
          trackColor={{ false: '#cbd5e1', true: '#22c55e' }}
          thumbColor="#ffffff"
        />
      </View>

      {isRecurring && (
        <Input
          label={isEn ? 'Repeat every (days)' : 'تکرار هر (روز)'}
          placeholder="7"
          value={recurrenceInterval}
          onChangeText={setRecurrenceInterval}
          keyboardType="number-pad"
        />
      )}

      <View className="flex-row gap-3 mt-2">
        {onCancel && (
          <Button variant="outline" className="flex-1" onPress={onCancel}>
            {isEn ? 'Cancel' : 'انصراف'}
          </Button>
        )}
        <Button
          variant="success"
          className={cn('rounded-2xl', onCancel ? 'flex-1' : 'w-full')}
          isLoading={loading}
          onPress={handleSubmit}
        >
          {isEn ? 'Add Reminder' : 'افزودن یادآوری'}
        </Button>
      </View>
    </Card>
  );
};
