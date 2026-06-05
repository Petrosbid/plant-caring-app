import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Pressable,
  TextInput,
  Modal,
  Image,
  Alert,
  I18nManager,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Home,
  Heart,
  Shield,
  Award,
  Cpu,
  ChevronRight,
  ChevronLeft,
  Send,
  X,
  CheckCircle2,
  Droplet,
  Sun,
  Thermometer,
  Wind,
  Users,
  AlertCircle,
  Smile,
  Sparkles,
  Info,
} from 'lucide-react-native';
import { ScreenWrapper } from '../components/common/ScreenWrapper';
import { AppText as Text } from '../components/common/AppText';
import { Button } from '../components/common/Button';
import { Loader } from '../components/common/Loader';
import { plantService } from '../services/api';
import { RECOMMENDER_ANSWERS_KEY } from '../utils/storage';
import { cn } from '../utils/cn';
import { RootStackParamList } from '../types/navigation';
import {
  SECTIONS,
  QUESTIONS,
  type Question,
} from '../types/recommendationQuestions';

type Answers = Record<string, string | string[] | boolean>;

const SECTION_ICONS = [Home, Heart, Shield, Award, Cpu];

interface RecommendationResult {
  plant_id: number;
  plant_name: string;
  scientific_name: string;
  description?: string;
  primary_image: string | null;
  reason: string;
}

const getQuestionIcon = (questionId: string) => {
  const size = 18;
  if (questionId.includes('light')) return <Sun size={size} color="#eab308" />;
  if (questionId.includes('water')) return <Droplet size={size} color="#3b82f6" />;
  if (questionId.includes('temp')) return <Thermometer size={size} color="#f87171" />;
  if (questionId.includes('humidity')) return <Wind size={size} color="#14b8a6" />;
  if (questionId.includes('pet') || questionId.includes('child'))
    return <Users size={size} color="#a855f7" />;
  if (questionId.includes('allergy')) return <AlertCircle size={size} color="#f59e0b" />;
  return <Smile size={size} color="#16a34a" />;
};

const isAnswerValid = (q: Question, val: unknown): boolean => {
  if (q.type === 'checkbox') return Array.isArray(val) && val.length > 0;
  if (q.type === 'boolean') return typeof val === 'boolean';
  if (q.type === 'text') return typeof val === 'string' && val.trim().length > 0;
  return val !== undefined && val !== null && val !== '';
};

