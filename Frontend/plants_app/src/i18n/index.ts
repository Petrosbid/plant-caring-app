import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import { I18nManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import en from './locales/en.json';
import fa from './locales/fa.json';

const APP_LANGUAGE_KEY = '@app_language';

const resources = {
  en: { translation: en },
  fa: { translation: fa },
};

export const initI18n = async () => {
  let initialLang = await AsyncStorage.getItem(APP_LANGUAGE_KEY);
  
  if (!initialLang) {
    const locales = Localization.getLocales();
    const languageCode = locales[0]?.languageCode ?? 'en';
    initialLang = resources.hasOwnProperty(languageCode) ? languageCode : 'en';
  }

  const isRTL = initialLang === 'fa';
  if (I18nManager.isRTL !== isRTL) {
    I18nManager.allowRTL(isRTL);
    I18nManager.forceRTL(isRTL);
    // After forceRTL, a reload is needed to apply changes.
    // This is handled by the caller or by the fact that we reload after saving.
  }

  return i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: initialLang as string,
      fallbackLng: 'en',
      compatibilityJSON: 'v4',
      interpolation: {
        escapeValue: false,
      },
    });
};

// Also provide a sync init with default for cases where we can't wait
// but ideally we wait in the root layout.
const locales = Localization.getLocales();
const defaultLang = locales[0]?.languageCode ?? 'en';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: resources.hasOwnProperty(defaultLang) ? defaultLang : 'en',
    fallbackLng: 'en',
    compatibilityJSON: 'v4',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
