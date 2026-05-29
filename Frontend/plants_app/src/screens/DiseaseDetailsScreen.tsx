import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRoute, useNavigation } from '@react-navigation/native';
import { ScreenWrapper } from '../components/common/ScreenWrapper';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { diseaseService } from '../services/api';
import { Disease } from '../types';
import { Loader } from '../components/common/Loader';
import { ArrowLeft, AlertTriangle, ShieldCheck, Activity, Eye, MessageCircle } from 'lucide-react-native';

const DiseaseDetailsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = route.params as { id: string };
  const { t, i18n } = useTranslation();
  const isEn = i18n.language === 'en';

  const [disease, setDisease] = useState<Disease | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const data = await diseaseService.getDiseaseById(parseInt(id));
        setDisease(data);
      } catch (err) {
        console.error('Failed to fetch disease details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  if (loading || !disease) {
    return (
      <View className="flex-1 items-center justify-center bg-surface-light dark:bg-surface-dark">
        <Loader size={20} />
      </View>
    );
  }

  const name = isEn ? disease.name : (disease.name_fa || disease.name);
  const description = isEn ? disease.description : (disease.description_fa || disease.description);
  const symptoms = isEn ? disease.symptoms : (disease.symptoms_fa || disease.symptoms);
  const solution = isEn ? disease.solution : (disease.solution_fa || disease.solution);
  const prevention = isEn ? disease.prevention_methods : (disease.prevention_methods_fa || disease.prevention_methods);

  return (
    <ScreenWrapper padding={false}>
      <View className="relative h-72 w-full bg-red-50 dark:bg-red-900/10 items-center justify-center">
        <AlertTriangle size={80} color="#ef4444" opacity={0.2} />
        
        <View className="absolute top-12 left-4 z-20">
          <Button 
            variant="secondary" 
            size="sm" 
            className="rounded-full w-10 h-10 p-0"
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft size={20} color="#000" className={isEn ? '' : 'rotate-180'} />
          </Button>
        </View>

        <View className="absolute bottom-6 left-6 right-6">
          <Badge variant={disease.severity_level === 'critical' || disease.severity_level === 'high' ? 'error' : 'warning'} className="mb-2">
            {isEn ? disease.severity_level : t(`disease.severity.${disease.severity_level}`)}
          </Badge>
          <Text className="text-3xl font-black text-slate-900 dark:text-white shadow-sm">
            {name}
          </Text>
        </View>
      </View>

      <View className="p-6">
        {/* Quick Stats */}
        <View className="flex-row gap-4 mb-8">
          <View className="flex-1 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-3xl border border-slate-100 dark:border-slate-700">
            <View className="flex-row items-center gap-2 mb-1">
              <Activity size={16} color="#64748b" />
              <Text className="text-[10px] font-bold text-slate-400 uppercase">{isEn ? 'Spread' : 'انتشار'}</Text>
            </View>
            <Text className="text-sm font-bold text-slate-800 dark:text-white">
              {isEn ? disease.spread_rate : t(`disease.spread.${disease.spread_rate}`)}
            </Text>
          </View>
          <View className="flex-1 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-3xl border border-slate-100 dark:border-slate-700">
            <View className="flex-row items-center gap-2 mb-1">
              <Eye size={16} color="#64748b" />
              <Text className="text-[10px] font-bold text-slate-400 uppercase">{isEn ? 'Views' : 'بازدید'}</Text>
            </View>
            <Text className="text-sm font-bold text-slate-800 dark:text-white">
              {disease.view_count}
            </Text>
          </View>
        </View>

        {/* Description */}
        <Card title={isEn ? "About this issue" : "درباره این بیماری"} className="mb-6">
          <Text className="text-slate-600 dark:text-slate-300 leading-6 text-sm text-justify">
            {description}
          </Text>
        </Card>

        {/* Symptoms */}
        <Card title={isEn ? "Symptoms" : "علائم"} className="mb-6">
          <Text className="text-slate-600 dark:text-slate-300 leading-6 text-sm">
            {symptoms}
          </Text>
        </Card>

        {/* Treatment/Solution */}
        <View className="bg-green-50 dark:bg-green-900/20 p-6 rounded-[32px] border border-green-100 dark:border-green-900/30 mb-6">
          <View className="flex-row items-center gap-3 mb-4">
            <View className="w-10 h-10 bg-green-500 rounded-2xl items-center justify-center">
              <ShieldCheck size={24} color="white" />
            </View>
            <Text className="text-lg font-black text-green-800 dark:text-green-400">{isEn ? "Solution" : "راهکار درمان"}</Text>
          </View>
          <Text className="text-slate-800 dark:text-slate-100 text-sm leading-6 text-justify">
            {solution}
          </Text>
        </View>

        {/* Prevention */}
        {prevention && (
          <Card title={isEn ? "Prevention" : "پیشگیری"} className="mb-10">
            <Text className="text-slate-600 dark:text-slate-300 leading-6 text-sm">
              {prevention}
            </Text>
          </Card>
        )}
      </View>
    </ScreenWrapper>
  );
};

export default DiseaseDetailsScreen;


