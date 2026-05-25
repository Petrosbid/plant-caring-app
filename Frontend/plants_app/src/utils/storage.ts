// src/utils/storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export const HAS_LAUNCHED_KEY = '@has_launched';

export const checkFirstLaunch = async (): Promise<boolean> => {
  try {
    const hasLaunched = await AsyncStorage.getItem(HAS_LAUNCHED_KEY);
    return hasLaunched === 'true';
  } catch (error) {
    console.error('Error checking first launch:', error);
    return false;
  }
};

export const markFirstLaunchDone = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(HAS_LAUNCHED_KEY, 'true');
  } catch (error) {
    console.error('Error marking first launch done:', error);
  }
};

export const clearAllData = async (): Promise<void> => {
  try {
    await AsyncStorage.clear();
  } catch (error) {
    console.error('Error clearing data:', error);
  }
};
