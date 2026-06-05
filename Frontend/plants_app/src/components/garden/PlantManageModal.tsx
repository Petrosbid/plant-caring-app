import React from 'react';
import { View, Text, Modal, TouchableOpacity, Pressable, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { X } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Motion as _Motion } from '@legendapp/motion';
import { UserPlant } from '../../types';
import { PlantManagePanel, PlantManageTab } from './PlantManagePanel';

const MotionL = _Motion as any;

interface PlantManageModalProps {
  isVisible: boolean;
  onClose: () => void;
  userPlant: UserPlant;
  onUpdate: (data: Partial<UserPlant>) => void;
  onRefresh?: () => void;
  onDelete?: () => void;
  initialTab?: PlantManageTab;
}

export const PlantManageModal: React.FC<PlantManageModalProps> = ({
  isVisible,
  onClose,
  userPlant,
  onUpdate,
  onRefresh,
  onDelete,
  initialTab = 'info',
}) => {
  const { i18n } = useTranslation();
  const isEn = i18n.language === 'en';

  const handleDelete = () => {
    onDelete?.();
    onClose();
  };

  return (
    <Modal visible={isVisible} transparent animationType="none" onRequestClose={onClose}>
      <View className="flex-1 justify-end">
        <Pressable className="absolute inset-0 bg-black/55" onPress={onClose} />

        <MotionL.View
          initial={{ y: 800 }}
          animate={{ y: 0 }}
          exit={{ y: 800 }}
          transition={{ type: 'spring', damping: 26, stiffness: 260 }}
          className="bg-slate-50 dark:bg-slate-950 rounded-t-[44px] shadow-2xl overflow-hidden"
          style={{ height: '90%' }}
        >
          {Platform.OS === 'ios' && (
            <BlurView intensity={80} tint="default" className="absolute inset-0" />
          )}

          <View className="flex-row justify-between items-center px-5 pt-4 pb-1">
            <View className="flex-1 mr-3">
              <Text className="text-lg font-black text-slate-900 dark:text-white" numberOfLines={1}>
                {userPlant.nickname || userPlant.plant_details?.farsi_name}
              </Text>
              <Text className="text-slate-500 dark:text-slate-400 text-[9px] font-bold uppercase tracking-widest mt-0.5">
                {userPlant.plant_details?.scientific_name}
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              className="w-10 h-10 bg-white dark:bg-slate-800 rounded-2xl items-center justify-center border border-slate-100 dark:border-slate-700"
            >
              <X size={18} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          <PlantManagePanel
            userPlant={userPlant}
            isEn={isEn}
            onUpdate={onUpdate}
            onRefresh={onRefresh}
            onDelete={handleDelete}
            initialTab={initialTab}
            showHero
          />
        </MotionL.View>
      </View>
    </Modal>
  );
};
