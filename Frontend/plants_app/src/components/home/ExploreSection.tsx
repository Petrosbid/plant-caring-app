import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React from "react";
import { useTranslation } from "react-i18next";
import { ImageBackground, Text, TouchableOpacity, View, ScrollView } from "react-native";
import { RootStackParamList } from "../../types/navigation";

export const ExploreSection = () => {
  const { i18n } = useTranslation();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const isEn = i18n.language === "en";

  const categories = [
    {
      title: isEn ? "Toxic Plants" : "گیاهان سمی",
      image: "https://images.unsplash.com/photo-1453904300235-0f2f60b15b5d?q=80&w=600",
      filters: { is_toxic: "true" },
    },
    {
      title: isEn ? "Pet Friendly" : "دوستدار حیوانات",
      image: "https://images.unsplash.com/photo-1595665593673-bf1ad72905c0?q=80&w=600",
      filters: { is_toxic: "false" },
    },
    {
      title: isEn ? "Easy to Grow" : "نگهداری آسان",
      image: "https://images.unsplash.com/photo-1485955900006-10f4d324d445?q=80&w=600",
      filters: { care_difficulty: "easy" },
    },
    {
      title: isEn ? "Low Light" : "نور کم",
      image: "https://images.unsplash.com/photo-1509423350716-97f9360b4e09?q=80&w=600",
      filters: { light_requirements: "low light" },
    },
    {
      title: isEn ? "Sun Lovers" : "عاشق آفتاب",
      image: "https://images.unsplash.com/photo-1525498122346-81c1fd721c98?q=80&w=600",
      filters: { light_requirements: "direct sun" },
    },
    {
        title: isEn ? "Cactus & Succulents" : "کاکتوس و ساکولنت",
        image: "https://images.unsplash.com/photo-1520302630591-fd1c66edc19d?q=80&w=600",
        filters: { soil_type: "cactus mix" },
    },
  ];

  return (
    <View className="mt-12 pb-8 ">
      <View className=" items-center px-5 mb-6">
        <Text className=" text-center text-[22px] font-black text-slate-900 dark:text-white">
          {isEn ? "Explore Collections" : "کلکسیون‌های ویژه"}
        </Text>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20 }}
        className="flex-row"
      >
        {categories.map((cat, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => navigation.navigate("Library", { filters: cat.filters } as any)}
            activeOpacity={0.9}
            className="w-[220px] h-[220px] rounded-[40px] overflow-hidden shadow-lg shadow-slate-200 dark:shadow-none me-4"
          >
            <ImageBackground
              source={{ uri: cat.image }}
              className="flex-1 justify-end items-start p-5"
            >
              <View className="absolute inset-0 bg-black/30" />
              <Text className="text-white font-black text-[16px] leading-tight">
                {cat.title}
              </Text>
            </ImageBackground>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};
