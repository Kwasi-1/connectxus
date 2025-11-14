
import apiClient, { getDefaultSpaceId } from "@/lib/apiClient";

interface ApiResponse<T> {
  data: T;
}

export interface PaginationParams {
  page?: number;   limit?: number; }

export interface UserProfile {
  id: string;
  space_id: string;
  username: string;
  email: string;
  full_name: string;   avatar?: string | null;   bio?: string | null;
  verified?: boolean | null;
  roles?: string[];
  level?: string | null;
  department?: string | null;
  major?: string | null;
  year?: number | null;
  interests?: string[];
  followers_count?: number | null;
  following_count?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface UpdateUserRequest {
  full_name?: string;   avatar?: string | null;   bio?: string | null;
  level?: string | null;
  department?: string | null;
  major?: string | null;
  year?: number | null;
  interests?: string[];
}

export interface UpdatePasswordRequest {
  old_password: string;
  new_password: string;
}

export interface SearchUsersParams extends PaginationParams {
  q: string;
  space_id?: string; }

export const getUserById = async (userId: string): Promise<UserProfile> => {
  const response = await apiClient.get<ApiResponse<UserProfile>>(
    `/users/${userId}`
  );
  return response.data.data;
};

export const getUserByUsername = async (
  username: string
): Promise<UserProfile> => {
  const spaceId = getDefaultSpaceId();

  const response = await apiClient.get<ApiResponse<UserProfile>>(
    `/users/username/${username}`,
    {
      params: { space_id: spaceId },
    }
  );
  return response.data.data;
};

export const updateUser = async (
  userId: string,
  data: UpdateUserRequest
): Promise<UserProfile> => {
  const response = await apiClient.put<ApiResponse<UserProfile>>(
    `/users/${userId}`,
    data
  );
  return response.data.data;
};

export const updatePassword = async (
  userId: string,
  data: UpdatePasswordRequest
): Promise<void> => {
  await apiClient.put(`/users/${userId}/password`, data);
};

export const deleteUser = async (userId: string): Promise<void> => {
  await apiClient.delete(`/users/${userId}`);
};

export const searchUsers = async (
  params: Omit<SearchUsersParams, "space_id">
): Promise<UserProfile[]> => {
  const spaceId = getDefaultSpaceId();

  const response = await apiClient.get<ApiResponse<UserProfile[]>>(
    "/users/search",
    {
      params: { ...params, space_id: spaceId },
    }
  );
  return response.data.data;
};

export const getSuggestedUsers = async (
  params?: PaginationParams
): Promise<UserProfile[]> => {
  const spaceId = getDefaultSpaceId();

  const response = await apiClient.get<ApiResponse<UserProfile[]>>(
    "/users/suggested",
    {
      params: { space_id: spaceId, ...params },
    }
  );
  return response.data.data;
};

export const followUser = async (userId: string): Promise<void> => {
  const spaceId = getDefaultSpaceId();

  await apiClient.post(
    `/users/${userId}/follow`,
    {},
    {
      params: { space_id: spaceId },
    }
  );
};

export const unfollowUser = async (userId: string): Promise<void> => {
  await apiClient.delete(`/users/${userId}/follow`);
};

export const checkFollowingStatus = async (userId: string): Promise<boolean> => {
  const response = await apiClient.get<ApiResponse<{ is_following: boolean }>>(
    `/users/${userId}/following/status`
  );
  return response.data.data.is_following;
};

export const getUserFollowers = async (
  userId: string,
  params?: PaginationParams
): Promise<UserProfile[]> => {
  const response = await apiClient.get<ApiResponse<UserProfile[]>>(
    `/users/${userId}/followers`,
    { params }
  );
  return response.data.data;
};

export const getUserFollowing = async (
  userId: string,
  params?: PaginationParams
): Promise<UserProfile[]> => {
  const response = await apiClient.get<ApiResponse<UserProfile[]>>(
    `/users/${userId}/following`,
    { params }
  );
  return response.data.data;
};

export const usersApi = {
  getUserById,
  getUserByUsername,
  updateUser,
  updatePassword,
  deleteUser,
  searchUsers,
  getSuggestedUsers,
  followUser,
  unfollowUser,
  checkFollowingStatus,
  getUserFollowers,
  getUserFollowing,
};

export default usersApi;
