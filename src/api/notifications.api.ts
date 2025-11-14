
import apiClient from '@/lib/apiClient';

interface ApiResponse<T> {
  data: T;
}

export interface PaginationParams {
  page?: number;        limit?: number;     }

export interface Notification {
  id: string;
  to_user_id: string;                from_user_id?: string | null;
  type: string;
  title?: string | null;             message?: string | null;           related_id?: string | null;        metadata?: any | null;             priority: 'low' | 'normal' | 'high' | 'urgent';
  action_required: boolean;
  is_read: boolean;
  created_at: string;
    from_user?: any;                 }

export interface CreateNotificationRequest {
  to_user_id: string;                from_user_id?: string | null;
  type: string;
  title?: string | null;             message?: string | null;           related_id?: string | null;        metadata?: any | null;             priority?: 'low' | 'normal' | 'high' | 'urgent';
  action_required?: boolean;
}

export interface GetNotificationsParams extends PaginationParams {
  read?: boolean;                    priority?: 'low' | 'normal' | 'high' | 'urgent';
  action_required?: boolean;
}

export const getNotifications = async (params?: GetNotificationsParams): Promise<Notification[]> => {
  const response = await apiClient.get<ApiResponse<Notification[]>>('/notifications', { params });
  return response.data.data;
};

export const getNotificationById = async (notificationId: string): Promise<Notification> => {
  const response = await apiClient.get<ApiResponse<Notification>>(`/notifications/${notificationId}`);
  return response.data.data;
};

export const createNotification = async (
  data: CreateNotificationRequest
): Promise<Notification> => {
  const response = await apiClient.post<ApiResponse<Notification>>('/notifications', data);
  return response.data.data;
};

export const markNotificationAsRead = async (notificationId: string): Promise<Notification> => {
  const response = await apiClient.put<ApiResponse<Notification>>(
    `/notifications/${notificationId}/read`
  );
  return response.data.data;
};

export const markAllNotificationsAsRead = async (): Promise<void> => {
  await apiClient.put('/notifications/read-all');
};

export const deleteNotification = async (notificationId: string): Promise<void> => {
  await apiClient.delete(`/notifications/${notificationId}`);
};

export const deleteAllNotifications = async (): Promise<void> => {
  await apiClient.delete('/notifications/all');
};

export const getUnreadNotificationCount = async (): Promise<{ unread_count: number }> => {
  const response = await apiClient.get<ApiResponse<{ unread_count: number }>>(
    '/notifications/unread-count'
  );
  return response.data.data;
};

export const getNotificationsByType = async (
  type: string,
  params?: PaginationParams
): Promise<Notification[]> => {
  const response = await apiClient.get<ApiResponse<Notification[]>>('/notifications/type', {
    params: { type, ...params },
  });
  return response.data.data;
};

export const notificationsApi = {
  getNotifications,
  getNotificationById,
  createNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications,
  getUnreadNotificationCount,
  getNotificationsByType,
};

export default notificationsApi;
