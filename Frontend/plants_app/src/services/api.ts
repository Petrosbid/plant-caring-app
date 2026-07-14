import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getAccessToken,
  getRefreshToken,
  saveTokens,
  clearTokens,
} from "../utils/tokenStorage";
import type {
  Disease,
  Plant,
  ProfileUpdateInput,
  Reminder,
  User,
  UserPlant,
} from "../types";

export const API_BASE_URL = "https://django-jhkzd0.cldv.dev/api";
export const BLOG_API_BASE_URL = `${API_BASE_URL}/blog`;
export const BLOG_SHARE_BASE_URL = API_BASE_URL.replace("/api", "");

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

const onTokenRefreshed = (token: string) => {
  refreshSubscribers.map((cb) => cb(token));
  refreshSubscribers = [];
};

/**
 * Standard fetch wrapper with automatic token refresh
 */
const authenticatedFetch = async (
  url: string,
  options: RequestInit = {},
): Promise<Response> => {
  let token = await getAccessToken();

  const headers = {
    ...options.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    "Content-Type":
      options.body instanceof FormData
        ? undefined
        : (options.headers as any)?.["Content-Type"] || "application/json",
  };

  // Remove Content-Type if it's FormData to let the browser set it with boundary
  if (options.body instanceof FormData) {
    // @ts-ignore
    delete headers["Content-Type"];
  }

  let response = await fetch(url, { ...options, headers: headers as any });

  // If unauthorized, try to refresh token
  if (response.status === 401) {
    if (isRefreshing) {
      // If already refreshing, wait for it to complete
      return new Promise((resolve) => {
        subscribeTokenRefresh(async (newToken) => {
          const retryHeaders = {
            ...headers,
            Authorization: `Bearer ${newToken}`,
          };
          resolve(fetch(url, { ...options, headers: retryHeaders as any }));
        });
      });
    }

    isRefreshing = true;
    const refreshToken = await getRefreshToken();

    if (refreshToken) {
      try {
        const refreshResponse = await fetch(
          `${API_BASE_URL}/auth/token/refresh/`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh: refreshToken }),
          },
        );

        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          await saveTokens(data.access, data.refresh || refreshToken);

          isRefreshing = false;
          onTokenRefreshed(data.access);

          // Retry the original request
          const retryHeaders = {
            ...headers,
            Authorization: `Bearer ${data.access}`,
          };
          return await fetch(url, { ...options, headers: retryHeaders as any });
        }
      } catch (e) {
        console.error("Token refresh failed:", e);
      }
    }

    // If we reached here, refresh failed or no refresh token
    isRefreshing = false;
    await clearTokens();
    await AsyncStorage.removeItem("user");
    // We could potentially trigger a global logout event here
  }

  return response;
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

