import { BlurView } from "expo-blur";
import { Check, Trash2, X } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { cn } from "../../utils/cn";

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
  type: "filter" | "sort";

  // Sort props
  sortOptions?: SortOption[];
  currentSort?: string;
  onSortChange?: (key: string) => void;

  // Filter props
  filterCategories?: Record<string, FilterCategory>;
  currentFilters?: Record<string, string>;
  /** Called when the user taps Apply or Clear All — not on every chip tap */
  onFiltersApply?: (filters: Record<string, string>) => void;
}

const SHEET_HEIGHT_RATIO = 0.65;

export const FilterSortModal: React.FC<FilterSortModalProps> = ({
  isVisible,
  onClose,
  type,
  sortOptions,
  currentSort,
  onSortChange,
  filterCategories,
  currentFilters = {},
  onFiltersApply,
}) => {
  const { i18n } = useTranslation();
  const isEn = i18n.language === "en";
  const { height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const sheetHeight = Math.round(screenHeight * SHEET_HEIGHT_RATIO);

  const [draftFilters, setDraftFilters] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isVisible && type === "filter") {
      setDraftFilters({ ...currentFilters });
    }
  }, [isVisible, type, currentFilters]);

  const toggleDraftFilter = (key: string, value: string) => {
    setDraftFilters((prev) => {
      if (prev[key] === value) {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      return { ...prev, [key]: value };
    });
  };

  const handleApplyFilters = () => {
    onFiltersApply?.(draftFilters);
    onClose();
  };

  const handleClearFilters = () => {
    setDraftFilters({});
    onFiltersApply?.({});
    onClose();
  };

  const renderSortOptions = (
    <View className="gap-2">
      {sortOptions?.map((opt) => {
        const isActive = currentSort === opt.key;
        return (
          <Pressable
            key={opt.key}
            onPress={() => {
              onSortChange?.(opt.key);
              onClose();
            }}
            className={cn(
              "flex-row items-center justify-between p-4 rounded-2xl border",
              isActive
                ? "bg-brand-50 border-brand-200 dark:bg-brand-900/20 dark:border-brand-800"
                : "bg-slate-50 border-slate-100 dark:bg-slate-800/50 dark:border-slate-700",
            )}
          >
            <Text
              className={cn(
                "font-bold",
                isActive
                  ? "text-brand-700 dark:text-brand-400"
                  : "text-slate-600 dark:text-slate-300",
              )}
            >
              {isEn ? opt.labelEn : opt.labelFa}
            </Text>
            {isActive && <Check size={20} color="#16a34a" />}
          </Pressable>
        );
      })}
    </View>
  );

  const renderFilterCategories = (
    <View className="gap-8">
      {Object.entries(filterCategories || {}).map(([key, category]) => (
        <View key={key}>
          <Text className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 ms-2">
            {isEn ? category.labelEn : category.labelFa}
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {category.values.map((val) => {
              const isActive = draftFilters[key] === val.query;
              return (
                <TouchableOpacity
                  key={val.query}
                  activeOpacity={0.7}
                  onPress={() => toggleDraftFilter(key, val.query)}
                  className={cn(
                    "px-4 py-2.5 rounded-full border",
                    isActive
                      ? "bg-brand-500 border-brand-500 shadow-md"
                      : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700",
                  )}
                >
                  <Text
                    className={cn(
                      "text-xs font-bold",
                      isActive
                        ? "text-white"
                        : "text-slate-600 dark:text-slate-400",
                    )}
                  >
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
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View className="flex-1 justify-end">
        <Pressable
          className="absolute inset-0 bg-black/40"
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={isEn ? "Close" : "بستن"}
        />

        <View
          className="bg-white dark:bg-slate-900 rounded-t-[40px] shadow-2xl overflow-hidden"
          style={{
            height: sheetHeight,
            paddingBottom: Math.max(insets.bottom, 16),
          }}
        >
          {Platform.OS === "ios" && (
            <BlurView
              intensity={80}
              tint="default"
              className="absolute inset-0"
              pointerEvents="none"
            />
          )}

          <View className="flex-1 px-6 pt-6">
            <View className="flex-row justify-between items-center mb-6">
              <View>
                <Text className="text-2xl font-black text-slate-900 dark:text-white">
                  {type === "filter"
                    ? isEn
                      ? "Filters"
                      : "فیلترها"
                    : isEn
                      ? "Sort By"
                      : "مرتب‌سازی"}
                </Text>
                {type === "filter" &&
                  Object.keys(draftFilters).length > 0 && (
                    <Text className="text-brand-600 font-bold text-xs">
                      {Object.keys(draftFilters).length}{" "}
                      {isEn ? "active filters" : "فیلتر فعال"}
                    </Text>
                  )}
              </View>

              <Pressable
                onPress={onClose}
                className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full items-center justify-center"
              >
                <X size={20} color="#94a3b8" />
              </Pressable>
            </View>

            <ScrollView
              className="flex-1"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 16 }}
              keyboardShouldPersistTaps="handled"
            >
              {type === "sort" ? renderSortOptions : renderFilterCategories}
            </ScrollView>

            {type === "filter" && (
              <View className="flex-row gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handleClearFilters}
                  className="flex-1 flex-row items-center justify-center h-12 rounded-2xl bg-slate-100 dark:bg-slate-800"
                >
                  <Trash2 size={18} color="#ef4444" />
                  <Text className="ms-2 text-red-500 font-bold">
                    {isEn ? "Clear All" : "پاک کردن"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handleApplyFilters}
                  className="flex-1 h-12 rounded-2xl bg-brand-500 items-center justify-center"
                >
                  <Text className="text-white font-bold">
                    {isEn ? "Apply" : "اعمال فیلتر"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};
