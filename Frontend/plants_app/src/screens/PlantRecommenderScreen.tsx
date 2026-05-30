import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ScreenWrapper } from '../components/common/ScreenWrapper';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { plantService } from '../services/api';
import { Loader } from '../components/common/Loader';
import { Sparkles, ArrowRight, ArrowLeft, CheckCircle2, Info } from 'lucide-react-native';
import { Motion, AnimatePresence } from '@legendapp/motion';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { cn } from '../utils/cn';

const QUIZ_STEPS = [
  {
    id: 'light',
    questionEn: 'How much light does the spot have?',
    questionFa: 'نور محل نگهداری چطور است؟',
    options: [
      { labelEn: 'Low Light', labelFa: 'نور کم', value: 'low light' },
      { labelEn: 'Medium Indirect', labelFa: 'نور غیرمستقیم متوسط', value: 'medium indirect light' },
      { labelEn: 'Bright Indirect', labelFa: 'نور غیرمستقیم زیاد', value: 'bright indirect light' },
      { labelEn: 'Direct Sun', labelFa: 'نور مستقیم', value: 'direct sun' },
    ]
  },
  {
    id: 'watering',
    questionEn: 'How often can you water it?',
    questionFa: 'چقدر می‌توانید به آن آب بدهید؟',
    options: [
      { labelEn: 'I often forget', labelFa: 'خیلی وقت‌ها فراموش می‌کنم', value: 'low' },
      { labelEn: 'Once a week', labelFa: 'هفته‌ای یکبار', value: 'medium' },
      { labelEn: 'I love watering!', labelFa: 'عاشق آبیاری هستم!', value: 'high' },
    ]
  },
  {
    id: 'difficulty',
    questionEn: 'What is your experience level?',
    questionFa: 'سطح تجربه شما چقدر است؟',
    options: [
      { labelEn: 'Total Beginner', labelFa: 'مبتدی', value: 'easy' },
      { labelEn: 'Intermediate', labelFa: 'متوسط', value: 'medium' },
      { labelEn: 'Plant Expert', labelFa: 'حرفه‌ای', value: 'hard' },
    ]
  },
  {
    id: 'toxicity',
    questionEn: 'Do you have pets or small children?',
    questionFa: 'حیوان خانگی یا کودک کوچک دارید؟',
    options: [
      { labelEn: 'Yes, need safe plants', labelFa: 'بله، گیاه بی‌خطر می‌خواهم', value: 'false' },
      { labelEn: 'No, anything is fine', labelFa: 'خیر، مشکلی نیست', value: 'any' },
    ]
  }
];

