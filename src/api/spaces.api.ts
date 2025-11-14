
import apiClient from '@/lib/apiClient';

interface ApiResponse<T> {
  data: T;
}

export interface PaginationParams {
  page?: number;        limit?: number;     }

export interface Space {
  id: string;
  name: string;
  description?: string | null;
  slug: string;
  logo_url?: string | null;
  theme_color?: string | null;
  settings?: any | null;             member_count?: number | null;
  created_at: string;
  updated_at?: string | null;
}

export interface CreateSpaceRequest {
  name: string;
  description?: string | null;
  slug: string;
  logo_url?: string | null;
  theme_color?: string | null;
  settings?: any | null;
}

export interface UpdateSpaceRequest {
  name?: string;
  description?: string | null;
  logo_url?: string | null;
  theme_color?: string | null;
  settings?: any | null;
}

export const getSpaces = async (params?: PaginationParams): Promise<Space[]> => {
  const response = await apiClient.get<ApiResponse<Space[]>>('/spaces', { params });
  return response.data.data;
};

export const getSpaceById = async (spaceId: string): Promise<Space> => {
  const response = await apiClient.get<ApiResponse<Space>>(`/spaces/${spaceId}`);
  return response.data.data;
};

export const getSpaceBySlug = async (slug: string): Promise<Space> => {
  const response = await apiClient.get<ApiResponse<Space>>(`/spaces/slug/${slug}`);
  return response.data.data;
};

export const createSpace = async (data: CreateSpaceRequest): Promise<Space> => {
  const response = await apiClient.post<ApiResponse<Space>>('/spaces', data);
  return response.data.data;
};

export const updateSpace = async (
  spaceId: string,
  data: UpdateSpaceRequest
): Promise<Space> => {
  const response = await apiClient.put<ApiResponse<Space>>(`/spaces/${spaceId}`, data);
  return response.data.data;
};

export const deleteSpace = async (spaceId: string): Promise<void> => {
  await apiClient.delete(`/spaces/${spaceId}`);
};

export const spacesApi = {
  getSpaces,
  getSpaceById,
  getSpaceBySlug,
  createSpace,
  updateSpace,
  deleteSpace,
};

export default spacesApi;
