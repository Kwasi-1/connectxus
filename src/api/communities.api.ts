
import apiClient, { getValidatedSpaceId } from '@/lib/apiClient';

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
  name: string;
  description?: string | null;
  category: string;
  cover_image?: string | null;
  is_public: boolean;
  settings?: any | null;
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

export interface CommunityMember {
  id: string;
  username: string;
  full_name: string;
  avatar?: string | null;
  level?: string | null;
  department?: string | null;
  verified: boolean;
  role: string;
  joined_at?: string | null;
}

export const getCommunities = async (params?: Omit<ListCommunitiesParams, 'space_id'>): Promise<Community[]> => {
    let spaceId: string | undefined;
  try {
    spaceId = getValidatedSpaceId();
  } catch (error) {
        spaceId = undefined;
  }

  const response = await apiClient.get<ApiResponse<Community[]>>('/communities', {
    params: spaceId ? { space_id: spaceId, ...params } : params,
  });
  return response.data.data;
};

export const getCommunityById = async (communityId: string): Promise<Community> => {
  const response = await apiClient.get<ApiResponse<Community>>(`/communities/${communityId}`);
  return response.data.data;
};

export const getCommunityBySlug = async (slug: string): Promise<Community> => {
  const spaceId = getValidatedSpaceId();

  const response = await apiClient.get<ApiResponse<Community>>(
    `/communities/slug/${slug}`,
    {
      params: { space_id: spaceId },
    }
  );
  return response.data.data;
};

export const createCommunity = async (data: CreateCommunityRequest): Promise<Community> => {
  const response = await apiClient.post<ApiResponse<Community>>('/communities', data);
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
  const spaceId = getValidatedSpaceId();

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
): Promise<CommunityMember[]> => {
  const response = await apiClient.get<ApiResponse<CommunityMember[]>>(
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
    let spaceId: string | undefined;
  try {
    spaceId = getValidatedSpaceId();
  } catch (error) {
        spaceId = undefined;
  }

  const response = await apiClient.get<ApiResponse<Community[]>>('/users/communities', {
    params: spaceId ? { space_id: spaceId, ...params } : params,
  });
  return response.data.data;
};

export const getRecommendedCommunities = async (params?: PaginationParams): Promise<Community[]> => {
    let spaceId: string | undefined;
  try {
    spaceId = getValidatedSpaceId();
  } catch (error) {
        spaceId = undefined;
  }

  const response = await apiClient.get<ApiResponse<Community[]>>('/users/communities/recommended', {
    params: spaceId ? { space_id: spaceId, ...params } : params,
  });
  return response.data.data;
};

export const getTrendingCommunities = async (params?: PaginationParams): Promise<Community[]> => {
  const spaceId = getValidatedSpaceId();

  const response = await apiClient.get<ApiResponse<Community[]>>('/communities/trending', {
    params: { space_id: spaceId, ...params },
  });
  return response.data.data;
};

export interface CommunityAnnouncement {
  id: string;
  community_id: string;
  author_id: string;
  title: string;
  content: string;
  is_pinned: boolean;
  status: string;
  created_at: string;
  updated_at?: string | null;
  author_username: string;
  author_full_name: string;
  author_avatar?: string | null;
}

export const createCommunityAnnouncement = async (
  communityId: string,
  data: { title: string; content: string; is_pinned?: boolean }
): Promise<CommunityAnnouncement> => {
  const response = await apiClient.post<ApiResponse<CommunityAnnouncement>>(
    `/communities/${communityId}/announcements`,
    data
  );
  return response.data.data;
};

export const getCommunityAnnouncements = async (
  communityId: string,
  params?: PaginationParams
): Promise<CommunityAnnouncement[]> => {
  const response = await apiClient.get<ApiResponse<CommunityAnnouncement[]>>(
    `/communities/${communityId}/announcements`,
    { params }
  );
  return response.data.data;
};

export const updateCommunityAnnouncement = async (
  announcementId: string,
  data: { title: string; content: string; is_pinned?: boolean }
): Promise<CommunityAnnouncement> => {
  const response = await apiClient.put<ApiResponse<CommunityAnnouncement>>(
    `/community-announcements/${announcementId}`,
    data
  );
  return response.data.data;
};

export const deleteCommunityAnnouncement = async (announcementId: string): Promise<void> => {
  await apiClient.delete(`/community-announcements/${announcementId}`);
};

export const pinCommunityAnnouncement = async (
  announcementId: string,
  pinned: boolean
): Promise<void> => {
  await apiClient.put(`/community-announcements/${announcementId}/pin`, { pinned });
};

export const addCommunityAdmin = async (
  communityId: string,
  userId: string
): Promise<void> => {
  await apiClient.post(`/communities/${communityId}/admins`, { user_id: userId });
};

export const removeCommunityAdmin = async (
  communityId: string,
  userId: string
): Promise<void> => {
  await apiClient.delete(`/communities/${communityId}/admins/${userId}`);
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
  getRecommendedCommunities,
  getTrendingCommunities,
  createCommunityAnnouncement,
  getCommunityAnnouncements,
  updateCommunityAnnouncement,
  deleteCommunityAnnouncement,
  pinCommunityAnnouncement,
  addCommunityAdmin,
  removeCommunityAdmin,
};

export default communitiesApi;
