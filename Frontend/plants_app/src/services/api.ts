// 📁 src/services/api.ts
import type { Plant, Disease, Reminder, User, PlantComment } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ========== تنظیمات آدرس پایه ==========
// در شبیه‌ساز اندروید از 10.0.2.2 استفاده کنید
// در دستگاه فیزیکی، IP واقعی کامپیوتر خود را بنویسید
const BASE_IP = '192.168.1.100'; // ← این را به IP کامپیوتر خود تغییر دهید
const API_BASE_URL = `http://${BASE_IP}:8000/api`;
const BLOG_API_BASE_URL = `http://${BASE_IP}:8000/api/blog`;

// ========== توابع کمکی برای ذخیره‌سازی AsyncStorage ==========
const getToken = async (): Promise<string | null> => {
  return await AsyncStorage.getItem('access_token');
};

const getRefreshToken = async (): Promise<string | null> => {
  return await AsyncStorage.getItem('refresh_token');
};

const setTokens = async (access: string, refresh: string): Promise<void> => {
  await AsyncStorage.setItem('access_token', access);
  await AsyncStorage.setItem('refresh_token', refresh);
};

const clearTokens = async (): Promise<void> => {
  await AsyncStorage.removeItem('access_token');
  await AsyncStorage.removeItem('refresh_token');
};

// ========== هدرهای احراز هویت (ناهمگام) ==========
const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const token = await getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const getFileUploadHeaders = async (): Promise<Record<string, string>> => {
  const token = await getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ========== سرویس احراز هویت ==========
export const authService = {
  register: async (userData: {
    username: string;
    email: string;
    password: string;
    first_name?: string;
    last_name?: string;
  }): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/auth/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Registration failed');
    }
    return response.json();
  },

  login: async (credentials: {
    username: string;
    password: string;
  }): Promise<{ access: string; refresh: string }> => {
    const response = await fetch(`${API_BASE_URL}/auth/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Login failed');
    }
    const data = await response.json();
    await setTokens(data.access, data.refresh);
    return data;
  },

  logout: async (): Promise<void> => {
    const refresh = await getRefreshToken();
    if (!refresh) return;
    const response = await fetch(`${API_BASE_URL}/auth/logout/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Logout failed');
    }
    await clearTokens();
  },

  getProfile: async (): Promise<User> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/auth/profile/`, {
      method: 'GET',
      headers,
    });
    if (!response.ok) {
      throw new Error('Failed to fetch profile');
    }
    return response.json();
  },

  updateProfile: async (userData: Partial<User>): Promise<User> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/auth/profile/`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(userData),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to update profile');
    }
    return response.json();
  },

  updateProfilePicture: async (formData: FormData): Promise<User> => {
    const headers = await getFileUploadHeaders();
    const response = await fetch(`${API_BASE_URL}/auth/profile/picture/`, {
      method: 'PUT',
      headers,
      body: formData,
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to update profile picture');
    }
    return response.json();
  },

  deleteAccount: async (): Promise<void> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/auth/profile/delete/`, {
      method: 'DELETE',
      headers,
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to delete account');
    }
    await clearTokens();
  },
};

// ========== سرویس گیاهان ==========
export const plantService = {
  getAllPlants: async (): Promise<Plant[]> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/plants/`, {
      method: 'GET',
      headers,
    });
    if (!response.ok) throw new Error('Failed to fetch plants');
    return response.json();
  },

  getPlantById: async (id: number): Promise<Plant> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/plants/${id}/`, {
      method: 'GET',
      headers,
    });
    if (!response.ok) throw new Error('Failed to fetch plant');
    return response.json();
  },

  identifyPlant: async (imageFile: File): Promise<Plant> => {
    const formData = new FormData();
    formData.append('image', imageFile);
    const headers = await getFileUploadHeaders();
    const response = await fetch(`${API_BASE_URL}/plants/identify/`, {
      method: 'POST',
      headers,
      body: formData,
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Plant identification failed');
    }
    return response.json();
  },

  searchPlants: async (query: string): Promise<Plant[]> => {
    if (!query.trim()) return [];
    const headers = await getAuthHeaders();
    const response = await fetch(
      `${API_BASE_URL}/plants/search/?search=${encodeURIComponent(query)}`,
      {
        method: 'GET',
        headers,
      }
    );
    if (!response.ok) throw new Error('Failed to search plants');
    return response.json();
  },
};

// ========== سرویس بیماری‌ها ==========
export const diseaseService = {
  getAllDiseases: async (): Promise<Disease[]> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/diseases/`, {
      method: 'GET',
      headers,
    });
    if (!response.ok) throw new Error('Failed to fetch diseases');
    return response.json();
  },

  getDiseaseById: async (id: number): Promise<Disease> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/diseases/${id}/`, {
      method: 'GET',
      headers,
    });
    if (!response.ok) throw new Error('Failed to fetch disease');
    return response.json();
  },

  detectDisease: async (imageFile: File): Promise<Disease> => {
    const formData = new FormData();
    formData.append('image', imageFile);
    const headers = await getFileUploadHeaders();
    const response = await fetch(`${API_BASE_URL}/diseases/diagnose/`, {
      method: 'POST',
      headers,
      body: formData,
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Disease diagnosis failed');
    }
    return response.json();
  },

  searchDiseases: async (query: string): Promise<Disease[]> => {
    const headers = await getAuthHeaders();
    const response = await fetch(
      `${API_BASE_URL}/diseases/search/?search=${encodeURIComponent(query)}`,
      {
        method: 'GET',
        headers,
      }
    );
    if (!response.ok) throw new Error('Failed to search diseases');
    return response.json();
  },
};

// ========== سرویس باغچه ==========
export const gardenService = {
  getUserPlants: async (): Promise<any[]> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/my-garden/`, {
      method: 'GET',
      headers,
    });
    if (!response.ok) throw new Error('Failed to fetch user plants');
    return response.json();
  },

  addUserPlant: async (plantData: { plant: number; nickname?: string; notes?: string }): Promise<any> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/my-garden/`, {
      method: 'POST',
      headers,
      body: JSON.stringify(plantData),
    });
    if (!response.ok) throw new Error('Failed to add plant to garden');
    return response.json();
  },

  updateUserPlant: async (id: number, plantData: Partial<any>): Promise<any> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/my-garden/${id}/`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(plantData),
    });
    if (!response.ok) throw new Error('Failed to update plant');
    return response.json();
  },

  removeUserPlant: async (id: number): Promise<void> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/my-garden/${id}/`, {
      method: 'DELETE',
      headers,
    });
    if (!response.ok) throw new Error('Failed to remove plant from garden');
  },

  waterPlant: async (id: number): Promise<any> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/my-garden/${id}/water_plant/`, {
      method: 'POST',
      headers,
    });
    if (!response.ok) throw new Error('Failed to water plant');
    return response.json();
  },

  fertilizePlant: async (id: number): Promise<any> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/my-garden/${id}/fertilize_plant/`, {
      method: 'POST',
      headers,
    });
    if (!response.ok) throw new Error('Failed to fertilize plant');
    return response.json();
  },

  prunePlant: async (id: number): Promise<any> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/my-garden/${id}/prune_plant/`, {
      method: 'POST',
      headers,
    });
    if (!response.ok) throw new Error('Failed to prune plant');
    return response.json();
  },
};

