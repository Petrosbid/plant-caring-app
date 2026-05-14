export const storageKeys = {
  recommenderAnswers: 'plantRecommenderAnswers:v1',
  accessToken: 'access_token', 
  refreshToken: 'refresh_token',
  user: 'user:v1',
  theme: 'theme:v1',
  language: 'language:v1',
};

export function getStorageItem<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

export function setStorageItem(key: string, value: any) {
  localStorage.setItem(key, JSON.stringify(value));
}