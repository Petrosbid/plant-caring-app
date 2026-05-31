import { Motion } from "@legendapp/motion";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
    AlarmClock,
    BriefcaseMedical,
    Camera,
    Search,
    Sprout,
} from "lucide-react-native";
import React from "react";
import { useTranslation } from "react-i18next";
import { TextInput, TouchableOpacity, View, Platform } from "react-native";
import { AppText as Text } from "../common/AppText";
import { RootStackParamList } from "../../types/navigation";

const MotionView = Motion.View as any;

export const HomeHeader = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { i18n } = useTranslation();
  const isEn = i18n.language === "en";

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

  // محاسبه پدینگ بالا برای جلوگیری از رفتن زیر ناچ و استاتوس‌بار
  const paddingTopClass = Platform.OS === "ios" ? "pt-14" : "pt-12";

  return (
    // اضافه شدن کلاس داینامیک برای پدینگ بالا و اضافه کردن z-50 برای اطمینان از روی لایه‌ها بودن
    <View className={`px-5 ${paddingTopClass} pb-10 bg-white dark:bg-slate-900 rounded-b-[40px] shadow-sm shadow-slate-200 z-50`}>
      <MotionView
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 120 }}
      >
        {/* Search Bar */}
        <View className="flex-row items-center border-[2px] border-[#4FD1C5] dark:border-[#4FD1C5] rounded-full px-5 h-[60px] bg-white dark:bg-slate-800 mb-10 shadow-sm shadow-teal-50 dark:shadow-none">
          <Search size={24} color="#94a3b8" strokeWidth={2.5} />
          <TextInput
            placeholder={isEn ? "Search plants" : "جستجوی گیاهان"}
            className="flex-1 ml-3 text-slate-800 dark:text-white text-[17px] font-medium text-right"
            placeholderTextColor="#94a3b8"
          />
        </View>

        {/* Quick Actions Grid */}
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
      </MotionView>
    </View>
  );
};