const PlantRecommenderScreen = () => {
  const { i18n } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const isEn = i18n.language === 'en';

  const [currentSection, setCurrentSection] = useState(1);
  const [answers, setAnswers] = useState<Answers>({});
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RecommendationResult | null>(null);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(RECOMMENDER_ANSWERS_KEY).then((saved) => {
      if (!saved) return;
      try {
        setAnswers(JSON.parse(saved));
      } catch {
        /* ignore corrupt cache */
      }
    });
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(RECOMMENDER_ANSWERS_KEY, JSON.stringify(answers));
  }, [answers]);

  const currentSectionData = SECTIONS.find((s) => s.id === currentSection)!;
  const sectionQuestions = useMemo(
    () => QUESTIONS.filter((q) => q.section === currentSection),
    [currentSection],
  );
  const isLastSection = currentSection === 5;

  const sectionProgress = useMemo(() => {
    const required = sectionQuestions.filter((q) => q.required);
    if (required.length === 0) return 100;
    const answered = required.filter((q) => isAnswerValid(q, answers[q.id])).length;
    return (answered / required.length) * 100;
  }, [sectionQuestions, answers]);

  const totalProgress =
    ((currentSection - 1) / 5) * 100 + sectionProgress / 5;

  const updateAnswer = useCallback(
    (questionId: string, value: string | string[] | boolean) => {
      setAnswers((prev) => ({ ...prev, [questionId]: value }));
      setErrors((prev) => (prev[questionId] ? { ...prev, [questionId]: false } : prev));
    },
    [],
  );

  const getQuestionValue = (q: Question) => {
    const val = answers[q.id];
    if (val === undefined) {
      if (q.type === 'checkbox') return [];
      return q.type === 'boolean' ? undefined : '';
    }
    return val;
  };

  const validateSection = (sectionId: number): boolean => {
    const required = QUESTIONS.filter((q) => q.section === sectionId && q.required);
    let hasError = false;
    const newErrors: Record<string, boolean> = {};

    for (const q of required) {
      if (!isAnswerValid(q, answers[q.id])) {
        hasError = true;
        newErrors[q.id] = true;
      }
    }
    if (hasError) setErrors((prev) => ({ ...prev, ...newErrors }));
    return !hasError;
  };

  const goToNextSection = () => {
    if (!validateSection(currentSection)) return;
    if (currentSection < 5) setCurrentSection((s) => s + 1);
  };

  const goToPrevSection = () => {
    if (currentSection > 1) setCurrentSection((s) => s - 1);
  };

  const handleSubmit = async () => {
    let allValid = true;
    for (let i = 1; i <= 5; i++) {
      if (!validateSection(i)) allValid = false;
    }
    if (!allValid) {
      Alert.alert(
        isEn ? 'Incomplete answers' : 'پاسخ‌ها ناقص است',
        isEn
          ? 'Please answer all required questions in every section.'
          : 'لطفاً به تمام سوالات اجباری در همه بخش‌ها پاسخ دهید.',
      );
      return;
    }

    setLoading(true);
    try {
      const res = await plantService.recommendPlant(
        answers,
        i18n.language,
        additionalNotes,
      );
      setResult(res);
      setShowResult(true);
    } catch {
      Alert.alert(
        isEn ? 'Error' : 'خطا',
        isEn
          ? 'Failed to get recommendation. Please try again.'
          : 'خطا در دریافت پیشنهاد. لطفاً دوباره تلاش کنید.',
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForm = async () => {
    setAnswers({});
    setAdditionalNotes('');
    setCurrentSection(1);
    setErrors({});
    setResult(null);
    setShowResult(false);
    await AsyncStorage.removeItem(RECOMMENDER_ANSWERS_KEY);
  };

  const renderRadioOptions = (q: Question, value: unknown, hasError: boolean) => (
    <View className="gap-2">
      {q.options?.map((opt) => {
        const selected = value === opt.value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => updateAnswer(q.id, opt.value)}
            className={cn(
              'flex-row items-center gap-3 p-4 rounded-2xl border-2',
              selected
                ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/25'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80',
              hasError && !selected && 'border-red-300 dark:border-red-800',
            )}
          >
            <View
              className={cn(
                'w-5 h-5 rounded-full border-2 items-center justify-center',
                selected ? 'border-brand-500 bg-brand-500' : 'border-slate-400',
              )}
            >
              {selected && <View className="w-2 h-2 rounded-full bg-white" />}
            </View>
            <Text
              className={cn(
                'flex-1 text-sm leading-5',
                selected
                  ? 'text-brand-800 dark:text-brand-200 font-semibold'
                  : 'text-slate-700 dark:text-slate-300',
              )}
            >
              {isEn ? opt.labelEn : opt.labelFa}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );

  const renderCheckboxOptions = (q: Question, value: unknown, hasError: boolean) => {
    const selected = Array.isArray(value) ? value : [];
    return (
      <View className="gap-2">
        {q.options?.map((opt) => {
          const checked = selected.includes(opt.value);
          return (
            <Pressable
              key={opt.value}
              onPress={() => {
                const next = checked
                  ? selected.filter((v) => v !== opt.value)
                  : [...selected, opt.value];
                updateAnswer(q.id, next);
              }}
              className={cn(
                'flex-row items-center gap-3 p-4 rounded-2xl border-2',
                checked
                  ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/25'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80',
                hasError && !checked && 'border-red-300 dark:border-red-800',
              )}
            >
              <View
                className={cn(
                  'w-5 h-5 rounded-md border-2 items-center justify-center',
                  checked ? 'border-brand-500 bg-brand-500' : 'border-slate-400',
                )}
              >
                {checked && <CheckCircle2 size={14} color="white" />}
              </View>
              <Text
                className={cn(
                  'flex-1 text-sm leading-5',
                  checked
                    ? 'text-brand-800 dark:text-brand-200 font-semibold'
                    : 'text-slate-700 dark:text-slate-300',
                )}
              >
                {isEn ? opt.labelEn : opt.labelFa}
              </Text>
            </Pressable>
          );
        })}
      </View>
    );
  };

  const renderBooleanOptions = (q: Question, value: unknown, hasError: boolean) => {
    const boolValue = value as boolean | undefined;
    return (
      <View className="flex-row gap-3">
        {[
          { val: true, label: isEn ? 'Yes' : 'بله' },
          { val: false, label: isEn ? 'No' : 'خیر' },
        ].map((opt) => {
          const active = boolValue === opt.val;
          return (
            <Pressable
              key={String(opt.val)}
              onPress={() => updateAnswer(q.id, opt.val)}
              className={cn(
                'flex-1 py-3.5 rounded-2xl border-2 items-center',
                active
                  ? 'bg-brand-500 border-brand-500'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700',
                hasError && !active && 'border-red-300',
              )}
            >
              <Text
                className={cn(
                  'font-bold',
                  active ? 'text-white' : 'text-slate-700 dark:text-slate-300',
                )}
              >
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    );
  };

  const renderSelectOptions = (q: Question, value: unknown, hasError: boolean) =>
    renderRadioOptions(q, value || '', hasError);

  const renderTextInput = (q: Question, value: unknown, hasError: boolean) => (
    <TextInput
      value={typeof value === 'string' ? value : ''}
      onChangeText={(text) => updateAnswer(q.id, text)}
      placeholder={isEn ? q.placeholderEn : q.placeholderFa}
      placeholderTextColor="#94a3b8"
      className={cn(
        'w-full rounded-2xl border-2 px-4 py-3 text-base text-slate-800 dark:text-white bg-white dark:bg-slate-800',
        hasError ? 'border-red-400' : 'border-slate-200 dark:border-slate-700',
        isEn ? 'font-inter' : 'font-vazir',
        'text-start'
      )}
    />
  );

  const renderQuestion = (q: Question) => {
    const value = getQuestionValue(q);
    const hasError = !!errors[q.id];
    const label = isEn ? q.labelEn : q.labelFa;

    return (
      <View
        key={q.id}
        className="rounded-2xl bg-white/90 dark:bg-slate-800/60 p-4 border border-slate-200/80 dark:border-slate-700/60"
      >
        <View className="flex-row items-start gap-2 mb-3">
          {getQuestionIcon(q.id)}
          <Text className="flex-1 text-base font-semibold text-slate-800 dark:text-slate-200 leading-6 text-start">
            {label}
            {q.required && <Text className="text-red-500"> *</Text>}
          </Text>
        </View>

        {q.type === 'radio' && renderRadioOptions(q, value, hasError)}
        {q.type === 'checkbox' && renderCheckboxOptions(q, value, hasError)}
        {q.type === 'boolean' && renderBooleanOptions(q, value, hasError)}
        {q.type === 'select' && renderSelectOptions(q, value, hasError)}
        {q.type === 'text' && renderTextInput(q, value, hasError)}

        {!q.required && (
          <Text className="text-xs text-slate-400 mt-2 text-start">
            {isEn ? 'Optional' : 'اختیاری'}
          </Text>
        )}
        {hasError && (
          <Text className="text-xs text-red-500 mt-2 text-start">
            {isEn ? 'This question is required.' : 'این سوال اجباری است.'}
          </Text>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-surface-light dark:bg-surface-dark px-6">
        <Loader size={24} />
        <Text className="mt-4 text-slate-500 font-bold text-center">
          {isEn ? 'Finding your perfect match...' : 'در حال یافتن بهترین گزینه...'}
        </Text>
      </View>
    );
  }

  const SectionIcon = SECTION_ICONS[currentSection - 1];

  return (
    <>
      <ScreenWrapper>
        <View className="pb-4">
          {/* Hero */}
          <View className="items-center mb-8">
            <View className="w-14 h-14 rounded-2xl bg-brand-100 dark:bg-brand-900/40 items-center justify-center mb-4">
              <Sparkles size={28} color="#16a34a" />
            </View>
            <Text className="text-3xl font-black text-center text-slate-900 dark:text-white mb-2">
              {isEn ? 'Smart Plant Recommender' : 'پیشنهاددهنده هوشمند گیاه'}
            </Text>
            <Text className="text-slate-500 dark:text-slate-400 text-center text-sm leading-5 px-2">
              {isEn
                ? 'Answer a few questions and get a personalized plant based on your home and lifestyle.'
                : 'به چند سوال پاسخ دهید و گیاه مناسب خانه و سبک زندگی خود را دریافت کنید.'}
            </Text>
          </View>

          {/* Progress */}
          <View className="mb-6">
            <View className="flex-row justify-between mb-2">
              <Text className="text-sm font-medium text-slate-500">
                {isEn ? `Step ${currentSection} of 5` : `مرحله ${currentSection} از ۵`}
              </Text>
              <Text className="text-sm font-bold text-brand-600 dark:text-brand-400">
                {Math.round(totalProgress)}%
              </Text>
            </View>
            <View className="h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <View
                className="h-full bg-brand-500 rounded-full"
                style={{ width: `${totalProgress}%` }}
              />
            </View>
            <View className="flex-row justify-between mt-4">
              {[1, 2, 3, 4, 5].map((step) => {
                const done = step < currentSection;
                const active = step === currentSection;
                return (
                  <View key={step} className="items-center flex-1">
                    <View
                      className={cn(
                        'w-8 h-8 rounded-full items-center justify-center',
                        done && 'bg-brand-500',
                        active && 'bg-brand-100 dark:bg-brand-900/50 border-2 border-brand-500',
                        !done && !active && 'bg-slate-100 dark:bg-slate-700',
                      )}
                    >
                      {done ? (
                        <CheckCircle2 size={16} color="white" />
                      ) : (
                        <Text
                          className={cn(
                            'text-xs font-bold',
                            active
                              ? 'text-brand-600 dark:text-brand-400'
                              : 'text-slate-400',
                          )}
                        >
                          {step}
                        </Text>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Section card */}
          <View className="rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-700/60 shadow-lg shadow-black/5 mb-6">
            <View className="bg-brand-600 px-5 py-4">
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-xl bg-white/20 items-center justify-center">
                  <SectionIcon size={22} color="white" />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-bold text-white text-start">
                    {isEn ? currentSectionData.titleEn : currentSectionData.titleFa}
                  </Text>
                  <Text className="text-white/85 text-sm mt-0.5 text-start">
                    {isEn
                      ? currentSectionData.descriptionEn
                      : currentSectionData.descriptionFa}
                  </Text>
                </View>
              </View>
            </View>
            <View className="bg-white/95 dark:bg-slate-900/95 p-4 gap-4">
              {sectionQuestions.map(renderQuestion)}
            </View>
          </View>

          {/* Additional notes on last section */}
          {isLastSection && (
            <View className="rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-4 mb-6">
              <View className="flex-row items-center gap-2 mb-3">
                <Smile size={18} color="#16a34a" />
                <Text className="font-semibold text-slate-800 dark:text-slate-200">
                  {isEn ? 'Additional Notes (Optional)' : 'نکات اضافی (اختیاری)'}
                </Text>
              </View>
              <TextInput
                value={additionalNotes}
                onChangeText={setAdditionalNotes}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                placeholder={
                  isEn
                    ? 'Anything else? Favorite plants, allergies, etc.'
                    : 'اطلاعات دیگر؟ گیاه مورد علاقه، آلرژی و...'
                }
                placeholderTextColor="#94a3b8"
                className={cn(
                  'min-h-[100px] rounded-2xl border-2 border-slate-200 dark:border-slate-700 px-4 py-3 text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-900',
                  isEn ? 'font-inter' : 'font-vazir',
                  'text-start'
                )}
              />
            </View>
          )}

          {/* Navigation */}
          <View className="flex-row items-center gap-3 mb-4">
            {currentSection > 1 && (
              <Pressable
                onPress={goToPrevSection}
                className="flex-row items-center gap-2 px-5 py-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              >
                <ChevronLeft size={20} color="#64748b" style={{ transform: [{ scaleX: isEn ? 1 : -1 }] }} />
                <Text className="font-bold text-slate-600 dark:text-slate-300">
                  {isEn ? 'Previous' : 'قبلی'}
                </Text>
              </Pressable>
            )}
            <View className="flex-1" />
            {!isLastSection ? (
              <Pressable
                onPress={goToNextSection}
                className="flex-row items-center gap-2 px-6 py-3.5 rounded-2xl bg-brand-500 shadow-lg shadow-brand-500/25"
              >
                <Text className="font-bold text-white">{isEn ? 'Next' : 'بعدی'}</Text>
                <ChevronRight size={20} color="white" style={{ transform: [{ scaleX: isEn ? 1 : -1 }] }} />
              </Pressable>
            ) : (
              <Pressable
                onPress={handleSubmit}
                disabled={loading}
                className="flex-row items-center gap-2 px-6 py-3.5 rounded-2xl bg-brand-500 shadow-lg shadow-brand-500/25 opacity-100"
              >
                <Send size={18} color="white" style={{ transform: [{ scaleX: isEn ? 1 : -1 }] }} />
                <Text className="font-bold text-white">
                  {isEn ? 'Get Recommendation' : 'دریافت پیشنهاد'}
                </Text>
              </Pressable>
            )}
          </View>

          <Pressable onPress={resetForm} className="items-center py-2">
            <Text className="text-sm text-slate-400 underline">
              {isEn ? 'Clear all answers and start over' : 'پاک کردن همه پاسخ‌ها و شروع مجدد'}
            </Text>
          </Pressable>
        </View>
      </ScreenWrapper>

      {/* Result modal */}
      <Modal
        visible={showResult && !!result}
        animationType="slide"
        transparent
        onRequestClose={() => setShowResult(false)}
      >
        <Pressable
          className="flex-1 bg-black/60 justify-end"
          onPress={() => setShowResult(false)}
        >
          <Pressable
            className="bg-white dark:bg-slate-800 rounded-t-[32px] max-h-[90%] overflow-hidden"
            onPress={(e) => e.stopPropagation()}
          >
            <View className="bg-brand-600 px-5 py-4 flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <Text className="text-2xl">🌿</Text>
                <Text className="text-xl font-bold text-white">
                  {isEn ? 'Your Perfect Match' : 'گیاه مناسب شما'}
                </Text>
              </View>
              <Pressable
                onPress={() => setShowResult(false)}
                className="p-2 rounded-full bg-white/15"
                hitSlop={12}
              >
                <X size={22} color="white" />
              </Pressable>
            </View>

            <View className="p-5">
              {result?.primary_image ? (
                <Image
                  source={{ uri: result.primary_image }}
                  className="w-full h-48 rounded-2xl mb-4"
                  resizeMode="cover"
                />
              ) : (
                <View className="w-full h-48 rounded-2xl mb-4 bg-brand-50 dark:bg-brand-900/30 items-center justify-center">
                  <Sparkles size={48} color="#16a34a" />
                </View>
              )}

              <Text className="text-2xl font-black text-slate-900 dark:text-white mb-1 text-start">
                {result?.plant_name}
              </Text>
              <Text className="text-brand-600 dark:text-brand-400 italic text-sm mb-4 text-start">
                {result?.scientific_name}
              </Text>

              <View className="bg-brand-50 dark:bg-brand-900/30 p-4 rounded-2xl mb-4 border-l-4 border-brand-500">
                <View className="flex-row items-center gap-2 mb-2">
                  <Info size={16} color="#16a34a" />
                  <Text className="text-xs font-bold text-brand-700 dark:text-brand-400 uppercase">
                    {isEn ? 'Why this plant?' : 'چرا این گیاه؟'}
                  </Text>
                </View>
                <Text className="text-slate-700 dark:text-slate-200 text-sm leading-5 text-start">
                  {result?.reason}
                </Text>
              </View>

              {result?.description ? (
                <Text className="text-slate-600 dark:text-slate-400 text-sm leading-5 mb-4 text-start">
                  {result.description}
                </Text>
              ) : null}

              <View className="gap-3 pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  onPress={() => {
                    setShowResult(false);
                    navigation.navigate('PlantDetails', {
                      id: String(result!.plant_id),
                    });
                  }}
                >
                  {isEn ? 'View Plant Details' : 'مشاهده جزئیات گیاه'}
                </Button>
                <Button variant="secondary" size="lg" onPress={resetForm}>
                  {isEn ? 'Start Over' : 'شروع مجدد'}
                </Button>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

export default PlantRecommenderScreen;
