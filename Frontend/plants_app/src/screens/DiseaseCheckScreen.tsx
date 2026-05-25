import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as ImagePicker from 'expo-image-picker';
import { ScreenWrapper } from '../components/common/ScreenWrapper';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { diseaseService } from '../services/api';
import { Disease } from '../types';
import { Camera, Image as ImageIcon, X, AlertTriangle, ShieldCheck } from 'lucide-react-native';
import { Motion, AnimatePresence } from '@legendapp/motion';
import { Badge } from '../components/common/Badge';

const DiseaseCheckScreen = () => {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language === 'en';

  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Disease | null>(null);

  const pickImage = async (useCamera: boolean) => {
    const permissionResult = useCamera 
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert(isEn ? "Permission Required" : "اجازه دسترسی", isEn ? "Needed to analyze plant health." : "برای بررسی سلامت گیاه لازم است.");
      return;
    }

    const result = await (useCamera 
      ? ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.7 })
      : ImagePicker.launchImageLibraryAsync({ allowsEditing: true, quality: 0.7 }));

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setResult(null);
    }
  };

  const handleDiagnose = async () => {
    if (!image) return;
    setLoading(true);
    try {
      const data = await diseaseService.diagnoseDisease(image);
      setResult(data);
    } catch (err) {
      Alert.alert(isEn ? "Error" : "خطا", isEn ? "Could not diagnose symptoms. Try a closer shot of the leaves." : "تشخیص انجام نشد. از برگ‌ها عکس نزدیک‌تری بگیرید.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      <View className="px-2 pt-2">
        <Text className="text-3xl font-black text-slate-900 dark:text-white mb-2">
          {t('common.disease')}
        </Text>
        <Text className="text-slate-500 dark:text-slate-400 mb-8">
          {isEn ? "Scan symptoms to identify pests or diseases" : "علائم را اسکن کنید تا آفت‌ها یا بیماری‌ها شناسایی شوند"}
        </Text>

        {!image ? (
          <View className="items-center gap-6 mt-10">
            <View className="w-48 h-48 bg-red-50 dark:bg-red-900/10 rounded-full items-center justify-center border-2 border-dashed border-red-200 dark:border-red-900/30">
              <Camera size={48} color="#ef4444" />
            </View>
            
            <View className="w-full gap-4 px-4">
              <Button 
                variant="danger" 
                size="lg" 
                onPress={() => pickImage(true)}
              >
                <Camera size={20} color="white" />
                <Text className="ml-2 text-white">{isEn ? "Take Symptom Photo" : "گرفتن عکس از علائم"}</Text>
              </Button>
              <Button 
                variant="secondary" 
                size="lg" 
                onPress={() => pickImage(false)}
              >
                <ImageIcon size={20} color="#64748b" />
                <Text className="ml-2 text-slate-600 dark:text-slate-300">{isEn ? "Choose from Gallery" : "انتخاب از گالری"}</Text>
              </Button>
            </View>
          </View>
        ) : (
          <View className="items-center">
            <View className="relative w-full aspect-square rounded-3xl overflow-hidden shadow-xl border-4 border-red-500/20">
              <Image source={{ uri: image }} className="w-full h-full" />
              <TouchableOpacity onPress={() => setImage(null)} className="absolute top-4 right-4 bg-black/50 p-2 rounded-full">
                <X size={20} color="white" />
              </TouchableOpacity>
            </View>

            <View className="w-full mt-8 gap-4 px-2">
              <Button 
                variant="danger" 
                size="lg" 
                isLoading={loading}
                onPress={handleDiagnose}
              >
                {isEn ? "Diagnose Now" : "شروع تشخیص"}
              </Button>
              <Button variant="ghost" onPress={() => setImage(null)} disabled={loading}>
                {isEn ? "Cancel" : "انصراف"}
              </Button>
            </View>
          </View>
        )}

        <AnimatePresence>
          {result && (
            // @ts-ignore
            <Motion.View
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-10 mb-10"
            >
              <Card 
                title={isEn ? result.name : (result.name_fa || result.name)}
                subtitle={isEn ? `Spread: ${result.spread_rate}` : `سرایت: ${result.spread_rate}`}
                headerIcon={<AlertTriangle size={24} color="#ef4444" />}
              >
                <Badge variant={result.severity_level === 'critical' || result.severity_level === 'high' ? 'error' : 'warning'} className="mb-4">
                  {isEn ? `Severity: ${result.severity_level}` : `شدت: ${result.severity_level}`}
                </Badge>

                <View className="space-y-4">
                  <View>
                    <Text className="text-xs font-bold text-slate-400 uppercase mb-1">{isEn ? "Symptoms" : "علائم"}</Text>
                    <Text className="text-slate-700 dark:text-slate-200 text-sm leading-5">
                      {isEn ? result.symptoms : (result.symptoms_fa || result.symptoms)}
                    </Text>
                  </View>

                  <View className="bg-green-50 dark:bg-green-900/20 p-4 rounded-2xl border border-green-100 dark:border-green-900/30">
                    <View className="flex-row items-center gap-2 mb-2">
                      <ShieldCheck size={18} color="#16a34a" />
                      <Text className="text-xs font-bold text-green-700 dark:text-green-400 uppercase">{isEn ? "Solution" : "راهکار درمان"}</Text>
                    </View>
                    <Text className="text-slate-800 dark:text-slate-100 text-sm leading-5">
                      {isEn ? result.solution : (result.solution_fa || result.solution)}
                    </Text>
                  </View>
                </View>
              </Card>
            </Motion.View>
          )}
        </AnimatePresence>
      </View>
    </ScreenWrapper>
  );
};

export default DiseaseCheckScreen;