// ========== سرویس یادآوری ==========
export const reminderService = {
  getReminders: async (): Promise<Reminder[]> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/my-garden/reminders/`, {
      method: 'GET',
      headers,
    });
    if (!response.ok) throw new Error('Failed to fetch reminders');
    return response.json();
  },

  getUpcomingReminders: async (): Promise<Reminder[]> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/my-garden/reminders/upcoming/`, {
      method: 'GET',
      headers,
    });
    if (!response.ok) throw new Error('Failed to fetch upcoming reminders');
    return response.json();
  },

  getOverdueReminders: async (): Promise<Reminder[]> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/my-garden/reminders/overdue/`, {
      method: 'GET',
      headers,
    });
    if (!response.ok) throw new Error('Failed to fetch overdue reminders');
    return response.json();
  },

  createReminder: async (reminderData: Omit<Reminder, 'id'>): Promise<Reminder> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/my-garden/reminders/`, {
      method: 'POST',
      headers,
      body: JSON.stringify(reminderData),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to create reminder');
    }
    return response.json();
  },

  updateReminder: async (id: number, reminderData: Partial<Reminder>): Promise<Reminder> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/my-garden/reminders/${id}/`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(reminderData),
    });
    if (!response.ok) throw new Error('Failed to update reminder');
    return response.json();
  },

  deleteReminder: async (id: number): Promise<void> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/my-garden/reminders/${id}/`, {
      method: 'DELETE',
      headers,
    });
    if (!response.ok) throw new Error('Failed to delete reminder');
  },

  markCompleted: async (id: number): Promise<void> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/my-garden/reminders/${id}/mark_completed/`, {
      method: 'POST',
      headers,
    });
    if (!response.ok) throw new Error('Failed to mark reminder as completed');
  },
};

// ========== سرویس وبلاگ (با fetch، بدون axios) ==========
export const blogService = {
  getAllPosts: async (params?: { tags?: string; limit?: number }): Promise<any> => {
    const token = await getToken();
    const url = new URL(`${BLOG_API_BASE_URL}/posts/`);
    if (params?.tags) url.searchParams.append('tags', params.tags);
    if (params?.limit) url.searchParams.append('limit', String(params.limit));
    
    const response = await fetch(url.toString(), {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) throw new Error('Failed to fetch posts');
    return response.json();
  },

  getPostBySlug: async (slug: string): Promise<any> => {
    const token = await getToken();
    const response = await fetch(`${BLOG_API_BASE_URL}/posts/${slug}/`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) throw new Error('Failed to fetch post');
    return response.json();
  },

  likePost: async (slug: string): Promise<any> => {
    const token = await getToken();
    const response = await fetch(`${BLOG_API_BASE_URL}/posts/${slug}/like/`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) throw new Error('Failed to like post');
    return response.json();
  },

  dislikePost: async (slug: string): Promise<any> => {
    const token = await getToken();
    const response = await fetch(`${BLOG_API_BASE_URL}/posts/${slug}/dislike/`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) throw new Error('Failed to dislike post');
    return response.json();
  },

  getComments: async (slug: string): Promise<any> => {
    const token = await getToken();
    const response = await fetch(`${BLOG_API_BASE_URL}/posts/${slug}/comments/`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) throw new Error('Failed to fetch comments');
    return response.json();
  },

  addComment: async (slug: string, commentData: { content: string; parent?: number }): Promise<any> => {
    const token = await getToken();
    const response = await fetch(`${BLOG_API_BASE_URL}/posts/${slug}/comments/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(commentData),
    });
    if (!response.ok) throw new Error('Failed to add comment');
    return response.json();
  },

  voteComment: async (commentId: number, voteType: 1 | -1): Promise<any> => {
    const token = await getToken();
    const response = await fetch(`${BLOG_API_BASE_URL}/comments/${commentId}/vote/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ vote_type: voteType }),
    });
    if (!response.ok) throw new Error('Failed to vote comment');
    return response.json();
  },

  deleteComment: async (commentId: number): Promise<void> => {
    const token = await getToken();
    const response = await fetch(`${BLOG_API_BASE_URL}/comments/${commentId}/`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) throw new Error('Failed to delete comment');
  },

  updateComment: async (commentId: number, content: string): Promise<any> => {
    const token = await getToken();
    const response = await fetch(`${BLOG_API_BASE_URL}/comments/${commentId}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ content }),
    });
    if (!response.ok) throw new Error('Failed to update comment');
    return response.json();
  },
};

