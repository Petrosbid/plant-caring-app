// src/utils/tokenStorage.ts
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

/**
 * We use SecureStore on iOS/Android for better security.
 * On Web, SecureStore falls back to localStorage (not ideal but better than nothing).
 */

export const saveTokens = async (access: string, refresh: string) => {
  try {
    if (Platform.OS !== 'web') {
      await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, access);
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refresh);
    } else {
      await AsyncStorage.setItem(ACCESS_TOKEN_KEY, access);
      await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refresh);
    }
  } catch (error) {
    console.error('Error saving tokens:', error);
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  try {
    if (Platform.OS !== 'web') {
      return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
    }
    return await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
  } catch (error) {
    console.error('Error getting access token:', error);
    return null;
  }
};

export const getRefreshToken = async (): Promise<string | null> => {
  try {
    if (Platform.OS !== 'web') {
      return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    }
    return await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('Error getting refresh token:', error);
    return null;
  }
};

export const clearTokens = async () => {
  try {
    if (Platform.OS !== 'web') {
      await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    } else {
      await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
      await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  } catch (error) {
    console.error('Error clearing tokens:', error);
  }
};
