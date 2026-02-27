// API service for plant identification app
import type { Plant, Disease, Reminder, User } from '../types';
import axios from 'axios';

// Base API URL - points to your backend
const API_BASE_URL = 'http://localhost:8000/api'; // Backend API URL
const BLOG_API_BASE_URL = 'http://localhost:8000/api/blog'; // Blog API URL

// Create axios instance for blog API with error handling
const blogApi = axios.create({
  baseURL: BLOG_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
blogApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Helper function to get authorization header
const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

// Helper function to handle file uploads
const getFileUploadHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

// Authentication service
export const authService = {
  register: async (userData: { username: string; email: string; password: string; first_name?: string; last_name?: string }): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/auth/register/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Registration failed');
    }

    return response.json();
  },

  login: async (credentials: { username: string; password: string }): Promise<{ access: string; refresh: string }> => {
    const response = await fetch(`${API_BASE_URL}/token/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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
      headers: {
        'Content-Type': 'application/json',
      },
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

    if (!response.ok) {
      throw new Error('Failed to fetch profile');
    }

    return response.json();
  },

  updateProfile: async (userData: Partial<User>): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/auth/profile/`, {
      method: 'PUT', // Changed to PUT method
      headers: getAuthHeaders(),
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to update profile');
    }

    return response.json();
  }
};

// Plant identification service
export const plantService = {
  // Get all plants
  getAllPlants: async (): Promise<Plant[]> => {
    const response = await fetch(`${API_BASE_URL}/plants/`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch plants');
    }

    return response.json();
  },

  // Get plant by ID
  getPlantById: async (id: number): Promise<Plant> => {
    const response = await fetch(`${API_BASE_URL}/plants/${id}/`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch plant');
    }

    return response.json();
  },

  // Identify plant from image
  identifyPlant: async (imageFile: File): Promise<Plant> => {
    const formData = new FormData();
    formData.append('image', imageFile);

    // For file uploads, browser sets Content-Type with boundary for multipart/form-data
    const headers = getFileUploadHeaders() as Record<string, string>;

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

  // Search plants
  searchPlants: async (query: string): Promise<Plant[]> => {
    // Only make the request if there's a query
    if (!query.trim()) {
      return [];
    }

    const response = await fetch(`${API_BASE_URL}/plants/search/?search=${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to search plants');
    }

    return response.json();
  }
};

// Disease detection service
export const diseaseService = {
  // Get all diseases
  getAllDiseases: async (): Promise<Disease[]> => {
    const response = await fetch(`${API_BASE_URL}/diseases/`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch diseases');
    }

    return response.json();
  },

  // Get disease by ID
  getDiseaseById: async (id: number): Promise<Disease> => {
    const response = await fetch(`${API_BASE_URL}/diseases/${id}/`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch disease');
    }

    return response.json();
  },

  // Diagnose disease from image
  detectDisease: async (imageFile: File): Promise<Disease> => {
    const formData = new FormData();
    formData.append('image', imageFile);

    // For file uploads, browser sets Content-Type with boundary for multipart/form-data
    const headers = getFileUploadHeaders() as Record<string, string>;

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

  // Search diseases
  searchDiseases: async (query: string): Promise<Disease[]> => {
    const response = await fetch(`${API_BASE_URL}/diseases/search/?search=${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to search diseases');
    }

    return response.json();
  }
};

// Garden (User Plants) service
export const gardenService = {
  // Get user's garden plants
  getUserPlants: async (): Promise<any[]> => {
    const response = await fetch(`${API_BASE_URL}/my-garden/`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user plants');
    }

    return response.json();
  },

  // Add a plant to user's garden
  addUserPlant: async (plantData: { plant: number; nickname?: string; notes?: string }): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/my-garden/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(plantData),
    });

    if (!response.ok) {
      throw new Error('Failed to add plant to garden');
    }

    return response.json();
  },

  // Update a plant in user's garden
  updateUserPlant: async (id: number, plantData: Partial<any>): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/my-garden/${id}/`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(plantData),
    });

    if (!response.ok) {
      throw new Error('Failed to update plant');
    }

    return response.json();
  },

  // Remove a plant from user's garden
  removeUserPlant: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/my-garden/${id}/`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to remove plant from garden');
    }
  },

  // Water a plant
  waterPlant: async (id: number): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/my-garden/${id}/water_plant/`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to water plant');
    }

    return response.json();
  },

  // Fertilize a plant
  fertilizePlant: async (id: number): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/my-garden/${id}/fertilize_plant/`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fertilize plant');
    }

    return response.json();
  },

  // Prune a plant
  prunePlant: async (id: number): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/my-garden/${id}/prune_plant/`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to prune plant');
    }

    return response.json();
  }
};

// Reminder service
export const reminderService = {
  // Get user's reminders
  getReminders: async (): Promise<Reminder[]> => {
    const response = await fetch(`${API_BASE_URL}/my-garden/reminders/`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch reminders');
    }

    return response.json();
  },

  // Get upcoming reminders
  getUpcomingReminders: async (): Promise<Reminder[]> => {
    const response = await fetch(`${API_BASE_URL}/my-garden/reminders/upcoming/`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch upcoming reminders');
    }

    return response.json();
  },

  // Get overdue reminders
  getOverdueReminders: async (): Promise<Reminder[]> => {
    const response = await fetch(`${API_BASE_URL}/my-garden/reminders/overdue/`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch overdue reminders');
    }

    return response.json();
  },

  // Create a reminder
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

  // Update a reminder
  updateReminder: async (id: number, reminderData: Partial<Reminder>): Promise<Reminder> => {
    const response = await fetch(`${API_BASE_URL}/my-garden/reminders/${id}/`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(reminderData),
    });

    if (!response.ok) {
      throw new Error('Failed to update reminder');
    }

    return response.json();
  },

  // Delete a reminder
  deleteReminder: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/my-garden/reminders/${id}/`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to delete reminder');
    }
  },

  // Mark reminder as completed
  markCompleted: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/my-garden/reminders/${id}/mark_completed/`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to mark reminder as completed');
    }
  }
};

// Blog service
export const blogService = {
  // Get all blog posts
  getAllPosts: async (params?: { tags?: string; limit?: number }): Promise<any> => {
    const response = await blogApi.get('/posts/', { params });
    return response.data;
  },

  // Get post by slug with likes, dislikes, comments count
  getPostBySlug: async (slug: string): Promise<any> => {
    const response = await blogApi.get(`/posts/${slug}/`);
    return response.data;
  },

  // Like a post (uses slug)
  likePost: async (slug: string): Promise<any> => {
    const response = await blogApi.post(`/posts/${slug}/like/`);
    return response.data;
  },

  // Dislike a post (uses slug)
  dislikePost: async (slug: string): Promise<any> => {
    const response = await blogApi.post(`/posts/${slug}/dislike/`);
    return response.data;
  },

  // Get comments for a post (uses slug)
  getComments: async (slug: string): Promise<any> => {
    const response = await blogApi.get(`/posts/${slug}/comments/`);
    return response.data;
  },

  // Add a comment to a post (uses slug)
  addComment: async (slug: string, commentData: { content: string; parent?: number }): Promise<any> => {
    const response = await blogApi.post(`/posts/${slug}/comments/`, commentData);
    return response.data;
  },

  // Vote on a comment
  voteComment: async (commentId: number, voteType: 1 | -1): Promise<any> => {
    const response = await blogApi.post(`/comments/${commentId}/vote/`, { vote_type: voteType });
    return response.data;
  },

  // Delete a comment
  deleteComment: async (commentId: number): Promise<void> => {
    await blogApi.delete(`/comments/${commentId}/`);
  },

  // Update a comment
  updateComment: async (commentId: number, content: string): Promise<any> => {
    const response = await blogApi.put(`/comments/${commentId}/`, { content });
    return response.data;
  },
};