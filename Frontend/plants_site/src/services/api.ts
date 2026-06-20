// API service for plant identification app
import type { Plant, Disease, Reminder, User, PlantComment } from '../types';
import axios from 'axios';

// Base API URL - points to your backend
export const API_BASE_URL = 'http://django-3b13q0.chbkn.run/api';
const BLOG_API_BASE_URL = 'http://django-3b13q0.chbkn.run/api/blog';

// Create axios instance for blog API with error handling
const blogApi = axios.create({
  baseURL: BLOG_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Add auth token to requests
blogApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Helper to get auth headers for fetch API
const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// Helper for file upload headers
const getFileUploadHeaders = (): HeadersInit => {
  const token = localStorage.getItem('access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ==============================
// Authentication Service
// ==============================
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
    return response.json();
  },

  logout: async (refreshToken: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/auth/logout/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: refreshToken }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Logout failed');
    }
  },

  getProfile: async (): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/auth/profile/`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch profile');
    return response.json();
  },

  updateProfile: async (userData: Partial<User>): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/auth/profile/`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to update profile');
    }
    return response.json();
  },

  updateProfilePicture: async (formData: FormData): Promise<User> => {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_BASE_URL}/auth/profile/picture/`, {
      method: 'PUT',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to update profile picture');
    }
    return response.json();
  },

  deleteAccount: async (): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/auth/profile/delete/`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to delete account');
    }
  },

  // ---------- OTP for Login ----------
  requestOtp: async (phoneNumber: string) => {
    const response = await axios.post(`${API_BASE_URL}/auth/api/otp/request/`, {
      phone_number: phoneNumber,
    });
    return response.data;
  },

  verifyOtp: async (phoneNumber: string, code: string) => {
    const response = await axios.post(`${API_BASE_URL}/auth/api/otp/verify/`, {
      phone_number: phoneNumber,
      code,
    });
    if (response.data.access && response.data.refresh) {
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
    }
    return response.data;
  },

  // ---------- OTP for Registration ----------
  registerRequestOtp: async (
    method: 'phone' | 'email',
    data: {
      phone?: string;
      email?: string;
      first_name?: string;
      last_name?: string;
      username: string;
    }
  ) => {
    const payload = { method, ...data };
    const response = await axios.post(
      `${API_BASE_URL}/auth/api/register/otp/request/`,
      payload
    );
    return response.data;
  },

  registerVerifyOtp: async (identifier: string, code: string) => {
    const response = await axios.post(
      `${API_BASE_URL}/auth/api/register/otp/verify/`,
      { identifier, code }
    );
    if (response.data.access && response.data.refresh) {
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },
};

