import { API_BASE_URL } from './api';

export interface Notification {
  id: number;
  title: string;
  care_type: string;
  scheduled_date: string;
  user_plant_id: number | null;
  plant_id: number | null;
  plant_name: string | null;
  plant_image: string | null;
}

export interface NotificationsResponse {
  today: Notification[];
  tomorrow: Notification[];
  total_count: number;
}

export async function fetchNotifications(): Promise<NotificationsResponse> {
  const token = localStorage.getItem('access_token');
  if (!token) {
    throw new Error('No token found');
  }

  const response = await fetch(`${API_BASE_URL}/my-garden/notifications/`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch notifications');
  }
  return response.json();
}