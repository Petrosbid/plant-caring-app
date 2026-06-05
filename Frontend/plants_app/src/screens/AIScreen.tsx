import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ScreenWrapper } from '../components/common/ScreenWrapper';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Camera, Search, Bug, Zap } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

const AIScreen = () => {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const isEn = i18n.language === 'en';

  return (
    <ScreenWrapper>
      <View className="px-2 pt-2">
        <View className="flex-row items-center gap-3 mb-2">
          <Zap size={32} color="#16a34a" fill="#16a34a" />
          <Text className="text-3xl font-black text-slate-900 dark:text-white">
            {isEn ? "AI" : "هوش مصنوعی"}
          </Text>
        </View>
        <Text className="text-slate-500 dark:text-slate-400 mb-8">
          {isEn ? "Smart tools to help you grow better" : "ابزارهای هوشمند برای کمک به رشد بهتر گیاهان شما"}
        </Text>

        <View className="gap-6">
          <Card 
            title={t('common.identify')}
            subtitle={isEn ? "Know your plant in seconds" : "گیاه خود را در چند ثانیه بشناسید"}
            headerIcon={<Search size={28} color="#16a34a" />}
            className="border-brand-100 dark:border-brand-900/30"
          >
            <Text className="text-slate-600 dark:text-slate-400 text-sm mb-6 leading-5">
              {isEn 
                ? "Use our advanced computer vision to identify over 10,000 species with 98% accuracy." 
                : "از بینایی ماشین پیشرفته ما برای شناسایی بیش از ۱۰,۰۰۰ گونه با دقت ۹۸٪ استفاده کنید."}
            </Text>
            <Button 
              variant="primary" 
              onPress={() => navigation.navigate('Identify')}
            >
              <Camera size={18} color="white" />
              <Text className="text-white font-bold text-sm">{isEn ? "Open Identifier" : "باز کردن شناسایی"}</Text>
            </Button>
          </Card>

          <Card 
            title={t('common.disease')}
            subtitle={isEn ? "Diagnose health issues" : "تشخیص مشکلات سلامتی گیاه"}
            headerIcon={<Bug size={28} color="#ef4444" />}
            className="border-red-100 dark:border-red-900/30"
          >
            <Text className="text-slate-600 dark:text-slate-400 text-sm mb-6 leading-5">
              {isEn 
                ? "Noticed yellow spots or pests? Scan the leaves to get a diagnosis and treatment plan." 
                : "متوجه لکه‌های زرد یا آفت شده‌اید؟ برگ‌ها را اسکن کنید تا تشخیص و طرح درمان دریافت کنید."}
            </Text>
            <View className="flex-row gap-2">
              <Button 
                variant="danger" 
                className="flex-1"
                onPress={() => navigation.navigate('DiseaseCheck')}
              >
                <Camera size={18} color="white" />
                <Text className="text-white font-bold text-sm">{isEn ? "Check Health" : "بررسی سلامت"}</Text>
              </Button>
              <Button 
                variant="outline" 
                className="px-5 border-red-500"
                onPress={() => navigation.navigate('DiseaseLibrary')}
              >
                <Search size={18} color="#ef4444" />
              </Button>
            </View>
          </Card>

          <Card 
            title={t('common.recommend')}
            subtitle={isEn ? "Find your perfect match" : "گیاه مناسب خود را پیدا کنید"}
            headerIcon={<Zap size={28} color="#f59e0b" />}
            className="border-amber-100 dark:border-amber-900/30"
          >
            <Text className="text-slate-600 dark:text-slate-400 text-sm mb-6 leading-5">
              {isEn 
                ? "Don't know what to grow? Our AI will suggest the best plant for your environment." 
                : "نمی‌دانید چه چیزی پرورش دهید؟ هوش مصنوعی ما بهترین گیاه را برای محیط شما پیشنهاد می‌دهد."}
            </Text>
            <Button 
              variant="secondary" 
              onPress={() => navigation.navigate('PlantRecommender')}
            >
              <Zap size={18} color={isEn ? "#0f172a" : "#fff"} fill={isEn ? "#0f172a" : "#fff"} />
              <Text className="text-slate-800 dark:text-white font-bold text-sm">{isEn ? "Start Quiz" : "شروع آزمون"}</Text>
            </Button>
          </Card>
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default AIScreen;

