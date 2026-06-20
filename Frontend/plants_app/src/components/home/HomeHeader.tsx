import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  AlarmClock,
  BriefcaseMedical,
  Camera,
  Search,
  Sprout,
} from "lucide-react-native";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { TextInput, TouchableOpacity, View } from "react-native";
import { AppText as Text } from "../common/AppText";
import { RootStackParamList } from "../../types/navigation";

export const HomeHeader = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { i18n } = useTranslation();
  const isEn = i18n.language === "en";
  const [query, setQuery] = useState("");

  const handleSearchSubmit = () => {
    if (query.trim()) {
      navigation.navigate("Library", { search: query.trim() });
      setQuery("");
    }
  };

  const actions = [
    {
      label: isEn ? "Identify" : "شناسایی",
      icon: <Camera size={30} color="white" />,
      color: "bg-[#4FD1C5]",
      onPress: () => navigation.navigate("Identify"),
    },
    {
      label: isEn ? "Diagnose" : "تشخیص",
      icon: <BriefcaseMedical size={30} color="white" />,
      color: "bg-[#FBBF24]",
      onPress: () => navigation.navigate("DiseaseCheck"),
    },
    {
      label: isEn ? "Reminders" : "یادآورها",
      icon: <AlarmClock size={30} color="white" />,
      color: "bg-[#60A5FA]",
      onPress: () => navigation.navigate("MainTabs", { screen: "Reminders" }),
    },
    {
      label: isEn ? "My Garden" : "باغچه من",
      icon: <Sprout size={30} color="white" />,
      color: "bg-[#34D399]",
      onPress: () => navigation.navigate("MainTabs", { screen: "Garden" }),
    },
  ];

  return (
    <View className="px-5 pt-4 pb-10 dark:bg-emerald-950 rounded-b-[40px] shadow-sm shadow-slate-200">
      <View className="flex-row items-center border-[2px] border-[#4FD1C5] rounded-full px-5 h-[60px] bg-white dark:bg-slate-800 mb-10 shadow-sm shadow-teal-50 dark:shadow-none">
        <TouchableOpacity onPress={handleSearchSubmit} activeOpacity={0.7}>
          <Search size={24} color="#94a3b8" strokeWidth={2.5} />
        </TouchableOpacity>
        <TextInput
          placeholder={isEn ? "Search plants" : "جستجوی گیاهان"}
          className="flex-1 ms-3 text-slate-800 dark:text-white text-[17px] font-medium text-start"
          placeholderTextColor="#94a3b8"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearchSubmit}
          returnKeyType="search"
        />
      </View>

      <View className="flex-row justify-between px-1">
        {actions.map((action, index) => (
          <TouchableOpacity
            key={index}
            onPress={action.onPress}
            className="items-center w-[75px]"
            activeOpacity={0.7}
          >
            <View
              className={`w-[68px] h-[68px] rounded-[24px] ${action.color} items-center justify-center mb-3 shadow-md shadow-slate-200 dark:shadow-none`}
            >
              {action.icon}
            </View>
            <Text className="text-slate-800 dark:text-slate-200 font-bold text-[13px] text-center">
              {action.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};
