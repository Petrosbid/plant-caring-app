import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import { I18nManager } from 'react-native';
import en from './locales/en.json';
import fa from './locales/fa.json';

const resources = {
  en: { translation: en },
  fa: { translation: fa },
};

// Handle RTL force-reloading if needed
const handleRTL = (lang: string) => {
  const isRTL = lang === 'fa';
  if (I18nManager.isRTL !== isRTL) {
    I18nManager.allowRTL(isRTL);
    I18nManager.forceRTL(isRTL);
    // On real apps, you might need to reload the app here
  }
};

const getLanguage = () => {
  const locales = Localization.getLocales();
  const languageCode = locales[0]?.languageCode ?? 'en';
  const initialLang = resources.hasOwnProperty(languageCode) ? languageCode : 'en';
  handleRTL(initialLang);
  return initialLang;
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getLanguage(),
    fallbackLng: 'en',
    compatibilityJSON: 'v4',
    interpolation: {
      escapeValue: false,
    },
  });

i18n.on('languageChanged', (lang) => {
  handleRTL(lang);
});

export default i18n;
