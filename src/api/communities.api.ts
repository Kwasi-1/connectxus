
import apiClient, { getDefaultSpaceId } from '@/lib/apiClient';

interface ApiResponse<T> {
  data: T;
}

export interface PaginationParams {
  page?: number;        limit?: number;     }

export interface Community {
  id: string;
  space_id: string;
  name: string;
  slug: string;
  description?: string | null;
  category: string;                  cover_image?: string | null;       is_public: boolean;                settings?: any | null;             member_count: number;
  post_count?: number | null;
  created_at: string;
  updated_at?: string | null;
    is_member?: boolean;
  role?: string | null;            }

export interface CreateCommunityRequest {
  space_id: string;
  name: string;
  description?: string | null;
  category: string;                  cover_image?: string | null;       is_public: boolean;                settings?: any | null;
}

export interface UpdateCommunityRequest {
  name?: string;
  description?: string | null;
  category?: string;
  cover_image?: string | null;       is_public?: boolean;               settings?: any | null;
}

export interface ListCommunitiesParams extends PaginationParams {
  space_id?: string;                 sort?: 'recent' | 'popular' | 'members';
  category?: string;
}

export const getCommunities = async (params?: Omit<ListCommunitiesParams, 'space_id'>): Promise<Community[]> => {
  const spaceId = getDefaultSpaceId();

  const response = await apiClient.get<ApiResponse<Community[]>>('/communities', {
    params: { space_id: spaceId, ...params },
  });
  return response.data.data;
};

export const getCommunityById = async (communityId: string): Promise<Community> => {
  const response = await apiClient.get<ApiResponse<Community>>(`/communities/${communityId}`);
  return response.data.data;
};

export const getCommunityBySlug = async (slug: string): Promise<Community> => {
  const spaceId = getDefaultSpaceId();

  const response = await apiClient.get<ApiResponse<Community>>(
    `/communities/slug/${slug}`,
    {
      params: { space_id: spaceId },
    }
  );
  return response.data.data;
};

export const createCommunity = async (data: Omit<CreateCommunityRequest, 'space_id'>): Promise<Community> => {
  const spaceId = getDefaultSpaceId();

  if (!spaceId) {
    throw new Error('Space ID is required. Please configure VITE_DEFAULT_SPACE_ID.');
  }

  const requestData: CreateCommunityRequest = {
    ...data,
    space_id: spaceId,
  };

  const response = await apiClient.post<ApiResponse<Community>>('/communities', requestData);
  return response.data.data;
};

export const updateCommunity = async (
  communityId: string,
  data: UpdateCommunityRequest
): Promise<Community> => {
  const response = await apiClient.put<ApiResponse<Community>>(
    `/communities/${communityId}`,
    data
  );
  return response.data.data;
};

export const deleteCommunity = async (communityId: string): Promise<void> => {
  await apiClient.delete(`/communities/${communityId}`);
};

export const searchCommunities = async (
  query: string,
  params?: PaginationParams
): Promise<Community[]> => {
  const spaceId = getDefaultSpaceId();

  const response = await apiClient.get<ApiResponse<Community[]>>('/communities/search', {
    params: { q: query, space_id: spaceId, ...params },
  });
  return response.data.data;
};

export const getCommunityCategories = async (): Promise<string[]> => {
  const response = await apiClient.get<ApiResponse<string[]>>('/communities/categories');
  return response.data.data;
};

export const joinCommunity = async (communityId: string): Promise<void> => {
  await apiClient.post(`/communities/${communityId}/join`);
};

export const leaveCommunity = async (communityId: string): Promise<void> => {
  await apiClient.post(`/communities/${communityId}/leave`);
};

export const getCommunityMembers = async (
  communityId: string,
  params?: PaginationParams
): Promise<any[]> => {
  const response = await apiClient.get<ApiResponse<any[]>>(
    `/communities/${communityId}/members`,
    { params }
  );
  return response.data.data;
};

export const getCommunityModerators = async (communityId: string): Promise<any[]> => {
  const response = await apiClient.get<ApiResponse<any[]>>(
    `/communities/${communityId}/moderators`
  );
  return response.data.data;
};

export const getCommunityAdmins = async (communityId: string): Promise<any[]> => {
  const response = await apiClient.get<ApiResponse<any[]>>(
    `/communities/${communityId}/admins`
  );
  return response.data.data;
};

export const addCommunityModerator = async (
  communityId: string,
  userId: string
): Promise<void> => {
  await apiClient.post(`/communities/${communityId}/moderators`, { user_id: userId });
};

export const removeCommunityModerator = async (
  communityId: string,
  userId: string
): Promise<void> => {
  await apiClient.delete(`/communities/${communityId}/moderators/${userId}`);
};

export const getUserCommunities = async (params?: PaginationParams): Promise<Community[]> => {
  const spaceId = getDefaultSpaceId();

  const response = await apiClient.get<ApiResponse<Community[]>>('/users/communities', {
    params: { space_id: spaceId, ...params },
  });
  return response.data.data;
};

export const getTrendingCommunities = async (params?: PaginationParams): Promise<Community[]> => {
  const spaceId = getDefaultSpaceId();

  const response = await apiClient.get<ApiResponse<Community[]>>('/communities/trending', {
    params: { space_id: spaceId, ...params },
  });
  return response.data.data;
};

export const communitiesApi = {
  getCommunities,
  getCommunityById,
  getCommunityBySlug,
  createCommunity,
  updateCommunity,
  deleteCommunity,
  searchCommunities,
  getCommunityCategories,
  joinCommunity,
  leaveCommunity,
  getCommunityMembers,
  getCommunityModerators,
  getCommunityAdmins,
  addCommunityModerator,
  removeCommunityModerator,
  getUserCommunities,
  getTrendingCommunities,
};

export default communitiesApi;
