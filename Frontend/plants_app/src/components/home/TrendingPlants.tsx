import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Flame } from "lucide-react-native";
import React from "react";
import { useTranslation } from "react-i18next";
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import { Plant } from "../../types";
import { RootStackParamList } from "../../types/navigation";

interface TrendingPlantsProps {
  plants: Plant[];
}

export const TrendingPlants: React.FC<TrendingPlantsProps> = ({ plants }) => {
  const { i18n } = useTranslation();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const isEn = i18n.language === "en";

  const renderItem = ({ item, index }: { item: Plant; index: number }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() =>
        navigation.navigate("PlantDetails", { id: item.id.toString() })
      }
      className="me-5 w-[160px]"
    >
      <View className="w-[160px] h-[160px] rounded-[32px] overflow-hidden bg-slate-100 dark:bg-slate-800 shadow-sm">
        <Image
          source={{
            uri: item.primary_image || "https://via.placeholder.com/160",
          }}
          className="w-full h-full"
          resizeMode="cover"
        />
        <View className="absolute top-3 start-3 bg-white/90 dark:bg-slate-900/90 px-5 py-1 rounded-xl flex-row items-center border border-orange-100 dark:border-orange-900/30">
          <Flame size={12} color="#f97316" fill="#f97316" />
          <Text className="text-[10px] font-black ms-1 text-orange-600 dark:text-orange-400 uppercase tracking-tighter ">
            {index === 0
              ? isEn
                ? "SuperHot"
                : "خیلی‌محبوب"
              : isEn
                ? "Hot"
                : "پرطرفدار"}
          </Text>
        </View>
      </View>
      <Text
        className="mt-3 text-[16px] font-black text-slate-800 dark:text-white"
        numberOfLines={1}
      >
        {isEn ? item.english_name || item.farsi_name : item.farsi_name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View className="mt-8">
      <View className=" items-center px-5 mb-6">
        <Text className=" text-center text-[22px] font-black text-slate-900 dark:text-white">
          {isEn ? "Trending in Verna" : "داغ‌ترین‌های ورنا"}
        </Text>
      </View>

      <FlatList
        data={plants}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20 }}
        ListEmptyComponent={
          <View className="w-[300px] h-[160px] bg-slate-50 dark:bg-slate-800/30 rounded-[32px] items-center justify-center border border-dashed border-slate-200 dark:border-slate-700">
            <Text className="text-slate-400 font-bold">
              {isEn ? "No trending plants" : "گیاه پرطرفداری یافت نشد"}
            </Text>
          </View>
        }
      />
    </View>
  );
};