export const buildProfilePayload = (
  data: ProfileUpdateInput,
): Record<string, any> => {
  const payload: Record<string, any> = {};
  const assign = (key: string, value: any) => {
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

  // Push Notification Settings
  assign("push_token", data.push_token);
  assign("timezone", data.timezone);
  assign("notify_reminders_exact", data.notify_reminders_exact);
  assign("notify_reminders_daily", data.notify_reminders_daily);
  assign("notify_reminders_tomorrow", data.notify_reminders_tomorrow);

  const phone = data.phone ?? data.phone_number;
  if (phone !== undefined) assign("phone", phone);
  const password = data.password ?? data.new_password;
  if (password) assign("password", password);
  return payload;
};

export const authService = {
  register: async (userData: any): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/auth/register/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
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
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || "Login failed");
    }
    const data = await response.json();
    await saveTokens(data.access, data.refresh);
    return data;
  },

  logout: async (): Promise<void> => {
    const refresh = await getRefreshToken();
    if (refresh) {
      try {
        await fetch(`${API_BASE_URL}/auth/logout/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh }),
        });
      } catch (e) {
        console.warn("Logout request failed:", e);
      }
    }
    await clearTokens();
    await AsyncStorage.removeItem("user");
  },

  getProfile: async (): Promise<User> => {
    const response = await authenticatedFetch(`${API_BASE_URL}/auth/profile/`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || "Failed to fetch profile");
    }
    return response.json();
  },

  updateProfile: async (userData: ProfileUpdateInput): Promise<User> => {
    const body = buildProfilePayload(userData);
    const response = await authenticatedFetch(`${API_BASE_URL}/auth/profile/`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(formatApiError(errorData, "Failed to update profile"));
    }
    return response.json();
  },

  requestOtp: async (
    phoneNumber: string,
  ): Promise<{ message: string; simulated_otp?: string }> => {
    const response = await fetch(`${API_BASE_URL}/auth/api/otp/request/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone_number: phoneNumber }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        formatApiError(errorData, "Failed to send verification code"),
      );
    }
    return response.json();
  },

  verifyOtp: async (
    phoneNumber: string,
    code: string,
  ): Promise<{ access: string; refresh: string }> => {
    const response = await fetch(`${API_BASE_URL}/auth/api/otp/verify/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone_number: phoneNumber, code }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(formatApiError(errorData, "Invalid verification code"));
    }
    const data = await response.json();
    if (data.access && data.refresh) {
      await saveTokens(data.access, data.refresh);
    }
    return data;
  },

  registerRequestOtp: async (
    method: "phone" | "email",
    data: any,
  ): Promise<{ message: string; simulated_otp?: string }> => {
    const response = await fetch(
      `${API_BASE_URL}/auth/api/register/otp/request/`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method, ...data }),
      },
    );
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        formatApiError(errorData, "Failed to send verification code"),
      );
    }
    return response.json();
  },

  registerVerifyOtp: async (
    identifier: string,
    code: string,
    password?: string,
  ): Promise<{ access: string; refresh: string; user?: User }> => {
    const payload: { identifier: string; code: string; password?: string } = {
      identifier,
      code,
    };
    if (password) payload.password = password;

    const response = await fetch(
      `${API_BASE_URL}/auth/api/register/otp/verify/`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(formatApiError(errorData, "Invalid verification code"));
    }
    const data = await response.json();
    if (data.access && data.refresh) {
      await saveTokens(data.access, data.refresh);
      if (data.user) {
        await AsyncStorage.setItem("user", JSON.stringify(data.user));
      }
    }
    return data;
  },

  updateProfilePicture: async (imageUri: string): Promise<User> => {
    const formData = new FormData();
    const filename = imageUri.split("/").pop() || "avatar.jpg";
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : "image/jpeg";
    // @ts-ignore
    formData.append("profile_picture", { uri: imageUri, name: filename, type });

    const response = await authenticatedFetch(
      `${API_BASE_URL}/auth/profile/picture/`,
      {
        method: "PUT",
        body: formData,
      },
    );
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        formatApiError(errorData, "Failed to update profile picture"),
      );
    }
    return response.json();
  },
};

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

  identifyPlant: async (imageUri: string, lang = "en"): Promise<Plant> => {
    const formData = new FormData();
    // @ts-ignore
    formData.append("image", {
      uri: imageUri,
      name: "photo.jpg",
      type: "image/jpeg",
    });
    const response = await authenticatedFetch(
      `${API_BASE_URL}/plants/identify/?lang=${lang}`,
      {
        method: "POST",
        body: formData,
      },
    );
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.detail || "Plant identification failed");
    }
    return response.json();
  },

  recommendPlant: async (
    answers: any,
    language: string = "en",
    additionalNotes: string = "",
  ): Promise<any> => {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/plants/recommend-plant/`,
      {
        method: "POST",
        body: JSON.stringify({
          language,
          answers,
          additional_notes: additionalNotes,
        }),
      },
    );
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Recommendation failed");
    }
    return response.json();
  },
};

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

  diagnoseDisease: async (imageUri: string, lang = "en"): Promise<Disease> => {
    const formData = new FormData();
    // @ts-ignore
    formData.append("image", {
      uri: imageUri,
      name: "photo.jpg",
      type: "image/jpeg",
    });
    const response = await authenticatedFetch(
      `${API_BASE_URL}/diseases/diagnose/?lang=${lang}`,
      {
        method: "POST",
        body: formData,
      },
    );
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.detail || "Disease diagnosis failed");
    }
    return response.json();
  },
};

