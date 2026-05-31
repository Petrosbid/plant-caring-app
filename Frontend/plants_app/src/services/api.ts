// src/services/api.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import type {
  Disease,
  Plant,
  ProfileUpdateInput,
  Reminder,
  User,
  UserPlant,
} from "../types";

export const API_BASE_URL = 'http://192.168.183.1:8000/api';
const BLOG_API_BASE_URL = 'http://192.168.183.1:8000/api/blog';
export const BLOG_SHARE_BASE_URL = API_BASE_URL.replace('/api', '');

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

const formatApiError = (errorData: unknown, fallback: string): string => {
  if (!errorData || typeof errorData !== "object") return fallback;
  const data = errorData as Record<string, unknown>;
  if (typeof data.detail === "string") return data.detail;
  const parts = Object.entries(data).map(([key, value]) => {
    if (Array.isArray(value)) return `${key}: ${value.join(", ")}`;
    if (typeof value === "string") return `${key}: ${value}`;
    return `${key}: ${JSON.stringify(value)}`;
  });
  return parts.length ? parts.join("\n") : fallback;
};

/** Maps client form fields to the backend UserSerializer shape. */
export const buildProfilePayload = (
  data: ProfileUpdateInput,
): Record<string, string> => {
  const payload: Record<string, string> = {};

  const assign = (key: string, value: string | undefined) => {
    if (value !== undefined && value !== null) payload[key] = value;
  };

  assign("username", data.username);
  assign("email", data.email);
  assign("first_name", data.first_name);
  assign("last_name", data.last_name);
  assign("bio", data.bio);
  assign("national_code", data.national_code);
  assign("birth_date", data.birth_date);
  assign("gender", data.gender);

  const phone = data.phone ?? data.phone_number;
  if (phone !== undefined) assign("phone", phone);

  const password = data.password ?? data.new_password;
  if (password) assign("password", password);

  return payload;
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
    
    const contentType = response.headers.get("content-type");
    if (!response.ok) {
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Registration failed");
      } else {
        const text = await response.text();
        console.error("Registration failed with non-JSON response:", text.substring(0, 100));
        throw new Error(`Registration failed (${response.status}): Server returned HTML or text.`);
      }
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
    
    const contentType = response.headers.get("content-type");
    if (!response.ok) {
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Login failed");
      } else {
        const text = await response.text();
        console.error("Login failed with non-JSON response:", text.substring(0, 100));
        throw new Error(`Login failed (${response.status}): Server returned HTML or text.`);
      }
    }
    
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      await AsyncStorage.setItem("access_token", data.access);
      await AsyncStorage.setItem("refresh_token", data.refresh);
      return data;
    } else {
      const text = await response.text();
      console.error("Login succeeded but returned non-JSON:", text.substring(0, 100));
      throw new Error("Server returned an invalid response format.");
    }
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
    
    const contentType = response.headers.get("content-type");
    if (!response.ok) {
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to fetch profile");
      } else {
        const text = await response.text();
        console.error("Profile fetch failed with non-JSON response:", text.substring(0, 100));
        throw new Error(`Profile fetch failed (${response.status}): Server returned HTML or text.`);
      }
    }
    
    return response.json();
  },

  updateProfile: async (userData: ProfileUpdateInput): Promise<User> => {
    const headers = await getAuthHeaders();
    const body = buildProfilePayload(userData);
    const response = await fetch(`${API_BASE_URL}/auth/profile/`, {
      method: "PATCH",
      headers,
      body: JSON.stringify(body),
    });

    const contentType = response.headers.get("content-type");
    if (!response.ok) {
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        throw new Error(formatApiError(errorData, "Failed to update profile"));
      }
      const text = await response.text();
      console.error(
        "Profile update failed with non-JSON response:",
        text.substring(0, 100),
      );
      throw new Error(
        `Profile update failed (${response.status}): Server returned HTML or text.`,
      );
    }

    return response.json();
  },

  updateProfilePicture: async (imageUri: string): Promise<User> => {
    const formData = new FormData();
    const filename = imageUri.split("/").pop() || "avatar.jpg";
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : "image/jpeg";
    // @ts-ignore — React Native FormData file entry
    formData.append("profile_picture", {
      uri: imageUri,
      name: filename,
      type,
    });

    const response = await fetch(`${API_BASE_URL}/auth/profile/picture/`, {
      method: "PUT",
      headers: await getFileUploadHeaders(),
      body: formData,
    });

    const contentType = response.headers.get("content-type");
    if (!response.ok) {
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        throw new Error(
          formatApiError(errorData, "Failed to update profile picture"),
        );
      }
      throw new Error(`Profile picture update failed (${response.status})`);
    }

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
    
    const contentType = response.headers.get("content-type");
    if (!response.ok) {
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Plant identification failed");
      } else {
        const text = await response.text();
        console.error("Identification failed with non-JSON response:", text.substring(0, 100));
        throw new Error(`Identification failed (${response.status}): Server returned HTML or text.`);
      }
    }
    return response.json();
  },

  recommendPlant: async (
    answers: Record<string, string | string[] | boolean>,
    language: string = "en",
    additionalNotes: string = "",
  ): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/plants/recommend-plant/`, {
      method: "POST",
      headers: await getAuthHeaders(),
      body: JSON.stringify({
        language,
        answers,
        additional_notes: additionalNotes,
      }),
    });
    
    const contentType = response.headers.get("content-type");
    if (!response.ok) {
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Recommendation failed");
      } else {
        const text = await response.text();
        console.error("Recommendation failed with non-JSON response:", text.substring(0, 100));
        throw new Error(`Recommendation failed (${response.status}): Server returned HTML or text.`);
      }
    }
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
    
    const contentType = response.headers.get("content-type");
    if (!response.ok) {
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to fetch diseases");
      } else {
        const text = await response.text();
        console.error("Fetch diseases failed with non-JSON response:", text.substring(0, 100));
        throw new Error(`Fetch diseases failed (${response.status}): Server returned HTML or text.`);
      }
    }
    return response.json();
  },

  getDiseaseById: async (id: number): Promise<Disease> => {
    const response = await fetch(`${API_BASE_URL}/diseases/${id}/`);
    
    const contentType = response.headers.get("content-type");
    if (!response.ok) {
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to fetch disease");
      } else {
        const text = await response.text();
        console.error("Fetch disease failed with non-JSON response:", text.substring(0, 100));
        throw new Error(`Fetch disease failed (${response.status}): Server returned HTML or text.`);
      }
    }
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
    
    const contentType = response.headers.get("content-type");
    if (!response.ok) {
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Disease diagnosis failed");
      } else {
        const text = await response.text();
        console.error("Diagnosis failed with non-JSON response:", text.substring(0, 100));
        throw new Error(`Diagnosis failed (${response.status}): Server returned HTML or text.`);
      }
    }
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
    
    const contentType = response.headers.get("content-type");
    if (!response.ok) {
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to fetch garden");
      } else {
        const text = await response.text();
        console.error("Fetch garden failed with non-JSON response:", text.substring(0, 100));
        throw new Error(`Fetch garden failed (${response.status}): Server returned HTML or text.`);
      }
    }
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
    
    const contentType = response.headers.get("content-type");
    if (!response.ok) {
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to add plant");
      } else {
        const text = await response.text();
        console.error("Add plant failed with non-JSON response:", text.substring(0, 100));
        throw new Error(`Add plant failed (${response.status}): Server returned HTML or text.`);
      }
    }
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
    
    const contentType = response.headers.get("content-type");
    if (!response.ok) {
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to update plant");
      } else {
        const text = await response.text();
        console.error("Update plant failed with non-JSON response:", text.substring(0, 100));
        throw new Error(`Update plant failed (${response.status}): Server returned HTML or text.`);
      }
    }
    return response.json();
  },

  removeUserPlant: async (id: number): Promise<void> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/my-garden/${id}/`, {
      method: "DELETE",
      headers,
    });
    
    if (!response.ok) {
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to remove plant");
      } else {
        throw new Error(`Remove plant failed (${response.status})`);
      }
    }
  },

  chatWithPlant: async (plantId: number, message: string): Promise<any> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/my-garden/chat/`, {
      method: "POST",
      headers,
      body: JSON.stringify({ plant_id: plantId, message }),
    });
    
    const contentType = response.headers.get("content-type");
    if (!response.ok) {
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Chat request failed");
      } else {
        throw new Error(`Chat request failed (${response.status})`);
      }
    }
    return response.json();
  },

  addGrowthRecord: async (data: any): Promise<any> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/my-garden/growth-records/`, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });
    
    const contentType = response.headers.get("content-type");
    if (!response.ok) {
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to add growth record");
      } else {
        throw new Error(`Add growth record failed (${response.status})`);
      }
    }
    return response.json();
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
    
    const contentType = response.headers.get("content-type");
    if (!response.ok) {
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to fetch reminders");
      } else {
        const text = await response.text();
        console.error("Fetch reminders failed with non-JSON response:", text.substring(0, 100));
        throw new Error(`Fetch reminders failed (${response.status}): Server returned HTML or text.`);
      }
    }
    return response.json();
  },

  createReminder: async (data: Partial<Reminder>): Promise<Reminder> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/my-garden/reminders/`, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });
    
    const contentType = response.headers.get("content-type");
    if (!response.ok) {
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to create reminder");
      } else {
        const text = await response.text();
        console.error("Create reminder failed with non-JSON response:", text.substring(0, 100));
        throw new Error(`Create reminder failed (${response.status}): Server returned HTML or text.`);
      }
    }
    return response.json();
  },

  toggleReminder: async (id: number): Promise<void> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/my-garden/reminders/${id}/mark_completed/`, {
      method: "POST",
      headers,
    });
    
    if (!response.ok) {
      throw new Error(`Toggle reminder failed (${response.status})`);
    }
  },

  deleteReminder: async (id: number): Promise<void> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/my-garden/reminders/${id}/`, {
      method: "DELETE",
      headers,
    });
    
    if (!response.ok) {
      throw new Error(`Delete reminder failed (${response.status})`);
    }
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
    const data = await response.json();
    if (Array.isArray(data)) {
      return { results: data, count: data.length, next: null };
    }
    return data;
  },

  getPostBySlug: async (slug: string): Promise<any> => {
    const response = await fetch(`${BLOG_API_BASE_URL}/posts/${slug}/`, {
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch post");
    return response.json();
  },

  likePost: async (slug: string): Promise<any> => {
    const response = await fetch(`${BLOG_API_BASE_URL}/posts/${slug}/like/`, {
      method: "POST",
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to like post");
    return response.json();
  },

  dislikePost: async (slug: string): Promise<any> => {
    const response = await fetch(`${BLOG_API_BASE_URL}/posts/${slug}/dislike/`, {
      method: "POST",
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to dislike post");
    return response.json();
  },

  getComments: async (slug: string): Promise<any[]> => {
    const response = await fetch(
      `${BLOG_API_BASE_URL}/posts/${slug}/comments/`,
    );
    if (!response.ok) throw new Error("Failed to fetch comments");
    const data = await response.json();
    return Array.isArray(data) ? data : data.results || [];
  },

  addComment: async (
    slug: string,
    commentData: { content: string; parent?: number },
  ): Promise<any> => {
    const response = await fetch(
      `${BLOG_API_BASE_URL}/posts/${slug}/comments/`,
      {
        method: "POST",
        headers: await getAuthHeaders(),
        body: JSON.stringify(commentData),
      },
    );
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(formatApiError(errorData, "Failed to add comment"));
    }
    return response.json();
  },

  voteComment: async (
    commentId: number,
    voteType: 1 | -1,
  ): Promise<any> => {
    const response = await fetch(
      `${BLOG_API_BASE_URL}/comments/${commentId}/vote/`,
      {
        method: "POST",
        headers: await getAuthHeaders(),
        body: JSON.stringify({ vote_type: voteType }),
      },
    );
    if (!response.ok) throw new Error("Failed to vote on comment");
    return response.json();
  },

  deleteComment: async (commentId: number): Promise<void> => {
    const response = await fetch(
      `${BLOG_API_BASE_URL}/comments/${commentId}/`,
      {
        method: "DELETE",
        headers: await getAuthHeaders(),
      },
    );
    if (!response.ok) throw new Error("Failed to delete comment");
  },

  updateComment: async (
    commentId: number,
    content: string,
  ): Promise<any> => {
    const response = await fetch(
      `${BLOG_API_BASE_URL}/comments/${commentId}/`,
      {
        method: "PUT",
        headers: await getAuthHeaders(),
        body: JSON.stringify({ content }),
      },
    );
    if (!response.ok) throw new Error("Failed to update comment");
    return response.json();
  },
};