const PlantRecommenderScreen = () => {
  const { i18n } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const isEn = i18n.language === 'en';

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<any>(null);

  const handleOptionSelect = (value: string) => {
    const currentStepId = QUIZ_STEPS[step].id;
    setAnswers(prev => ({ ...prev, [currentStepId]: value }));
  };

  const nextStep = () => {
    if (step < QUIZ_STEPS.length - 1) {
      setStep(step + 1);
    } else {
      getRecommendation();
    }
  };

  const prevStep = () => {
    if (step > 0) setStep(step - 1);
  };

  const getRecommendation = async () => {
    setLoading(true);
    try {
      const res = await plantService.recommendPlant(answers, i18n.language);
      setRecommendation(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetQuiz = () => {
    setStep(0);
    setAnswers({});
    setRecommendation(null);
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-surface-light dark:bg-surface-dark">
        <Loader size={24} />
        <Text className="mt-4 text-slate-500 font-bold">
          {isEn ? "Finding your perfect match..." : "در حال یافتن بهترین گزینه..."}
        </Text>
      </View>
    );
  }

  if (recommendation) {
    return (
      <ScreenWrapper>
        <View className="px-2 pt-2 items-center">
          <View className="w-20 h-20 bg-amber-100 rounded-3xl items-center justify-center mb-6">
            <Sparkles size={40} color="#f59e0b" />
          </View>
          <Text className="text-3xl font-black text-slate-900 dark:text-white text-center mb-2">
            {isEn ? "Match Found!" : "گیاه پیشنهادی شما!"}
          </Text>
          <Text className="text-slate-500 text-center mb-8">
            {isEn ? "Based on your environment and lifestyle" : "بر اساس محیط و سبک زندگی شما"}
          </Text>

          <Card className="w-full p-0 overflow-hidden mb-8">
            <Image 
              source={{ uri: recommendation.primary_image || 'https://via.placeholder.com/400' }} 
              className="w-full h-64"
              resizeMode="cover"
            />
            <View className="p-6">
              <Text className="text-2xl font-black text-slate-900 dark:text-white mb-1">
                {recommendation.plant_name}
              </Text>
              <Text className="text-slate-400 italic mb-4">{recommendation.scientific_name}</Text>
              
              <View className="bg-brand-50 dark:bg-brand-900/20 p-4 rounded-2xl mb-6">
                <View className="flex-row items-center gap-2 mb-2">
                  <Info size={16} color="#16a34a" />
                  <Text className="text-xs font-bold text-brand-700 dark:text-brand-400 uppercase">
                    {isEn ? "Why this plant?" : "چرا این گیاه؟"}
                  </Text>
                </View>
                <Text className="text-slate-700 dark:text-slate-200 text-sm leading-5">
                  {recommendation.reason}
                </Text>
              </View>

              <Button 
                variant="primary" 
                onPress={() => navigation.navigate('PlantDetails', { id: recommendation.plant_id.toString() })}
              >
                <Text className="text-white font-bold">{isEn ? "View Care Details" : "مشاهده جزئیات مراقبت"}</Text>
              </Button>
            </View>
          </Card>

          <Button variant="ghost" onPress={resetQuiz}>
            <Text className="text-slate-400 font-bold">{isEn ? "Take Quiz Again" : "شروع دوباره آزمون"}</Text>
          </Button>
        </View>
      </ScreenWrapper>
    );
  }

  const currentStepData = QUIZ_STEPS[step];
  const progress = ((step + 1) / QUIZ_STEPS.length) * 100;

  return (
    <ScreenWrapper>
      <View className="px-2 pt-2">
        {/* Progress Bar */}
        <View className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full mb-10 overflow-hidden">
          <Motion.View 
            animate={{ width: `${progress}%` }}
            className="h-full bg-brand-500" 
          />
        </View>

        <AnimatePresence mode="wait">
          <Motion.View
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Text className="text-xs font-bold text-brand-600 uppercase tracking-widest mb-2">
              {isEn ? `Step ${step + 1} of ${QUIZ_STEPS.length}` : `مرحله ${step + 1} از ${QUIZ_STEPS.length}`}
            </Text>
            <Text className="text-3xl font-black text-slate-900 dark:text-white mb-10 leading-10">
              {isEn ? currentStepData.questionEn : currentStepData.questionFa}
            </Text>

            <View className="gap-4">
              {currentStepData.options.map((opt) => {
                const isSelected = answers[currentStepData.id] === opt.value;
                return (
                  <Pressable
                    key={opt.value}
                    onPress={() => handleOptionSelect(opt.value)}
                    className={cn(
                      "p-6 rounded-[32px] border-2 flex-row justify-between items-center",
                      isSelected 
                        ? "bg-brand-500 border-brand-500 shadow-xl shadow-brand-500/30" 
                        : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700"
                    )}
                  >
                    <Text className={cn(
                      "text-lg font-bold",
                      isSelected ? "text-white" : "text-slate-700 dark:text-slate-200"
                    )}>
                      {isEn ? opt.labelEn : opt.labelFa}
                    </Text>
                    {isSelected && <CheckCircle2 size={24} color="white" />}
                  </Pressable>
                );
              })}
            </View>
          </Motion.View>
        </AnimatePresence>

        <View className="flex-row justify-between items-center mt-12 mb-10">
          <Button 
            variant="ghost" 
            onPress={prevStep} 
            disabled={step === 0}
            className={step === 0 ? "opacity-0" : ""}
          >
            <ArrowLeft size={20} color="#94a3b8" className={isEn ? '' : 'rotate-180'} />
            <Text className="ml-2 text-slate-400 font-bold">{isEn ? "Back" : "قبلی"}</Text>
          </Button>

          <Button 
            variant="primary" 
            size="lg" 
            className="px-10"
            disabled={!answers[currentStepData.id]}
            onPress={nextStep}
          >
            <Text className="text-white font-bold mr-2">
              {step === QUIZ_STEPS.length - 1 ? (isEn ? "Find My Plant" : "یافتن گیاه") : (isEn ? "Next" : "بعدی")}
            </Text>
            <ArrowRight size={20} color="white" className={isEn ? '' : 'rotate-180'} />
          </Button>
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default PlantRecommenderScreen;
