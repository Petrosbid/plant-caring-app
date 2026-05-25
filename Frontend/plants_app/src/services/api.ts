// src/services/api.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Disease, Plant, Reminder, User, UserPlant } from "../types";

export const API_BASE_URL = "https://spending-bubble-smooth.ngrok-free.dev/api";
const BLOG_API_BASE_URL =
  "https://spending-bubble-smooth.ngrok-free.dev/api/blog";

const getToken = async () => await AsyncStorage.getItem("access_token");
const getRefreshToken = async () => await AsyncStorage.getItem("refresh_token");

const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const token = await getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const getFileUploadHeaders = async (): Promise<Record<string, string>> => {
  const token = await getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ==============================
// Authentication Service
// ==============================
export const authService = {
  register: async (userData: any): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/auth/register/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Registration failed");
    }
    return response.json();
  },

  login: async (
    credentials: any,
  ): Promise<{ access: string; refresh: string }> => {
    const response = await fetch(`${API_BASE_URL}/auth/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Login failed");
    }
    const data = await response.json();
    await AsyncStorage.setItem("access_token", data.access);
    await AsyncStorage.setItem("refresh_token", data.refresh);
    return data;
  },

  logout: async (): Promise<void> => {
    const refresh = await getRefreshToken();
    if (refresh) {
      await fetch(`${API_BASE_URL}/auth/logout/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh }),
      });
    }
    await AsyncStorage.removeItem("access_token");
    await AsyncStorage.removeItem("refresh_token");
    await AsyncStorage.removeItem("user");
  },

  getProfile: async (): Promise<User> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/auth/profile/`, {
      method: "GET",
      headers,
    });
    if (!response.ok) throw new Error("Failed to fetch profile");
    return response.json();
  },

  updateProfile: async (userData: Partial<User>): Promise<User> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/auth/profile/`, {
      method: "PUT",
      headers,
      body: JSON.stringify(userData),
    });
    if (!response.ok) throw new Error("Failed to update profile");
    return response.json();
  },
};

// ==============================
// Plant Service
// ==============================
export const plantService = {
  getPlants: async (
    params?: any,
  ): Promise<{ results: Plant[]; next: string | null }> => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined) query.append(key, String(val));
      });
    }
    const response = await fetch(`${API_BASE_URL}/plants/?${query.toString()}`);
    if (!response.ok) throw new Error("Failed to fetch plants");
    return response.json();
  },

  getPlantById: async (id: number): Promise<Plant> => {
    const response = await fetch(`${API_BASE_URL}/plants/${id}/`);
    if (!response.ok) throw new Error("Failed to fetch plant");
    return response.json();
  },

  identifyPlant: async (imageUri: string): Promise<Plant> => {
    const formData = new FormData();
    // @ts-ignore
    formData.append("image", {
      uri: imageUri,
      name: "photo.jpg",
      type: "image/jpeg",
    });
    const headers = await getFileUploadHeaders();
    const response = await fetch(`${API_BASE_URL}/plants/identify/`, {
      method: "POST",
      headers: headers as any,
      body: formData,
    });
    if (!response.ok) throw new Error("Plant identification failed");
    return response.json();
  },
};

// ==============================
// Disease Service
// ==============================
export const diseaseService = {
  getDiseases: async (
    params?: any,
  ): Promise<{ results: Disease[]; next: string | null }> => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined) query.append(key, String(val));
      });
    }
    const response = await fetch(
      `${API_BASE_URL}/diseases/?${query.toString()}`,
    );
    if (!response.ok) throw new Error("Failed to fetch diseases");
    return response.json();
  },

  getDiseaseById: async (id: number): Promise<Disease> => {
    const response = await fetch(`${API_BASE_URL}/diseases/${id}/`);
    if (!response.ok) throw new Error("Failed to fetch disease");
    return response.json();
  },

  diagnoseDisease: async (imageUri: string): Promise<Disease> => {
    const formData = new FormData();
    // @ts-ignore
    formData.append("image", {
      uri: imageUri,
      name: "photo.jpg",
      type: "image/jpeg",
    });
    const headers = await getFileUploadHeaders();
    const response = await fetch(`${API_BASE_URL}/diseases/diagnose/`, {
      method: "POST",
      headers: headers as any,
      body: formData,
    });
    if (!response.ok) throw new Error("Disease diagnosis failed");
    return response.json();
  },
};

// ==============================
// Garden Service
// ==============================
export const gardenService = {
  getUserPlants: async (): Promise<UserPlant[]> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/my-garden/`, { headers });
    if (!response.ok) throw new Error("Failed to fetch garden");
    return response.json();
  },

  addUserPlant: async (data: {
    plant: number;
    nickname?: string;
  }): Promise<UserPlant> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/my-garden/`, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to add plant");
    return response.json();
  },

  updateUserPlant: async (
    id: number,
    data: Partial<UserPlant>,
  ): Promise<UserPlant> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/my-garden/${id}/`, {
      method: "PATCH",
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to update plant");
    return response.json();
  },

  removeUserPlant: async (id: number): Promise<void> => {
    const headers = await getAuthHeaders();
    await fetch(`${API_BASE_URL}/my-garden/${id}/`, {
      method: "DELETE",
      headers,
    });
  },
};

// ==============================
// Reminder Service
// ==============================
export const reminderService = {
  getReminders: async (): Promise<Reminder[]> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/my-garden/reminders/`, {
      headers,
    });
    if (!response.ok) throw new Error("Failed to fetch reminders");
    return response.json();
  },

  createReminder: async (data: Partial<Reminder>): Promise<Reminder> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/my-garden/reminders/`, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to create reminder");
    return response.json();
  },

  toggleReminder: async (id: number): Promise<void> => {
    const headers = await getAuthHeaders();
    await fetch(`${API_BASE_URL}/my-garden/reminders/${id}/mark_completed/`, {
      method: "POST",
      headers,
    });
  },

  deleteReminder: async (id: number): Promise<void> => {
    const headers = await getAuthHeaders();
    await fetch(`${API_BASE_URL}/my-garden/reminders/${id}/`, {
      method: "DELETE",
      headers,
    });
  },
};

// ==============================
// Blog Service
// ==============================
export const blogService = {
  getPosts: async (
    params?: any,
  ): Promise<{ results: any[]; count: number; next: string | null }> => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined) query.append(key, String(val));
      });
    }
    const response = await fetch(
      `${BLOG_API_BASE_URL}/posts/?${query.toString()}`,
    );
    if (!response.ok) throw new Error("Failed to fetch posts");
    return response.json();
  },

  getPostBySlug: async (slug: string): Promise<any> => {
    const response = await fetch(`${BLOG_API_BASE_URL}/posts/${slug}/`);
    if (!response.ok) throw new Error("Failed to fetch post");
    return response.json();
  },

  getComments: async (slug: string): Promise<any[]> => {
    const response = await fetch(
      `${BLOG_API_BASE_URL}/posts/${slug}/comments/`,
    );
    if (!response.ok) throw new Error("Failed to fetch comments");
    return response.json();
  },
};
