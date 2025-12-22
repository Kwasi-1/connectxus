
import apiClient from '@/lib/apiClient';

interface ApiResponse<T> {
  data: T;
}

export interface PaginationParams {
  page?: number;        limit?: number;     }

export interface Announcement {
  id: string;
  space_id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'alert';
  target_audience?: string | null;
  priority?: 'low' | 'normal' | 'high' | null;
  status: 'draft' | 'published' | 'archived';
  published_at?: string | null;
  expires_at?: string | null;
  created_by: string;
  created_at: string;
  updated_at?: string | null;
    author?: any;                    }

export interface CreateAnnouncementRequest {
  space_id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'alert';
  target_audience?: string | null;
  priority?: 'low' | 'normal' | 'high';
  expires_at?: string | null;     }

export interface UpdateAnnouncementRequest {
  title?: string;
  content?: string;
  type?: 'info' | 'warning' | 'alert';
  target_audience?: string | null;
  priority?: 'low' | 'normal' | 'high';
  expires_at?: string | null;
}

export interface ListAnnouncementsParams extends PaginationParams {
  space_id?: string;                 status?: 'draft' | 'published' | 'archived';
  type?: 'info' | 'warning' | 'alert';
}

export const getAnnouncements = async (params?: Omit<ListAnnouncementsParams, 'space_id'>): Promise<Announcement[]> => {
  const response = await apiClient.get<ApiResponse<Announcement[]>>('/announcements', {
    params,
  });
  return response.data.data;
};

export const getAnnouncementById = async (announcementId: string): Promise<Announcement> => {
  const response = await apiClient.get<ApiResponse<Announcement>>(`/announcements/${announcementId}`);
  return response.data.data;
};

export const createAnnouncement = async (
  data: Omit<CreateAnnouncementRequest, 'space_id'>
): Promise<Announcement> => {
  const response = await apiClient.post<ApiResponse<Announcement>>('/announcements', data);
  return response.data.data;
};

export const updateAnnouncement = async (
  announcementId: string,
  data: UpdateAnnouncementRequest
): Promise<Announcement> => {
  const response = await apiClient.put<ApiResponse<Announcement>>(
    `/announcements/${announcementId}`,
    data
  );
  return response.data.data;
};

export const updateAnnouncementStatus = async (
  announcementId: string,
  status: 'draft' | 'published' | 'archived'
): Promise<Announcement> => {
  const response = await apiClient.put<ApiResponse<Announcement>>(
    `/announcements/${announcementId}/status`,
    { status }
  );
  return response.data.data;
};

export const deleteAnnouncement = async (announcementId: string): Promise<void> => {
  await apiClient.delete(`/announcements/${announcementId}`);
};

export const announcementsApi = {
  getAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  updateAnnouncementStatus,
  deleteAnnouncement,
};

export default announcementsApi;
