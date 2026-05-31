// src/utils/storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export const HAS_LAUNCHED_KEY = '@has_launched';
export const RECOMMENDER_ANSWERS_KEY = '@plant_recommender_answers';
export const READING_FONT_SIZE_KEY = '@reading_font_size';

export const getReadingFontSize = async (): Promise<number | null> => {
  try {
    const value = await AsyncStorage.getItem(READING_FONT_SIZE_KEY);
    return value ? parseInt(value, 10) : null;
  } catch {
    return null;
  }
};

export const saveReadingFontSize = async (size: number): Promise<void> => {
  try {
    await AsyncStorage.setItem(READING_FONT_SIZE_KEY, String(size));
  } catch (error) {
    console.error('Error saving reading font size:', error);
  }
};

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
