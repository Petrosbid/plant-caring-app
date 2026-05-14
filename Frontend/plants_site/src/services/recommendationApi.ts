// src/services/recommendationApi.ts
import { API_BASE_URL } from './api.ts';

export interface RecommendationRequest {
  language: 'en' | 'fa';
  answers: Record<string, string | string[] | boolean>;
  additional_notes: string;
}

export interface RecommendationResponse {
  plant_id: number;
  plant_name: string;
  scientific_name: string;
  description: string;
  primary_image: string | null;
  reason: string;
}

export async function sendRecommendationRequest(
  data: RecommendationRequest
): Promise<RecommendationResponse> {
  const token = localStorage.getItem('access_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }


  const response = await fetch(`${API_BASE_URL}/plants/recommend-plant/`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Recommendation failed');
  return response.json();

  // MOCK RESPONSE (remove after backend is ready)
  await new Promise(resolve => setTimeout(resolve, 1500));
  return {
    plant_id: 1,
    plant_name: data.language === 'en' ? 'Snake Plant' : 'سانسوریا',
    scientific_name: 'Dracaena trifasciata',
    description: data.language === 'en'
      ? 'The Snake Plant is one of the most resilient houseplants. It thrives on neglect, tolerates low light, and purifies air.'
      : 'سانسوریا یکی از مقاوم‌ترین گیاهان آپارتمانی است. به بی‌توجهی مقاوم است، نور کم را تحمل می‌کند و هوا را تصفیه می‌کند.',
    primary_image: null,
    reason: data.language === 'en'
      ? 'Based on your answers (low light, forgetful watering, no pets), this low-maintenance plant is perfect for you.'
      : 'بر اساس پاسخ‌های شما (نور کم، فراموشکاری در آبیاری، بدون حیوان خانگی)، این گیاه کم‌توقع برای شما عالی است.',
  };
}