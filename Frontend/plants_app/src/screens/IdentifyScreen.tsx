import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as ImagePicker from 'expo-image-picker';
import { ScreenWrapper } from '../components/common/ScreenWrapper';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { plantService } from '../services/api';
import { Plant } from '../types';
import { Loader } from '../components/common/Loader';
import { Camera, Image as ImageIcon, X, CheckCircle2, Info } from 'lucide-react-native';
import { Motion, AnimatePresence } from '@legendapp/motion';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

const IdentifyScreen = () => {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const isEn = i18n.language === 'en';

  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Plant | null>(null);

  const pickImage = async (useCamera: boolean) => {
    const permissionResult = useCamera 
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert(
        isEn ? "Permission Required" : "اجازه دسترسی",
        isEn ? "You need to allow camera/gallery access to use this feature." : "برای استفاده از این ویژگی باید اجازه دسترسی به دوربین/گالری را بدهید."
      );
      return;
    }

    const result = useCamera
      ? await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.7,
        })
      : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.7,
        });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setResult(null);
    }
  };

  const handleIdentify = async () => {
    if (!image) return;
    setLoading(true);
    try {
      const data = await plantService.identifyPlant(image, i18n.language);
      setResult(data);
    } catch (err: any) {
      const errMsg = err?.message || (isEn ? "Could not identify plant. Try a clearer photo." : "شناسایی انجام نشد. عکس واضح‌تری بگیرید.");
      Alert.alert(isEn ? "Error" : "خطا", errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      <View className="px-2 pt-2">
        <Text className="text-3xl font-black text-slate-900 dark:text-white mb-2">
          {t('common.identify')}
        </Text>
        <Text className="text-slate-500 dark:text-slate-400 mb-8">
          {isEn ? "Snap or upload a photo to identify any plant" : "از یک گیاه عکس بگیرید یا آپلود کنید تا شناسایی شود"}
        </Text>

        {!image ? (
          <View className="items-center gap-6 mt-10">
            <View className="w-48 h-48 bg-slate-100 dark:bg-slate-800 rounded-full items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700">
              <Camera size={48} color="#94a3b8" />
            </View>
            
            <View className="w-full gap-4 px-4">
              <Button 
                variant="primary" 
                size="lg" 
                className="w-full"
                onPress={() => pickImage(true)}
              >
                <Camera size={20} color="white" />
                <Text className="ml-2 text-white">{isEn ? "Take a Photo" : "گرفتن عکس"}</Text>
              </Button>
              
              <Button 
                variant="secondary" 
                size="lg" 
                className="w-full"
                onPress={() => pickImage(false)}
              >
                <ImageIcon size={20} color="#64748b" />
                <Text className="ml-2 text-slate-600 dark:text-slate-300">{isEn ? "Choose from Gallery" : "انتخاب از گالری"}</Text>
              </Button>
            </View>
          </View>
        ) : (
          <View className="items-center">
            <View className="relative w-full aspect-square rounded-3xl overflow-hidden shadow-xl">
              <Image source={{ uri: image }} className="w-full h-full" />
              <TouchableOpacity 
                onPress={() => setImage(null)}
                className="absolute top-4 right-4 bg-black/50 p-2 rounded-full"
              >
                <X size={20} color="white" />
              </TouchableOpacity>
            </View>

            <View className="w-full mt-8 gap-4 px-2">
              <Button 
                variant="primary" 
                size="lg" 
                isLoading={loading}
                onPress={handleIdentify}
              >
                {isEn ? "Identify Now" : "شروع شناسایی"}
              </Button>
              <Button 
                variant="ghost" 
                onPress={() => setImage(null)}
                disabled={loading}
              >
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
              className="mt-10"
            >
              <Card 
                title={isEn ? result.english_name || result.farsi_name : result.farsi_name}
                subtitle={result.scientific_name || ""}
                headerIcon={<CheckCircle2 size={24} color="#16a34a" />}
              >
                <Text className="text-slate-600 dark:text-slate-300 mb-6 text-justify leading-5">
                  {isEn ? result.description_en || result.description : result.description}
                </Text>
                
                <Button 
                  variant="outline" 
                  onPress={() => navigation.navigate('PlantDetails', { id: result.id.toString() })}
                >
                  <Info size={18} color="#16a34a" />
                  <Text className="ml-2 text-brand-600">{isEn ? "View Detailed Care Guide" : "مشاهده جزئیات مراقبت"}</Text>
                </Button>
              </Card>
            </Motion.View>
          )}
        </AnimatePresence>
      </View>
    </ScreenWrapper>
  );
};

export default IdentifyScreen;

