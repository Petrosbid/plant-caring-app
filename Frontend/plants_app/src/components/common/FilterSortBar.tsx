import React from 'react';
import { View, TouchableOpacity, TextInput, Text } from 'react-native';
import { Search, SlidersHorizontal, ArrowDownAZ, X } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { cn } from '../../utils/cn';

interface FilterSortBarProps {
  search: string;
  onSearchChange: (text: string) => void;
  onFilterPress: () => void;
  onSortPress: () => void;
  activeFiltersCount?: number;
  className?: string;
}

export const FilterSortBar: React.FC<FilterSortBarProps> = ({
  search,
  onSearchChange,
  onFilterPress,
  onSortPress,
  activeFiltersCount = 0,
  className,
}) => {
  const { i18n } = useTranslation();
  const isEn = i18n.language === 'en';

  return (
    <View className={cn("flex-row items-center gap-3 mb-4 px-2", className)}>
      {/* Search Input */}
      <View className="flex-1 flex-row items-center bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700 h-12 rounded-2xl px-4 shadow-sm">
        <Search size={18} color="#94a3b8" />
        <TextInput
          value={search}
          onChangeText={onSearchChange}
          placeholder={isEn ? "Search..." : "جستجو..."}
          className="flex-1 ml-2 text-slate-900 dark:text-white text-sm"
          placeholderTextColor="#94a3b8"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => onSearchChange('')}>
            <X size={16} color="#94a3b8" />
          </TouchableOpacity>
        )}
      </View>

      {/* Sort Button */}
      <TouchableOpacity 
        onPress={onSortPress}
        className="w-12 h-12 bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700 rounded-2xl items-center justify-center shadow-sm"
      >
        <ArrowDownAZ size={20} color="#16a34a" />
      </TouchableOpacity>

      {/* Filter Button */}
      <TouchableOpacity 
        onPress={onFilterPress}
        className="w-12 h-12 bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700 rounded-2xl items-center justify-center shadow-sm relative"
      >
        <SlidersHorizontal size={20} color="#16a34a" />
        {activeFiltersCount > 0 && (
          <View className="absolute -top-1 -right-1 bg-red-500 w-5 h-5 rounded-full items-center justify-center border-2 border-white dark:border-slate-900">
            <Text className="text-[10px] text-white font-bold">
              {activeFiltersCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};