searchPlants: async (query: string, filters?: { is_toxic?: boolean; care_difficulty?: string; light_requirement?: string }): Promise<Plant[]> => {
  const params = new URLSearchParams();
  if (query) params.append('search', query);
  if (filters?.is_toxic !== undefined) params.append('is_toxic', String(filters.is_toxic));
  if (filters?.care_difficulty) params.append('care_difficulty', filters.care_difficulty);
  if (filters?.light_requirement) params.append('light_requirement', filters.light_requirement);
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/plants/search/?${params.toString()}`, { headers });
  if (!response.ok) throw new Error('Failed to search plants');
  return response.json();
}


export const commentService = {
  getComments: async (plantId: number): Promise<PlantComment[]> => {
    const response = await fetch(`${API_BASE_URL}/plants/${plantId}/comments/`, {
      headers: await getAuthHeaders() as Record<string, string>,
    });
    if (!response.ok) throw new Error('Failed to fetch comments');
    return response.json();
  },
  addComment: async (plantId: number, content: string, parentId?: number): Promise<PlantComment> => {
    const response = await fetch(`${API_BASE_URL}/plants/${plantId}/comments/`, {
      method: 'POST',
      headers: await getAuthHeaders() as Record<string, string>,
      body: JSON.stringify({ content, parent: parentId || null }),
    });
    if (!response.ok) throw new Error('Failed to add comment');
    return response.json();
  },
  updateComment: async (plantId: number, commentId: number, content: string): Promise<PlantComment> => {
    const response = await fetch(`${API_BASE_URL}/plants/${plantId}/comments/${commentId}/`, {
      method: 'PUT',
      headers: await getAuthHeaders() as Record<string, string>,
      body: JSON.stringify({ content }),
    });
    if (!response.ok) throw new Error('Failed to update comment');
    return response.json();
  },
  deleteComment: async (plantId: number, commentId: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/plants/${plantId}/comments/${commentId}/`, {
      method: 'DELETE',
      headers: await getAuthHeaders() as Record<string, string>,
    });
    if (!response.ok) throw new Error('Failed to delete comment');
  },
};

export const favouriteService = {
  // Get user's favourite plants
  getFavourites: async (): Promise<Plant[]> => {
    const response = await fetch(`${API_BASE_URL}/favourites/`, {
      method: 'GET',
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch favourites');
    return response.json();
  },

  // Add a plant to favourites
  addFavourite: async (plantId: number): Promise<Plant> => {
    const response = await fetch(`${API_BASE_URL}/favourites/`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify({ plant: plantId }),
    });
    if (!response.ok) throw new Error('Failed to add favourite');
    return response.json();
  },

  // Remove from favourites
  removeFavourite: async (plantId: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/favourites/remove/`, {
      method: 'POST',   // مطابق view از POST یا DELETE با بدنه استفاده می‌کنیم
      headers: await getAuthHeaders(),
      body: JSON.stringify({ plant: plantId }),
    });
    if (!response.ok) throw new Error('Failed to remove favourite');
  },
};