// ==============================
// Plant Service
// ==============================
export const plantService = {
  searchPlants: async (
    query: string,
    filters?: {
      is_toxic?: boolean;
      care_difficulty?: string;
      light_requirement?: string;
    }
  ): Promise<Plant[]> => {
    const params = new URLSearchParams();
    if (query) params.append('search', query);
    if (filters?.is_toxic !== undefined)
      params.append('is_toxic', String(filters.is_toxic));
    if (filters?.care_difficulty)
      params.append('care_difficulty', filters.care_difficulty);
    if (filters?.light_requirement)
      params.append('light_requirement', filters.light_requirement);
    const headers = getAuthHeaders();
    const response = await fetch(
      `${API_BASE_URL}/plants/search/?${params.toString()}`,
      { headers }
    );
    if (!response.ok) throw new Error('Failed to search plants');
    return response.json();
  },

  getRelatedPlants: async (id: number): Promise<Plant[]> => {
    const response = await fetch(`${API_BASE_URL}/plants/${id}/related/`);
    if (!response.ok) throw new Error('Failed to fetch related plants');
    return response.json();
  },

  getPlants: async (params?: {
    page?: number;
    page_size?: number;
    search?: string;
    ordering?: string;
    is_toxic?: boolean;
    care_difficulty?: string;
    watering_frequency?: string;
    fertilizer_schedule?: string;
    light_requirements?: string;
    humidity_level?: string;
    temperature_range?: string;
    soil_type?: string;
    pruning_info?: string;
    propagation_methods?: string;
  }): Promise<{ results: Plant[]; count: number; next: string | null }> => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '')
          query.append(key, String(val));
      });
    }
    const res = await fetch(`${API_BASE_URL}/plants/?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch plants');
    return res.json();
  },

  getAllPlants: async (): Promise<Plant[]> => {
    const response = await fetch(`${API_BASE_URL}/plants/`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch plants');
    return response.json();
  },

  getPlantById: async (id: number): Promise<Plant> => {
    const response = await fetch(`${API_BASE_URL}/plants/${id}/`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch plant');
    return response.json();
  },

  identifyPlant: async (imageFile: File): Promise<Plant> => {
    const formData = new FormData();
    formData.append('image', imageFile);
    const response = await fetch(`${API_BASE_URL}/plants/identify/`, {
      method: 'POST',
      headers: getFileUploadHeaders() as HeadersInit,
      body: formData,
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Plant identification failed');
    }
    return response.json();
  },

  getFavoritePlants: async (limit = 10): Promise<Plant[]> => {
    const data = await plantService.getPlants({
      ordering: '-favourite_count',
      page_size: limit,
    });
    return data.results;
  },
};

// ==============================
// Disease Service
// ==============================
export const diseaseService = {
  getAllDiseases: async (): Promise<Disease[]> => {
    const response = await fetch(`${API_BASE_URL}/diseases/`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch diseases');
    return response.json();
  },

  getDiseaseById: async (id: number): Promise<Disease> => {
    const response = await fetch(`${API_BASE_URL}/diseases/${id}/`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch disease');
    return response.json();
  },

  detectDisease: async (imageFile: File): Promise<Disease> => {
    const formData = new FormData();
    formData.append('image', imageFile);
    const response = await fetch(`${API_BASE_URL}/diseases/diagnose/`, {
      method: 'POST',
      headers: getFileUploadHeaders() as HeadersInit,
      body: formData,
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Disease diagnosis failed');
    }
    return response.json();
  },

  searchDiseases: async (query: string): Promise<Disease[]> => {
    const response = await fetch(
      `${API_BASE_URL}/diseases/search/?search=${encodeURIComponent(query)}`,
      { headers: getAuthHeaders() }
    );
    if (!response.ok) throw new Error('Failed to search diseases');
    return response.json();
  },

  getDiseases: async (params?: {
    ordering?: string;
    page_size?: number;
    search?: string;
  }): Promise<Disease[]> => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '')
          query.append(key, String(val));
      });
    }
    const res = await fetch(`${API_BASE_URL}/diseases/?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch diseases');
    return res.json();
  },

  getMostViewedDiseases: async (limit = 10): Promise<Disease[]> => {
    const data = await diseaseService.getDiseasesPaginated({
      ordering: '-view_count',
      page_size: limit,
    });
    return data.results;
    
  },

  getDiseasesPaginated: async (params?: {
    page?: number;
    page_size?: number;
    search?: string;
    ordering?: string;
    severity_level?: string;
    spread_rate?: string;
  }): Promise<{ results: Disease[]; count: number; next: string | null }> => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '')
          query.append(key, String(val));
      });
    }
    const res = await fetch(`${API_BASE_URL}/diseases/?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch diseases');
    return res.json();
  },

  getDiseaseFromLLM: async (diseaseName: string): Promise<Disease> => {
    const response = await fetch(`${API_BASE_URL}/diseases/llm/?name=${encodeURIComponent(diseaseName)}`);
    if (!response.ok) throw new Error('LLM fetch failed');
    return response.json();
  },
};

// ==============================
// Garden (User Plants) Service
// ==============================
export const gardenService = {
  getUserPlants: async (): Promise<any[]> => {
    const response = await fetch(`${API_BASE_URL}/my-garden/`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch user plants');
    return response.json();
  },

  addUserPlant: async (plantData: {
    plant: number;
    nickname?: string;
    notes?: string;
  }): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/my-garden/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(plantData),
    });
    if (!response.ok) throw new Error('Failed to add plant to garden');
    return response.json();
  },

  updateUserPlant: async (id: number, plantData: Partial<any>): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/my-garden/${id}/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(plantData),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.detail || JSON.stringify(errorData) || 'Failed to update plant'
      );
    }
    return response.json();
  },

  removeUserPlant: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/my-garden/${id}/`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to remove plant from garden');
  },

  addGrowthRecord: async (data: {
    user_plant: number;
    height?: number;
    width?: number;
    unit?: string;
    notes?: string;
  }): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/my-garden/growth/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to add growth record');
    return response.json();
  },

  waterPlant: async (id: number): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/my-garden/${id}/water_plant/`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to water plant');
    return response.json();
  },

  fertilizePlant: async (id: number): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/my-garden/${id}/fertilize_plant/`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fertilize plant');
    return response.json();
  },

  prunePlant: async (id: number): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/my-garden/${id}/prune_plant/`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to prune plant');
    return response.json();
  },
};

// ==============================
// Reminder Service
// ==============================
export const reminderService = {
  getReminders: async (): Promise<Reminder[]> => {
    const response = await fetch(`${API_BASE_URL}/my-garden/reminders/`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch reminders');
    return response.json();
  },

  getUpcomingReminders: async (): Promise<Reminder[]> => {
    const response = await fetch(`${API_BASE_URL}/my-garden/reminders/upcoming/`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch upcoming reminders');
    return response.json();
  },

  getOverdueReminders: async (): Promise<Reminder[]> => {
    const response = await fetch(`${API_BASE_URL}/my-garden/reminders/overdue/`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch overdue reminders');
    return response.json();
  },

  createReminder: async (reminderData: Omit<Reminder, 'id'>): Promise<Reminder> => {
    const response = await fetch(`${API_BASE_URL}/my-garden/reminders/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(reminderData),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to create reminder');
    }
    return response.json();
  },

  updateReminder: async (id: number, reminderData: Partial<Reminder>): Promise<Reminder> => {
    const response = await fetch(`${API_BASE_URL}/my-garden/reminders/${id}/`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(reminderData),
    });
    if (!response.ok) throw new Error('Failed to update reminder');
    return response.json();
  },

  deleteReminder: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/my-garden/reminders/${id}/`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete reminder');
  },

  markCompleted: async (id: number): Promise<void> => {
    const response = await fetch(
      `${API_BASE_URL}/my-garden/reminders/${id}/mark_completed/`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
      }
    );
    if (!response.ok) throw new Error('Failed to mark reminder as completed');
  },
};

// ==============================
// Blog Service
// ==============================
export const blogService = {
  getAllPosts: async (params?: { tags?: string; limit?: number }): Promise<any> => {
    const response = await blogApi.get('/posts/', { params });
    return response.data;
  },

  getPostBySlug: async (slug: string): Promise<any> => {
    const response = await blogApi.get(`/posts/${slug}/`);
    return response.data;
  },

  likePost: async (slug: string): Promise<any> => {
    const response = await blogApi.post(`/posts/${slug}/like/`);
    return response.data;
  },

  dislikePost: async (slug: string): Promise<any> => {
    const response = await blogApi.post(`/posts/${slug}/dislike/`);
    return response.data;
  },

  getComments: async (slug: string): Promise<any> => {
    const response = await blogApi.get(`/posts/${slug}/comments/`);
    return response.data;
  },

  addComment: async (slug: string, commentData: { content: string; parent?: number }): Promise<any> => {
    const response = await blogApi.post(`/posts/${slug}/comments/`, commentData);
    return response.data;
  },

  voteComment: async (commentId: number, voteType: 1 | -1): Promise<any> => {
    const response = await blogApi.post(`/comments/${commentId}/vote/`, { vote_type: voteType });
    return response.data;
  },

  deleteComment: async (commentId: number): Promise<void> => {
    await blogApi.delete(`/comments/${commentId}/`);
  },

  updateComment: async (commentId: number, content: string): Promise<any> => {
    const response = await blogApi.put(`/comments/${commentId}/`, { content });
    return response.data;
  },

  getPopularPosts: async (limit = 10): Promise<any[]> => {
    const response = await blogApi.get('/posts/', {
      params: { ordering: '-likes_count', page_size: limit },
    });
    return response.data.results || response.data;
  },

  getMostViewedPosts: async (limit = 10): Promise<any[]> => {
    const response = await blogApi.get('/posts/', {
      params: { ordering: '-view_count', page_size: limit },
    });
    return response.data.results || response.data;
  },
};

// ==============================
// Comment Service (for Plants)
// ==============================
export const commentService = {
  getComments: async (plantId: number): Promise<PlantComment[]> => {
    const response = await fetch(`${API_BASE_URL}/plants/${plantId}/comments/`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch comments');
    return response.json();
  },

  addComment: async (plantId: number, content: string, parentId?: number): Promise<PlantComment> => {
    const response = await fetch(`${API_BASE_URL}/plants/${plantId}/comments/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ content, parent: parentId || null }),
    });
    if (!response.ok) throw new Error('Failed to add comment');
    return response.json();
  },

  updateComment: async (plantId: number, commentId: number, content: string): Promise<PlantComment> => {
    const response = await fetch(`${API_BASE_URL}/plants/${plantId}/comments/${commentId}/`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ content }),
    });
    if (!response.ok) throw new Error('Failed to update comment');
    return response.json();
  },

  deleteComment: async (plantId: number, commentId: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/plants/${plantId}/comments/${commentId}/`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete comment');
  },
};

// ==============================
// Favourite Service
// ==============================
export const favouriteService = {
  getFavourites: async (): Promise<Plant[]> => {
    const response = await fetch(`${API_BASE_URL}/favourites/`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch favourites');
    return response.json();
  },

  addFavourite: async (plantId: number): Promise<Plant> => {
    const response = await fetch(`${API_BASE_URL}/favourite/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ plant: plantId }),
    });
    if (!response.ok) throw new Error('Failed to add favourite');
    return response.json();
  },

  removeFavourite: async (plantId: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/favourite/remove/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ plant: plantId }),
    });
    if (!response.ok) throw new Error('Failed to remove favourite');
  },
};


// ==============================
//  Disease Service
// ==============================
export const diseaseCommentService = {
  getComments: async (diseaseId: number): Promise<any[]> => {
    const response = await fetch(`${API_BASE_URL}/diseases/${diseaseId}/comments/`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch comments');
    return response.json();
  },

  addComment: async (diseaseId: number, content: string, parentId?: number): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/diseases/${diseaseId}/comments/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ content, parent: parentId || null }),
    });
    if (!response.ok) throw new Error('Failed to add comment');
    return response.json();
  },

  updateComment: async (diseaseId: number, commentId: number, content: string): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/diseases/${diseaseId}/comments/${commentId}/`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ content }),
    });
    if (!response.ok) throw new Error('Failed to update comment');
    return response.json();
  },

  deleteComment: async (diseaseId: number, commentId: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/diseases/${diseaseId}/comments/${commentId}/`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete comment');
  },
};