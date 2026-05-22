// 📁 src/utils/storage.ts

import AsyncStorage from '@react-native-async-storage/async-storage';

// کلید مورد استفاده برای ذخیره وضعیت در AsyncStorage
const HAS_LAUNCHED_KEY = 'hasLaunched';

/**
 * بررسی می‌کند که آیا کاربر قبلاً اسلایدر معرف را دیده است یا خیر.
 * @returns {Promise<boolean>} - اگر قبلاً دیده باشد true و در غیر این صورت false برمی‌گرداند.
 */
export const checkFirstLaunch = async (): Promise<boolean> => {
  try {
    const hasLaunched = await AsyncStorage.getItem(HAS_LAUNCHED_KEY);
    // اگر مقدار ذخیره شده برابر با 'true' باشد یعنی قبلاً دیده است
    return hasLaunched === 'true';
  } catch (error) {
    console.error('خطا در بررسی اولین راه‌اندازی:', error);
    return false; // در صورت بروز خطا، فرض می‌کنیم کاربر جدید است و اسلایدر را نشان می‌دهیم
  }
};

export const getToken = async () => {
  return await AsyncStorage.getItem('access_token');
};

export const setToken = async (token: string) => {
  await AsyncStorage.setItem('access_token', token);
};

/**
 * بعد از دیده شدن اسلایدر معرف، وضعیت را در حافظه ذخیره می‌کند.
 * این تابع را در کامپوننت والد صدا بزنید تا دیگر اسلایدر نشان داده نشود.
 * @returns {Promise<void>}
 */
export const markFirstLaunchDone = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(HAS_LAUNCHED_KEY, 'true');
  } catch (error) {
    console.error('خطا در ذخیره وضعیت راه‌اندازی اول:', error);
  }
};