export const gardenService = {
  getUserPlants: async (): Promise<UserPlant[]> => {
    const response = await authenticatedFetch(`${API_BASE_URL}/my-garden/`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || "Failed to fetch garden");
    }
    return response.json();
  },

  addUserPlant: async (data: any): Promise<UserPlant> => {
    const response = await authenticatedFetch(`${API_BASE_URL}/my-garden/`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || "Failed to add plant");
    }
    return response.json();
  },

  updateUserPlant: async (id: number, data: any): Promise<UserPlant> => {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/my-garden/${id}/`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
      },
    );
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || "Failed to update plant");
    }
    return response.json();
  },

  removeUserPlant: async (id: number): Promise<void> => {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/my-garden/${id}/`,
      {
        method: "DELETE",
      },
    );
    if (!response.ok) throw new Error("Failed to remove plant");
  },

  chatWithPlant: async (plantId: number, message: string): Promise<any> => {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/my-garden/chat/`,
      {
        method: "POST",
        body: JSON.stringify({ plant_id: plantId, message }),
      },
    );
    if (!response.ok) throw new Error("Chat request failed");
    return response.json();
  },

  addGrowthRecord: async (data: any): Promise<any> => {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/my-garden/growth/`,
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    );
    if (!response.ok) throw new Error("Failed to add growth record");
    return response.json();
  },
};

export const reminderService = {
  getReminders: async (): Promise<Reminder[]> => {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/my-garden/reminders/`,
    );
    if (!response.ok) throw new Error("Failed to fetch reminders");
    return response.json();
  },

  createReminder: async (data: any): Promise<Reminder> => {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/my-garden/reminders/`,
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    );
    if (!response.ok) throw new Error("Failed to create reminder");
    return response.json();
  },

  toggleReminder: async (id: number): Promise<void> => {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/my-garden/reminders/${id}/mark_completed/`,
      {
        method: "POST",
      },
    );
    if (!response.ok) throw new Error("Toggle reminder failed");
  },

  deleteReminder: async (id: number): Promise<void> => {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/my-garden/reminders/${id}/`,
      {
        method: "DELETE",
      },
    );
    if (!response.ok) throw new Error("Delete reminder failed");
  },
};

export const blogService = {
  getPosts: async (params?: any): Promise<any> => {
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
    return Array.isArray(data)
      ? { results: data, count: data.length, next: null }
      : data;
  },

  getPostBySlug: async (slug: string): Promise<any> => {
    const response = await authenticatedFetch(
      `${BLOG_API_BASE_URL}/posts/${slug}/`,
    );
    if (!response.ok) throw new Error("Failed to fetch post");
    return response.json();
  },

  likePost: async (slug: string): Promise<any> => {
    const response = await authenticatedFetch(
      `${BLOG_API_BASE_URL}/posts/${slug}/like/`,
      { method: "POST" },
    );
    if (!response.ok) throw new Error("Failed to like post");
    return response.json();
  },

  dislikePost: async (slug: string): Promise<any> => {
    const response = await authenticatedFetch(
      `${BLOG_API_BASE_URL}/posts/${slug}/dislike/`,
      { method: "POST" },
    );
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

  addComment: async (slug: string, commentData: any): Promise<any> => {
    const response = await authenticatedFetch(
      `${BLOG_API_BASE_URL}/posts/${slug}/comments/`,
      {
        method: "POST",
        body: JSON.stringify(commentData),
      },
    );
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(formatApiError(errorData, "Failed to add comment"));
    }
    return response.json();
  },

  voteComment: async (commentId: number, voteType: 1 | -1): Promise<any> => {
    const response = await authenticatedFetch(
      `${BLOG_API_BASE_URL}/comments/${commentId}/vote/`,
      {
        method: "POST",
        body: JSON.stringify({ vote_type: voteType }),
      },
    );
    if (!response.ok) throw new Error("Failed to vote on comment");
    return response.json();
  },

  deleteComment: async (commentId: number): Promise<void> => {
    const response = await authenticatedFetch(
      `${BLOG_API_BASE_URL}/comments/${commentId}/`,
      { method: "DELETE" },
    );
    if (!response.ok) throw new Error("Failed to delete comment");
  },

  updateComment: async (commentId: number, content: string): Promise<any> => {
    const response = await authenticatedFetch(
      `${BLOG_API_BASE_URL}/comments/${commentId}/`,
      {
        method: "PUT",
        body: JSON.stringify({ content }),
      },
    );
    if (!response.ok) throw new Error("Failed to update comment");
    return response.json();
  },
};
