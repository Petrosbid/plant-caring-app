import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ScreenWrapper } from '../components/common/ScreenWrapper';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { useReminders } from '../hooks/useReminders';
import { useUserPlants } from '../hooks/useUserPlants';
import { Loader } from '../components/common/Loader';
import { Bell, Trash2, CheckCircle2, Clock, Plus, X } from 'lucide-react-native';
import { Motion, AnimatePresence } from '@legendapp/motion';
import { formatDate } from '../utils/date';
import { UserPlant } from '../types';
import { cn } from '../utils/cn';

const RemindersScreen = () => {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language === 'en';
  const { reminders, loading, toggleReminder, deleteReminder, refreshReminders } = useReminders();
  const { userPlants } = useUserPlants();
  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <ScreenWrapper withScroll={false}>
      <View className="px-2 pt-2 flex-row justify-between items-center mb-6">
        <View>
          <Text className="text-3xl font-black text-slate-900 dark:text-white">
            {t('common.reminders')}
          </Text>
          <Text className="text-slate-500 dark:text-slate-400">
            {isEn ? "Keep your plants thriving" : "گیاهان خود را شاداب نگه دارید"}
          </Text>
        </View>
        <Button 
          variant="success" 
          className="w-12 h-12 p-0 rounded-2xl"
          onPress={() => setShowAddForm(true)}
        >
          <Plus size={24} color="white" />
        </Button>
      </View>

      {loading && reminders.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Loader size={16} />
        </View>
      ) : (
        <FlatList
          data={reminders}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingHorizontal: 8, paddingBottom: 120 }}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={refreshReminders} tintColor="#16a34a" />
          }
          renderItem={({ item }) => {
            const plant = userPlants.find((p: UserPlant) => p.id === item.user_plant);
            const plantName = plant?.nickname || plant?.plant_details?.farsi_name || (isEn ? "My Plant" : "گیاه من");

            return (
              // @ts-ignore
              <Motion.View
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-4"
              >
                <Card className={item.is_completed ? "opacity-60" : ""}>
                  <View className="flex-row gap-4">
                    <View className={cn(
                      "w-12 h-12 rounded-2xl items-center justify-center",
                      item.is_completed ? "bg-slate-100 dark:bg-slate-700" : "bg-green-100 dark:bg-green-900/30"
                    )}>
                      {item.is_completed ? (
                        <CheckCircle2 size={24} color="#94a3b8" />
                      ) : (
                        <Bell size={24} color="#16a34a" />
                      )}
                    </View>

                    <View className="flex-1">
                      <Text className={cn(
                        "text-lg font-bold text-slate-900 dark:text-white",
                        item.is_completed && "line-through text-slate-400"
                      )}>
                        {item.title}
                      </Text>
                      <Text className="text-sm text-brand-600 dark:text-brand-400 font-semibold mb-1">
                        {plantName}
                      </Text>
                      <View className="flex-row items-center gap-4">
                        <View className="flex-row items-center gap-1">
                          <Clock size={14} color="#94a3b8" />
                          <Text className="text-xs text-slate-400 font-medium">
                            {formatDate(item.scheduled_date, i18n.language)}
                          </Text>
                        </View>
                        <Badge variant={item.care_type === 'watering' ? 'info' : 'success'} className="scale-75 -ml-2">
                          {item.care_type}
                        </Badge>
                      </View>
                    </View>

                    <View className="gap-2">
                      <TouchableOpacity 
                        onPress={() => toggleReminder(item.id)}
                        className={cn(
                          "w-10 h-10 rounded-full items-center justify-center",
                          item.is_completed ? "bg-slate-100" : "bg-green-500"
                        )}
                      >
                        <CheckCircle2 size={20} color={item.is_completed ? "#94a3b8" : "white"} />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        onPress={() => deleteReminder(item.id)}
                        className="w-10 h-10 rounded-full items-center justify-center bg-red-50"
                      >
                        <Trash2 size={20} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </Card>
              </Motion.View>
            );
          }}
          ListEmptyComponent={
            <View className="items-center justify-center py-20">
              <Text className="text-5xl mb-4">📅</Text>
              <Text className="text-slate-400 text-center px-10">
                {isEn ? "No reminders yet. Add one to start tracking your plant care." : "هنوز یادآوری ندارید. برای شروع مراقبت از گیاهان یکی اضافه کنید."}
              </Text>
            </View>
          }
        />
      )}
    </ScreenWrapper>
  );
};

export default RemindersScreen;
