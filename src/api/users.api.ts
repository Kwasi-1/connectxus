
import apiClient from "@/lib/apiClient";

interface ApiResponse<T> {
  data: T;
}

export interface PaginationParams {
  page?: number;   limit?: number; }

export interface UserProfile {
  id: string;
  space_id: string;
  space_name?: string | null;
  username: string;
  email: string;
  full_name: string;
  avatar?: string | null;
  bio?: string | null;
  verified?: boolean | null;
  roles?: string[];
  level?: string | null;
  department_id?: string | null;
  department_name?: string | null;
  department?: string | null;
  major?: string | null;
  year?: number | null;
  interests?: string[];
  followers_count?: number | null;
  following_count?: number | null;
  is_following?: boolean | null; 
  created_at?: string | null;
  updated_at?: string | null;
  auth_provider?: string; 
}

export interface UpdateUserRequest {
  full_name?: string;
  avatar?: string | null;
  bio?: string | null;
  level?: string | null;
  department_id?: string | null;
  interests?: string[];
}

export interface UpdatePasswordRequest {
  old_password?: string; 
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
  const response = await apiClient.get<ApiResponse<UserProfile>>(
    `/users/username/${username}`
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
  const response = await apiClient.get<ApiResponse<UserProfile[]>>(
    "/users/search",
    {
      params,
    }
  );
  return response.data.data;
};

export const getSuggestedUsers = async (
  params?: PaginationParams
): Promise<UserProfile[]> => {
  const response = await apiClient.get<ApiResponse<UserProfile[]>>(
    "/users/suggested",
    {
      params,
    }
  );
  return response.data.data;
};

export const followUser = async (userId: string): Promise<void> => {
  await apiClient.post(`/users/${userId}/follow`);
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

export const getAllPeopleInSpace = async (
  params?: PaginationParams
): Promise<UserProfile[]> => {
  const response = await apiClient.get<ApiResponse<UserProfile[]>>(
    "/users/people/all",
    { params }
  );
  return response.data.data;
};

export const getPeopleInDepartment = async (
  params?: PaginationParams
): Promise<UserProfile[]> => {
  const response = await apiClient.get<ApiResponse<UserProfile[]>>(
    "/users/people/department",
    { params }
  );
  return response.data.data;
};

export const getPeopleYouMayKnow = async (
  params?: PaginationParams
): Promise<UserProfile[]> => {
  const response = await apiClient.get<ApiResponse<UserProfile[]>>(
    "/users/people/may-know",
    { params }
  );
  return response.data.data;
};

export const followUserByUsername = async (username: string): Promise<void> => {
  await apiClient.post(`/users/username/${username}/follow`);
};

export const unfollowUserByUsername = async (username: string): Promise<void> => {
  await apiClient.delete(`/users/username/${username}/follow`);
};

export const checkFollowingStatusByUsername = async (username: string): Promise<boolean> => {
  const response = await apiClient.get<ApiResponse<{ is_following: boolean }>>(
    `/users/username/${username}/following/status`
  );
  return response.data.data.is_following;
};

export const getUserFollowersByUsername = async (
  username: string,
  params?: PaginationParams
): Promise<UserProfile[]> => {
  const response = await apiClient.get<ApiResponse<UserProfile[]>>(
    `/users/username/${username}/followers`,
    { params }
  );
  return response.data.data;
};

export const getUserFollowingByUsername = async (
  username: string,
  params?: PaginationParams
): Promise<UserProfile[]> => {
  const response = await apiClient.get<ApiResponse<UserProfile[]>>(
    `/users/username/${username}/following`,
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
  getAllPeopleInSpace,
  getPeopleInDepartment,
  getPeopleYouMayKnow,
  followUserByUsername,
  unfollowUserByUsername,
  checkFollowingStatusByUsername,
  getUserFollowersByUsername,
  getUserFollowingByUsername,
};

export default usersApi;
