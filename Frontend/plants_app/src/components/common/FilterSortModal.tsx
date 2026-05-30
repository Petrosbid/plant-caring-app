import React from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, Pressable, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { X, Check, Trash2 } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Motion as _Motion, AnimatePresence } from '@legendapp/motion';
import { cn } from '../../utils/cn';
import { Button } from './Button';

const MotionL = _Motion as any;

interface FilterOption {
  en: string;
  fa: string;
  query: string;
}

interface FilterCategory {
  labelEn: string;
  labelFa: string;
  values: FilterOption[];
}

interface SortOption {
  key: string;
  labelEn: string;
  labelFa: string;
}

interface FilterSortModalProps {
  isVisible: boolean;
  onClose: () => void;
  type: 'filter' | 'sort';
  
  // Sort props
  sortOptions?: SortOption[];
  currentSort?: string;
  onSortChange?: (key: string) => void;

  // Filter props
  filterCategories?: Record<string, FilterCategory>;
  currentFilters?: Record<string, string>;
  onFilterChange?: (key: string, value: string) => void;
  onClearFilters?: () => void;
}

export const FilterSortModal: React.FC<FilterSortModalProps> = ({
  isVisible,
  onClose,
  type,
  sortOptions,
  currentSort,
  onSortChange,
  filterCategories,
  currentFilters = {},
  onFilterChange,
  onClearFilters,
}) => {
  const { i18n } = useTranslation();
  const isEn = i18n.language === 'en';

  const renderSortOptions = () => (
    <View className="gap-2">
      {sortOptions?.map((opt) => {
        const isActive = currentSort === opt.key;
        return (
          <TouchableOpacity
            key={opt.key}
            onPress={() => {
              onSortChange?.(opt.key);
              onClose();
            }}
            className={cn(
              "flex-row items-center justify-between p-4 rounded-2xl border",
              isActive 
                ? "bg-brand-50 border-brand-200 dark:bg-brand-900/20 dark:border-brand-800" 
                : "bg-slate-50 border-slate-100 dark:bg-slate-800/50 dark:border-slate-700"
            )}
          >
            <Text className={cn(
              "font-bold",
              isActive ? "text-brand-700 dark:text-brand-400" : "text-slate-600 dark:text-slate-300"
            )}>
              {isEn ? opt.labelEn : opt.labelFa}
            </Text>
            {isActive && <Check size={20} color="#16a34a" />}
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderFilterCategories = () => (
    <View className="gap-8">
      {Object.entries(filterCategories || {}).map(([key, category]) => (
        <View key={key}>
          <Text className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 ml-2">
            {isEn ? category.labelEn : category.labelFa}
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {category.values.map((val) => {
              const isActive = currentFilters[key] === val.query;
              return (
                <TouchableOpacity
                  key={val.query}
                  onPress={() => onFilterChange?.(key, val.query)}
                  className={cn(
                    "px-4 py-2.5 rounded-full border",
                    isActive
                      ? "bg-brand-500 border-brand-500 shadow-md"
                      : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                  )}
                >
                  <Text className={cn(
                    "text-xs font-bold",
                    isActive ? "text-white" : "text-slate-600 dark:text-slate-400"
                  )}>
                    {isEn ? val.en : val.fa}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end">
        {/* Backdrop */}
        <Pressable 
          className="absolute inset-0 bg-black/40" 
          onPress={onClose}
        />

        {/* Modal Content */}
        <MotionL.View
          initial={{ y: 500 }}
          animate={{ y: 0 }}
          exit={{ y: 500 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-white dark:bg-slate-900 rounded-t-[40px] shadow-2xl overflow-hidden"
          style={{ maxHeight: '85%' }}
        >
          {Platform.OS === 'ios' && (
            <BlurView intensity={80} tint="default" className="absolute inset-0" />
          )}
          
          <View className="p-6">
            {/* Header */}
            <View className="flex-row justify-between items-center mb-8">
              <View>
                <Text className="text-2xl font-black text-slate-900 dark:text-white">
                  {type === 'filter' 
                    ? (isEn ? "Filters" : "فیلترها") 
                    : (isEn ? "Sort By" : "مرتب‌سازی")}
                </Text>
                {type === 'filter' && Object.keys(currentFilters).length > 0 && (
                  <Text className="text-brand-600 font-bold text-xs">
                    {Object.keys(currentFilters).length} {isEn ? "active filters" : "فیلتر فعال"}
                  </Text>
                )}
              </View>
              
              <TouchableOpacity 
                onPress={onClose}
                className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full items-center justify-center"
              >
                <X size={20} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            {/* Scrollable Area */}
            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 100 }}
            >
              {type === 'sort' ? renderSortOptions() : renderFilterCategories()}
            </ScrollView>

            {/* Footer for Filter */}
            {type === 'filter' && (
              <View className="absolute bottom-0 left-0 right-0 p-6 bg-white/90 dark:bg-slate-900/90 border-t border-slate-100 dark:border-slate-800 flex-row gap-4">
                <Button 
                  variant="secondary" 
                  className="flex-1"
                  onPress={() => {
                    onClearFilters?.();
                    onClose();
                  }}
                >
                  <Trash2 size={18} color="#ef4444" />
                  <Text className="ml-2 text-red-500 font-bold">{isEn ? "Clear All" : "پاک کردن"}</Text>
                </Button>
                <Button 
                  variant="primary" 
                  className="flex-1"
                  onPress={onClose}
                >
                  <Text className="text-white font-bold">{isEn ? "Apply" : "اعمال فیلتر"}</Text>
                </Button>
              </View>
            )}
          </View>
        </MotionL.View>
      </View>
    </Modal>
  );
};
